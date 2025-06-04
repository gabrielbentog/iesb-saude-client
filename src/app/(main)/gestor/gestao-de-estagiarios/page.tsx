"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Grid,
  useTheme, // Importar useTheme
  Menu, // Adicionado para o menu de ações da tabela
  MenuItem, // Adicionado para o menu de ações da tabela
  LinearProgress, // Adicionado para a barra de performance no StatCard
} from "@mui/material"
import { alpha } from "@mui/material/styles" // Importar alpha para cores translúcidas

// Icons
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import EventNoteIcon from "@mui/icons-material/EventNote"
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import RestaurantIcon from "@mui/icons-material/Restaurant" // Ícone para Nutrição
import PsychologyIcon from "@mui/icons-material/Psychology" // Ícone para Psicologia
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter" // Ícone para Fisioterapia
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'; // Ícone de "Mais opções" para a tabela
import VisibilityIcon from '@mui/icons-material/Visibility'; // Ícone "Ver detalhes"
import EditIcon from '@mui/icons-material/Edit'; // Ícone "Editar"

import { usePushWithProgress } from "@/app/hooks/usePushWithProgress"

// Importar os componentes da tela anterior (ajuste os caminhos conforme necessário)
import { StatCard } from "@/app/components/ui/StatCard"
import { DashboardTable } from "@/app/components/ui/DashboardTable"
import type { Intern } from "@/app/types";
import { StyledBadge, IconContainer } from "@/app/components/ui/DashboardTable" // Importar componentes auxiliares

// Mock data
// Adicionei performance e icons específicos para cada estagiário para compatibilidade com DashboardTable
    name: "Ana Silva",
    specialty: "Nutrição",
    avatar: "", // Caminho real da imagem
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
    avatar: "",
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
    avatar: "",
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
    avatar: "",
    appointmentsCompleted: 15,
    appointmentsScheduled: 5,
    status: "Ativo",
    icon: <RestaurantIcon fontSize="small" />,
    performance: 85,
  },
  {
    id: 5,
    name: "Mariana Lima",
    specialty: "Psicologia",
    avatar: "",
    appointmentsCompleted: 22,
    appointmentsScheduled: 7,
    status: "Ativo",
    icon: <PsychologyIcon fontSize="small" />,
    performance: 90,
  },
  {
    id: 6,
    name: "Gabriel Souza",
    specialty: "Fisioterapia",
    avatar: "",
    appointmentsCompleted: 19,
    appointmentsScheduled: 3,
    status: "Ativo",
    icon: <FitnessCenterIcon fontSize="small" />,
    performance: 87,
  },
]

// Defina as colunas para a tabela de estagiários usando o formato do DashboardTable
const internHeaders = [
  { id: "name", label: "Estagiário" },
  { id: "specialty", label: "Especialidade" },
  { id: "appointmentsCompleted", label: "Consultas Realizadas" },
  { id: "appointmentsScheduled", label: "Consultas Agendadas" },
  { id: "performance", label: "Performance" },
  { id: "status", label: "Status" },
]

// Função de renderização de célula para a DashboardTable
const renderInternCell = (intern: Intern, headerId: string) => {
  // O useTheme deve ser chamado dentro do componente funcional principal ou de um Hook
  // Para fins de demonstração, simulamos o theme para a renderização da célula.
  // Em um ambiente real, você passaria theme via contexto ou como prop se necessário,
  // ou faria o StyledBadge e IconContainer encapsularem seu próprio tema.
  // Para StyledBadge e IconContainer, eles já recebem o tema do ThemeProvider.
  
  switch (headerId) {
    case "name":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={intern.avatar} sx={{ width: 32, height: 32 }}>
            {intern.name.split(" ").map((n) => n[0]).join("")}
          </Avatar>
          <Typography fontWeight={500}>{intern.name}</Typography>
        </Box>
      )
    case "specialty":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconContainer sx={{ color: "primary.main" }}>{intern.icon}</IconContainer>
          {intern.specialty}
        </Box>
      )
    case "appointmentsCompleted":
      return intern.appointmentsCompleted
    case "appointmentsScheduled":
      return intern.appointmentsScheduled
    case "performance":
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
      )
    case "status":
      // Mapeia o status para um tipo de badge compatível com StyledBadge
      const badgeType = intern.status === "Ativo" ? "Confirmada" : "Pendente" // Ou crie um mapeamento mais específico
      return <StyledBadge label={intern.status} badgeType={badgeType} />
    default:
      return null
  }
}

export default function InternManagementScreen() {
  const theme = useTheme() // Chamada do hook useTheme
  const pushWithProgress = usePushWithProgress()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // Estados para o menu de ações da tabela
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);

  // Cálculo dos KPIs
  const activeInterns = mockInterns.filter((intern) => intern.status === "Ativo").length
  const totalAppointmentsCompleted = mockInterns.reduce((sum, intern) => sum + intern.appointmentsCompleted, 0)
  const totalAppointmentsScheduled = mockInterns.reduce((sum, intern) => sum + intern.appointmentsScheduled, 0)
  const averageAppointmentsPerIntern = activeInterns > 0 ? Math.round(totalAppointmentsCompleted / activeInterns) : 0
  const occupancyRate =
    activeInterns > 0 ? Math.round((totalAppointmentsScheduled / (activeInterns * 10)) * 100) : 0 // Assumindo capacidade de 10 consultas por estagiário

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const paginatedData = mockInterns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // Funções para o menu de ações da tabela
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, intern: Intern) => {
    setAnchorEl(event.currentTarget);
    setSelectedIntern(intern);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedIntern(null);
  };

  const handleViewDetails = () => {
    if (selectedIntern) {
      console.log('Ver detalhes do estagiário:', selectedIntern);
      pushWithProgress(`/gestor/estagiarios/${selectedIntern.id}`); // Exemplo de navegação
    }
    handleMenuClose();
  };

  const handleEditIntern = () => {
    if (selectedIntern) {
      console.log('Editar estagiário:', selectedIntern);
      pushWithProgress(`/gestor/estagiarios/editar/${selectedIntern.id}`); // Exemplo de navegação
    }
    handleMenuClose();
  };

  // Função para renderizar as ações da tabela, passada para o DashboardTable
  const internActions = (intern: Intern) => (
    <IconButton
      size="small"
      onClick={(e) => handleMenuClick(e, intern)} // Passa o evento e a linha para o handler
      sx={{ color: "text.secondary" }}
    >
      <MoreHorizIcon fontSize="small" />
    </IconButton>
  );

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
          Gestão de Estagiários
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => pushWithProgress("gestao-de-estagiarios/cadastro")}
        >
          Cadastrar Estagiário
        </Button>
      </Box>

      {/* Dashboard de KPIs usando StatCard */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Estagiários Ativos"
            value={activeInterns}
            subtitle="Total de estagiários ativos"
            icon={<PeopleAltIcon sx={{ color: theme.palette.primary.main }} />}
            iconBgColor={alpha(theme.palette.primary.main, 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Consultas Realizadas"
            value={totalAppointmentsCompleted}
            subtitle="Total de consultas concluídas"
            icon={<AssignmentTurnedInIcon sx={{ color: theme.palette.primary.main }} />}
            iconBgColor={alpha(theme.palette.primary.main, 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Média por Estagiário"
            value={averageAppointmentsPerIntern}
            subtitle="Média de consultas por estagiário ativo"
            icon={<TrendingUpIcon sx={{ color: theme.palette.success.main }} />}
            iconBgColor={alpha(theme.palette.success.main, 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Taxa de Ocupação"
            value={`${occupancyRate}%`}
            subtitle="Porcentagem de capacidade utilizada"
            icon={<EventNoteIcon sx={{ color: theme.palette.success.main }} />}
            iconBgColor={alpha(theme.palette.success.main, 0.1)}
            trendComponent={
              <LinearProgress
                variant="determinate"
                value={occupancyRate}
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

      {/* Tabela de Gestão de Estagiários usando DashboardTable */}
      <DashboardTable<Intern>
        title="Gestão de Estagiários"
        subtitle="Acompanhe o desempenho e atividades dos estagiários"
        headers={internHeaders}
        data={paginatedData}
        renderCell={renderInternCell}
        rowKeyExtractor={(intern) => intern.id}
        actionsColumnLabel="Ações"
        actions={internActions} // Passar as ações da tabela (o IconButton com MoreHorizIcon)
        totalCount={mockInterns.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="Nenhum estagiário encontrado."
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
        <MenuItem onClick={handleEditIntern}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
      </Menu>
    </Container>
  )
}