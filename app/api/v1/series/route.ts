import { NextRequest, NextResponse } from 'next/server';
import { series, incrementSeriesId } from '../lib/data';
import { validateSeries } from '../lib/validation';
import logger from '../lib/logger';

export async function GET() {
  try {
    logger.info('Series GET request');
    return NextResponse.json(series, {
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    logger.info('Series POST request', { data });
    const validationErrors = validateSeries(data);
    if (validationErrors) {
      logger.warn('Series POST validation failed', { errors: validationErrors });
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
    const newSeries = {
      id: incrementSeriesId(),
      name: data.name,
      description: data.description || null,
      created_at: now,
      updated_at: now
    };

    series.push(newSeries);
    logger.info('Series created', { id: newSeries.id, name: newSeries.name });
    return NextResponse.json(newSeries, {
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    logger.error('Series POST error', { error });
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