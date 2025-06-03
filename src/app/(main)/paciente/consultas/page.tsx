// src/app/(main)/paciente/consultas/page.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react"; // Adicionado useEffect para simular fetch
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  useTheme,
  Menu,
  MenuItem,
  IconButton,
  Avatar, // Será usado para o Estagiário
  CircularProgress // Para feedback de carregamento
} from "@mui/material";
import { alpha } from "@mui/material/styles";

// Icons
import EventAvailableIcon from "@mui/icons-material/EventAvailable"; // Próximas Consultas
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"; // Consultas Realizadas
import PendingActionsIcon from "@mui/icons-material/PendingActions"; // Consultas Pendentes
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel'; // Para Cancelar Consulta
import EditCalendarIcon from '@mui/icons-material/EditCalendar'; // Para Reagendar

// Ícones de especialidade (mantidos para consistência)
import RestaurantIcon from "@mui/icons-material/Restaurant";
import PsychologyIcon from "@mui/icons-material/Psychology";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";

// Componentes de UI
import { StatCard } from "@/app/components/ui/StatCard";
import { DashboardTable, StyledBadge, IconContainer } from "@/app/components/ui/DashboardTable";

// Interface de Dados para Consulta do Paciente
// (patientName e patientAvatar não são mais necessários na tabela principal,
// mas podem ser úteis se a API os retornar para a página de detalhes)
interface ConsultaPaciente {
  id: number;
  internName: string; // Nome do estagiário/profissional
  internAvatar?: string; // Avatar do estagiário (opcional)
  specialty: string;
  date: string;
  time: string;
  status: "Confirmada" | "Pendente" | "Reagendada" | "Cancelada" | "Concluída";
  priority?: "low" | "normal" | "high"; // Mantido se relevante para o paciente
  specialtyIcon: React.ReactNode;
  location?: string; // Adicionado para detalhes
}

// Dados Mock (substituir por chamada à API)
const mockMinhasConsultas: ConsultaPaciente[] = [
  {
    id: 1,
    internName: "Ana Silva",
    internAvatar: "/placeholder-avatar.png", // Caminho para avatar do estagiário
    specialty: "Nutrição",
    date: "05/06/2025", // Usando formato DD/MM/YYYY
    time: "10:00",
    status: "Confirmada",
    priority: "normal",
    specialtyIcon: <RestaurantIcon fontSize="small" />,
    location: "Clínica IESB Saúde - Asa Sul, Sala 101",
  },
  {
    id: 2,
    internName: "Dr. Carlos Mendes",
    specialty: "Psicologia",
    date: "10/06/2025",
    time: "11:30",
    status: "Pendente",
    priority: "high",
    specialtyIcon: <PsychologyIcon fontSize="small" />,
    location: "Atendimento Online via Plataforma",
  },
  {
    id: 3,
    internName: "Juliana Costa",
    specialty: "Fisioterapia",
    date: "12/04/2025", // Data passada
    time: "09:00",
    status: "Concluída",
    priority: "low",
    specialtyIcon: <FitnessCenterIcon fontSize="small" />,
    location: "Clínica IESB Saúde - Taguatinga, Sala 05",
  },
  {
    id: 4,
    internName: "Ana Silva",
    specialty: "Nutrição",
    date: "15/06/2025",
    time: "14:00",
    status: "Reagendada",
    specialtyIcon: <RestaurantIcon fontSize="small" />,
    location: "Clínica IESB Saúde - Asa Sul, Sala 102",
  },
];

// Cabeçalhos da Tabela para Paciente
const headersMinhasConsultas = [
  // A coluna "Paciente" foi removida
  { id: "intern", label: "Profissional/Estagiário" },
  { id: "specialty", label: "Especialidade" },
  { id: "dateTime", label: "Data/Hora" },
  { id: "location", label: "Local" }, // Adicionada coluna Local
  { id: "status", label: "Status" },
];

// Função de Renderização de Célula para Paciente
import type { Theme } from "@mui/material/styles";

const renderMinhaConsultaCell = (consulta: ConsultaPaciente, headerId: string, theme: Theme) => {
  switch (headerId) {
    case "intern":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar src={consulta.internAvatar} sx={{ width: 32, height: 32 }}>
            {consulta.internName.split(" ").map((n) => n[0]).join("").substring(0,2)}
          </Avatar>
          <Typography variant="body2" fontWeight={500}>{consulta.internName}</Typography>
        </Box>
      );
    case "specialty":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconContainer sx={{bgcolor: alpha(theme.palette.primary.light, 0.2), color: theme.palette.primary.main }}> {/* Exemplo de cor */}
            {consulta.specialtyIcon}
          </IconContainer>
          <Typography variant="body2">{consulta.specialty}</Typography>
        </Box>
      );
    case "dateTime":
      return `${consulta.date} às ${consulta.time}`;
    case "location":
      return <Typography variant="body2" noWrap title={consulta.location}>{consulta.location || "Não especificado"}</Typography>;
    case "status":
      return <StyledBadge label={consulta.status} badgeType={consulta.status} />;
    default:
      return null;
  }
};

export default function MinhasConsultasPacientePage() {
  const theme = useTheme(); // Definido aqui para ser usado em toda a função
  const pushWithProgress = usePushWithProgress();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [consultas, setConsultas] = useState<ConsultaPaciente[]>([]);
  const [loadingConsultas, setLoadingConsultas] = useState(true);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConsulta, setSelectedConsulta] = useState<ConsultaPaciente | null>(null);

  // Simular busca de dados da API
  useEffect(() => {
    setLoadingConsultas(true);
    // Simulação de chamada à API
    // Em um app real:
    // apiFetch<ConsultaPaciente[]>('/api/paciente/consultas')
    //   .then(data => setConsultas(data || []))
    //   .catch(err => console.error("Erro ao buscar consultas", err))
    //   .finally(() => setLoadingConsultas(false));
    setTimeout(() => {
      setConsultas(mockMinhasConsultas);
      setLoadingConsultas(false);
    }, 1000);
  }, []);

  // KPIs para Paciente
  const proximasConsultasCount = consultas.filter(
    c => c.status === "Confirmada" || c.status === "Pendente" || c.status === "Reagendada"
  ).length;
  const consultasRealizadasCount = consultas.filter(c => c.status === "Concluída").length;
  const consultasPendentesCount = consultas.filter(c => c.status === "Pendente").length;

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = consultas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, consulta: ConsultaPaciente) => {
    setAnchorEl(event.currentTarget);
    setSelectedConsulta(consulta);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedConsulta(null);
  };

  const handleViewDetails = () => {
    if (selectedConsulta) {
      pushWithProgress(`/paciente/consultas/${selectedConsulta.id}`);
    }
    handleMenuClose();
  };

  const handleCancelAppointment = () => {
    if (selectedConsulta) {
      // Lógica para cancelar (ex: chamada à API, atualização do estado)
      alert(`Consulta ${selectedConsulta.id} cancelada! (Simulação)`);
      // Ex: setConsultas(prev => prev.map(c => c.id === selectedConsulta.id ? {...c, status: "Cancelada"} : c));
    }
    handleMenuClose();
  };
  
  const handleRescheduleAppointment = () => {
    if (selectedConsulta) {
      // Lógica para reagendar (provavelmente navegar para a tela de agendamento com dados pré-carregados)
      alert(`Redirecionando para reagendar consulta ${selectedConsulta.id}! (Simulação)`);
      pushWithProgress(`/paciente/agendamento?reagendar=${selectedConsulta.id}`);
    }
    handleMenuClose();
  };


  const consultaActions = (consulta: ConsultaPaciente) => (
    <IconButton size="small" onClick={(e) => handleMenuClick(e, consulta)} sx={{ color: "text.secondary" }}>
      <MoreHorizIcon fontSize="small" />
    </IconButton>
  );
  
  // Função para a borda (opcional para paciente, mas mantida para exemplo)
  const getConsultaPriorityBorderColor = (consulta: ConsultaPaciente) => {
    if (!consulta.priority) return `4px solid ${theme.palette.grey[300]}`;
    switch (consulta.priority) {
      case "high": return `4px solid ${theme.palette.error.main}`;
      case "normal": return `4px solid ${theme.palette.info.main}`;
      case "low": return `4px solid ${theme.palette.success.light}`;
      default: return `4px solid ${theme.palette.grey[300]}`;
    }
  };

  if (loadingConsultas) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
        <Typography sx={{ml: 2}}>Carregando suas consultas...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: {xs: 2, md: 4}, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexDirection: {xs: 'column', sm: 'row'}, gap: 2 }}>
        <Typography variant="h5" component="h1" fontWeight={700}>
          Minhas Consultas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => pushWithProgress("/paciente/agendamento")} // Navega para a página de agendamento do paciente
        >
          Agendar Nova Consulta
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Próximas Consultas"
            value={proximasConsultasCount}
            subtitle="Agendadas e confirmadas"
            icon={<EventAvailableIcon sx={{ color: theme.palette.primary.main }} />}
            iconBgColor={alpha(theme.palette.primary.main, 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Consultas Realizadas"
            value={consultasRealizadasCount}
            subtitle="Total de consultas concluídas"
            icon={<CheckCircleOutlineIcon sx={{ color: theme.palette.success.main }} />}
            iconBgColor={alpha(theme.palette.success.main, 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pendentes/Aguardando"
            value={consultasPendentesCount}
            subtitle="Aguardando confirmação"
            icon={<PendingActionsIcon sx={{ color: theme.palette.warning.main }} />}
            iconBgColor={alpha(theme.palette.warning.main, 0.1)}
          />
        </Grid>
      </Grid>

      <DashboardTable<ConsultaPaciente>
        title="Meus Agendamentos"
        subtitle="Acompanhe seus compromissos de saúde"
        headers={headersMinhasConsultas}
        data={paginatedData}
        renderCell={(consulta, headerId) => renderMinhaConsultaCell(consulta, headerId, theme)}
        rowKeyExtractor={(consulta) => consulta.id}
        actionsColumnLabel="Opções"
        actions={consultaActions}
        getPriorityBorderColor={getConsultaPriorityBorderColor}
        totalCount={consultas.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="Você ainda não possui consultas agendadas."
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleViewDetails}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Ver Detalhes
        </MenuItem>
        {selectedConsulta && (selectedConsulta.status === "Confirmada" || selectedConsulta.status === "Pendente") && (
          <MenuItem onClick={handleRescheduleAppointment}>
            <EditCalendarIcon fontSize="small" sx={{ mr: 1 }} />
            Reagendar
          </MenuItem>
        )}
        {selectedConsulta && (selectedConsulta.status === "Confirmada" || selectedConsulta.status === "Pendente") && (
          <MenuItem onClick={handleCancelAppointment} sx={{ color: theme.palette.error.main }}>
            <CancelIcon fontSize="small" sx={{ mr: 1 }} />
            Cancelar Consulta
          </MenuItem>
        )}
      </Menu>
    </Container>
  );
}