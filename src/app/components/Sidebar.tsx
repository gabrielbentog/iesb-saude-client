"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  Typography,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  Medication as MedicationIcon,
} from "@mui/icons-material";
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import Image from "next/image";
import { useToast } from '@/app/contexts/ToastContext';

interface SidebarProps {
  open: boolean;
  drawerWidth: number;
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isMobile: boolean; // <--- Adicionado para diferenciar mobile/desktops
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  drawerWidth,
  onToggleSidebar,
  darkMode,
  onToggleDarkMode,
  isMobile,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [mounted, setMounted] = useState(false);  // Controle de montagem
  const pushWithProgress = usePushWithProgress();
  const session = Cookies.get("session");
  const profile = session ? (JSON.parse(session).profile?.toLowerCase() as keyof typeof menuItemsByProfile) : null;
  const { showToast } = useToast();

  const collapsedWidth = 60;

  const drawerBg = theme.palette.background.paper;
  const textColor = theme.palette.text.primary;
  const iconColor = theme.palette.text.secondary;
  const hoverColor = theme.palette.action.hover;
  const activeColor = theme.palette.action.selected;
  const dividerColor = theme.palette.divider;
  const pathname = usePathname();

  const menuItemsByProfile = {
    paciente: [
      { icon: <HomeIcon />, text: "Dashboard", path: "/paciente/dashboard" },
      { icon: <CalendarIcon />, text: "Calendário", path: "/paciente/calendario" },
      { icon: <MedicationIcon />, text: "Consultas", path: "/paciente/consultas" },
    ],
    gestor: [
      { icon: <DashboardIcon />, text: "Painel", path: "/gestor/dashboard" },
      { icon: <SettingsIcon />, text: "Configurações", path: "/gestor/configuracoes" },
      { icon: <MedicationIcon />, text: "Consultas", path: "/gestor/consultas" },
    ],
    estagiario: [
      { icon: <MedicationIcon />, text: "Consultas", path: "/paciente/consultas" },
    ],
  };
  
  const menuItems = profile ? menuItemsByProfile[profile] : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Drawer
      // Se for desktop, usamos 'permanent'; se for mobile, 'temporary' (sobrepõe)
      variant={isMobile ? "temporary" : "permanent"}
      // Em variant="temporary" precisamos de open / onClose
      open={open}
      onClose={onToggleSidebar}
      sx={{
        flexShrink: 0,
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          // Em telas grandes respeita a largura "aberta" ou "colapsada"
          width: isMobile ? drawerWidth : open ? drawerWidth : collapsedWidth,
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
          borderBottom: `1px solid ${dividerColor}`,
        }}
      >
        {/* Quando a sidebar está aberta (em telas grandes) */}
        {open && !isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Image src="/logos/iesb.png" alt="IESB Saúde" width={32} height={32} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                IESB Saúde
              </Typography>
            </Box>
            <IconButton onClick={onToggleSidebar} sx={{ color: iconColor }}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
        )}

        {/* Quando a sidebar está fechada (telas grandes) */}
        {!open && !isMobile && (
          <>
            <IconButton onClick={onToggleSidebar} sx={{ color: iconColor }}>
              <ChevronRightIcon />
            </IconButton>
            <Box mt={1}>
              <Image src="/logos/iesb.png" alt="IESB Saúde" width={32} height={32} />
            </Box>
          </>
        )}

        {/* Se estiver em mobile, exibe apenas um cabeçalho simples quando open */}
        {isMobile && open && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Image src="/logos/iesb.png" alt="IESB Saúde" width={32} height={32} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                IESB Saúde
              </Typography>
            </Box>
            <IconButton onClick={onToggleSidebar} sx={{ color: iconColor }}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
        )}
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
                      pushWithProgress(item.path);
                      // Se for mobile, fechar depois de navegar
                      if (isMobile) onToggleSidebar();
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
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={!open ? "Modo Escuro" : ""} placement="right">
              <ListItemButton
                onClick={() => {
                  showToast({ message: 'Tema alterado com sucesso!', severity: 'success' });
                  onToggleDarkMode();
                  if (isMobile) onToggleSidebar(); // fecha em mobile, se quiser
                }}
                sx={{
                  borderRadius: 1.5,
                  justifyContent: open ? "flex-start" : "center",
                  px: 2,
                  py: 1,
                  "&:hover": { bgcolor: hoverColor },
                }}
              >
                <ListItemIcon sx={{ color: iconColor, minWidth: 0, mr: open ? 2 : 0 }}>
                  <DarkModeIcon />
                </ListItemIcon>
                {open && (
                  <>
                    <Typography sx={{ fontWeight: 500 }}>Modo Escuro</Typography>
                    <Switch
                      checked={darkMode}
                      onChange={() => {
                        showToast({ message: 'Tema alterado com sucesso!', severity: 'success' });
                        onToggleDarkMode();
                      }}
                      color="primary"
                    />
                  </>
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>

          {/* Perfil */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={!open ? "Perfil" : ""} placement="right">
              <ListItemButton
                onClick={() => {
                  pushWithProgress("/perfil");
                  if (isMobile) onToggleSidebar();
                }}
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
                onClick={() => {
                  pushWithProgress("/configuracoes");
                  if (isMobile) onToggleSidebar();
                }}
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
                  pushWithProgress("/auth/login");
                  Cookies.remove("session");
                  localStorage.removeItem("session");
                  if (isMobile) onToggleSidebar();
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
