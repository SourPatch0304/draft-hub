// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import StatsTablePage from './StatsTablePage';
import ReportPage from './ReportPage';

export default function App() {
  return (
    <Box
      component="div"
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Router>
        {/* Always show the Navbar pinned at top */}
        <Navbar />

        {/* Main content area: grows to fill remaining space and scrolls if needed */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 2,
          }}
        >
          <Routes>
            {/* Default route to StatsTablePage */}
            <Route path="/" element={<StatsTablePage />} />
            {/* Report page */}
            <Route path="/report" element={<ReportPage />} />
            {/* Redirect all unknown routes to default */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Router>
    </Box>
  );
}
