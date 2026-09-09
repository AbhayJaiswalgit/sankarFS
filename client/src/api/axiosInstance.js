import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    // Redirect to login on 401
    if (error.response?.status === 401) {
      const isAuthRoute = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isAuthRoute) {
        window.location.href = '/login';
      }
    }

    return Promise.reject({ ...error, message });
  }
);

export default api;
