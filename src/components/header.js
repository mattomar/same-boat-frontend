// components/Header.jsx
import { Box } from '@mui/material';
import NeonLogo from './logo';
import Navbar from './navbar';
import React from 'react';

function Header() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
      <NeonLogo />
      <Navbar />
    </Box>
  );
}

export default Header;