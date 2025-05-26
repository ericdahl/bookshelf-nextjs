# Books & Series API Documentation

This is a RESTful JSON API for managing books and series in the bookshelf application.

## Base URL
```
/api/v1
```

## Content Type
All requests and responses use `application/json; charset=utf-8`

## Date Format
All dates are in ISO-8601 format (e.g., `2025-05-26T10:30:00Z`)

## Error Format
Errors follow RFC 7807 Problem Detail format:

```json
{
  "type": "https://example.com/validation-error",
  "title": "Validation failed",
  "status": 422,
  "errors": {
    "field_name": ["error message"]
  }
}
```

## Series Endpoints

### List all series
```
GET /api/v1/series
```

### Create a new series
```
POST /api/v1/series
Content-Type: application/json

{
  "name": "Series Name",
  "description": "Optional description"
}
```

### Get a single series
```
GET /api/v1/series/:id
```

### Update a series
```
PUT /api/v1/series/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Delete a series
```
DELETE /api/v1/series/:id
```
Note: This sets `series_id` to `null` for all books in the series.

### List books in a series
```
GET /api/v1/series/:id/books
```

## Books Endpoints

### List all books (with optional filters)
```
GET /api/v1/books
GET /api/v1/books?series_id=1
GET /api/v1/books?status=finished
GET /api/v1/books?publication_year=2020
```

### Create a new book
```
POST /api/v1/books
Content-Type: application/json

{
  "title": "Book Title",
  "author": "Author Name",
  "isbn_10": "0123456789",
  "isbn_13": "9780123456789",
  "publication_year": 2020,
  "publisher": "Publisher Name",
  "page_count": 300,
  "description": "Book description",
  "cover_image_url": "https://example.com/cover.jpg",
  "open_library_id": "OL123456M",
  "series_id": 1,
  "status": "planning",
  "rating": 5,
  "comments": "Personal notes",
  "book_type": "hardcover",
  "date_added": "2025-01-01T00:00:00Z",
  "date_started": "2025-01-02T00:00:00Z",
  "date_finished": "2025-01-10T00:00:00Z"
}
```

### Get a single book
```
GET /api/v1/books/:id
```

### Update a book
```
PUT /api/v1/books/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "finished",
  "rating": 4
}
```

### Delete a book
```
DELETE /api/v1/books/:id
```

## Validation Rules

### Books
- `title`: Required, max 255 characters
- `author`: Required, max 255 characters
- `isbn_10`: Optional, must be 10 digits, unique
- `isbn_13`: Optional, must be 13 digits, unique
- `publication_year`: Integer between 1450 and current year
- `page_count`: Positive integer
- `status`: One of: `planning`, `reading`, `finished`, `on_hold`, `dropped`
- `rating`: Integer between 1 and 5
- `book_type`: One of: `hardcover`, `paperback`, `kindle`, `audiobook`
- `date_started` must be before or equal to `date_finished`

### Series
- `name`: Required, max 255 characters
- `description`: Optional, max 1000 characters

## Example Responses

### Book Response
```json
{
  "id": 1,
  "title": "The Way of Kings",
  "author": "Brandon Sanderson",
  "isbn_10": "0765326353",
  "isbn_13": "9780765326355",
  "publication_year": 2010,
  "publisher": "Tor Books",
  "page_count": 1007,
  "description": "First novel in the Stormlight Archive series.",
  "cover_image_url": "https://covers.openlibrary.org/b/id/8739161-L.jpg",
  "open_library_id": "OL24364428M",
  "series_id": 1,
  "status": "finished",
  "rating": 5,
  "comments": "Amazing world-building and magic system.",
  "book_type": "hardcover",
  "date_added": "2025-01-15T10:00:00Z",
  "date_started": "2025-01-16T09:00:00Z",
  "date_finished": "2025-01-25T22:30:00Z",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-25T22:30:00Z"
}
```

### Series Response
```json
{
  "id": 1,
  "name": "The Stormlight Archive",
  "description": "Epic fantasy by Brandon Sanderson",
  "created_at": "2025-01-10T08:00:00Z",
  "updated_at": "2025-01-10T08:00:00Z"
}
``` 