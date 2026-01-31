const axios = require('axios');

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

// Sample fallback books in case API fails
const getSampleBooks = () => [
  {
    isbn: '9780143127741',
    title: 'The Great Gatsby',
    authors: 'F. Scott Fitzgerald',
    publisher_name: 'Penguin Classics',
    publication_year: 1925,
    price: 12.99,
    category: 'History',
    stock_quantity: 25,
    description: 'A classic American novel about the Jazz Age.',
    imageUrl: 'https://covers.openlibrary.org/b/isbn/9780143127741-L.jpg',
    pageCount: 180,
    available: true
  },
  {
    isbn: '9780061120084',
    title: 'To Kill a Mockingbird',
    authors: 'Harper Lee',
    publisher_name: 'Harper Perennial',
    publication_year: 1960,
    price: 14.99,
    category: 'History',
    stock_quantity: 30,
    description: 'A gripping tale of racial injustice and childhood innocence.',
    imageUrl: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg',
    pageCount: 376,
    available: true
  },
  {
    isbn: '9780547928227',
    title: 'The Hobbit',
    authors: 'J.R.R. Tolkien',
    publisher_name: 'Houghton Mifflin Harcourt',
    publication_year: 1937,
    price: 16.99,
    category: 'Art',
    stock_quantity: 20,
    description: 'A fantasy adventure novel.',
    imageUrl: 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg',
    pageCount: 310,
    available: true
  },
  {
    isbn: '9780141439518',
    title: 'Pride and Prejudice',
    authors: 'Jane Austen',
    publisher_name: 'Penguin Classics',
    publication_year: 1813,
    price: 11.99,
    category: 'History',
    stock_quantity: 35,
    description: 'A romantic novel of manners.',
    imageUrl: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
    pageCount: 432,
    available: true
  },
  {
    isbn: '9780140283334',
    title: '1984',
    authors: 'George Orwell',
    publisher_name: 'Penguin Books',
    publication_year: 1949,
    price: 13.99,
    category: 'Science',
    stock_quantity: 28,
    description: 'A dystopian social science fiction novel.',
    imageUrl: 'https://covers.openlibrary.org/b/isbn/9780140283334-L.jpg',
    pageCount: 328,
    available: true
  }
];

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry API calls with exponential backoff
const retryRequest = async (fn, retries = 3, delayMs = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429 && i < retries - 1) {
        // Rate limited - wait longer before retry (start with 2s, then 4s, then 8s)
        const waitTime = delayMs * Math.pow(2, i);
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${i + 1}/${retries}`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
};

/**
 * Search books using Google Books API
 */
const searchBooks = async (queryParams) => {
  try {
    const { isbn, title, category, author, publisher } = queryParams;
    
    // Build search query - use simpler queries to avoid rate limiting
    let searchQuery = '';
    if (isbn) {
      searchQuery = `isbn:${isbn}`;
    } else if (title) {
      // Use simple title search
      searchQuery = title;
    } else if (author) {
      // Use simple author search
      searchQuery = author;
    } else if (category) {
      // Use category/subject search
      searchQuery = category;
    } else {
      // Default: search for popular books
      searchQuery = 'best sellers';
    }

    const response = await retryRequest(async () => {
      return await axios.get(GOOGLE_BOOKS_API, {
        params: {
          q: searchQuery,
          maxResults: 40
        },
        timeout: 10000 // 10 second timeout
      });
    });

    if (!response.data.items) {
      return [];
    }

    // Map Google Books API response to our format
    const books = response.data.items.map(item => {
      const volumeInfo = item.volumeInfo || {};
      const isbn13 = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                     volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier ||
                     item.id?.replace('_', '') ||
                     `GB${item.id?.substring(0, 10)}`;

      // Map category
      const categoryMap = {
        'Science': ['Science', 'Technology', 'Mathematics', 'Physics', 'Chemistry', 'Biology'],
        'Art': ['Art', 'Design', 'Photography', 'Architecture'],
        'Religion': ['Religion', 'Spirituality', 'Philosophy'],
        'History': ['History', 'Biography', 'Historical'],
        'Geography': ['Geography', 'Travel', 'Nature']
      };

      let mappedCategory = 'Science'; // default
      if (volumeInfo.categories && volumeInfo.categories.length > 0) {
        const bookCategory = volumeInfo.categories[0];
        for (const [key, values] of Object.entries(categoryMap)) {
          if (values.some(v => bookCategory.toLowerCase().includes(v.toLowerCase()))) {
            mappedCategory = key;
            break;
          }
        }
      }

      // Get image URL - prefer larger image, fallback to smaller, or use Open Library cover
      let imageUrl = volumeInfo.imageLinks?.thumbnail || 
                     volumeInfo.imageLinks?.smallThumbnail || 
                     volumeInfo.imageLinks?.medium ||
                     volumeInfo.imageLinks?.large ||
                     '';
      
      // If no image from Google Books, try Open Library cover using ISBN
      if (!imageUrl && isbn13) {
        // Remove any non-digit characters for Open Library
        const cleanISBN = isbn13.replace(/\D/g, '');
        if (cleanISBN.length >= 10) {
          imageUrl = `https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg`;
        }
      }

      return {
        isbn: isbn13,
        title: volumeInfo.title || 'Unknown Title',
        authors: volumeInfo.authors?.join(', ') || 'Unknown Author',
        publisher_name: volumeInfo.publisher || 'Unknown Publisher',
        publication_year: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.substring(0, 4)) : null,
        price: Math.floor(Math.random() * 50) + 10, // Random price between $10-$60 (since API doesn't provide prices)
        category: mappedCategory,
        stock_quantity: Math.floor(Math.random() * 100) + 10, // Random stock (10-110)
        description: volumeInfo.description || '',
        imageUrl: imageUrl,
        pageCount: volumeInfo.pageCount || null,
        available: true
      };
    });

    // Apply additional filters if needed
    let filteredBooks = books;
    if (title && !isbn) {
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(title.toLowerCase())
      );
    }
    if (author && !isbn) {
      filteredBooks = filteredBooks.filter(book => 
        book.authors.toLowerCase().includes(author.toLowerCase())
      );
    }
    if (publisher && !isbn) {
      filteredBooks = filteredBooks.filter(book => 
        book.publisher_name.toLowerCase().includes(publisher.toLowerCase())
      );
    }
    if (category) {
      filteredBooks = filteredBooks.filter(book => book.category === category);
    }

    return filteredBooks;
  } catch (error) {
    console.error('Google Books API error:', error.message);
    
    // If rate limited or API fails, return sample books as fallback
    if (error.response?.status === 429 || !queryParams.title && !queryParams.isbn && !queryParams.author) {
      console.log('API rate limited or empty query - returning sample books');
      return getSampleBooks();
    }
    
    // For specific searches that fail, return empty array
    if (error.response?.status === 400) {
      return [];
    }
    
    // For other errors, return sample books as fallback
    console.log('API error - returning sample books as fallback');
    return getSampleBooks();
  }
};

/**
 * Get book by ISBN using Google Books API
 */
const getBookByISBN = async (isbn) => {
  try {
    const books = await searchBooks({ isbn });
    if (books.length === 0) {
      return null;
    }
    return books[0];
  } catch (error) {
    console.error('Get book by ISBN error:', error.message);
    throw new Error('Failed to fetch book by ISBN');
  }
};

/**
 * Get all books (returns popular books)
 */
const getAllBooks = async () => {
  try {
    // Use a simple, reliable search query
    const books = await searchBooks({ title: 'fiction' });
    
    // If we got books, return them sorted
    if (books.length > 0) {
      return books.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    // If no results, return sample books
    return getSampleBooks();
  } catch (error) {
    console.error('Get all books error:', error.message);
    // Return sample books as fallback
    return getSampleBooks();
  }
};

module.exports = {
  searchBooks,
  getBookByISBN,
  getAllBooks
};
