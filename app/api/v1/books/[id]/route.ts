import { NextRequest, NextResponse } from 'next/server';
import { books } from '../../lib/data';
import { validateBook } from '../../lib/validation';
import logger from '../../lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    logger.info('Book GET request', { id: parsedId });
    const book = books.find(b => b.id === parsedId);

    if (!book) {
      logger.warn('Book not found', { id: parsedId });
      return NextResponse.json(
        {
          type: "https://example.com/not-found",
          title: "Book not found",
          status: 404
        },
        { status: 404 }
      );
    }

    return NextResponse.json(book, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    logger.error('Book GET error', { error });
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    logger.info('Book PUT request', { id: parsedId });
    const bookIndex = books.findIndex(b => b.id === parsedId);

    if (bookIndex === -1) {
      logger.warn('Book not found for update', { id: parsedId });
      return NextResponse.json(
        {
          type: "https://example.com/not-found",
          title: "Book not found",
          status: 404
        },
        { status: 404 }
      );
    }

    const data = await request.json();
    logger.info('Book PUT data', { id: parsedId, data });

    const validationErrors = validateBook(data, true, parsedId);
    if (validationErrors) {
      logger.warn('Book PUT validation failed', { id: parsedId, errors: validationErrors });
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
    const updatedBook = {
      ...books[bookIndex],
      ...data,
      id: parsedId, // Ensure ID doesn't change
      updated_at: now
    };

    books[bookIndex] = updatedBook;
    logger.info('Book updated', { id: parsedId });

    return NextResponse.json(updatedBook, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    logger.error('Book PUT error', { error });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    logger.info('Book DELETE request', { id: parsedId });
    const bookIndex = books.findIndex(b => b.id === parsedId);

    if (bookIndex === -1) {
      logger.warn('Book not found for delete', { id: parsedId });
      return NextResponse.json(
        {
          type: "https://example.com/not-found",
          title: "Book not found",
          status: 404
        },
        { status: 404 }
      );
    }

    books.splice(bookIndex, 1);
    logger.info('Book deleted', { id: parsedId });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('Book DELETE error', { error });
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