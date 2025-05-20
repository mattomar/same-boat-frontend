import React from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { motion } from 'framer-motion'

const WaitingRoom = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0e0e2c',
          color: '#fff',
          textAlign: 'center',
          px: 2,
        }}
      >
        <Typography variant="h4" sx={{ mb: 2 }}>
          Waiting Room
        </Typography>

        <Typography variant="body1" sx={{ mb: 4 }}>
          Please wait while we find someone for you to talk to...
        </Typography>

        <CircularProgress color="inherit" />
      </Box>
    </motion.div>
  )
}

export default WaitingRoom