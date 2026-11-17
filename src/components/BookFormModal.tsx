import React, { useState, useEffect } from 'react';
import { X, Search, Sparkles, BookOpen, Layers, MapPin, Hash, Image as ImageIcon, Save, Loader2, AlertCircle, CheckCircle, Mic, MicOff, Languages } from 'lucide-react';
import { Book, BookFetchResult } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';
import { fetchBookByISBN, cleanISBN, isSameIsbn } from '../services/bookLookupService';
import { soundService } from '../services/soundService';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookData: Omit<Book, 'id' | 'created_at' | 'updated_at'>, id?: string) => Promise<void>;
  initialData?: Book | BookFetchResult | null;
  mode?: 'add' | 'edit';
  existingBooks?: Book[];
}

const COMMON_GENRES = [
  'Novel (നോവൽ)',
  'Short Stories (ചെറുകഥകൾ)',
  'Poetry (കവിത)',
  'Drama (നാടകം)',
  'Autobiography & Biography (ജീവചരിത്രം)',
  'Kerala History & Culture (ചരിത്രം)',
  'Children Literature (ബാലസാഹിത്യം)',
  'Travelogue (യാത്രാവിവരണം)',
  'Essays & Criticism (ലേഖനം)',
  'Philosophy & Spirituality (ആത്മീയം)',
  'General Fiction (സാഹിത്യം)',
  'Technology & Science (ശാസ്ത്രം)',
  'Self-Help & Motivation',
  'Business & Economics',
  'Classic Fiction',
  'Mystery & Thriller'
];

const COMMON_PUBLISHERS = [
  'DC Books',
  'Mathrubhumi Books',
  'Current Books',
  'Olive Publications',
  'Green Books',
  'Poorna Publications',
  'Kerala Sahitya Akademi',
  'H&C Books',
  'Prabhath Book House',
  'Chintha Publishers',
  'National Book Stall (NBS/SPCS)',
  'Chithra Publications',
  'Penguin India',
  'HarperCollins India',
  'Rupa Publications'
];

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = 'add',
  existingBooks = []
}) => {
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    published_date: '',
    page_count: '' as string | number,
    price: '' as string | number,
    genre: 'General',
    description: '',
    cover_url: '',
    total_copies: 1,
    available_copies: 1,
    location_shelf: 'Shelf A-01',
    status: 'available' as Book['status']
  });

  const [isFetchingIsbn, setIsFetchingIsbn] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchSuccessMsg, setFetchSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Check if entered ISBN already exists in the catalog (prevents accidental duplicate books)
  const duplicateMatch = React.useMemo(() => {
    if (!formData.isbn || !existingBooks || existingBooks.length === 0) return null;
    const editingId = mode === 'edit' && initialData && 'id' in initialData ? (initialData as Book).id : null;
    return existingBooks.find(b => isSameIsbn(b.isbn, formData.isbn) && b.id !== editingId);
  }, [formData.isbn, existingBooks, mode, initialData]);

  // Voice speech-to-text dictation state (supports Malayalam and English)
  const [speechLang, setSpeechLang] = useState<'ml-IN' | 'en-IN'>('ml-IN');
  const [isListeningField, setIsListeningField] = useState<'title' | 'author' | null>(null);

  const startVoiceDictation = (targetField: 'title' | 'author') => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is supported in modern browsers like Google Chrome on Android/Desktop or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = speechLang;
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListeningField(targetField);
      soundService.playScanBeep();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setFormData(prev => ({
            ...prev,
            [targetField]: transcript.trim()
          }));
          soundService.playSuccess();
        }
        setIsListeningField(null);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListeningField(null);
      };

      recognition.onend = () => {
        setIsListeningField(null);
      };

      recognition.start();
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
      setIsListeningField(null);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        isbn: initialData.isbn || '',
        title: initialData.title || '',
        author: initialData.author || '',
        publisher: initialData.publisher || '',
        published_date: initialData.published_date || '',
        page_count: initialData.page_count ?? '',
        price: ('price' in initialData && initialData.price !== undefined ? initialData.price : ''),
        genre: initialData.genre || 'General',
        description: initialData.description || '',
        cover_url: initialData.cover_url || '',
        total_copies: ('total_copies' in initialData ? initialData.total_copies : 1),
        available_copies: ('available_copies' in initialData ? initialData.available_copies : 1),
        location_shelf: ('location_shelf' in initialData ? initialData.location_shelf : 'Shelf A-01'),
        status: ('status' in initialData ? initialData.status : 'available')
      });
      if ('source' in initialData && initialData.source === 'goodreads_malayalam') {
        setFetchSuccessMsg(`Matched "${initialData.title}" from Goodreads Popular Malayalam Books!`);
      } else if ('source' in initialData && (initialData.source === 'openlibrary' || initialData.source === 'googlebooks' || initialData.source === 'openlibrary_search')) {
        setFetchSuccessMsg(`Fetched book details online from ${initialData.source === 'googlebooks' ? 'Google Books' : 'Open Library'}!`);
      } else {
        setFetchSuccessMsg(null);
      }
    } else {
      setFormData({
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        published_date: '',
        page_count: '',
        price: '',
        genre: 'General',
        description: '',
        cover_url: '',
        total_copies: 1,
        available_copies: 1,
        location_shelf: 'Shelf A-01',
        status: 'available'
      });
      setFetchSuccessMsg(null);
    }
    setFetchError(null);
  }, [initialData, isOpen]);

  const handleIsbnQuickLookup = async () => {
    const cleaned = cleanISBN(formData.isbn);
    if (!cleaned) {
      setFetchError('Please enter an ISBN code first.');
      return;
    }

    setIsFetchingIsbn(true);
    setFetchError(null);
    setFetchSuccessMsg(null);

    try {
      const result = await fetchBookByISBN(cleaned);
      soundService.playSuccess();
      setFormData(prev => ({
        ...prev,
        isbn: cleaned,
        title: result.title || prev.title,
        author: result.author || prev.author,
        publisher: result.publisher || prev.publisher,
        published_date: result.published_date || prev.published_date,
        page_count: result.page_count ?? prev.page_count,
        genre: result.genre || prev.genre,
        description: result.description || prev.description,
        cover_url: result.cover_url || prev.cover_url
      }));
      if (result.source === 'goodreads_malayalam') {
        setFetchSuccessMsg(`Matched "${result.title}" from Goodreads Popular Malayalam Books!`);
      } else {
        setFetchSuccessMsg(`Fetched details from ${result.source === 'googlebooks' ? 'Google Books' : 'Open Library'}!`);
      }
    } catch (err: unknown) {
      soundService.playError();
      setFetchError(err instanceof Error ? err.message : 'Book not found online. You can enter details manually.');
    } finally {
      setIsFetchingIsbn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.isbn.trim()) {
      alert('Please provide at least a Title and ISBN.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Omit<Book, 'id' | 'created_at' | 'updated_at'> = {
        isbn: cleanISBN(formData.isbn) || formData.isbn.trim(),
        title: formData.title.trim(),
        author: formData.author.trim() || 'Unknown Author',
        publisher: formData.publisher.trim() || undefined,
        published_date: formData.published_date.trim() || undefined,
        page_count: formData.page_count ? Number(formData.page_count) : undefined,
        price: formData.price !== '' ? Number(formData.price) : 0,
        genre: formData.genre.trim() || 'General',
        description: formData.description.trim() || undefined,
        cover_url: formData.cover_url.trim() || undefined,
        total_copies: Math.max(1, Number(formData.total_copies) || 1),
        available_copies: Math.max(0, Number(formData.available_copies) || 0),
        location_shelf: formData.location_shelf.trim() || 'Shelf A-01',
        status: formData.status
      };

      const existingId = initialData && 'id' in initialData ? (initialData as Book).id : undefined;
      await onSave(payload, existingId);
      soundService.playSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save book:', err);
      alert('Error saving book to database.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[95vh] sm:max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30 flex-shrink-0">
              <BookOpen className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {mode === 'edit' ? 'Edit Book Details' : 'Add Book to Library'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Auto-fill details via ISBN lookup or enter details manually
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1">
          {/* Scanned Barcode Helper Notice (shown when an unindexed local/regional book is scanned) */}
          {formData.isbn && !formData.title && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center space-x-2.5 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Barcode Scanned:</strong> <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">{formData.isbn}</span>. Enter the book title and author below to save it to your library inventory.
              </span>
            </div>
          )}

          {/* Duplicate ISBN Warning */}
          {duplicateMatch && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  ⚠️ This ISBN already exists in your library: "{duplicateMatch.title}"
                </p>
                <p className="mt-1 text-amber-800">
                  Location: <strong>{duplicateMatch.location_shelf}</strong> &bull; Total copies on record: <strong>{duplicateMatch.total_copies}</strong> (Available: {duplicateMatch.available_copies}).
                </p>
                <p className="mt-1 text-amber-700 font-medium">
                  Saving will add to the stock of this book (+{formData.total_copies || 1} copies) instead of creating a duplicate record.
                </p>
              </div>
            </div>
          )}

          {/* Quick Lookup Toolbar */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              ISBN / Barcode Number
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="e.g. 9780132350884"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleIsbnQuickLookup}
                disabled={isFetchingIsbn || !formData.isbn.trim()}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition flex items-center space-x-1.5 shadow-sm"
              >
                {isFetchingIsbn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-Fill Online</span>
                  </>
                )}
              </button>
            </div>

            {fetchSuccessMsg && (
              <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg flex items-center space-x-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-medium">{fetchSuccessMsg}</span>
              </div>
            )}

            {fetchError && (
              <div className="mt-2 text-xs text-amber-700 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>{fetchError}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Left Column: Cover Preview & Barcode (Mobile: shows below form so inputs are immediate) */}
            <div className="order-2 md:order-1 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Cover Image Preview
                </label>
                <div className="w-full aspect-[2/3] max-w-[190px] mx-auto bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center relative group">
                  {formData.cover_url ? (
                    <img
                      src={formData.cover_url}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="p-4 text-center text-slate-400 flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-[11px]">No cover specified</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.cover_url}
                  onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Scannable Barcode Live Preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Generated Barcode Sticker
                </label>
                <div className="flex justify-center p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {formData.isbn ? (
                    <BarcodeRenderer value={formData.isbn} height={40} width={1.4} fontSize={10} />
                  ) : (
                    <span className="text-xs text-slate-400 py-3">Enter an ISBN to see barcode</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Metadata fields */}
            <div className="order-1 md:order-2 md:col-span-2 space-y-4">
              {/* Voice Language Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="flex items-center space-x-1.5 font-bold text-slate-700">
                  <Languages className="w-3.5 h-3.5 text-brand-600" />
                  <span>Voice Auto-Type Language:</span>
                </span>
                <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSpeechLang('ml-IN')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                      speechLang === 'ml-IN'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    മലയാളം (Malayalam)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeechLang('en-IN')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                      speechLang === 'en-IN'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Book Title *
                  </label>
                  <button
                    type="button"
                    onClick={() => startVoiceDictation('title')}
                    title={`Speak title in ${speechLang === 'ml-IN' ? 'Malayalam' : 'English'}`}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center space-x-1.5 shadow-xs ${
                      isListeningField === 'title'
                        ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                        : 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isListeningField === 'title' ? 'Listening... Speak Now' : 'Voice Speak Title'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Randamoozham / രണ്ടാമൂഴം / Clean Code"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Author(s) *
                    </label>
                    <button
                      type="button"
                      onClick={() => startVoiceDictation('author')}
                      title={`Speak author in ${speechLang === 'ml-IN' ? 'Malayalam' : 'English'}`}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition flex items-center space-x-1 ${
                        isListeningField === 'author'
                          ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-brand-50 hover:text-brand-700'
                      }`}
                    >
                      <Mic className="w-3 h-3" />
                      <span>{isListeningField === 'author' ? 'Listening...' : 'Voice Speak'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. M.T. Vasudevan Nair / Akhil P. Dharmajan"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Genre / Category
                  </label>
                  <input
                    type="text"
                    list="genre-list"
                    placeholder="e.g. Technology"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <datalist id="genre-list">
                    {COMMON_GENRES.map(g => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Publisher
                  </label>
                  <input
                    type="text"
                    list="publisher-list"
                    placeholder="e.g. DC Books"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <datalist id="publisher-list">
                    {COMMON_PUBLISHERS.map(p => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Published Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2020"
                    value={formData.published_date}
                    onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Pages
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 350"
                    value={formData.page_count}
                    onChange={(e) => setFormData({ ...formData, page_count: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 299"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-brand-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Inventory & Location Fields */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Total Copies</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.total_copies}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      setFormData({
                        ...formData,
                        total_copies: total,
                        available_copies: Math.min(formData.available_copies, total)
                      });
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
                    <Hash className="w-3.5 h-3.5 text-slate-500" />
                    <span>Available Copies</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.total_copies}
                    required
                    value={formData.available_copies}
                    onChange={(e) => setFormData({ ...formData, available_copies: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Shelf Location</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shelf CS-01"
                    value={formData.location_shelf}
                    onChange={(e) => setFormData({ ...formData, location_shelf: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description / Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief overview of the book..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition flex items-center space-x-2 shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{mode === 'edit' ? 'Update Book' : 'Save Book to Database'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
