import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton
} from '@mui/material';
import { 
  Storage as ServerIcon, 
  Article as LogIcon, 
  Warning as WarningIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useSnackbar } from '../contexts/SnackbarContext';

const DashboardPage = () => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    servers: [],
    logPaths: [],
    recentErrors: []
  });
  
  // Завантаження даних для панелі керування
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Запит на отримання серверів
        const serversResponse = await api.get('/api/servers');
        const servers = serversResponse.data.data.servers;
        
        // Запит на отримання шляхів до логів
        const logPathsResponse = await api.get('/api/log-paths');
        const logPaths = logPathsResponse.data.data.logPaths;
        
        // В реальному додатку тут можна було б завантажувати останні помилки з логів
        // Для прикладу створимо моковані дані
        const recentErrors = [
          { id: 1, timestamp: '2023-08-01 12:34:56', message: 'Error connecting to database', server: 'Database Server' },
          { id: 2, timestamp: '2023-08-01 10:22:15', message: 'API request timeout', server: 'API Server' },
          { id: 3, timestamp: '2023-07-31 23:15:42', message: 'Out of memory exception', server: 'Web Server' }
        ];
        
        setStats({ servers, logPaths, recentErrors });
      } catch (error) {
        console.error('Помилка завантаження даних панелі керування:', error);
        showSnackbar('Помилка завантаження даних панелі керування', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [showSnackbar]);
  
  // Відображення під час завантаження
  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Панель керування
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Сервери
                </Typography>
                <Skeleton variant="rectangular" height={120} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Шляхи до логів
                </Typography>
                <Skeleton variant="rectangular" height={120} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Останні помилки
                </Typography>
                <Skeleton variant="rectangular" height={200} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель керування
      </Typography>
      
      <Grid container spacing={3}>
        {/* Картка серверів */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ServerIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Сервери
                </Typography>
              </Box>
              
              <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
                {stats.servers.length}
              </Typography>
              
              {stats.servers.length > 0 ? (
                <List dense>
                  {stats.servers.slice(0, 3).map((server) => (
                    <ListItem key={server.id} disablePadding>
                      <ListItemText 
                        primary={server.name} 
                        secondary={`${server.host}:${server.port}`} 
                      />
                    </ListItem>
                  ))}
                  {stats.servers.length > 3 && (
                    <Typography variant="body2" color="text.secondary" align="right">
                      ...та ще {stats.servers.length - 3}
                    </Typography>
                  )}
                </List>
              ) : (
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    У вас ще немає серверів
                  </Typography>
                </Paper>
              )}
            </CardContent>
            <Divider />
            <CardActions>
              <Button 
                component={RouterLink} 
                to="/servers" 
                size="small" 
                color="primary"
              >
                Перейти до серверів
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Картка шляхів до логів */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LogIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Шляхи до логів
                </Typography>
              </Box>
              
              <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
                {stats.logPaths.length}
              </Typography>
              
              {stats.logPaths.length > 0 ? (
                <List dense>
                  {stats.logPaths.slice(0, 3).map((logPath) => (
                    <ListItem key={logPath.id} disablePadding>
                      <ListItemText 
                        primary={logPath.name} 
                        secondary={logPath.path} 
                      />
                    </ListItem>
                  ))}
                  {stats.logPaths.length > 3 && (
                    <Typography variant="body2" color="text.secondary" align="right">
                      ...та ще {stats.logPaths.length - 3}
                    </Typography>
                  )}
                </List>
              ) : (
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    У вас ще немає шляхів до логів
                  </Typography>
                </Paper>
              )}
            </CardContent>
            <Divider />
            <CardActions>
              <Button 
                component={RouterLink} 
                to="/log-paths" 
                size="small" 
                color="primary"
              >
                Перейти до логів
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Картка останніх помилок */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WarningIcon color="error" fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Останні помилки
                </Typography>
              </Box>
              
              {stats.recentErrors.length > 0 ? (
                <List>
                  {stats.recentErrors.map((error) => (
                    <ListItem key={error.id} divider>
                      <ListItemText 
                        primary={error.message}
                        secondary={
                          <Box component="span" display="flex" justifyContent="space-between">
                            <Typography variant="body2" component="span">
                              {error.server}
                            </Typography>
                            <Typography variant="body2" component="span" color="text.secondary">
                              {error.timestamp}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Немає зареєстрованих помилок
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
