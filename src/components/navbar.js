import React from 'react';
import { Box, Link } from '@mui/material';

const neonStyle = {
  fontSize: '0.9rem',
  filter: `
    brightness(1.2) 
    contrast(1.1) 
    drop-shadow(0 0 4px #ffffff)
    drop-shadow(0 0 8px #ffffff)
    drop-shadow(0 0 16px #ffffff)
  `,
  transition: 'transform 0.3s ease, filter 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    filter: `
      brightness(1.4) 
      contrast(1.2) 
      drop-shadow(0 0 6px #ffffff)
      drop-shadow(0 0 12px #ffffff)
      drop-shadow(0 0 24px #ffffff)
    `,
  },
};

function Navbar() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'transparent', // Ensure no background color
        padding: '10px 0',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Link
        href="/"
        underline="none"
        color="white"
        sx={{ ...neonStyle, marginRight: '20px' }}
      >
        Home
      </Link>
      <Link
        href="/about"
        underline="none"
        color="white"
        sx={neonStyle}
      >
        About us
      </Link>
    </Box>
  );
}

export default Navbar;