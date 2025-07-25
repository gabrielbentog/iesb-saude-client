"use client";

import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { HeaderProps, UserData } from "@/app/types";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

const ICON_AREA = 48; // largura do botão/hamburger

const Header: React.FC<HeaderProps> = ({
  drawerWidth,
  onToggleSidebar,
  isMobile,
}) => {
  const theme = useTheme();

  const [user, setUser] = useState<UserData | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("session");
    if (s) {
      const data = JSON.parse(s);
      setUser(data.user || null);
    }
  }, []);

  const avatarUrl =
    user?.avatar && !useFallback ? user.avatar : undefined;

  const initials = user?.name
    ? user.name
        .trim()
        .split(" ")
        .map((w) => w[0])
        .shift()
        ?.toUpperCase() ?? "U"
    : "U";

  return (
    <AppBar
      position="fixed"
      sx={{
        width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
        ml: isMobile ? 0 : `${drawerWidth}px`,
        bgcolor: theme.palette.background.default,
        boxShadow: "none",
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(["margin", "width"]),
      }}
    >
      <Toolbar disableGutters sx={{ px: 2 }}>
        {/* Área fixa de 48 px  →  evita ‘saltos’ */}
        <Box
          sx={{
            width: ICON_AREA,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 2,
          }}
        >
          {isMobile && (
            <IconButton
              onClick={onToggleSidebar}
              color="primary"
              size="large"
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        {/* Conteúdo empurrado p/ a direita */}
        {!isMobile && (
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", ml: "auto" }}>
          <Tooltip title="Notificações">
            <IconButton sx={{ color: theme.palette.primary.main }}>
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Perfil">
            <Avatar
              src={avatarUrl}
              alt={user?.name || "Usuário"}
              onError={() => setUseFallback(true)}
              sx={{
                width: 36,
                height: 36,
                bgcolor: !avatarUrl
                  ? theme.palette.secondary.main
                  : undefined,
                color: !avatarUrl ? "#fff" : undefined,
                fontWeight: 600,
                border: "2px solid white",
                cursor: "pointer",
              }}
            >
              {!avatarUrl && initials}
            </Avatar>
          </Tooltip>
        </Box>
        )}

      </Toolbar>
    </AppBar>
  );
};

export default Header;
