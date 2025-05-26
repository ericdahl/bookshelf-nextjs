import { NextRequest, NextResponse } from 'next/server';
import { series, books } from '../../lib/data';
import { validateSeries } from '../../lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const seriesItem = series.find(s => s.id === id);

    if (!seriesItem) {
      return NextResponse.json(
        {
          type: "https://example.com/not-found",
          title: "Series not found",
          status: 404
        },
        { status: 404 }
      );
    }

    return NextResponse.json(seriesItem, {
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
    const seriesIndex = series.findIndex(s => s.id === id);

    if (seriesIndex === -1) {
      return NextResponse.json(
        {
          type: "https://example.com/not-found",
          title: "Series not found",
          status: 404
        },
        { status: 404 }
      );
    }

    const data = await request.json();

    const validationErrors = validateSeries(data, true);
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
    const updatedSeries = {
      ...series[seriesIndex],
      ...data,
      id, // Ensure ID doesn't change
      updated_at: now
    };

    series[seriesIndex] = updatedSeries;

    return NextResponse.json(updatedSeries, {
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
    const seriesIndex = series.findIndex(s => s.id === id);

    if (seriesIndex === -1) {
      return NextResponse.json(
        {
          type: "https://example.com/not-found",
          title: "Series not found",
          status: 404
        },
        { status: 404 }
      );
    }

    // Cascade delete: set series_id to null for all books in this series
    books.forEach(book => {
      if (book.series_id === id) {
        book.series_id = null;
        book.updated_at = new Date().toISOString();
      }
    });

    series.splice(seriesIndex, 1);

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