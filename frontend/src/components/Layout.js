import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Divider, 
  Container, 
  useTheme, 
  useMediaQuery, 
  Avatar, 
  Menu, 
  MenuItem 
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  Storage as ServerIcon, 
  Article as LogIcon, 
  Person as ProfileIcon, 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon, 
  ExitToApp as LogoutIcon 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

// Ширина бічної панелі
const drawerWidth = 240;

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useAppTheme();
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Обробник відкриття/закриття меню профілю
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Обробник відкриття/закриття бічної панелі на мобільних пристроях
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Обробник виходу з системи
  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };
  
  // Список пунктів меню
  const menuItems = [
    { 
      text: 'Панель керування', 
      icon: <DashboardIcon />, 
      path: '/dashboard' 
    },
    { 
      text: 'Сервери', 
      icon: <ServerIcon />, 
      path: '/servers' 
    },
    { 
      text: 'Логи', 
      icon: <LogIcon />, 
      path: '/log-paths' 
    },
    { 
      text: 'Профіль', 
      icon: <ProfileIcon />, 
      path: '/profile' 
    },
  ];
  
  // Вміст бічної панелі
  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Log Manager
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Верхня панель */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Log Manager'}
          </Typography>
          
          {/* Кнопка зміни теми */}
          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          
          {/* Кнопка профілю */}
          <IconButton
            color="inherit"
            edge="end"
            onClick={handleProfileMenuOpen}
          >
            <Avatar 
              sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          
          {/* Меню профілю */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem 
              component={RouterLink} 
              to="/profile" 
              onClick={handleProfileMenuClose}
            >
              <ListItemIcon>
                <ProfileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Профіль" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Вийти" />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Бічна панель */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Мобільна версія */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Краща продуктивність на мобільних пристроях
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Десктопна версія */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Основний вміст */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* Відступ під AppBar */}
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
