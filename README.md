# Online Bookstore Management System

A full-stack web application for managing an online bookstore with customer and admin functionalities. Books are fetched from Google Books API, and user authentication uses file-based storage.

## ?? Features

### Customer Features
- **User Authentication**: Sign up, login, and profile management
- **Book Browsing**: Search books by title, author, ISBN, publisher, or category
- **Book Images**: Display book cover images from Google Books API and Open Library
- **Shopping Cart**: Add books to cart, update quantities, remove items
- **Checkout**: Place orders with credit card validation
- **Order History**: View past orders with details

### Admin Features
- **Book Management**: View books fetched from Google Books API
- **Publisher Orders**: Create manual orders from publishers, confirm pending orders
- **System Reports**:
  - Total sales for the previous month
  - Total sales for a specific date
  - Top 5 customers (last 3 months)
  - Top 10 selling books (last 3 months)
  - Book replenishment order count

### System Features
- **External Books API**: Books are fetched from Google Books API (no database needed for books)
- **File-based User Storage**: User authentication uses JSON file storage (no MySQL required)
- **Real-time Search**: Instant filtering across all book attributes
- **Responsive Design**: Works on desktop and mobile devices
- **Image Fallback**: Automatic fallback to Open Library covers if Google Books images unavailable

## ??? Tech Stack

### Frontend
- **React** 19.2.0
- **React Router** 6.28.0
- **Vite** 7.2.4
- **Axios** 1.7.9
- **React Icons** 5.5.0

### Backend
- **Node.js**
- **Express** 5.2.1
- **JWT** (JSON Web Tokens) for authentication
- **bcrypt** for password hashing
- **Axios** for API calls
- **CORS** enabled

### External APIs
- **Google Books API**: Primary source for book data
- **Open Library**: Fallback for book cover images

## ?? Prerequisites

- Node.js (v20.19+ or v22.12+ recommended)
- npm or yarn
- Internet connection (for Google Books API)

## ?? Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd Book-Store
```

### 2. Install Backend Dependencies
```bash
cd Backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../Frontend
npm install
```

## ?? Running the Application

### Start Backend Server
```bash
cd Backend
npm run dev
```
The backend server will run on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd Frontend
npm run dev
```
The frontend will run on `http://localhost:5173` (or next available port)

## ?? Project Structure

```
Book-Store/
??? Backend/
?   ??? config/
?   ?   ??? db.js              # Database configuration (optional, not required for books)
?   ??? controllers/
?   ?   ??? auth.controller.js # Authentication logic
?   ?   ??? books.controller.js # Books API integration
?   ?   ??? cart.controller.js
?   ?   ??? orders.controller.js
?   ??? middleware/
?   ?   ??? auth.middleware.js # JWT authentication
?   ?   ??? admin.middleware.js
?   ??? routes/
?   ?   ??? auth.routes.js
?   ?   ??? books.routes.js
?   ?   ??? cart.routes.js
?   ?   ??? orders.routes.js
?   ??? services/
?   ?   ??? booksAPI.js        # Google Books API integration
?   ?   ??? userStorage.js     # File-based user storage
?   ??? utils/
?   ?   ??? jwt.js             # JWT token utilities
?   ??? data/
?   ?   ??? users.json         # User data storage (auto-created)
?   ??? server.js              # Express server
?
??? Frontend/
    ??? src/
    ?   ??? components/        # React components
    ?   ??? context/           # React context (AuthContext)
    ?   ??? services/
    ?   ?   ??? api.js         # API service layer
    ?   ??? main.jsx           # Entry point
    ??? vite.config.js
```

## ?? API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Books
- `GET /api/books/search` - Search books (protected)
- `GET /api/books/:isbn` - Get book by ISBN (protected)
- `GET /api/books` - Get all books (admin only)

### Cart
- `POST /api/cart` - Add item to cart (protected)
- `GET /api/cart` - Get cart items (protected)
- `PUT /api/cart/:isbn` - Update cart item quantity (protected)
- `DELETE /api/cart/:isbn` - Remove item from cart (protected)

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders` - Get user orders (protected)
- `GET /api/orders/:orderId` - Get order details (protected)

## ?? Important Notes

### Books Data
- **Books are fetched from Google Books API** - No database setup required for books
- Books include: title, authors, publisher, publication year, description, images, and more
- If Google Books API is rate-limited, the system falls back to sample books
- Book images are fetched from Google Books API with fallback to Open Library

### User Storage
- **User data is stored in `Backend/data/users.json`**
- This is a file-based storage system (no MySQL required for authentication)
- Suitable for development/testing
- For production, consider migrating to a proper database

### Database (Optional)
- MySQL database is **optional** and only needed if you want to use the original database schema
- Cart and Orders functionality may require database setup for full functionality
- The current implementation works without MySQL for books and authentication

## ?? Features in Detail

### Book Search
- Search by title, author, ISBN, publisher, or category
- Real-time filtering
- Category filters: Science, Art, Religion, History, Geography
- Books display with cover images

### Authentication
- Secure password hashing with bcrypt
- JWT token-based authentication
- Protected routes for authenticated users
- Admin role support

### Shopping Cart
- Add/remove books
- Update quantities
- View cart total
- Stock validation

## ?? Troubleshooting

### Books Not Loading
- Check internet connection (Google Books API requires internet)
- If rate-limited, wait a few moments and try again
- System will show sample books as fallback

### Registration Fails
- Check that `Backend/data/` directory exists and is writable
- Verify all required fields are provided

### Images Not Showing
- Images are fetched from external APIs (Google Books/Open Library)
- Check browser console for CORS or network errors
- Images will show placeholder if unavailable

## ?? Security Notes

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- CORS is enabled for frontend-backend communication
- User data stored in JSON file (consider database for production)

## ?? License

ISC

## ?? Author

Book Store Management System

---

**Note**: This application uses external APIs (Google Books) and file-based storage for demonstration purposes. For production use, consider implementing a proper database and API rate limiting strategies.
