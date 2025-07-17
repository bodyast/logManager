import React from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {Box, Typography, Button, Container} from '@mui/material';
import {Home as HomeIcon} from '@mui/icons-material';

const NotFoundPage = () => {
    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    textAlign: 'center'
                }}
            >
                <Typography variant="h1" component="h1" gutterBottom>
                    404
                </Typography>

                <Typography variant="h4" component="h2" gutterBottom>
                    Page Not Found
                </Typography>

                <Typography variant="body1" sx={{mb: 4}}>
                    The page you are looking for does not exist or has been moved.
                </Typography>

                <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to="/"
                    startIcon={<HomeIcon/>}
                >
                    Home
                </Button>
            </Box>
        </Container>
    );
};

export default NotFoundPage;
