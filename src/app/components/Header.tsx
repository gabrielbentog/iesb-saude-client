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
import { apiFetch } from "@/app/lib/api";
import type { NotificationItem } from '@/app/types/api';

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
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifLoading, setNotifLoading] = useState<boolean>(false);

  useEffect(() => {
    const s = localStorage.getItem("session");
    if (s) {
      const data = JSON.parse(s);
      setUser(data.user || null);
    }
    // fetch unread count on mount
    (async () => {
      try {
        const res = await apiFetch<unknown>("/api/notifications/unread_count");
        const env = (res ?? {}) as Record<string, unknown>;
        const n = (env['unread_count'] as number | undefined) ?? (env['unreadCount'] as number | undefined) ?? 0;
        setUnreadCount(n);
      } catch {
        // ignore silently for now
      }
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("session");
    Cookies.remove("session");
    router.push("/auth/login");
  };

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const data = await apiFetch<unknown>("/api/notifications?page=1&per_page=10");

      // normalize to a plain object for property access
      const envelope = (data ?? {}) as Record<string, unknown>;

      // aceita vários formatos e o typo "notificatiaons" e envelopes como { notifications: [], unread_count }
      const rawCandidates = [
        envelope['notifications'],
        envelope['notificatiaons'], // typo
        envelope['items'],
        envelope['data'],
        envelope,
      ];

      let raw: unknown[] = [];
      for (const cand of rawCandidates) {
        if (Array.isArray(cand)) {
          raw = cand as unknown[];
          break;
        }
        // some APIs return { notifications: { data: [...] } } or { notifications: [...] }
        if (cand && typeof cand === 'object') {
          const obj = cand as Record<string, unknown>;
          if (Array.isArray(obj.notifications)) {
            raw = obj.notifications as unknown[];
            break;
          }
          if (Array.isArray(obj.data)) {
            raw = obj.data as unknown[];
            break;
          }
        }
      }

      const list: unknown[] = raw ?? [];

      const normalized: NotificationItem[] = list
        .map((n: unknown, idx: number) => {
          const nn = n as Record<string, unknown>;
          const createdVal = nn['created_at'] ?? nn['inserted_at'] ?? nn['createdAt'] ?? nn['timestamp'] ?? new Date().toISOString();
          const iso = new Date(String(createdVal)).toISOString();
          const idVal = nn['id'] ?? nn['uuid'] ?? nn['_id'] ?? `notif-${iso}-${idx}`;
          const titleVal = nn['title'] ?? nn['subject'] ?? nn['message_title'] ?? nn['message'] ?? 'Notificação';
          const bodyVal = nn['body'] ?? nn['message'] ?? nn['content'] ?? '';
          const readVal =
            typeof nn['read'] === 'boolean' ? (nn['read'] as boolean) : Boolean(nn['read_at'] ?? nn['readAt']);
          const urlVal = nn['url'] ?? nn['link'] ?? nn['path'] ?? null;
          const dataVal = (nn['data'] ?? nn['meta']) as Record<string, unknown> | undefined;
          const appointmentVal = (nn['appointment_id'] ?? nn['appointmentId'] ?? null) as string | null;

          return {
            id: String(idVal),
            title: String(titleVal),
            body: String(bodyVal),
            created_at: iso,
            read: Boolean(readVal),
            url: urlVal ? String(urlVal) : null,
            data: dataVal,
            appointment_id: appointmentVal,
          } as NotificationItem;
        })
        .sort((a: NotificationItem, b: NotificationItem) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(normalized);

      // atualizar unreadCount: preferir campo do envelope, senão derivar
      const envelopeUnread =
        (envelope['unread_count'] as number | undefined) ??
        (envelope['unreadCount'] as number | undefined) ??
        ((envelope['meta'] as Record<string, unknown> | undefined)?.['unread_count'] as number | undefined) ??
        ((envelope['meta'] as Record<string, unknown> | undefined)?.['unread'] as number | undefined) ??
        undefined;
      if (typeof envelopeUnread === 'number') setUnreadCount(envelopeUnread);
      else setUnreadCount(normalized.filter((n) => !n.read).length);
    } catch (e) {
      console.error("Erro ao carregar notificações:", e);
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };


  const avatarUrl = user?.avatar && !useFallback ? user.avatar : undefined;
  // compose full url: prefer avatarUrl, then image, then avatar
  const rawAvatar = user
    ? ((user as unknown as Record<string, unknown>)['avatarUrl'] as string | undefined) ?? ((user as unknown as Record<string, unknown>)['image'] as string | undefined) ?? ((user as unknown as Record<string, unknown>)['avatar'] as string | undefined)
    : undefined;
  const avatarSrc = rawAvatar
    ? (/^https?:\/\//.test(rawAvatar) ? rawAvatar : `${process.env.NEXT_PUBLIC_API_HOST}${rawAvatar}`)
    : undefined;

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
              onClick={(e) => {
                setNotificationsAnchor(e.currentTarget);
                loadNotifications();
              }}
              sx={{
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.16),
                },
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
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
              src={avatarSrc}
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
          /* remove onClick that closed menu on any inner click */
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
          <Box sx={{ maxHeight: 360, overflow: 'auto' }}>
            {notifLoading ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>Carregando…</Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Nenhuma notificação no momento
                </Typography>
              </Box>
            ) : (
              notifications.map((n) => (
                <MenuItem
                  key={n.id}
                  onClick={async () => {
                    // navigate to url if present
                    if (n.url) {
                      // mark as read first
                      if (!n.read) {
                        try {
                          await apiFetch(`/api/notifications/${n.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({ notification: { read: true } }),
                          });
                          setUnreadCount((c) => Math.max(0, c - 1));
                          // update local item
                          setNotifications((prev) => prev.map((it) => it.id === n.id ? { ...it, read: true } : it));
                        } catch {
                          // ignore
                        }
                      }
                      setNotificationsAnchor(null);
                      // relative urls should route within app
                      if (n.url.startsWith('/')) router.push(n.url);
                      else window.location.href = n.url;
                    }
                  }}
                  sx={{ whiteSpace: 'normal', alignItems: 'flex-start' }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {/* simple dot for unread */}
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: n.read ? 'transparent' : 'error.main',
                        border: n.read ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    />
                  </ListItemIcon>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">{n.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {n.body}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.disabled">
                      {new Date(n.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
