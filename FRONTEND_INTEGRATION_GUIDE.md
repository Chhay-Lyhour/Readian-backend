# Readian Frontend Integration Guide

**Version:** 1.2.0  
**Last Updated:** November 23, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [Authentication Flow](#authentication-flow)
4. [API Service Layer](#api-service-layer)
5. [State Management](#state-management)
6. [Common Integration Patterns](#common-integration-patterns)
7. [Analytics & Public Data](#analytics--public-data)
8. [File Upload Examples](#file-upload-examples)
9. [Error Handling](#error-handling)
10. [Age Restriction Implementation](#age-restriction-implementation)
11. [Code Examples by Framework](#code-examples-by-framework)

---

## Overview

This guide provides comprehensive instructions for integrating the Readian API into your frontend application. Whether you're using React, Vue, Angular, or vanilla JavaScript, this guide covers everything you need to know.

### Base URL

```
Development: http://localhost:5001/api
Production: https://your-production-domain.com/api
```

### What's New in Version 1.2.0

This update focuses on search functionality and book status access control:

#### 🔍 Search and Filter System (NEW!)
- **Universal Search**: All users can search by title, tags, author, and genre
- **Automatic Filtering**: Backend filters books by status based on user plan
- **No Frontend Logic Needed**: Book status filtering handled automatically
- **Search Endpoint**: New comprehensive search with all filters

#### 🚀 Book Status Access Control (NEW!)
- **Free & Basic Plans**: Only see finished/completed books
- **Premium Plan**: Early access to ongoing books (read as chapters are released)
- **Smart Backend Logic**: Automatic filtering based on subscription tier
- **Frontend Implementation**: Display badges and upgrade prompts

### What's New in Version 1.1.0

Previous update included several important features and enhancements:

#### 🎂 Age-Based Content Filtering
- **User Age Field**: Users can now set their age in their profile (0-150 years)
- **Content Types**: Books are classified as "kids" (0-17) or "adult" (18+)
- **Access Control**: 
  - Kids content: Accessible to everyone (logged in or not)
  - Adult content: Requires login + age ≥ 18
  - Users must set their age to access adult content
- **Frontend Impact**: Implement age guards and content filtering in your UI

#### 📊 Public Analytics Endpoint
- **No Authentication Required**: New `/api/analytics/public` endpoint
- **Landing Page Data**: Get top books and top authors for showcasing
- **Rich Metrics**: Includes views, likes (totalLikes), ratings, downloads
- **Author Stats**: Author data now includes totalLikes across all books
- **Use Case**: Perfect for landing pages and marketing materials

#### 📅 Subscription Duration Control
- **Flexible Duration**: Subscriptions now support custom duration in days
- **Duration Parameter**: 1-3650 days (30 default for monthly)
- **Common Values**: 30 (monthly), 90 (quarterly), 365 (yearly)
- **Response Data**: Returns subscriptionDuration and subscriptionExpiresAt
- **Use Case**: Build flexible pricing pages with different duration options

#### 🔞 Content Type Management
- **New Endpoint**: `PATCH /api/books/:id/content-type`
- **Author Control**: Authors can change book content type (kids/adult)
- **Immediate Effect**: Changes take effect instantly for all users
- **Use Case**: Add content rating controls in author dashboard

#### 📥 Enhanced Download Feature
- **Clean PDFs**: Removed watermarks and extra pages
- **Better Layout**: Full page utilization without wasted space
- **Content Focus**: Only book content, no unnecessary footers
- **Age Restriction**: Download respects age-based access control

#### 🔍 Search & Filter with Book Status Access
- **Search Capability**: All users can search by title, tags, author name, and genre
- **Free & Basic Users**: Can only read **finished/completed** books
- **Premium Users**: Can read **ongoing** books (early access to incomplete books)
- **Premium Content**: Both Basic and Premium users can access premium books (isPremium)
- **Smart Filtering**: Backend automatically filters books based on user's plan

#### 🖼️ Cloudinary Integration
- **Profile Images**: Upload user avatars to Cloudinary
- **Cover Images**: Upload user cover images to Cloudinary
- **Book Covers**: Upload book cover images to Cloudinary
- **Automatic Handling**: Images are automatically uploaded and URLs returned

### Migration Guide from v1.0.0

If you're upgrading from version 1.0.0, here's what you need to update:

1. **Add Age Verification UI**:
   - Add age field to user profile forms
   - Implement age guard components for adult content
   - Display age badges (18+) on adult books

2. **Implement Public Analytics**:
   - Add analytics fetching to landing page
   - Display top books and authors
   - Use totalLikes instead of likes for accurate counts

3. **Update Subscription Forms**:
   - Add duration selector (monthly/quarterly/yearly)
   - Display subscriptionDuration in user profile
   - Show exact expiration date from subscriptionExpiresAt

4. **Add Content Type Controls** (for authors):
   - Add content type selector when creating/editing books
   - Show current contentType in book management UI
   - Allow authors to change content type post-publication

5. **Update Book Filtering**:
   - Filter books by contentType based on user age
   - Show appropriate messages for age-restricted content
   - Handle AGE_NOT_SET and AGE_RESTRICTED error codes

6. **Implement Book Status Badges**:
   - Display "Ongoing" or "Completed" badges on book cards
   - Show "Early Access" badge for ongoing books (Premium only)
   - Filter book lists based on user plan (Free/Basic see only finished)
   - Add upgrade prompts for free users wanting ongoing books

---

## Setup & Configuration

### 1. Environment Variables

Create a `.env` file in your frontend project:

```env
VITE_API_BASE_URL=http://localhost:5001/api
# or for Create React App:
REACT_APP_API_BASE_URL=http://localhost:5001/api
# or for Next.js:
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api
```

### 2. Install HTTP Client

Choose your preferred HTTP client:

**Axios:**
```bash
npm install axios
```

**Fetch API:**
Built into modern browsers (no installation needed)

---

## Authentication Flow

### Complete Authentication Flow

```
1. User Registration → Email Verification → Login
2. Store tokens (access + refresh) securely
3. Include access token in API requests
4. Handle token expiration → Auto-refresh
5. Logout → Clear tokens
```

### Token Management

**What to Store:**
- `accessToken`: Short-lived (15 min) - for API requests
- `refreshToken`: Long-lived (7 days) - for getting new access token
- `user`: User profile data

**Where to Store:**

1. **LocalStorage** (Simple, but less secure)
```javascript
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);
```

2. **SessionStorage** (More secure, lost on tab close)
```javascript
sessionStorage.setItem('accessToken', token);
sessionStorage.setItem('refreshToken', refreshToken);
```

3. **Memory + HttpOnly Cookies** (Most secure, recommended for production)
- Store refresh token in httpOnly cookie (backend sets it)
- Store access token in memory (React state/Vuex/Redux)

---

## API Service Layer

### Base Configuration (Axios)

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Base Configuration (Fetch)

Create `src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Handle token expiration
      if (response.status === 401 && !options._retry) {
        const newToken = await this.refreshToken();
        if (newToken) {
          // Retry with new token
          return this.request(endpoint, { ...options, _retry: true });
        } else {
          // Redirect to login
          this.logout();
          throw new Error('Session expired');
        }
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const accessToken = localStorage.getItem('accessToken');
    
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        return newAccessToken;
      }
      
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default new ApiService();
```

---

## State Management

### React Context Example

Create `src/contexts/AuthContext.jsx`:

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Common Integration Patterns

### 1. Authentication Examples

#### Register User

```javascript
import api from './services/api';

async function registerUser(name, email, password) {
  try {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
    });
    console.log('Registration successful:', response.data);
    // Show message: "Check your email for verification code"
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response?.data);
    throw error;
  }
}
```

#### Verify Email

```javascript
async function verifyEmail(email, code) {
  try {
    const response = await api.post('/auth/verify-email', {
      email,
      code,
    });
    console.log('Email verified:', response.data);
    return response.data;
  } catch (error) {
    console.error('Verification failed:', error.response?.data);
    throw error;
  }
}
```

#### Login

```javascript
async function loginUser(email, password) {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    const { accessToken, refreshToken, user } = response.data.data;
    
    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user };
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed';
    return { success: false, error: message };
  }
}
```

### 2. Book Operations

#### Get All Books (with pagination)

```javascript
async function getBooks(page = 1, limit = 10) {
  try {
    const response = await api.get(`/books?page=${page}&limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch books:', error);
    throw error;
  }
}

// Usage in React component
function BookList() {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      try {
        const data = await getBooks(1, 12);
        setBooks(data.books);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, []);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="book-grid">
            {books.map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
          {pagination && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              hasMore={pagination.hasMore}
            />
          )}
        </>
      )}
    </div>
  );
}
```

#### Get Book by ID

```javascript
async function getBook(bookId) {
  try {
    const response = await api.get(`/books/${bookId}?chapterPage=1&chapterLimit=10`);
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 403) {
      const code = error.response.data.code;
      if (code === 'AGE_RESTRICTED') {
        throw new Error('You must be 18+ to access this content');
      } else if (code === 'AGE_NOT_SET') {
        throw new Error('Please set your age in profile settings');
      } else if (code === 'SUBSCRIPTION_REQUIRED') {
        throw new Error('Premium subscription required');
      }
    }
    throw error;
  }
}
```

#### Search Books

```javascript
async function searchBooks(filters) {
  const params = new URLSearchParams();
  
  if (filters.title) params.append('title', filters.title);
  if (filters.author) params.append('author', filters.author);
  if (filters.genre) params.append('genre', filters.genre);
  if (filters.tags) params.append('tags', filters.tags);
  if (filters.sortByLikes) params.append('sortByLikes', filters.sortByLikes);
  
  params.append('page', filters.page || 1);
  params.append('limit', filters.limit || 10);
  
  try {
    const response = await api.get(`/books/search?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    if (error.response?.data?.code === 'PREMIUM_FEATURE_ONLY') {
      throw new Error('Upgrade to Premium to use advanced filters');
    }
    throw error;
  }
}
```

#### Create Book

```javascript
async function createBook(bookData, coverImage) {
  const formData = new FormData();
  
  formData.append('title', bookData.title);
  formData.append('genre', bookData.genre);
  formData.append('tags', bookData.tags);
  formData.append('isPremium', bookData.isPremium);
  formData.append('contentType', bookData.contentType); // 'kids' or 'adult'
  formData.append('chapters', JSON.stringify(bookData.chapters));
  
  if (coverImage) {
    formData.append('image', coverImage);
  }
  
  try {
    const response = await api.post('/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to create book:', error);
    throw error;
  }
}

// Usage
const chapters = [
  { title: 'Chapter 1', content: 'Content here...' },
  { title: 'Chapter 2', content: 'More content...' },
];

const bookData = {
  title: 'My New Book',
  genre: 'Fantasy',
  tags: 'magic, adventure',
  isPremium: false,
  contentType: 'kids',
  chapters: chapters,
};

await createBook(bookData, coverImageFile);
```

#### Update Book Content Type

Change the age-appropriateness of a book (kids or adult).

```javascript
async function updateBookContentType(bookId, contentType) {
  try {
    const response = await api.patch(`/books/${bookId}/content-type`, {
      contentType // 'kids' or 'adult'
    });
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('Only the book author can change content type');
    }
    console.error('Failed to update content type:', error);
    throw error;
  }
}

// Usage examples
await updateBookContentType('book123', 'adult'); // Restrict to 18+
await updateBookContentType('book123', 'kids');  // Make accessible to all
```

**React Component Example:**

```javascript
function ContentTypeToggle({ bookId, currentContentType, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleToggle = async (newType) => {
    if (newType === currentContentType) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedBook = await updateBookContentType(bookId, newType);
      onUpdate(updatedBook);
      toast.success(`Book is now suitable for ${newType === 'kids' ? 'all ages' : 'adults only'}`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-type-toggle">
      <label>Content Type:</label>
      <div className="toggle-buttons">
        <button
          onClick={() => handleToggle('kids')}
          disabled={loading}
          className={currentContentType === 'kids' ? 'active' : ''}
        >
          👶 Kids (0-17)
        </button>
        <button
          onClick={() => handleToggle('adult')}
          disabled={loading}
          className={currentContentType === 'adult' ? 'active' : ''}
        >
          🔞 Adult (18+)
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

#### Publish Book

```javascript
async function publishBook(bookId) {
  try {
    const response = await api.post(`/books/${bookId}/publish`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to publish book:', error);
    throw error;
  }
}

// Usage
await publishBook('book123');
```

#### Toggle Premium Status

```javascript
async function toggleBookPremium(bookId) {
  try {
    const response = await api.post(`/books/${bookId}/toggle-premium`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to toggle premium status:', error);
    throw error;
  }
}

// Usage
const updatedBook = await toggleBookPremium('book123');
console.log('Is Premium:', updatedBook.isPremium);
```

#### Update Book Status (Ongoing/Finished)

```javascript
async function updateBookStatus(bookId, bookStatus) {
  try {
    const response = await api.patch(`/books/${bookId}/status`, {
      bookStatus // 'ongoing' or 'finished'
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to update book status:', error);
    throw error;
  }
}

// Usage
await updateBookStatus('book123', 'finished');
```

#### Update Book (General)

```javascript
async function updateBook(bookId, updateData, coverImage) {
  const formData = new FormData();
  
  if (updateData.title) formData.append('title', updateData.title);
  if (updateData.genre) formData.append('genre', updateData.genre);
  if (updateData.tags) formData.append('tags', updateData.tags);
  if (updateData.isPremium !== undefined) formData.append('isPremium', updateData.isPremium);
  if (updateData.contentType) formData.append('contentType', updateData.contentType);
  
  if (coverImage) {
    formData.append('image', coverImage);
  }
  
  try {
    const response = await api.patch(`/books/${bookId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to update book:', error);
    throw error;
  }
}

// Usage
await updateBook('book123', { 
  title: 'Updated Title',
  contentType: 'adult',
  isPremium: true 
}, newCoverImageFile);
```

#### Delete Book

```javascript
async function deleteBook(bookId) {
  if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
    return;
  }
  
  try {
    const response = await api.delete(`/books/${bookId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete book:', error);
    throw error;
  }
}

// Usage
await deleteBook('book123');
```

### 3. User Profile Operations

#### Update Profile

```javascript
async function updateProfile(userData) {
  try {
    const response = await api.patch('/users/me', userData);
    return response.data.data;
  } catch (error) {
    console.error('Profile update failed:', error);
    throw error;
  }
}

// Example usage:
await updateProfile({ 
  name: 'John Doe',
  bio: 'Avid reader and book enthusiast',
  age: 25  // IMPORTANT: Required to access adult content
});

// Set only age
await updateProfile({ age: 25 });
```

**Allowed Profile Fields:**
- `name`: String (min 2 characters)
- `bio`: String (max 500 characters)
- `age`: Number (0-150) - **Required for adult content access**

**Important Notes:**
- Users **must set their age** to access books with `contentType: "adult"`
- Users under 18 (age < 18) cannot access adult content
- Users 18+ can access both kids and adult content
- Non-logged-in users can only see kids content
```

#### Update Profile Image

```javascript
async function updateProfileImage(imageFile) {
  const formData = new FormData();
  formData.append('avatar', imageFile);
  
  try {
    const response = await api.patch('/users/me/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
}
```

#### Update Cover Image

```javascript
async function updateCoverImage(imageFile) {
  const formData = new FormData();
  formData.append('coverImage', imageFile);
  
  try {
    const response = await api.patch('/users/me/cover-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Cover image upload failed:', error);
    throw error;
  }
}
```

### 4. Rating & Like Operations

#### Rate a Book

```javascript
async function rateBook(bookId, rating) {
  try {
    const response = await api.post(`/books/${bookId}/rate`, { rating });
    return response.data.data;
  } catch (error) {
    console.error('Rating failed:', error);
    throw error;
  }
}
```

#### Like a Book

```javascript
async function likeBook(bookId) {
  try {
    const response = await api.post(`/books/${bookId}/like`);
    return response.data.data;
  } catch (error) {
    console.error('Like failed:', error);
    throw error;
  }
}
```

#### Unlike a Book

```javascript
async function unlikeBook(bookId) {
  try {
    const response = await api.post(`/books/${bookId}/unlike`);
    return response.data.data;
  } catch (error) {
    console.error('Unlike failed:', error);
    throw error;
  }
}
```

### 5. Subscription Operations

#### Activate Subscription

```javascript
async function subscribe(plan, duration = 30) {
  try {
    const response = await api.post('/subscriptions/activate', {
      plan, // 'basic' or 'premium'
      duration, // Number of days (e.g., 30, 90, 365) - defaults to 30
    });
    return response.data.data;
    // Returns: { plan, subscriptionStatus, subscriptionExpiresAt, subscriptionDuration }
  } catch (error) {
    console.error('Subscription failed:', error);
    throw error;
  }
}

// Example usage with different durations:
// Monthly: subscribe('premium', 30)
// Quarterly: subscribe('premium', 90)
// Yearly: subscribe('premium', 365)
```

**Subscription Plans:**
- `free`: Free tier (default for all users)
- `basic`: Basic subscription plan
- `premium`: Premium subscription plan with full access

**Duration Options:**
- Minimum: 1 day
- Maximum: 3650 days (10 years)
- Default: 30 days
- Common values: 30 (monthly), 90 (quarterly), 365 (yearly)

**Response includes:**
- `plan`: The activated plan name
- `subscriptionStatus`: "active" or "inactive"
- `subscriptionExpiresAt`: ISO date string of expiration
- `subscriptionDuration`: Number of days the subscription lasts
```

#### Get Subscription Status

```javascript
async function getSubscriptionStatus() {
  try {
    const response = await api.get('/subscriptions/status');
    return response.data.data;
  } catch (error) {
    console.error('Failed to get subscription:', error);
    throw error;
  }
}
```

### 6. Search and Filter Books

Search and filter books by title, tags, author name, and genre. **Book status filtering is automatic based on user plan.**

```javascript
async function searchBooks(searchParams) {
  try {
    const params = new URLSearchParams();
    
    // Search parameters
    if (searchParams.title) params.append('title', searchParams.title);
    if (searchParams.tags) params.append('tags', searchParams.tags);
    if (searchParams.author) params.append('author', searchParams.author);
    if (searchParams.genre) params.append('genre', searchParams.genre);
    
    // Pagination
    params.append('page', searchParams.page || 1);
    params.append('limit', searchParams.limit || 10);
    
    const response = await api.get(`/books/search?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

// Example usage:
const results = await searchBooks({
  title: 'fantasy',
  genre: 'Fiction',
  page: 1,
  limit: 20
});
```

**Search Capabilities by Plan:**

| Feature | Free | Basic | Premium |
|---------|------|-------|---------|
| Search by title | ✅ | ✅ | ✅ |
| Search by tags | ✅ | ✅ | ✅ |
| Search by author | ✅ | ✅ | ✅ |
| Search by genre | ✅ | ✅ | ✅ |
| See finished books | ✅ | ✅ | ✅ |
| See ongoing books (early access) | ❌ | ❌ | ✅ |
| Access premium books | ❌ | ✅ | ✅ |

**Book Status Access Rules:**
- **Free & Basic users**: Can only see and read **finished/completed** books
- **Premium users**: Can see both **ongoing** and **finished** books (early access)
- **Backend automatically filters** books based on user's plan - no need to filter on frontend

**Example: Display Search Results with Status Badges**

```javascript
function SearchResults({ books, userPlan }) {
  return (
    <div className="search-results">
      {books.map(book => (
        <div key={book._id} className="book-card">
          <img src={book.image} alt={book.title} />
          <h3>{book.title}</h3>
          <p className="author">by {book.author.name}</p>
          
          {/* Book Status Badge */}
          <div className="badges">
            {book.bookStatus === 'ongoing' && (
              <span className="badge ongoing">
                🚀 Ongoing {userPlan === 'premium' ? '(Early Access)' : ''}
              </span>
            )}
            {book.bookStatus === 'finished' && (
              <span className="badge finished">✅ Completed</span>
            )}
            
            {book.isPremium && (
              <span className="badge premium">⭐ Premium</span>
            )}
            
            {book.contentType === 'adult' && (
              <span className="badge adult">18+</span>
            )}
          </div>
          
          <button onClick={() => readBook(book._id)}>
            Read Now
          </button>
        </div>
      ))}
    </div>
  );
}
```

**Example: Upgrade Prompt for Free Users**

```javascript
function BookStatusNotice({ book, userPlan }) {
  if (book.bookStatus === 'ongoing' && (userPlan === 'free' || userPlan === 'basic')) {
    return (
      <div className="upgrade-notice">
        <h4>🚀 This book is still ongoing!</h4>
        <p>Upgrade to Premium to get early access to ongoing books and read chapters as they're released.</p>
        <button onClick={() => navigate('/subscription')}>
          Upgrade to Premium
        </button>
        <p className="note">This book will be available to all users once completed.</p>
      </div>
    );
  }
  
  return null;
}
```

### 7. Download Book

```javascript
async function downloadBook(bookId) {
  try {
    const response = await api.get(`/books/${bookId}/download`, {
      responseType: 'blob', // Important for file download
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `book-${bookId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  } catch (error) {
    if (error.response?.status === 403) {
      const code = error.response.data.code;
      if (code === 'SUBSCRIPTION_REQUIRED') {
        throw new Error('Premium subscription required to download');
      } else if (code === 'AGE_RESTRICTED') {
        throw new Error('Age restriction applies to this content');
      }
    }
    throw error;
  }
}
```

### 8. Public Analytics

Get platform-wide analytics without authentication (perfect for landing pages).

```javascript
async function getPublicAnalytics() {
  try {
    const response = await api.get('/analytics/public');
    return response.data.data;
  } catch (error) {
    console.error('Failed to get analytics:', error);
    throw error;
  }
}

// Example response structure:
// {
//   topBooks: [
//     {
//       _id: "book_id",
//       title: "Book Title",
//       description: "Book description",
//       author: {
//         _id: "author_id",
//         name: "Author Name",
//         avatar: "cloudinary_url"
//       },
//       image: "cloudinary_url",
//       genre: "Fiction",
//       isPremium: false,
//       publishedDate: "2025-01-15T00:00:00.000Z",
//       viewCount: 5000,
//       totalLikes: 450,        // Number of likes
//       averageRating: 4.5,
//       totalRatings: 120,
//       downloadCount: 230,
//       engagement: {
//         views: 5000,
//         likes: 450,
//         ratings: 120,
//         downloads: 230
//       }
//     }
//   ],
//   topAuthors: [
//     {
//       authorId: "author_id",
//       authorName: "Author Name",
//       authorEmail: "author@example.com",
//       authorAvatar: "cloudinary_url",
//       totalViews: 15000,
//       totalLikes: 1200,       // Total likes across all books
//       totalRatings: 450,
//       totalDownloads: 800,
//       averageRating: 4.3,
//       bookCount: 8,
//       engagement: {
//         views: 15000,
//         likes: 1200,
//         ratings: 450,
//         downloads: 800
//       }
//     }
//   ]
// }
```

**Usage Example - Landing Page:**

```javascript
// React Component
import React, { useEffect, useState } from 'react';
import { getPublicAnalytics } from '../services/api';

function LandingPage() {
  const [topBooks, setTopBooks] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await getPublicAnalytics();
        setTopBooks(data.topBooks || []);
        setTopAuthors(data.topAuthors || []);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="landing-page">
      <section className="top-books">
        <h2>🔥 Trending Books</h2>
        <div className="books-grid">
          {topBooks.map(book => (
            <div key={book._id} className="book-card">
              <img src={book.image} alt={book.title} />
              <h3>{book.title}</h3>
              <p className="author">by {book.author.name}</p>
              <div className="stats">
                <span>👁️ {book.viewCount.toLocaleString()} views</span>
                <span>❤️ {book.totalLikes} likes</span>
                <span>⭐ {book.averageRating} ({book.totalRatings})</span>
                <span>📥 {book.downloadCount} downloads</span>
              </div>
              {book.isPremium && <span className="badge">Premium</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="top-authors">
        <h2>⭐ Top Authors</h2>
        <div className="authors-grid">
          {topAuthors.map(author => (
            <div key={author.authorId} className="author-card">
              <img src={author.authorAvatar || '/default-avatar.png'} alt={author.authorName} />
              <h3>{author.authorName}</h3>
              <p>{author.bookCount} books published</p>
              <div className="author-stats">
                <span>👁️ {author.totalViews.toLocaleString()}</span>
                <span>❤️ {author.totalLikes.toLocaleString()} total likes</span>
                <span>⭐ {author.averageRating}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
```

---

## Analytics & Public Data

### Overview

The analytics endpoint provides valuable insights for your landing page without requiring authentication. This is perfect for showcasing popular content to visitors.

### Key Features

- **No Authentication Required**: Publicly accessible endpoint
- **Top Books**: Top 5 most viewed published books with comprehensive metrics
- **Top Authors**: Top 5 authors based on total views across all their books
- **Rich Metadata**: Includes likes, ratings, downloads, and engagement data
- **Author Information**: Populated author details with avatar and name

### Implementation Patterns

#### Pattern 1: Hero Section with Top Books

```javascript
function HeroSection({ topBooks }) {
  const featuredBook = topBooks[0]; // Display the #1 book prominently

  if (!featuredBook) return null;

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Discover {featuredBook.title}</h1>
        <p className="author">by {featuredBook.author.name}</p>
        <p className="description">{featuredBook.description}</p>
        <div className="engagement-stats">
          <div className="stat">
            <span className="number">{featuredBook.viewCount.toLocaleString()}</span>
            <span className="label">Readers</span>
          </div>
          <div className="stat">
            <span className="number">{featuredBook.totalLikes}</span>
            <span className="label">Likes</span>
          </div>
          <div className="stat">
            <span className="number">{featuredBook.averageRating}⭐</span>
            <span className="label">Rating</span>
          </div>
        </div>
        <button onClick={() => navigate(`/books/${featuredBook._id}`)}>
          Read Now
        </button>
      </div>
      <div className="hero-image">
        <img src={featuredBook.image} alt={featuredBook.title} />
      </div>
    </section>
  );
}
```

#### Pattern 2: Author Showcase

```javascript
function AuthorShowcase({ topAuthors }) {
  return (
    <section className="authors">
      <h2>Meet Our Top Authors</h2>
      <div className="authors-carousel">
        {topAuthors.map(author => (
          <div key={author.authorId} className="author-profile">
            <div className="avatar-wrapper">
              <img 
                src={author.authorAvatar || '/default-avatar.png'} 
                alt={author.authorName}
                className="avatar"
              />
            </div>
            <h3>{author.authorName}</h3>
            <div className="author-metrics">
              <div className="metric">
                <strong>{author.bookCount}</strong>
                <span>Books</span>
              </div>
              <div className="metric">
                <strong>{author.totalLikes.toLocaleString()}</strong>
                <span>Total Likes</span>
              </div>
              <div className="metric">
                <strong>{author.averageRating.toFixed(1)}⭐</strong>
                <span>Avg Rating</span>
              </div>
            </div>
            <p className="achievement">
              {author.totalViews.toLocaleString()} total views
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

#### Pattern 3: Statistics Dashboard

```javascript
function PlatformStats({ topBooks, topAuthors }) {
  // Calculate aggregate statistics
  const totalViews = topBooks.reduce((sum, book) => sum + book.viewCount, 0);
  const totalLikes = topBooks.reduce((sum, book) => sum + book.totalLikes, 0);
  const avgRating = topBooks.reduce((sum, book) => sum + book.averageRating, 0) / topBooks.length;

  return (
    <section className="platform-stats">
      <h2>Platform Insights</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{totalViews.toLocaleString()}</h3>
          <p>Total Views on Top Books</p>
        </div>
        <div className="stat-card">
          <h3>{totalLikes.toLocaleString()}</h3>
          <p>Total Likes</p>
        </div>
        <div className="stat-card">
          <h3>{avgRating.toFixed(1)}⭐</h3>
          <p>Average Rating</p>
        </div>
        <div className="stat-card">
          <h3>{topAuthors.length}</h3>
          <p>Featured Authors</p>
        </div>
      </div>
    </section>
  );
}
```

### Important Notes

1. **Caching**: Consider caching analytics data for 5-10 minutes to reduce server load
2. **Error Handling**: Always provide fallback UI if analytics fail to load
3. **Loading States**: Show skeleton loaders while data is being fetched
4. **Responsive Design**: Ensure analytics displays work on mobile devices
5. **SEO**: Use analytics data for meta tags and structured data

---

## File Upload Examples

### React Component for Image Upload

```javascript
import React, { useState } from 'react';
import api from '../services/api';

function ProfileImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('avatar', selectedFile);
    
    try {
      const response = await api.patch('/users/me/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload successful:', response.data);
      alert('Profile image updated!');
      
      // Update user context or state
      // updateUser({ avatar: response.data.data.avatar });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.response?.data?.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      
      {preview && (
        <div>
          <img src={preview} alt="Preview" style={{ maxWidth: '200px' }} />
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}

export default ProfileImageUpload;
```

---

## Error Handling

### Centralized Error Handler

```javascript
function handleApiError(error) {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    const code = data.code;
    const message = data.message;
    
    switch (code) {
      case 'TOKEN_EXPIRED':
        // Will be handled by interceptor
        break;
      
      case 'EMAIL_NOT_VERIFIED':
        return 'Please verify your email before logging in';
      
      case 'SUBSCRIPTION_REQUIRED':
        return 'This feature requires a Premium subscription';
      
      case 'AGE_RESTRICTED':
        return 'You must be 18+ to access this content';
      
      case 'AGE_NOT_SET':
        return 'Please set your age in profile settings';
      
      case 'INSUFFICIENT_PERMISSIONS':
        return 'You do not have permission to perform this action';
      
      case 'BOOK_NOT_FOUND':
        return 'Book not found';
      
      case 'VALIDATION_ERROR':
        return message || 'Please check your input';
      
      default:
        return message || 'An error occurred';
    }
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
}

// Usage
try {
  await someApiCall();
} catch (error) {
  const errorMessage = handleApiError(error);
  showToast(errorMessage, 'error');
}
```

---

## Age Restriction Implementation

### Age Guard Component (React)

```javascript
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function AgeGuard({ children, requiredAge = 18 }) {
  const { user } = useAuth();
  
  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Age not set - redirect to profile
  if (user.age === null || user.age === undefined) {
    return (
      <div>
        <h2>Age Verification Required</h2>
        <p>Please set your age in your profile to access this content.</p>
        <Link to="/profile/edit">Set Age</Link>
      </div>
    );
  }
  
  // Under required age
  if (user.age < requiredAge) {
    return (
      <div>
        <h2>Age Restricted Content</h2>
        <p>You must be {requiredAge} years or older to access this content.</p>
      </div>
    );
  }
  
  // All checks passed
  return children;
}

// Usage
<AgeGuard requiredAge={18}>
  <AdultBookPage />
</AgeGuard>
```

### Book Card with Age Badge

```javascript
function BookCard({ book }) {
  const { user } = useAuth();
  const canAccess = book.contentType === 'kids' || (user?.age && user.age >= 18);
  
  return (
    <div className="book-card">
      <img src={book.image} alt={book.title} />
      
      {book.contentType === 'adult' && (
        <span className="age-badge">18+</span>
      )}
      
      <h3>{book.title}</h3>
      
      {!canAccess && (
        <div className="restricted-overlay">
          <p>Age Restricted</p>
        </div>
      )}
      
      <button
        onClick={() => viewBook(book._id)}
        disabled={!canAccess}
      >
        {canAccess ? 'Read Now' : 'Age Restricted'}
      </button>
    </div>
  );
}
```

---

## Code Examples by Framework

### React Complete Example

```javascript
// src/pages/BookDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    loadBook();
  }, [id]);

  async function loadBook() {
    try {
      setLoading(true);
      const response = await api.get(`/books/${id}`);
      setBook(response.data.data);
      
      // Get user's rating if logged in
      if (user) {
        try {
          const ratingResponse = await api.get(`/books/${id}/rating/me`);
          setUserRating(ratingResponse.data.data.rating);
        } catch (err) {
          // User hasn't rated yet
          setUserRating(0);
        }
      }
    } catch (err) {
      if (err.response?.status === 403) {
        const code = err.response.data.code;
        if (code === 'AGE_NOT_SET') {
          setError('Please set your age in profile to access this book');
        } else if (code === 'AGE_RESTRICTED') {
          setError('This book is restricted to users 18 and older');
        } else if (code === 'SUBSCRIPTION_REQUIRED') {
          setError('Premium subscription required');
        }
      } else {
        setError('Failed to load book');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRating(rating) {
    try {
      await api.post(`/books/${id}/rate`, { rating });
      setUserRating(rating);
      // Reload book to get updated average
      loadBook();
    } catch (err) {
      alert('Failed to rate book');
    }
  }

  async function handleLike() {
    try {
      await api.post(`/books/${id}/like`);
      setBook(prev => ({ ...prev, likes: prev.likes + 1 }));
    } catch (err) {
      alert('Failed to like book');
    }
  }

  async function handleDownload() {
    try {
      const response = await api.get(`/books/${id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${book.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      if (err.response?.data?.code === 'SUBSCRIPTION_REQUIRED') {
        alert('Premium subscription required to download');
        navigate('/subscription');
      } else {
        alert('Download failed');
      }
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div className="book-details">
      <img src={book.image} alt={book.title} />
      
      <h1>{book.title}</h1>
      
      {book.contentType === 'adult' && (
        <span className="age-badge">18+</span>
      )}
      
      <div className="stats">
        <span>⭐ {book.averageRating.toFixed(1)} ({book.totalRatings} ratings)</span>
        <span>❤️ {book.likes} likes</span>
        <span>👁️ {book.viewCount} views</span>
      </div>
      
      {user && (
        <div className="user-actions">
          <div className="rating">
            <span>Your Rating:</span>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className={star <= userRating ? 'active' : ''}
              >
                ⭐
              </button>
            ))}
          </div>
          
          <button onClick={handleLike}>Like</button>
          <button onClick={handleDownload}>Download PDF</button>
        </div>
      )}
      
      <div className="chapters">
        <h2>Chapters ({book.totalChapters})</h2>
        {book.chapters.map(chapter => (
          <div key={chapter._id} className="chapter">
            <h3>{chapter.chapterNumber}. {chapter.title}</h3>
            <p>{chapter.content.substring(0, 200)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookDetailsPage;
```

### Vue 3 Complete Example

```vue
<!-- src/views/BookDetailsPage.vue -->
<template>
  <div v-if="loading" class="loading">Loading...</div>
  <div v-else-if="error" class="error">{{ error }}</div>
  <div v-else-if="book" class="book-details">
    <img :src="book.image" :alt="book.title" />
    
    <h1>{{ book.title }}</h1>
    
    <span v-if="book.contentType === 'adult'" class="age-badge">18+</span>
    
    <div class="stats">
      <span>⭐ {{ book.averageRating.toFixed(1) }} ({{ book.totalRatings }} ratings)</span>
      <span>❤️ {{ book.likes }} likes</span>
      <span>👁️ {{ book.viewCount }} views</span>
    </div>
    
    <div v-if="user" class="user-actions">
      <div class="rating">
        <span>Your Rating:</span>
        <button
          v-for="star in 5"
          :key="star"
          @click="handleRating(star)"
          :class="{ active: star <= userRating }"
        >
          ⭐
        </button>
      </div>
      
      <button @click="handleLike">Like</button>
      <button @click="handleDownload">Download PDF</button>
    </div>
    
    <div class="chapters">
      <h2>Chapters ({{ book.totalChapters }})</h2>
      <div v-for="chapter in book.chapters" :key="chapter._id" class="chapter">
        <h3>{{ chapter.chapterNumber }}. {{ chapter.title }}</h3>
        <p>{{ chapter.content.substring(0, 200) }}...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const book = ref(null);
const loading = ref(true);
const error = ref(null);
const userRating = ref(0);

const user = computed(() => authStore.user);

onMounted(() => {
  loadBook();
});

async function loadBook() {
  try {
    loading.value = true;
    const response = await api.get(`/books/${route.params.id}`);
    book.value = response.data.data;
    
    if (user.value) {
      try {
        const ratingResponse = await api.get(`/books/${route.params.id}/rating/me`);
        userRating.value = ratingResponse.data.data.rating;
      } catch (err) {
        userRating.value = 0;
      }
    }
  } catch (err) {
    if (err.response?.status === 403) {
      const code = err.response.data.code;
      if (code === 'AGE_NOT_SET') {
        error.value = 'Please set your age in profile to access this book';
      } else if (code === 'AGE_RESTRICTED') {
        error.value = 'This book is restricted to users 18 and older';
      } else if (code === 'SUBSCRIPTION_REQUIRED') {
        error.value = 'Premium subscription required';
      }
    } else {
      error.value = 'Failed to load book';
    }
  } finally {
    loading.value = false;
  }
}

async function handleRating(rating) {
  try {
    await api.post(`/books/${route.params.id}/rate`, { rating });
    userRating.value = rating;
    loadBook();
  } catch (err) {
    alert('Failed to rate book');
  }
}

async function handleLike() {
  try {
    await api.post(`/books/${route.params.id}/like`);
    book.value.likes++;
  } catch (err) {
    alert('Failed to like book');
  }
}

async function handleDownload() {
  try {
    const response = await api.get(`/books/${route.params.id}/download`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${book.value.title}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    if (err.response?.data?.code === 'SUBSCRIPTION_REQUIRED') {
      alert('Premium subscription required to download');
      router.push('/subscription');
    } else {
      alert('Download failed');
    }
  }
}
</script>
```

---

## Best Practices

### 1. Security
- Never store sensitive data in localStorage (consider httpOnly cookies)
- Always validate user input on frontend before sending
- Implement CSRF protection for production
- Use HTTPS in production

### 2. Performance
- Implement request debouncing for search
- Cache frequently accessed data
- Use pagination for large lists
- Lazy load images

### 3. User Experience
- Show loading states
- Provide clear error messages
- Implement optimistic UI updates
- Add retry logic for failed requests

### 4. Error Handling
- Catch and handle all API errors
- Provide user-friendly error messages
- Log errors for debugging
- Implement error boundaries (React)

---

## Testing Integration

### Example Test (Jest + React Testing Library)

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import api from '../services/api';
import BookDetailsPage from '../pages/BookDetailsPage';

jest.mock('../services/api');

describe('BookDetailsPage', () => {
  it('should load and display book', async () => {
    const mockBook = {
      _id: '123',
      title: 'Test Book',
      averageRating: 4.5,
      totalRatings: 10,
      likes: 100,
      viewCount: 500,
      chapters: [],
    };
    
    api.get.mockResolvedValue({ data: { data: mockBook } });
    
    render(<BookDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument();
    });
  });
  
  it('should handle age restriction error', async () => {
    api.get.mockRejectedValue({
      response: {
        status: 403,
        data: {
          code: 'AGE_RESTRICTED',
          message: 'Age restricted',
        },
      },
    });
    
    render(<BookDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/18 and older/i)).toBeInTheDocument();
    });
  });
});
```

---

## Quick Reference: Key Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout current session

### Users
- `GET /api/auth/me` - Get current user
- `PATCH /api/users/me` - Update profile (including age)
- `PATCH /api/users/me/profile-image` - Upload profile image
- `PATCH /api/users/me/cover-image` - Upload cover image

### Books
- `GET /api/books` - List all books (respects age restrictions + plan-based bookStatus filtering)
- `GET /api/books/search` - Search and filter books (title, tags, author, genre + auto bookStatus filtering)
- `GET /api/books/:id` - Get book details (respects age restrictions)
- `POST /api/books` - Create book (Author/Admin)
- `PATCH /api/books/:id` - Update book (Author/Admin)
- `PATCH /api/books/:id/content-type` - Update content type (Author/Admin)
- `POST /api/books/:id/like` - Like a book
- `POST /api/books/:id/unlike` - Unlike a book

### Chapters
- `GET /api/books/:id/chapters` - Get book chapters
- `GET /api/books/:id/chapters/:number` - Get specific chapter
- `POST /api/books/:bookId/chapters` - Add chapter (Author/Admin)
- `PATCH /api/books/:bookId/chapters/:id` - Update chapter (Author/Admin)

### Ratings
- `POST /api/books/:bookId/rate` - Rate book (1-5 stars)
- `GET /api/books/:bookId/rating/me` - Get my rating
- `DELETE /api/books/:bookId/rate` - Delete my rating
- `GET /api/books/:bookId/ratings` - Get all ratings (public)

### Subscriptions
- `POST /api/subscriptions/activate` - Activate subscription
- `GET /api/subscriptions/status` - Get subscription status

### Downloads
- `GET /api/books/:bookId/download` - Download book as PDF (Premium)

### Analytics
- `GET /api/analytics/public` - Public analytics (no auth required)

### Admin
- `GET /api/admin/analytics` - Platform analytics (Admin only)
- `DELETE /api/admin/books/:id` - Delete any book (Admin only)

---

## Error Codes Quick Reference

| Code | Status | When It Happens | What To Do |
|------|--------|----------------|------------|
| `TOKEN_EXPIRED` | 401 | Access token expired | Refresh token automatically |
| `INVALID_TOKEN` | 401 | Token is invalid | Redirect to login |
| `EMAIL_NOT_VERIFIED` | 403 | Email not verified | Prompt to verify email |
| `AGE_NOT_SET` | 403 | User hasn't set age | Redirect to profile to set age |
| `AGE_RESTRICTED` | 403 | User under 18 accessing adult content | Show age restriction message |
| `SUBSCRIPTION_REQUIRED` | 403 | Premium feature without subscription | Redirect to subscription page |
| `BOOK_NOT_FOUND` | 404 | Book doesn't exist | Show 404 page |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required role | Show unauthorized message |

---

## Support & Resources

- **API Documentation:** See `API_DOCUMENTATION.md`
- **Terms & Conditions:** See `TERMS_AND_CONDITIONS.md`
- **Privacy Policy:** See `PRIVACY_POLICY.md`
- **README:** See `README.md` for project overview

---

**Version:** 1.2.0  
**Last Updated:** November 23, 2025  
**For Frontend Developers**

For questions or issues, please refer to the API documentation or contact the backend team.

