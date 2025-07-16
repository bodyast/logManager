import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Tooltip, 
  Chip, 
  CircularProgress 
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  CheckCircle as CheckCircleIcon, 
  Cancel as CancelIcon, 
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import { useSnackbar } from '../contexts/SnackbarContext';

// Схема валідації для форми сервера
const serverValidationSchema = Yup.object({
  name: Yup.string()
    .required('Назва сервера обов\'язкова'),
  host: Yup.string()
    .required('Хост обов\'язковий'),
  port: Yup.number()
    .min(1, 'Порт повинен бути більше 0')
    .max(65535, 'Порт повинен бути менше 65536')
    .required('Порт обов\'язковий'),
  username: Yup.string()
    .required('Ім\'я користувача обов\'язкове'),
  authType: Yup.string()
    .oneOf(['password', 'privateKey'], 'Виберіть тип аутентифікації')
    .required('Тип аутентифікації обов\'язковий')
});

const ServersPage = () => {
  const { showSnackbar } = useSnackbar();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, serverId: null });
  const [editingServer, setEditingServer] = useState(null);
  const [testingConnection, setTestingConnection] = useState(null);
  
  // Завантаження серверів
  const fetchServers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/servers');
      setServers(response.data.data.servers);
    } catch (error) {
      console.error('Помилка завантаження серверів:', error);
      showSnackbar('Помилка завантаження серверів', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchServers();
  }, []);
  
  // Формік для форми сервера
  const formik = useFormik({
    initialValues: {
      name: '',
      host: '',
      port: 22,
      username: '',
      authType: 'password',
      password: '',
      private_key: '',
      private_key_passphrase: ''
    },
    validationSchema: serverValidationSchema,
    onSubmit: async (values) => {
      try {
        const serverData = {
          name: values.name,
          host: values.host,
          port: values.port,
          username: values.username
        };
        
        // Додавання даних аутентифікації в залежності від типу
        if (values.authType === 'password') {
          serverData.password = values.password;
        } else {
          serverData.private_key = values.private_key;
          if (values.private_key_passphrase) {
            serverData.private_key_passphrase = values.private_key_passphrase;
          }
        }
        
        // Оновлення або створення сервера
        if (editingServer) {
          await api.patch(`/api/servers/${editingServer.id}`, serverData);
          showSnackbar('Сервер успішно оновлено', 'success');
        } else {
          await api.post('/api/servers', serverData);
          showSnackbar('Сервер успішно створено', 'success');
        }
        
        // Оновлення списку серверів і закриття діалогу
        fetchServers();
        handleCloseDialog();
      } catch (error) {
        console.error('Помилка збереження сервера:', error);
        showSnackbar(
          error.response?.data?.message || 'Помилка збереження сервера', 
          'error'
        );
      }
    }
  });
  
  // Відкриття діалогу для створення сервера
  const handleOpenCreateDialog = () => {
    setEditingServer(null);
    formik.resetForm();
    setOpenDialog(true);
  };
  
  // Відкриття діалогу для редагування сервера
  const handleOpenEditDialog = (server) => {
    setEditingServer(server);
    
    // Визначення типу аутентифікації
    const authType = server.private_key ? 'privateKey' : 'password';
    
    formik.setValues({
      name: server.name,
      host: server.host,
      port: server.port,
      username: server.username,
      authType,
      password: '',
      private_key: '',
      private_key_passphrase: ''
    });
    
    setOpenDialog(true);
  };
  
  // Закриття діалогу
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingServer(null);
    formik.resetForm();
  };
  
  // Відкриття діалогу підтвердження видалення
  const handleOpenDeleteDialog = (serverId) => {
    setDeleteDialog({ open: true, serverId });
  };
  
  // Закриття діалогу підтвердження видалення
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, serverId: null });
  };
  
  // Видалення сервера
  const handleDeleteServer = async () => {
    try {
      await api.delete(`/api/servers/${deleteDialog.serverId}`);
      showSnackbar('Сервер успішно видалено', 'success');
      fetchServers();
    } catch (error) {
      console.error('Помилка видалення сервера:', error);
      showSnackbar('Помилка видалення сервера', 'error');
    } finally {
      handleCloseDeleteDialog();
    }
  };
  
  // Перевірка з'єднання з сервером
  const handleTestConnection = async (serverId) => {
    try {
      setTestingConnection(serverId);
      await api.post(`/api/servers/${serverId}/test-connection`);
      showSnackbar('З\'єднання успішно встановлено', 'success');
    } catch (error) {
      console.error('Помилка з\'єднання:', error);
      showSnackbar(
        error.response?.data?.message || 'Помилка з\'єднання з сервером', 
        'error'
      );
    } finally {
      setTestingConnection(null);
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Сервери
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Додати сервер
        </Button>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : servers.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Назва</TableCell>
                <TableCell>Хост</TableCell>
                <TableCell>Порт</TableCell>
                <TableCell>Користувач</TableCell>
                <TableCell>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell component="th" scope="row">
                    <RouterLink 
                      to={`/servers/${server.id}`}
                      style={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        fontWeight: 'bold'
                      }}
                    >
                      {server.name}
                    </RouterLink>
                  </TableCell>
                  <TableCell>{server.host}</TableCell>
                  <TableCell>{server.port}</TableCell>
                  <TableCell>{server.username}</TableCell>
                  <TableCell>
                    <Tooltip title="Перевірити з'єднання">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleTestConnection(server.id)}
                        disabled={testingConnection === server.id}
                      >
                        {testingConnection === server.id ? (
                          <CircularProgress size={24} />
                        ) : (
                          <RefreshIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Редагувати">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(server)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Видалити">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(server.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Немає доданих серверів. Додайте свій перший сервер, натиснувши кнопку "Додати сервер".
          </Typography>
        </Paper>
      )}
      
      {/* Діалог створення/редагування сервера */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingServer ? 'Редагувати сервер' : 'Додати новий сервер'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="name"
                  label="Назва сервера"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="host"
                  label="Хост"
                  name="host"
                  placeholder="example.com або 192.168.1.1"
                  value={formik.values.host}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.host && Boolean(formik.errors.host)}
                  helperText={formik.touched.host && formik.errors.host}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="port"
                  label="Порт"
                  name="port"
                  type="number"
                  value={formik.values.port}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.port && Boolean(formik.errors.port)}
                  helperText={formik.touched.port && formik.errors.port}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="username"
                  label="Ім'я користувача"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="auth-type-label">Тип аутентифікації</InputLabel>
                  <Select
                    labelId="auth-type-label"
                    id="authType"
                    name="authType"
                    value={formik.values.authType}
                    onChange={formik.handleChange}
                    label="Тип аутентифікації"
                  >
                    <MenuItem value="password">Пароль</MenuItem>
                    <MenuItem value="privateKey">Приватний ключ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {formik.values.authType === 'password' ? (
                <Grid item xs={12}>
                  <TextField
                    margin="normal"
                    fullWidth
                    id="password"
                    label="Пароль"
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                  />
                </Grid>
              ) : (
                <>
                  <Grid item xs={12}>
                    <TextField
                      margin="normal"
                      fullWidth
                      id="private_key"
                      label="Приватний ключ"
                      name="private_key"
                      multiline
                      rows={4}
                      value={formik.values.private_key}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.private_key && Boolean(formik.errors.private_key)}
                      helperText={formik.touched.private_key && formik.errors.private_key}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      margin="normal"
                      fullWidth
                      id="private_key_passphrase"
                      label="Парольна фраза для ключа (опціонально)"
                      name="private_key_passphrase"
                      type="password"
                      value={formik.values.private_key_passphrase}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.private_key_passphrase && Boolean(formik.errors.private_key_passphrase)}
                      helperText={formik.touched.private_key_passphrase && formik.errors.private_key_passphrase}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Скасувати</Button>
          <Button 
            onClick={() => formik.handleSubmit()} 
            variant="contained" 
            color="primary"
            disabled={formik.isSubmitting}
          >
            {editingServer ? 'Зберегти' : 'Додати'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Діалог підтвердження видалення */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Видалити сервер</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви впевнені, що хочете видалити цей сервер? Ця дія не може бути скасована.
            Всі пов'язані шляхи до логів також будуть видалені.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Скасувати
          </Button>
          <Button onClick={handleDeleteServer} color="error" variant="contained">
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServersPage;
