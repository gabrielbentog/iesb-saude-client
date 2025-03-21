"use client"

import React from "react"
import {
  Box,
  Drawer,
  Avatar,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material"
import { styled, useTheme } from "@mui/material/styles"
import {
  AccessTime as AccessTimeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarMonthIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material"

import { motion, AnimatePresence } from "framer-motion"

const drawerWidthExpanded = 240
const drawerWidthCollapsed = 80

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}))

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const theme = useTheme()

  const drawerTransition = theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  })

  const motionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: open ? drawerWidthExpanded : drawerWidthCollapsed,
        flexShrink: 0,
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          width: open ? drawerWidthExpanded : drawerWidthCollapsed,
          transition: drawerTransition,
          overflowX: "hidden",
          boxSizing: "border-box",
        },
        transition: drawerTransition,
      }}
    >
      <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: open ? "flex-start" : "center",
        px: open ? 2 : 0,
        py: 2,
        mt: 1, // garante espaço após o header
      }}
    >
      <Avatar
        alt="João Paulo"
        src="/placeholder.svg?height=40&width=40"
        sx={{ width: 40, height: 40, transition: "all 0.3s ease-in-out" }}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            style={{ marginLeft: 16 }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                João Paulo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paciente
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
    <Divider />

      <List>
        {open && (
          <Typography variant="caption" color="text.secondary" sx={{ px: 3, py: 1, display: "block" }}>
            MENU PRINCIPAL
          </Typography>
        )}
        {[
          { label: "Dashboard", icon: <DashboardIcon color="primary" /> },
          { label: "Consultas", icon: <CalendarMonthIcon /> },
          { label: "Prontuário", icon: <DescriptionIcon /> },
        ].map(({ label, icon }) => (
          <ListItem key={label} disablePadding>
            <ListItemButton sx={{ justifyContent: open ? "initial" : "center", px: 2 }}>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 0,
                  justifyContent: "center",
                }}
              >
                {icon}
              </ListItemIcon>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={motionVariants}
                    transition={{ duration: 0.2 }}
                  >
                    <ListItemText primary={label} />
                  </motion.div>
                )}
              </AnimatePresence>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: "auto" }}>
        <Divider />
        <List>
          {open && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 3, py: 1, display: "block" }}>
              CONFIGURAÇÕES
            </Typography>
          )}
          {[
            { label: "Meu Perfil", icon: <PersonIcon /> },
            { label: "Preferências", icon: <SettingsIcon /> },
          ].map(({ label, icon }) => (
            <ListItem key={label} disablePadding>
              <ListItemButton sx={{ justifyContent: open ? "initial" : "center", px: 2 }}>
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 0,
                    justifyContent: "center",
                  }}
                >
                  {icon}
                </ListItemIcon>
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={motionVariants}
                      transition={{ duration: 0.2 }}
                    >
                      <ListItemText primary={label} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ p: 2 }}>
          <Button
            variant="text"
            startIcon={<LogoutIcon />}
            fullWidth
            sx={{
              justifyContent: open ? "flex-start" : "center",
              color: "text.secondary",
              px: open ? 2 : 0,
            }}
          >
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  Sair
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}
