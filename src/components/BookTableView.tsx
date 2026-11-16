import React from 'react';
import { Book } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';
import { MapPin, Printer, Bookmark, Edit, Trash2, ExternalLink } from 'lucide-react';

interface BookTableViewProps {
  books: Book[];
  onView: (book: Book) => void;
  onEdit: (book: Book) => void;
  onIssue: (book: Book) => void;
  onDelete: (id: string) => void;
  onPrintBarcode: (book: Book) => void;
}

export const BookTableView: React.FC<BookTableViewProps> = ({
  books,
  onView,
  onEdit,
  onIssue,
  onDelete,
  onPrintBarcode
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Book & Author</th>
              <th className="px-4 py-3">ISBN & Barcode</th>
              <th className="px-4 py-3">Genre</th>
              <th className="px-4 py-3">Shelf</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {books.map(book => {
              const isAvailable = book.available_copies > 0;
              return (
                <tr key={book.id} className="hover:bg-slate-50/80 transition group">
                  {/* Book & Author */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        onClick={() => onView(book)}
                        className="w-10 h-14 flex-shrink-0 rounded bg-slate-100 overflow-hidden border border-slate-200 cursor-pointer"
                      >
                        <img
                          src={book.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <button
                          onClick={() => onView(book)}
                          className="font-bold text-slate-900 text-sm hover:text-brand-600 transition text-left line-clamp-1"
                        >
                          {book.title}
                        </button>
                        <p className="text-slate-500 font-medium truncate mt-0.5">{book.author}</p>
                      </div>
                    </div>
                  </td>

                  {/* ISBN & Barcode */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col items-start">
                      <span className="font-mono font-semibold text-slate-800 text-[11px] mb-1">{book.isbn}</span>
                      <div className="scale-75 origin-left -my-1.5">
                        <BarcodeRenderer value={book.isbn} height={20} width={1.0} displayValue={false} />
                      </div>
                    </div>
                  </td>

                  {/* Genre */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold border border-slate-200">
                      {book.genre || 'General'}
                    </span>
                  </td>

                  {/* Shelf */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{book.location_shelf}</span>
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {book.available_copies} / {book.total_copies}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => onPrintBarcode(book)}
                        title="Print Barcode Label"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEdit(book)}
                        title="Edit Book"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(book.id)}
                        title="Delete Book"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onIssue(book)}
                        disabled={!isAvailable}
                        className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition flex items-center space-x-1 shadow-sm"
                      >
                        <Bookmark className="w-3 h-3" />
                        <span>Issue</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
