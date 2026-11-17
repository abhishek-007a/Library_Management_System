import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, Upload, Keyboard, Search, X, Loader2, Sparkles, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { fetchBookByISBN, cleanISBN, isSameIsbn } from '../services/bookLookupService';
import { soundService } from '../services/soundService';
import { Book, BookFetchResult } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookFound: (bookData: BookFetchResult, isbn: string) => void;
  onReturnScan?: (isbn: string) => Promise<void> | void;
  scannerMode?: 'catalog' | 'return';
  title?: string;
  subtitle?: string;
  existingBooks?: Book[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onBookFound,
  onReturnScan,
  scannerMode = 'catalog',
  title,
  subtitle,
  existingBooks = []
}) => {
  const resolvedTitle = title || (scannerMode === 'return' ? 'Scan Book to Return / Check-In' : 'Scan Book ISBN / Barcode');
  const resolvedSubtitle = subtitle || (scannerMode === 'return' ? 'Point your camera at the returned book barcode to check it in' : 'Point your camera at the ISBN barcode on the back of any book to auto-fetch details');
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'usb' | 'manual'>('camera');
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingLookup, setIsLoadingLookup] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [manualIsbn, setManualIsbn] = useState('');
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-code-reader-element';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // USB Barcode Scanner listener (captures fast keyboard wedge stream)
  useEffect(() => {
    if (!isOpen) return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input element
      const activeElement = document.activeElement;
      if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const currentTime = Date.now();
      // Most USB barcode scanners enter characters faster than 50ms per key
      if (currentTime - lastKeyTime > 120) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 8) {
          e.preventDefault();
          const detectedCode = buffer.trim();
          handleCodeDetected(detectedCode);
        }
        buffer = '';
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const startCameraScanner = async (cameraConfig?: string | { facingMode: string }) => {
    try {
      setCameraError(null);
      if (html5QrCodeRef.current) {
        await stopCameraScanner();
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.QR_CODE
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        verbose: false
      });
      html5QrCodeRef.current = html5QrCode;

      // Prefer rear camera on mobile devices
      const targetConfig = cameraConfig || (selectedCameraId ? selectedCameraId : { facingMode: 'environment' });

      await html5QrCode.start(
        targetConfig,
        {
          fps: 24,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const width = Math.min(viewfinderWidth * 0.9, 320);
            const height = Math.min(viewfinderHeight * 0.6, 200);
            return {
              width: Math.floor(Math.max(240, width)),
              height: Math.floor(Math.max(140, height))
            };
          }
        },
        (decodedText) => {
          handleCodeDetected(decodedText);
        },
        () => {
          // Frame parsed without barcode; normal scanning loop
        }
      );

      setIsScanning(true);
      if (typeof targetConfig === 'string') {
        setSelectedCameraId(targetConfig);
      }

      // Re-enumerate cameras once stream is live to get real hardware labels (Back/Front/Ultra-wide)
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const list = devices.map((d, index) => {
            let label = d.label;
            if (!label) {
              label = index === 0 ? 'Rear Camera (Main)' : `Camera ${index + 1}`;
            }
            return { id: d.id, label };
          });
          setCameras(list);
          if (typeof targetConfig !== 'string') {
            const backCam = list.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear') || c.label.toLowerCase().includes('environment') || c.label.toLowerCase().includes('0'));
            if (backCam) setSelectedCameraId(backCam.id);
            else if (list[0]) setSelectedCameraId(list[0].id);
          }
        }
      } catch (err) {
        console.warn('Post-start camera enumeration warning:', err);
      }
    } catch (err: unknown) {
      console.warn('Failed to start camera with config:', cameraConfig, err);
      setIsScanning(false);

      // Fallback: If { facingMode: 'environment' } failed, try first enumerated camera ID
      if (cameraConfig && typeof cameraConfig === 'object' && cameras.length > 0) {
        try {
          const fallbackCam = cameras[0].id;
          setSelectedCameraId(fallbackCam);
          await startCameraScanner(fallbackCam);
          return;
        } catch {
          // continue to error below
        }
      }

      setCameraError('Unable to open camera stream. Please check camera permissions in your browser or switch lenses below.');
    }
  };

  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex(c => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCam = cameras[nextIndex];
    setSelectedCameraId(nextCam.id);
    await startCameraScanner(nextCam.id);
  };

  // Launch camera whenever camera tab is opened
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopCameraScanner();
      return;
    }

    startCameraScanner(selectedCameraId || { facingMode: 'environment' });

    return () => {
      stopCameraScanner();
    };
  }, [isOpen, activeTab]);

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      } finally {
        html5QrCodeRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const handleCodeDetected = async (code: string) => {
    const cleaned = cleanISBN(code);
    if (!cleaned) return;

    soundService.playScanBeep();
    setLastScannedCode(cleaned);
    await stopCameraScanner();

    if (scannerMode === 'return' && onReturnScan) {
      try {
        await onReturnScan(cleaned);
        onClose();
        return;
      } catch (err: unknown) {
        soundService.playError();
        const message = err instanceof Error ? err.message : 'Return failed.';
        setLookupError(message);
        return;
      }
    }

    // 1. Check if this book is already in the library's catalog (prevents duplicate entries)
    if (existingBooks && existingBooks.length > 0) {
      const existing = existingBooks.find(b => isSameIsbn(b.isbn, cleaned));
      if (existing) {
        soundService.playSuccess();
        onBookFound(
          {
            title: existing.title,
            author: existing.author,
            publisher: existing.publisher || '',
            published_date: existing.published_date || '',
            page_count: existing.page_count,
            price: existing.price,
            genre: existing.genre || 'General',
            description: existing.description || '',
            cover_url: existing.cover_url || '',
            isbn: existing.isbn,
            source: 'library_database'
          },
          existing.isbn || cleaned
        );
        onClose();
        return;
      }
    }

    setIsLoadingLookup(true);
    setLookupError(null);

    try {
      const bookData = await fetchBookByISBN(cleaned);
      soundService.playSuccess();
      onBookFound(bookData, cleaned);
      onClose();
    } catch {
      // For local Malayalam and regional books not in global Open Library / Google Books databases:
      // Seamlessly transition to the Book Form with the scanned barcode pre-filled!
      soundService.playSuccess();
      onBookFound(
        {
          title: '',
          author: '',
          publisher: '',
          published_date: '',
          genre: 'General',
          description: '',
          cover_url: '',
          isbn: cleaned,
          source: 'manual'
        },
        cleaned
      );
      onClose();
    } finally {
      setIsLoadingLookup(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoadingLookup(true);
      setLookupError(null);

      const html5QrCode = new Html5Qrcode('file-scanner-temp', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.QR_CODE
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        verbose: false
      });
      const decodedResult = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();

      await handleCodeDetected(decodedResult);
    } catch (err: unknown) {
      setIsLoadingLookup(false);
      soundService.playError();
      setLookupError('Could not detect a clear barcode in this image. Please try a sharper photo or enter the ISBN number manually.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIsbn.trim()) return;
    await handleCodeDetected(manualIsbn.trim());
  };

  const handleManualFallbackProceed = () => {
    if (lastScannedCode) {
      onBookFound(
        {
          title: '',
          author: '',
          publisher: '',
          published_date: '',
          genre: 'General',
          description: '',
          cover_url: '',
          isbn: lastScannedCode,
          source: 'manual'
        },
        lastScannedCode
      );
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[95vh] sm:max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30 flex-shrink-0">
              <Camera className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{resolvedTitle}</h2>
              <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">{resolvedSubtitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCameraScanner();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-6 pt-2 sm:pt-3 space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setLookupError(null);
              setActiveTab('camera');
            }}
            className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'camera'
                ? 'bg-white text-brand-600 border-brand-500 shadow-sm'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => {
              stopCameraScanner();
              setLookupError(null);
              setActiveTab('upload');
            }}
            className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'upload'
                ? 'bg-white text-brand-600 border-brand-500 shadow-sm'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>

          <button
            onClick={() => {
              stopCameraScanner();
              setLookupError(null);
              setActiveTab('usb');
            }}
            className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'usb'
                ? 'bg-white text-brand-600 border-brand-500 shadow-sm'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>USB Scanner</span>
          </button>

          <button
            onClick={() => {
              stopCameraScanner();
              setLookupError(null);
              setActiveTab('manual');
            }}
            className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === 'manual'
                ? 'bg-white text-brand-600 border-brand-500 shadow-sm'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Type ISBN</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Camera Tab */}
          {activeTab === 'camera' && (
            <div className="flex flex-col items-center">
              {cameras.length > 1 && (
                <div className="w-full mb-3 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="cameraSelect" className="font-semibold text-slate-700">Lens:</label>
                    <select
                      id="cameraSelect"
                      value={selectedCameraId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setSelectedCameraId(newId);
                        startCameraScanner(newId);
                      }}
                      className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 bg-white max-w-[170px] sm:max-w-[220px] truncate focus:ring-1 focus:ring-brand-500"
                    >
                      {cameras.map((c, i) => (
                        <option key={c.id} value={c.id}>{c.label || `Camera ${i + 1}`}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 text-xs font-semibold transition shadow-2xs"
                    title="Switch camera lens"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Flip / Switch</span>
                  </button>
                </div>
              )}

              {cameraError ? (
                <div className="w-full p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex flex-col items-center text-center space-y-3">
                  <AlertCircle className="w-6 h-6 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold">{cameraError}</p>
                    <p className="mt-1 text-xs text-amber-700">
                      If your phone has multiple rear cameras (wide, macro, etc.), try tapping <strong>Retry Back Camera</strong> or switch lenses below.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => startCameraScanner({ facingMode: 'environment' })}
                      className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                    >
                      Retry Back Camera
                    </button>
                    {cameras.length > 1 && (
                      <button
                        type="button"
                        onClick={handleSwitchCamera}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Try Next Lens</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative w-full max-w-sm aspect-[4/3] bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                  <div id={scannerContainerId} className="w-full h-full" />
                  
                  {/* Visual laser guide overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="relative w-64 h-36 border-2 border-dashed border-emerald-400/80 rounded-lg">
                      <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] scanner-laser" />
                    </div>
                    <span className="mt-2 text-xs font-mono text-emerald-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                      Align barcode inside frame
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="barcode-image-upload"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-md p-8 border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-brand-50/30 transition flex flex-col items-center group"
              >
                <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-brand-600 group-hover:border-brand-300 transition mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1">Upload Barcode Photo</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  Take a photo of the ISBN barcode on the book with your phone or select an image file.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  Select Image File
                </button>
              </div>
              <div id="file-scanner-temp" className="hidden" />
            </div>
          )}

          {/* USB Scanner Tab */}
          {activeTab === 'usb' && (
            <div className="py-6 px-4 text-center">
              <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-4 border border-emerald-100">
                <Keyboard className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Hardware / USB Barcode Scanner Ready</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                Connect your handheld USB or Bluetooth barcode reader. Simply pull the trigger to scan any book barcode directly now.
              </p>
              
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-100/70 border border-emerald-300 text-emerald-800 rounded-full text-xs font-semibold animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Listening for barcode scanner keystrokes...</span>
              </div>
            </div>
          )}

          {/* Manual ISBN Tab */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSearch} className="py-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Enter ISBN-10 or ISBN-13
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={manualIsbn}
                  onChange={(e) => setManualIsbn(e.target.value)}
                  placeholder="e.g. 9780132350884, 9780451524935"
                  className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!manualIsbn.trim() || isLoadingLookup}
                  className="px-5 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition flex items-center space-x-2 shadow-sm"
                >
                  {scannerMode === 'return' ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>Process Return</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Fetch Details</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <p className="font-semibold text-slate-600 mb-1">Quick Test ISBN Examples:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { title: 'Clean Code', isbn: '9780132350884' },
                    { title: '1984', isbn: '9780451524935' },
                    { title: 'Sapiens', isbn: '9780062316097' },
                    { title: 'The Pragmatic Programmer', isbn: '9780201616224' }
                  ].map(ex => (
                    <button
                      key={ex.isbn}
                      type="button"
                      onClick={() => {
                        setManualIsbn(ex.isbn);
                        handleCodeDetected(ex.isbn);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-md font-mono text-[11px] transition"
                    >
                      {ex.title} ({ex.isbn})
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* Loading Indicator */}
          {isLoadingLookup && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center space-x-3 text-slate-700 animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
              <div className="text-xs">
                <p className="font-bold text-slate-900">Querying Open Library & Google Books...</p>
                <p className="text-slate-500">Fetching title, author, cover image, and metadata</p>
              </div>
            </div>
          )}

          {/* Lookup Error / Manual Fallback */}
          {lookupError && !isLoadingLookup && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
              <div className="flex items-start space-x-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{lookupError}</p>
                  <p className="text-amber-700 mt-0.5">
                    No problem! You can enter the title, author, and details manually while keeping the scanned ISBN: <strong className="font-mono">{lastScannedCode}</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleManualFallbackProceed}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition"
              >
                Proceed to Manual Book Entry with this ISBN
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Supported: ISBN-10, ISBN-13, EAN-13, UPC-A</span>
          </div>
          <button
            onClick={() => {
              stopCameraScanner();
              onClose();
            }}
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
