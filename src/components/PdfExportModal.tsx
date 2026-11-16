import React from 'react';
import { X, Printer, Download, BookOpen, FileText } from 'lucide-react';
import { Book } from '../types';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onExportCsv: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  books,
  onExportCsv
}) => {
  if (!isOpen) return null;

  const totalTitles = books.length;
  const totalCopies = books.reduce((acc, b) => acc + (b.total_copies || 1), 0);
  const totalValue = books.reduce((acc, b) => acc + ((b.price || 0) * (b.total_copies || 1)), 0);
  const availableCopies = books.reduce((acc, b) => acc + (b.available_copies || 0), 0);

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header (hidden in print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
              <FileText className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Export Catalog Report (PDF & Spreadsheet)</h2>
              <p className="text-xs text-slate-400">Download or print full library catalog with book prices and stock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar (hidden in print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-600">Total Titles: <strong>{totalTitles}</strong></span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-slate-600">Total Physical Copies: <strong>{totalCopies}</strong></span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-brand-700">Total Asset Value: <strong>₹{totalValue.toLocaleString('en-IN')}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onExportCsv}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-lg transition flex items-center space-x-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Spreadsheet (.CSV)</span>
            </button>

            <button
              onClick={handlePrintPdf}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition flex items-center space-x-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Save / Print as PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-8 overflow-y-auto flex-1 bg-white print-area">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                  <span>LibroScan Library Management System</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Official Catalog & Inventory Valuation Report</p>
              </div>

              <div className="text-right text-xs text-slate-500">
                <p>Date: <strong className="text-slate-800">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
                <p>Status: <strong className="text-emerald-700">Active Inventory</strong></p>
              </div>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Titles</p>
                <p className="text-base font-black text-slate-900">{totalTitles}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Copies</p>
                <p className="text-base font-black text-slate-900">{totalCopies}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-400">Available on Shelf</p>
                <p className="text-base font-black text-emerald-700">{availableCopies}</p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-emerald-700">Total Asset Value</p>
                <p className="text-base font-black text-emerald-900">₹{totalValue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-center w-10 border-r border-slate-200">#</th>
                  <th className="p-2.5 border-r border-slate-200">Book Title & Author</th>
                  <th className="p-2.5 border-r border-slate-200">ISBN</th>
                  <th className="p-2.5 border-r border-slate-200">Genre</th>
                  <th className="p-2.5 text-right border-r border-slate-200">Price</th>
                  <th className="p-2.5 border-r border-slate-200">Shelf</th>
                  <th className="p-2.5 text-center">Copies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {books.map((book, idx) => (
                  <tr key={book.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 text-center font-bold text-slate-400 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <p className="font-bold text-slate-900">{book.title}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">by {book.author}</p>
                    </td>
                    <td className="p-2.5 font-mono text-[11px] text-slate-700 border-r border-slate-200 whitespace-nowrap">
                      {book.isbn}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 whitespace-nowrap">
                      {book.genre || 'General'}
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                      ₹{book.price ? book.price.toFixed(2) : '0.00'}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 whitespace-nowrap">
                      {book.location_shelf}
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-800 whitespace-nowrap">
                      {book.available_copies} / {book.total_copies}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Document Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <span>Generated by LibroScan Smart Library Management System</span>
            <span>Page 1 of 1</span>
          </div>
        </div>

        {/* Footer (hidden in print) */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white font-semibold text-xs transition"
          >
            Close
          </button>
          <button
            onClick={handlePrintPdf}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition flex items-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
