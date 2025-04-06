"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Avatar,
  Paper,
  Switch,
  Typography,
  Badge,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  Inbox as InboxIcon,
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon,
  StarBorder,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Bookmark as BookmarkIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";

interface SidebarProps {
  open: boolean;
  drawerWidth: number;
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  drawerWidth,
  onToggleSidebar,
  darkMode,
  onToggleDarkMode,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [openNested, setOpenNested] = useState(false);
  const [mounted, setMounted] = useState(false);  // Controle de montagem
  const router = useRouter();
  const session = Cookies.get("session");
  const profile = session ? (JSON.parse(session).profile?.toLowerCase() as keyof typeof menuItemsByProfile) : null;

  const handleNestedClick = () => {
    setOpenNested(!openNested);
  };

  const collapsedWidth = 60;

  const drawerBg = theme.palette.background.paper;
  const textColor = theme.palette.text.primary;
  const iconColor = theme.palette.text.secondary;
  const hoverColor = theme.palette.action.hover;
  const activeColor = theme.palette.action.selected;
  const primaryColor = theme.palette.primary.main;
  const dividerColor = theme.palette.divider;
  const pathname = usePathname();

  const menuItemsByProfile = {
    paciente: [
      { icon: <HomeIcon />, text: "Dashboard", path: "/paciente/dashboard" },
      { icon: <CalendarIcon />, text: "Calendário", path: "/paciente/calendario" },
    ],
    gestor: [
      { icon: <DashboardIcon />, text: "Painel", path: "/gestor/dashboard" },
      { icon: <SettingsIcon />, text: "Configurações", path: "/gestor/configuracoes" },
    ],
    estagiario: [
      { icon: <InboxIcon />, text: "Atendimentos", path: "/estagiario/atendimentos" },
    ],
  };
  
  const menuItems = profile ? menuItemsByProfile[profile] : [];

  useEffect(() => {
    setMounted(true);  // Garantir que o componente seja montado no cliente
  }, []);

  if (!mounted) {
    return null;  // Não renderiza nada até que o componente esteja montado no cliente
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : collapsedWidth,
          transition: "width 0.3s",
          boxSizing: "border-box",
          bgcolor: drawerBg,
          color: textColor,
          borderRight: `1px solid ${dividerColor}`,
          boxShadow: isDark ? "inset -5px 0 10px rgba(0,0,0,0.2)" : "none",
          overflowX: "hidden",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          padding: 2,
          borderBottom: `1px solid ${dividerColor}`,
        }}
      >
        {open && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <img src="/logos/iesb.png" alt="IESB Saúde" width="32" height="32" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              IESB Saúde
            </Typography>
            </Box>
        )}
        <IconButton onClick={onToggleSidebar} sx={{ color: iconColor }}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      <List sx={{ px: 1 }}>
      {menuItems.map((item, index) => {
        const isActive = pathname === item.path;

        return (
          <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={!open ? item.text : ""} placement="right">
              <ListItemButton
                onClick={() => {
                  if (item.path) {
                    router.push(item.path);
                  }
                }}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: isActive ? activeColor : "transparent",
                  "&:hover": { bgcolor: hoverColor },
                  justifyContent: open ? "flex-start" : "center",
                  px: 2,
                  py: 1,
                }}
              >
                <ListItemIcon sx={{ color: iconColor, minWidth: 0, mr: open ? 2 : 0 }}>
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText primary={<Typography sx={{ fontWeight: 600 }}>{item.text}</Typography>} />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        );
      })}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2, borderTop: `1px solid ${dividerColor}` }}>
        <List sx={{ p: 0 }}>
          {/* Modo Escuro */}
          <ListItem
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              px: 2,
              justifyContent: open ? "flex-start" : "center",
              "&:hover": { bgcolor: hoverColor },
            }}
          >
            <Tooltip title={!open ? "Modo Escuro" : ""} placement="right">
              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                <ListItemIcon sx={{ color: iconColor, minWidth: 0, mr: open ? 2 : 0 }}>
                  <DarkModeIcon />
                </ListItemIcon>
                {open && (
                  <>
                    <Typography sx={{ fontWeight: 500 }}>Modo Escuro</Typography>
                    <Switch checked={darkMode} onChange={onToggleDarkMode} color="primary" />
                  </>
                )}
              </Box>
            </Tooltip>
          </ListItem>

          {/* Perfil */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={!open ? "Perfil" : ""} placement="right">
              <ListItemButton
                onClick={() => router.push("/perfil")}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: pathname === "/perfil" ? activeColor : "transparent",
                  "&:hover": { bgcolor: hoverColor },
                  justifyContent: open ? "flex-start" : "center",
                  px: 2,
                  py: 1,
                }}
              >
                <ListItemIcon sx={{ color: iconColor, minWidth: 0, mr: open ? 2 : 0 }}>
                  <PersonIcon />
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: pathname === "/perfil" ? 600 : 500 }}>
                        Perfil
                      </Typography>
                    }
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>

          {/* Configurações */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={!open ? "Configurações" : ""} placement="right">
              <ListItemButton
                onClick={() => router.push("/configuracoes")}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: pathname === "/configuracoes" ? activeColor : "transparent",
                  "&:hover": { bgcolor: hoverColor },
                  justifyContent: open ? "flex-start" : "center",
                  px: 2,
                  py: 1,
                }}
              >
                <ListItemIcon sx={{ color: iconColor, minWidth: 0, mr: open ? 2 : 0 }}>
                  <SettingsIcon />
                </ListItemIcon>
                { open && (
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: pathname === "/configuracoes" ? 600 : 500 }}>
                        Configurações
                      </Typography>
                    }
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>

          {/* Sair */}
          <ListItem disablePadding>
            <Tooltip title={!open ? "Sair" : ""} placement="right">
              <ListItemButton
                onClick={() => {
                  router.push("/auth/login");
                  Cookies.remove("session");
                  localStorage.removeItem("session");
                }}
                sx={{
                  borderRadius: 1.5,
                  "&:hover": { bgcolor: hoverColor },
                  justifyContent: open ? "flex-start" : "center",
                  px: 2,
                  py: 1,
                }}
              >
                <ListItemIcon sx={{ color: iconColor, minWidth: 0, mr: open ? 2 : 0 }}>
                  <LogoutIcon />
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={<Typography sx={{ fontWeight: 500 }}>Sair</Typography>}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Box>

    </Drawer>
  );
};

export default Sidebar;
