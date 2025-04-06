"use client"

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
} from "@mui/material"
import {
  Edit as EditIcon,
  Lock as LockIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
} from "@mui/icons-material"
import { useEffect, useRef, useState } from "react"
import { apiFetch } from "@/app/lib/api"

interface User {
  id: number
  name: string | null
  email: string
  uid: string
  profile_id: number
  image: string | null
  created_at: string
}


export default function PerfilPage() {
  const theme = useTheme()
  const [tab, setTab] = useState(0)
  const [openEdit, setOpenEdit] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const session = localStorage.getItem("session")
    if (session) {
      const parsed = JSON.parse(session)
      if (parsed?.user) {
        setUser(parsed.user)
      }
    }
  }, [])

  const handleChangeTab = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  const handleSaveProfile = async () => {
    const newName = nameRef.current?.value?.trim()
    const newEmail = emailRef.current?.value?.trim()

    if (!newName || !newEmail || !user) return

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
          }
        }),
      })

      const updated = await res

      const session = localStorage.getItem("session")
      if (session) {
        const parsed = JSON.parse(session)
        parsed.user.name = updated?.name
        parsed.user.email = updated?.email
        localStorage.setItem("session", JSON.stringify(parsed))
        setUser({ ...user, name: updated?.namee, email: updated?.email })
      }

      setOpenEdit(false)
    } catch (err) {
      console.error(err)
      alert("Erro ao atualizar perfil")
    }
  }

  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6">Carregando perfil...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
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

        <Button variant="contained" startIcon={<EditIcon />} onClick={() => setOpenEdit(true)}>
          Editar Perfil
        </Button>
      </Box>

      <Tabs value={tab} onChange={handleChangeTab} sx={{ mb: 3 }}>
        <Tab label="Informações" icon={<InfoIcon />} iconPosition="start" />
        <Tab label="Preferências" icon={<SettingsIcon />} iconPosition="start" />
        <Tab label="Segurança" icon={<LockIcon />} iconPosition="start" />
      </Tabs>

      {tab === 0 && (
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Informações Pessoais
          </Typography>
          <Grid container spacing={3}>
            <Info label="Nome" value={user.name || "Não informado"} />
            <Info label="E-mail" value={user.email} />
            <Info label="UID" value={user.uid} />
            <Info label="ID do Perfil" value={String(user.profile_id)} />
            <Info label="Criado em" value={new Date(user.created_at).toLocaleString("pt-BR")} />
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
            <Info label="Tema" value="Claro" />
            <Info label="Fuso Horário" value="GMT-3 - Brasília" />
          </Grid>
        </Paper>
      )}

      {tab === 2 && (
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Segurança
          </Typography>
          <Grid container spacing={3}>
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

      {/* Modal de edição */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
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
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Grid item xs={12} md={6}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Grid>
  )
}
