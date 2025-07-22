// src/app/(main)/paciente/consultas/page.tsx
"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  useTheme,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";

import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";
import { useToast } from "@/app/contexts/ToastContext";
import { StatCard } from "@/app/components/ui/StatCard";
import { DataTable, StyledBadge, IconContainer } from "@/app/components/DataTable";

// Tipagens e utilidades compartilhadas com a tela do Gestor
import {
  RawAppointment,
  PaginatedResponse,
  UIAppointment,
  MetaWithPagination,
} from "@/app/types";
import { mapRaw } from "@/app/utils/appointment-mapper";
import { apiFetch } from "@/app/lib/api";

// ────────────────────────────────────────────────────────────────────────────────
// Cabeçalhos da Tabela (Visão Paciente)
// ────────────────────────────────────────────────────────────────────────────────
const patientHeaders = [
  { id: "intern", label: "Profissional/Estagiário" },
  { id: "specialty", label: "Especialidade" },
  { id: "location", label: "Local" },
  { id: "dateTime", label: "Data/Hora" },
  { id: "status", label: "Status" },
] as const;

type PatientHeaderId = (typeof patientHeaders)[number]["id"];

// ────────────────────────────────────────────────────────────────────────────────
// Renderização de células
// ────────────────────────────────────────────────────────────────────────────────
const renderPatientCell = (a: UIAppointment, id: PatientHeaderId) => {
  switch (id) {
    case "intern": {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={a.intern?.avatarUrl} sx={{ width: 32, height: 32 }}>
            {a.intern?.name
              ? a.intern.name.split(" ").map((n) => n[0]).join("")
              : <PersonIcon fontSize="small" />}
          </Avatar>
          <Typography variant="body2" fontWeight={500} noWrap>
            {a.intern?.name || "—"}
          </Typography>
        </Box>
      );
    }
    case "specialty": {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconContainer sx={{ color: "primary.main" }}>{a.icon}</IconContainer>
          {a.specialty}
        </Box>
      );
    }
    case "location":
      return <Typography variant="body2" noWrap title={a.location}>{a.location}</Typography>;
    case "dateTime":
      return `${a.date} às ${a.time}`;
    case "status":
      return (
        <StyledBadge
          label={a.status === "Aguardando confirmação do Paciente"
            ? "Aguard. Confirmação"
            : a.status}
          badgeType={a.status}
        />
      );
    default:
      return null;
  }
};

// ────────────────────────────────────────────────────────────────────────────────
// Componente principal (Visão Paciente)
// ────────────────────────────────────────────────────────────────────────────────
export default function AppointmentPatientScreen() {
  const theme = useTheme();
  const pushWithProgress = usePushWithProgress();
  const { showToast } = useToast();

  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [metaInfo, setMetaInfo] = useState<MetaWithPagination | null>(null);

  // Dados
  const [appointments, setAppointments] = useState<UIAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<UIAppointment | null>(null);

  // ───────────── Fetch paginado ─────────────
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch<PaginatedResponse<RawAppointment>>(
        `/api/appointments?page[number]=${page + 1}&page[size]=${rowsPerPage}`
      );
      setAppointments(res.data.map(mapRaw));
      setMetaInfo(res.meta);
    } catch (err) {
      console.error("Falha ao buscar consultas", err);
      const message = err instanceof Error ? err.message : "Não foi possível buscar suas consultas.";
      setError(message);
      showToast({ message: `Erro: ${message}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, showToast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // ───────────── KPIs dinâmicos ─────────────
  const upcomingCount = appointments.filter((a) => ["Confirmada", "Pendente", "Reagendada"].includes(a.status)).length;
  const completedCount = appointments.filter((a) => a.status === "Concluída").length;
  const pendingCount = appointments.filter((a) => a.status === "Pendente").length;

  // ───────────── Handlers de paginação ─────────────
  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // ───────────── Handlers de menu ─────────────
  const handleMenuClick = (e: React.MouseEvent<HTMLElement>, appt: UIAppointment) => {
    setAnchorEl(e.currentTarget);
    setSelectedAppointment(appt);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAppointment(null);
  };

  const handleViewDetails = () => {
    if (selectedAppointment) pushWithProgress(`/paciente/consultas/${selectedAppointment.id}`);
    handleMenuClose();
  };

  const handleReschedule = () => {
    if (selectedAppointment) pushWithProgress(`/paciente/agendamento?reagendar=${selectedAppointment.id}`);
    handleMenuClose();
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;
    try {
      await apiFetch(`/api/appointments/${selectedAppointment.id}`, { method: "DELETE" });
      showToast({ message: "Consulta cancelada com sucesso!", severity: "success" });
      fetchAppointments();
    } catch (err) {
      console.error("Erro ao cancelar consulta", err);
      showToast({ message: "Erro ao cancelar consulta.", severity: "error" });
    } finally {
      handleMenuClose();
    }
  };

  const appointmentActions = (a: UIAppointment) => (
    <IconButton size="small" onClick={(e) => handleMenuClick(e, a)}>
      <MoreHorizIcon fontSize="small" />
    </IconButton>
  );

  const borderColor = (a: UIAppointment) => {
    switch (a.priority) {
      case "high": return `4px solid ${theme.palette.error.main}`;
      case "normal": return `4px solid ${theme.palette.info.main}`;
      case "low": return `4px solid ${theme.palette.success.main}`;
      default: return `4px solid ${theme.palette.grey[300]}`;
    }
  };

  // ────────────────────────────────────────────────────────────────────
  if (loading && appointments.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando suas consultas...</Typography>
      </Container>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="contained" onClick={fetchAppointments} sx={{ mt: 2 }}>Tentar Novamente</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Minhas Consultas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => pushWithProgress("/paciente/agendamento")}>Agendar Nova Consulta</Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Próximas Consultas"
            value={upcomingCount}
            subtitle="Agendadas ou confirmadas"
            icon={<CalendarMonthIcon sx={{ color: theme.palette.primary.main }} />}
            iconBgColor={alpha(theme.palette.primary.main, 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Consultas Concluídas"
            value={completedCount}
            subtitle="Finalizadas"
            icon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
            iconBgColor={alpha(theme.palette.success.main, 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pendentes"
            value={pendingCount}
            subtitle="Aguardando"
            icon={<ScheduleIcon sx={{ color: theme.palette.warning.main }} />}
            iconBgColor={alpha(theme.palette.warning.main, 0.1)}
            trendComponent={
              <LinearProgress variant="determinate" value={appointments.length ? (pendingCount / appointments.length) * 100 : 0} sx={{ mt: 1, height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.warning.main, 0.2) }} />
            }
          />
        </Grid>
      </Grid>

      {/* Loader para atualizações */}
      {loading && appointments.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 1 }}>Atualizando...</Typography>
        </Box>
      )}

      {/* Tabela */}
      <DataTable<UIAppointment>
        title="Meus Agendamentos"
        subtitle="Acompanhe seus compromissos de saúde"
        headers={[...patientHeaders]}
        data={appointments}
        renderCell={(a, id) => renderPatientCell(a, id as PatientHeaderId)}
        rowKeyExtractor={(a) => a.id}
        actionsColumnLabel="Opções"
        actions={appointmentActions}
        getPriorityBorderColor={borderColor}
        totalCount={metaInfo?.pagination?.totalCount || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage={!loading && appointments.length === 0 ? "Você ainda não possui consultas agendadas." : ""}
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
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> Ver Detalhes
        </MenuItem>
        {selectedAppointment && ["Confirmada", "Pendente"].includes(selectedAppointment.status) && (
          <MenuItem onClick={handleReschedule}>
            <EditCalendarIcon fontSize="small" sx={{ mr: 1 }} /> Reagendar
          </MenuItem>
        )}
        {selectedAppointment && ["Confirmada", "Pendente"].includes(selectedAppointment.status) && (
          <MenuItem onClick={handleCancel} sx={{ color: theme.palette.error.main }}>
            <CancelIcon fontSize="small" sx={{ mr: 1 }} /> Cancelar Consulta
          </MenuItem>
        )}
      </Menu>
    </Container>
  );
}
