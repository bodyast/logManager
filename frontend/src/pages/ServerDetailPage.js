import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Divider, 
  Chip, 
  CircularProgress, 
  Alert, 
  Tooltip 
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon, 
  Check as CheckIcon, 
  Error as ErrorIcon 
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import { useSnackbar } from '../contexts/SnackbarContext';

// Схема валідації для шляху до логу
const logPathValidationSchema = Yup.object({
  name: Yup.string()
    .required('Назва логу обов\'язкова'),
  path: Yup.string()
    .required('Шлях до логу обов\'язковий'),
  description: Yup.string()
});

const ServerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  
  const [server, setServer] = useState(null);
  const [logPaths, setLogPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logPathsLoading, setLogPathsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLogPath, setEditingLogPath] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, logPathId: null });
  const [testingLogPath, setTestingLogPath] = useState(null);
  const [logPathStatus, setLogPathStatus] = useState({});
  
  // Завантаження даних сервера
  const fetchServerData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/servers/${id}`);
      setServer(response.data.data.server);
    } catch (error) {
      console.error('Помилка завантаження сервера:', error);
      showSnackbar('Помилка завантаження даних сервера', 'error');
      navigate('/servers');
    } finally {
      setLoading(false);
    }
  };
  
  // Завантаження шляхів до логів
  const fetchLogPaths = async () => {
    try {
      setLogPathsLoading(true);
      const response = await api.get(`/api/log-paths/server/${id}`);
      setLogPaths(response.data.data.logPaths);
    } catch (error) {
      console.error('Помилка завантаження шляхів до логів:', error);
      showSnackbar('Помилка завантаження шляхів до логів', 'error');
    } finally {
      setLogPathsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchServerData();
    fetchLogPaths();
  }, [id]);
  
  // Формік для форми шляху до логу
  const formik = useFormik({
    initialValues: {
      name: '',
      path: '',
      description: ''
    },
    validationSchema: logPathValidationSchema,
    onSubmit: async (values) => {
      try {
        if (editingLogPath) {
          // Оновлення існуючого шляху до логу
          await api.patch(`/api/log-paths/${editingLogPath.id}`, values);
          showSnackbar('Шлях до логу успішно оновлено', 'success');
        } else {
          // Створення нового шляху до логу
          await api.post(`/api/log-paths/server/${id}`, values);
          showSnackbar('Шлях до логу успішно створено', 'success');
        }
        
        // Оновлення списку шляхів до логів
        fetchLogPaths();
        handleCloseDialog();
      } catch (error) {
        console.error('Помилка збереження шляху до логу:', error);
        showSnackbar('Помилка збереження шляху до логу', 'error');
      }
    }
  });
  
  // Відкриття діалогу для створення шляху до логу
  const handleOpenCreateDialog = () => {
    setEditingLogPath(null);
    formik.resetForm();
    setOpenDialog(true);
  };
  
  // Відкриття діалогу для редагування шляху до логу
  const handleOpenEditDialog = (logPath) => {
    setEditingLogPath(logPath);
    formik.setValues({
      name: logPath.name,
      path: logPath.path,
      description: logPath.description || ''
    });
    setOpenDialog(true);
  };
  
  // Закриття діалогу
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLogPath(null);
    formik.resetForm();
  };
  
  // Відкриття діалогу підтвердження видалення
  const handleOpenDeleteDialog = (logPathId) => {
    setDeleteDialog({ open: true, logPathId });
  };
  
  // Закриття діалогу підтвердження видалення
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, logPathId: null });
  };
  
  // Видалення шляху до логу
  const handleDeleteLogPath = async () => {
    try {
      await api.delete(`/api/log-paths/${deleteDialog.logPathId}`);
      showSnackbar('Шлях до логу успішно видалено', 'success');
      fetchLogPaths();
    } catch (error) {
      console.error('Помилка видалення шляху до логу:', error);
      showSnackbar('Помилка видалення шляху до логу', 'error');
    } finally {
      handleCloseDeleteDialog();
    }
  };
  
  // Перевірка доступності лог-файлу
  const handleCheckLogFile = async (logPathId) => {
    try {
      setTestingLogPath(logPathId);
      const response = await api.get(`/api/logs/${logPathId}/check`);
      const { exists } = response.data.data;
      
      setLogPathStatus(prev => ({
        ...prev,
        [logPathId]: exists
      }));
    } catch (error) {
      console.error('Помилка перевірки лог-файлу:', error);
      setLogPathStatus(prev => ({
        ...prev,
        [logPathId]: false
      }));
      showSnackbar('Помилка перевірки лог-файлу', 'error');
    } finally {
      setTestingLogPath(null);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!server) {
    return (
      <Alert severity="error">
        Сервер не знайдено
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {server.name}
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          component={RouterLink} 
          to="/servers"
        >
          Назад до списку серверів
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Інформація про сервер */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Деталі сервера
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Хост:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">
                  {server.host}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Порт:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">
                  {server.port}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Користувач:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">
                  {server.username}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Тип аутентифікації:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">
                  {server.private_key ? 'Приватний ключ' : 'Пароль'}
                </Typography>
              </Grid>
            </Grid>
            
            <Box mt={3}>
              <Button 
                variant="contained" 
                color="primary" 
                component={RouterLink} 
                to={`/servers`}
                state={{ editServer: server }}
              >
                Редагувати сервер
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Шляхи до логів */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Шляхи до логів
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
              >
                Додати лог
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {logPathsLoading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : logPaths.length > 0 ? (
              <List>
                {logPaths.map((logPath) => (
                  <React.Fragment key={logPath.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Typography variant="subtitle1" sx={{ mr: 1 }}>
                              {logPath.name}
                            </Typography>
                            {logPathStatus[logPath.id] !== undefined && (
                              <Chip 
                                size="small"
                                color={logPathStatus[logPath.id] ? "success" : "error"}
                                icon={logPathStatus[logPath.id] ? <CheckIcon /> : <ErrorIcon />}
                                label={logPathStatus[logPath.id] ? "Доступний" : "Недоступний"}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span" display="block">
                              {logPath.path}
                            </Typography>
                            {logPath.description && (
                              <Typography variant="body2" color="textSecondary" component="span">
                                {logPath.description}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Перевірити доступність">
                          <IconButton 
                            edge="end" 
                            onClick={() => handleCheckLogFile(logPath.id)}
                            disabled={testingLogPath === logPath.id}
                          >
                            {testingLogPath === logPath.id ? (
                              <CircularProgress size={24} />
                            ) : (
                              <CheckIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Переглянути лог">
                          <IconButton 
                            edge="end" 
                            component={RouterLink} 
                            to={`/logs/${logPath.id}`}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Редагувати">
                          <IconButton 
                            edge="end" 
                            onClick={() => handleOpenEditDialog(logPath)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Видалити">
                          <IconButton 
                            edge="end" 
                            onClick={() => handleOpenDeleteDialog(logPath.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={3}>
                <Typography variant="body1" color="textSecondary">
                  Немає доданих шляхів до логів
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateDialog}
                  sx={{ mt: 2 }}
                >
                  Додати перший лог
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Діалог створення/редагування шляху до логу */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingLogPath ? 'Редагувати шлях до логу' : 'Додати новий шлях до логу'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            id="name"
            label="Назва"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <TextField
            margin="normal"
            fullWidth
            id="path"
            label="Шлях до файлу"
            name="path"
            value={formik.values.path}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.path && Boolean(formik.errors.path)}
            helperText={formik.touched.path && formik.errors.path}
            placeholder="/var/log/nginx/error.log"
          />
          <TextField
            margin="normal"
            fullWidth
            id="description"
            label="Опис (опціонально)"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Скасувати</Button>
          <Button 
            onClick={() => formik.handleSubmit()} 
            variant="contained" 
            color="primary"
            disabled={formik.isSubmitting}
          >
            {editingLogPath ? 'Зберегти' : 'Додати'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Діалог підтвердження видалення */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Видалити шлях до логу</DialogTitle>
        <DialogContent>
          <Typography>
            Ви впевнені, що хочете видалити цей шлях до логу? Ця дія не може бути скасована.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Скасувати
          </Button>
          <Button onClick={handleDeleteLogPath} color="error" variant="contained">
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServerDetailPage;
