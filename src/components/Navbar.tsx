import React from 'react';
import { BookOpen, Camera, Plus, Users, Bookmark, Layers, Cloud, HardDrive, Printer, ShieldCheck, Lock, LogOut, Settings } from 'lucide-react';
import { AdminUser } from '../services/authService';

interface NavbarProps {
  activeTab: 'catalog' | 'circulation' | 'members';
  setActiveTab: (tab: 'catalog' | 'circulation' | 'members') => void;
  onOpenScanner: () => void;
  onOpenAddModal: () => void;
  onOpenSettings: () => void;
  onOpenPrinter: () => void;
  isSupabaseConnected: boolean;
  bookCount: number;
  isAdmin: boolean;
  adminUser: AdminUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenAdminSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenScanner,
  onOpenAddModal,
  onOpenSettings,
  onOpenPrinter,
  isSupabaseConnected,
  bookCount,
  isAdmin,
  adminUser,
  onOpenLogin,
  onLogout,
  onOpenAdminSettings
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 flex-shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Libro<span className="text-brand-600">Scan</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                  {isAdmin ? 'Admin' : 'Catalog'}
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 -mt-0.5 font-medium">
                {isAdmin ? `Librarian: ${adminUser?.name || 'Administrator'}` : 'Public Book Availability & Search'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'catalog'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Available Books ({bookCount})</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('circulation')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === 'circulation'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Circulation & Loans</span>
                </button>

                <button
                  onClick={() => setActiveTab('members')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === 'members'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Members</span>
                </button>
              </>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {isAdmin ? (
              <>
                {/* Supabase status badge */}
                <button
                  onClick={onOpenSettings}
                  title="Configure Supabase Database"
                  className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    isSupabaseConnected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  {isSupabaseConnected ? (
                    <>
                      <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Supabase Live</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                      <span>Local Demo</span>
                    </>
                  )}
                </button>

                {/* Print Barcodes Button */}
                <button
                  onClick={onOpenPrinter}
                  title="Print Barcode Labels"
                  className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                >
                  <Printer className="w-4 h-4" />
                </button>

                {/* Manual Add Button (Desktop) */}
                <button
                  onClick={onOpenAddModal}
                  className="hidden lg:flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition shadow-xs"
                >
                  <Plus className="w-4 h-4 text-slate-500" />
                  <span>Manual Entry</span>
                </button>

                {/* Primary Action: Barcode Scanner */}
                <button
                  onClick={onOpenScanner}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-brand-500/25 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden xs:inline">Scan Barcode</span>
                </button>

                {/* Admin Menu / Sign Out */}
                <div className="flex items-center space-x-1 pl-1 border-l border-slate-200">
                  <button
                    onClick={onOpenAdminSettings}
                    title="Admin Account Settings (Change Username/Password)"
                    className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onLogout}
                    title="Sign Out of Admin Mode"
                    className="flex items-center space-x-1 p-1.5 sm:px-3 sm:py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              /* Public Visitor Actions - ONLY ONE LOGIN BUTTON IN APP */
              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-md active:scale-95"
              >
                <Lock className="w-3.5 h-3.5 text-brand-400" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        {isAdmin && (
          <div className="flex md:hidden items-center justify-around p-1.5 border-t border-slate-100 bg-slate-50/80 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'catalog'
                  ? 'bg-white text-brand-600 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Books ({bookCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('circulation')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'circulation'
                  ? 'bg-white text-brand-600 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Circulation</span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'members'
                  ? 'bg-white text-brand-600 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Members</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
