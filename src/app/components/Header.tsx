"use client";

import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Tooltip,
  Avatar,
  Badge,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

interface HeaderProps {
  open: boolean;                   // se a sidebar está aberta
  drawerWidth: number;
  onToggleSidebar: () => void;     // callback para abrir/fechar a sidebar
  isMobile: boolean;               // se está em modo responsivo
}

interface UserData {
  name?: string;
  avatar?: string;
  email?: string;
}

const Header: React.FC<HeaderProps> = ({
  open,
  drawerWidth,
  onToggleSidebar,
  isMobile,
}) => {
  const theme = useTheme();

  const [user, setUser] = useState<UserData | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      const data = JSON.parse(session);
      const userData = data.user || null;
      setUser(userData);
    }
  }, []);

  const handleAvatarError = () => {
    setUseFallback(true);
  };

  const getInitials = (name?: string): string => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    const initials = words.map((word) => word[0]?.toUpperCase() || "");
    return initials.slice(0, 1).join("");
  };

  const avatarUrl = user?.avatar && !useFallback ? user.avatar : undefined;
  const initials = getInitials(user?.name);

  return (
    <AppBar
      position="fixed"
      sx={{
        // Em telas mobile, ocupa 100% e não adiciona margin-left.
        // Em telas maiores, empurra de acordo com a sidebar.
        width: "100%",
        ml: isMobile ? 0 : `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        bgcolor: theme.palette.background.default,
        boxShadow: "none", // Remove a sombra
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Ícone de menu aparece em mobile ou quando a sidebar está fechada */}
          {isMobile && (
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={onToggleSidebar}
              color="primary"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Search">
            <IconButton sx={{ color: theme.palette.primary.main }}>
              <SearchIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton sx={{ color: theme.palette.primary.main }}>
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Profile">
            <Avatar
              alt={user?.name || "Usuário"}
              src={avatarUrl}
              onError={handleAvatarError}
              sx={{
                width: 36,
                height: 36,
                cursor: "pointer",
                border: "2px solid white",
                transition: "transform 0.2s",
                bgcolor: !avatarUrl ? theme.palette.secondary.main : undefined,
                color: !avatarUrl ? "white" : undefined,
                fontWeight: 600,
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              {!avatarUrl && initials}
            </Avatar>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
