# Readian Frontend Integration Guide

**Version:** 1.0.0  
**Last Updated:** November 20, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [Authentication Flow](#authentication-flow)
4. [API Service Layer](#api-service-layer)
5. [State Management](#state-management)
6. [Common Integration Patterns](#common-integration-patterns)
7. [File Upload Examples](#file-upload-examples)
8. [Error Handling](#error-handling)
9. [Age Restriction Implementation](#age-restriction-implementation)
10. [Code Examples by Framework](#code-examples-by-framework)

---

## Overview

This guide provides comprehensive instructions for integrating the Readian API into your frontend application. Whether you're using React, Vue, Angular, or vanilla JavaScript, this guide covers everything you need to know.

### Base URL

```
Development: http://localhost:5001/api
Production: https://your-production-domain.com/api
```

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

// Example: Set user age
await updateProfile({ age: 25 });
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
      duration, // days
    });
    return response.data.data;
  } catch (error) {
    console.error('Subscription failed:', error);
    throw error;
  }
}
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

### 6. Download Book

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

## Support & Resources

- **API Documentation:** See `API_DOCUMENTATION.md`
- **Terms & Conditions:** See `TERMS_AND_CONDITIONS.md`
- **Privacy Policy:** See `PRIVACY_POLICY.md`

---

**Last Updated:** November 20, 2025  
**Version:** 1.0.0

