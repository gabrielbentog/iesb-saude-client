"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Typography,
  Button,
  CardContent,
  Grid,
  Paper,
  Container,
  CircularProgress,
  useMediaQuery,
  Fab,
  useTheme,
} from "@mui/material"
import { alpha } from "@mui/material/styles"

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import AssignmentIcon from "@mui/icons-material/Assignment"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import InfoIcon from "@mui/icons-material/Info"

import { StatCard } from "@/app/components/ui/StatCard"
import { DataTable, IconContainer, StyledBadge } from "@/app/components/DataTable"
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress"
import { apiFetch } from "@/app/lib/api"
import { mapRaw } from "@/app/utils/appointment-mapper"
import type { RawAppointment, PaginatedResponse, UIAppointment } from "@/app/types"

interface InternDashboardStats {
  nextAppointment: string | null
  completedToday: number
  scheduledThisWeek: number
  pendingApprovals: number
}

const nextHeaders = [
  { id: "patient", label: "Paciente" },
  { id: "specialty", label: "Especialidade" },
  { id: "location", label: "Local" },
  { id: "room", label: "Sala" },
  { id: "dateTime", label: "Data/Hora" },
  { id: "status", label: "Status" },
] as const

type NextHeaderId = (typeof nextHeaders)[number]["id"]

const renderAppointmentCell = (a: UIAppointment, id: NextHeaderId) => {
  switch (id) {
    case "patient":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* avatar and name */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box component="div" sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "grey.200", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {a.patientName ? a.patientName.split(" ").map(n => n[0]).join("") : ""}
            </Box>
            <Typography fontWeight={500}>{a.patientName}</Typography>
          </Box>
        </Box>
      )
    case "specialty":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconContainer>{a.icon}</IconContainer>
          {a.specialty}
        </Box>
      )
    case "location":
      return a.location
    case "room":
      return a.room
    case "dateTime":
      return `${a.date} às ${a.time}`
    case "status":
      return <StyledBadge label={a.status} badgeType={a.status} />
    default:
      return null
  }
}

export default function InternDashboard() {
  const theme = useTheme()
  const pushWithProgress = usePushWithProgress()

  const [stats, setStats] = useState<InternDashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [errorStats, setErrorStats] = useState(false)

  const [nextAppointments, setNextAppointments] = useState<UIAppointment[]>([])

  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const fetchKpis = useCallback(async () => {
    setLoadingStats(true)
    setErrorStats(false)
    try {
      // tentativa de endpoint específico para estagiário; se não existir, fallback será mostrado
      const res = await apiFetch<{ data: { nextAppointment: string | null; completedToday: number; scheduledThisWeek: number; pendingApprovals: number } }>(
        "/api/dashboard/intern_kpis",
      )
      const data = res.data ?? {}
      setStats({
        nextAppointment: data.nextAppointment ?? null,
        completedToday: data.completedToday ?? 0,
        scheduledThisWeek: data.scheduledThisWeek ?? 0,
        pendingApprovals: data.pendingApprovals ?? 0,
      })
    } catch (e) {
      console.warn("KPIs para estagiário indisponíveis", e)
      setErrorStats(true)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const fetchNext = useCallback(async () => {
    try {
      const res = await apiFetch<PaginatedResponse<RawAppointment>>(
        "/api/appointments/next?page[number]=1&page[size]=5",
      )
      const raw = res.data ?? []
      setNextAppointments((raw as RawAppointment[]).map(mapRaw))
    } catch (e) {
      console.error("Falha ao carregar próximas consultas (estagiário)", e)
    }
  }, [])

  useEffect(() => {
    fetchKpis()
  }, [fetchKpis])

  useEffect(() => {
    fetchNext()
  }, [fetchNext])

  if (loadingStats) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (errorStats || !stats) {
    // mostra um banner simples mas continua tentando carregar próximas consultas
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, py: 6 }}>
        <Container maxWidth="xl">
          <Paper sx={{ p: 4, bgcolor: "warning.light", color: "warning.contrastText" }} elevation={0}>
            <Typography variant="h6" fontWeight={700}>Painel do Estagiário</Typography>
            <Typography variant="body2">Dados do painel não estão disponíveis no momento.</Typography>
          </Paper>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, py: 6 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Paper sx={{ overflow: "hidden", border: "none", bgcolor: "primary.main", color: "white", position: "relative" }} elevation={0}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>Painel do Estagiário</Typography>
              <Typography variant="body1" sx={{ mb: 3, maxWidth: "80%", color: "rgba(255,255,255,0.9)" }}>
                Acompanhe suas próximas consultas, compromissos e métricas de desempenho.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button variant="contained" sx={{ bgcolor: "white", color: "primary.main" }} startIcon={<AddCircleOutlineIcon />} onClick={() => pushWithProgress("/estagiario/calendario")}>Ver Calendário</Button>
                <Button variant="outlined" sx={{ borderColor: "white", color: "white" }} startIcon={<AccessTimeIcon />} onClick={() => pushWithProgress("/estagiario/horarios")}>Meus Horários</Button>
              </Box>
            </CardContent>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Próxima Consulta"
                value={stats.nextAppointment ?? "--"}
                subtitle="Data/Hora"
                icon={<CalendarMonthIcon sx={{ color: "primary.main" }} />}
                iconBgColor={alpha(theme.palette.primary.main, 0.1)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Concluídas Hoje"
                value={stats.completedToday}
                subtitle="Consultas finalizadas"
                icon={<AssignmentIcon sx={{ color: "primary.main" }} />}
                iconBgColor={alpha(theme.palette.primary.main, 0.1)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Agendadas na Semana"
                value={stats.scheduledThisWeek}
                subtitle="Semana atual"
                icon={<InfoIcon sx={{ color: "warning.main" }} />}
                iconBgColor={alpha(theme.palette.warning.main, 0.1)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pendentes"
                value={stats.pendingApprovals}
                subtitle="Aprovações pendentes"
                icon={<AccessTimeIcon sx={{ color: "success.main" }} />}
                iconBgColor={alpha(theme.palette.success.main, 0.1)}
              />
            </Grid>
          </Grid>

          <DataTable<UIAppointment>
            title="Próximas Consultas"
            subtitle="Consultas atribuídas a você"
            headers={[...nextHeaders]}
            data={nextAppointments}
            renderCell={(a, id) => renderAppointmentCell(a, id as NextHeaderId)}
            rowKeyExtractor={(a) => a.id}
            onViewAllClick={() => pushWithProgress("/estagiario/consultas")}
          />

          {isMobile && (
            <Fab color="primary" sx={{ position: "fixed", bottom: 24, right: 24 }} onClick={() => pushWithProgress("/estagiario/calendario") }>
              <AddCircleOutlineIcon />
            </Fab>
          )}
        </Box>
      </Container>
    </Box>
  )
}
