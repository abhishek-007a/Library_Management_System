import React, { useState } from 'react';
import { X, ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authService, AdminUser } from '../services/authService';
import { soundService } from '../services/soundService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = authService.login(username, password);
    if (res.success && res.user) {
      soundService.playSuccess();
      onLoginSuccess(res.user);
      onClose();
    } else {
      soundService.playError();
      setError(res.error || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="p-2 sm:p-2.5 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30 shadow-inner flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Admin & Librarian Portal</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">Sign in to add, edit, or manage library books</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-brand-500/25"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Access</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
