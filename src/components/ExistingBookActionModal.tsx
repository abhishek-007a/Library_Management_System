import React, { useState } from 'react';
import { X, Plus, RotateCcw, Bookmark, MapPin, CheckCircle, AlertCircle, BookOpen, Layers } from 'lucide-react';
import { Book, Loan } from '../types';
import { soundService } from '../services/soundService';

interface ExistingBookActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  loans: Loan[];
  onAddCopy: (book: Book, count: number) => Promise<void>;
  onReturnBook: (loanId: string) => Promise<void>;
  onIssueBook: (book: Book) => void;
  onViewDetails: (book: Book) => void;
}

export const ExistingBookActionModal: React.FC<ExistingBookActionModalProps> = ({
  isOpen,
  onClose,
  book,
  loans,
  onAddCopy,
  onReturnBook,
  onIssueBook,
  onViewDetails
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!isOpen || !book) return null;

  // Find active loans for this specific book
  const activeLoans = loans.filter(l => l.book_id === book.id && (l.status === 'active' || l.status === 'overdue'));
  const isBorrowed = activeLoans.length > 0;
  const hasAvailableCopies = book.available_copies > 0;

  const handleAddOneCopy = async () => {
    setIsProcessing(true);
    try {
      await onAddCopy(book, 1);
      setActionSuccess(`Added 1 physical copy to inventory! Total stock is now ${book.total_copies + 1} copies.`);
      soundService.playSuccess();
      setTimeout(() => {
        setActionSuccess(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnAction = async () => {
    if (activeLoans.length === 0) return;
    setIsProcessing(true);
    try {
      const loan = activeLoans[0];
      await onReturnBook(loan.id);
      setActionSuccess(`Book returned successfully from ${loan.borrower?.name || 'borrower'}!`);
      soundService.playSuccess();
      setTimeout(() => {
        setActionSuccess(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIssueAction = () => {
    onClose();
    onIssueBook(book);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Book Already in Catalog
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Choose an action for this registered book
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          {/* Success Banner */}
          {actionSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Book Info Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3.5">
            <div className="w-16 h-22 flex-shrink-0 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
              <img
                src={book.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                {book.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5 truncate">
                by {book.author}
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{book.location_shelf}</span>
                </span>

                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                  <Layers className="w-3 h-3 text-slate-400" />
                  <span>{book.available_copies} / {book.total_copies} available</span>
                </span>
              </div>

              {/* Status Note */}
              <div className="mt-2 text-xs">
                {isBorrowed ? (
                  <p className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md inline-flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Currently borrowed by <strong>{activeLoans[0].borrower?.name || 'Borrower'}</strong></span>
                  </p>
                ) : (
                  <p className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md inline-flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>On Shelf &bull; Ready to loan</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Options */}
          <div className="space-y-2.5 pt-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select What You Want to Do:
            </p>

            {/* Option 1: Add Another Copy */}
            <button
              type="button"
              onClick={handleAddOneCopy}
              disabled={isProcessing}
              className="w-full p-3.5 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 rounded-xl transition flex items-center justify-between text-left group shadow-xs active:scale-[0.99]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition flex items-center justify-center flex-shrink-0 font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                    Add Another Copy (+1 Stock)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Increases inventory count without creating a duplicate record
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded-lg">
                +1 Copy
              </span>
            </button>

            {/* Option 2: Circulation (Return if borrowed, Issue if available) */}
            {isBorrowed ? (
              <button
                type="button"
                onClick={handleReturnAction}
                disabled={isProcessing}
                className="w-full p-3.5 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-amber-500 rounded-xl transition flex items-center justify-between text-left group shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-800 transition">
                      Return Borrowed Book
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Check-in copy from {activeLoans[0].borrower?.name || 'borrower'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 px-2 py-1 bg-amber-50 rounded-lg">
                  Check-In
                </span>
              </button>
            ) : hasAvailableCopies ? (
              <button
                type="button"
                onClick={handleIssueAction}
                disabled={isProcessing}
                className="w-full p-3.5 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-brand-500 rounded-xl transition flex items-center justify-between text-left group shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition flex items-center justify-center flex-shrink-0">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-700 transition">
                      Issue / Loan Book
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Check-out this book to a registered library member
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-700 px-2 py-1 bg-brand-50 rounded-lg">
                  Loan
                </span>
              </button>
            ) : null}

            {/* If copies are available and also has loans, give option to issue remaining copy */}
            {isBorrowed && hasAvailableCopies && (
              <button
                type="button"
                onClick={handleIssueAction}
                disabled={isProcessing}
                className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center space-x-2.5">
                  <Bookmark className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">
                    Issue Available Copy ({book.available_copies} available)
                  </span>
                </div>
                <span className="text-[11px] text-brand-600 font-bold">Issue &rarr;</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewDetails(book);
            }}
            className="text-slate-600 hover:text-slate-900 font-semibold underline underline-offset-2"
          >
            View Full Details / Edit
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
