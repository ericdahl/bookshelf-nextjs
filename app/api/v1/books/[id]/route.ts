import { NextRequest, NextResponse } from 'next/server';
import { books } from '../../lib/data';
import { validateBook } from '../../lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const book = books.find(b => b.id === id);

    if (!book) {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const bookIndex = books.findIndex(b => b.id === id);

    if (bookIndex === -1) {
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

    const validationErrors = validateBook(data, true, id);
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
    const updatedBook = {
      ...books[bookIndex],
      ...data,
      id, // Ensure ID doesn't change
      updated_at: now
    };

    books[bookIndex] = updatedBook;

    return NextResponse.json(updatedBook, {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const bookIndex = books.findIndex(b => b.id === id);

    if (bookIndex === -1) {
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

    return new NextResponse(null, { status: 204 });
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