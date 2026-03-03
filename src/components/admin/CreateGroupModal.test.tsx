import { render, screen, fireEvent, act } from '@testing-library/react';

import type { IndirectGroup } from '../../api';
import * as api from '../../api';

import CreateGroupModal from './CreateGroupModal';

vi.mock('../../api', () => ({
  adminUpsertGroups: vi.fn(),
}));

const mockUpsert = vi.mocked(api.adminUpsertGroups);

const onClose = vi.fn();
const onGroupCreated = vi.fn();

const sampleCreated: IndirectGroup = {
  id: 'grp-1',
  name: 'Breakfast Bowl',
  brand: 'Homemade',
  items: [],
};

function renderModal(isOpen = true) {
  return render(
    <CreateGroupModal isOpen={isOpen} onClose={onClose} onGroupCreated={onGroupCreated} />,
  );
}

describe('CreateGroupModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when isOpen is false', () => {
    const { container } = renderModal(false);
    expect(container.innerHTML).toBe('');
  });

  it('renders modal with Add group title', () => {
    renderModal();
    expect(screen.getByText('Add group')).toBeInTheDocument();
  });

  it('renders Name and Brand inputs', () => {
    renderModal();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Brand')).toBeInTheDocument();
  });

  it('renders Add and Cancel buttons', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when header close button is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls adminUpsertGroups with form values on submit', async () => {
    mockUpsert.mockResolvedValue([sampleCreated]);
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Breakfast Bowl' } });
    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Homemade' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Breakfast Bowl',
        brand: 'Homemade',
      }),
    );
  });

  it('trims whitespace from name and brand', async () => {
    mockUpsert.mockResolvedValue([sampleCreated]);
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: '  Breakfast Bowl  ' },
    });
    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: '  Homemade  ' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Breakfast Bowl',
        brand: 'Homemade',
      }),
    );
  });

  it('calls onGroupCreated with the returned ID on success', async () => {
    mockUpsert.mockResolvedValue([sampleCreated]);
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Breakfast Bowl' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(onGroupCreated).toHaveBeenCalledWith('grp-1');
  });

  it('calls onClose after successful creation', async () => {
    mockUpsert.mockResolvedValue([sampleCreated]);
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Breakfast Bowl' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows error message when creation fails', async () => {
    mockUpsert.mockRejectedValue(new Error('Server error'));
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Breakfast Bowl' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't create the group. Try again.");
  });

  it('does not call onGroupCreated when creation fails', async () => {
    mockUpsert.mockRejectedValue(new Error('Server error'));
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Breakfast Bowl' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(onGroupCreated).not.toHaveBeenCalled();
  });

  it('resets form when closed and reopened', () => {
    const { rerender } = render(
      <CreateGroupModal isOpen onClose={onClose} onGroupCreated={onGroupCreated} />,
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Breakfast Bowl' } });
    fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Homemade' } });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    rerender(<CreateGroupModal isOpen onClose={onClose} onGroupCreated={onGroupCreated} />);

    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Brand') as HTMLInputElement).value).toBe('');
  });

  it('sends empty items array in the payload', async () => {
    mockUpsert.mockResolvedValue([sampleCreated]);
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    const payload = mockUpsert.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.items).toEqual([]);
  });

  it('does not include an id in the payload', async () => {
    mockUpsert.mockResolvedValue([sampleCreated]);
    renderModal();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    const payload = mockUpsert.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('id');
  });
});
