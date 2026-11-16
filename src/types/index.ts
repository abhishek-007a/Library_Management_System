export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  published_date?: string;
  page_count?: number;
  genre: string;
  description?: string;
  cover_url?: string;
  total_copies: number;
  available_copies: number;
  location_shelf: string;
  status: 'available' | 'borrowed' | 'reserved' | 'lost';
  created_at?: string;
  updated_at?: string;
}

export interface Borrower {
  id: string;
  name: string;
  email: string;
  phone: string;
  membership_id: string;
  membership_type: 'student' | 'faculty' | 'public' | 'standard';
  active_loans_count?: number;
  created_at?: string;
}

export interface Loan {
  id: string;
  book_id: string;
  borrower_id: string;
  borrow_date: string;
  due_date: string;
  return_date?: string | null;
  status: 'active' | 'returned' | 'overdue';
  notes?: string;
  book?: Book;
  borrower?: Borrower;
  created_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  error?: string | null;
}

export interface BookFetchResult {
  title: string;
  author: string;
  publisher: string;
  published_date: string;
  page_count?: number;
  genre: string;
  description: string;
  cover_url: string;
  isbn: string;
  source: 'openlibrary' | 'googlebooks' | 'manual';
}
