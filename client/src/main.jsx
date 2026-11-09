import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { API_BASE } from './config/api';

// Set base URL for absolute dev endpoints (like http://localhost:5000)
if (API_BASE.startsWith('http://') || API_BASE.startsWith('https://')) {
  axios.defaults.baseURL = API_BASE;
} else {
  axios.defaults.baseURL = '';
}

// Automatically attach JWT and normalize API routes
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Normalize URLs to prevent duplicate /api/api or missing /api prefix in production
  if (config.url && !config.url.startsWith('http://') && !config.url.startsWith('https://')) {
    let clean = config.url.replace(/^(\/api)+/, '/api');
    if (!clean.startsWith('/api')) {
      clean = '/api' + (clean.startsWith('/') ? clean : '/' + clean);
    }
    config.url = clean;
  }

  return config;
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
