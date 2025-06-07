'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  book_type: 'book' | 'audiobook' | null;
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

// New component: BookshelfTable
type SortableColumn = 'title' | 'author' | 'seriesName' | 'publication_year' | 'rating';

interface BookshelfTableProps {
  title: string;
  books: Book[];
  onDeleteHandler: (bookId: number) => void;
  onEditHandler: (book: Book) => void;
  getSeriesNameForBook: (seriesId: number | null) => string | null;
}

const BookshelfTable: React.FC<BookshelfTableProps> = ({ title, books, onDeleteHandler, onEditHandler, getSeriesNameForBook }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortableColumn; direction: 'ascending' | 'descending' } | null>({ key: 'title', direction: 'ascending' });

  const sortedBooks = React.useMemo(() => {
    const sortableItems = [...books];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const { key, direction } = sortConfig;
        let aValue: string | number | null | undefined, bValue: string | number | null | undefined;

        if (key === 'seriesName') {
          aValue = getSeriesNameForBook(a.series_id);
          bValue = getSeriesNameForBook(b.series_id);
        } else {
          aValue = a[key as keyof Book];
          bValue = b[key as keyof Book];
        }

        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        const dir = direction === 'ascending' ? 1 : -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * dir;
        }

        if (aValue < bValue) return -1 * dir;
        if (aValue > bValue) return 1 * dir;
        
        return 0;
      });
    }
    return sortableItems;
  }, [books, sortConfig, getSeriesNameForBook]);

  const requestSort = (key: SortableColumn) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: SortableColumn) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="text-gray-400"> ↕</span>;
    }
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  }

  const columns: { key: SortableColumn, label: string }[] = [
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author' },
    { key: 'seriesName', label: 'Series' },
    { key: 'publication_year', label: 'Year' },
    { key: 'rating', label: 'Rating' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-2xl font-semibold text-white flex items-center justify-between">
          {title}
          <span className="bg-blue-500 text-white text-sm font-medium px-2.5 py-1 rounded-full">
            {books.length}
          </span>
        </h2>
      </div>
    
      <div className="overflow-x-auto">
        {books.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p>No books on this shelf.</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(col => (
                  <th 
                    key={col.key} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort(col.key)}
                  >
                    {col.label}
                    {getSortIndicator(col.key)}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-start space-x-3">
                      {book.cover_image_url ? (
                        <Image
                          src={book.cover_image_url}
                          alt={`Cover of ${book.title}`}
                          width={48}
                          height={72}
                          className="rounded shadow-md flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-[72px] bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-xl text-gray-400">📚</span>
                        </div>
                      )}
                      <div className="pt-1">
                        <div 
                          className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                          onClick={() => onEditHandler(book)}
                        >
                          {book.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 align-top pt-4">{book.author}</td>
                  <td className="px-4 py-3 text-sm text-blue-600 align-top pt-4">{getSeriesNameForBook(book.series_id) || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 align-top pt-4">{book.publication_year || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 align-top pt-4 font-medium">{book.rating !== null ? book.rating : '—'}</td>
                  <td className="px-4 py-3 align-top pt-4">
                    <button
                      onClick={() => onDeleteHandler(book.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Edit Book Modal Component
interface EditBookModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBook: Book) => void;
}

const EditBookModal: React.FC<EditBookModalProps> = ({ book, isOpen, onClose, onSave }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState<string | null>(null);
  const [bookType, setBookType] = useState<'book' | 'audiobook' | null>(null);
  const [status, setStatus] = useState<Book['status']>('planning');

  useEffect(() => {
    if (book) {
      setRating(book.rating);
      setComments(book.comments);
      setBookType(book.book_type);
      setStatus(book.status);
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const handleSave = () => {
    onSave({
      ...book,
      rating,
      comments,
      book_type: bookType,
      status,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Edit: {book.title}</h2>
        
        {/* Status */}
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="status"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as Book['status'])}
          >
            {Object.entries(statusMapping).map(([apiStatus, displayStatus]) => (
              <option key={apiStatus} value={apiStatus}>{displayStatus}</option>
            ))}
            <option value="on_hold">On Hold</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>

        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-10)</label>
          <div className="flex flex-wrap items-center">
            {[...Array(10)].map((_, i) => {
              const starValue = i + 1;
              return (
                <button
                  key={starValue}
                  onClick={() => setRating(starValue)}
                  className={`text-2xl p-1 ${starValue <= (rating || 0) ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-500 transition-colors`}
                >
                  ★
                </button>
              );
            })}
            {rating && (
              <button 
                onClick={() => setRating(null)} 
                className="ml-2 mt-1 text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="mb-4">
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
          <textarea
            id="comments"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={comments || ''}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add your thoughts..."
          />
        </div>

        {/* Book Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Book Type</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={bookType || ''}
            onChange={(e) => setBookType(e.target.value as Book['book_type'])}
          >
            <option value="">Select type</option>
            <option value="book">Book</option>
            <option value="audiobook">Audiobook</option>
          </select>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addLoadingId, setAddLoadingId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  // State for edit modal
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const memoizedDeleteBook = useCallback(async (bookId: number) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/books/${bookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  }, []);

  const memoizedGetSeriesName = useCallback((seriesId: number | null) => {
    if (!seriesId) return null;
    const seriesItem = series.find(s => s.id === seriesId);
    return seriesItem?.name || null;
  }, [series]);

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

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditingBook(null);
    setShowEditModal(false);
  };

  const handleSaveBookChanges = async (updatedBook: Book) => {
    if (!editingBook) return;

    try {
      const response = await fetch(`/api/v1/books/${editingBook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBook),
      });

      if (response.ok) {
        const savedBook = await response.json();
        setBooks(prevBooks =>
          prevBooks.map(book =>
            book.id === savedBook.id ? savedBook : book
          )
        );
        handleCloseEditModal();
      } else {
        console.error('Failed to save book changes');
        // You might want to show an error to the user here
      }
    } catch (error) {
      console.error('Error saving book changes:', error);
       // You might want to show an error to the user here
    }
  };

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
            A sortable and editable library of your books.
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
        <div className="space-y-12">
          {(['Currently Reading', 'Want to Read', 'Read'] as const).map((shelfTitle) => {
              const shelfBooks = getBooksByStatus(shelfTitle);
              return (
                <BookshelfTable
                  key={shelfTitle}
                  title={shelfTitle}
                  books={shelfBooks}
                  onDeleteHandler={memoizedDeleteBook}
                  getSeriesNameForBook={memoizedGetSeriesName}
                  onEditHandler={handleEditBook}
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

      {/* Edit Book Modal */}
      {showEditModal && editingBook && (
        <EditBookModal
          book={editingBook}
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleSaveBookChanges}
        />
      )}
    </div>
  );
}
