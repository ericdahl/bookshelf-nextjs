import { NextRequest, NextResponse } from 'next/server';
import logger from '../../lib/logger';

interface OpenLibrarySearchResult {
  docs: Array<{
    key: string;
    title: string;
    author_name?: string[];
    isbn?: string[];
    publish_year?: number[];
    publisher?: string[];
    number_of_pages_median?: number;
    first_sentence?: string[];
    cover_i?: number;
    edition_count?: number;
    language?: string[];
  }>;
  numFound: number;
  start: number;
}

interface SearchableBook {
  title: string;
  author: string;
  isbn_10: string | null;
  isbn_13: string | null;
  publication_year: number | null;
  publisher: string | null;
  page_count: number | null;
  description: string | null;
  cover_image_url: string | null;
  open_library_id: string | null;
  // These fields will be set to defaults for search results
  series_id: null;
  status: 'planning';
  rating: null;
  comments: null;
  book_type: null;
  date_added: string;
  date_started: null;
  date_finished: null;
}

function parseSearchQuery(query: string): { freeText: string; filters: Record<string, string> } {
  const filters: Record<string, string> = {};
  let freeText = query;

  // Extract keyword filters like "author:Sanderson title:Oathbreaker"
  const keywordPattern = /(\w+):([^\s]+)/g;
  let match;

  while ((match = keywordPattern.exec(query)) !== null) {
    const [fullMatch, key, value] = match;
    filters[key.toLowerCase()] = value;
    freeText = freeText.replace(fullMatch, '').trim();
  }

  // Clean up extra spaces
  freeText = freeText.replace(/\s+/g, ' ').trim();

  return { freeText, filters };
}

function buildOpenLibraryQuery(freeText: string, filters: Record<string, string>): string {
  const queryParts: string[] = [];

  // Add keyword-specific filters
  if (filters.author) {
    queryParts.push(`author:"${filters.author}"`);
  }
  if (filters.title) {
    queryParts.push(`title:"${filters.title}"`);
  }
  if (filters.isbn) {
    queryParts.push(`isbn:${filters.isbn}`);
  }
  if (filters.publisher) {
    queryParts.push(`publisher:"${filters.publisher}"`);
  }
  if (filters.year) {
    queryParts.push(`publish_year:${filters.year}`);
  }

  // Add free text search if present
  if (freeText) {
    queryParts.push(freeText);
  }

  return queryParts.join(' AND ');
}

function transformOpenLibraryResult(doc: OpenLibrarySearchResult['docs'][0]): SearchableBook {
  const now = new Date().toISOString();
  
  // Extract ISBNs and separate ISBN-10 and ISBN-13
  let isbn_10: string | null = null;
  let isbn_13: string | null = null;
  
  if (doc.isbn) {
    for (const isbn of doc.isbn) {
      const cleanIsbn = isbn.replace(/[-\s]/g, '');
      if (cleanIsbn.length === 10 && !isbn_10) {
        isbn_10 = cleanIsbn;
      } else if (cleanIsbn.length === 13 && !isbn_13) {
        isbn_13 = cleanIsbn;
      }
    }
  }

  // Get the most recent publication year
  const publication_year = doc.publish_year && doc.publish_year.length > 0 
    ? Math.max(...doc.publish_year) 
    : null;

  // Get the first author
  const author = doc.author_name && doc.author_name.length > 0 
    ? doc.author_name[0] 
    : 'Unknown Author';

  // Get the first publisher
  const publisher = doc.publisher && doc.publisher.length > 0 
    ? doc.publisher[0] 
    : null;

  // Build cover image URL if cover_i is available
  const cover_image_url = doc.cover_i 
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
    : null;

  // Extract Open Library ID from key
  const open_library_id = doc.key ? doc.key.replace('/works/', '') : null;

  // Get description from first sentence
  const description = doc.first_sentence && doc.first_sentence.length > 0
    ? doc.first_sentence[0]
    : null;

  return {
    title: doc.title || 'Unknown Title',
    author,
    isbn_10,
    isbn_13,
    publication_year,
    publisher,
    page_count: doc.number_of_pages_median || null,
    description,
    cover_image_url,
    open_library_id,
    series_id: null,
    status: 'planning',
    rating: null,
    comments: null,
    book_type: null,
    date_added: now,
    date_started: null,
    date_finished: null
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query) {
      return NextResponse.json(
        {
          type: "https://example.com/validation-error",
          title: "Validation failed",
          status: 400,
          errors: {
            q: ["Search query is required"]
          }
        },
        { status: 400 }
      );
    }

    // Parse the search query
    const { freeText, filters } = parseSearchQuery(query);
    const openLibraryQuery = buildOpenLibraryQuery(freeText, filters);

    // Build OpenLibrary API URL
    const openLibraryUrl = new URL('https://openlibrary.org/search.json');
    openLibraryUrl.searchParams.set('q', openLibraryQuery);
    openLibraryUrl.searchParams.set('limit', Math.min(limit, 100).toString()); // Cap at 100
    openLibraryUrl.searchParams.set('offset', offset.toString());
    openLibraryUrl.searchParams.set('fields', 'key,title,author_name,isbn,publish_year,publisher,number_of_pages_median,first_sentence,cover_i');

    logger.info('Outgoing OpenLibrary API call', {
      url: openLibraryUrl.toString(),
      query,
      openLibraryQuery,
      limit,
      offset
    });
    const start = Date.now();
    // Make request to OpenLibrary API
    const response = await fetch(openLibraryUrl.toString(), {
      headers: {
        'User-Agent': 'Bookshelf-NextJS/1.0 (https://github.com/user/bookshelf-nextjs)'
      }
    });
    const duration = Date.now() - start;
    logger.info('OpenLibrary API call completed', {
      url: openLibraryUrl.toString(),
      status: response.status,
      durationMs: duration
    });

    if (!response.ok) {
      logger.error('OpenLibrary API error', {
        url: openLibraryUrl.toString(),
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`OpenLibrary API error: ${response.status}`);
    }

    const data: OpenLibrarySearchResult = await response.json();

    // Transform results to match our book format
    const searchResults = data.docs.map(transformOpenLibraryResult);

    return NextResponse.json({
      results: searchResults,
      total: data.numFound,
      offset: data.start,
      limit: searchResults.length
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

  } catch (error) {
    logger.error('Search API error', { error });
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        type: "https://example.com/server-error",
        title: "Internal server error",
        status: 500
      },
      { status: 500 }
    );
  }
} 