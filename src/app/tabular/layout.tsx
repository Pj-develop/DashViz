import React from 'react';
import { AppBar, Box, Container, Toolbar, Typography, CssBaseline } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <CssBaseline />
     
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {children}
      </Container>
    </>
  );
};

export default Layout;