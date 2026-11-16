import React, { useState } from 'react';
import { X, KeyRound, Check, AlertCircle, Shield } from 'lucide-react';
import { authService, AdminUser } from '../services/authService';
import { soundService } from '../services/soundService';

interface AdminChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AdminUser | null;
  onCredentialsUpdated: () => void;
}

export const AdminChangePasswordModal: React.FC<AdminChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCredentialsUpdated
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState(currentUser?.username || 'admin');
  const [newName, setNewName] = useState(currentUser?.name || 'Head Librarian');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }

    const res = authService.updateCredentials(currentPassword, newUsername, newPassword, newName);
    if (res.success) {
      soundService.playSuccess();
      setSuccess(true);
      onCredentialsUpdated();
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      soundService.playError();
      setError(res.error || 'Failed to update credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl flex-shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Admin Account Settings</h3>
              <p className="text-[11px] text-slate-400">Update username, display name, or password</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center space-x-2 font-bold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Admin credentials updated successfully!</span>
            </div>
          )}

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              placeholder="Enter existing password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Admin Username *
              </label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Librarian Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              New Password *
            </label>
            <input
              type="password"
              required
              placeholder="Min 4 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-sm"
            >
              Save Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
