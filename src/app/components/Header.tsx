"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Avatar,
  Badge,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Menu as MenuIcon, Search as SearchIcon, Notifications as NotificationsIcon } from "@mui/icons-material";

interface HeaderProps {
  open: boolean;
  drawerWidth: number;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ open, drawerWidth, onToggleSidebar }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: open ? `calc(100% - ${drawerWidth}px)` : "100%" },
        ml: { sm: open ? `${drawerWidth}px` : 0 },
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        bgcolor: theme.palette.primary.main,
        boxShadow: isDark
          ? "0 4px 20px rgba(0,0,0,0.5)"
          : "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onToggleSidebar}
          sx={{
            mr: 2,
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.1)" },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Dashboard
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Search">
            <IconButton color="inherit">
              <SearchIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Profile">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                cursor: "pointer",
                border: "2px solid white",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.1)" },
              }}
              alt="User"
              src="/placeholder.svg?height=36&width=36"
            />
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
