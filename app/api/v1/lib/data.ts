// Shared data store for the API
// In a real application, this would be replaced with a proper database

export interface Series {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn_10: string | null;
  isbn_13: string | null;
  publication_year: number | null;
  publisher: string | null;
  page_count: number | null;
  description: string | null;
  cover_image_url: string | null;
  open_library_id: string | null;
  series_id: number | null;
  status: 'planning' | 'reading' | 'finished' | 'on_hold' | 'dropped';
  rating: number | null;
  comments: string | null;
  book_type: 'hardcover' | 'paperback' | 'kindle' | 'audiobook' | null;
  date_added: string;
  date_started: string | null;
  date_finished: string | null;
  created_at: string;
  updated_at: string;
}

// In-memory storage
export const series: Series[] = [
  {
    id: 1,
    name: "The Stormlight Archive",
    description: "Epic fantasy by Brandon Sanderson",
    created_at: "2025-01-10T08:00:00Z",
    updated_at: "2025-01-10T08:00:00Z"
  }
];

export const books: Book[] = [
  {
    id: 1,
    title: "The Way of Kings",
    author: "Brandon Sanderson",
    isbn_10: "0765326353",
    isbn_13: "9780765326355",
    publication_year: 2010,
    publisher: "Tor Books",
    page_count: 1007,
    description: "First novel in the Stormlight Archive series.",
    cover_image_url: "https://covers.openlibrary.org/b/id/8739161-L.jpg",
    open_library_id: "OL24364428M",
    series_id: 1,
    status: "finished",
    rating: 5,
    comments: "Amazing world-building and magic system.",
    book_type: "hardcover",
    date_added: "2025-01-15T10:00:00Z",
    date_started: "2025-01-16T09:00:00Z",
    date_finished: "2025-01-25T22:30:00Z",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-25T22:30:00Z"
  }
];

// ID counters
export let nextBookId = 2;
export let nextSeriesId = 2;

// Helper functions to update counters
export function incrementBookId(): number {
  return nextBookId++;
}

export function incrementSeriesId(): number {
  return nextSeriesId++;
} 