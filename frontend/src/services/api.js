import axios from 'axios';

// Створення екземпляру axios з базовим URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/',
  withCredentials: true, // Для роботи з HTTP-only cookies
});

// Додавання перехоплювача запитів для встановлення Authorization заголовка
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Додавання перехоплювача відповідей для обробки помилок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Якщо токен прострочений або недійсний, перенаправляємо на сторінку входу
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Додамо перевірку, щоб уникнути нескінченної петлі
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
