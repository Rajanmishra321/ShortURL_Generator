import axios from 'axios';

const API = axios.create({
  baseURL: 'https://shorturl-generator-xifp.onrender.com/api',
  withCredentials: true
});

// Request interceptor for auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;