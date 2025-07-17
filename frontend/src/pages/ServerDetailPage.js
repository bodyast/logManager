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
      .required('Log name is required'),
  path: Yup.string()
      .required('Log path is required'),
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
      console.error('Error loading server:', error);
      showSnackbar('Error loading server data', 'error');
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
      console.error('Error loading log paths:', error);
      showSnackbar('Error loading log paths', 'error');
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
          showSnackbar('Log path updated successfully', 'success');
        } else {
          // Створення нового шляху до логу
          await api.post(`/api/log-paths/server/${id}`, values);
          showSnackbar('Log path created successfully', 'success');
        }
        
        // Оновлення списку шляхів до логів
        fetchLogPaths();
        handleCloseDialog();
      } catch (error) {
        console.error('Error saving log path:', error);
        showSnackbar('Error saving log path', 'error');
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
      showSnackbar('Log path deleted successfully', 'success');
      fetchLogPaths();
    } catch (error) {
      console.error('Error deleting log path:', error);
      showSnackbar('Error deleting log path', 'error');
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
          Back to Servers List
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Інформація про сервер */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Server Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Host:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">
                  {server.host}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Port:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">
                  {server.port}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  User:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">
                  {server.username}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Authentication Type:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">
                  {server.private_key ? 'Private Key' : 'Password'}
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
                Log Paths
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateDialog}
              >
                Add Log
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
                                label={logPathStatus[logPath.id] ? "Available" : "Unavailable"}
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
                  No log paths added
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateDialog}
                  sx={{ mt: 2 }}
                >
                  Add First Log
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Діалог створення/редагування шляху до логу */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingLogPath ? 'Edit Log Path' : 'Add New Log Path'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            id="name"
            label="Name"
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
            label="File Path"
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
            label="Description (optional)"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
              onClick={() => formik.handleSubmit()}
              variant="contained"
              color="primary"
              disabled={formik.isSubmitting}
          >
            {editingLogPath ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Діалог підтвердження видалення */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Log Path</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this log path? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteLogPath} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServerDetailPage;
