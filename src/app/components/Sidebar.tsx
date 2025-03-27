"use client";

import React, { useState } from "react";
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
  const router = useRouter();

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
            <Avatar sx={{ bgcolor: primaryColor, width: 40, height: 40 }}>
              <DashboardIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              IESB Saúde
            </Typography>
          </Box>
        )}
        <IconButton onClick={onToggleSidebar} sx={{ color: iconColor }}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>

      {open && (
        <Box sx={{ p: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: theme.palette.background.default,
              borderRadius: 2,
              border: `1px solid ${dividerColor}`,
            }}
          >
            <Avatar
              sx={{ width: 42, height: 42 }}
              alt="User Profile"
              src="/placeholder.svg?height=42&width=42"
            />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                John Doe
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                john.doe@example.com
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}

      <List sx={{ px: 1 }}>
      {[
        {
          icon: <HomeIcon />,
          text: "Dashboard",
          path: "/home/paciente",
        },
        {
          icon: <CalendarIcon />,
          text: "Calendário",
          path: "/calendario"
        },
      ].map((item, index) => {
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
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontWeight: isActive ? 600 : 500 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        );
      })}

        {/* Expandable nested items */}
        {open && (
          <Collapse in={openNested} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ ml: 1, mt: 0.5 }}>
              <ListItemButton sx={{ pl: 4, borderRadius: 1.5, py: 0.75 }}>
                <ListItemIcon sx={{ color: iconColor, minWidth: 36 }}>
                  <StarBorder fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Starred" primaryTypographyProps={{ fontSize: "0.9rem" }} />
              </ListItemButton>

              <ListItemButton sx={{ pl: 4, borderRadius: 1.5, py: 0.75 }}>
                <ListItemIcon sx={{ color: iconColor, minWidth: 36 }}>
                  <BookmarkIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Important" primaryTypographyProps={{ fontSize: "0.9rem" }} />
              </ListItemButton>
            </List>
          </Collapse>
        )}
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
                    <ListItemText primary="Modo Escuro" primaryTypographyProps={{ fontWeight: 500 }} />
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
                    primary="Perfil"
                    primaryTypographyProps={{ fontWeight: pathname === "/perfil" ? 600 : 500 }}
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
                {open && (
                  <ListItemText
                    primary="Configurações"
                    primaryTypographyProps={{ fontWeight: pathname === "/configuracoes" ? 600 : 500 }}
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
                  <ListItemText primary="Sair" primaryTypographyProps={{ fontWeight: 500 }} />
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
