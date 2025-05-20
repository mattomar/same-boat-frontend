import { Box } from '@mui/material';
import React from 'react';
import Logo from '../assets/logo.png';

function NeonLogo() {
  return (
    <Box
      component="img"
      src={Logo}
      alt="Logo"
      sx={{
        width: 180,
        filter: `
          brightness(1.1) 
          contrast(1.05) 
          drop-shadow(0 0 2px #ffffff)
          drop-shadow(0 0 4px #ffffff)
        `,
        transition: 'transform 0.3s ease, filter 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          filter: `
            brightness(1.2) 
            contrast(1.1) 
            drop-shadow(0 0 4px #ffffff)
            drop-shadow(0 0 8px #ffffff)
          `,
        },
      }}
    />
  );
}

export default NeonLogo;