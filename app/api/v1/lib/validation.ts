import { books } from './data';

export interface ValidationErrors {
  [key: string]: string[];
}

export function validateBook(data: Record<string, unknown>, isUpdate = false, currentId?: number): ValidationErrors | null {
  const errors: ValidationErrors = {};

  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string') {
      errors.title = ["can't be blank"];
    } else if (data.title.length > 255) {
      errors.title = ["must be 255 characters or less"];
    }
  }

  if (!isUpdate || data.author !== undefined) {
    if (!data.author || typeof data.author !== 'string') {
      errors.author = ["can't be blank"];
    } else if (data.author.length > 255) {
      errors.author = ["must be 255 characters or less"];
    }
  }

  if (data.isbn_10 !== undefined && data.isbn_10 !== null) {
    if (!/^\d{10}$/.test(data.isbn_10)) {
      errors.isbn_10 = ["must be 10 digits"];
    } else {
      const existing = books.find(b => b.isbn_10 === data.isbn_10 && b.id !== currentId);
      if (existing) {
        errors.isbn_10 = ["has already been taken"];
      }
    }
  }

  if (data.isbn_13 !== undefined && data.isbn_13 !== null) {
    if (!/^\d{13}$/.test(data.isbn_13)) {
      errors.isbn_13 = ["must be 13 digits"];
    } else {
      const existing = books.find(b => b.isbn_13 === data.isbn_13 && b.id !== currentId);
      if (existing) {
        errors.isbn_13 = ["has already been taken"];
      }
    }
  }

  if (data.publication_year !== undefined) {
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(data.publication_year) || data.publication_year < 1450 || data.publication_year > currentYear) {
      errors.publication_year = [`must be an integer between 1450 and ${currentYear}`];
    }
  }

  if (data.page_count !== undefined) {
    if (!Number.isInteger(data.page_count) || data.page_count <= 0) {
      errors.page_count = ["must be a positive integer"];
    }
  }

  if (data.status !== undefined) {
    const validStatuses = ['planning', 'reading', 'finished', 'on_hold', 'dropped'];
    if (!validStatuses.includes(data.status)) {
      errors.status = [`must be one of: ${validStatuses.join(', ')}`];
    }
  }

  if (data.rating !== undefined && data.rating !== null) {
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 10) {
      errors.rating = ["must be an integer between 1 and 10"];
    }
  }

  if (data.book_type !== undefined && data.book_type !== null) {
    const validTypes = ['book', 'audiobook'];
    if (!validTypes.includes(data.book_type)) {
      errors.book_type = [`must be one of: ${validTypes.join(', ')}`];
    }
  }

  if (data.date_started && data.date_finished) {
    const startDate = new Date(data.date_started);
    const finishDate = new Date(data.date_finished);
    if (startDate > finishDate) {
      errors.date_started = ["must be before or equal to date_finished"];
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function validateSeries(data: Record<string, unknown>, isUpdate = false): ValidationErrors | null {
  const errors: ValidationErrors = {};

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string') {
      errors.name = ["can't be blank"];
    } else if (data.name.length > 255) {
      errors.name = ["must be 255 characters or less"];
    }
  }

  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== 'string') {
      errors.description = ["must be a string"];
    } else if (data.description.length > 1000) {
      errors.description = ["must be 1000 characters or less"];
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
} 