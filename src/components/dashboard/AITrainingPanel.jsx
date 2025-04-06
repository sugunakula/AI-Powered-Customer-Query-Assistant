import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import { Add, Edit, Delete, Key } from '@mui/icons-material';

function AITrainingPanel() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Load saved API key
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    try {
      localStorage.setItem('openai_api_key', apiKey);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('error');
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        AI Configuration
      </Typography>

      {/* API Key Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          OpenAI API Key
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenAI API key"
            fullWidth
            sx={{ mb: 1 }}
          />
          <IconButton onClick={() => setShowApiKey(!showApiKey)}>
            <Key />
          </IconButton>
          <Button variant="contained" onClick={handleSaveApiKey}>
            Save Key
          </Button>
        </Box>
        {saveStatus === 'success' && (
          <Alert severity="success" sx={{ mt: 1 }}>
            API key saved successfully
          </Alert>
        )}
        {saveStatus === 'error' && (
          <Alert severity="error" sx={{ mt: 1 }}>
            Failed to save API key
          </Alert>
        )}
      </Box>

      <Typography variant="h6" gutterBottom>
        AI Response Training
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Add New Training Data
            </Typography>
            <TextField
              fullWidth
              label="User Query"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="AI Response"
              multiline
              rows={4}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Categories
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Product" onDelete={() => {}} />
                <Chip label="Support" onDelete={() => {}} />
                <IconButton size="small">
                  <Add />
                </IconButton>
              </Box>
            </Box>
            <Button variant="contained" startIcon={<Add />}>
              Add Training Data
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Recent Training Entries
          </Typography>
          <Box sx={{ 
            border: '1px solid #eee', 
            borderRadius: 1, 
            p: 2, 
            mb: 2 
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 1 
            }}>
              <Typography variant="body1" fontWeight="medium">
                "How do I track my order?"
              </Typography>
              <Box>
                <IconButton size="small">
                  <Edit />
                </IconButton>
                <IconButton size="small">
                  <Delete />
                </IconButton>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              AI Response: You can track your order by logging into your account...
            </Typography>
          </Box>
          {/* More training entries... */}
        </Grid>
      </Grid>
    </Paper>
  );
}

export default AITrainingPanel; 