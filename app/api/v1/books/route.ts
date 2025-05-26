import { NextRequest, NextResponse } from 'next/server';
import { books, incrementBookId } from '../lib/data';
import { validateBook } from '../lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let filteredBooks = [...books];

    // Apply filters
    const seriesId = searchParams.get('series_id');
    if (seriesId) {
      filteredBooks = filteredBooks.filter(book => book.series_id === parseInt(seriesId));
    }

    const status = searchParams.get('status');
    if (status) {
      filteredBooks = filteredBooks.filter(book => book.status === status);
    }

    const publicationYear = searchParams.get('publication_year');
    if (publicationYear) {
      filteredBooks = filteredBooks.filter(book => book.publication_year === parseInt(publicationYear));
    }

    return NextResponse.json(filteredBooks, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch {
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const validationErrors = validateBook(data);
    if (validationErrors) {
      return NextResponse.json(
        {
          type: "https://example.com/validation-error",
          title: "Validation failed",
          status: 422,
          errors: validationErrors
        },
        { status: 422 }
      );
    }

    const now = new Date().toISOString();
    const newBook = {
      id: incrementBookId(),
      title: data.title,
      author: data.author,
      isbn_10: data.isbn_10 || null,
      isbn_13: data.isbn_13 || null,
      publication_year: data.publication_year || null,
      publisher: data.publisher || null,
      page_count: data.page_count || null,
      description: data.description || null,
      cover_image_url: data.cover_image_url || null,
      open_library_id: data.open_library_id || null,
      series_id: data.series_id || null,
      status: data.status || 'planning',
      rating: data.rating || null,
      comments: data.comments || null,
      book_type: data.book_type || null,
      date_added: data.date_added || now,
      date_started: data.date_started || null,
      date_finished: data.date_finished || null,
      created_at: now,
      updated_at: now
    };

    books.push(newBook);

    return NextResponse.json(newBook, {
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch {
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