import { Book, Borrower, Loan } from '../types';
import { getSupabase } from '../lib/supabase';

const BOOKS_KEY = 'libro_books_data';
const BORROWERS_KEY = 'libro_borrowers_data';
const LOANS_KEY = 'libro_loans_data';

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

  // Purge any legacy sample books that were automatically seeded
  initializeSampleDataIfNeeded() {
    try {
      const rawBooks = localStorage.getItem(BOOKS_KEY);
      if (rawBooks) {
        const books: Book[] = JSON.parse(rawBooks);
        const filtered = books.filter(b => !b.id.startsWith('b1-00000000-'));
        localStorage.setItem(BOOKS_KEY, JSON.stringify(filtered));
      }
      const rawLoans = localStorage.getItem(LOANS_KEY);
      if (rawLoans) {
        const loans: Loan[] = JSON.parse(rawLoans);
        const filtered = loans.filter(l => !l.id.startsWith('l1-00000000-'));
        localStorage.setItem(LOANS_KEY, JSON.stringify(filtered));
      }
      const rawMembers = localStorage.getItem(BORROWERS_KEY);
      if (rawMembers) {
        const members: Borrower[] = JSON.parse(rawMembers);
        const filtered = members.filter(m => !m.id.startsWith('m1-00000000-'));
        localStorage.setItem(BORROWERS_KEY, JSON.stringify(filtered));
      }
    } catch {
      // Ignore
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
          // Mirror database to local cache as source of truth
          this.setLocal(BOOKS_KEY, data as Book[]);
          return data as Book[];
        }
        if (error) {
          console.error('Supabase getBooks error:', error);
        }
      } catch (e) {
        console.warn('Supabase query failed, falling back to local storage:', e);
      }
    }
    const local = this.getLocal<Book[]>(BOOKS_KEY, []);
    return local.filter(b => !b.id.startsWith('b1-00000000-'));
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
          // Sync to local cache
          const localBooks = this.getLocal<Book[]>(BOOKS_KEY, []);
          this.setLocal(BOOKS_KEY, [data as Book, ...localBooks.filter(b => b.id !== (data as Book).id)]);
          return data as Book;
        } else if (error) {
          console.error('Supabase addBook error:', error);
          throw new Error(`Database error: ${error.message}`);
        }
      } catch (e) {
        console.error('Supabase addBook failed:', e);
        throw e;
      }
    }

    const localBooks = this.getLocal<Book[]>(BOOKS_KEY, []);
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
          const localBooks = this.getLocal<Book[]>(BOOKS_KEY, []);
          this.setLocal(BOOKS_KEY, localBooks.map(b => b.id === id ? (data as Book) : b));
          return data as Book;
        } else if (error) {
          console.error('Supabase updateBook error:', error);
          throw new Error(`Database update error: ${error.message}`);
        }
      } catch (e) {
        console.error('Supabase updateBook failed:', e);
        throw e;
      }
    }

    const localBooks = this.getLocal<Book[]>(BOOKS_KEY, []);
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
          const local = this.getLocal<Book[]>(BOOKS_KEY, []).filter(b => b.id !== id);
          this.setLocal(BOOKS_KEY, local);
          return true;
        } else {
          console.error('Supabase deleteBook error:', error);
          throw new Error(`Database delete error: ${error.message}`);
        }
      } catch (e) {
        console.error('Supabase deleteBook failed:', e);
        throw e;
      }
    }

    const local = this.getLocal<Book[]>(BOOKS_KEY, []).filter(b => b.id !== id);
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
          this.setLocal(BORROWERS_KEY, data as Borrower[]);
          return data as Borrower[];
        }
      } catch (e) {
        console.warn('Supabase getBorrowers error:', e);
      }
    }
    const local = this.getLocal<Borrower[]>(BORROWERS_KEY, []);
    return local.filter(m => !m.id.startsWith('m1-00000000-'));
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

    const local = this.getLocal<Borrower[]>(BORROWERS_KEY, []);
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
          const local = this.getLocal<Borrower[]>(BORROWERS_KEY, []).filter(b => b.id !== id);
          this.setLocal(BORROWERS_KEY, local);
          return true;
        }
      } catch (e) {
        console.warn('Supabase deleteBorrower error:', e);
      }
    }

    const local = this.getLocal<Borrower[]>(BORROWERS_KEY, []).filter(b => b.id !== id);
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
          this.setLocal(LOANS_KEY, data as Loan[]);
          return data as Loan[];
        }
      } catch (e) {
        console.warn('Supabase getLoans error:', e);
      }
    }

    const localLoans = this.getLocal<Loan[]>(LOANS_KEY, []).filter(l => !l.id.startsWith('l1-00000000-'));
    const localBooks = this.getLocal<Book[]>(BOOKS_KEY, []).filter(b => !b.id.startsWith('b1-00000000-'));
    const localBorrowers = this.getLocal<Borrower[]>(BORROWERS_KEY, []).filter(m => !m.id.startsWith('m1-00000000-'));

    return localLoans.map(loan => {
      const book = localBooks.find(b => b.id === loan.book_id);
      const borrower = localBorrowers.find(m => m.id === loan.borrower_id);
      
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

  async borrowBook(bookId: string, borrowerNameOrId: string, dueDateDays = 14, notes = ''): Promise<Loan> {
    let borrowerId = borrowerNameOrId;
    const existingBorrowers = await this.getBorrowers();
    let matched = existingBorrowers.find(
      b => b.id === borrowerNameOrId || b.name.toLowerCase() === borrowerNameOrId.trim().toLowerCase()
    );

    if (!matched) {
      matched = await this.addBorrower({
        name: borrowerNameOrId.trim(),
        email: `${borrowerNameOrId.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'member'}@library.local`,
        phone: '',
        membership_id: `LIB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        membership_type: 'student'
      });
    }
    borrowerId = matched.id;

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

    // Local Storage Fallback
    const localLoan: Loan = {
      id: crypto.randomUUID ? crypto.randomUUID() : `l-${Date.now()}`,
      ...loanPayload,
      created_at: new Date().toISOString()
    };
    const localLoans = this.getLocal<Loan[]>(LOANS_KEY, []);
    this.setLocal(LOANS_KEY, [localLoan, ...localLoans]);

    const localBooks = this.getLocal<Book[]>(BOOKS_KEY, []);
    const bookIndex = localBooks.findIndex(b => b.id === bookId);
    if (bookIndex !== -1) {
      const avail = Math.max(0, localBooks[bookIndex].available_copies - 1);
      localBooks[bookIndex].available_copies = avail;
      localBooks[bookIndex].status = avail === 0 ? 'borrowed' : 'available';
      this.setLocal(BOOKS_KEY, localBooks);
    }

    return localLoan;
  }

  async returnBook(loanId: string): Promise<boolean> {
    const returnDate = new Date().toISOString().split('T')[0];
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data: loan, error } = await supabase
          .from('loans')
          .update({
            return_date: returnDate,
            status: 'returned'
          })
          .eq('id', loanId)
          .select()
          .single();

        if (!error && loan) {
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
    const localLoans = this.getLocal<Loan[]>(LOANS_KEY, []);
    const loanIndex = localLoans.findIndex(l => l.id === loanId);
    if (loanIndex !== -1) {
      const bookId = localLoans[loanIndex].book_id;
      localLoans[loanIndex].return_date = returnDate;
      localLoans[loanIndex].status = 'returned';
      this.setLocal(LOANS_KEY, localLoans);

      const localBooks = this.getLocal<Book[]>(BOOKS_KEY, []);
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

  async syncLocalToSupabase(): Promise<{ booksInserted: number; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const localBooks = this.getLocal<Book[]>(BOOKS_KEY, []).filter(b => !b.id.startsWith('b1-00000000-'));
    if (localBooks.length === 0) {
      return { booksInserted: 0 };
    }

    const cleanBooks = localBooks.map(b => ({
      isbn: b.isbn,
      title: b.title,
      author: b.author,
      publisher: b.publisher || null,
      published_date: b.published_date || null,
      page_count: b.page_count || null,
      price: b.price || 0,
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
    this.setLocal(BOOKS_KEY, []);
    this.setLocal(BORROWERS_KEY, []);
    this.setLocal(LOANS_KEY, []);
  }
}

export const storageService = new StorageService();
storageService.initializeSampleDataIfNeeded();
