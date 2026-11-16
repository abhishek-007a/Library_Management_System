import React from 'react';
import { Book } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';
import { MapPin, Printer, Bookmark, Edit, Trash2, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

interface BookCardProps {
  book: Book;
  isAdmin: boolean;
  onView: (book: Book) => void;
  onEdit: (book: Book) => void;
  onIssue: (book: Book) => void;
  onDelete: (id: string) => void;
  onPrintBarcode: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  isAdmin,
  onView,
  onEdit,
  onIssue,
  onDelete,
  onPrintBarcode
}) => {
  const isAvailable = book.available_copies > 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Banner with Cover and Quick Barcode */}
      <div className="relative p-4 pb-2 flex space-x-3.5 items-start">
        {/* Cover */}
        <div 
          onClick={() => onView(book)}
          className="relative w-20 aspect-[2/3] flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm cursor-pointer group-hover:scale-105 transition duration-200"
        >
          <img
            src={book.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80'}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200/60 truncate max-w-[120px]">
              {book.genre || 'General'}
            </span>

            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isAvailable
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {isAvailable ? `${book.available_copies} Available` : 'Checked Out'}
            </span>
          </div>

          <h3
            onClick={() => onView(book)}
            className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug cursor-pointer hover:text-brand-600 transition"
          >
            {book.title}
          </h3>

          <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
            {book.author}
          </p>

          <div className="mt-2 flex items-center space-x-1 text-[11px] text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-medium truncate">{book.location_shelf}</span>
          </div>
        </div>
      </div>

      {/* Barcode Strip */}
      <div className="px-4 py-2 mt-auto border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="scale-90 origin-left">
          <BarcodeRenderer value={book.isbn} height={26} width={1.1} fontSize={9} />
        </div>

        {isAdmin && (
          <button
            onClick={() => onPrintBarcode(book)}
            title="Print Barcode Label"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-md transition"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
        <button
          onClick={() => onView(book)}
          className="text-slate-600 hover:text-slate-900 font-semibold flex items-center space-x-1"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Details</span>
        </button>

        {isAdmin ? (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(book)}
              title="Edit Book Details"
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(book.id)}
              title="Delete Book"
              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onIssue(book)}
              disabled={!isAvailable}
              className="ml-1 px-2.5 py-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-bold text-[11px] rounded-lg transition flex items-center space-x-1 shadow-sm"
            >
              <Bookmark className="w-3 h-3" />
              <span>Issue</span>
            </button>
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-slate-500">
            {isAvailable ? `${book.available_copies} of ${book.total_copies} on shelf` : 'All copies currently on loan'}
          </span>
        )}
      </div>
    </div>
  );
};
