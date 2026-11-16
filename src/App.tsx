import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Search, Filter, Plus, Camera, LayoutGrid, Table as TableIcon, 
  RotateCcw, Download, Sparkles, Cloud, AlertTriangle, CheckCircle2, 
  BookMarked, Users, Layers, ExternalLink, HardDrive, Printer, ShieldCheck, Lock, LogOut
} from 'lucide-react';
import { Book, Borrower, Loan, BookFetchResult } from './types';
import { storageService } from './services/storageService';
import { getSavedConfig } from './lib/supabase';
import { soundService } from './services/soundService';
import { authService, AdminUser } from './services/authService';

import { Navbar } from './components/Navbar';
import { BookCard } from './components/BookCard';
import { BookTableView } from './components/BookTableView';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { BookFormModal } from './components/BookFormModal';
import { BookDetailModal } from './components/BookDetailModal';
import { IssueReturnModal } from './components/IssueReturnModal';
import { BarcodePrinterModal } from './components/BarcodePrinterModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { MembersView } from './components/MembersView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminChangePasswordModal } from './components/AdminChangePasswordModal';

export function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => authService.getCurrentUser());
  const isAdmin = Boolean(currentUser);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);

  // Navigation & Views
  const [activeTab, setActiveTab] = useState<'catalog' | 'circulation' | 'members'>('catalog');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'borrowed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'author' | 'stock'>('newest');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'catalog' | 'return'>('catalog');
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [formInitialData, setFormInitialData] = useState<Book | BookFetchResult | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [isIssueReturnOpen, setIsIssueReturnOpen] = useState(false);
  const [preselectedBookForIssue, setPreselectedBookForIssue] = useState<Book | null>(null);

  const [isPrinterOpen, setIsPrinterOpen] = useState(false);
  const [printerInitialBook, setPrinterInitialBook] = useState<Book | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const config = getSavedConfig();
      setIsSupabaseConnected(config.isConnected);

      const [booksData, borrowersData, loansData] = await Promise.all([
        storageService.getBooks(),
        storageService.getBorrowers(),
        storageService.getLoans()
      ]);

      setBooks(booksData);
      setBorrowers(borrowersData);
      setLoans(loansData);
    } catch (e) {
      console.error('Error loading library data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When logging out, revert to catalog tab
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setActiveTab('catalog');
    soundService.playSuccess();
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    loadData();
  };

  // Filtered & Sorted Books
  const genresList = useMemo(() => {
    const set = new Set<string>();
    books.forEach(b => {
      if (b.genre) set.add(b.genre);
    });
    return Array.from(set).sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q) ||
        (book.publisher && book.publisher.toLowerCase().includes(q)) ||
        (book.location_shelf && book.location_shelf.toLowerCase().includes(q));

      const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;

      const matchesAvailability = 
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && book.available_copies > 0) ||
        (availabilityFilter === 'borrowed' && book.available_copies === 0);

      return matchesSearch && matchesGenre && matchesAvailability;
    }).sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      if (sortBy === 'stock') return b.available_copies - a.available_copies;
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  }, [books, searchQuery, selectedGenre, availabilityFilter, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const totalTitles = books.length;
    const totalCopies = books.reduce((acc, b) => acc + (b.total_copies || 1), 0);
    const availableCopies = books.reduce((acc, b) => acc + (b.available_copies || 0), 0);
    const borrowedCopies = totalCopies - availableCopies;
    const overdueLoans = loans.filter(l => l.status === 'overdue').length;
    const totalMembers = borrowers.length;

    return { totalTitles, totalCopies, availableCopies, borrowedCopies, overdueLoans, totalMembers };
  }, [books, loans, borrowers]);

  // Handlers for Books (Admin only)
  const handleSaveBook = async (bookData: Omit<Book, 'id' | 'created_at' | 'updated_at'>, id?: string) => {
    if (!isAdmin) {
      setIsAdminLoginOpen(true);
      return;
    }
    if (id) {
      await storageService.updateBook(id, bookData);
    } else {
      await storageService.addBook(bookData);
    }
    await loadData();
  };

  const handleDeleteBook = async (id: string) => {
    if (!isAdmin) {
      setIsAdminLoginOpen(true);
      return;
    }
    const book = books.find(b => b.id === id);
    if (!book) return;
    if (confirm(`Are you sure you want to remove "${book.title}" from library inventory?`)) {
      await storageService.deleteBook(id);
      soundService.playSuccess();
      await loadData();
    }
  };

  const handleBookFoundFromScan = (bookData: BookFetchResult, isbn: string) => {
    if (!isAdmin) {
      // For public users scanning an ISBN to search:
      const existing = books.find(b => b.isbn.replace(/[^0-9X]/gi, '') === isbn.replace(/[^0-9X]/gi, ''));
      if (existing) {
        setSelectedBook(existing);
        setIsDetailOpen(true);
      } else {
        alert(`Book with ISBN ${isbn} is not currently registered in this library catalog.`);
      }
      return;
    }

    // Admin workflow:
    const existing = books.find(b => b.isbn.replace(/[^0-9X]/gi, '') === isbn.replace(/[^0-9X]/gi, ''));
    if (existing) {
      setSelectedBook(existing);
      setIsDetailOpen(true);
      return;
    }

    setFormMode('add');
    setFormInitialData(bookData);
    setIsBookFormOpen(true);
  };

  const handleOpenManualAdd = () => {
    if (!isAdmin) {
      setIsAdminLoginOpen(true);
      return;
    }
    setFormMode('add');
    setFormInitialData(null);
    setIsBookFormOpen(true);
  };

  const handleEditBook = (book: Book) => {
    if (!isAdmin) {
      setIsAdminLoginOpen(true);
      return;
    }
    setFormMode('edit');
    setFormInitialData(book);
    setIsBookFormOpen(true);
    setIsDetailOpen(false);
  };

  const handleViewBook = (book: Book) => {
    setSelectedBook(book);
    setIsDetailOpen(true);
  };

  const handleIssueBookTrigger = (book: Book) => {
    if (!isAdmin) {
      setIsAdminLoginOpen(true);
      return;
    }
    setPreselectedBookForIssue(book);
    setIsIssueReturnOpen(true);
    setIsDetailOpen(false);
  };

  const handlePrintBarcodeTrigger = (book: Book) => {
    if (!isAdmin) {
      setIsAdminLoginOpen(true);
      return;
    }
    setPrinterInitialBook(book);
    setIsPrinterOpen(true);
  };

  // Handlers for Circulation
  const handleIssueBook = async (bookId: string, borrowerId: string, days: number, notes?: string) => {
    if (!isAdmin) return;
    await storageService.borrowBook(bookId, borrowerId, days, notes);
    await loadData();
  };

  const handleReturnBook = async (loanId: string) => {
    if (!isAdmin) return;
    await storageService.returnBook(loanId);
    await loadData();
  };

  const handleReturnScan = async (isbn: string) => {
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
    const book = books.find(b => b.isbn.replace(/[^0-9X]/gi, '') === cleanIsbn);

    if (!book) {
      soundService.playError();
      alert(`No book with ISBN "${isbn}" found in library inventory.`);
      return;
    }

    // Find active loan for this book
    const activeLoan = loans.find(
      l => l.book_id === book.id && (l.status === 'active' || l.status === 'overdue')
    );

    if (!activeLoan) {
      soundService.playError();
      alert(`"${book.title}" (ISBN: ${book.isbn}) is not currently checked out.\nAll ${book.total_copies} copies are already on shelf ${book.location_shelf}.`);
      return;
    }

    try {
      await storageService.returnBook(activeLoan.id);
      soundService.playSuccess();
      await loadData();
      alert(`✅ Book Returned Successfully!\n\n"${book.title}"\nReturned from borrower: ${activeLoan.borrower?.name || 'Borrower'}\n1 copy restored to ${book.location_shelf} (${book.available_copies + 1} of ${book.total_copies} now available).`);
    } catch (err) {
      soundService.playError();
      alert('Failed to process book return.');
    }
  };

  // Handlers for Members
  const handleAddBorrower = async (data: Omit<Borrower, 'id' | 'created_at'>) => {
    if (!isAdmin) return;
    await storageService.addBorrower(data);
    soundService.playSuccess();
    await loadData();
  };

  const handleDeleteBorrower = async (id: string) => {
    if (!isAdmin) return;
    await storageService.deleteBorrower(id);
    soundService.playSuccess();
    await loadData();
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (books.length === 0) return;
    const headers = ['ISBN', 'Title', 'Author', 'Publisher', 'Year', 'Genre', 'Shelf', 'Total Copies', 'Available Copies'];
    const rows = books.map(b => [
      `"${b.isbn}"`,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.author.replace(/"/g, '""')}"`,
      `"${(b.publisher || '').replace(/"/g, '""')}"`,
      `"${b.published_date || ''}"`,
      `"${b.genre || ''}"`,
      `"${b.location_shelf || ''}"`,
      b.total_copies,
      b.available_copies
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `library_books_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => {
          setScannerMode('catalog');
          setIsScannerOpen(true);
        }}
        onOpenAddModal={handleOpenManualAdd}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPrinter={() => {
          setPrinterInitialBook(null);
          setIsPrinterOpen(true);
        }}
        isSupabaseConnected={isSupabaseConnected}
        bookCount={books.length}
        isAdmin={isAdmin}
        adminUser={currentUser}
        onOpenLogin={() => setIsAdminLoginOpen(true)}
        onLogout={handleLogout}
        onOpenAdminSettings={() => setIsAdminSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Admin Session Banner if logged in */}
        {isAdmin ? (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
                <ShieldCheck className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">
                  Librarian Admin Session Active: <span className="text-brand-400">{currentUser?.name}</span> ({currentUser?.username})
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  You have full privileges to add books via barcode scanning, edit metadata, delete entries, and manage loans.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAdminSettingsOpen(true)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition"
              >
                Account Settings
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-lg transition flex items-center space-x-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit Admin</span>
              </button>
            </div>
          </div>
        ) : (
          /* Public Portal Notice */
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-xl border border-brand-100">
                <BookOpen className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Welcome to the Library Public Catalog
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Browse available titles, check physical shelf locations, and search by ISBN or category.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAdminLoginOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5 text-brand-400" />
              <span>Admin / Librarian Sign In</span>
            </button>
          </div>
        )}

        {/* Supabase status warning banner if not connected and admin is logged in */}
        {isAdmin && !isSupabaseConnected && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-amber-900">
                  Demo Mode (Using Local Storage with Preloaded Books)
                </p>
                <p className="text-amber-700 mt-0.5">
                  You can scan barcodes and add books immediately! Connect Supabase anytime for cloud storage.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm whitespace-nowrap"
            >
              <Cloud className="w-4 h-4" />
              <span>Connect Supabase Database</span>
            </button>
          </div>
        )}

        {/* Dashboard Stat KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl border border-brand-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400">Total Books</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{stats.totalTitles}</p>
              <p className="text-[10px] text-slate-500 font-medium">{stats.totalCopies} physical copies</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400">Available on Shelf</p>
              <p className="text-xl font-black text-emerald-700 mt-0.5">{stats.availableCopies}</p>
              <p className="text-[10px] text-emerald-600 font-medium">Ready to read</p>
            </div>
          </div>

          <div 
            onClick={() => {
              if (isAdmin) setActiveTab('circulation');
            }}
            className={`bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3.5 ${
              isAdmin ? 'cursor-pointer hover:border-brand-300 transition' : ''
            }`}
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400">Currently Borrowed</p>
              <p className="text-xl font-black text-blue-700 mt-0.5">{stats.borrowedCopies}</p>
              <p className="text-[10px] text-blue-600 font-medium">
                {stats.overdueLoans > 0 ? `${stats.overdueLoans} overdue` : 'On loan'}
              </p>
            </div>
          </div>

          <div 
            onClick={() => {
              if (isAdmin) setActiveTab('members');
            }}
            className={`bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3.5 ${
              isAdmin ? 'cursor-pointer hover:border-brand-300 transition' : ''
            }`}
          >
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400">Registered Patrons</p>
              <p className="text-xl font-black text-indigo-700 mt-0.5">{stats.totalMembers}</p>
              <p className="text-[10px] text-indigo-600 font-medium">Active members</p>
            </div>
          </div>
        </div>

        {/* Catalog Tab View */}
        {activeTab === 'catalog' && (
          <div className="space-y-5">
            {/* Action & Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Title, Author, ISBN, Shelf..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Right toolbar controls */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setViewMode('grid')}
                      title="Grid Card View"
                      className={`p-1.5 rounded-lg transition ${
                        viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      title="Spreadsheet Table View"
                      className={`p-1.5 rounded-lg transition ${
                        viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <TableIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Print Labels (Admin only) */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setPrinterInitialBook(null);
                        setIsPrinterOpen(true);
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
                      title="Generate and print barcode stickers"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Barcodes</span>
                    </button>
                  )}

                  {/* Export CSV */}
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
                    title="Export books inventory to CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>

                  {/* Admin Book Actions */}
                  {isAdmin ? (
                    <>
                      <button
                        onClick={handleOpenManualAdd}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Book</span>
                      </button>

                      <button
                        onClick={() => {
                          setScannerMode('catalog');
                          setIsScannerOpen(true);
                        }}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Scan & Add</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsAdminLoginOpen(true)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                    >
                      <Lock className="w-3.5 h-3.5 text-brand-400" />
                      <span>Admin Login</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filters line */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-500 flex items-center space-x-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filters:</span>
                  </span>

                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="all">All Genres ({books.length})</option>
                    {genresList.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>

                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'available' | 'borrowed')}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available on Shelf Only</option>
                    <option value="borrowed">Checked Out Only</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'title' | 'author' | 'stock')}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="newest">Recently Added</option>
                    <option value="title">Book Title (A-Z)</option>
                    <option value="author">Author Name</option>
                    <option value="stock">Highest Stock</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Catalog Books Display */}
            {filteredBooks.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-6">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="font-bold text-slate-800 text-base">No matching books found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery ? `No results for "${searchQuery}". Try different keywords.` : 'No books in this section.'}
                </p>
                {isAdmin && (
                  <div className="mt-5 flex items-center justify-center space-x-3">
                    <button
                      onClick={() => setIsScannerOpen(true)}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Scan Barcode</span>
                    </button>
                    <button
                      onClick={handleOpenManualAdd}
                      className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition shadow-xs"
                    >
                      <span>Manual Entry</span>
                    </button>
                  </div>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredBooks.map(book => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isAdmin={isAdmin}
                    onView={handleViewBook}
                    onEdit={handleEditBook}
                    onIssue={handleIssueBookTrigger}
                    onDelete={handleDeleteBook}
                    onPrintBarcode={handlePrintBarcodeTrigger}
                  />
                ))}
              </div>
            ) : (
              <BookTableView
                books={filteredBooks}
                isAdmin={isAdmin}
                onView={handleViewBook}
                onEdit={handleEditBook}
                onIssue={handleIssueBookTrigger}
                onDelete={handleDeleteBook}
                onPrintBarcode={handlePrintBarcodeTrigger}
              />
            )}
          </div>
        )}

        {/* Circulation Tab View (Admin only) */}
        {activeTab === 'circulation' && isAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900">Circulation & Loan Operations</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage checkouts, due dates, and returns with barcode scanning</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setScannerMode('return');
                    setIsScannerOpen(true);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan to Return/Check In</span>
                </button>

                <button
                  onClick={() => {
                    setPreselectedBookForIssue(null);
                    setIsIssueReturnOpen(true);
                  }}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue New Loan</span>
                </button>
              </div>
            </div>

            {/* Loans list */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">All Active & Historic Loans ({loans.length})</span>
                <span className="text-slate-500">{loans.filter(l => l.status === 'active' || l.status === 'overdue').length} currently borrowed</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Book Details</th>
                      <th className="px-4 py-3">Borrower / Member</th>
                      <th className="px-4 py-3">Borrow Date</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loans.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No loan records found in database.
                        </td>
                      </tr>
                    ) : (
                      loans.map(loan => {
                        const isOverdue = loan.status === 'overdue';
                        const isReturned = loan.status === 'returned';
                        return (
                          <tr key={loan.id} className="hover:bg-slate-50/70 transition">
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900 text-sm line-clamp-1">
                                {loan.book?.title || 'Unknown Book'}
                              </p>
                              <p className="font-mono text-slate-500 text-[11px] mt-0.5">
                                ISBN: {loan.book?.isbn || 'N/A'}
                              </p>
                            </td>

                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-800">{loan.borrower?.name || 'Member'}</p>
                              <p className="font-mono text-slate-400 text-[11px]">{loan.borrower?.membership_id}</p>
                            </td>

                            <td className="px-4 py-3 text-slate-600">{loan.borrow_date}</td>

                            <td className="px-4 py-3">
                              <span className={isOverdue ? 'font-bold text-rose-600' : 'text-slate-600'}>
                                {loan.due_date}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-center">
                              {isReturned ? (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-semibold">
                                  Returned ({loan.return_date})
                                </span>
                              ) : isOverdue ? (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[11px] font-bold">
                                  Overdue
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold">
                                  Active Loan
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-right">
                              {!isReturned && (
                                <button
                                  onClick={() => handleReturnBook(loan.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-xs"
                                >
                                  Return
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Members Tab View (Admin only) */}
        {activeTab === 'members' && isAdmin && (
          <MembersView
            borrowers={borrowers}
            onAddBorrower={handleAddBorrower}
            onDeleteBorrower={handleDeleteBorrower}
          />
        )}
      </main>

      {/* All Application Modals */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        scannerMode={scannerMode}
        onReturnScan={handleReturnScan}
        onBookFound={handleBookFoundFromScan}
      />

      <BookFormModal
        isOpen={isBookFormOpen}
        onClose={() => setIsBookFormOpen(false)}
        onSave={handleSaveBook}
        initialData={formInitialData}
        mode={formMode}
      />

      <BookDetailModal
        book={selectedBook}
        isAdmin={isAdmin}
        isOpen={isDetailOpen}
        loans={loans}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEditBook}
        onIssue={handleIssueBookTrigger}
        onReturn={handleReturnBook}
        onPrintBarcode={handlePrintBarcodeTrigger}
        onOpenLogin={() => setIsAdminLoginOpen(true)}
      />

      <IssueReturnModal
        isOpen={isIssueReturnOpen}
        onClose={() => setIsIssueReturnOpen(false)}
        books={books}
        borrowers={borrowers}
        loans={loans}
        preselectedBook={preselectedBookForIssue}
        onIssueBook={handleIssueBook}
        onReturnBook={handleReturnBook}
        onOpenBarcodeScanner={() => {
          setIsIssueReturnOpen(false);
          setScannerMode('return');
          setIsScannerOpen(true);
        }}
      />

      <BarcodePrinterModal
        isOpen={isPrinterOpen}
        onClose={() => setIsPrinterOpen(false)}
        books={books}
        initialBook={printerInitialBook}
      />

      <SupabaseSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigChanged={loadData}
      />

      {/* Admin Auth Modals */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AdminChangePasswordModal
        isOpen={isAdminSettingsOpen}
        onClose={() => setIsAdminSettingsOpen(false)}
        currentUser={currentUser}
        onCredentialsUpdated={() => {
          setCurrentUser(authService.getCurrentUser());
        }}
      />
    </div>
  );
}

export default App;
