import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import Ship from '../assets/ship.png'
import ThreeDButton from './startButton'
import { useNavigate } from 'react-router-dom'


const HeroSection = () => {
  const [clicked, setClicked] = useState(false)
const [startTransition, setStartTransition] = useState(false)
const navigate = useNavigate()
const handleClick = () => {
  setClicked(true)
  setStartTransition(true)
  setTimeout(() => {
    navigate('/waiting-room')
  }, 2400) // allow circle to fully expand first
}
  return (
    <Box
      sx={{
        marginTop: '75px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Container with fixed height to prevent layout shift */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '1200px',
          height: { xs: 400, md: 300 }, // fixed height to prevent jumping
          px: 4,
          py: 2,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Left side - slide off to the left */}
        <motion.div
          animate={clicked ? { x: '-120%', opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            flex: '0 0 600px',
            maxWidth: 600,
            position: 'relative',
            zIndex: 2,
            textAlign: 'left',
            color: 'white',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              fontSize: 80,
              textShadow: '0 0 2px #fff, 0 0 4px #ccc',
            }}
          >
            You're Not Alone
          </Typography>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Same Boat connects strangers to talk, share, and feel seen.
          </Typography>

          <Typography variant="body1" sx={{ fontSize: 16, lineHeight: 1.5 }}>
            Join a pool, meet someone just like you, and start a conversation that might
            <br /> change your day. No accounts, no judgment — just honest human
            connection.
          </Typography>
        </motion.div>

        {/* Boat container - fixed size and position */}
        <motion.img
  src={Ship}
  alt="Ship Logo"
  initial={false}
  animate={clicked ? { x: '-100%', scaleX: -1 } : { x: 0, scaleX: -1 }}
  transition={{ duration: 0.8, ease: 'easeInOut' }}
  style={{
    height: 'auto',
    width: '250px',
    filter: 'drop-shadow(0 0 3px #ffff) drop-shadow(0 0 6px #ffff)',
  }}
/>
{startTransition && (
  <motion.div
    initial={{ clipPath: 'circle(0% at 50% 50%)' }}
    animate={{ clipPath: 'circle(150% at 50% 50%)' }}
    transition={{ delay: 0.8, duration: 1.5, ease: 'easeInOut' }}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1000,
      backgroundColor: '#0e0e2c',
    }}
  />
)}
      </Box>

      {/* Button - outside the container to prevent shift */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', width: '100%' }}>
      <ThreeDButton onClick={handleClick} />
      </Box>
    </Box>
  )
}

export default HeroSection