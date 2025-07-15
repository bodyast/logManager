import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  IconButton, 
  Tooltip, 
  Chip, 
  CircularProgress, 
  InputBase, 
  Divider, 
  Card, 
  CardContent 
} from '@mui/material';
import { 
  Visibility as VisibilityIcon, 
  Search as SearchIcon, 
  Storage as ServerIcon, 
  Clear as ClearIcon 
} from '@mui/icons-material';
import api from '../services/api';
import { useSnackbar } from '../contexts/SnackbarContext';

const LogPathsPage = () => {
  const { showSnackbar } = useSnackbar();
  const [logPaths, setLogPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLogPaths, setFilteredLogPaths] = useState([]);
  
  // Завантаження шляхів до логів
  useEffect(() => {
    const fetchLogPaths = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/log-paths');
        setLogPaths(response.data.data.logPaths);
        setFilteredLogPaths(response.data.data.logPaths);
      } catch (error) {
        console.error('Помилка завантаження шляхів до логів:', error);
        showSnackbar('Помилка завантаження шляхів до логів', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogPaths();
  }, [showSnackbar]);
  
  // Фільтрація шляхів до логів при зміні пошукового запиту
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLogPaths(logPaths);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = logPaths.filter(logPath => 
      logPath.name.toLowerCase().includes(lowercaseQuery) ||
      logPath.path.toLowerCase().includes(lowercaseQuery) ||
      logPath.server_name?.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredLogPaths(filtered);
  }, [searchQuery, logPaths]);
  
  // Очищення пошукового запиту
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // Групування логів за серверами
  const groupedByServer = filteredLogPaths.reduce((acc, logPath) => {
    const serverName = logPath.server_name || 'Невідомий сервер';
    if (!acc[serverName]) {
      acc[serverName] = [];
    }
    acc[serverName].push(logPath);
    return acc;
  }, {});
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Шляхи до логів
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/servers"
        >
          Керувати серверами
        </Button>
      </Box>
      
      {/* Пошукова панель */}
      <Paper
        component="form"
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', mb: 3 }}
      >
        <IconButton sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Пошук за назвою, шляхом або сервером"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <IconButton sx={{ p: '10px' }} aria-label="clear" onClick={handleClearSearch}>
            <ClearIcon />
          </IconButton>
        )}
      </Paper>
      
      {logPaths.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 3 }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Шляхи до логів не знайдено
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Додайте шляхи до логів на сторінці сервера
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/servers"
            >
              Перейти до серверів
            </Button>
          </CardContent>
        </Card>
      ) : filteredLogPaths.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 3 }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Нічого не знайдено за запитом "{searchQuery}"
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleClearSearch}
            >
              Очистити пошук
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedByServer).map(([serverName, serverLogPaths]) => (
          <Box key={serverName} mb={4}>
            <Box 
              display="flex" 
              alignItems="center" 
              mb={2}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 1
              }}
            >
              <ServerIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" component="h2">
                {serverName}
              </Typography>
              <Chip 
                label={`${serverLogPaths.length} ${serverLogPaths.length === 1 ? 'лог' : 'логи'}`} 
                size="small" 
                sx={{ ml: 2 }} 
              />
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Назва</TableCell>
                    <TableCell>Шлях</TableCell>
                    <TableCell>Опис</TableCell>
                    <TableCell align="right">Дії</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {serverLogPaths.map((logPath) => (
                    <TableRow key={logPath.id}>
                      <TableCell component="th" scope="row">
                        <Typography variant="body1" fontWeight="medium">
                          {logPath.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace',
                            bgcolor: 'background.default',
                            p: 0.5,
                            borderRadius: 1,
                            display: 'inline-block'
                          }}
                        >
                          {logPath.path}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {logPath.description || '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Переглянути лог">
                          <IconButton 
                            component={RouterLink} 
                            to={`/logs/${logPath.id}`}
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      )}
    </Box>
  );
};

export default LogPathsPage;
