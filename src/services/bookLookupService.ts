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

  // Attempt 1: Open Library Data API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const openLibRes = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

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
    console.warn('OpenLibrary data fetch failed or timed out:', err);
  }

  // Attempt 2: Open Library Search API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const searchRes = await fetch(
      `https://openlibrary.org/search.json?q=isbn:${isbn}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (searchRes.ok) {
      const sdata = await searchRes.json();
      if (sdata.docs && sdata.docs.length > 0) {
        const doc = sdata.docs[0];
        const title = doc.title;
        const authors = doc.author_name?.join(', ') || 'Unknown Author';
        const publisher = doc.publisher?.[0] || '';
        const publishedDate = doc.first_publish_year ? String(doc.first_publish_year) : '';
        const pageCount = doc.number_of_pages_median || undefined;
        const coverUrl = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

        if (title) {
          return {
            title,
            author: authors,
            publisher,
            published_date: publishedDate,
            page_count: pageCount,
            genre: doc.subject?.slice(0, 2).join(', ') || 'General',
            description: '',
            cover_url: coverUrl,
            isbn,
            source: 'openlibrary_search'
          };
        }
      }
    }
  } catch (err) {
    console.warn('OpenLibrary search API failed or timed out:', err);
  }

  // Attempt 3: Google Books API fallback
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const gbooksRes = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

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
