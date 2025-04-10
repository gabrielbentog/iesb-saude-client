"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Typography,
  Button,
  Card,
  useMediaQuery,
  Chip,
  Avatar,
  Grid,
  Paper,
  Container,
  Tabs,
  Tab,
  IconButton,
  LinearProgress,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import PeopleIcon from "@mui/icons-material/People"
import AssignmentIcon from "@mui/icons-material/Assignment"
import SettingsIcon from "@mui/icons-material/Settings"
import EditIcon from "@mui/icons-material/Edit"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import EventAvailableIcon from "@mui/icons-material/EventAvailable"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import ScheduleIcon from "@mui/icons-material/Schedule"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PsychologyIcon from "@mui/icons-material/Psychology"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import MedicalServicesIcon from "@mui/icons-material/MedicalServices"
import DataTable from "@/app/components/DataTable/DataTable"
import { Column, UpcomingAppointment, Intern } from "@/app/components/DataTable/types"
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress"

// Mock data
const mockStats = {
  totalAppointments: 128,
  completedAppointments: 87,
  pendingAppointments: 41,
  totalInterns: 24,
  appointmentsToday: 12,
  appointmentsTrend: 8.5, // percentage increase
}

const mockInterns: Intern[] = [
  {
    id: 1,
    name: "Ana Silva",
    specialty: "Nutrição",
    avatar: "",
    appointmentsCompleted: 32,
    appointmentsScheduled: 8,
    status: "Ativo", // Já é compatível com "Ativo" | "Inativo"
    icon: <RestaurantIcon />,
  },
  {
    id: 2,
    name: "Carlos Mendes",
    specialty: "Psicologia",
    avatar: "",
    appointmentsCompleted: 28,
    appointmentsScheduled: 6,
    status: "Inativo",
    icon: <PsychologyIcon />,
  },
  {
    id: 3,
    name: "Juliana Costa",
    specialty: "Fisioterapia",
    avatar: "",
    appointmentsCompleted: 18,
    appointmentsScheduled: 4,
    status: "Ativo",
    icon: <MedicalServicesIcon />,
  },
  {
    id: 4,
    name: "Pedro Santos",
    specialty: "Nutrição",
    avatar: "",
    appointmentsCompleted: 15,
    appointmentsScheduled: 5,
    status: "Inativo",
    icon: <RestaurantIcon />,
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
    icon: <RestaurantIcon />,
  },
  {
    id: 2,
    patient: "João Pereira",
    intern: "Carlos Mendes",
    specialty: "Psicologia",
    date: "Hoje",
    time: "15:30",
    status: "Pendente",
    icon: <PsychologyIcon />,
  },
  {
    id: 3,
    patient: "Luiza Souza",
    intern: "Juliana Costa",
    specialty: "Fisioterapia",
    date: "Amanhã",
    time: "09:00",
    status: "Confirmada",
    icon: <MedicalServicesIcon />,
  },
]

// Definindo colunas de cada tabela:
const appointmentColumns: Column<UpcomingAppointment>[] = [
  {
    label: "Paciente",
    accessor: "patient",
  },
  {
    label: "Estagiário",
    accessor: "intern",
  },
  {
    label: "Especialidade",
    render: (row) => (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{row.icon}</Avatar>
        {row.specialty}
      </Box>
    ),
  },
  {
    label: "Data/Hora",
    render: (row) => `${row.date} às ${row.time}`,
  },
  {
    label: "Status",
    render: (row) => (
      <Chip
        label={row.status}
        color={row.status === "Confirmada" ? "success" : "warning"}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    ),
  },
]

const internColumns: Column<Intern>[] = [
  {
    label: "Nome",
    render: (row) => (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Avatar src={row.avatar} sx={{ mr: 2, width: 32, height: 32 }} />
        {row.name}
      </Box>
    ),
  },
  {
    label: "Especialidade",
    render: (row) => (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{row.icon}</Avatar>
        {row.specialty}
      </Box>
    ),
  },
  {
    label: "Consultas Realizadas",
    accessor: "appointmentsCompleted",
  },
  {
    label: "Consultas Agendadas",
    accessor: "appointmentsScheduled",
  },
  {
    label: "Status",
    render: (row) => (
      <Chip
        label={row.status}
        color={row.status === "Ativo" ? "success" : "default"}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    ),
  },
]

// Definindo actions
function appointmentActions(row: UpcomingAppointment, pushWithProgress: (path: string) => void) {
  return (
    <IconButton
      size="small"
      onClick={() => pushWithProgress(`/gestor/consultas/${row.id}`)}
    >
      <MoreVertIcon fontSize="small" />
    </IconButton>
  )
}

function internActions(row: Intern, pushWithProgress: (path: string) => void) {
  return (
    <IconButton
      size="small"
      color="primary"
      onClick={() => pushWithProgress(`/gestor/estagiarios/${row.id}`)}
    >
      <EditIcon fontSize="small" />
    </IconButton>
  )
}

export default function ManagerDashboard() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [tabValue, setTabValue] = useState(0)
  const pushWithProgress = usePushWithProgress()

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.mode === "dark" ? "#121212" : "#f5f7fa",
        color: theme.palette.text.primary,
        px: { xs: 2, md: 6 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        {/* Welcome Banner */}
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Painel de Gestão
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, maxWidth: "80%" }}>
              Gerencie estagiários, horários e consultas em um só lugar.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => pushWithProgress("/gestor/gestao-de-estagiarios")}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                  boxShadow: theme.shadows[3],
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
                onClick={() => pushWithProgress("/gestor/horarios")}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                  border: "1px solid white",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid white",
                  },
                }}
                startIcon={<ScheduleIcon />}
              >
                Alocar Horários
              </Button>
            </Box>
          </Box>
          {/* Decorative circles */}
          <Box
            sx={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 150,
              height: 150,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.1)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -40,
              right: 60,
              width: 100,
              height: 100,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.1)",
            }}
          />
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                boxShadow: theme.shadows[1],
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Consultas Hoje
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.light,
                    width: 40,
                    height: 40,
                  }}
                >
                  <EventAvailableIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>
                {mockStats.appointmentsToday}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Chip
                  icon={<TrendingUpIcon fontSize="small" />}
                  label={`+${mockStats.appointmentsTrend}%`}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 500, mr: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  vs. semana passada
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                boxShadow: theme.shadows[1],
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total de Consultas
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.secondary.light,
                    width: 40,
                    height: 40,
                  }}
                >
                  <AssignmentIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>
                {mockStats.totalAppointments}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  {mockStats.completedAppointments} concluídas, {mockStats.pendingAppointments} pendentes
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                boxShadow: theme.shadows[1],
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Estagiários Ativos
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.info.light,
                    width: 40,
                    height: 40,
                  }}
                >
                  <PeopleIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>
                {mockStats.totalInterns}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Em 3 especialidades
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                boxShadow: theme.shadows[1],
                background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                color: "white",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Typography variant="subtitle2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  Taxa de Conclusão
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    width: 40,
                    height: 40,
                  }}
                >
                  <CheckCircleIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>
                {Math.round((mockStats.completedAppointments / mockStats.totalAppointments) * 100)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(mockStats.completedAppointments / mockStats.totalAppointments) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.2)",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "white",
                  },
                }}
              />
            </Card>
          </Grid>
        </Grid>

        {/* Quick Access Cards */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Acesso Rápido
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                borderRadius: 3,
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[4],
                },
              }}
              onClick={() => pushWithProgress("/gestor/estagiarios")}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.light,
                  mb: 1,
                  width: 50,
                  height: 50,
                }}
              >
                <PeopleIcon />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={600}>
                Estagiários
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                borderRadius: 3,
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[4],
                },
              }}
              onClick={() => pushWithProgress("/gestor/horarios")}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.secondary.light,
                  mb: 1,
                  width: 50,
                  height: 50,
                }}
              >
                <AccessTimeIcon />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={600}>
                Horários
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                borderRadius: 3,
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[4],
                },
              }}
              onClick={() => pushWithProgress("/gestor/calendario")}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.info.light,
                  mb: 1,
                  width: 50,
                  height: 50,
                }}
              >
                <CalendarMonthIcon />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={600}>
                Calendário
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                borderRadius: 3,
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[4],
                },
              }}
              onClick={() => pushWithProgress("/gestor/configuracoes")}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.warning.light,
                  mb: 1,
                  width: 50,
                  height: 50,
                }}
              >
                <SettingsIcon />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={600}>
                Configurações
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs Section */}
        { !isMobile && (
          <Box sx={{ mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 2,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  minWidth: 120,
                },
              }}
            >
              <Tab label="Próximas Consultas" />
              <Tab label="Estagiários" />
            </Tabs>
  
            {/* Upcoming Appointments Tab */}
            {tabValue === 0 && (
              <>
                <DataTable<UpcomingAppointment>
                  data={mockUpcomingAppointments}
                  columns={appointmentColumns}
                  actions={(row) => appointmentActions(row, pushWithProgress)}
                  emptyMessage="Nenhuma consulta agendada."
                  actionsColumnLabel="Ações"
                  tableHeadSx={{
                    bgcolor: theme.palette.primary.main,
                    "& .MuiTableCell-root": {
                      color: "white",
                      fontWeight: 600,
                    },
                  }}
                />

                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="text"
                    color="primary"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => pushWithProgress("/gestor/consultas")}
                    sx={{ textTransform: "none" }}
                  >
                    Ver todas as consultas
                  </Button>
                </Box>
              </>
            )}

  
            {/* Interns Tab */}
            {tabValue === 1 && (
              <>
                <DataTable<Intern>
                  data={mockInterns}
                  columns={internColumns}
                  actions={(row) => internActions(row, pushWithProgress)}
                  totalCount={mockInterns.length}
                  emptyMessage="Nenhum estagiário encontrado."
                  actionsColumnLabel="Ações"
                />

                <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="text"
                    color="primary"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => pushWithProgress("/gestor/estagiarios")}
                    sx={{ textTransform: "none" }}
                  >
                    Ver todos os estagiários
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}
      </Container>

      {/* Floating Button (Mobile) */}
      {isMobile && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => pushWithProgress("/gestor/gestao-de-estagiarios")}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            borderRadius: "999px",
            px: 3,
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: theme.shadows[4],
            zIndex: 1000,
          }}
          startIcon={<PersonAddIcon />}
        >
          Adicionar Estagiário
        </Button>
      )}
    </Box>
  )
}
