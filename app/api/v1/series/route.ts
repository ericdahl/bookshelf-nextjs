import { NextRequest, NextResponse } from 'next/server';
import { series, incrementSeriesId } from '../lib/data';
import { validateSeries } from '../lib/validation';

export async function GET() {
  try {
    return NextResponse.json(series, {
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
    
    const validationErrors = validateSeries(data);
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
    const newSeries = {
      id: incrementSeriesId(),
      name: data.name,
      description: data.description || null,
      created_at: now,
      updated_at: now
    };

    series.push(newSeries);

    return NextResponse.json(newSeries, {
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