// src/app/(main)/paciente/consultas/page.tsx
"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  useTheme,
  Avatar,
  CircularProgress,
  Tooltip,
  Button,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
// more icon removed for estagiario view
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={((): string | undefined => {
              const raw = first.avatarUrl;
              if (!raw) return undefined;
              return /^https?:\/\//.test(raw) ? raw : `${process.env.NEXT_PUBLIC_API_HOST}${raw}`;
            })()} sx={{ width: 32, height: 32 }}>
              {first.name ? first.name.split(" ").map((n) => n[0]).join("") : <PersonIcon fontSize="small" />}
            </Avatar>
            <Typography variant="body2" fontWeight={500} noWrap>
              {first.name}
            </Typography>
            {a.interns.length > 1 && (
              <Tooltip title={a.interns.slice(1).map(i => i.name).join(', ')}>
                <Typography variant="caption">+{a.interns.length - 1}</Typography>
              </Tooltip>
            )}
          </Box>
        )
      }
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Typography variant="body2" fontWeight={500} noWrap>
            Não designado
          </Typography>
        </Box>
      )
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

  // Menu (não usado para estagiário)

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
  const upcomingCount = appointments.filter((a) => ["Confirmada", "Aguardando aprovação"].includes(a.status)).length;
  const completedCount = appointments.filter((a) => a.status === "Concluída").length;
  const pendingCount = appointments.filter((a) => a.status === "Aguardando aprovação").length;

  // ───────────── Handlers de paginação ─────────────
  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // O estagiário apenas visualiza. Navegar para detalhe ao clicar na linha.

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
            subtitle="Aguardando confirmação"
            icon={<ScheduleIcon sx={{ color: theme.palette.warning.main }} />}
            iconBgColor={alpha(theme.palette.warning.main, 0.1)}
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
        getPriorityBorderColor={borderColor}
        totalCount={metaInfo?.pagination?.totalCount || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage={!loading && appointments.length === 0 ? "Você ainda não possui consultas agendadas." : ""}
        rowOnClick={(a) => pushWithProgress(`/estagiario/consultas/${a.id}`)}
      />
      {/* Estagiário não tem menu de ações nesta tela */}
    </Container>
  );
}
