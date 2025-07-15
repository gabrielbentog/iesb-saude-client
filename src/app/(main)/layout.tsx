"use client";

import React, { useState, useEffect } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import type { MainLayoutProps } from '@/app/types';
import { lightTheme, darkTheme } from "../theme/theme";


const drawerWidth = 260;

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const defaultTheme = useTheme();

  // Verifica se é mobile
  const isMobile = useMediaQuery(defaultTheme.breakpoints.down("md"));

  // Se for mobile, começamos com a sidebar fechada
  const [open, setOpen] = useState(!isMobile);
  const [darkMode, setDarkMode] = useState(false);

  // Toda vez que "isMobile" mudar (ex: resize), podemos ajustar open
  useEffect(() => {
    if (isMobile) setOpen(false);
    else setOpen(true);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <Header
          open={open}
          drawerWidth={drawerWidth}
          onToggleSidebar={handleDrawerToggle}
          isMobile={isMobile}
        />

        {/* Sidebar - em mobile vira overlay */}
        <Sidebar
          open={open}
          drawerWidth={drawerWidth}
          onToggleSidebar={handleDrawerToggle}
          darkMode={darkMode}
          onToggleDarkMode={handleDarkModeToggle}
          isMobile={isMobile}
        />

        {/* Área principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            transition: defaultTheme.transitions.create(["margin", "width"], {
              easing: defaultTheme.transitions.easing.easeOut,
              duration: defaultTheme.transitions.duration.enteringScreen,
            }),
            pt: "64px",
            minHeight: "100vh",
            bgcolor: theme.palette.background.default,
            color: theme.palette.text.primary,
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MainLayout;