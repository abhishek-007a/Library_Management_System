import { BookFetchResult } from '../types';
import { findMalayalamBook } from '../data/popularMalayalamBooks';

export function cleanISBN(raw: string): string {
  // Strip whitespace, hyphens, prefixes like "ISBN" or "ISBN-13:"
  return raw.replace(/^(ISBN[-:]*)/i, '').replace(/[^0-9X]/gi, '').trim();
}

export function isValidISBN(isbn: string): boolean {
  const clean = cleanISBN(isbn);
  return clean.length === 10 || clean.length === 13;
}

/**
 * Checks whether two ISBN strings refer to the same book.
 * Handles:
 * - Differences in formatting, whitespace, hyphens, prefixes
 * - Case-insensitivity (for trailing check-digit 'X')
 * - Equivalence between ISBN-10 and ISBN-13 (EAN-13 starting with 978 sharing same 9 core digits)
 */
export function isSameIsbn(isbnA: string | undefined | null, isbnB: string | undefined | null): boolean {
  if (!isbnA || !isbnB) return false;
  const a = cleanISBN(isbnA).toUpperCase();
  const b = cleanISBN(isbnB).toUpperCase();
  if (!a || !b) return false;
  if (a === b) return true;

  // ISBN-13 (starts with 978) <-> ISBN-10 comparison:
  // ISBN-13 digits 3..11 (9 digits) correspond to ISBN-10 digits 0..8
  if (a.length === 13 && a.startsWith('978') && b.length === 10) {
    if (a.substring(3, 12) === b.substring(0, 9)) return true;
  }
  if (b.length === 13 && b.startsWith('978') && a.length === 10) {
    if (b.substring(3, 12) === a.substring(0, 9)) return true;
  }

  // Fallback: Check if one core string matches the other (for regional variants)
  if (a.length >= 8 && b.length >= 8) {
    const coreA = a.replace(/^978|^979/, '');
    const coreB = b.replace(/^978|^979/, '');
    if (coreA.slice(0, 8) === coreB.slice(0, 8)) return true;
  }

  return false;
}

export function getGoogleBookSearchUrl(isbnOrQuery: string): string {
  const clean = cleanISBN(isbnOrQuery) || isbnOrQuery.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(clean + ' malayalam book')}`;
}

/**
 * Parses raw text copied from Google search results, online stores, or reviews
 * into Title, Author, and Publisher automatically.
 */
export function parseBookSnippet(raw: string): { title: string; author: string; publisher: string } {
  if (!raw) return { title: '', author: '', publisher: '' };
  const cleaned = raw
    .replace(/https?:\/\/\S+/g, '')
    .replace(/ISBN[-:\s]*[0-9Xx]+/gi, '')
    .replace(/\s*\|\s*Amazon(\.in)?/gi, '')
    .replace(/\s*\|\s*Flipkart/gi, '')
    .replace(/\s*\|\s*Goodreads/gi, '')
    .replace(/\s*\|\s*DC Books/gi, ' - DC Books')
    .replace(/(\(.*Edition.*\))/gi, '')
    .trim();

  let parts: string[] = [];
  if (cleaned.includes(' - ')) {
    parts = cleaned.split(' - ');
  } else if (cleaned.includes(' | ')) {
    parts = cleaned.split(' | ');
  } else if (cleaned.includes(' : ')) {
    parts = cleaned.split(' : ');
  } else if (/ \bby\b /i.test(cleaned)) {
    parts = cleaned.split(/ \bby\b /i);
  } else {
    parts = [cleaned];
  }

  parts = parts.map(p => p.trim()).filter(Boolean);

  let title = parts[0] || '';
  let author = parts[1] || '';
  let publisher = parts[2] || '';

  const knownPubs = ['DC Books', 'Mathrubhumi Books', 'Current Books', 'Green Books', 'Olive', 'H&C', 'NBS', 'Prabhath', 'Chintha'];
  if (author && knownPubs.some(p => author.toLowerCase().includes(p.toLowerCase()))) {
    publisher = author;
    author = '';
  }

  return { title, author, publisher };
}

/**
 * Searches Malayalam Wikipedia (ml.wikipedia.org) for book details,
 * official Malayalam spelling, author, description, and cover image.
 */
export async function searchMalayalamWikipedia(query: string): Promise<Partial<BookFetchResult> | null> {
  const cleanQ = query.trim();
  if (!cleanQ) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const searchUrl = `https://ml.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQ)}&utf8=&format=json&origin=*`;
    const res = await fetch(searchUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const hit = data.query?.search?.[0];
    if (!hit || !hit.title) return null;

    const summaryUrl = `https://ml.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`;
    const sumController = new AbortController();
    const sumTimeout = setTimeout(() => sumController.abort(), 4000);
    const sumRes = await fetch(summaryUrl, { signal: sumController.signal });
    clearTimeout(sumTimeout);

    if (!sumRes.ok) return null;
    const sumData = await sumRes.json();

    let author = '';
    if (sumData.description) {
      author = sumData.description
        .replace(/ന്റെ നോവൽ|ന്റെ കൃതി|രചിച്ച നോവൽ|എഴുതിയ പുസ്തകം|നോവൽ|പുസ്തകം/g, '')
        .trim();
    }
    if (!author && sumData.extract) {
      const match = sumData.extract.match(/^([^.]+?)(?:രചിച്ച|എഴുതിയ|രചന)/);
      if (match && match[1]) {
        author = match[1].trim();
      }
    }

    return {
      title: sumData.title || cleanQ,
      author: author || undefined,
      description: sumData.extract || undefined,
      cover_url: sumData.thumbnail?.source || undefined,
      genre: 'Malayalam Literature (സാഹിത്യം)'
    };
  } catch (err) {
    console.warn('Malayalam Wikipedia lookup error:', err);
    return null;
  }
}

export async function fetchBookByISBN(isbnInput: string): Promise<BookFetchResult> {
  const isbn = cleanISBN(isbnInput);
  if (!isbn) {
    throw new Error('Please enter a valid ISBN code.');
  }

  // Attempt 1: Popular Malayalam Books (Goodreads collection)
  const malayalamMatch = findMalayalamBook(isbn);
  if (malayalamMatch) {
    return {
      title: malayalamMatch.title,
      author: malayalamMatch.author,
      publisher: malayalamMatch.publisher,
      published_date: malayalamMatch.publishedDate || '',
      genre: malayalamMatch.genre,
      description: malayalamMatch.description,
      cover_url: malayalamMatch.coverUrl,
      isbn,
      source: 'goodreads_malayalam'
    };
  }

  // Attempt 2: Direct Open Library Edition API (has rich Library of Congress records for DC Books, NBS, etc.)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const editionRes = await fetch(`https://openlibrary.org/isbn/${isbn}.json`, { signal: controller.signal });
    clearTimeout(timeout);

    if (editionRes.ok) {
      const ed = await editionRes.json();
      if (ed && ed.title) {
        let author = '';
        if (ed.by_statement) {
          author = ed.by_statement.replace(/^[;,.\s]+|[;,.\s]+$/g, '');
        } else if (ed.authors && ed.authors.length > 0 && ed.authors[0].key) {
          try {
            const aRes = await fetch(`https://openlibrary.org${ed.authors[0].key}.json`);
            if (aRes.ok) {
              const aData = await aRes.json();
              if (aData.name) author = aData.name;
            }
          } catch {
            // ignore author fetch error
          }
        }

        const publisher = ed.publishers?.join(', ') || '';
        const publishedDate = ed.publish_date || '';
        const pageCount = ed.number_of_pages || undefined;
        const coverUrl = ed.covers && ed.covers.length > 0
          ? `https://covers.openlibrary.org/b/id/${ed.covers[0]}-L.jpg`
          : `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

        let description = '';
        if (typeof ed.notes === 'string') description = ed.notes;
        else if (ed.notes?.value) description = ed.notes.value;
        else if (ed.subtitle) description = ed.subtitle;

        return {
          title: ed.title,
          author: author || 'Unknown Author',
          publisher,
          published_date: publishedDate,
          page_count: pageCount,
          genre: ed.subjects?.slice(0, 2).join(', ') || (ed.subtitle?.toLowerCase().includes('nov') || ed.subtitle?.toLowerCase().includes('nōv') ? 'Novel (നോവൽ)' : 'General'),
          description,
          cover_url: coverUrl,
          isbn,
          source: 'openlibrary'
        };
      }
    }
  } catch (err) {
    console.warn('Direct Open Library edition fetch error:', err);
  }

  // Attempt 3: Open Library Data API
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

  // Attempt 5: Google Books API fallback (supports optional API key if available)
  try {
    const apiKey = typeof window !== 'undefined'
      ? (localStorage.getItem('libroscan_google_api_key') || (import.meta as any).env?.VITE_GOOGLE_BOOKS_API_KEY || '')
      : '';
    const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const gbooksRes = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${keyParam}`,
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
