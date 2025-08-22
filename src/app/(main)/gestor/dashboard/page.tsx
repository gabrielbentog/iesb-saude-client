// src/app/(main)/gestor/dashboard/page.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CardContent,
  Grid,
  Paper,
  Container,
  Tabs,
  Tab,
  LinearProgress,
  Menu,
  MenuItem,
  Avatar,
  useMediaQuery,
  Fab,
  styled,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import PsychologyIcon from "@mui/icons-material/Psychology";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

import { StatCard } from "@/app/components/ui/StatCard";
import { DataTable, StyledBadge, IconContainer } from "@/app/components/DataTable";
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";
import { apiFetch } from "@/app/lib/api";
import {
  RawAppointment,
  PaginatedResponse,
  UIAppointment,
  Intern,
  ApiResponse,
  ApiIntern,
  DashboardStats,
  KpiResponse,
} from "@/app/types";
import { mapRaw } from "@/app/utils/appointment-mapper";

import type { TabPanelProps } from "@/app/types";

// ────────────────────────────────────────────────────────────────────────────────
// Cabeçalhos Tabelas
// ────────────────────────────────────────────────────────────────────────────────
const appointmentHeaders = [
  { id: "patient", label: "Paciente" },
  { id: "intern", label: "Estagiário" },
  { id: "specialty", label: "Especialidade" },
  { id: "location", label: "Local" },
  { id: "room", label: "Sala" },
  { id: "dateTime", label: "Data/Hora" },
  { id: "status", label: "Status" },
] as const;

type AppointmentHeaderId = (typeof appointmentHeaders)[number]["id"];

const internHeaders = [
  { id: "name", label: "Estagiário" },
  { id: "specialty", label: "Especialidade" },
  { id: "appointmentsCompleted", label: "Consultas Realizadas" },
  { id: "appointmentsScheduled", label: "Consultas Agendadas" },
  // { id: "performance", label: "Performance" },
  { id: "status", label: "Status" },
] as const;

type InternHeaderId = (typeof internHeaders)[number]["id"];

const specialtyIcon = (name?: string) => {
  switch (name) {
    case "Nutrição":
      return <RestaurantIcon fontSize="small" />
    case "Psicologia":
      return <PsychologyIcon fontSize="small" />
    case "Fisioterapia":
      return <FitnessCenterIcon fontSize="small" />
    default:
      return <AssignmentIcon fontSize="small" />
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// Renderização de Células
// ────────────────────────────────────────────────────────────────────────────────
const renderAppointmentCell = (a: UIAppointment, id: AppointmentHeaderId) => {
  switch (id) {
    case "patient": {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={a.patientAvatar} sx={{ width: 32, height: 32 }}>
            {a.patientName.split(" ").map((n) => n[0]).join("")}
          </Avatar>
          <Typography fontWeight={500}>{a.patientName}</Typography>
        </Box>
      );
    }
    case "intern":
      return a.intern?.name || "—";
    case "specialty": {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconContainer sx={{ color: "primary.main" }}>{a.icon}</IconContainer>
          {a.specialty}
        </Box>
      );
    }
    case "location":
      return a.location;
    case "room":
      return a.room;
    case "dateTime":
      return `${a.date} às ${a.time}`;
    case "status":
      return <StyledBadge label={a.status} badgeType={a.status} />;
    default:
      return null;
  }
};

const renderInternCell = (intern: Intern, id: InternHeaderId) => {
  switch (id) {
    case "name": {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={intern.avatar} sx={{ width: 32, height: 32 }}>
            {intern.name.split(" ").map((n) => n[0]).join("")}
          </Avatar>
          <Typography fontWeight={500}>{intern.name}</Typography>
        </Box>
      );
    }
    case "specialty": {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconContainer sx={{ color: "primary.main" }}>{intern.icon}</IconContainer>
          {intern.specialty}
        </Box>
      );
    }
    case "appointmentsCompleted":
      return intern.appointmentsCompleted;
    case "appointmentsScheduled":
      return intern.appointmentsScheduled;
    // case "performance": {
    //   return (
    //     <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: 100 }}>
    //       <LinearProgress variant="determinate" value={intern.performance} sx={{ flexGrow: 1, height: 6, borderRadius: 3 }} />
    //       <Typography variant="caption" fontWeight={500}>{intern.performance}%</Typography>
    //     </Box>
    //   );
    // }
    case "status":
      return <StyledBadge label={intern.status} badgeType={intern.status} />;
    default:
      return null;
  }
};

// ────────────────────────────────────────────────────────────────────────────────
// Styled Tabs
// ────────────────────────────────────────────────────────────────────────────────
const StyledTabsList = styled(Tabs)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  borderRadius: 8,
  minHeight: 44,
  width: "100%",
  [theme.breakpoints.up("lg")]: {
    width: 400,
  },
  "& .MuiTabs-indicator": { display: "none" },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: 14,
  minHeight: 44,
  borderRadius: 8,
  color: theme.palette.text.primary,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
  },
}));

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Componente Principal
// ────────────────────────────────────────────────────────────────────────────────
export default function ManagerDashboard() {
  const theme = useTheme();
  const pushWithProgress = usePushWithProgress();

  // KPIs
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Appointments (próximos 5)
  const [appointments, setAppointments] = useState<UIAppointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);

  // Interns
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loadingInterns, setLoadingInterns] = useState(true);
  const [fetchedInterns, setFetchedInterns] = useState(false);

  // UI State
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // ───────────── Fetch KPIs ─────────────
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await apiFetch<KpiResponse>("/api/dashboard/kpis");
        if (ignore) return;
        const { appointmentsToday, totalAppointments, interns, completionRate, appointmentsToApprove } = res.data;
        setStats({
          appointmentsToday: appointmentsToday.total,
          appointmentsTrend: appointmentsToday.percentChange,
          totalAppointments: totalAppointments.total,
          completedAppointments: totalAppointments.completed,
          pendingAppointments: totalAppointments.pending,
          appointmentsToApprove: appointmentsToApprove,
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

  // ───────────── Fetch Appointments (próximas 5) ─────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<PaginatedResponse<RawAppointment>>("/api/appointments/next?page[number]=1&page[size]=5");
        const raw: RawAppointment[] = res.data ?? ([] as RawAppointment[]);
        if (!cancelled) setAppointments(raw.map(mapRaw));
      } catch (e) {
        console.error("Falha ao carregar próximas consultas", e);
      } finally {
        if (!cancelled) setLoadingAppts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ───────────── Fetch Interns (on demand) ─────────────
  useEffect(() => {
    if (tabValue !== 1 || fetchedInterns) return;
    setLoadingInterns(true);
    (async () => {
      try {
        const res = await apiFetch<ApiResponse<ApiIntern[]>>("/api/users/interns?page[size]=8");
        const raw = res.data ?? [];
        const mapped: Intern[] = raw.map((i) => ({
          id: i.id,
          name: i.name,
          specialty: i.specialty ?? "-",
          avatar: i.avatarUrl ?? "",
          appointmentsCompleted: i.appointmentsCompleted,
          appointmentsScheduled: i.appointmentsScheduled,
          status: i.status,
          icon: specialtyIcon(i.specialty ?? undefined),
          performance: i.performance,
        }));
        setInterns(mapped);
        setFetchedInterns(true);
      } catch (e) {
        console.error("Falha ao carregar estagiários", e);
      } finally {
        setLoadingInterns(false);
      }
    })();
  }, [tabValue, fetchedInterns]);

  // ───────────── Handlers ─────────────
  const handleTabChange = (_: React.SyntheticEvent, newVal: number) => setTabValue(newVal);
  const handleMenuClose = () => setAnchorEl(null);

  if (loadingStats) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!stats) return <Typography>Não foi possível carregar o painel.</Typography>;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, pt: 2 }}>
      <Container maxWidth="xl" sx={{ pb: isMobile ? 8 : 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Banner */}
          <Paper sx={{ overflow: "hidden", border: "none", bgcolor: "primary.main", color: "white", position: "relative" }} elevation={0}>
            <CardContent
              sx={{
                p: { xs: 3, md: 4 },
                /* ↓ somente abaixo de `sm` (≤600 px) vira flex coluna */
                display: { xs: "flex", md: "block" },
                flexDirection: { xs: "column" },
                gap: { xs: 3 },
                /* nada é aplicado ao md +  → layout grande fica intacto */
              }}
            >
              <Typography variant="h4" fontWeight={700} gutterBottom>Painel de Gestão</Typography>
              <Typography variant="body1" sx={{ mb: 3, maxWidth: "80%", color: "rgba(255,255,255,0.9)" }}>
                Gerencie estagiários, horários e consultas com eficiência.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button fullWidth={isXsScreen} variant="contained" sx={{ bgcolor: "white", color: "primary.main" }} startIcon={<PersonAddIcon />} onClick={() => pushWithProgress("/gestor/gestao-de-estagiarios")}>Adicionar Estagiário</Button>
                <Button fullWidth={isXsScreen} variant="outlined" sx={{ borderColor: "white", color: "white" }} startIcon={<AccessTimeIcon />} onClick={() => pushWithProgress("/gestor/calendario/agendamento")}>Definir Horários</Button>
              </Box>
            </CardContent>
          </Paper>

          {/* KPIs */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Consultas Hoje"
                value={stats.appointmentsToday}
                subtitle="Agendadas para hoje"
                icon={<CalendarMonthIcon sx={{ color: "primary.main" }} />}
                iconBgColor={alpha(theme.palette.primary.main, 0.1)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total de Consultas"
                value={stats.totalAppointments}
                subtitle={`${stats.completedAppointments} concluídas, ${stats.pendingAppointments} pendentes`}
                icon={<AssignmentIcon sx={{ color: "primary.main" }} />}
                iconBgColor={alpha(theme.palette.primary.main, 0.1)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Consultas para Aprovar"
                value={stats.appointmentsToApprove || 0}
                subtitle="Consultas pendentes de aprovação"
                icon={<CheckCircleIcon sx={{ color: "success.main" }} />}
                iconBgColor={alpha(theme.palette.success.main, 0.1)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Estagiários Ativos"
                value={stats.totalInterns}
                subtitle="Total de estagiários ativos"
                icon={<PeopleIcon sx={{ color: "success.main" }} />}
                iconBgColor={alpha(theme.palette.success.main, 0.1)}
              />
            </Grid>
          </Grid>

          {/* Tabs */}
          {!isMobile && (
            <Box sx={{ width: "100%" }}>
              <StyledTabsList value={tabValue} onChange={handleTabChange} variant="fullWidth">
                <StyledTab label={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><CalendarMonthIcon sx={{ fontSize: 16 }} /> Próximas Consultas</Box>} />
                <StyledTab label={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><PeopleIcon sx={{ fontSize: 16 }} /> Estagiários</Box>} />
              </StyledTabsList>

              {/* Tab 0: Appointments */}
              <TabPanel value={tabValue} index={0}>
                {loadingAppts ? (
                  <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>
                ) : (
                  <DataTable<UIAppointment>
                    title="Consultas Agendadas"
                    subtitle="Próximas consultas e seus status"
                    headers={[...appointmentHeaders]}
                    data={appointments}
                    renderCell={(a, id) => renderAppointmentCell(a, id as AppointmentHeaderId)}
                    rowKeyExtractor={(a) => a.id}
                    getPriorityBorderColor={(a) => {
                      switch (a.priority) {
                        case "high": return `4px solid ${theme.palette.error.main}`;
                        case "normal": return `4px solid ${theme.palette.info.main}`;
                        case "low": return `4px solid ${theme.palette.success.main}`;
                        default: return `4px solid ${theme.palette.grey[300]}`;
                      }
                    }}
                    onViewAllClick={() => pushWithProgress("/gestor/consultas")}
                  />
                )}
              </TabPanel>

              {/* Tab 1: Interns */}
              <TabPanel value={tabValue} index={1}>
                {loadingInterns ? (
                  <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>
                ) : (
                  <DataTable<Intern>
                    title="Gestão de Estagiários"
                    subtitle="Acompanhe o desempenho dos estagiários"
                    headers={[...internHeaders]}
                    data={interns}
                    renderCell={(i, id) => renderInternCell(i, id as InternHeaderId)}
                    rowKeyExtractor={(i) => i.id}
                    onViewAllClick={() => pushWithProgress("/gestor/gestao-de-estagiarios")}
                  />
                )}
              </TabPanel>
            </Box>
          )}

          {/* Menu */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} transformOrigin={{ horizontal: "right", vertical: "top" }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
            <MenuItem onClick={handleMenuClose}><VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> Ver detalhes</MenuItem>
            <MenuItem onClick={handleMenuClose}><EditIcon fontSize="small" sx={{ mr: 1 }} /> Editar</MenuItem>
          </Menu>
        </Box>
      </Container>
    </Box>
  );
}
