import { render, screen, fireEvent, act } from '@testing-library/react';

import * as api from '../../api';

import AdminUserProfileForm from './AdminUserProfileForm';

vi.mock('../../api', () => ({
  adminUpdateUser: vi.fn(),
}));

const mockUpdateUser = vi.mocked(api.adminUpdateUser);

const defaultInitialUser = {
  username: 'alice',
  displayName: 'Alice',
  email: 'alice@example.com',
  isAdmin: true,
};

const onSaved = vi.fn();

function renderForm(initialUser = defaultInitialUser) {
  return render(<AdminUserProfileForm userId="u1" initialUser={initialUser} onSaved={onSaved} />);
}

describe('AdminUserProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section header with title', () => {
    renderForm();
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
  });

  it('renders Save button', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders form fields with initial values', () => {
    renderForm();
    expect(screen.getByLabelText('Username')).toHaveValue('alice');
    expect(screen.getByLabelText('Display Name')).toHaveValue('Alice');
    expect(screen.getByLabelText('Email')).toHaveValue('alice@example.com');
    expect(screen.getByLabelText('Administrator')).toBeChecked();
  });

  it('renders admin toggle unchecked when isAdmin is false', () => {
    renderForm({ ...defaultInitialUser, isAdmin: false });
    expect(screen.getByLabelText('Administrator')).not.toBeChecked();
  });

  it('allows editing username', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'bob' } });
    expect(screen.getByLabelText('Username')).toHaveValue('bob');
  });

  it('allows editing display name', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Bob' } });
    expect(screen.getByLabelText('Display Name')).toHaveValue('Bob');
  });

  it('allows editing email', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bob@test.com' } });
    expect(screen.getByLabelText('Email')).toHaveValue('bob@test.com');
  });

  it('allows toggling admin switch', () => {
    renderForm();
    const toggle = screen.getByLabelText('Administrator');
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it('submits updated values and calls onSaved', async () => {
    mockUpdateUser.mockResolvedValue(undefined);
    renderForm();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'bob' } });
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bob@test.com' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });

    expect(mockUpdateUser).toHaveBeenCalledWith('u1', {
      username: 'bob',
      displayName: 'Bob',
      email: 'bob@test.com',
      isAdmin: true,
    });
    expect(onSaved).toHaveBeenCalled();
  });

  it('displays error message when update fails with Error', async () => {
    mockUpdateUser.mockRejectedValue(new Error('Username taken'));
    renderForm();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Username taken');
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('displays fallback error message when update fails with non-Error', async () => {
    mockUpdateUser.mockRejectedValue('unknown');
    renderForm();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't update this user. Try again.");
  });

  it('clears error on next successful submit', async () => {
    mockUpdateUser.mockRejectedValueOnce(new Error('Failed'));
    renderForm();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    mockUpdateUser.mockResolvedValueOnce(undefined);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('updates form fields when initialUser prop changes', () => {
    const { rerender } = render(
      <AdminUserProfileForm userId="u1" initialUser={defaultInitialUser} onSaved={onSaved} />,
    );

    expect(screen.getByLabelText('Username')).toHaveValue('alice');

    rerender(
      <AdminUserProfileForm
        userId="u1"
        initialUser={{ ...defaultInitialUser, username: 'charlie' }}
        onSaved={onSaved}
      />,
    );

    expect(screen.getByLabelText('Username')).toHaveValue('charlie');
  });

  it('connects Save button to form via form attribute', () => {
    renderForm();
    const saveBtn = screen.getByRole('button', { name: 'Save' });
    expect(saveBtn).toHaveAttribute('form', 'edit-user-form');
    expect(saveBtn).toHaveAttribute('type', 'submit');
  });
});
