/**
 * メインレイアウトコンポーネント
 * ヘッダー、サイドバー、メインコンテンツを統合
 */

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as PortfolioIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 250;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { label: 'ホーム', path: '/', icon: <HomeIcon /> },
    { label: '銘柄一覧', path: '/stocks', icon: <TrendingUpIcon /> },
    { label: 'ダッシュボード', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'ポートフォリオ', path: '/portfolio', icon: <PortfolioIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3, fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center' }}>
        💼 PayPay 投資ヘルパー
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            component={RouterLink}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              backgroundColor: isActive(item.path) ? '#e3f2fd' : 'transparent',
              borderLeft: isActive(item.path) ? '4px solid #1976d2' : '4px solid transparent',
              color: isActive(item.path) ? '#1976d2' : 'inherit',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              mb: 1,
              borderRadius: '4px',
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? '#1976d2' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
        <div>© 2025 PayPay</div>
        <div>Investment Helper</div>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* ヘッダー */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1, fontWeight: 'bold', fontSize: '1.3rem' }}>
            📊 PayPay 投資分析ツール
          </Box>
        </Toolbar>
      </AppBar>

      {/* デスクトップ用ドロワー */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              marginTop: '64px',
              height: 'calc(100vh - 64px)',
              backgroundColor: '#ffffff',
              borderRight: '1px solid #e0e0e0',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* モバイル用ドロワー */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              marginTop: '64px',
              backgroundColor: '#ffffff',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: '64px',
          width: isMobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
