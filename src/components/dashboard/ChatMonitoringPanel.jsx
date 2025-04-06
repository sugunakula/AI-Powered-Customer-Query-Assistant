import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip
} from '@mui/material';
import { Message, Person } from '@mui/icons-material';

function ChatMonitoringPanel() {
  const [value, setValue] = React.useState(0);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Live Chat Monitoring
        </Typography>
        <Tabs value={value} onChange={(e, newValue) => setValue(newValue)}>
          <Tab label="Active Chats" />
          <Tab label="Waiting" />
          <Tab label="AI Handled" />
        </Tabs>
      </Box>

      <List>
        {/* Active Chat Items */}
        <ListItem
          sx={{
            border: '1px solid #eee',
            borderRadius: 1,
            mb: 1,
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <Person />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="John Doe"
            secondary="Product inquiry about latest iPhone model..."
          />
          <Box>
            <Chip
              label="AI Assisted"
              size="small"
              color="primary"
              sx={{ mr: 1 }}
            />
            <Button variant="outlined" size="small">
              Take Over
            </Button>
          </Box>
        </ListItem>
        {/* More chat items... */}
      </List>
    </Paper>
  );
}

export default ChatMonitoringPanel; 