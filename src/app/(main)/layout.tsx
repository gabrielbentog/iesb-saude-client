"use client";

import React, { useState, useEffect } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import type { MainLayoutProps } from '@/app/types';
import { useCurrentUser } from '@/app/hooks/useCurrentUser'


const drawerWidth = 260;

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const defaultTheme = useTheme();

  // Verifica se é mobile
  const isMobile = useMediaQuery(defaultTheme.breakpoints.down("md"));

  // Se for mobile, começamos com a sidebar fechada
  const [open, setOpen] = useState(!isMobile);
  useCurrentUser()

  // Toda vez que "isMobile" mudar (ex: resize), podemos ajustar open
  useEffect(() => {
    if (isMobile) setOpen(false);   // fecha ao entrar no mobile
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
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
            zIndex: 0,
            pt: "64px",
            minHeight: "100vh",
            bgcolor: useTheme().palette.background.default,
            color: useTheme().palette.text.primary,
          }}
        >
          {children}
        </Box>
      </Box>
  );
};

export default MainLayout;