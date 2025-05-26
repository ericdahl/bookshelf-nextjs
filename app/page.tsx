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
