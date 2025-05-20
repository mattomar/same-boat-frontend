import React from 'react';
import { Button } from '@mui/material';

const ThreeDButton = ({ children = "Start Chatting", onClick }) => {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      sx={{
        bgcolor: '#6200ea',
        color: '#fff',
        fontWeight: 600,
        fontSize: '1.25rem',
        padding: '12px 30px',
        borderRadius: '12px',
        textTransform: 'none',
        boxShadow: '0 8px 15px rgba(98, 0, 234, 0.3), inset 0 -4px 8px rgba(255, 255, 255, 0.2)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          bgcolor: '#3700b3',
          boxShadow: '0 12px 20px rgba(98, 0, 234, 0.45), inset 0 -4px 8px rgba(255, 255, 255, 0.3)',
          transform: 'translateY(-3px) scale(1.05) rotateX(5deg)',
        },
        '&:active': {
          boxShadow: '0 5px 10px rgba(98, 0, 234, 0.2), inset 0 4px 6px rgba(0, 0, 0, 0.2)',
          transform: 'translateY(1px) scale(0.98) rotateX(0deg)',
        },
        '&:focus-visible': {
          outline: 'none',
          boxShadow: '0 0 10px 3px rgba(98, 0, 234, 0.8)',
        },
      }}
    >
      {children}
    </Button>
  );
};

export default ThreeDButton;