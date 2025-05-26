'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";

interface Book {
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

interface Series {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const statusMapping = {
  'planning': 'Want to Read',
  'reading': 'Currently Reading',
  'finished': 'Read'
} as const;

const reverseStatusMapping = {
  'Want to Read': 'planning',
  'Currently Reading': 'reading',
  'Read': 'finished'
} as const;

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedBook, setDraggedBook] = useState<Book | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addLoadingId, setAddLoadingId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [booksResponse, seriesResponse] = await Promise.all([
        fetch('/api/v1/books'),
        fetch('/api/v1/series')
      ]);
      
      const booksData = await booksResponse.json();
      const seriesData = await seriesResponse.json();
      
      setBooks(booksData);
      setSeries(seriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookStatus = async (bookId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedBook = await response.json();
        setBooks(books.map(book => 
          book.id === bookId ? updatedBook : book
        ));
      }
    } catch (error) {
      console.error('Error updating book status:', error);
    }
  };

  const deleteBook = async (bookId: number) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/books/${bookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBooks(books.filter(book => book.id !== bookId));
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, book: Book) => {
    setDraggedBook(book);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newShelf: string) => {
    e.preventDefault();
    if (draggedBook) {
      const newStatus = reverseStatusMapping[newShelf as keyof typeof reverseStatusMapping];
      if (newStatus && draggedBook.status !== newStatus) {
        updateBookStatus(draggedBook.id, newStatus);
      }
      setDraggedBook(null);
    }
  };

  const getSeriesName = (seriesId: number | null) => {
    if (!seriesId) return null;
    const seriesItem = series.find(s => s.id === seriesId);
    return seriesItem?.name || null;
  };

  const getBooksByStatus = (status: string) => {
    const apiStatus = reverseStatusMapping[status as keyof typeof reverseStatusMapping];
    return books.filter(book => book.status === apiStatus);
  };

  // Search handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const res = await fetch(`/api/v1/books/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchError('Error searching books.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Add book from search result
  const handleAddBook = async (book: Book, status: string) => {
    setAddLoadingId(book.open_library_id ? book.open_library_id : book.title);
    setAddError(null);
    try {
      const res = await fetch('/api/v1/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...book, status }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.title || 'Failed to add book');
      }
      const newBook = await res.json();
      setBooks(prev => [...prev, newBook]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAddError(error.message || 'Error adding book.');
      } else {
        setAddError('Error adding book.');
      }
    } finally {
      setAddLoadingId(null);
    }
  };

  const BookCard = ({ book }: { book: Book }) => (
    <tr
      draggable
      onDragStart={(e) => handleDragStart(e, book)}
      className="bg-white hover:bg-gray-50 border-b border-gray-200 cursor-move transition-colors duration-200"
    >
      <td className="px-4 py-3">
        <div className="flex items-center space-x-3">
          {book.cover_image_url ? (
            <Image
              src={book.cover_image_url}
              alt={`Cover of ${book.title}`}
              width={40}
              height={60}
              className="rounded shadow-sm"
            />
          ) : (
            <div className="w-10 h-15 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">📚</span>
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{book.title}</div>
            <div className="text-sm text-gray-500">{book.author}</div>
            {getSeriesName(book.series_id) && (
              <div className="text-xs text-blue-600">
                {getSeriesName(book.series_id)}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {book.publication_year || 'Unknown'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {book.page_count || 'Unknown'}
      </td>
      <td className="px-4 py-3">
        {book.rating && (
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${
                  i < book.rating! ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => deleteBook(book.id)}
          className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200"
        >
          Remove
        </button>
      </td>
    </tr>
  );

  const Bookshelf = ({ title, books: shelfBooks }: { title: string; books: Book[] }) => (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, title)}
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-xl font-semibold text-white flex items-center justify-between">
          {title}
          <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
            {shelfBooks.length}
          </span>
        </h2>
      </div>
      
      <div className="min-h-[200px]">
        {shelfBooks.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📚</div>
              <p>No books in this shelf</p>
              <p className="text-sm">Drag books here to add them</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pages
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {shelfBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookshelf...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📚 My Bookshelf
          </h1>
          <p className="text-gray-600">
            Organize your reading journey • Drag books between shelves
          </p>
        </header>

        {/* Search Box */}
        <div className="mb-8 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search for books by title, author, or ISBN..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              disabled={searchLoading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition-colors"
              disabled={searchLoading}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {searchError && <div className="text-red-600 mt-2">{searchError}</div>}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-10 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Search Results</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1 rounded border border-gray-200 bg-gray-100"
                onClick={() => setSearchResults([])}
                aria-label="Close search results"
              >
                Close
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pages</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((book) => (
                    <tr key={book.open_library_id || book.title} className="border-b border-gray-200">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          {book.cover_image_url ? (
                            <Image
                              src={book.cover_image_url}
                              alt={`Cover of ${book.title}`}
                              width={40}
                              height={60}
                              className="rounded shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-15 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500">📚</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{book.title}</div>
                            <div className="text-sm text-gray-500">{book.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{book.publication_year || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{book.page_count || 'Unknown'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {Object.entries(statusMapping).map(([status, label]) => (
                            <button
                              key={status}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${addLoadingId === (book.open_library_id || book.title) ? 'opacity-50 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                              onClick={() => handleAddBook(book, status)}
                              disabled={addLoadingId === (book.open_library_id || book.title)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        {addError && addLoadingId === (book.open_library_id || book.title) && (
                          <div className="text-xs text-red-600 mt-1">{addError}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Main Bookshelves */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.keys(statusMapping).map((status) => {
            const shelfTitle = statusMapping[status as keyof typeof statusMapping];
            const shelfBooks = getBooksByStatus(shelfTitle);
            return (
              <Bookshelf
                key={status}
                title={shelfTitle}
                books={shelfBooks}
              />
            );
          })}
        </div>

        {books.length === 0 && (
          <div className="text-center mt-12">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your bookshelf is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start building your library by adding some books through the API
            </p>
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-medium mb-4">Quick Start</h3>
                             <div className="text-left space-y-2 text-sm">
                 <p><strong>Add a book:</strong></p>
                 <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">
{`curl -X POST http://localhost:3000/api/v1/books \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Your Book", "author": "Author Name", "status": "reading"}'`}
                 </pre>
               </div>
            </div>
          </div>
        )}

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>
            Powered by Next.js • API Documentation: 
            <a href="/docs/api-documentation.md" className="text-blue-600 hover:underline ml-1">
              View API Docs
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
