# Bookshelf Next.js

A Next.js application for managing books and series with a RESTful API.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Endpoints

This application provides a RESTful JSON API for managing books and series. All endpoints are prefixed with `/api/v1`.

### Series Endpoints

- `GET /api/v1/series` - List all series
- `POST /api/v1/series` - Create a new series
- `GET /api/v1/series/:id` - Get a single series
- `PUT /api/v1/series/:id` - Update a series
- `DELETE /api/v1/series/:id` - Delete a series (sets series_id to null for all books)
- `GET /api/v1/series/:id/books` - List books in a series

### Books Endpoints

- `GET /api/v1/books` - List all books (supports filtering)
- `POST /api/v1/books` - Create a new book
- `GET /api/v1/books/:id` - Get a single book
- `PUT /api/v1/books/:id` - Update a book
- `DELETE /api/v1/books/:id` - Delete a book

### Filtering

Books can be filtered using query parameters:
- `?series_id=1` - Filter by series
- `?status=finished` - Filter by reading status
- `?publication_year=2020` - Filter by publication year

### Example Usage

```bash
# List all series
curl http://localhost:3000/api/v1/series

# Create a new series
curl -X POST http://localhost:3000/api/v1/series \
  -H "Content-Type: application/json" \
  -d '{"name": "Harry Potter", "description": "Wizarding world series"}'

# List all books
curl http://localhost:3000/api/v1/books

# Create a new book
curl -X POST http://localhost:3000/api/v1/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Harry Potter and the Philosopher'\''s Stone",
    "author": "J.K. Rowling",
    "series_id": 1,
    "status": "finished",
    "rating": 5
  }'

# Filter books by series
curl "http://localhost:3000/api/v1/books?series_id=1"
```

## API Documentation

For detailed API documentation, see [docs/api-documentation.md](docs/api-documentation.md).

## Features

- ✅ RESTful JSON API
- ✅ Books and Series management
- ✅ Data validation with RFC 7807 error format
- ✅ Query filtering for books
- ✅ TypeScript support
- ✅ ESLint configuration
- ✅ In-memory data storage (for demo purposes)

## Data Models

### Book
- Basic info: title, author, ISBN, publication details
- Reading tracking: status, rating, dates, comments
- Series relationship (optional)
- Multiple book types supported

### Series
- Name and description
- One-to-many relationship with books
- Cascade delete behavior (sets books' series_id to null)

## Development

```bash
# Run development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
