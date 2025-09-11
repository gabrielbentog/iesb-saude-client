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
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { HeaderProps, UserData } from "@/app/types";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const ICON_AREA = 48; // largura do botão/hamburger

const Header: React.FC<HeaderProps> = ({
  drawerWidth,
  onToggleSidebar,
  isMobile,
  open,
}) => {
  const theme = useTheme();
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const s = localStorage.getItem("session");
    if (s) {
      const data = JSON.parse(s);
      setUser(data.user || null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("session");
    Cookies.remove("session");
    router.push("/auth/login");
  };

  const avatarUrl = user?.avatar && !useFallback ? user.avatar : undefined;

  const initials = user?.name
    ? user.name
        .trim()
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "U"
    : "U";

  return (
    <AppBar
      position="fixed"
      sx={{
        width: !isMobile && open ? `calc(100% - ${drawerWidth}px)` : "100%",
        ml: !isMobile && open ? `${drawerWidth}px` : 0,
        bgcolor: "background.paper",
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        boxShadow: "none",
        zIndex: isMobile ? theme.zIndex.drawer + 1 : undefined,
        transition: theme.transitions.create(["margin", "width"]),
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          px: 2,
          minHeight: { xs: 64, sm: 70 },
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Área esquerda */}
        <Box
          sx={{
            width: ICON_AREA,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isMobile && (
            <IconButton
              onClick={onToggleSidebar}
              color="primary"
              size="large"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.16),
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        {/* Área direita */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Tooltip title="Notificações">
            <IconButton
              onClick={(e) => setNotificationsAnchor(e.currentTarget)}
              sx={{
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.16),
                },
              }}
            >
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              px: 1,
              py: 0.5,
              borderRadius: 2,
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Avatar
              src={avatarUrl}
              alt={user?.name || "Usuário"}
              onError={() => setUseFallback(true)}
              sx={{
                width: 40,
                height: 40,
                bgcolor: !avatarUrl ? theme.palette.primary.main : undefined,
                color: !avatarUrl ? "#fff" : undefined,
                fontWeight: 600,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              {!avatarUrl && initials}
            </Avatar>
            {!isMobile && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                  {user?.name || "Usuário"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.profile?.name || "Carregando..."}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Menu do usuário */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          onClick={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 220,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            },
          }}
        >
          <Box sx={{ py: 1, px: 2 }}>
            <Typography variant="subtitle2" noWrap fontWeight={600}>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={() => router.push("/perfil")} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Meu Perfil
          </MenuItem>
          {/* <MenuItem onClick={() => router.push("/configuracoes")} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Configurações
          </MenuItem> */}
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: "error.main" }}>
            <ListItemIcon sx={{ color: "error.main" }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Sair
          </MenuItem>
        </Menu>

        {/* Menu de notificações */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={() => setNotificationsAnchor(null)}
          onClick={() => setNotificationsAnchor(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 320,
              maxWidth: 320,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            },
          }}
        >
          <Typography variant="subtitle2" sx={{ p: 2, fontWeight: 600 }}>
            Notificações
          </Typography>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Nenhuma notificação no momento
            </Typography>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
