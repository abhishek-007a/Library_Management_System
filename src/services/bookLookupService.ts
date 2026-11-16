import { BookFetchResult } from '../types';

export function cleanISBN(raw: string): string {
  // Strip whitespace, hyphens, prefixes like "ISBN" or "ISBN-13:"
  return raw.replace(/^(ISBN[-:]*)/i, '').replace(/[^0-9X]/gi, '').trim();
}

export function isValidISBN(isbn: string): boolean {
  const clean = cleanISBN(isbn);
  return clean.length === 10 || clean.length === 13;
}

export async function fetchBookByISBN(isbnInput: string): Promise<BookFetchResult> {
  const isbn = cleanISBN(isbnInput);
  if (!isbn) {
    throw new Error('Please enter a valid ISBN code.');
  }

  // Attempt 1: Open Library API (Data API + Books API)
  try {
    const openLibRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`);
    if (openLibRes.ok) {
      const data = await openLibRes.json();
      const bookData = data[`ISBN:${isbn}`];

      if (bookData && bookData.title) {
        const authors = bookData.authors?.map((a: { name: string }) => a.name).join(', ') || 'Unknown Author';
        const publisher = bookData.publishers?.map((p: { name: string }) => p.name).join(', ') || '';
        const publishedDate = bookData.publish_date || '';
        const pageCount = bookData.number_of_pages || undefined;
        const genres = bookData.subjects?.slice(0, 3).map((s: { name: string }) => s.name).join(', ') || 'General';
        
        let coverUrl = '';
        if (bookData.cover?.large) {
          coverUrl = bookData.cover.large;
        } else if (bookData.cover?.medium) {
          coverUrl = bookData.cover.medium;
        } else {
          coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
        }

        let description = '';
        if (typeof bookData.notes === 'string') {
          description = bookData.notes;
        } else if (bookData.subtitle) {
          description = bookData.subtitle;
        }

        return {
          title: bookData.title,
          author: authors,
          publisher,
          published_date: publishedDate,
          page_count: pageCount,
          genre: genres,
          description,
          cover_url: coverUrl,
          isbn,
          source: 'openlibrary'
        };
      }
    }
  } catch (err) {
    console.warn('OpenLibrary fetch failed or timed out, trying Google Books fallback...', err);
  }

  // Attempt 2: Google Books API fallback
  try {
    const gbooksRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    if (gbooksRes.ok) {
      const gdata = await gbooksRes.json();
      if (gdata.items && gdata.items.length > 0) {
        const volume = gdata.items[0].volumeInfo;
        const authors = volume.authors?.join(', ') || 'Unknown Author';
        const publisher = volume.publisher || '';
        const publishedDate = volume.publishedDate || '';
        const pageCount = volume.pageCount || undefined;
        const genres = volume.categories?.join(', ') || 'General';
        const coverUrl = volume.imageLinks?.thumbnail?.replace('http://', 'https://') || 
                         `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
        const description = volume.description || volume.subtitle || '';

        return {
          title: volume.title,
          author: authors,
          publisher,
          published_date: publishedDate,
          page_count: pageCount,
          genre: genres,
          description,
          cover_url: coverUrl,
          isbn,
          source: 'googlebooks'
        };
      }
    }
  } catch (err) {
    console.warn('Google Books fallback failed', err);
  }

  throw new Error(`Book with ISBN "${isbn}" not found in Open Library or Google Books. You can enter details manually below!`);
}
