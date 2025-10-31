/**
 * Environment configuration
 * Centralizes access to environment variables
 */

// Get API base URL from Vite environment variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Export other environment variables as needed
export const NODE_ENV = import.meta.env.MODE || 'development';
