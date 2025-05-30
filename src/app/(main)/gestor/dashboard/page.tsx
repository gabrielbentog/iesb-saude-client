"use client"

import type React from "react"

import { useState } from "react"
import {
  Box,
  Typography,
  Button,
  Card,
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
} from "@mui/material"
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles"

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
import { DashboardTable } from '@/app/components/ui/DashboardTable'; // Ajuste o caminho conforme necessário
import { StyledBadge, IconContainer } from '@/app/components/ui/DashboardTable';

// Mock data
const mockStats = {
  totalAppointments: 128,
  completedAppointments: 87,
  pendingAppointments: 41,
  totalInterns: 24,
  appointmentsToday: 12,
  appointmentsTrend: 8.5,
}

const mockInterns = [
  {
    id: 1,
    name: "Ana Silva",
    specialty: "Nutrição",
    avatar: "/placeholder.svg?height=32&width=32",
    appointmentsCompleted: 32,
    appointmentsScheduled: 8,
    status: "Ativo",
    icon: <RestaurantIcon fontSize="small" />,
    performance: 95,
  },
  {
    id: 2,
    name: "Carlos Mendes",
    specialty: "Psicologia",
    avatar: "/placeholder.svg?height=32&width=32",
    appointmentsCompleted: 28,
    appointmentsScheduled: 6,
    status: "Inativo",
    icon: <PsychologyIcon fontSize="small" />,
    performance: 88,
  },
  {
    id: 3,
    name: "Juliana Costa",
    specialty: "Fisioterapia",
    avatar: "/placeholder.svg?height=32&width=32",
    appointmentsCompleted: 18,
    appointmentsScheduled: 4,
    status: "Ativo",
    icon: <FitnessCenterIcon fontSize="small" />,
    performance: 92,
  },
  {
    id: 4,
    name: "Pedro Santos",
    specialty: "Nutrição",
    avatar: "/placeholder.svg?height=32&width=32",
    appointmentsCompleted: 15,
    appointmentsScheduled: 5,
    status: "Ativo",
    icon: <RestaurantIcon fontSize="small" />,
    performance: 85,
  },
]

const mockUpcomingAppointments = [
  {
    id: 1,
    patient: "Maria Oliveira",
    intern: "Ana Silva",
    specialty: "Nutrição",
    date: "Hoje",
    time: "14:00",
    status: "Confirmada",
    icon: <RestaurantIcon fontSize="small" />,
    priority: "normal",
  },
  {
    id: 2,
    patient: "João Pereira",
    intern: "Carlos Mendes",
    specialty: "Psicologia",
    date: "Hoje",
    time: "15:30",
    status: "Pendente",
    icon: <PsychologyIcon fontSize="small" />,
    priority: "high",
  },
  {
    id: 3,
    patient: "Luiza Souza",
    intern: "Juliana Costa",
    specialty: "Fisioterapia",
    date: "Amanhã",
    time: "09:00",
    status: "Confirmada",
    icon: <FitnessCenterIcon fontSize="small" />,
    priority: "normal",
  },
  {
    id: 4,
    patient: "Roberto Lima",
    intern: "Pedro Santos",
    specialty: "Nutrição",
    date: "Amanhã",
    time: "10:30",
    status: "Reagendada",
    icon: <RestaurantIcon fontSize="small" />,
    priority: "low",
  },
]

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#4f46e5",
      light: "#818cf8",
      dark: "#3730a3",
    },
    secondary: {
      main: "#8b5cf6",
      light: "#a78bfa",
      dark: "#6d28d9",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    info: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    background: {
      default: "#f8fafc",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
})

const appointmentHeaders = [
  { id: 'patient', label: 'Paciente', width: 'auto' },
  { id: 'intern', label: 'Estagiário' },
  { id: 'specialty', label: 'Especialidade' },
  { id: 'dateTime', label: 'Data/Hora' },
  { id: 'status', label: 'Status' },
];

const renderAppointmentCell = (appointment: typeof mockUpcomingAppointments[0], headerId: string) => {
  switch (headerId) {
    case 'patient':
      return <Typography fontWeight={500}>{appointment.patient}</Typography>;
    case 'intern':
      return appointment.intern;
    case 'specialty':
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconContainer>{appointment.icon}</IconContainer>
          {appointment.specialty}
        </Box>
      );
    case 'dateTime':
      return `${appointment.date} às ${appointment.time}`;
    case 'status':
      return <StyledBadge label={appointment.status} badgeType={appointment.status} />;
    default:
      return null;
  }
};

// Defina as colunas para a tabela de estagiários
const internHeaders = [
  { id: 'name', label: 'Estagiário' },
  { id: 'specialty', label: 'Especialidade' },
  { id: 'appointmentsCompleted', label: 'Consultas Realizadas' },
  { id: 'appointmentsScheduled', label: 'Consultas Agendadas' },
  { id: 'performance', label: 'Performance' },
  { id: 'status', label: 'Status' },
];

const renderInternCell = (intern: typeof mockInterns[0], headerId: string) => {
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
          <IconContainer>{intern.icon}</IconContainer>
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

interface TabPanelProps {
  children?: React.ReactNode
  value: number
  index: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ManagerDashboard() {
  const [tabValue, setTabValue] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const completionRate = Math.round((mockStats.completedAppointments / mockStats.totalAppointments) * 100)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget)
    setSelectedRow(row)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedRow(null)
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)",
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
                background: "linear-gradient(to right, #4f46e5, #8b5cf6, #6366f1)",
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
                  value={mockStats.appointmentsToday}
                  subtitle="vs. semana passada"
                  icon={<CalendarMonthIcon sx={{ color: "primary.main" }} />}
                  iconBgColor={alpha(theme.palette.primary.main, 0.1)}
                  trendComponent={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <TrendingUpIcon sx={{ color: "success.main", fontSize: 16 }} />
                      <Typography variant="body2" sx={{ color: "success.main", fontWeight: 600 }}>
                        +{mockStats.appointmentsTrend}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        vs. semana passada
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total de Consultas"
                  value={mockStats.totalAppointments}
                  subtitle={`${mockStats.completedAppointments} concluídas, ${mockStats.pendingAppointments} pendentes`}
                  icon={<AssignmentIcon sx={{ color: "secondary.main" }} />}
                  iconBgColor={alpha(theme.palette.secondary.main, 0.1)}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Estagiários Ativos"
                  value={mockStats.totalInterns}
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
                <DashboardTable
                  title="Consultas Agendadas"
                  subtitle="Próximas consultas e seus status"
                  headers={appointmentHeaders}
                  data={mockUpcomingAppointments}
                  renderCell={renderAppointmentCell}
                  onAddClick={() => console.log('Adicionar nova consulta')} // Implemente a lógica
                  onViewAllClick={() => console.log('Ver todas as consultas')} // Implemente a lógica
                  rowKeyExtractor={(appointment) => appointment.id}
                  getPriorityBorderColor={(appointment) => {
                      switch (appointment.priority) {
                          case "high": return `4px solid ${theme.palette.error.main}`;
                          case "normal": return `4px solid ${theme.palette.info.main}`;
                          case "low": return `4px solid ${theme.palette.success.main}`;
                          default: return `4px solid ${theme.palette.grey[300]}`;
                      }
                  }}
                />
              </TabPanel>

              {/* Interns Tab */}
              <TabPanel value={tabValue} index={1}>
                <DashboardTable
                  title="Gestão de Estagiários"
                  subtitle="Acompanhe o desempenho e atividades dos estagiários"
                  headers={internHeaders}
                  data={mockInterns}
                  renderCell={renderInternCell}
                  onAddClick={() => console.log('Adicionar estagiário')} // Implemente a lógica
                  onViewAllClick={() => console.log('Ver todos os estagiários')} // Implemente a lógica
                  rowKeyExtractor={(intern) => intern.id}
                />
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
    </ThemeProvider>
  )
}
