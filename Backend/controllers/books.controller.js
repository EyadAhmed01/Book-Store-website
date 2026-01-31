const booksAPI = require('../services/booksAPI');

// Add new book (Admin only) - Not available when using external API
const addBook = async (req, res) => {
  res.status(501).json({ 
    error: 'Adding books is not available when using external API. Books are fetched from Google Books API.' 
  });
};

// Update book (Admin only) - Not available when using external API
const updateBook = async (req, res) => {
  res.status(501).json({ 
    error: 'Updating books is not available when using external API. Books are fetched from Google Books API.' 
  });
};

// Search books using Google Books API
const searchBooks = async (req, res) => {
  try {
    const { isbn, title, category, author, publisher } = req.query;
    
    const books = await booksAPI.searchBooks({ isbn, title, category, author, publisher });
    
    res.json({ books: books || [] });
  } catch (error) {
    console.error('Search books error:', error);
    // Return empty array instead of error to allow frontend to handle gracefully
    res.status(200).json({ books: [], error: error.message || 'Failed to search books' });
  }
};

// Get book by ISBN using Google Books API
const getBookByISBN = async (req, res) => {
  try {
    const { isbn } = req.params;
    
    const book = await booksAPI.getBookByISBN(isbn);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ book });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ error: error.message || 'Failed to get book' });
  }
};

// Get all books using Google Books API
const getAllBooks = async (req, res) => {
  try {
    const books = await booksAPI.getAllBooks();
    
    res.json({ books: books || [] });
  } catch (error) {
    console.error('Get all books error:', error);
    // Return empty array instead of error to allow frontend to handle gracefully
    res.status(200).json({ books: [], error: error.message || 'Failed to get books' });
  }
};

module.exports = {
  addBook,
  updateBook,
  searchBooks,
  getBookByISBN,
  getAllBooks
};
