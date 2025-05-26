import { NextRequest, NextResponse } from 'next/server';
import { series, books } from '../../lib/data';
import { validateSeries } from '../../lib/validation';
import logger from '../../lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    logger.info('Series GET request', { id });
    const seriesItem = series.find(s => s.id === id);

    if (!seriesItem) {
      logger.warn('Series not found', { id });
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
  } catch (error) {
    logger.error('Series GET error', { error });
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
    logger.info('Series PUT request', { id });
    const seriesIndex = series.findIndex(s => s.id === id);

    if (seriesIndex === -1) {
      logger.warn('Series not found for update', { id });
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
    logger.info('Series PUT data', { id, data });
    const validationErrors = validateSeries(data, true);
    if (validationErrors) {
      logger.warn('Series PUT validation failed', { id, errors: validationErrors });
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
    logger.info('Series updated', { id });
    return NextResponse.json(updatedSeries, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    logger.error('Series PUT error', { error });
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
    logger.info('Series DELETE request', { id });
    const seriesIndex = series.findIndex(s => s.id === id);

    if (seriesIndex === -1) {
      logger.warn('Series not found for delete', { id });
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
        logger.info('Book series_id set to null due to series delete', { bookId: book.id });
      }
    });

    series.splice(seriesIndex, 1);
    logger.info('Series deleted', { id });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('Series DELETE error', { error });
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