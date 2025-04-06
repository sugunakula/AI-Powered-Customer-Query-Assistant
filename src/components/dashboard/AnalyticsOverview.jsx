import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  LinearProgress
} from '@mui/material';
import {
  Chat,
  ThumbUp,
  Speed,
  Psychology
} from '@mui/icons-material';

function StatCard({ icon, title, value, progress }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="body2" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {value}
      </Typography>
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ height: 8, borderRadius: 4 }} 
      />
    </Box>
  );
}

function AnalyticsOverview() {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Today's Overview
      </Typography>
      
      <StatCard
        icon={<Chat color="primary" />}
        title="Active Chats"
        value="24"
        progress={75}
      />
      
      <StatCard
        icon={<ThumbUp color="success" />}
        title="Satisfaction Rate"
        value="92%"
        progress={92}
      />
      
      <StatCard
        icon={<Speed color="warning" />}
        title="Response Time"
        value="45s"
        progress={85}
      />
      
      <StatCard
        icon={<Psychology color="info" />}
        title="AI Accuracy"
        value="88%"
        progress={88}
      />
    </Paper>
  );
}

export default AnalyticsOverview; 