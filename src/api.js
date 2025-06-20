import axios from 'axios';

// Use localhost for all API calls (change to website URL for production)
const API = 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API,
}); 