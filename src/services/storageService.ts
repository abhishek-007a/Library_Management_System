import { Book, Borrower, Loan } from '../types';
import { getSupabase } from '../lib/supabase';

const BOOKS_KEY = 'libro_books_data';
const BORROWERS_KEY = 'libro_borrowers_data';
const LOANS_KEY = 'libro_loans_data';

const SAMPLE_BOOKS: Book[] = [
  {
    id: 'b1-00000000-0001',
    isbn: '9780132350884',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    publisher: 'Prentice Hall',
    published_date: '2008',
    page_count: 464,
    genre: 'Technology',
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost due to poorly written code.',
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
    total_copies: 3,
    available_copies: 2,
    location_shelf: 'Shelf CS-01',
    status: 'available',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'b1-00000000-0002',
    isbn: '9780451524935',
    title: '1984',
    author: 'George Orwell',
    publisher: 'Signet Classic',
    published_date: '1950',
    page_count: 328,
    genre: 'Dystopian Fiction',
    description: 'Winston Smith toes the Party line, rewriting history to satisfy the Ministry of Truth. With each lie he writes, he grows to hate the Party that yearns for power for its own sake.',
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
    total_copies: 4,
    available_copies: 3,
    location_shelf: 'Shelf LIT-05',
    status: 'available',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 'b1-00000000-0003',
    isbn: '9780061120084',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    publisher: 'Harper Perennial',
    published_date: '2006',
    page_count: 336,
    genre: 'Classic Fiction',
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, To Kill a Mockingbird became both an instant bestseller and a critical triumph.',
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg',
    total_copies: 2,
    available_copies: 2,
    location_shelf: 'Shelf LIT-02',
    status: 'available',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 'b1-00000000-0004',
    isbn: '9780201616224',
    title: 'The Pragmatic Programmer: From Journeyman to Master',
    author: 'Andrew Hunt, David Thomas',
    publisher: 'Addison-Wesley Professional',
    published_date: '1999',
    page_count: 352,
    genre: 'Technology',
    description: 'Straight from the programming trenches, The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development to examine the core process.',
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780201616224-L.jpg',
    total_copies: 3,
    available_copies: 2,
    location_shelf: 'Shelf CS-02',
    status: 'available',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'b1-00000000-0005',
    isbn: '9780062316097',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    publisher: 'Harper',
    published_date: '2015',
    page_count: 464,
    genre: 'History',
    description: 'One hundred thousand years ago, at least six human species inhabited the earth. Today there is just one. Us. Homo sapiens. How did our species succeed in the battle for dominance?',
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
    total_copies: 5,
    available_copies: 5,
    location_shelf: 'Shelf HIST-03',
    status: 'available',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

const SAMPLE_BORROWERS: Borrower[] = [
  {
    id: 'm1-00000000-0001',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1-555-0192',
    membership_id: 'LIB-2024-001',
    membership_type: 'student',
    active_loans_count: 1,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString()
  },
  {
    id: 'm1-00000000-0002',
    name: 'Prof. Elena Rostova',
    email: 'elena.rostova@university.edu',
    phone: '+1-555-0145',
    membership_id: 'LIB-2024-002',
    membership_type: 'faculty',
    active_loans_count: 1,
    created_at: new Date(Date.now() - 35 * 86400000).toISOString()
  },
  {
    id: 'm1-00000000-0003',
    name: 'Sarah Connor',
    email: 'sarah.c@cybernet.org',
    phone: '+1-555-0188',
    membership_id: 'LIB-2024-003',
    membership_type: 'public',
    active_loans_count: 0,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  }
];

const SAMPLE_LOANS: Loan[] = [
  {
    id: 'l1-00000000-0001',
    book_id: 'b1-00000000-0001',
    borrower_id: 'm1-00000000-0001',
    borrow_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    due_date: new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0],
    return_date: null,
    status: 'active',
    notes: 'Issued via barcode scanner at front desk'
  },
  {
    id: 'l1-00000000-0002',
    book_id: 'b1-00000000-0004',
    borrower_id: 'm1-00000000-0002',
    borrow_date: new Date(Date.now() - 18 * 86400000).toISOString().split('T')[0],
    due_date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    return_date: null,
    status: 'overdue',
    notes: 'Faculty loan period'
  }
];

class StorageService {
  private getLocal<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  }

  private setLocal<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Initial load helper
  initializeSampleDataIfNeeded() {
    if (!localStorage.getItem(BOOKS_KEY)) {
      this.setLocal(BOOKS_KEY, SAMPLE_BOOKS);
    }
    if (!localStorage.getItem(BORROWERS_KEY)) {
      this.setLocal(BORROWERS_KEY, SAMPLE_BORROWERS);
    }
    if (!localStorage.getItem(LOANS_KEY)) {
      this.setLocal(LOANS_KEY, SAMPLE_LOANS);
    }
  }

  // --- BOOKS ---
  async getBooks(): Promise<Book[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as Book[];
        }
      } catch (e) {
        console.warn('Supabase query failed, falling back to local storage:', e);
      }
    }
    return this.getLocal<Book[]>(BOOKS_KEY, SAMPLE_BOOKS);
  }

  async addBook(bookData: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<Book> {
    const supabase = getSupabase();
    const newBook: Book = {
      ...bookData,
      id: crypto.randomUUID ? crypto.randomUUID() : `b-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('books')
          .insert([bookData])
          .select()
          .single();

        if (!error && data) {
          // Also sync to local cache
          const localBooks = this.getLocal<Book[]>(BOOKS_KEY, SAMPLE_BOOKS);
          this.setLocal(BOOKS_KEY, [data as Book, ...localBooks]);
          return data as Book;
        } else {
          console.error('Supabase addBook error:', error);
        }
      } catch (e) {
        console.warn('Supabase addBook failed:', e);
      }
    }

    const localBooks = this.getLocal<Book[]>(BOOKS_KEY, SAMPLE_BOOKS);
    const updated = [newBook, ...localBooks];
    this.setLocal(BOOKS_KEY, updated);
    return newBook;
  }

  async updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('books')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return data as Book;
        }
      } catch (e) {
        console.warn('Supabase updateBook failed:', e);
      }
    }

    const localBooks = this.getLocal<Book[]>(BOOKS_KEY, SAMPLE_BOOKS);
    const index = localBooks.findIndex(b => b.id === id);
    if (index !== -1) {
      const updated = { ...localBooks[index], ...updates, updated_at: new Date().toISOString() };
      localBooks[index] = updated;
      this.setLocal(BOOKS_KEY, localBooks);
      return updated;
    }
    return null;
  }

  async deleteBook(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('books').delete().eq('id', id);
        if (!error) {
          const local = this.getLocal<Book[]>(BOOKS_KEY, SAMPLE_BOOKS).filter(b => b.id !== id);
          this.setLocal(BOOKS_KEY, local);
          return true;
        }
      } catch (e) {
        console.warn('Supabase deleteBook failed:', e);
      }
    }

    const local = this.getLocal<Book[]>(BOOKS_KEY, SAMPLE_BOOKS).filter(b => b.id !== id);
    this.setLocal(BOOKS_KEY, local);
    return true;
  }

  // --- BORROWERS ---
  async getBorrowers(): Promise<Borrower[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('borrowers')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data) {
          return data as Borrower[];
        }
      } catch (e) {
        console.warn('Supabase getBorrowers error:', e);
      }
    }
    return this.getLocal<Borrower[]>(BORROWERS_KEY, SAMPLE_BORROWERS);
  }

  async addBorrower(borrowerData: Omit<Borrower, 'id' | 'created_at'>): Promise<Borrower> {
    const supabase = getSupabase();
    const newBorrower: Borrower = {
      ...borrowerData,
      id: crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('borrowers')
          .insert([borrowerData])
          .select()
          .single();

        if (!error && data) {
          return data as Borrower;
        }
      } catch (e) {
        console.warn('Supabase addBorrower error:', e);
      }
    }

    const local = this.getLocal<Borrower[]>(BORROWERS_KEY, SAMPLE_BORROWERS);
    const updated = [newBorrower, ...local];
    this.setLocal(BORROWERS_KEY, updated);
    return newBorrower;
  }

  async deleteBorrower(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('borrowers').delete().eq('id', id);
        if (!error) {
          const local = this.getLocal<Borrower[]>(BORROWERS_KEY, SAMPLE_BORROWERS).filter(b => b.id !== id);
          this.setLocal(BORROWERS_KEY, local);
          return true;
        }
      } catch (e) {
        console.warn('Supabase deleteBorrower error:', e);
      }
    }

    const local = this.getLocal<Borrower[]>(BORROWERS_KEY, SAMPLE_BORROWERS).filter(b => b.id !== id);
    this.setLocal(BORROWERS_KEY, local);
    return true;
  }

  // --- CIRCULATION / LOANS ---
  async getLoans(): Promise<Loan[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('loans')
          .select('*, book:books(*), borrower:borrowers(*)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as Loan[];
        }
      } catch (e) {
        console.warn('Supabase getLoans error:', e);
      }
    }

    const localLoans = this.getLocal<Loan[]>(LOANS_KEY, SAMPLE_LOANS);
    const localBooks = this.getLocal<Book[]>(BOOKS_KEY, SAMPLE_BOOKS);
    const localBorrowers = this.getLocal<Borrower[]>(BORROWERS_KEY, SAMPLE_BORROWERS);

    return localLoans.map(loan => {
      const book = localBooks.find(b => b.id === loan.book_id);
      const borrower = localBorrowers.find(m => m.id === loan.borrower_id);
      
      // Auto-calculate overdue if past due_date and still active
      let status = loan.status;
      if (status === 'active' && new Date(loan.due_date) < new Date()) {
        status = 'overdue';
      }

      return {
        ...loan,
        status,
        book,
        borrower
      };
    });
  }

  async borrowBook(bookId: string, borrowerId: string, dueDateDays = 14, notes = ''): Promise<Loan> {
    const borrowDate = new Date().toISOString().split('T')[0];
    const due = new Date();
    due.setDate(due.getDate() + dueDateDays);
    const dueDate = due.toISOString().split('T')[0];

    const loanPayload = {
      book_id: bookId,
      borrower_id: borrowerId,
      borrow_date: borrowDate,
      due_date: dueDate,
      status: 'active' as const,
      notes
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('loans')
          .insert([loanPayload])
          .select('*, book:books(*), borrower:borrowers(*)')
          .single();

        if (!error && data) {
          // Decrement available copies
          const { data: book } = await supabase.from('books').select('available_copies').eq('id', bookId).single();
          if (book && book.available_copies > 0) {
            await supabase.from('books').update({ 
              available_copies: book.available_copies - 1,
              status: book.available_copies - 1 === 0 ? 'borrowed' : 'available'
            }).eq('id', bookId);
          }
          return data as Loan;
        }
      } catch (e) {
        console.warn('Supabase borrowBook error:', e);
      }
    }

    // Local fallback
    const localLoans = this.getLocal<Loan[]>(LOANS_KEY, SAMPLE_LOANS);
    const localBooks = this.getLocal<Book[]>(BOOKS_KEY, SAMPLE_BOOKS);
    const localBorrowers = this.getLocal<Borrower[]>(BORROWERS_KEY, SAMPLE_BORROWERS);

    const newLoan: Loan = {
      id: crypto.randomUUID ? crypto.randomUUID() : `l-${Date.now()}`,
      ...loanPayload,
      book: localBooks.find(b => b.id === bookId),
      borrower: localBorrowers.find(m => m.id === borrowerId),
      created_at: new Date().toISOString()
    };

    // Decrement available copies in book
    const bookIndex = localBooks.findIndex(b => b.id === bookId);
    if (bookIndex !== -1 && localBooks[bookIndex].available_copies > 0) {
      const avail = localBooks[bookIndex].available_copies - 1;
      localBooks[bookIndex].available_copies = avail;
      localBooks[bookIndex].status = avail === 0 ? 'borrowed' : 'available';
      this.setLocal(BOOKS_KEY, localBooks);
    }

    this.setLocal(LOANS_KEY, [newLoan, ...localLoans]);
    return newLoan;
  }

  async returnBook(loanId: string): Promise<boolean> {
    const returnDate = new Date().toISOString().split('T')[0];
    const supabase = getSupabase();

    if (supabase) {
      try {
        // Fetch loan to get book_id
        const { data: loan } = await supabase.from('loans').select('book_id').eq('id', loanId).single();
        const { error } = await supabase
          .from('loans')
          .update({ return_date: returnDate, status: 'returned' })
          .eq('id', loanId);

        if (!error && loan) {
          // Increment book available copies
          const { data: book } = await supabase.from('books').select('available_copies, total_copies').eq('id', loan.book_id).single();
          if (book) {
            const avail = Math.min(book.total_copies, book.available_copies + 1);
            await supabase.from('books').update({ 
              available_copies: avail,
              status: 'available'
            }).eq('id', loan.book_id);
          }
          return true;
        }
      } catch (e) {
        console.warn('Supabase returnBook error:', e);
      }
    }

    // Local storage return
    const localLoans = this.getLocal<Loan[]>(LOANS_KEY, SAMPLE_LOANS);
    const loanIndex = localLoans.findIndex(l => l.id === loanId);
    if (loanIndex !== -1) {
      const bookId = localLoans[loanIndex].book_id;
      localLoans[loanIndex].return_date = returnDate;
      localLoans[loanIndex].status = 'returned';
      this.setLocal(LOANS_KEY, localLoans);

      // Increment available copies in book
      const localBooks = this.getLocal<Book[]>(BOOKS_KEY, SAMPLE_BOOKS);
      const bookIndex = localBooks.findIndex(b => b.id === bookId);
      if (bookIndex !== -1) {
        const avail = Math.min(localBooks[bookIndex].total_copies, localBooks[bookIndex].available_copies + 1);
        localBooks[bookIndex].available_copies = avail;
        localBooks[bookIndex].status = 'available';
        this.setLocal(BOOKS_KEY, localBooks);
      }
      return true;
    }
    return false;
  }

  // Bulk sync local sample/added books into Supabase
  async syncLocalToSupabase(): Promise<{ booksInserted: number; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const localBooks = this.getLocal<Book[]>(BOOKS_KEY, SAMPLE_BOOKS);
    const cleanBooks = localBooks.map(b => ({
      isbn: b.isbn,
      title: b.title,
      author: b.author,
      publisher: b.publisher || null,
      published_date: b.published_date || null,
      page_count: b.page_count || null,
      genre: b.genre || 'General',
      description: b.description || '',
      cover_url: b.cover_url || '',
      total_copies: b.total_copies || 1,
      available_copies: b.available_copies || 1,
      location_shelf: b.location_shelf || 'Shelf A-1',
      status: b.status || 'available'
    }));

    const { data, error } = await supabase.from('books').upsert(cleanBooks, { onConflict: 'isbn' }).select();
    if (error) {
      throw new Error(error.message);
    }
    return { booksInserted: data ? data.length : cleanBooks.length };
  }

  resetLocalData() {
    this.setLocal(BOOKS_KEY, SAMPLE_BOOKS);
    this.setLocal(BORROWERS_KEY, SAMPLE_BORROWERS);
    this.setLocal(LOANS_KEY, SAMPLE_LOANS);
  }
}

export const storageService = new StorageService();
storageService.initializeSampleDataIfNeeded();
