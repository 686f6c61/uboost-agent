import React from 'react';
import { Box } from '@mui/material';

const LinearProgress = ({ variant, value }) => {
  return (
    <Box sx={{ 
      width: '100%', 
      height: '4px', 
      backgroundColor: '#e0e0e0', 
      borderRadius: '2px',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        width: `${value}%`, 
        height: '100%', 
        backgroundColor: '#1976d2',
        transition: 'width 0.3s ease'
      }} />
    </Box>
  );
};

export default LinearProgress; 