import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { CssBaseline } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Компоненти
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ServersPage from './pages/ServersPage';
import ServerDetailPage from './pages/ServerDetailPage';
import LogPathsPage from './pages/LogPathsPage';
import LogViewerPage from './pages/LogViewerPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import GlobalSnackbar from './components/GlobalSnackbar';

// Маршрути з обмеженим доступом
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Маршрути для неавторизованих користувачів
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <>
      <CssBaseline />
      <GlobalSnackbar />
      <Routes>
        {/* Публічні маршрути */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route 
          path="/login" 
          element={<PublicRoute><LoginPage /></PublicRoute>} 
        />
        <Route 
          path="/register" 
          element={<PublicRoute><RegisterPage /></PublicRoute>} 
        />
        
        {/* Приватні маршрути */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/servers" 
          element={
            <PrivateRoute>
              <Layout>
                <ServersPage />
              </Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/servers/:id" 
          element={
            <PrivateRoute>
              <Layout>
                <ServerDetailPage />
              </Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/log-paths" 
          element={
            <PrivateRoute>
              <Layout>
                <LogPathsPage />
              </Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/logs/:logPathId" 
          element={
            <PrivateRoute>
              <Layout>
                <LogViewerPage />
              </Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </PrivateRoute>
          } 
        />
        
        {/* Маршрут 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
