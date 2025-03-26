"use client";

import React, { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { lightTheme, darkTheme } from "../theme/theme";

interface MainLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 260;

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
        <Header open={open} drawerWidth={drawerWidth} onToggleSidebar={handleDrawerToggle} />
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
            p: 3,
            // Removemos a margem e a largura fixa para que o conteúdo ocupe toda a área disponível
            width: "100%",
            transition: defaultTheme.transitions.create(["margin", "width"], {
              easing: defaultTheme.transitions.easing.easeOut,
              duration: defaultTheme.transitions.duration.enteringScreen,
            }),
            // Ajusta o padding-top para compensar o Header fixo
            pt: "calc(64px + 16px)",
            bgcolor: defaultTheme.palette.background.default,
            color: defaultTheme.palette.text.primary,
            minHeight: "100vh",
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MainLayout;
