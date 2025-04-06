"use client";

import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Lock as LockIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/app/lib/api";

interface User {
  id: number;
  name: string | null;
  email: string;
  uid: string;
  profile_id: number;
  image: string | null;
  created_at: string;
}

export default function PerfilPage() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed?.user) {
        setUser(parsed.user);
      }
    }
  }, []);

  const handleChangeTab = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleSaveProfile = async () => {
    const newName = nameRef.current?.value?.trim();
    const newEmail = emailRef.current?.value?.trim();

    if (!newName || !newEmail || !user) return;

    try {
      const res = await apiFetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            name: newName,
            email: newEmail,
          },
        }),
      });

      const updated = await res;

      const session = localStorage.getItem("session");
      if (session) {
        const parsed = JSON.parse(session);
        parsed.user.name = updated?.name;
        parsed.user.email = updated?.email;
        localStorage.setItem("session", JSON.stringify(parsed));
        setUser({ ...user, name: updated?.name, email: updated?.email });
      }

      setOpenEdit(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar perfil");
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6">Carregando perfil...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
      {/* Cabeçalho do Perfil */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={user.image || "/placeholder.svg"}
            alt="Foto de Perfil"
            sx={{
              width: 80,
              height: 80,
              border: `2px solid ${theme.palette.divider}`,
            }}
          />
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {user.name || user.uid}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => setOpenEdit(true)}
          sx={{
            textTransform: "none",
            borderRadius: "999px",
            fontWeight: 600,
            px: 3,
            py: 1.2,
            transition: "transform 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: theme.shadows[4],
            },
          }}
        >
          Editar Perfil
        </Button>
      </Box>

      {/* Abas (Tabs) */}
      <Tabs
        value={tab}
        onChange={handleChangeTab}
        sx={{
          mb: 3,
          ".MuiTab-root": {
            textTransform: "none",
            fontWeight: 500,
          },
        }}
      >
        <Tab label="Informações" icon={<InfoIcon />} iconPosition="start" />
        <Tab label="Preferências" icon={<SettingsIcon />} iconPosition="start" />
        <Tab label="Segurança" icon={<LockIcon />} iconPosition="start" />
      </Tabs>

      {/* Conteúdo das Abas */}
      {tab === 0 && (
        <Paper
          elevation={1}
          sx={{
            p: 3,
            borderRadius: 2,
            mb: 2,
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: theme.shadows[3],
            },
          }}
        >
          <Typography variant="h6" gutterBottom>
            Informações Pessoais
          </Typography>

          {/* Container em CSS Grid para as infos */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            <Info label="Nome" value={user.name || "Não informado"} />
            <Info label="E-mail" value={user.email} />
            <Info label="UID" value={user.uid} />
            <Info label="ID do Perfil" value={String(user.profile_id)} />
            <Info
              label="Criado em"
              value={new Date(user.created_at).toLocaleString("pt-BR")}
            />
          </Box>
        </Paper>
      )}

      {tab === 1 && (
        <Paper
          elevation={1}
          sx={{
            p: 3,
            borderRadius: 2,
            mb: 2,
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: theme.shadows[3],
            },
          }}
        >
          <Typography variant="h6" gutterBottom>
            Preferências do Sistema
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            <Info label="Idioma" value="Português (Brasil)" />
            <Info label="Tema" value="Claro" />
            <Info label="Fuso Horário" value="GMT-3 - Brasília" />
          </Box>
        </Paper>
      )}

      {tab === 2 && (
        <Paper
          elevation={1}
          sx={{
            p: 3,
            borderRadius: 2,
            mb: 2,
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: theme.shadows[3],
            },
          }}
        >
          <Typography variant="h6" gutterBottom>
            Segurança
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            <Info label="Autenticação de 2 fatores" value="Desativada" />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button variant="outlined" sx={{ textTransform: "none" }}>
              Alterar Senha
            </Button>
          </Box>

          <Box sx={{ mt: 5 }}>
            <Typography variant="subtitle1" color="error" fontWeight={600}>
              Zona de Perigo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Esta ação apagará permanentemente sua conta e não poderá ser desfeita.
            </Typography>
            <Button variant="contained" color="error" sx={{ textTransform: "none" }}>
              Excluir Minha Conta
            </Button>
          </Box>
        </Paper>
      )}

      {/* Modal de edição do perfil */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}
        >
          <TextField
            label="Nome"
            fullWidth
            inputRef={nameRef}
            defaultValue={user.name || ""}
          />
          <TextField
            label="E-mail"
            fullWidth
            inputRef={emailRef}
            defaultValue={user.email}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleSaveProfile} variant="contained">
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/** 
 * Substituto para o antigo Grid item
 * Agora cada "Info" é apenas um Box flexível,
 * adaptado dentro do "display: grid" do container.
 */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}
