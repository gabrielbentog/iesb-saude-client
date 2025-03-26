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
  Mail as MailIcon,
  Inbox as InboxIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  StarBorder,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Bookmark as BookmarkIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";

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

  const handleNestedClick = () => {
    setOpenNested(!openNested);
  };

  const drawerBg = theme.palette.background.paper;
  const textColor = theme.palette.text.primary;
  const iconColor = theme.palette.text.secondary;
  const hoverColor = theme.palette.action.hover;
  const activeColor = theme.palette.action.selected;
  const primaryColor = theme.palette.primary.main;
  const dividerColor = theme.palette.divider;

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: drawerBg,
          color: textColor,
          borderRight: `1px solid ${dividerColor}`,
          boxShadow: isDark ? "inset -5px 0 10px rgba(0,0,0,0.2)" : "none",
          transition: "all 0.3s ease",
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
      onClose={onToggleSidebar}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 2.5,
          justifyContent: "space-between",
          borderBottom: `1px solid ${dividerColor}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: primaryColor,
              width: 40,
              height: 40,
            }}
          >
            <DashboardIcon />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            AppName
          </Typography>
        </Box>
        <IconButton
          onClick={onToggleSidebar}
          sx={{
            color: iconColor,
            "&:hover": { bgcolor: hoverColor },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Box>

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
          <Avatar sx={{ width: 42, height: 42 }} alt="User Profile" src="/placeholder.svg?height=42&width=42" />
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

      <List sx={{ px: 1.5, py: 1 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            sx={{
              borderRadius: 1.5,
              "&:hover": { bgcolor: hoverColor },
              bgcolor: activeColor,
              py: 1,
            }}
          >
            <ListItemIcon sx={{ color: primaryColor, minWidth: 40 }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            sx={{
              borderRadius: 1.5,
              "&:hover": { bgcolor: hoverColor },
              py: 1,
            }}
          >
            <ListItemIcon sx={{ color: iconColor, minWidth: 40 }}>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="Inbox" primaryTypographyProps={{ fontWeight: 500 }} />
            <Badge badgeContent={3} color="primary" sx={{ mr: 1 }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={handleNestedClick}
            sx={{
              borderRadius: 1.5,
              "&:hover": { bgcolor: hoverColor },
              py: 1,
            }}
          >
            <ListItemIcon sx={{ color: iconColor, minWidth: 40 }}>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary="Messages" primaryTypographyProps={{ fontWeight: 500 }} />
            {openNested ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={openNested} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ ml: 1, mt: 0.5 }}>
            <ListItemButton
              sx={{
                pl: 4,
                borderRadius: 1.5,
                "&:hover": { bgcolor: hoverColor },
                mb: 0.5,
                py: 0.75,
              }}
            >
              <ListItemIcon sx={{ color: iconColor, minWidth: 36 }}>
                <StarBorder fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Starred" primaryTypographyProps={{ fontSize: "0.9rem" }} />
            </ListItemButton>

            <ListItemButton
              sx={{
                pl: 4,
                borderRadius: 1.5,
                "&:hover": { bgcolor: hoverColor },
                py: 0.75,
              }}
            >
              <ListItemIcon sx={{ color: iconColor, minWidth: 36 }}>
                <BookmarkIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Important" primaryTypographyProps={{ fontSize: "0.9rem" }} />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            sx={{
              borderRadius: 1.5,
              "&:hover": { bgcolor: hoverColor },
              py: 1,
            }}
          >
            <ListItemIcon sx={{ color: iconColor, minWidth: 40 }}>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" primaryTypographyProps={{ fontWeight: 500 }} />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ my: 1.5, borderColor: dividerColor }} />

      <List sx={{ px: 1.5, py: 0 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            sx={{
              borderRadius: 1.5,
              "&:hover": { bgcolor: hoverColor },
              py: 1,
            }}
          >
            <ListItemIcon sx={{ color: iconColor, minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" primaryTypographyProps={{ fontWeight: 500 }} />
          </ListItemButton>
        </ListItem>

        <ListItem
          sx={{
            borderRadius: 1.5,
            mt: 1,
            "&:hover": { bgcolor: hoverColor },
          }}
        >
          <ListItemIcon sx={{ color: iconColor, minWidth: 40 }}>
            <DarkModeIcon />
          </ListItemIcon>
          <ListItemText primary="Dark Mode" primaryTypographyProps={{ fontWeight: 500 }} />
          <Switch checked={darkMode} onChange={onToggleDarkMode} color="primary" />
        </ListItem>
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${dividerColor}`,
          mt: 2,
        }}
      >
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", textAlign: "center" }}>
          © 2025 AppName Inc.
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", textAlign: "center", mt: 0.5 }}>
          v1.0.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
