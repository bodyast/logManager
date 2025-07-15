import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useSnackbar } from '../contexts/SnackbarContext';

const GlobalSnackbar = () => {
  const { snackbar, closeSnackbar } = useSnackbar();
  const { open, message, severity } = snackbar;

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={closeSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={closeSnackbar} 
        severity={severity} 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;
