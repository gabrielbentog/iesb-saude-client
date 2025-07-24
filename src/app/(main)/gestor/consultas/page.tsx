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
  Menu,
  MenuItem,
  Skeleton,
  IconButton,
  Avatar,
  CircularProgress,
} from "@mui/material"
import { alpha } from "@mui/material/styles"

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import CheckCircleIcon   from "@mui/icons-material/CheckCircle"
import AssignmentIcon    from "@mui/icons-material/Assignment"
import AddIcon           from "@mui/icons-material/Add"
import MoreHorizIcon     from "@mui/icons-material/MoreHoriz"
import VisibilityIcon    from "@mui/icons-material/Visibility"
import EditIcon          from "@mui/icons-material/Edit"
import DeleteIcon        from "@mui/icons-material/Delete"

import { usePushWithProgress } from "@/app/hooks/usePushWithProgress"
import { StatCard } from "@/app/components/ui/StatCard"
import { DataTable, StyledBadge, IconContainer } from "@/app/components/DataTable"

import { apiFetch } from "@/app/lib/api"
import {
  RawAppointment,
  PaginatedResponse,
  UIAppointment,
  MetaWithPagination,
  DashboardStats,
  KpiResponse,
} from "@/app/types"

import {mapRaw} from "@/app/utils/appointment-mapper"

// ────────────────────────────────────────────────────────────────────────────────
// Cabeçalhos da Tabela
// ────────────────────────────────────────────────────────────────────────────────
const appointmentHeaders = [
  { id: "patient",   label: "Paciente" },
  { id: "intern",    label: "Estagiário" },
  { id: "specialty", label: "Especialidade" },
  { id: "location",  label: "Local" },
  { id: "room",      label: "Sala" },
  { id: "dateTime",  label: "Data/Hora" },
  { id: "status",    label: "Status" },
] as const

// ────────────────────────────────────────────────────────────────────────────────
// Renderização de células
// ────────────────────────────────────────────────────────────────────────────────
const renderAppointmentCell = (a: UIAppointment, id: string) => {
  switch (id) {
    case "patient":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={a.patientAvatar} sx={{ width: 32, height: 32 }}>
            {a.patientName.split(" ").map((n) => n[0]).join("")}
          </Avatar>
          <Typography fontWeight={500}>{a.patientName}</Typography>
        </Box>
      )

    case "intern":
      return a.intern?.name || "—"

    case "specialty":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconContainer sx={{ color: "primary.main" }}>
            {a.icon}
          </IconContainer>
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
      return (
        <StyledBadge
          label={a.status === "Aguardando confirmação do Paciente"
            ? "Aguard. Confirmação"
            : a.status}
          badgeType={a.status}
        />
      )
    default:
      return null
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────────────────────────────────────
export default function AppointmentManagementScreen() {
  const theme = useTheme()
  const pushWithProgress = usePushWithProgress()

  // paginação
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [metaInfo, setMetaInfo] = useState<MetaWithPagination | null>(null);
  // dados
  const [appointments, setAppointments] = useState<UIAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // menu de ações
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<UIAppointment | null>(null)

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }
  
  // ───────────── Fetch paginado ─────────────
  useEffect(() => {
    let cancel = false
    setLoading(true);

    (async () => {
      try {
        const res = await apiFetch<PaginatedResponse<RawAppointment>>(
          `/api/appointments?page[number]=${page + 1}&page[size]=${rowsPerPage}`
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

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await apiFetch<KpiResponse>("/api/dashboard/kpis");
        if (ignore) return;
        const { appointmentsToday, totalAppointments, interns, completionRate } = res.data;
        setStats({
          appointmentsToday: appointmentsToday.total,
          appointmentsTrend: appointmentsToday.percentChange,
          totalAppointments: totalAppointments.total,
          completedAppointments: totalAppointments.completed,
          pendingAppointments: totalAppointments.pending,
          totalInterns: interns.activeCount,
          completionRate,
        });
      } catch (e) {
        console.error("Falha ao carregar KPIs", e);
      } finally {
        if (!ignore) setLoadingStats(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // ───────────── KPIs dinâmicos (baseados no slice atual) ─────────────
  const todayISO = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const todayCount = appointments.filter((a) => a.date === todayISO).length

  // ───────────── Manipulação de menu ─────────────
  const handleMenuClick = (e: React.MouseEvent<HTMLElement>, appt: UIAppointment) => {
    setAnchorEl(e.currentTarget)
    setSelectedAppointment(appt)
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedAppointment(null)
  }

  const handleViewDetails = () => {
    if (selectedAppointment) {
      pushWithProgress(`/gestor/consultas/${selectedAppointment.id}`)
    }
    handleMenuClose()
  }
  const handleEditAppointment = () => {
    if (selectedAppointment) {
      pushWithProgress(`/gestor/consultas/editar/${selectedAppointment.id}`)
    }
    handleMenuClose()
  }
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return
    setLoading(true)
    try {
      await apiFetch(
      `/api/appointments/${selectedAppointment.id}/cancel`,
      { method: "PATCH" }
      )
      // Atualiza a lista removendo/cancelando a consulta localmente
      setAppointments((prev) =>
      prev.map((a) =>
        a.id === selectedAppointment.id
        ? { ...a, status: "Cancelada pelo gestor" }
        : a
      )
      )
    } catch (err) {
      console.error("Falha ao cancelar consulta", err)
    } finally {
      setLoading(false)
    }
    handleMenuClose()
  }

  const appointmentActions = (a: UIAppointment) => (
    <IconButton size="small" onClick={(e) => handleMenuClick(e, a)}>
      <MoreHorizIcon fontSize="small" />
    </IconButton>
  )

  const borderColor = (a: UIAppointment) => {
    switch (a.priority) {
      case "high":   return `4px solid ${theme.palette.error.main}`
      case "normal": return `4px solid ${theme.palette.info.main}`
      case "low":    return `4px solid ${theme.palette.success.main}`
      default:        return `4px solid ${theme.palette.grey[300]}`
    }
  }
  // ────────────────────────────────────────────────────────────────────
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Gestão de Consultas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => pushWithProgress("/gestor/calendario/agendamento")}
        >
          Definir horários
        </Button>
      </Box>

      {/* KPI Cards */}
      { loadingStats ? (
        <Skeleton variant="rounded" height={120} />
      ) : (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Consultas Hoje"
              value={todayCount}
              subtitle="Agendadas para hoje"
              icon={<CalendarMonthIcon sx={{ color: theme.palette.primary.main }} />}
              iconBgColor={alpha(theme.palette.primary.main, 0.1)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Pendente confirmação"
              value={stats?.pendingAppointments || '-'}
              subtitle={"Consultas pendentes"}  
              icon={<AssignmentIcon sx={{ color: theme.palette.info.main }} />}
              iconBgColor={alpha(theme.palette.info.main, 0.1)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Consultas Concluídas"
              value={stats?.completedAppointments || '-'}
              subtitle="Finalizadas"
              icon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
              iconBgColor={alpha(theme.palette.success.main, 0.1)}
            />
          </Grid>
        </Grid>
      )}

      {/* DataTable */}
      <DataTable<UIAppointment>
        title="Consultas Agendadas"
        subtitle="Gerencie todas as consultas"
        headers={[...appointmentHeaders]}
        data={appointments}
        renderCell={renderAppointmentCell}
        rowKeyExtractor={(a) => a.id}
        actionsColumnLabel="Ações"
        actions={appointmentActions}
        getPriorityBorderColor={borderColor}
        totalCount={metaInfo?.pagination?.totalCount || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="Nenhuma consulta encontrada."
      />

      {/* Menu Ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleViewDetails}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Ver detalhes
        </MenuItem>
        <MenuItem onClick={handleEditAppointment}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        {selectedAppointment
          && !["Rejeitada",
               "Cancelada pelo gestor",
               "Cancelada pelo paciente",
               "Concluída"].includes(selectedAppointment.status) && (
          <MenuItem onClick={handleCancelAppointment} sx={{ color: theme.palette.error.main }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Cancelar Consulta
          </MenuItem>
        )}
      </Menu>

      {loading && (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  )
}
