"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  CircularProgress
} from "@mui/material"
import { alpha } from "@mui/material/styles"

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import PeopleIcon from "@mui/icons-material/People"
import AssignmentIcon from "@mui/icons-material/Assignment"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import PsychologyIcon from "@mui/icons-material/Psychology"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter"
import AddIcon from "@mui/icons-material/Add"
import VisibilityIcon from "@mui/icons-material/Visibility"
import EditIcon from "@mui/icons-material/Edit"
import { StatCard } from '@/app/components/ui/StatCard'
import { DataTable } from '@/app/components/DataTable'; // Ajuste o caminho conforme necessário
import { StyledBadge, IconContainer } from '@/app/components/DataTable';
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress"
import { apiFetch } from "@/app/lib/api"
import type { KpiResponse, DashboardStats, AppointmentsResponse, UIAppointment, Intern, ApiResponse, ApiIntern } from "@/app/types"
import { humanDate, STATUS_LABEL, statusPriority } from "@/app/types/appointments"
import { format, parseISO } from "date-fns"

import type { TabPanelProps } from "@/app/types";


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

const internHeaders = [
  { id: 'name', label: 'Estagiário' },
  { id: 'specialty', label: 'Especialidade' },
  { id: 'appointmentsCompleted', label: 'Consultas Realizadas' },
  { id: 'appointmentsScheduled', label: 'Consultas Agendadas' },
  { id: 'performance', label: 'Performance' },
  { id: 'status', label: 'Status' },
];

const appointmentHeaders = [
  { id: "patient",   label: "Paciente",    width: "auto" },
  { id: "intern",    label: "Estagiário" },
  { id: "specialty", label: "Especialidade" },
  { id: "location",  label: "Local" },
  { id: "room",      label: "Sala" }, 
  { id: "dateTime",  label: "Data/Hora" },
  { id: "status",    label: "Status" },
]

const renderInternCell = (intern: Intern, headerId: string) => {
  switch (headerId) {
    case 'name':
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={intern.avatar} sx={{ width: 32, height: 32 }}>
            {intern.name.split(" ").map((n) => n[0]).join("")}
          </Avatar>
          <Typography fontWeight={500}>{intern.name}</Typography>
        </Box>
      );
    case 'specialty':
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconContainer sx={{ color: "primary.main" }}>{intern.icon}</IconContainer>
          {intern.specialty}
        </Box>
      );
    case 'appointmentsCompleted':
      return intern.appointmentsCompleted;
    case 'appointmentsScheduled':
      return intern.appointmentsScheduled;
    case 'performance':
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: 100 }}>
          <LinearProgress
            variant="determinate"
            value={intern.performance}
            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" fontWeight={500}>
            {intern.performance}%
          </Typography>
        </Box>
      );
    case 'status':
      return <StyledBadge label={intern.status} badgeType={intern.status} />;
    default:
      return null;
  }
};

const renderAppointmentCell = (appointment: UIAppointment, headerId: string) => {
  switch (headerId) {
    case 'patient':
      return <Typography fontWeight={500}>{appointment.patientName}</Typography>;
    case 'intern':
      return appointment.intern;
    case 'specialty':
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconContainer sx={{ color: "primary.main" }}>{appointment.icon}</IconContainer>
          {appointment.specialty}
        </Box>
      );
    case "location":
      return appointment.location
    case "room":
      return appointment.room  
    case 'dateTime':
      return `${appointment.date} às ${appointment.time}`;
    case 'status':
      return <StyledBadge label={appointment.status} badgeType={appointment.status} />;
    default:
      return null;
  }
};

// Custom styled components
const StyledTabsList = styled(Tabs)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  borderRadius: 8,
  minHeight: 44,
  width: "100%",
  [theme.breakpoints.up("lg")]: {
    width: 400,
  },
  "& .MuiTabs-indicator": {
    display: "none",
  },
}))

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

function TabPanel(props: TabPanelProps) {

  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ManagerDashboard() {
  const theme = useTheme()

  const [appointments, setAppointments]   = useState<UIAppointment[]>([])
  const [loadingAppts, setLoadingAppts]   = useState(true)
  const [stats, setStats]   = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [interns, setInterns]         = useState<Intern[]>([])
  const [loadingInterns, setLoadingInterns] = useState(true)
  const [fetchedInterns, setFetchedInterns] = useState(false)

  const [tabValue, setTabValue] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  // const [selectedRow, setSelectedRow] = useState<unknown>(null)
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const completionRate = stats?.completionRate || 0// já vem pronto

  const pushWithProgress = usePushWithProgress()
  const isPositive = (stats?.appointmentsTrend ?? 0) > 0;
  const isNegative = (stats?.appointmentsTrend ?? 0) < 0;

  const trendColor = isPositive
    ? theme.palette.success.main          // verde
    : isNegative
      ? theme.palette.error.main          // vermelho
      : theme.palette.text.secondary;     // cinza neutro

  // Usa o mesmo ícone virado 180° ou outro ícone, se preferir
  const TrendIcon = isPositive
    ? TrendingUpIcon
    : isNegative
      ? TrendingUpIcon                    // será girado ↓
      : TrendingUpIcon;                   // neutro sem rotação

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    // setSelectedRow(null)
  }

  useEffect(() => {
    let ignore = false

    ;(async () => {
      try {
        const res = await apiFetch<KpiResponse>("/api/dashboard/kpis")
        if (ignore) return

        const {
          appointmentsToday,
          totalAppointments,
          interns,
          completionRate,
        } = res.data

        setStats({
          appointmentsToday:     appointmentsToday.total,
          appointmentsTrend:     appointmentsToday.percentChange,
          totalAppointments:     totalAppointments.total,
          completedAppointments: totalAppointments.completed,
          pendingAppointments:   totalAppointments.pending,
          totalInterns:          interns.activeCount,
          completionRate, // vem redondo do back-end
        })
      } catch (err) {
        console.error("Falha ao carregar KPIs", err)
      } finally {
        if (!ignore) setLoading(false)
      }
    })()

    return () => { ignore = true }
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await apiFetch<AppointmentsResponse>("/api/appointments/next?page[number]=1&page[size]=5")
        const raw = res.data ?? res.appointments ?? []

        const mapped: UIAppointment[] = raw.map((a) => {
          const specialty = a.timeSlot?.specialtyName ?? "-"
          const statusTxt = STATUS_LABEL[a.status] ?? a.status

          const location =      // pega primeiro da room (caso difira do slot)
            a.consultationRoom?.collegeLocationName ??
            a.timeSlot?.collegeLocationName ??
            "-"

          return {
            id: a.id,
            patientName: a.user?.name ?? "-",
            intern: "", // preencha quando API trouxer
            internName: "",
            patientAvatar: "",
            specialty,
            location,                               // ← novo
            room: a.consultationRoom?.name ?? "-",  // ← novo
            date: humanDate(a.date),
            time: format(parseISO(a.startTime), "HH:mm"),
            status: statusTxt,
            icon: specialtyIcon(specialty),
            priority: statusPriority(a.status),
          }
        })

        if (!cancelled) setAppointments(mapped)
      } catch (err) {
        console.error("Falha ao carregar próximas consultas", err)
      } finally {
        if (!cancelled) setLoadingAppts(false)
      }
    })()

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (tabValue !== 1 || fetchedInterns) return

    setLoadingInterns(true)

    ;(async () => {
      try {
        const res = await apiFetch<ApiResponse<ApiIntern[]>>(
          "/api/interns?page[size]=8"
        )
        const raw = res.data ?? []

        const mapped: Intern[] = raw.map((i) => ({
          id: i.id,
          name: i.name,
          specialty: i.specialty ?? "-",
          avatar: i.avatarUrl ?? "",
          appointmentsCompleted: i.appointmentsCompleted,
          appointmentsScheduled:  i.appointmentsScheduled,
          status: i.status,
          icon: specialtyIcon(i.specialty ?? undefined),
          performance: i.performance,
        }))

        setInterns(mapped)
        setFetchedInterns(true)          // marca como já buscado
      } catch (e) {
        console.error("Falha ao carregar estagiários", e)
      } finally {
        setLoadingInterns(false)
      }
    })()
  }, [tabValue, fetchedInterns])

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    )
  }

  // Se a API falhar (stats === null), mostre algo vazio em vez de quebrar tudo
  if (!stats) return <Typography>Não foi possível carregar o painel.</Typography>

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "background.paper",
        py: 6,
        px: 0,
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Welcome Banner */}
          <Paper
            sx={{
              overflow: "hidden",
              border: "none",
              background: "linear-gradient(to right, #E50839,rgba(228, 44, 105, 0.88),rgb(255, 0, 76))",
              color: "white",
              position: "relative",
            }}
            elevation={0}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Painel de Gestão
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, maxWidth: "80%", color: "rgba(255, 255, 255, 0.9)" }}>
                  Gerencie estagiários, horários e consultas com eficiência. Acompanhe métricas em tempo real e
                  otimize o atendimento.
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "white",
                      color: theme.palette.primary.main,
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                      },
                    }}
                    startIcon={<PersonAddIcon />}
                    onClick={() => pushWithProgress('/gestor/gestao-de-estagiarios')}
                  >
                    Adicionar Estagiário
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      border: "1px solid white",
                      color: "white",
                      "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid white",
                      },
                    }}
                    startIcon={<AccessTimeIcon />}
                    onClick={() => pushWithProgress('/gestor/calendario/agendamento')}
                    >
                    Alocar Horários
                  </Button>
                </Box>
              </Box>

              {/* Decorative elements */}
              <Box
                sx={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 256,
                  height: 256,
                  borderRadius: "50%",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -40,
                  right: 80,
                  width: 128,
                  height: 128,
                  borderRadius: "50%",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                }}
              />
            </CardContent>
          </Paper>

          {/* Stats Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Consultas Hoje"
                value={stats.appointmentsToday}
                subtitle="vs. semana passada"
                icon={<CalendarMonthIcon sx={{ color: "primary.main" }} />}
                iconBgColor={alpha(theme.palette.primary.main, 0.1)}
                trendComponent={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <TrendIcon
                      sx={{
                        fontSize: 16,
                        color: trendColor,
                        transform: isNegative ? "rotate(180deg)" : "none",
                      }}
                    />
                    <Typography variant="body2" sx={{ color: trendColor, fontWeight: 600 }}>
                      {stats.appointmentsTrend > 0 && "+"}
                      {stats.appointmentsTrend}%
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      vs. semana passada
                    </Typography>
                  </Box>
                }
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
                title="Estagiários Ativos"
                value={stats.totalInterns}
                subtitle="Em 3 especialidades"
                icon={<PeopleIcon sx={{ color: "success.main" }} />}
                iconBgColor={alpha(theme.palette.success.main, 0.1)}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Taxa de Conclusão"
                value={`${completionRate}%`}
                subtitle=""
                icon={<CheckCircleIcon sx={{ color: "success.main" }} />}
                iconBgColor={alpha(theme.palette.success.main, 0.1)}
                trendComponent={
                  <LinearProgress
                    variant="determinate"
                    value={completionRate}
                    sx={{
                      mt: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.success.main, 0.2),
                      "& .MuiLinearProgress-bar": {
                        bgcolor: theme.palette.success.main,
                      },
                    }}
                  />
                }
              />
            </Grid>
          </Grid>

          {/* Tabs Section */}
          <Box sx={{ width: "100%" }}>
            <StyledTabsList value={tabValue} onChange={handleTabChange} variant="fullWidth">
              <StyledTab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarMonthIcon sx={{ fontSize: 16 }} />
                    <span>Próximas Consultas</span>
                  </Box>
                }
              />
              <StyledTab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PeopleIcon sx={{ fontSize: 16 }} />
                    <span>Estagiários</span>
                  </Box>
                }
              />
            </StyledTabsList>

            {/* Appointments Tab */}
            <TabPanel value={tabValue} index={0}>
              {loadingAppts ? (
                <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
                  <CircularProgress />
                </Box>
              ) : (
                <DataTable
                  title="Consultas Agendadas"
                  subtitle="Próximas consultas e seus status"
                  headers={appointmentHeaders}
                  data={appointments}
                  renderCell={renderAppointmentCell}
                  onViewAllClick={() => pushWithProgress("/gestor/consultas")}
                  rowKeyExtractor={(a) => a.id}
                  getPriorityBorderColor={(a) => {
                    switch (a.priority) {
                      case "high":   return `4px solid ${theme.palette.error.main}`
                      case "normal": return `4px solid ${theme.palette.info.main}`
                      case "low":    return `4px solid ${theme.palette.success.main}`
                      default:       return `4px solid ${theme.palette.grey[300]}`
                    }
                  }}
                />
              )}
            </TabPanel>

            {/* Interns Tab */}
            <TabPanel value={tabValue} index={1}>
              {loadingInterns ? (
                <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
                  <CircularProgress />
                </Box>
              ) : (
                <DataTable
                  title="Gestão de Estagiários"
                  subtitle="Acompanhe o desempenho e atividades dos estagiários"
                  headers={internHeaders}
                  data={interns}
                  renderCell={renderInternCell}
                  onViewAllClick={() => pushWithProgress("/gestor/consultas")}
                  rowKeyExtractor={(i) => i.id}
                />
              )}
            </TabPanel>
          </Box>

          {/* Menu for actions */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleMenuClose}>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
              Ver detalhes
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Editar
            </MenuItem>
          </Menu>

          {/* Mobile Floating Button */}
          {isMobile && (
            <Fab
              color="primary"
              sx={{
                position: "fixed",
                bottom: 24,
                right: 24,
                boxShadow: theme.shadows[4],
              }}
            >
              <AddIcon />
            </Fab>
          )}
        </Box>
      </Container>
    </Box>
  )
}
