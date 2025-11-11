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
  useTheme,
  Avatar,
  Pagination,
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
  const [page, setPage] = useState(0)
  const itemsPerPage = 5

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

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

  const paginatedAppointments = nextAppointments.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  )
  const totalPages = Math.ceil(nextAppointments.length / itemsPerPage)

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, py: { xs: 3, sm: 6 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3 }, pb: { xs: 6, sm: 8 } }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}>
          {!isMobile && (
            <Paper sx={{ overflow: "hidden", border: "none", bgcolor: "primary.main", color: "white", position: "relative" }} elevation={0}>
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>Painel do Estagiário</Typography>
                <Typography variant="body2" sx={{ mb: 2, maxWidth: "80%", color: "rgba(255,255,255,0.9)" }}>
                  Acompanhe suas consultas e compromissos
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button variant="contained" size="small" sx={{ bgcolor: "white", color: "primary.main" }} startIcon={<AddCircleOutlineIcon />} onClick={() => pushWithProgress("/estagiario/calendario")}>Ver Calendário</Button>
                  <Button variant="outlined" size="small" sx={{ borderColor: "white", color: "white" }} startIcon={<AccessTimeIcon />} onClick={() => pushWithProgress("/estagiario/horarios")}>Meus Horários</Button>
                </Box>
              </CardContent>
            </Paper>
          )}

          {isMobile && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Dashboard
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => pushWithProgress("/estagiario/calendario")}
              >
                Calendário
              </Button>
            </Box>
          )}

          {/* KPIs */}
          {loadingStats ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress />
            </Box>
          ) : isMobile ? (
            <Box
              sx={{
                display: "flex",
                overflowX: "auto",
                overflowY: "hidden",
                gap: 2,
                pb: 1,
                mb: 3,
                scrollSnapType: "x mandatory",
                width: "100vw",
                ml: "-16px", // compensa padding do Container
                px: "16px",
                boxSizing: "border-box",
                "&::-webkit-scrollbar": { display: "none" },
                "& > *": {
                  flex: "0 0 85%",
                  scrollSnapAlign: "start",
                },
              }}
            >
              <StatCard
                title="Próxima Consulta"
                value={stats.nextAppointment ?? "--"}
                subtitle="Data/Hora"
                icon={<CalendarMonthIcon sx={{ color: theme.palette.primary.main }} />}
                iconBgColor={alpha(theme.palette.primary.main, 0.1)}
              />
              <StatCard
                title="Concluídas Hoje"
                value={stats.completedToday}
                subtitle="Consultas finalizadas"
                icon={<AssignmentIcon sx={{ color: theme.palette.primary.main }} />}
                iconBgColor={alpha(theme.palette.primary.main, 0.1)}
              />
              <StatCard
                title="Agendadas na Semana"
                value={stats.scheduledThisWeek}
                subtitle="Semana atual"
                icon={<InfoIcon sx={{ color: theme.palette.warning.main }} />}
                iconBgColor={alpha(theme.palette.warning.main, 0.1)}
              />
              <StatCard
                title="Pendentes"
                value={stats.pendingApprovals}
                subtitle="Aprovações pendentes"
                icon={<AccessTimeIcon sx={{ color: theme.palette.success.main }} />}
                iconBgColor={alpha(theme.palette.success.main, 0.1)}
              />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Próxima Consulta"
                  value={stats.nextAppointment ?? "--"}
                  subtitle="Data/Hora"
                  icon={<CalendarMonthIcon sx={{ color: theme.palette.primary.main }} />}
                  iconBgColor={alpha(theme.palette.primary.main, 0.1)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Concluídas Hoje"
                  value={stats.completedToday}
                  subtitle="Consultas finalizadas"
                  icon={<AssignmentIcon sx={{ color: theme.palette.primary.main }} />}
                  iconBgColor={alpha(theme.palette.primary.main, 0.1)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Agendadas na Semana"
                  value={stats.scheduledThisWeek}
                  subtitle="Semana atual"
                  icon={<InfoIcon sx={{ color: theme.palette.warning.main }} />}
                  iconBgColor={alpha(theme.palette.warning.main, 0.1)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Pendentes"
                  value={stats.pendingApprovals}
                  subtitle="Aprovações pendentes"
                  icon={<AccessTimeIcon sx={{ color: theme.palette.success.main }} />}
                  iconBgColor={alpha(theme.palette.success.main, 0.1)}
                />
              </Grid>
            </Grid>
          )}

          {/* Próximas Consultas */}
          {isMobile ? (
            <>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                Próximas Consultas
              </Typography>
              {nextAppointments.length === 0 ? (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    boxShadow: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1.5,
                    textAlign: "center",
                  }}
                >
                  <CalendarMonthIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.5 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Nenhuma consulta agendada
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Você não possui consultas próximas no momento
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CalendarMonthIcon />}
                    onClick={() => pushWithProgress("/estagiario/consultas")}
                    sx={{ mt: 0.5, fontSize: "0.75rem" }}
                  >
                    Ver Histórico
                  </Button>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {paginatedAppointments.map((a) => (
                      <Box
                        key={a.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          boxShadow: 1,
                          bgcolor: "background.paper",
                          cursor: "pointer",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          "&:active": {
                            transform: "scale(0.98)",
                          },
                        }}
                        onClick={() => pushWithProgress(`/estagiario/consultas/${a.id}`)}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: "grey.200", fontSize: "0.875rem" }}>
                              {a.patientName?.[0] || "?"}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600} sx={{ fontSize: "0.875rem" }}>
                                {a.patientName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                {a.specialty}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                          {a.date} às {a.time}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {a.location} — {a.room}
                        </Typography>
                        <StyledBadge label={a.status} badgeType={a.status} sx={{ mt: 0.75, fontSize: "0.7rem" }} />
                      </Box>
                    ))}
                  </Box>

                  {/* Paginação mobile */}
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Pagination
                      count={totalPages}
                      page={page + 1}
                      onChange={(_, newPage) => setPage(newPage - 1)}
                      color="primary"
                      size="small"
                      shape="rounded"
                    />
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => pushWithProgress("/estagiario/consultas")}
                    sx={{ mt: 1 }}
                  >
                    Ver Todas
                  </Button>
                </>
              )}
            </>
          ) : (
            <DataTable<UIAppointment>
              title="Próximas Consultas"
              subtitle="Consultas atribuídas a você"
              headers={[...nextHeaders]}
              data={nextAppointments}
              renderCell={(a, id) => renderAppointmentCell(a, id as NextHeaderId)}
              rowKeyExtractor={(a) => a.id}
              onViewAllClick={() => pushWithProgress("/estagiario/consultas")}
            />
          )}
        </Box>
      </Container>
    </Box>
  )
}
