"use client"

import React from "react"
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Divider,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import MenuIcon from "@mui/icons-material/Menu"
import NotificationsIcon from "@mui/icons-material/Notifications"
import PersonIcon from "@mui/icons-material/Person"
import SettingsIcon from "@mui/icons-material/Settings"
import LogoutIcon from "@mui/icons-material/Logout"

interface HeaderProps {
  onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const theme = useTheme()
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null)
  const [anchorElNotifications, setAnchorElNotifications] = React.useState<null | HTMLElement>(null)

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const handleOpenNotificationsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotifications(event.currentTarget)
  }

  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null)
  }

  // return (
  //   <AppBar
  //     position="fixed"
  //     sx={{
  //       zIndex: theme.zIndex.drawer + 1,
  //       boxShadow: 1,
  //       bgcolor: "background.paper",
  //       color: "text.primary",
  //     }}
  //   >
  //     <Toolbar>
  //       <IconButton
  //         color="inherit"
  //         aria-label="toggle sidebar"
  //         onClick={onToggleSidebar}
  //         edge="start"
  //         sx={{ mr: 2 }}
  //       >
  //         <MenuIcon />
  //       </IconButton>
  //       <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
  //         Dashboard
  //       </Typography>
  //       <Box sx={{ display: "flex", alignItems: "center" }}>
  //         <IconButton
  //           size="large"
  //           aria-label="show notifications"
  //           color="inherit"
  //           onClick={handleOpenNotificationsMenu}
  //         >
  //           <Badge badgeContent={3} color="primary">
  //             <NotificationsIcon />
  //           </Badge>
  //         </IconButton>
  //         <Menu
  //           sx={{ mt: "45px" }}
  //           id="menu-notifications"
  //           anchorEl={anchorElNotifications}
  //           anchorOrigin={{
  //             vertical: "top",
  //             horizontal: "right",
  //           }}
  //           keepMounted
  //           transformOrigin={{
  //             vertical: "top",
  //             horizontal: "right",
  //           }}
  //           open={Boolean(anchorElNotifications)}
  //           onClose={handleCloseNotificationsMenu}
  //         >
  //           <MenuItem>
  //             <Box sx={{ width: 320 }}>
  //               <Typography variant="subtitle1" fontWeight="bold">
  //                 Notificação 1
  //               </Typography>
  //               <Typography variant="body2" color="text.secondary">
  //                 Detalhes da notificação.
  //               </Typography>
  //               <Typography variant="caption" color="text.secondary">
  //                 Há 1 hora
  //               </Typography>
  //             </Box>
  //           </MenuItem>
  //           <Divider />
  //           <MenuItem>
  //             <Box sx={{ width: 320 }}>
  //               <Typography variant="subtitle1" fontWeight="bold">
  //                 Notificação 2
  //               </Typography>
  //               <Typography variant="body2" color="text.secondary">
  //                 Detalhes da notificação.
  //               </Typography>
  //               <Typography variant="caption" color="text.secondary">
  //                 Há 2 dias
  //               </Typography>
  //             </Box>
  //           </MenuItem>
  //         </Menu>
  //         <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 2 }}>
  //           <Avatar alt="Usuário" src="/placeholder.svg?height=40&width=40" />
  //         </IconButton>
  //         <Menu
  //           sx={{ mt: "45px" }}
  //           id="menu-appbar"
  //           anchorEl={anchorElUser}
  //           anchorOrigin={{
  //             vertical: "top",
  //             horizontal: "right",
  //           }}
  //           keepMounted
  //           transformOrigin={{
  //             vertical: "top",
  //             horizontal: "right",
  //           }}
  //           open={Boolean(anchorElUser)}
  //           onClose={handleCloseUserMenu}
  //         >
  //           <MenuItem onClick={handleCloseUserMenu}>
  //             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  //               <PersonIcon fontSize="small" />
  //               <Typography textAlign="center">Perfil</Typography>
  //             </Box>
  //           </MenuItem>
  //           <MenuItem onClick={handleCloseUserMenu}>
  //             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  //               <SettingsIcon fontSize="small" />
  //               <Typography textAlign="center">Configurações</Typography>
  //             </Box>
  //           </MenuItem>
  //           <Divider />
  //           <MenuItem onClick={handleCloseUserMenu}>
  //             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  //               <LogoutIcon fontSize="small" />
  //               <Typography textAlign="center">Sair</Typography>
  //             </Box>
  //           </MenuItem>
  //         </Menu>
  //       </Box>
  //     </Toolbar>
  //   </AppBar>
  // )
}
