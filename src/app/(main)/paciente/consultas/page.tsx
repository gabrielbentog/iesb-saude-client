// src/app/(main)/paciente/consultas/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  IconButton,
  Avatar,
  CircularProgress,
  Tooltip,
  Pagination,
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
      if (a.interns && a.interns.length) {
        const first = a.interns[0]
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
            <Avatar src={((): string | undefined => {
              const raw = first.avatarUrl;
              if (!raw) return undefined;
              return /^https?:\/\//.test(raw) ? raw : `${process.env.NEXT_PUBLIC_API_HOST}${raw}`;
            })()} sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
              {first.name ? first.name.split(" ").map((n) => n[0]).join("") : <PersonIcon fontSize="small" />}
            </Avatar>
            <Typography 
              variant="body2" 
              fontWeight={500}
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: { xs: "120px", sm: "none" }
              }}
            >
              {first.name}
            </Typography>
            {a.interns.length > 1 && (
              <Tooltip title={a.interns.slice(1).map(i => i.name).join(', ')}>
                <Typography variant="caption" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                  +{a.interns.length - 1}
                </Typography>
              </Tooltip>
            )}
          </Box>
        )
      }
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
          <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Typography 
            variant="body2" 
            fontWeight={500}
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Não designado
          </Typography>
        </Box>
      )
    }
    case "specialty": {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconContainer sx={{ color: "primary.main" }}>{a.icon}</IconContainer>
          <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            {a.specialty}
          </Typography>
        </Box>
      );
    }
    case "location":
      return (
        <Typography 
          variant="body2" 
          title={a.location}
          sx={{
            fontSize: { xs: "0.875rem", sm: "1rem" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: { xs: "100px", sm: "none" }
          }}
        >
          {a.location}
        </Typography>
      );
    case "dateTime":
      return (
        <Typography sx={{ 
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          whiteSpace: { xs: "normal", sm: "nowrap" }
        }}>
          {a.date} às {a.time}
        </Typography>
      );
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
  const showToastRef = React.useRef(showToast);
  useEffect(() => { showToastRef.current = showToast }, [showToast]);

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
      // use ref to avoid triggering effects that depend on showToast
      try { showToastRef.current({ message: `Erro: ${message}`, severity: "error" }) } catch { /* swallow */ }
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchAppointments();
    // only re-run when page or rowsPerPage change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  // ───────────── KPIs dinâmicos (prefira valores do meta quando disponíveis) ─────────────
  const upcomingCount =
    typeof metaInfo?.nextAppointmentCount === "number"
      ? metaInfo.nextAppointmentCount
      : appointments.filter((a) => ["Confirmada", "Aguardando aprovação"].includes(a.status)).length;

  const completedCount =
    typeof metaInfo?.completedAppointmentsCount === "number"
      ? metaInfo.completedAppointmentsCount
      : appointments.filter((a) => a.status === "Concluída").length;

  const pendingCount =
    // prefer explicit pendingConfirmation from meta when available
    typeof metaInfo?.pendingConfirmation === "number"
      ? metaInfo.pendingConfirmation
      : typeof metaInfo?.nextAppointmentCount === "number"
      ? // when API provides nextAppointmentCount, derive pending as difference if possible
        Math.max(0, (metaInfo.pagination?.totalCount ?? 0) - (metaInfo.nextAppointmentCount ?? 0))
      : appointments.filter((a) => a.status === "Aguardando aprovação").length;

  const totalCount = metaInfo?.pagination?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  // ───────────── Handlers de paginação ─────────────
  const handlePageChange = (_: unknown, newPage: number) => setPage(isMobile ? newPage - 1 : newPage);
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
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3 }, px: { xs: 1.5, sm: 3 }, pb: { xs: 6, sm: 8 } }}>
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
          Minhas Consultas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => pushWithProgress("/paciente/agendamento")}
          fullWidth={isMobile}
        >
          Agendar Nova Consulta
        </Button>
      </Box>

      {/* KPI Cards */}
      {isMobile ? (
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
            title="Próximas Consultas"
            value={upcomingCount}
            subtitle="Agendadas ou confirmadas"
            icon={<CalendarMonthIcon sx={{ color: theme.palette.primary.main }} />}
            iconBgColor={alpha(theme.palette.primary.main, 0.1)}
          />
          <StatCard
            title="Concluídas"
            value={completedCount}
            subtitle="Finalizadas"
            icon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
            iconBgColor={alpha(theme.palette.success.main, 0.1)}
          />
          <StatCard
            title="Pendentes"
            value={pendingCount}
            subtitle="Aguardando sua confirmação"
            icon={<ScheduleIcon sx={{ color: theme.palette.warning.main }} />}
            iconBgColor={alpha(theme.palette.warning.main, 0.1)}
          />
        </Box>
      ) : (
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
          <Grid item xs={12} sm={12} md={4}>
            <StatCard
              title="Pendentes"
              value={pendingCount}
              subtitle="Aguardando sua confirmação"
              icon={<ScheduleIcon sx={{ color: theme.palette.warning.main }} />}
              iconBgColor={alpha(theme.palette.warning.main, 0.1)}
            />
          </Grid>
        </Grid>
      )}

      {/* Loader para atualizações */}
      {loading && appointments.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 1 }}>Atualizando...</Typography>
        </Box>
      )}

      {/* Cards no mobile / Tabela no desktop */}
      {isMobile ? (
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
                onClick={() => pushWithProgress(`/paciente/consultas/${a.id}`)}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {a.interns && a.interns.length > 0 && (
                      <Avatar 
                        src={(() => {
                          const raw = a.interns[0].avatarUrl;
                          if (!raw) return undefined;
                          return /^https?:\/\//.test(raw) 
                            ? raw 
                            : `${process.env.NEXT_PUBLIC_API_HOST}${raw}`;
                        })()}
                        sx={{ width: 28, height: 28 }}
                      >
                        {a.interns[0].name ? a.interns[0].name.split(" ").map((n) => n[0]).join("") : <PersonIcon fontSize="small" />}
                      </Avatar>
                    )}
                    <Typography fontWeight={600} sx={{ fontSize: "0.95rem" }}>
                      {a.interns && a.interns.length > 0 ? a.interns[0].name : "Não designado"}
                    </Typography>
                  </Box>
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
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {a.specialty}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {a.date} às {a.time}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {a.location}
                </Typography>
                <StyledBadge 
                  label={a.status === "Aguardando confirmação do Paciente" ? "Aguard. Confirmação" : a.status} 
                  badgeType={a.status} 
                  sx={{ mt: 1 }} 
                />
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
      ) : (
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
          totalCount={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          emptyMessage={!loading && appointments.length === 0 ? "Você ainda não possui consultas agendadas." : ""}
        />
      )}

      {/* Menu Ações */}
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
          }
        }}
      >
        <MenuItem 
          onClick={handleViewDetails}
          sx={{ 
            fontSize: { xs: "0.875rem", sm: "1rem" },
            py: { xs: 1, sm: 1.5 }
          }}
        >
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> Ver Detalhes
        </MenuItem>
        {selectedAppointment && ["Confirmada", "Aguardando aprovação"].includes(selectedAppointment.status) && (
          <MenuItem 
            onClick={handleReschedule}
            sx={{ 
              fontSize: { xs: "0.875rem", sm: "1rem" },
              py: { xs: 1, sm: 1.5 }
            }}
          >
            <EditCalendarIcon fontSize="small" sx={{ mr: 1 }} /> Reagendar
          </MenuItem>
        )}
        {selectedAppointment && ["Confirmada", "Aguardando aprovação"].includes(selectedAppointment.status) && (
          <MenuItem 
            onClick={handleCancel} 
            sx={{ 
              color: theme.palette.error.main,
              fontSize: { xs: "0.875rem", sm: "1rem" },
              py: { xs: 1, sm: 1.5 }
            }}
          >
            <CancelIcon fontSize="small" sx={{ mr: 1 }} /> Cancelar Consulta
          </MenuItem>
        )}
      </Menu>
    </Container>
  );
}
