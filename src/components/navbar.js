import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Link } from '@mui/material';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigate('/'); // redirect to home after logout
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
        padding: '10px 0',
        width: '100%',
        boxSizing: 'border-box',
        gap: '20px',
      }}
    >
      <Link component={RouterLink} to="/" underline="none" color="white" sx={neonStyle}>
        Home
      </Link>

      <Link component={RouterLink} to="/about" underline="none" color="white" sx={neonStyle}>
        Commuinity
      </Link>

      {!isLoggedIn && (
        <Link component={RouterLink} to="/login" underline="none" color="white" sx={neonStyle}>
          Login
        </Link>
      )}

      {isLoggedIn && (
        <>
          <Link
            component={RouterLink}
            to={`/profile/${localStorage.getItem('userId')}`}
            underline="none"
            color="white"
            sx={neonStyle}
          >
            My Profile
          </Link>

          <Link
            underline="none"
            color="white"
            sx={{ ...neonStyle, cursor: 'pointer' }}
            onClick={handleLogout}
          >
            Logout
          </Link>
        </>
      )}
    </Box>
  );
}

export default Navbar;