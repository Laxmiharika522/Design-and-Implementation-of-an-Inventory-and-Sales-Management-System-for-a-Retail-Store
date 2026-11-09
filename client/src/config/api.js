/**
 * Global API Configuration for Development and AWS Production
 *
 * 1. If VITE_API_URL is provided at build time (e.g. VITE_API_URL=https://api.example.com/api), use it.
 * 2. In production (PROD), default to '/api' so relative requests work with CloudFront, Nginx reverse proxy,
 *    or unified Express static hosting without CORS or mixed-content issues.
 * 3. In development (DEV), default to 'http://localhost:5000/api'.
 */
export const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '' && envUrl !== '/api') {
    return envUrl.replace(/\/+$/, '');
  }
  if (import.meta.env.PROD) {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

export const API_BASE = getApiBase();
export default API_BASE;

