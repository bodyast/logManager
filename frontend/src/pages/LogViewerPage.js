import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert, 
  Toolbar, 
  AppBar, 
  IconButton, 
  Tooltip, 
  Switch, 
  FormControlLabel, 
  TextField, 
  InputAdornment, 
  Chip 
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  PlayArrow as PlayIcon, 
  Stop as StopIcon, 
  ArrowDownward as ScrollDownIcon, 
  Clear as ClearIcon, 
  Search as SearchIcon 
} from '@mui/icons-material';
import api from '../services/api';
import { useSnackbar } from '../contexts/SnackbarContext';
import createSocketConnection from '../services/socket';
import { useAuth } from '../contexts/AuthContext';

const LogViewerPage = () => {
  const { logPathId } = useParams();
  const { showSnackbar } = useSnackbar();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [logPath, setLogPath] = useState(null);
  const [server, setServer] = useState(null);
  const [logContent, setLogContent] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredContent, setFilteredContent] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  
  // Референція до контейнера логів для прокрутки
  const logContainerRef = useRef(null);
  // Референція до WebSocket з'єднання
  const socketRef = useRef(null);
  
  // Завантаження початкових даних
  useEffect(() => {
    const fetchLogData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/logs/${logPathId}`, {
          params: { lines: 500 }
        });
        
        const { content, logPath: logPathData, server: serverData } = response.data.data;
        
        setLogPath(logPathData);
        setServer(serverData);
        setLogContent(content);
        setFilteredContent(content);
      } catch (error) {
        console.error('Помилка завантаження логу:', error);
        showSnackbar('Помилка завантаження даних логу', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogData();
    
    // Очищення при розмонтуванні
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [logPathId, showSnackbar]);
  
  // Прокрутка вниз при оновленні контенту
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredContent, autoScroll]);
  
  // Фільтрація контенту при зміні пошукового тексту
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredContent(logContent);
      setFilterActive(false);
      return;
    }
    
    try {
      // Фільтрація рядків, які містять пошуковий текст
      const lines = logContent.split('\n');
      const filtered = lines
        .filter(line => line.toLowerCase().includes(searchText.toLowerCase()))
        .join('\n');
      
      setFilteredContent(filtered);
      setFilterActive(true);
    } catch (error) {
      console.error('Помилка фільтрації логу:', error);
      setFilteredContent(logContent);
      setFilterActive(false);
    }
  }, [searchText, logContent]);
  
  // Оновлення логу
  const handleRefresh = async () => {
    try {
      const response = await api.get(`/api/logs/${logPathId}`, {
        params: { lines: 500 }
      });
      
      const { content } = response.data.data;
      setLogContent(content);
      showSnackbar('Лог оновлено', 'success');
    } catch (error) {
      console.error('Помилка оновлення логу:', error);
      showSnackbar('Помилка оновлення логу', 'error');
    }
  };
  
  // Очищення контенту логу
  const handleClear = () => {
    setLogContent('');
    setFilteredContent('');
    showSnackbar('Лог очищено', 'success');
  };
  
  // Прокрутка вниз
  const handleScrollToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  };
  
  // Запуск потокової передачі логу
  const handleStartStreaming = () => {
    // Створення WebSocket з'єднання
    const socket = createSocketConnection(token);
    socketRef.current = socket;
    
    // Підключення до сервера
    socket.connect();
    
    // Обробники подій WebSocket
    socket.on('connect', () => {
      // Запуск трансляції логу
      socket.emit('startLogStream', { logPathId });
      setStreaming(true);
      showSnackbar('Потокова трансляція логу запущена', 'success');
    });
    
    socket.on('connected', (data) => {
      console.log('Підключено до логу:', data);
    });
    
    socket.on('logData', (data) => {
      setLogContent(prev => prev + data.data);
    });
    
    socket.on('error', (error) => {
      console.error('Помилка потокової трансляції:', error);
      showSnackbar(`Помилка: ${error.message}`, 'error');
      handleStopStreaming();
    });
    
    socket.on('streamClosed', () => {
      handleStopStreaming();
      showSnackbar('Потік логу закрито', 'info');
    });
    
    socket.on('disconnect', () => {
      setStreaming(false);
      showSnackbar('Відключено від сервера', 'info');
    });
  };
  
  // Зупинка потокової передачі логу
  const handleStopStreaming = () => {
    if (socketRef.current) {
      // Зупинка трансляції логу
      socketRef.current.emit('stopLogStream', { logPathId });
      // Відключення сокета
      socketRef.current.disconnect();
      socketRef.current = null;
      setStreaming(false);
      showSnackbar('Потокова трансляція логу зупинена', 'info');
    }
  };
  
  // Рендер вмісту логу з підсвіткою пошукового тексту
  const renderLogContent = () => {
    if (!filteredContent) {
      return <Typography color="textSecondary">Лог порожній</Typography>;
    }
    
    if (!searchText.trim() || !filterActive) {
      // Простий рендер без підсвітки
      return filteredContent.split('\n').map((line, index) => (
        <div key={index} className="log-line">
          {line || ' '}
        </div>
      ));
    }
    
    // Рендер з підсвіткою пошукового тексту
    return filteredContent.split('\n').map((line, index) => {
      if (!line) return <div key={index} className="log-line"> </div>;
      
      // Простий спосіб підсвітки (для складніших випадків можна використати регулярні вирази)
      const parts = line.split(new RegExp(`(${searchText})`, 'gi'));
      
      return (
        <div key={index} className="log-line">
          {parts.map((part, i) => 
            part.toLowerCase() === searchText.toLowerCase() ? 
              <span key={i} style={{ backgroundColor: 'yellow', color: 'black' }}>{part}</span> : 
              part
          )}
        </div>
      );
    });
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!logPath || !server) {
    return (
      <Alert severity="error">
        Лог не знайдено
      </Alert>
    );
  }
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Верхня панель інструментів */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Box>
            <Typography variant="h5">
              {logPath.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {server.name} ({server.host}) - {logPath.path}
            </Typography>
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to={`/servers/${server.id}`}
              sx={{ mr: 1 }}
            >
              Назад до сервера
            </Button>
            
            <Button
              variant="contained"
              color={streaming ? 'error' : 'success'}
              startIcon={streaming ? <StopIcon /> : <PlayIcon />}
              onClick={streaming ? handleStopStreaming : handleStartStreaming}
            >
              {streaming ? 'Зупинити' : 'Запустити'} трансляцію
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Панель інструментів для логу */}
      <AppBar 
        position="static" 
        color="default" 
        sx={{ 
          boxShadow: 'none', 
          borderTopLeftRadius: 4, 
          borderTopRightRadius: 4
        }}
      >
        <Toolbar variant="dense">
          <Box display="flex" alignItems="center" width="100%" justifyContent="space-between" flexWrap="wrap">
            <Box display="flex" alignItems="center">
              <Tooltip title="Оновити лог">
                <IconButton onClick={handleRefresh} disabled={streaming}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Очистити вміст">
                <IconButton onClick={handleClear}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Прокрутити вниз">
                <IconButton onClick={handleScrollToBottom}>
                  <ScrollDownIcon />
                </IconButton>
              </Tooltip>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    color="primary"
                  />
                }
                label="Автопрокрутка"
              />
              
              {filterActive && (
                <Chip 
                  label={`Знайдено: ${filteredContent.split('\n').filter(Boolean).length}`} 
                  color="primary" 
                  variant="outlined" 
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
            
            <TextField
              placeholder="Пошук у логу"
              variant="outlined"
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchText('')}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 1, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}
            />
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Вміст логу */}
      <Paper 
        sx={{ 
          flexGrow: 1, 
          overflow: 'hidden',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0
        }}
      >
        <Box 
          ref={logContainerRef}
          className="log-viewer" 
        >
          {renderLogContent()}
        </Box>
      </Paper>
    </Box>
  );
};

export default LogViewerPage;
