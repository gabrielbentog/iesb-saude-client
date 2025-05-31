"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  useTheme,
  Menu,
  MenuItem,
  LinearProgress,
  IconButton, // Importar IconButton para o MoreHorizIcon
  Avatar // Importar Avatar para os pacientes
} from "@mui/material"
import { alpha } from "@mui/material/styles"

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth" // Total de Consultas Hoje
import CheckCircleIcon from "@mui/icons-material/CheckCircle" // Consultas Concluídas
import ScheduleIcon from "@mui/icons-material/Schedule" // Consultas Pendentes
import AssignmentIcon from "@mui/icons-material/Assignment" // Total de Consultas
import AddIcon from "@mui/icons-material/Add" // Botão "Adicionar Consulta"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz' // Ícone de "Mais opções" para a tabela
import VisibilityIcon from '@mui/icons-material/Visibility' // Ícone "Ver detalhes"
import EditIcon from '@mui/icons-material/Edit' // Ícone "Editar"
import DeleteIcon from '@mui/icons-material/Delete' // Ícone "Excluir"

// Ícones de especialidade (certifique-se de que estão disponíveis ou ajuste-os)
import RestaurantIcon from "@mui/icons-material/Restaurant" // Ex: Nutrição
import PsychologyIcon from "@mui/icons-material/Psychology" // Ex: Psicologia
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter" // Ex: Fisioterapia

import { usePushWithProgress } from "@/app/hooks/usePushWithProgress"

// Importar os componentes de UI (ajuste os caminhos conforme necessário)
import { StatCard } from "@/app/components/ui/StatCard"
import { DashboardTable } from "@/app/components/ui/DashboardTable"
import { StyledBadge, IconContainer } from "@/app/components/ui/DashboardTable"

// --- Interfaces de Dados ---
interface Appointment {
  id: number
  patientName: string
  patientAvatar: string // Caminho para o avatar do paciente
  internName: string
  specialty: string
  date: string // Ex: "2024-06-01"
  time: string // Ex: "10:00"
  status: "Confirmada" | "Pendente" | "Reagendada" | "Cancelada" | "Concluída"
  priority: "low" | "normal" | "high"
  specialtyIcon: React.ReactNode // Ícone da especialidade
}

// --- Dados Mock de Consultas ---
const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientName: "Maria Oliveira",
    patientAvatar: "/placeholder.svg?height=32&width=32",
    internName: "Ana Silva",
    specialty: "Nutrição",
    date: "31/05/2025",
    time: "10:00",
    status: "Confirmada",
    priority: "normal",
    specialtyIcon: <RestaurantIcon fontSize="small" />,
  },
  {
    id: 2,
    patientName: "João Pereira",
    patientAvatar: "/placeholder.svg?height=32&width=32",
    internName: "Carlos Mendes",
    specialty: "Psicologia",
    date: "31/05/2025",
    time: "11:30",
    status: "Pendente",
    priority: "high",
    specialtyIcon: <PsychologyIcon fontSize="small" />,
  },
  {
    id: 3,
    patientName: "Luiza Souza",
    patientAvatar: "/placeholder.svg?height=32&width=32",
    internName: "Juliana Costa",
    specialty: "Fisioterapia",
    date: "01/06/2025",
    time: "09:00",
    status: "Reagendada",
    priority: "low",
    specialtyIcon: <FitnessCenterIcon fontSize="small" />,
  },
  {
    id: 4,
    patientName: "Pedro Lima",
    patientAvatar: "/placeholder.svg?height=32&width=32",
    internName: "Ana Silva",
    specialty: "Nutrição",
    date: "01/06/2025",
    time: "14:00",
    status: "Concluída",
    priority: "normal",
    specialtyIcon: <RestaurantIcon fontSize="small" />,
  },
  {
    id: 5,
    patientName: "Clara Guedes",
    patientAvatar: "/placeholder.svg?height=32&width=32",
    internName: "Carlos Mendes",
    specialty: "Psicologia",
    date: "02/06/2025",
    time: "16:00",
    status: "Pendente",
    priority: "normal",
    specialtyIcon: <PsychologyIcon fontSize="small" />,
  },
  {
    id: 6,
    patientName: "Fernando Torres",
    patientAvatar: "/placeholder.svg?height=32&width=32",
    internName: "Juliana Costa",
    specialty: "Fisioterapia",
    date: "02/06/2025",
    time: "10:00",
    status: "Confirmada",
    priority: "normal",
    specialtyIcon: <FitnessCenterIcon fontSize="small" />,
  },
]

// --- Cabeçalhos da Tabela de Consultas ---
const appointmentHeaders = [
  { id: "patient", label: "Paciente" },
  { id: "intern", label: "Estagiário" },
  { id: "specialty", label: "Especialidade" },
  { id: "dateTime", label: "Data/Hora" },
  { id: "status", label: "Status" },
]

// --- Função de Renderização de Célula para DashboardTable ---
const renderAppointmentCell = (appointment: Appointment, headerId: string) => {
  switch (headerId) {
    case "patient":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={appointment.patientAvatar} sx={{ width: 32, height: 32 }}>
            {appointment.patientName.split(" ").map((n) => n[0]).join("")}
          </Avatar>
          <Typography fontWeight={500}>{appointment.patientName}</Typography>
        </Box>
      )
    case "intern":
      return appointment.internName
    case "specialty":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconContainer color="primary.main">{appointment.specialtyIcon}</IconContainer>
          {appointment.specialty}
        </Box>
      )
    case "dateTime":
      return `${appointment.date} às ${appointment.time}`
    case "status":
      return <StyledBadge label={appointment.status} badgeType={appointment.status} />
    default:
      return null
  }
}

// --- Componente da Tela de Gestão de Consultas ---
export default function AppointmentManagementScreen() {
  const theme = useTheme()
  const pushWithProgress = usePushWithProgress()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // Estados para o menu de ações da tabela
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  // --- Cálculo dos KPIs de Consultas ---
  const today = new Date().toLocaleDateString('pt-BR'); // Obter a data atual no formato DD/MM/AAAA
  const appointmentsTodayCount = mockAppointments.filter(
    (a) => a.date === today && a.status !== "Cancelada" && a.status !== "Concluída"
  ).length;

  const totalAppointmentsCount = mockAppointments.length;
  const completedAppointmentsCount = mockAppointments.filter(
    (a) => a.status === "Concluída"
  ).length;
  const pendingAppointmentsCount = mockAppointments.filter(
    (a) => a.status === "Pendente"
  ).length;

  const completionRate =
    totalAppointmentsCount > 0
      ? Math.round((completedAppointmentsCount / totalAppointmentsCount) * 100)
      : 0;

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const paginatedData = mockAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // --- Funções para o Menu de Ações da Tabela ---
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, appointment: Appointment) => {
    setAnchorEl(event.currentTarget)
    setSelectedAppointment(appointment)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedAppointment(null)
  }

  const handleViewDetails = () => {
    if (selectedAppointment) {
      console.log("Ver detalhes da consulta:", selectedAppointment)
      pushWithProgress(`/gestor/consultas/${selectedAppointment.id}`) // Exemplo de navegação
    }
    handleMenuClose()
  }

  const handleEditAppointment = () => {
    if (selectedAppointment) {
      console.log("Editar consulta:", selectedAppointment)
      pushWithProgress(`/gestor/consultas/editar/${selectedAppointment.id}`) // Exemplo de navegação
    }
    handleMenuClose()
  }

  const handleCancelAppointment = () => {
    if (selectedAppointment) {
      console.log("Cancelar consulta:", selectedAppointment)
      // Lógica para cancelar a consulta (atualizar o mockAppointments ou chamar API)
    }
    handleMenuClose()
  }

  // --- Função para Renderizar as Ações da Tabela ---
  const appointmentActions = (appointment: Appointment) => (
    <IconButton
      size="small"
      onClick={(e) => handleMenuClick(e, appointment)}
      sx={{ color: "text.secondary" }}
    >
      <MoreHorizIcon fontSize="small" />
    </IconButton>
  )

  // --- Função para a Borda de Prioridade da Linha da Tabela ---
  const getAppointmentPriorityBorderColor = (appointment: Appointment) => {
    switch (appointment.priority) {
      case "high": return `4px solid ${theme.palette.error.main}`;
      case "normal": return `4px solid ${theme.palette.info.main}`;
      case "low": return `4px solid ${theme.palette.success.main}`;
      default: return `4px solid ${theme.palette.grey[300]}`;
    }
  };


  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Gestão de Consultas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => pushWithProgress("/gestor/calendario/agendamento")}
        >
          Agendar Nova Consulta
        </Button>
      </Box>

      {/* Dashboard de KPIs usando StatCard */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Consultas Hoje"
            value={appointmentsTodayCount}
            subtitle="Ativas e pendentes para hoje"
            icon={<CalendarMonthIcon sx={{ color: theme.palette.primary.main }} />}
            iconBgColor={alpha(theme.palette.primary.main, 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Consultas"
            value={totalAppointmentsCount}
            subtitle={`${completedAppointmentsCount} concluídas, ${pendingAppointmentsCount} pendentes`}
            icon={<AssignmentIcon sx={{ color: theme.palette.info.main }} />}
            iconBgColor={alpha(theme.palette.info.main, 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Consultas Concluídas"
            value={completedAppointmentsCount}
            subtitle="Total de consultas finalizadas"
            icon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
            iconBgColor={alpha(theme.palette.success.main, 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Taxa de Conclusão"
            value={`${completionRate}%`}
            subtitle="Porcentagem de consultas concluídas"
            icon={<ScheduleIcon sx={{ color: theme.palette.success.main }} />}
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

      {/* Tabela de Gestão de Consultas usando DashboardTable */}
      <DashboardTable<Appointment>
        title="Consultas Agendadas"
        subtitle="Gerencie todas as consultas e seus status"
        headers={appointmentHeaders}
        data={paginatedData}
        renderCell={renderAppointmentCell}
        rowKeyExtractor={(appointment) => appointment.id}
        actionsColumnLabel="Ações"
        actions={appointmentActions} // Passar as ações da tabela
        getPriorityBorderColor={getAppointmentPriorityBorderColor} // Passar a função de prioridade
        totalCount={mockAppointments.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="Nenhuma consulta encontrada."
      />

      {/* Menu de ações da tabela (fora do DashboardTable) */}
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
        <MenuItem onClick={handleCancelAppointment} sx={{ color: theme.palette.error.main }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Cancelar Consulta
        </MenuItem>
      </Menu>
    </Container>
  )
}