import React, { useState } from 'react';
import { X, Bookmark, RotateCcw, Search, Calendar, UserCheck, AlertTriangle, CheckCircle2, Clock, Camera } from 'lucide-react';
import { Book, Borrower, Loan } from '../types';
import { soundService } from '../services/soundService';

interface IssueReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  borrowers: Borrower[];
  loans: Loan[];
  preselectedBook?: Book | null;
  onIssueBook: (bookId: string, borrowerId: string, days: number, notes?: string) => Promise<void>;
  onReturnBook: (loanId: string) => Promise<void>;
  onOpenBarcodeScanner: () => void;
}

export const IssueReturnModal: React.FC<IssueReturnModalProps> = ({
  isOpen,
  onClose,
  books,
  borrowers,
  loans,
  preselectedBook,
  onIssueBook,
  onReturnBook,
  onOpenBarcodeScanner
}) => {
  const [activeTab, setActiveTab] = useState<'issue' | 'return'>('issue');

  // Issue tab state
  const [selectedBookId, setSelectedBookId] = useState<string>(preselectedBook?.id || '');
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>('');
  const [loanDays, setLoanDays] = useState<number>(14);
  const [loanNotes, setLoanNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return tab filter
  const [returnSearch, setReturnSearch] = useState('');

  if (!isOpen) return null;

  const availableBooks = books.filter(b => b.available_copies > 0);
  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'overdue');

  const filteredReturnLoans = activeLoans.filter(loan => {
    const query = returnSearch.toLowerCase().trim();
    if (!query) return true;
    const bookTitle = loan.book?.title?.toLowerCase() || '';
    const bookIsbn = loan.book?.isbn?.toLowerCase() || '';
    const borrowerName = loan.borrower?.name?.toLowerCase() || '';
    const memberId = loan.borrower?.membership_id?.toLowerCase() || '';
    return bookTitle.includes(query) || bookIsbn.includes(query) || borrowerName.includes(query) || memberId.includes(query);
  });

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !selectedBorrowerId) {
      alert('Please select both a book and a library member.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onIssueBook(selectedBookId, selectedBorrowerId, loanDays, loanNotes);
      soundService.playSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      soundService.playError();
      alert('Failed to issue book.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnAction = async (loanId: string) => {
    try {
      await onReturnBook(loanId);
      soundService.playSuccess();
    } catch (err) {
      console.error(err);
      soundService.playError();
      alert('Failed to return book.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
              <Bookmark className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Circulation Desk</h2>
              <p className="text-xs text-slate-400">Issue books to members or check in returned books</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 space-x-2">
          <button
            onClick={() => setActiveTab('issue')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'issue'
                ? 'bg-white text-brand-600 border-brand-500 shadow-sm'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Issue / Checkout</span>
          </button>

          <button
            onClick={() => setActiveTab('return')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'return'
                ? 'bg-white text-brand-600 border-brand-500 shadow-sm'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Return / Check-in ({activeLoans.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'issue' ? (
            <form onSubmit={handleIssueSubmit} className="space-y-5">
              {/* Select Book */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    1. Select Book to Issue *
                  </label>
                  <button
                    type="button"
                    onClick={onOpenBarcodeScanner}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan Barcode</span>
                  </button>
                </div>

                <select
                  required
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="">-- Choose an available book --</option>
                  {availableBooks.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} (ISBN: {b.isbn}) - {b.available_copies} available [{b.location_shelf}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Borrower */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  2. Select Library Member / Borrower *
                </label>
                <select
                  required
                  value={selectedBorrowerId}
                  onChange={(e) => setSelectedBorrowerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="">-- Choose member --</option>
                  {borrowers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.membership_id}) - {m.membership_type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Loan Period */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  3. Loan Period (Days)
                </label>
                <div className="flex gap-2">
                  {[7, 14, 21, 30].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setLoanDays(days)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        loanDays === days
                          ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Due date will be: <strong>{new Date(Date.now() + loanDays * 86400000).toLocaleDateString()}</strong>
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scanned at front counter, special study loan"
                  value={loanNotes}
                  onChange={(e) => setLoanNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedBookId || !selectedBorrowerId}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition flex items-center space-x-1.5 shadow-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Confirm Checkout</span>
                </button>
              </div>
            </form>
          ) : (
            /* Return Tab */
            <div className="space-y-4">
              {/* Return Search & Barcode Scan */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by book title, ISBN, or member name..."
                    value={returnSearch}
                    onChange={(e) => setReturnSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={onOpenBarcodeScanner}
                  className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                  title="Scan book barcode to find loan"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan Return</span>
                </button>
              </div>

              {/* Loans List */}
              {filteredReturnLoans.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
                  <p className="font-bold text-slate-700 text-sm">No Active Loans Pending Return</p>
                  <p className="text-xs text-slate-500 mt-1">All library books are safely on their shelves!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredReturnLoans.map(loan => {
                    const isOverdue = loan.status === 'overdue';
                    return (
                      <div
                        key={loan.id}
                        className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                          isOverdue
                            ? 'bg-rose-50/50 border-rose-200'
                            : 'bg-white border-slate-200 hover:border-brand-300'
                        }`}
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-sm truncate">
                              {loan.book?.title || 'Unknown Book'}
                            </span>
                            {isOverdue && (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black uppercase rounded tracking-wider flex items-center space-x-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>Overdue</span>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                            <span>Borrower: <strong className="text-slate-700">{loan.borrower?.name}</strong></span>
                            <span>ISBN: <strong className="font-mono text-slate-700">{loan.book?.isbn}</strong></span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Due: {loan.due_date}</span>
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleReturnAction(loan.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center space-x-1 flex-shrink-0 shadow-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return Book</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
