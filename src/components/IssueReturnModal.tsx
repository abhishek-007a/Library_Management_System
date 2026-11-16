import React, { useState, useEffect } from 'react';
import { X, Bookmark, RotateCcw, Search, UserCheck, AlertTriangle, CheckCircle2, Clock, Camera, MapPin, BookOpen, Layers } from 'lucide-react';
import { Book, Borrower, Loan } from '../types';
import { soundService } from '../services/soundService';
import { BarcodeRenderer } from './BarcodeRenderer';

interface IssueReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  borrowers: Borrower[];
  loans: Loan[];
  preselectedBook?: Book | null;
  onIssueBook: (bookId: string, borrowerName: string, days: number, notes?: string) => Promise<void>;
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

  // Book being issued
  const [selectedBookId, setSelectedBookId] = useState<string>(preselectedBook?.id || '');
  const [borrowerName, setBorrowerName] = useState<string>('');
  const [loanNotes, setLoanNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return tab filter
  const [returnSearch, setReturnSearch] = useState('');

  // Synchronize when preselectedBook or modal state changes
  useEffect(() => {
    if (preselectedBook) {
      setSelectedBookId(preselectedBook.id);
    } else if (books.length > 0 && !selectedBookId) {
      const firstAvail = books.find(b => b.available_copies > 0);
      if (firstAvail) setSelectedBookId(firstAvail.id);
    }
  }, [preselectedBook, isOpen, books]);

  // Reset form inputs when modal opens
  useEffect(() => {
    if (isOpen) {
      setBorrowerName('');
      setLoanNotes('');
      if (preselectedBook) {
        setSelectedBookId(preselectedBook.id);
      }
    }
  }, [isOpen, preselectedBook]);

  if (!isOpen) return null;

  const currentBook = books.find(b => b.id === selectedBookId) || preselectedBook;
  const availableBooks = books.filter(b => b.available_copies > 0);
  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'overdue');

  const filteredReturnLoans = activeLoans.filter(loan => {
    const query = returnSearch.toLowerCase().trim();
    if (!query) return true;
    const bookTitle = loan.book?.title?.toLowerCase() || '';
    const bookIsbn = loan.book?.isbn?.toLowerCase() || '';
    const name = loan.borrower?.name?.toLowerCase() || '';
    const memberId = loan.borrower?.membership_id?.toLowerCase() || '';
    return bookTitle.includes(query) || bookIsbn.includes(query) || name.includes(query) || memberId.includes(query);
  });

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) {
      alert('Please select a book to issue.');
      return;
    }

    if (!borrowerName.trim()) {
      alert('Please enter the borrower name.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Standard 14 days default loan period in the background
      await onIssueBook(selectedBookId, borrowerName.trim(), 14, loanNotes.trim());
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[95vh] sm:max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30 flex-shrink-0">
              <Bookmark className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Circulation Desk</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">Issue book to borrower or check in returned books</p>
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
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-6 pt-2 sm:pt-3 space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('issue')}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
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
            className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
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
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'issue' ? (
            <form onSubmit={handleIssueSubmit} className="space-y-5">
              {/* 1. Specific Book Info Card (No dropdown needed when issuing a specific book!) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Book to Issue
                </label>

                {currentBook ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-4 shadow-xs">
                    {/* Cover */}
                    <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden border border-slate-200 bg-white shadow-xs flex-shrink-0">
                      <img
                        src={currentBook.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                        alt={currentBook.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>

                    {/* Book Metadata */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200/80">
                        {currentBook.genre || 'General'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug line-clamp-2">
                        {currentBook.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        by {currentBook.author}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                        <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                          ISBN: {currentBook.isbn}
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-600" />
                          <span>{currentBook.location_shelf}</span>
                        </span>
                        <span className="font-bold text-emerald-700">
                          ({currentBook.available_copies} of {currentBook.total_copies} left)
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Fallback selector only if no book is selected */
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
                )}
              </div>

              {/* 2. Borrower Name (Clean Text Input, No Dropdown) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Borrower Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Type borrower's full name... (e.g. Alex Johnson)"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    list="borrowers-autocomplete-list"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-xs transition"
                  />
                  {/* Datalist for autocomplete suggestions from previously registered members */}
                  <datalist id="borrowers-autocomplete-list">
                    {borrowers.map(b => (
                      <option key={b.id} value={b.name} />
                    ))}
                  </datalist>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Type the name of any student, teacher, or patron.
                </p>
              </div>

              {/* 3. Optional Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scanned at front desk, reference study loan"
                  value={loanNotes}
                  onChange={(e) => setLoanNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedBookId || !borrowerName.trim()}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center space-x-2 shadow-md shadow-brand-500/25 active:scale-95"
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
                    placeholder="Search by book title, ISBN, or borrower name..."
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
                            <span>Borrower: <strong className="text-slate-800">{loan.borrower?.name}</strong></span>
                            <span>ISBN: <strong className="font-mono text-slate-700">{loan.book?.isbn}</strong></span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Borrowed: {loan.borrow_date}</span>
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
