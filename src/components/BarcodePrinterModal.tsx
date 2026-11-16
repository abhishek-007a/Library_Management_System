import React, { useState } from 'react';
import { X, Printer, Check, Copy, Sliders, Layers } from 'lucide-react';
import { Book } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';

interface BarcodePrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  initialBook?: Book | null;
}

export const BarcodePrinterModal: React.FC<BarcodePrinterModalProps> = ({
  isOpen,
  onClose,
  books,
  initialBook
}) => {
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>(
    initialBook ? [initialBook.id] : books.map(b => b.id)
  );
  const [copiesPerBook, setCopiesPerBook] = useState<number>(1);
  const [labelStyle, setLabelStyle] = useState<'spine' | 'detailed' | 'minimal'>('spine');

  if (!isOpen) return null;

  const targetBooks = books.filter(b => selectedBookIds.includes(b.id));

  const handlePrint = () => {
    window.print();
  };

  const toggleBook = (id: string) => {
    if (selectedBookIds.includes(id)) {
      setSelectedBookIds(selectedBookIds.filter(item => item !== id));
    } else {
      setSelectedBookIds([...selectedBookIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
              <Printer className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Barcode Label Printing Studio</h2>
              <p className="text-xs text-slate-400">Generate and print scannable ISBN barcode stickers for books</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs no-print">
          <div className="flex items-center space-x-4">
            <div>
              <label className="font-bold text-slate-700 mr-2">Label Format:</label>
              <select
                value={labelStyle}
                onChange={(e) => setLabelStyle(e.target.value as 'spine' | 'detailed' | 'minimal')}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
              >
                <option value="spine">Spine Label (Standard 2" x 1")</option>
                <option value="detailed">Detailed Catalog Label (3" x 2")</option>
                <option value="minimal">Barcode Only (Minimalist)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 mr-2">Copies per book:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={copiesPerBook}
                onChange={(e) => setCopiesPerBook(Math.max(1, Number(e.target.value)))}
                className="w-16 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedBookIds(books.map(b => b.id))}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-700 transition"
            >
              Select All ({books.length})
            </button>
            <button
              onClick={() => setSelectedBookIds([])}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-700 transition"
            >
              Clear Selection
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/50">
          <div className="print-area">
            {targetBooks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 no-print">
                <p className="font-semibold text-sm">No books selected for printing.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {targetBooks.flatMap(book => 
                  Array.from({ length: copiesPerBook }).map((_, copyIndex) => (
                    <div
                      key={`${book.id}-copy-${copyIndex}`}
                      className="bg-white border-2 border-slate-300 rounded-xl p-3.5 shadow-sm flex flex-col justify-between items-center text-center text-slate-800 break-inside-avoid"
                    >
                      {/* Top Header of sticker */}
                      {labelStyle !== 'minimal' && (
                        <div className="w-full mb-2 border-b border-dashed border-slate-200 pb-1.5">
                          <p className="font-black text-xs text-slate-900 line-clamp-1 leading-snug">
                            {book.title}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mt-0.5">
                            <span className="truncate max-w-[120px]">{book.author}</span>
                            <span className="font-bold text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded border border-brand-200">
                              {book.location_shelf}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Barcode graphic */}
                      <div className="my-1 scale-95 origin-center">
                        <BarcodeRenderer
                          value={book.isbn}
                          height={labelStyle === 'detailed' ? 44 : 36}
                          width={1.3}
                          fontSize={10}
                        />
                      </div>

                      {/* Bottom Footer */}
                      <div className="w-full flex items-center justify-between text-[9px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-100">
                        <span>LibroScan LMS</span>
                        <span>Copy #{copyIndex + 1}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between no-print">
          <span className="text-xs text-slate-500 font-medium">
            Total stickers to print: <strong>{targetBooks.length * copiesPerBook}</strong>
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-50 transition"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              disabled={targetBooks.length === 0}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition flex items-center space-x-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Stickers Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
