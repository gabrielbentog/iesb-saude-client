"use client";

import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CameraAlt as CameraIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import Image from "next/image";
import { useState } from "react";

export default function PerfilPage() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);

  const handleChangeTab = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
      {/* Cabeçalho com Avatar, nome, e-mail e botão de edição */}
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
            src="/placeholder.svg"
            alt="Foto de Perfil"
            sx={{
              width: 80,
              height: 80,
              border: `2px solid ${theme.palette.divider}`,
            }}
          />
          <Box>
            <Typography variant="h5" fontWeight={600}>
              John Doe
            </Typography>
            <Typography variant="body2" color="text.secondary">
              john.doe@example.com
            </Typography>
          </Box>
        </Box>

        <Button variant="contained" startIcon={<EditIcon />} onClick={() => setOpenEdit(true)}>
          Editar Perfil
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={handleChangeTab} sx={{ mb: 3 }}>
        <Tab label="Informações" icon={<InfoIcon />} iconPosition="start" />
        <Tab label="Preferências" icon={<SettingsIcon />} iconPosition="start" />
        <Tab label="Segurança" icon={<LockIcon />} iconPosition="start" />
      </Tabs>

      {/* Conteúdo das Abas */}
      {tab === 0 && (
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Informações Pessoais
          </Typography>
          <Grid container spacing={3}>
            <Info label="Nome completo" value="Johnathan Douglas Doe" />
            <Info label="E-mail" value="john.doe@example.com" />
            <Info label="CPF" value="123.456.789-00" />
            <Info label="Instituição" value="IESB Norte" />
            <Info label="Data de Nascimento" value="15/01/1990" />
            <Info label="Telefone" value="(61) 98765-4321" />
          </Grid>
        </Paper>
      )}

      {tab === 1 && (
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Preferências do Sistema
          </Typography>
          <Grid container spacing={3}>
            <Info label="Idioma" value="Português (Brasil)" />
            <Info label="Tema" value="Escuro" />
            <Info label="Fuso Horário" value="GMT-3 - Brasília" />
            <Info label="Notificações por e-mail" value="Ativadas" />
          </Grid>
        </Paper>
      )}

      {tab === 2 && (
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Segurança
          </Typography>
          <Grid container spacing={3}>
            <Info label="Última troca de senha" value="20/03/2025" />
            <Info label="Autenticação de 2 fatores" value="Desativada" />
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Button variant="outlined">Alterar Senha</Button>
          </Box>
          <Box sx={{ mt: 5 }}>
            <Typography variant="subtitle1" color="error" fontWeight={600}>
              Zona de Perigo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Esta ação apagará permanentemente sua conta e não poderá ser desfeita.
            </Typography>
            <Button variant="contained" color="error">
              Excluir Minha Conta
            </Button>
          </Box>
        </Paper>
      )}

      {/* Diálogo de edição */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          <TextField label="Nome" fullWidth defaultValue="Johnathan Douglas Doe" />
          <TextField label="E-mail" fullWidth defaultValue="john.doe@example.com" />
          <TextField label="Instituição" fullWidth defaultValue="IESB Norte" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={() => setOpenEdit(false)} variant="contained">
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Componente para exibir rótulo e valor
function Info({ label, value }: { label: string; value: string }) {
  return (
    <Grid item xs={12} md={6}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Grid>
  );
}
