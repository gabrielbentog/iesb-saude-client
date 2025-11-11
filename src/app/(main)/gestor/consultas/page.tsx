"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Skeleton,
  IconButton,
  Avatar,
  CircularProgress,
  Tooltip,
  Pagination,
} from "@mui/material"
import { alpha } from "@mui/material/styles"

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import CheckCircleIcon   from "@mui/icons-material/CheckCircle"
import AssignmentIcon    from "@mui/icons-material/Assignment"
import AddIcon           from "@mui/icons-material/Add"
import MoreHorizIcon     from "@mui/icons-material/MoreHoriz"
import VisibilityIcon    from "@mui/icons-material/Visibility"
import DeleteIcon        from "@mui/icons-material/Delete"

import { usePushWithProgress } from "@/app/hooks/usePushWithProgress"
import { StatCard } from "@/app/components/ui/StatCard"
import { DataTable, StyledBadge } from "@/app/components/DataTable"

import { apiFetch } from "@/app/lib/api"
import {
  RawAppointment,
  PaginatedResponse,
  UIAppointment,
  MetaWithPagination,
  DashboardStats,
  KpiResponse,
} from "@/app/types"

import { mapRaw } from "@/app/utils/appointment-mapper"

// ──────────────────────────────────────────────────────────────
// Cabeçalhos da tabela
// ──────────────────────────────────────────────────────────────
const appointmentHeaders = [
  { id: "patient",  label: "Paciente" },
  { id: "intern",   label: "Estagiário" },
  { id: "location", label: "Local" },
  { id: "room",     label: "Sala" },
  { id: "dateTime", label: "Data/Hora" },
  { id: "status",   label: "Status" },
] as const

// ──────────────────────────────────────────────────────────────
// Renderização das células (desktop)
// ──────────────────────────────────────────────────────────────
const renderAppointmentCell = (a: UIAppointment, id: string) => {
  switch (id) {
    case "patient":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
          <Avatar
            src={((): string | undefined => {
              const raw = a.patientAvatar
              if (!raw) return undefined
              return /^https?:\/\//.test(raw)
                ? raw
                : `${process.env.NEXT_PUBLIC_API_HOST}${raw}`
            })()}
            sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}
          >
            {a.patientName.split(" ").map((n) => n[0]).join("")}
          </Avatar>
          <Typography
            fontWeight={500}
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: { xs: "120px", sm: "none" },
            }}
          >
            {a.patientName}
          </Typography>
        </Box>
      )

    case "intern":
      if (a.interns?.length) {
        const first = a.interns[0].name
        if (a.interns.length > 1) {
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                fontWeight={500}
                sx={{
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: { xs: "100px", sm: "none" },
                }}
              >
                {first}
              </Typography>
              <Tooltip title={a.interns.slice(1).map((i) => i.name).join(", ")}>
                <Typography variant="caption" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                  +{a.interns.length - 1}
                </Typography>
              </Tooltip>
            </Box>
          )
        }
        return <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>{first}</Typography>
      }
      return "—"

    case "location":
      return (
        <Typography
          sx={{
            fontSize: { xs: "0.875rem", sm: "1rem" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: { xs: "100px", sm: "none" },
          }}
        >
          {a.location}
        </Typography>
      )

    case "room":
      return <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>{a.room}</Typography>

    case "dateTime":
      return (
        <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, whiteSpace: { xs: "normal", sm: "nowrap" } }}>
          {a.date} às {a.time}
        </Typography>
      )

    case "status":
      return (
        <StyledBadge
          label={a.status === "Aguardando confirmação do Paciente" ? "Aguard. Confirmação" : a.status}
          badgeType={a.status}
        />
      )
    default:
      return null
  }
}

// ──────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────
export default function AppointmentManagementScreen() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const pushWithProgress = usePushWithProgress()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [metaInfo, setMetaInfo] = useState<MetaWithPagination | null>(null)
  const [appointments, setAppointments] = useState<UIAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<UIAppointment | null>(null)

  const totalCount = metaInfo?.pagination?.totalCount || 0
  const totalPages = Math.ceil(totalCount / rowsPerPage)

  // Paginação
  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage - 1)

  // Fetch paginado
  useEffect(() => {
    let cancel = false
    setLoading(true)
    ;(async () => {
      try {
        const res = await apiFetch<PaginatedResponse<RawAppointment>>(
          `/api/appointments?page[number]=${page + 1}&page[size]=${rowsPerPage}`,
        )
        if (cancel) return
        setAppointments(res.data.map(mapRaw))
        setMetaInfo(res.meta)
      } catch (err) {
        console.error("Falha ao buscar consultas", err)
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [page, rowsPerPage])

  // KPIs
  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const res = await apiFetch<KpiResponse>("/api/dashboard/kpis")
        if (ignore) return
        const { appointmentsToday, totalAppointments, interns, completionRate, appointmentsToApprove } = res.data
        setStats({
          appointmentsToday: appointmentsToday.total,
          appointmentsTrend: appointmentsToday.percentChange,
          totalAppointments: totalAppointments.total,
          appointmentsToApprove,
          completedAppointments: totalAppointments.completed,
          pendingAppointments: totalAppointments.pending,
          totalInterns: interns.activeCount,
          completionRate,
        })
      } catch (e) {
        console.error("Falha ao carregar KPIs", e)
      } finally {
        if (!ignore) setLoadingStats(false)
      }
    })()
    return () => {
      ignore = true
    }
  }, [])

  // Ações
  const handleMenuClick = (e: React.MouseEvent<HTMLElement>, appt: UIAppointment) => {
    setAnchorEl(e.currentTarget)
    setSelectedAppointment(appt)
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedAppointment(null)
  }

  const handleViewDetails = () => {
    if (selectedAppointment) pushWithProgress(`/gestor/consultas/${selectedAppointment.id}`)
    handleMenuClose()
  }

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return
    setLoading(true)
    try {
      await apiFetch(`/api/appointments/${selectedAppointment.id}/cancel`, { method: "PATCH" })
      setAppointments((prev) =>
        prev.map((a) => (a.id === selectedAppointment.id ? { ...a, status: "Cancelada pelo gestor" } : a)),
      )
    } catch (err) {
      console.error("Falha ao cancelar consulta", err)
    } finally {
      setLoading(false)
    }
    handleMenuClose()
  }

  const borderColor = (a: UIAppointment) => {
    switch (a.priority) {
      case "high":
        return `4px solid ${theme.palette.error.main}`
      case "normal":
        return `4px solid ${theme.palette.info.main}`
      case "low":
        return `4px solid ${theme.palette.success.main}`
      default:
        return `4px solid ${theme.palette.grey[300]}`
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Renderização
  // ──────────────────────────────────────────────────────────────
  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3 }, px: { xs: 1.5, sm: 3 }, pb: { xs: 6, sm: 8 }}}>
      {/* Cabeçalho */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 1.5, sm: 2 },
          mb: { xs: 2, sm: 3 },
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Gestão de Consultas
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => pushWithProgress("/gestor/calendario/agendamento")}
          fullWidth={isMobile}
        >
          Definir horários
        </Button>
      </Box>

      {/* KPI Cards */}
      {loadingStats ? (
        <Skeleton variant="rounded" height={120} sx={{ mb: 4 }} />
      ) : isMobile ? (
        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: 2,
            pb: 1,
            scrollSnapType: "x mandatory",
            "& > *": {
              flex: "0 0 85%",
              scrollSnapAlign: "start",
            },
            mb: 3,
          }}
        >
          <StatCard
            title="Consultas Hoje"
            value={stats?.appointmentsToday || "-"}
            subtitle="Agendadas para hoje"
            icon={<CalendarMonthIcon sx={{ color: theme.palette.primary.main }} />}
            iconBgColor={alpha(theme.palette.primary.main, 0.1)}
          />
          <StatCard
            title="Pendentes"
            value={stats?.pendingAppointments || "-"}
            subtitle="Confirmação do paciente"
            icon={<AssignmentIcon sx={{ color: theme.palette.info.main }} />}
            iconBgColor={alpha(theme.palette.info.main, 0.1)}
          />
          <StatCard
            title="Concluídas"
            value={stats?.completedAppointments || "-"}
            subtitle="Finalizadas"
            icon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
            iconBgColor={alpha(theme.palette.success.main, 0.1)}
          />
        </Box>
      ) : (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Consultas Hoje"
              value={stats?.appointmentsToday || "-"}
              subtitle="Agendadas para hoje"
              icon={<CalendarMonthIcon sx={{ color: theme.palette.primary.main }} />}
              iconBgColor={alpha(theme.palette.primary.main, 0.1)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Pendentes"
              value={stats?.pendingAppointments || "-"}
              subtitle="Confirmação do paciente"
              icon={<AssignmentIcon sx={{ color: theme.palette.info.main }} />}
              iconBgColor={alpha(theme.palette.info.main, 0.1)}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <StatCard
              title="Concluídas"
              value={stats?.completedAppointments || "-"}
              subtitle="Finalizadas"
              icon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
              iconBgColor={alpha(theme.palette.success.main, 0.1)}
            />
          </Grid>
        </Grid>
      )}

      {/* Cards no mobile */}
      {isMobile ? (
        <>
          {appointments.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 6,
                px: 2,
                textAlign: "center",
              }}
            >
              <CalendarMonthIcon
                sx={{
                  fontSize: 64,
                  color: "text.disabled",
                  mb: 2,
                }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhuma consulta encontrada
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Não há consultas agendadas no momento.
              </Typography>
              <Button
                variant="contained"
                onClick={() => pushWithProgress("/gestor/calendario/agendamento")}
                startIcon={<AddIcon />}
              >
                Definir Horários
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {appointments.map((a) => (
                  <Box
                    key={a.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      boxShadow: 1,
                      borderLeft: borderColor(a),
                      bgcolor: "background.paper",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:active": {
                        transform: "scale(0.98)",
                      },
                    }}
                    onClick={() => pushWithProgress(`/gestor/consultas/${a.id}`)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography fontWeight={600} sx={{ fontSize: "0.95rem" }}>
                        {a.patientName}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMenuClick(e, a)
                        }}
                      >
                        <MoreHorizIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {a.date} às {a.time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {a.location} — {a.room}
                    </Typography>
                    <StyledBadge label={a.status} badgeType={a.status} sx={{ mt: 1 }} />
                  </Box>
                ))}
              </Box>

              {/* Paginação mobile */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={handlePageChange}
                    color="primary"
                    size="small"
                    shape="rounded"
                  />
                </Box>
              )}
            </>
          )}
        </>
      ) : (
        <DataTable<UIAppointment>
          title="Consultas Agendadas"
          subtitle="Gerencie todas as consultas"
          headers={[...appointmentHeaders]}
          data={appointments}
          renderCell={renderAppointmentCell}
          rowKeyExtractor={(a) => a.id}
          actionsColumnLabel="Ações"
          actions={(a) => (
            <IconButton size="small" onClick={(e) => handleMenuClick(e, a)}>
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          )}
          getPriorityBorderColor={borderColor}
          totalCount={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          emptyMessage="Nenhuma consulta encontrada."
        />
      )}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        sx={{
          "& .MuiPaper-root": {
            width: { xs: "100%", sm: "auto" },
            maxWidth: { xs: "100%", sm: 240 },
            borderRadius: { xs: 0, sm: 2 },
          },
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> Ver detalhes
        </MenuItem>
        {selectedAppointment &&
          !["Rejeitada", "Cancelada pelo gestor", "Cancelada pelo paciente", "Concluída"].includes(
            selectedAppointment.status,
          ) && (
            <MenuItem onClick={handleCancelAppointment} sx={{ color: theme.palette.error.main }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Cancelar Consulta
            </MenuItem>
          )}
      </Menu>

      {loading && (
        <Box sx={{ mt: 3, mb: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={28} />
        </Box>
      )}
    </Container>
  )
}
