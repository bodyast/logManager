import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSnackbar } from './SnackbarContext';

// Створення контексту
const AuthContext = createContext();

// Провайдер контексту
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  
  const isAuthenticated = !!token;
  
  // Встановлення токену авторизації для axios
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);
  
  // Завантаження даних користувача при наявності токену
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data.data.user);
      } catch (error) {
        console.error('Помилка отримання даних користувача:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
  }, [token]);
  
  // Реєстрація користувача
  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      const { token: newToken, data } = response.data;
      
      setToken(newToken);
      setUser(data.user);
      showSnackbar('Реєстрація успішна', 'success');
      navigate('/dashboard');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Помилка реєстрації';
      showSnackbar(message, 'error');
      return false;
    }
  };
  
  // Авторизація користувача
  const login = async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { token: newToken, data } = response.data;
      
      setToken(newToken);
      setUser(data.user);
      showSnackbar('Авторизація успішна', 'success');
      navigate('/dashboard');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Помилка авторизації';
      showSnackbar(message, 'error');
      return false;
    }
  };
  
  // Вихід з системи
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Помилка виходу:', error);
    } finally {
      setToken(null);
      setUser(null);
      showSnackbar('Вихід виконано успішно', 'success');
      navigate('/login');
    }
  };
  
  // Оновлення пароля
  const updatePassword = async (passwordData) => {
    try {
      await api.patch('/api/auth/update-password', passwordData);
      showSnackbar('Пароль успішно оновлено', 'success');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Помилка оновлення пароля';
      showSnackbar(message, 'error');
      return false;
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        register,
        login,
        logout,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Хук для використання контексту
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
