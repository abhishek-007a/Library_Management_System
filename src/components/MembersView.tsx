import React, { useState } from 'react';
import { Users, Plus, Search, Trash2, Mail, Phone, IdCard, CheckCircle2, X } from 'lucide-react';
import { Borrower } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';

interface MembersViewProps {
  borrowers: Borrower[];
  onAddBorrower: (borrower: Omit<Borrower, 'id' | 'created_at'>) => Promise<void>;
  onDeleteBorrower: (id: string) => Promise<void>;
}

export const MembersView: React.FC<MembersViewProps> = ({
  borrowers,
  onAddBorrower,
  onDeleteBorrower
}) => {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    membership_id: `LIB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    membership_type: 'student' as Borrower['membership_type']
  });

  const filteredMembers = borrowers.filter(m => {
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.membership_id.toLowerCase().includes(q);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;

    await onAddBorrower({
      ...newMember,
      active_loans_count: 0
    });

    setIsAddModalOpen(false);
    setNewMember({
      name: '',
      email: '',
      phone: '',
      membership_id: `LIB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      membership_type: 'student'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search members by name, ID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-sm"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Library Member</span>
        </button>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {member.membership_type}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-2">{member.name}</h3>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Remove member "${member.name}"?`)) {
                      onDeleteBorrower(member.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{member.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <IdCard className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono font-bold text-slate-800">{member.membership_id}</span>
                </div>
              </div>
            </div>

            {/* Member Card Barcode */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="scale-75 origin-left">
                <BarcodeRenderer value={member.membership_id} height={24} width={1.0} fontSize={8} />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {member.active_loans_count ? `${member.active_loans_count} books checked out` : 'No active loans'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Library Member</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1-555-0100"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Membership ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMember.membership_id}
                    onChange={(e) => setNewMember({ ...newMember, membership_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newMember.membership_type}
                    onChange={(e) => setNewMember({ ...newMember, membership_type: e.target.value as Borrower['membership_type'] })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="public">Public</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
