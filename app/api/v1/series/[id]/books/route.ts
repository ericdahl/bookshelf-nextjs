import { NextRequest, NextResponse } from 'next/server';
import { series, books } from '../../../lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const seriesId = parseInt(params.id);
    
    // Check if series exists
    const seriesItem = series.find(s => s.id === seriesId);
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

    // Get all books in this series
    const seriesBooks = books.filter(book => book.series_id === seriesId);

    return NextResponse.json(seriesBooks, {
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