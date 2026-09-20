'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Modal from '@/components/Modal';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'update' | 'toggle' | 'reset' | 'delete'
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalError, setModalError] = useState('');

  const [updateForm, setUpdateForm] = useState({ name: '', phoneNumber: '', role: 'learner' });
  const [resetPassword, setResetPassword] = useState('');

  const loadUsers = () => {
    setLoading(true);
    api
      .get('/admin/users')
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    loadUsers();
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setSelectedUser(null);
    setModalError('');
    setResetPassword('');
  };

  const openUpdateModal = (u) => {
    setSelectedUser(u);
    setUpdateForm({ name: u.name || '', phoneNumber: u.phoneNumber || '', role: u.role || 'learner' });
    setModalError('');
    setModalType('update');
    setModalOpen(true);
  };

  const openToggleModal = (u) => {
    setSelectedUser(u);
    setModalError('');
    setModalType('toggle');
    setModalOpen(true);
  };

  const openResetModal = (u) => {
    setSelectedUser(u);
    setResetPassword('');
    setModalError('');
    setModalType('reset');
    setModalOpen(true);
  };

  const openDeleteModal = (u) => {
    setSelectedUser(u);
    setModalError('');
    setModalType('delete');
    setModalOpen(true);
  };

  const submitModal = async () => {
    if (!selectedUser) return;
    try {
      setActionLoadingId(selectedUser._id);
      setModalError('');

      if (modalType === 'update') {
        const { name, phoneNumber, role } = updateForm;
        if (!name || !role) {
          setModalError('Name and role are required.');
          return;
        }
        await api.put(`/admin/users/${selectedUser._id}`, { name, phoneNumber, role });
      } else if (modalType === 'toggle') {
        await api.put(`/admin/users/${selectedUser._id}`, { isActive: !selectedUser.isActive });
      } else if (modalType === 'reset') {
        if (!resetPassword || resetPassword.length < 6) {
          setModalError('Password must be at least 6 characters.');
          return;
        }
        await api.put(`/admin/users/${selectedUser._id}/reset-password`, { password: resetPassword });
      } else if (modalType === 'delete') {
        await api.delete(`/admin/users/${selectedUser._id}`);
      }

      closeModal();
      loadUsers();
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Users</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Everyone registered on SkillSprint.</p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-surface)] text-xs uppercase text-[var(--color-ink-soft)]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-ink-soft)]">
                  Loading…
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-t border-[var(--color-border)] bg-[var(--color-paper)]">
                  <td className="px-4 py-3 font-medium text-[var(--color-ink)]">{u.name}</td>
                  <td className="px-4 py-3 text-[var(--color-ink-soft)]">{u.email}</td>
                  <td className="px-4 py-3 text-[var(--color-ink-soft)]">{u.phoneNumber || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        background: u.role === 'admin' ? 'var(--color-signal-soft)' : 'var(--color-mint-soft)',
                        color: u.role === 'admin' ? 'var(--color-signal)' : 'var(--color-mint)',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        background: u.isActive ? 'var(--color-mint-soft)' : 'var(--color-danger-soft)',
                        color: u.isActive ? 'var(--color-mint)' : 'var(--color-danger)',
                      }}
                    >
                      {u.isActive ? 'active' : 'deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-ink-soft)]">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={actionLoadingId === u._id}
                        onClick={() => openUpdateModal(u)}
                        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs font-medium text-[var(--color-ink-soft)] hover:border-[var(--color-signal)]"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId === u._id}
                        onClick={() => openToggleModal(u)}
                        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs font-medium text-[var(--color-ink-soft)] hover:border-[var(--color-signal)]"
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId === u._id}
                        onClick={() => openResetModal(u)}
                        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs font-medium text-[var(--color-ink-soft)] hover:border-[var(--color-signal)]"
                      >
                        Reset PW
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId === u._id}
                        onClick={() => openDeleteModal(u)}
                        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs font-medium text-[var(--color-danger)] hover:border-[var(--color-danger)]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        maxWidth="max-w-lg"
        title={
          modalType === 'update'
            ? 'Update user'
            : modalType === 'toggle'
              ? selectedUser?.isActive
                ? 'Deactivate user'
                : 'Activate user'
              : modalType === 'reset'
                ? 'Reset password'
                : modalType === 'delete'
                  ? 'Delete user'
                  : 'Action'
        }
      >
        {modalError && (
          <p className="mb-4 rounded-xl bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">{modalError}</p>
        )}

        {modalType === 'update' && selectedUser && (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
              Name
              <input
                value={updateForm.name}
                onChange={(e) => setUpdateForm((s) => ({ ...s, name: e.target.value }))}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
              Phone
              <input
                value={updateForm.phoneNumber}
                onChange={(e) => setUpdateForm((s) => ({ ...s, phoneNumber: e.target.value }))}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
              Role
              <select
                value={updateForm.role}
                onChange={(e) => setUpdateForm((s) => ({ ...s, role: e.target.value }))}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
              >
                <option value="learner">learner</option>
                <option value="admin">admin</option>
              </select>
            </label>
          </div>
        )}

        {modalType === 'toggle' && selectedUser && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[var(--color-ink-soft)]">
              {selectedUser.isActive ? 'Deactivate' : 'Activate'} <span className="font-semibold text-[var(--color-ink)]">{selectedUser.name}</span> ?
            </p>
            <p className="text-xs text-[var(--color-ink-soft)]">This controls whether they can log in.</p>
          </div>
        )}

        {modalType === 'reset' && selectedUser && (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--color-ink)]">
              New password
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-signal)]"
              />
            </label>
            <p className="text-xs text-[var(--color-ink-soft)]">Admin sets the password. Share it with the user after reset.</p>
          </div>
        )}

        {modalType === 'delete' && selectedUser && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[var(--color-ink-soft)]">
              Delete <span className="font-semibold text-[var(--color-ink)]">{selectedUser.name}</span>?
            </p>
            <p className="text-xs text-[var(--color-ink-soft)]">This also removes their enrollments and lesson comments.</p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={closeModal} className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:border-[var(--color-signal)]">
            Cancel
          </button>
          <button
            type="button"
            onClick={submitModal}
            disabled={actionLoadingId === selectedUser?._id}
            className="rounded-full bg-[var(--color-signal)] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            {actionLoadingId === selectedUser?._id ? 'Saving…' : modalType === 'delete' ? 'Delete' : modalType === 'toggle' ? 'Confirm' : 'Save'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
