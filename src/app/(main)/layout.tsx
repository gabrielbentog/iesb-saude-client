"use client";

import React, { useState, useEffect } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { ToastProvider } from "@/app/contexts/ToastContext";
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
      <ToastProvider>
        <Box sx={{ display: "flex" }}>
          {/* Exemplo: um Header fixo na parte superior */}
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
            isMobile={isMobile} // <--- Passando essa info
          />

          {/* Área principal */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              // Em telas grandes, offset do drawer
              ...(isMobile
                ? {}
                : {
                    width: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)`,
                    ml: `${open ? drawerWidth : collapsedWidth}px`,
                  }),
              transition: defaultTheme.transitions.create(["margin", "width"], {
                easing: defaultTheme.transitions.easing.easeOut,
                duration: defaultTheme.transitions.duration.enteringScreen,
              }),
              pt: "64px", // Se seu Header tiver 64px de altura
              minHeight: "100vh",
              bgcolor: theme.palette.background.default,
              color: theme.palette.text.primary,
            }}
          >
            {children}
          </Box>
        </Box>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default MainLayout;
