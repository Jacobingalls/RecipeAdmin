import { render, screen, fireEvent, act } from '@testing-library/react';

import type { AdminCreateUserResponse } from '../../api';
import * as api from '../../api';

import CreateUserModal from './CreateUserModal';

vi.mock('../../api', () => ({
  adminCreateUser: vi.fn(),
}));

vi.mock('../common', async () => {
  const actual = await vi.importActual('../common');
  return {
    ...actual,
    CopyButton: ({ text }: { text: string }) => (
      <button data-testid="copy-button" data-text={text}>
        Copy
      </button>
    ),
  };
});

const mockCreateUser = vi.mocked(api.adminCreateUser);

const onClose = vi.fn();
const onUserCreated = vi.fn();

const sampleResponse: AdminCreateUserResponse = {
  user: {
    id: 'u1',
    username: 'jdoe',
    displayName: 'John Doe',
    email: 'jdoe@example.com',
    isAdmin: false,
    createdAt: 1700000000,
    lastLoginAt: null,
    passkeyCount: 0,
    apiKeyCount: 1,
  },
  temporaryAPIKey: 'tmp_key_abc123',
};

function renderModal(isOpen = true) {
  return render(
    <CreateUserModal isOpen={isOpen} onClose={onClose} onUserCreated={onUserCreated} />,
  );
}

describe('CreateUserModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when isOpen is false', () => {
    const { container } = renderModal(false);
    expect(container.innerHTML).toBe('');
  });

  it('renders modal with Add User title', () => {
    renderModal();
    expect(screen.getByText('Add User')).toBeInTheDocument();
  });

  it('renders Username, Display Name, Email inputs and Administrator checkbox', () => {
    renderModal();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Administrator')).toBeInTheDocument();
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

  it('does not call onUserCreated when Cancel is clicked without creating', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onUserCreated).not.toHaveBeenCalled();
  });

  it('calls onClose when header close button is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls adminCreateUser with form values on submit', async () => {
    mockCreateUser.mockResolvedValue(sampleResponse);
    renderModal();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'jdoe' } });
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jdoe@example.com' } });
    fireEvent.click(screen.getByLabelText('Administrator'));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(mockCreateUser).toHaveBeenCalledWith('jdoe', 'John Doe', 'jdoe@example.com', true);
  });

  it('shows the created result view with temp API key after success', async () => {
    mockCreateUser.mockResolvedValue(sampleResponse);
    renderModal();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'jdoe' } });
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jdoe@example.com' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(screen.getByText('User created')).toBeInTheDocument();
    expect(screen.getByText('tmp_key_abc123')).toBeInTheDocument();
    expect(screen.getByText('jdoe', { exact: false })).toBeInTheDocument();
  });

  it('shows CopyButton with the temporary API key', async () => {
    mockCreateUser.mockResolvedValue(sampleResponse);
    renderModal();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'jdoe' } });
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jdoe@example.com' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(screen.getByTestId('copy-button')).toHaveAttribute('data-text', 'tmp_key_abc123');
  });

  it('shows Done button after user is created', async () => {
    mockCreateUser.mockResolvedValue(sampleResponse);
    renderModal();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'jdoe' } });
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jdoe@example.com' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('calls onUserCreated and onClose when Done is clicked after creation', async () => {
    mockCreateUser.mockResolvedValue(sampleResponse);
    renderModal();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'jdoe' } });
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jdoe@example.com' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onUserCreated).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows error message when creation fails', async () => {
    mockCreateUser.mockRejectedValue(new Error('Server error'));
    renderModal();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'jdoe' } });
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jdoe@example.com' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't create the user. Try again.");
  });

  it('stays on form view when creation fails', async () => {
    mockCreateUser.mockRejectedValue(new Error('Server error'));
    renderModal();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'jdoe' } });
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jdoe@example.com' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('resets form when closed and reopened', async () => {
    mockCreateUser.mockResolvedValue(sampleResponse);
    const { rerender } = render(
      <CreateUserModal isOpen onClose={onClose} onUserCreated={onUserCreated} />,
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'jdoe' } });
    fireEvent.click(screen.getByLabelText('Administrator'));

    // Close via Cancel triggers handleClose
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    rerender(<CreateUserModal isOpen onClose={onClose} onUserCreated={onUserCreated} />);

    expect((screen.getByLabelText('Username') as HTMLInputElement).value).toBe('');
    expect(screen.getByLabelText('Administrator')).not.toBeChecked();
  });

  it('has correct aria-labelledby on the modal', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-labelledby',
      'create-user-modal-title',
    );
  });

  it('Administrator checkbox is unchecked by default', () => {
    renderModal();
    expect(screen.getByLabelText('Administrator')).not.toBeChecked();
  });
});
