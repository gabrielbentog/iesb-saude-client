"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  CardContent,
  Grid,
  Paper,
  Container,
  CircularProgress,
  Avatar,
  Alert,
  useMediaQuery,
  Fab,
  useTheme,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
// History tab removed — HistoryIcon no longer needed
import InfoIcon from "@mui/icons-material/Info";

import { StatCard } from "@/app/components/ui/StatCard";
import { DataTable, StyledBadge, IconContainer } from "@/app/components/DataTable";
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";
import { apiFetch } from "@/app/lib/api";
import {
  RawAppointment,
  PaginatedResponse,
  UIAppointment,
} from "@/app/types";
import { mapRaw } from "@/app/utils/appointment-mapper";

// ────────────────────────────────────────────────────────────────────────────────
// Tipagem local para os KPIs do paciente
// ────────────────────────────────────────────────────────────────────────────────
interface DashboardPatientStats {
  nextAppointment: string | null;
  completedAppointments: number;
  pendingConfirm: number;
}

// ────────────────────────────────────────────────────────────────────────────────
// Cabeçalhos Tabelas
// ────────────────────────────────────────────────────────────────────────────────
const nextHeaders = [
  { id: "professional", label: "Profissional" },
  { id: "specialty", label: "Especialidade" },
  { id: "location", label: "Local" },
  { id: "room", label: "Sala" },
  { id: "dateTime", label: "Data/Hora" },
  { id: "status", label: "Status" },
] as const;

type NextHeaderId = (typeof nextHeaders)[number]["id"];

// ────────────────────────────────────────────────────────────────────────────────
// Renderização de Células
// ────────────────────────────────────────────────────────────────────────────────
const renderAppointmentCell = (a: UIAppointment, id: NextHeaderId) => {
  switch (id) {
    case "professional": {
      if (a.interns && a.interns.length) {
        const first = a.interns[0]
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={first.avatarUrl} sx={{ width: 32, height: 32 }}>
              {first.name ? first.name.split(" ").map((n) => n[0]).join("") : ""}
            </Avatar>
            <Typography fontWeight={500}>{first.name}</Typography>
            {a.interns.length > 1 && (
              <Tooltip title={a.interns.slice(1).map(i => i.name).join(', ')}>
                <Typography variant="caption">+{a.interns.length - 1}</Typography>
              </Tooltip>
            )}
          </Box>
        );
      }
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            <AddCircleOutlineIcon />
          </Avatar>
          <Typography fontWeight={500}>Não designado</Typography>
        </Box>
      )
    }
    case "specialty":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconContainer sx={{ color: "primary.main" }}>{a.icon}</IconContainer>
          {a.specialty}
        </Box>
      );
    case "location":
      return a.location;
    case "room":
      return a.room;
    case "dateTime":
      return `${a.date} às ${a.time}`;
    case "status":
      return <StyledBadge label={a.status === "Aguardando confirmação do Paciente"
            ? "Aguard. Confirmação"
            : a.status} badgeType={a.status} />;
    default:
      return null;
  }
};

// ────────────────────────────────────────────────────────────────────────────────
// Componente Principal
// ────────────────────────────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const theme = useTheme();
  const pushWithProgress = usePushWithProgress();

  // KPIs
  const [stats, setStats] = useState<DashboardPatientStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(false);

  // Próximas consultas
  const [nextAppointments, setNextAppointments] = useState<UIAppointment[]>([]);
  const [loadingNext, setLoadingNext] = useState(true);
  const [errorNext, setErrorNext] = useState(false);


  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // ───────────── Fetch KPIs ─────────────
  interface PatientKpisResponse {
    data: {
      nextAppointment: string | null;
      completed: number;
      pendingConfirm?: number;
    }
  }

  const fetchKpis = useCallback(async () => {
    setLoadingStats(true);
    setErrorStats(false);
    try {
      const res = await apiFetch<PatientKpisResponse>("/api/dashboard/patient_kpis");
      const {
        nextAppointment,
        completed,
        pendingConfirm,
      } = res.data;
      setStats({
        nextAppointment,
        completedAppointments: completed ?? 0,
        pendingConfirm: pendingConfirm ?? 0,
      });
    } catch (e) {
      console.error("Falha ao carregar KPIs", e);
      setErrorStats(true);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  // ───────────── Fetch Próximas ─────────────
  const fetchNext = async () => {
    setLoadingNext(true);
    setErrorNext(false);
    try {
      const res = await apiFetch<PaginatedResponse<RawAppointment>>(
        "/api/appointments/next?page[number]=1&page[size]=5",
      );
      const raw = res.data ?? [];
      setNextAppointments(raw.map(mapRaw));
    } catch (e) {
      console.error("Falha ao carregar próximas consultas", e);
      setErrorNext(true);
    } finally {
      setLoadingNext(false);
    }
  };

  useEffect(() => {
    fetchNext();
  }, []);

  const renderError = (retryFn: () => void, msg: string) => (
    <Box
      sx={{
        py: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Alert severity="error" sx={{ maxWidth: 400, width: "100%" }}>
        {msg}
      </Alert>
      <Button variant="outlined" onClick={retryFn}>
        Tentar novamente
      </Button>
    </Box>
  );

  if (loadingStats) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (errorStats) {
    return renderError(fetchKpis, "Não foi possível carregar o painel do paciente.");
  }
  if (!stats)
    return <Typography>Não foi possível carregar o painel.</Typography>;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Banner */}
          <Paper
            sx={{
              overflow: "hidden",
              border: "none",
              bgcolor: "primary.main",
              color: "white",
              position: "relative",
            }}
            elevation={0}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Painel do Paciente
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  maxWidth: "80%",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Acompanhe suas consultas, histórico e tratamentos em um só lugar.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "white", color: "primary.main" }}
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() =>
                    pushWithProgress("/paciente/agendamento")
                  }
                >
                  Agendar Consulta
                </Button>
                {/* <Button
                  variant="outlined"
                  sx={{ borderColor: "white", color: "white" }}
                  startIcon={<LocalHospitalIcon />}
                  onClick={() => pushWithProgress("/paciente/prescricoes")}
                >
                  Ver Prescrições
                </Button> */}
              </Box>
            </CardContent>
          </Paper>

          {/* KPIs */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Próxima Consulta"
                value={stats.nextAppointment ?? "--"}
                subtitle="Data/Hora"
                icon={<CalendarMonthIcon sx={{ color: "primary.main" }} />}
                iconBgColor={alpha(theme.palette.primary.main, 0.1)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Consultas Concluídas"
                value={stats.completedAppointments}
                subtitle="Total até hoje"
                icon={<AssignmentIcon sx={{ color: "primary.main" }} />}
                iconBgColor={alpha(theme.palette.primary.main, 0.1)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Pendente confirmação"
                value={stats.pendingConfirm}
                subtitle="Aguardando sua confirmação"
                icon={<InfoIcon sx={{ color: "warning.main" }} />}
                iconBgColor={alpha(theme.palette.warning.main, 0.1)}
              />
            </Grid>
          </Grid>

          <DataTable<UIAppointment>
            title="Próximas Consultas"
            subtitle="Suas consultas agendadas"
            headers={[...nextHeaders]}
            data={nextAppointments}
            renderCell={(a, id) =>
              renderAppointmentCell(a, id as NextHeaderId)
            }
            rowKeyExtractor={(a) => a.id}
            onViewAllClick={() => pushWithProgress("/paciente/consultas")}
          />

          {/* FAB móvel */}
          {isMobile && (
            <Fab
              color="primary"
              sx={{ position: "fixed", bottom: 24, right: 24 }}
              onClick={() => pushWithProgress("/paciente/calendario/agendar")}
            >
              <AddCircleOutlineIcon />
            </Fab>
          )}
        </Box>
      </Container>
    </Box>
  );
}
