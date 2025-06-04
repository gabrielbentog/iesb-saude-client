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
  Divider,
  Stack,
  useTheme,
} from "@mui/material";
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
import type { SidebarProps } from '@/app/types';

// Estilos para os itens da lista, para evitar repetição
const listItemButtonStyles = (theme: any, open: boolean, isActive: boolean = false) => ({
  borderRadius: theme.shape.borderRadius * 1.5, // Um pouco mais arredondado
  mb: theme.spacing(0.5),
  py: theme.spacing(1.25), // Ajuste de padding vertical
  px: theme.spacing(2),    // Ajuste de padding horizontal
  justifyContent: open ? "flex-start" : "center",
  backgroundColor: isActive ? theme.palette.action.selected : "transparent",
  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary, // Cor do ícone e texto quando ativo
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.primary, // Texto mais escuro no hover
  },
  "& .MuiListItemIcon-root": { // Estilo para o ícone dentro do botão
    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
    minWidth: 0,
    mr: open ? theme.spacing(2) : 0,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  "& .MuiListItemText-primary": {
    fontWeight: isActive ? 700 : 500, // Texto mais forte quando ativo
    transition: theme.transitions.create("opacity", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    opacity: open ? 1 : 0,
  },
});

const Sidebar: React.FC<SidebarProps> = ({
  open,
  drawerWidth,
  onToggleSidebar,
  darkMode,
  onToggleDarkMode,
  isMobile,
}) => {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const pushWithProgress = usePushWithProgress();
  const session = Cookies.get("session");
  const profile = session ? (JSON.parse(session).profile?.toLowerCase() as keyof typeof menuItemsByProfile) : null;
  const { showToast } = useToast();

  const collapsedWidth = theme.spacing(7); // Usar theme.spacing para consistência

  const pathname = usePathname();

  const menuItemsByProfile = {
    paciente: [
      { icon: <HomeIcon />, text: "Dashboard", path: "/paciente/dashboard" },
      { icon: <CalendarIcon />, text: "Calendário", path: "/paciente/calendario" },
      { icon: <MedicationIcon />, text: "Consultas", path: "/paciente/consultas" },
    ],
    gestor: [
      { icon: <DashboardIcon />, text: "Painel", path: "/gestor/dashboard" },
      { icon: <CalendarIcon />, text: "Calendário", path: "/gestor/calendario" },
      { icon: <MedicationIcon />, text: "Consultas", path: "/gestor/consultas" },
      { icon: <PersonIcon />, text: "Estagiários", path: "/gestor/gestao-de-estagiarios" },
    ],
    estagiario: [
      { icon: <MedicationIcon />, text: "Consultas", path: "/paciente/consultas" },
    ],
  };

  const menuItems = profile ? menuItemsByProfile[profile] : [];

  const bottomMenuItems = [
    {
      icon: <PersonIcon />,
      text: "Perfil",
      path: "/perfil",
      onClick: () => pushWithProgress("/perfil"),
    },
    {
      icon: <SettingsIcon />,
      text: "Configurações",
      path: "/configuracoes",
      onClick: () => pushWithProgress("/configuracoes"),
    },
    {
      icon: <LogoutIcon />,
      text: "Sair",
      onClick: () => {
        pushWithProgress("/auth/login");
        Cookies.remove("session");
        localStorage.removeItem("session");
      },
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const DrawerHeader = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent={open ? "space-between" : "center"}
      sx={{
        padding: theme.spacing(0, 1), // Ajustar padding horizontal
        ...theme.mixins.toolbar,      // Altura padrão da toolbar para consistência
        minHeight: theme.spacing(8),  // Altura mínima
        px: theme.spacing(2.5),       // Padding horizontal
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      {open && (
        <Stack direction="row" alignItems="center" spacing={1.5} component="a" href="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
          <Image src="/logos/iesb.png" alt="IESB Saúde" width={32} height={32} />
          <Typography variant="h6" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
            IESB Saúde
          </Typography>
        </Stack>
      )}
       {/* Botão de Toggle sempre visível em desktop, ajusta o ícone */}
      {!isMobile && (
        <IconButton onClick={onToggleSidebar} sx={{ color: theme.palette.text.secondary }}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      )}
      {/* Em mobile, o botão de fechar só aparece se o drawer estiver aberto */}
      {isMobile && open && (
         <IconButton onClick={onToggleSidebar} sx={{ color: theme.palette.text.secondary, ml: 'auto' /* Empurra para a direita */ }}>
          <ChevronLeftIcon />
        </IconButton>
      )}
       {/* Logo pequeno quando fechado e não é mobile (apenas para referência, pode ser removido se o ChevronRight for suficiente) */}
      {!open && !isMobile && !isMobile && (
         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', mt: -7 /* Ajuste para centralizar com o ícone de toggle */ }}>
            <Image src="/logos/iesb.png" alt="IESB Saúde" width={32} height={32} />
         </Box>
      )}
    </Stack>
  );


  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={onToggleSidebar} // Necessário para 'temporary' e para fechar com clique fora em mobile
      ModalProps={{
        keepMounted: true, // Melhor para performance em mobile
      }}
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
        }),
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : collapsedWidth,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
          }),
          boxSizing: "border-box",
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRight: { xs: 'none', sm: `1px solid ${theme.palette.divider}`}, // Sem borda em mobile
          boxShadow: isMobile && open ? theme.shadows[8] : (theme.palette.mode === 'dark' && !isMobile ? 'rgba(0, 0, 0, 0.2) 0px 0px 10px 0px inset' : 'none'),
          overflowX: "hidden",
        },
      }}
    >
      {DrawerHeader}

      <List sx={{ px: theme.spacing(1.5), pt: theme.spacing(1) }}>
        {menuItems.map((item, index) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={`${item.text}-${index}`} disablePadding>
              <Tooltip title={!open ? item.text : ""} placement="right" arrow>
                <ListItemButton
                  onClick={() => {
                    if (item.path) {
                      pushWithProgress(item.path);
                      if (isMobile) onToggleSidebar();
                    }
                  }}
                  selected={isActive} // Prop 'selected' pode ser usada para estilização pelo tema
                  sx={listItemButtonStyles(theme, open, isActive)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  {open && <ListItemText primary={item.text} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} /> {/* Empurra os itens abaixo para o final */}

      <Box sx={{ p: theme.spacing(1.5) }}>
        <Divider sx={{ my: theme.spacing(1) }} />
        <List sx={{ p: 0 }}>
          {/* Modo Escuro */}
          <ListItem disablePadding>
            <Tooltip title={!open ? "Modo Escuro" : ""} placement="right" arrow>
              <ListItemButton
                onClick={() => {
                  if (!open) { // Só alterna se estiver fechado, senão deixa o Switch controlar
                    showToast({ message: 'Tema alterado com sucesso!', severity: 'success' });
                    onToggleDarkMode();
                  }
                }}
                sx={listItemButtonStyles(theme, open)}
              >
                <ListItemIcon><DarkModeIcon /></ListItemIcon>
                {open && (
                  <>
                    <ListItemText primary="Modo Escuro" sx={{ mr: 1 }}/>
                    <Switch
                      edge="end"
                      checked={darkMode}
                      onChange={() => {
                        showToast({ message: 'Tema alterado com sucesso!', severity: 'success' });
                        onToggleDarkMode();
                      }}
                      onClick={(e) => e.stopPropagation()} // Impede que o clique no Switch propague para o ListItemButton
                      size="small"
                    />
                  </>
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>

          {bottomMenuItems.map((item) => {
            const isActive = item.path ? pathname === item.path : false;
            return (
              <ListItem key={item.text} disablePadding>
                <Tooltip title={!open ? item.text : ""} placement="right" arrow>
                  <ListItemButton
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      if (isMobile) onToggleSidebar();
                    }}
                    selected={isActive}
                    sx={listItemButtonStyles(theme, open, isActive)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    {open && <ListItemText primary={item.text} />}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;