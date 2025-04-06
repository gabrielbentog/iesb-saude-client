"use client";

import React, { useState } from "react";
import { Box, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { lightTheme, darkTheme } from "../theme/theme";

interface MainLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 260;
const collapsedWidth = 60;

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const defaultTheme = useTheme();
  const isMobile = useMediaQuery(defaultTheme.breakpoints.down("md"));
  const [open, setOpen] = useState(!isMobile);
  const [darkMode, setDarkMode] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Box sx={{ display: "flex" }}>
        <Header
          open={open}
          drawerWidth={drawerWidth}
        />
        <Sidebar
          open={open}
          drawerWidth={drawerWidth}
          onToggleSidebar={handleDrawerToggle}
          darkMode={darkMode}
          onToggleDarkMode={handleDarkModeToggle}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ...(isMobile
              ? {
                  width: "100%",
                  ml: 0,
                }
              : {
                  width: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)`,
                  ml: `30px`,
                }),
            transition: defaultTheme.transitions.create(["margin", "width"], {
              easing: defaultTheme.transitions.easing.easeOut,
              duration: defaultTheme.transitions.duration.enteringScreen,
            }),
            // Aumente o calc() abaixo para dar mais espaço
            pt: "calc(64px + 60px)", 
            bgcolor: defaultTheme.palette.background.default,
            color: defaultTheme.palette.text.primary,
            minHeight: "100vh",
            p: 3,
          }}
        >
          <Toolbar /> 
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MainLayout;
