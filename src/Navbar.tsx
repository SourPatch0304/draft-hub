// src/components/NavBar.tsx
import { AppBar, Toolbar, Tabs, Tab, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [

  { label: 'Stats Table', path: '/stats-table' },
 
];

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Find the active tab index, default to 0
  const activeIndex = NAV_ITEMS.findIndex((item) => item.path === location.pathname);
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Draft Hub
        </Typography>
        <Tabs
          value={activeIndex >= 0 ? activeIndex : 0}
          textColor="inherit"
          indicatorColor="secondary"
        >
          {NAV_ITEMS.map((item) => (
            <Tab
              key={item.path}
              label={item.label}
              onClick={() => navigate(item.path)}
              sx={{ textTransform: 'none' }}
            />
          ))}
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}
