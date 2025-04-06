import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider
} from '@mui/material';
import {
  Dashboard,
  Chat,
  Analytics,
  Settings,
  Psychology,
  Group,
  LiveHelp
} from '@mui/icons-material';

const drawerWidth = 240;

function Sidebar() {
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Live Chat', icon: <Chat />, path: '/live-chat' },
    { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { text: 'AI Training', icon: <Psychology />, path: '/ai-training' },
    { text: 'Knowledge Base', icon: <LiveHelp />, path: '/knowledge-base' },
    { text: 'User Management', icon: <Group />, path: '/users' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1a237e',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          AI Chat Admin
        </Typography>
      </Box>
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar; 