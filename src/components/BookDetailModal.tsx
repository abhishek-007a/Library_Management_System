import React from 'react';
import { X, Printer, Bookmark, Calendar, Building2, FileText, MapPin, Layers, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { Book } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';

interface BookDetailModalProps {
  book: Book | null;
  isAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (book: Book) => void;
  onIssue: (book: Book) => void;
  onPrintBarcode: (book: Book) => void;
  onOpenLogin: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isAdmin,
  isOpen,
  onClose,
  onEdit,
  onIssue,
  onPrintBarcode,
  onOpenLogin
}) => {
  if (!isOpen || !book) return null;

  const isAvailable = book.available_copies > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-bold uppercase rounded-md tracking-wider">
              {book.genre || 'General'}
            </span>
            <span className="text-xs text-slate-400 font-mono">ISBN: {book.isbn}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Book Cover */}
            <div className="w-full sm:w-44 flex-shrink-0">
              <div className="aspect-[2/3] w-full rounded-xl overflow-hidden shadow-md border border-slate-200 bg-slate-100">
                <img
                  src={book.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80'}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              {/* Status pill under cover */}
              <div className="mt-3 text-center">
                <span
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {isAvailable ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{book.available_copies} of {book.total_copies} Available</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>All Copies Checked Out</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Book Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {book.title}
                </h1>
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  by {book.author}
                </p>
              </div>

              {/* Metadata Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {book.location_shelf && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Library Shelf</p>
                      <p className="font-semibold text-slate-800">{book.location_shelf}</p>
                    </div>
                  </div>
                )}

                {book.publisher && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Publisher</p>
                      <p className="font-semibold text-slate-800 truncate">{book.publisher}</p>
                    </div>
                  </div>
                )}

                {book.published_date && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Year</p>
                      <p className="font-semibold text-slate-800">{book.published_date}</p>
                    </div>
                  </div>
                )}

                {book.page_count && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Pages</p>
                      <p className="font-semibold text-slate-800">{book.page_count} pages</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {book.description && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Synopsis
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100 max-h-36 overflow-y-auto">
                    {book.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Spine Barcode Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Spine Barcode Identifier
              </p>
              <p className="text-[11px] text-slate-500">
                Official library tracking barcode (ISBN: {book.isbn})
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1 rounded border border-slate-200 shadow-sm">
                <BarcodeRenderer value={book.isbn} height={38} width={1.3} fontSize={10} />
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onPrintBarcode(book)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sticker</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-white transition"
          >
            Close
          </button>

          {isAdmin ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onEdit(book)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-white transition"
              >
                Edit Details
              </button>

              <button
                onClick={() => onIssue(book)}
                disabled={!isAvailable}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition flex items-center space-x-1.5 shadow-sm"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Issue / Checkout Book</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Are you a librarian?</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
