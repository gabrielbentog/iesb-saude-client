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
  IconButton,
  Pagination,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

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
            <Avatar src={((): string | undefined => {
              const raw = first.avatarUrl;
              if (!raw) return undefined;
              return /^https?:\/\//.test(raw) ? raw : `${process.env.NEXT_PUBLIC_API_HOST}${raw}`;
            })()} sx={{ width: 32, height: 32 }}>
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
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;

  // Responsividade
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    try {
      const res = await apiFetch<PaginatedResponse<RawAppointment>>(
        "/api/appointments/next?page[number]=1&page[size]=5",
      );
      const raw = res.data ?? [];
      setNextAppointments(raw.map(mapRaw));
    } catch (e) {
      console.error("Falha ao carregar próximas consultas", e);
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

  const paginatedAppointments = nextAppointments.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(nextAppointments.length / itemsPerPage);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: 'background.default', py: { xs: 3, sm: 6 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3 }, pb: { xs: 6, sm: 8 } }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}>
          {/* Banner - compacto no mobile */}
          {!isMobile && (
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
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Painel do Paciente
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    maxWidth: "80%",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  Acompanhe suas consultas e tratamentos
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: "white", color: "primary.main" }}
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => pushWithProgress("/paciente/agendamento")}
                  >
                    Agendar Consulta
                  </Button>
                </Box>
              </CardContent>
            </Paper>
          )}

          {/* Header mobile */}
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
                onClick={() => pushWithProgress("/paciente/agendamento")}
              >
                Agendar
              </Button>
            </Box>
          )}

          {/* KPIs */}
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
                mb: 2,
              }}
            >
              <StatCard
                title="Próxima Consulta"
                value={stats.nextAppointment ?? "--"}
                subtitle="Data/Hora"
                icon={<CalendarMonthIcon sx={{ color: "primary.main" }} />}
                iconBgColor={alpha(theme.palette.primary.main, 0.1)}
              />
              <StatCard
                title="Consultas Concluídas"
                value={stats.completedAppointments}
                subtitle="Total até hoje"
                icon={<AssignmentIcon sx={{ color: "primary.main" }} />}
                iconBgColor={alpha(theme.palette.primary.main, 0.1)}
              />
              <StatCard
                title="Pendente confirmação"
                value={stats.pendingConfirm}
                subtitle="Aguardando sua confirmação"
                icon={<InfoIcon sx={{ color: "warning.main" }} />}
                iconBgColor={alpha(theme.palette.warning.main, 0.1)}
              />
            </Box>
          ) : (
            <Grid container spacing={3} mb={3}>
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
          )}

          {/* Próximas Consultas */}
          {isMobile ? (
            <>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                Próximas Consultas
              </Typography>
              {!loadingStats && nextAppointments.length === 0 ? (
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
                    Nenhuma consulta próxima
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Você não possui consultas agendadas.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => pushWithProgress("/paciente/agendamento")}
                    startIcon={<AddCircleOutlineIcon />}
                  >
                    Agendar Consulta
                  </Button>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {paginatedAppointments.map((a) => {
                      const professional = a.interns?.[0] || null;
                      return (
                        <Box
                          key={a.id}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            boxShadow: 1,
                            bgcolor: "background.paper",
                            cursor: "pointer",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            "&:active": {
                              transform: "scale(0.98)",
                            },
                          }}
                          onClick={() => pushWithProgress(`/paciente/consultas/${a.id}`)}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Avatar
                                src={professional?.avatarUrl ? 
                                  (/^https?:\/\//.test(professional.avatarUrl) 
                                    ? professional.avatarUrl 
                                    : `${process.env.NEXT_PUBLIC_API_HOST}${professional.avatarUrl}`)
                                  : undefined
                                }
                                sx={{ width: 32, height: 32 }}
                              >
                                {professional?.name?.[0] || "?"}
                              </Avatar>
                              <Box>
                                <Typography fontWeight={600} sx={{ fontSize: "0.95rem" }}>
                                  {professional?.name || "Não designado"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {a.specialty}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {a.date} às {a.time}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {a.location} — {a.room}
                          </Typography>
                          <StyledBadge 
                            label={a.status === "Aguardando confirmação do Paciente" ? "Aguard. Confirmação" : a.status} 
                            badgeType={a.status} 
                            sx={{ mt: 1 }} 
                          />
                        </Box>
                      );
                    })}
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
                    onClick={() => pushWithProgress("/paciente/consultas")}
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
              subtitle="Suas consultas agendadas"
              headers={[...nextHeaders]}
              data={nextAppointments}
              renderCell={(a, id) =>
                renderAppointmentCell(a, id as NextHeaderId)
              }
              rowKeyExtractor={(a) => a.id}
              onViewAllClick={() => pushWithProgress("/paciente/consultas")}
            />
          )}

        </Box>
      </Container>
    </Box>
  );
}
