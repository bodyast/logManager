import React, {useState, useEffect} from 'react';
import {Link as RouterLink} from 'react-router-dom';
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
import {useFormik} from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import {useSnackbar} from '../contexts/SnackbarContext';

// Server form validation schema
const serverValidationSchema = Yup.object({
    name: Yup.string()
        .required('Server name is required'),
    host: Yup.string()
        .required('Host is required'),
    port: Yup.number()
        .min(1, 'Port must be greater than 0')
        .max(65535, 'Port must be less than 65536')
        .required('Port is required'),
    username: Yup.string()
        .required('Username is required'),
    authType: Yup.string()
        .oneOf(['password', 'privateKey'], 'Choose authentication type')
        .required('Authentication type is required')
});

const ServersPage = () => {
    const {showSnackbar} = useSnackbar();
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({open: false, serverId: null});
    const [editingServer, setEditingServer] = useState(null);
    const [testingConnection, setTestingConnection] = useState(null);

    // Loading servers
    const fetchServers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/servers');
            setServers(response.data.data.servers);
        } catch (error) {
            console.error('Error loading servers:', error);
            showSnackbar('Error loading servers', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServers();
    }, []);

    // Formik for server form
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

                // Adding authentication data based on type
                if (values.authType === 'password') {
                    serverData.password = values.password;
                } else {
                    serverData.private_key = values.private_key;
                    if (values.private_key_passphrase) {
                        serverData.private_key_passphrase = values.private_key_passphrase;
                    }
                }

                // Updating or creating server
                if (editingServer) {
                    await api.patch(`/api/servers/${editingServer.id}`, serverData);
                    showSnackbar('Server updated successfully', 'success');
                } else {
                    await api.post('/api/servers', serverData);
                    showSnackbar('Server created successfully', 'success');
                }

                // Updating server list and closing dialog
                fetchServers();
                handleCloseDialog();
            } catch (error) {
                console.error('Error saving server:', error);
                showSnackbar(
                    error.response?.data?.message || 'Error saving server',
                    'error'
                );
            }
        }
    });

    // Opening dialog for server creation
    const handleOpenCreateDialog = () => {
        setEditingServer(null);
        formik.resetForm();
        setOpenDialog(true);
    };

    // Opening dialog for server editing
    const handleOpenEditDialog = (server) => {
        setEditingServer(server);

        // Determining authentication type
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

    // Closing dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingServer(null);
        formik.resetForm();
    };

    // Opening delete confirmation dialog
    const handleOpenDeleteDialog = (serverId) => {
        setDeleteDialog({open: true, serverId});
    };

    // Closing delete confirmation dialog
    const handleCloseDeleteDialog = () => {
        setDeleteDialog({open: false, serverId: null});
    };

    // Deleting server
    const handleDeleteServer = async () => {
        try {
            await api.delete(`/api/servers/${deleteDialog.serverId}`);
            showSnackbar('Server deleted successfully', 'success');
            fetchServers();
        } catch (error) {
            console.error('Error deleting server:', error);
            showSnackbar('Error deleting server', 'error');
        } finally {
            handleCloseDeleteDialog();
        }
    };

    // Testing connection to server
    const handleTestConnection = async (serverId) => {
        try {
            setTestingConnection(serverId);
            await api.post(`/api/servers/${serverId}/test-connection`);
            showSnackbar('Connection established successfully', 'success');
        } catch (error) {
            console.error('Connection error:', error);
            showSnackbar(
                error.response?.data?.message || 'Error connecting to server',
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
                    Servers
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon/>}
                    onClick={handleOpenCreateDialog}
                >
                    Add Server
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress/>
                </Box>
            ) : servers.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Host</TableCell>
                                <TableCell>Port</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Actions</TableCell>
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
                                        <Tooltip title="Test connection">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleTestConnection(server.id)}
                                                disabled={testingConnection === server.id}
                                            >
                                                {testingConnection === server.id ? (
                                                    <CircularProgress size={24}/>
                                                ) : (
                                                    <RefreshIcon/>
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenEditDialog(server)}
                                            >
                                                <EditIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                color="error"
                                                onClick={() => handleOpenDeleteDialog(server.id)}
                                            >
                                                <DeleteIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Paper sx={{p: 3, textAlign: 'center'}}>
                    <Typography variant="body1" color="textSecondary">
                        No servers added. Add your first server by clicking "Add Server" button.
                    </Typography>
                </Paper>
            )}

            {/* Server creation/editing dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingServer ? 'Edit Server' : 'Add New Server'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={formik.handleSubmit} sx={{mt: 1}}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="name"
                                    label="Server Name"
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
                                    label="Host"
                                    name="host"
                                    placeholder="example.com or 192.168.1.1"
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
                                    label="Port"
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
                                    label="Username"
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
                                    <InputLabel id="auth-type-label">Authentication Type</InputLabel>
                                    <Select
                                        labelId="auth-type-label"
                                        id="authType"
                                        name="authType"
                                        value={formik.values.authType}
                                        onChange={formik.handleChange}
                                        label="Authentication Type"
                                    >
                                        <MenuItem value="password">Password</MenuItem>
                                        <MenuItem value="privateKey">Private Key</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {formik.values.authType === 'password' ? (
                                <Grid item xs={12}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        id="password"
                                        label="Password"
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
                                            label="Private Key"
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
                                            label="Key Passphrase (optional)"
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
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={() => formik.handleSubmit()}
                        variant="contained"
                        color="primary"
                        disabled={formik.isSubmitting}
                    >
                        {editingServer ? 'Save' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirmation dialog */}
            <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Delete Server</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this server? This action cannot be undone.
                        All associated log paths will also be deleted.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteServer} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ServersPage;
