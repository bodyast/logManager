import React, {useState} from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Divider,
    Avatar,
    Card,
    CardContent,
    InputAdornment,
    IconButton
} from '@mui/material';
import {
    Person as PersonIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useAuth} from '../contexts/AuthContext';
import {useSnackbar} from '../contexts/SnackbarContext';

// Password validation schema
const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string()
        .required('Current password is required'),
    newPassword: Yup.string()
        .min(6, 'New password must be at least 6 characters long')
        .required('New password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Password confirmation is required')
});

const ProfilePage = () => {
    const {user, updatePassword} = useAuth();
    const {showSnackbar} = useSnackbar();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Formik for password change form
    const formik = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        },
        validationSchema: passwordValidationSchema,
        onSubmit: async (values) => {
            try {
                const success = await updatePassword({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword
                });

                if (success) {
                    formik.resetForm();
                }
            } catch (error) {
                console.error('Password update error:', error);
            }
        }
    });

    // Toggle password visibility
    const handleToggleCurrentPasswordVisibility = () => {
        setShowCurrentPassword(!showCurrentPassword);
    };

    const handleToggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    if (!user) {
        return null;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Profile
            </Typography>

            <Grid container spacing={3}>
                {/* User Information */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent sx={{textAlign: 'center'}}>
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    margin: '0 auto 16px',
                                    bgcolor: 'primary.main',
                                    fontSize: '3rem'
                                }}
                            >
                                {user.username.charAt(0).toUpperCase()}
                            </Avatar>

                            <Typography variant="h5" gutterBottom>
                                {user.username}
                            </Typography>

                            <Typography variant="body1" color="textSecondary">
                                {user.email}
                            </Typography>

                            <Typography variant="body2" color="textSecondary" sx={{mt: 2}}>
                                Registration date: {new Date(user.created_at).toLocaleDateString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Password Change */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{p: 3}}>
                        <Typography variant="h6" gutterBottom>
                            Change Password
                        </Typography>
                        <Divider sx={{mb: 3}}/>

                        <form onSubmit={formik.handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="currentPassword"
                                        name="currentPassword"
                                        label="Current Password"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={formik.values.currentPassword}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
                                        helperText={formik.touched.currentPassword && formik.errors.currentPassword}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleToggleCurrentPasswordVisibility}
                                                        edge="end"
                                                    >
                                                        {showCurrentPassword ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="newPassword"
                                        name="newPassword"
                                        label="New Password"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={formik.values.newPassword}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                                        helperText={formik.touched.newPassword && formik.errors.newPassword}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleToggleNewPasswordVisibility}
                                                        edge="end"
                                                    >
                                                        {showNewPassword ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        label="Confirm New Password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formik.values.confirmPassword}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleToggleConfirmPasswordVisibility}
                                                        edge="end"
                                                    >
                                                        {showConfirmPassword ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={formik.isSubmitting}
                                    >
                                        Change Password
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProfilePage;
