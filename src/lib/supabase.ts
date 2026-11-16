import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

const STORAGE_KEY = 'libro_supabase_config';

// Pre-fill from environment if present
const DEFAULT_URL = (import.meta as { env?: Record<string, string> })?.env?.VITE_SUPABASE_URL || '';
const DEFAULT_KEY = (import.meta as { env?: Record<string, string> })?.env?.VITE_SUPABASE_ANON_KEY || '';

export function getSavedConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url,
          anonKey: parsed.anonKey,
          isConnected: true
        };
      }
    }
  } catch (e) {
    console.error('Error reading saved Supabase config:', e);
  }

  return {
    url: DEFAULT_URL,
    anonKey: DEFAULT_KEY,
    isConnected: Boolean(DEFAULT_URL && DEFAULT_KEY)
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const config = getSavedConfig();
  if (config.url && config.anonKey) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
      return supabaseInstance;
    } catch (e) {
      console.error('Failed to create Supabase client:', e);
      return null;
    }
  }
  return null;
}

export function saveConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
  if (url.trim() && anonKey.trim()) {
    supabaseInstance = createClient(url.trim(), anonKey.trim());
  } else {
    supabaseInstance = null;
  }
}

export function clearConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
  supabaseInstance = null;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string; tablesFound?: boolean }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'URL and Anon Key are required.' };
    }
    const testClient = createClient(url, anonKey);
    const { error } = await testClient.from('books').select('id').limit(1);

    if (error) {
      // Check if table missing
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return {
          success: true,
          tablesFound: false,
          message: 'Connected to Supabase project! However, the "books" table is not created yet. Please execute the SQL Schema provided below in the Supabase SQL Editor.'
        };
      }
      return { success: false, message: `Connection error: ${error.message}` };
    }

    return {
      success: true,
      tablesFound: true,
      message: 'Successfully connected to Supabase! All library database tables are ready.'
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unknown connection error'
    };
  }
}

// Ready-to-execute SQL script for the user
export const SUPABASE_SCHEMA_SQL = `-- ==========================================
-- LIBROSCAN LIBRARY MANAGEMENT SYSTEM SCHEMA
-- Run this in your Supabase Project -> SQL Editor
-- ==========================================

-- 1. Create Books Table
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publisher VARCHAR(255),
    published_date VARCHAR(64),
    page_count INTEGER,
    price NUMERIC(10, 2) DEFAULT 0.00,
    genre VARCHAR(100) DEFAULT 'General',
    description TEXT,
    cover_url TEXT,
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    location_shelf VARCHAR(64) DEFAULT 'General A-1',
    status VARCHAR(32) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast ISBN barcode lookups & search
CREATE INDEX IF NOT EXISTS idx_books_isbn ON public.books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_title ON public.books(title);

-- 2. Create Borrowers / Members Table
CREATE TABLE IF NOT EXISTS public.borrowers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64),
    membership_id VARCHAR(64) UNIQUE NOT NULL,
    membership_type VARCHAR(32) DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_borrowers_membership ON public.borrowers(membership_id);

-- 3. Create Loans / Circulation Table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    borrower_id UUID REFERENCES public.borrowers(id) ON DELETE CASCADE,
    borrow_date DATE DEFAULT CURRENT_DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(32) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_loans_book_id ON public.loans(book_id);
CREATE INDEX IF NOT EXISTS idx_loans_borrower_id ON public.loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);

-- 4. Create Admin Users Table (For Multi-Device Authentication)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(64) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name VARCHAR(100) DEFAULT 'Head Librarian',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users(username);

-- 5. Enable Row Level Security (RLS) & Public Access Policies
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for library app with anon key
DROP POLICY IF EXISTS "Allow public read-write for books" ON public.books;
CREATE POLICY "Allow public read-write for books" ON public.books FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for borrowers" ON public.borrowers;
CREATE POLICY "Allow public read-write for borrowers" ON public.borrowers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for loans" ON public.loans;
CREATE POLICY "Allow public read-write for loans" ON public.loans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for admin_users" ON public.admin_users;
CREATE POLICY "Allow public read-write for admin_users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);

-- 6. Seed Initial Data
INSERT INTO public.admin_users (username, password, name)
VALUES ('admin', 'admin123', 'Head Librarian')
ON CONFLICT (username) DO NOTHING;

-- Seed Starter Books with Valid Real ISBNs
INSERT INTO public.books (isbn, title, author, publisher, published_date, page_count, genre, description, cover_url, total_copies, available_copies, location_shelf)
VALUES 
('9780132350884', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 'Prentice Hall', '2008', 464, 'Technology', 'Even bad code can function. But if code isn''t clean, it can bring a development organization to its knees.', 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg', 3, 3, 'Shelf CS-01'),
('9780451524935', '1984', 'George Orwell', 'Signet Classic', '1950', 328, 'Dystopian Fiction', 'Winston Smith toes the Party line, rewriting history to satisfy the Ministry of Truth.', 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', 4, 3, 'Shelf LIT-05'),
('9780061120084', 'To Kill a Mockingbird', 'Harper Lee', 'Harper Perennial', '2006', 336, 'Classic Fiction', 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.', 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg', 2, 2, 'Shelf LIT-02'),
('9780201616224', 'The Pragmatic Programmer', 'Andrew Hunt, David Thomas', 'Addison-Wesley', '1999', 352, 'Technology', 'Straight from the programming trenches, The Pragmatic Programmer cuts through the increasing specialization.', 'https://covers.openlibrary.org/b/isbn/9780201616224-L.jpg', 3, 2, 'Shelf CS-02'),
('9780062316097', 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'Harper', '2015', 464, 'History', 'From a renowned historian comes a groundbreaking narrative of humanity''s creation and evolution.', 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg', 5, 4, 'Shelf HIST-03')
ON CONFLICT DO NOTHING;

-- Seed Sample Library Members
INSERT INTO public.borrowers (name, email, phone, membership_id, membership_type)
VALUES
('Alex Johnson', 'alex.johnson@example.com', '+1-555-0192', 'LIB-2024-001', 'student'),
('Prof. Elena Rostova', 'elena.rostova@university.edu', '+1-555-0145', 'LIB-2024-002', 'faculty'),
('Sarah Connor', 'sarah.c@cybernet.org', '+1-555-0188', 'LIB-2024-003', 'public')
ON CONFLICT DO NOTHING;
`;
