// src/app/(main)/paciente/consultas/page.tsx
"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
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
  Avatar,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

// Icons
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CancelIcon from "@mui/icons-material/Cancel";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";

// Ícones de especialidade
import RestaurantIcon from "@mui/icons-material/Restaurant";
import PsychologyIcon from "@mui/icons-material/Psychology";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";
import { useToast } from "@/app/contexts/ToastContext";

// Componentes de UI
import { StatCard } from "@/app/components/ui/StatCard";
import { DashboardTable, StyledBadge, IconContainer } from "@/app/components/ui/DashboardTable";

import { apiFetch } from "@/app/lib/api";

// --- Interfaces de Dados ---

// Interface de Dados para Consulta do Paciente (usada na UI)
interface ConsultaPaciente {
  id: number;
  internName: string;
  internAvatar?: string;
  specialty: string;
  date: string; // Formato DD/MM/YYYY
  time: string; // Formato HH:mm
  status: "Confirmada" | "Pendente" | "Reagendada" | "Cancelada" | "Concluída";
  priority?: "low" | "normal" | "high";
  specialtyIcon: React.ReactNode;
  location: string;
}

// Interface para um único agendamento retornado pela API (dentro do array 'data')
interface ApiAppointment {
  id: number;
  date: string; // Ex: "2025-06-09"
  start_time: string; // Ex: "2000-01-01T09:15:00.000-02:00"
  end_time: string; // Ex: "2000-01-01T10:15:00.000-02:00"
  status: string; // Ex: "pending"
  notes?: string;
  time_slot: {
    id: number;
    // turn: number; // Removed as per example, add back if API sends it
    // start_time: string; // This start_time is for the slot, appointment has its own
    // end_time: string;   // This end_time is for the slot, appointment has its own
    // week_day: number; // Removed as per example, add back if API sends it
    college_location_name: string;
    specialty_name: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    profile: {
      id: number;
      name: string;
      users_count: number;
    };
  };
}

// Interface para informações de metadados da paginação da API
interface MetaInfo {
  total_count: number;
  total_pages: number;
  current_page: number;
  per_page: number;
}

// Interface para a resposta completa da API (dados + metadados de paginação)
interface PaginatedAppointmentsResponse {
  data: ApiAppointment[];
  meta: MetaInfo;
}


// --- Mapeamento de Status da API para Status da UI ---
const mapApiStatusToUiStatus = (apiStatus: string): ConsultaPaciente['status'] => {
  switch (apiStatus?.toLowerCase()) {
    case 'confirmed':
      return 'Confirmada';
    case 'pending':
      return 'Pendente';
    case 'rescheduled':
      return 'Reagendada';
    case 'cancelled':
      return 'Cancelada';
    case 'completed':
      return 'Concluída';
    default:
      return 'Pendente'; // Fallback
  }
};

// Mapeamento de Especialidade para Ícone
const getSpecialtyIcon = (specialtyName: string): React.ReactNode => {
  const key = specialtyName?.trim().toLowerCase();
  switch (key) {
    case 'nutrição':
      return <RestaurantIcon fontSize="small" />;
    case 'psicologia':
      return <PsychologyIcon fontSize="small" />;
    case 'fisioterapia':
      return <FitnessCenterIcon fontSize="small" />;
    default:
      return null;
  }
};

// --- Transformar Dados da API para o Formato da UI ---
const transformApiAppointments = (apiAppointments: ApiAppointment[]): ConsultaPaciente[] => {
  if (!Array.isArray(apiAppointments)) {
    console.warn("transformApiAppointments received non-array input:", apiAppointments);
    return [];
  }
  return apiAppointments.map(apiAppt => {
    const dateObj = new Date(apiAppt.date + "T" + apiAppt.start_time.substring(11,19)); // Combine date and time
    const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });

    return {
      id: apiAppt.id,
      internName: "Profissional Não Informado", // Placeholder - API não fornece nome do profissional diretamente no agendamento
      internAvatar: undefined, // Placeholder
      specialty: apiAppt.time_slot?.specialty_name || "Não informada",
      specialtyIcon: getSpecialtyIcon(apiAppt.time_slot?.specialty_name || ""),
      date: formattedDate,
      time: formattedTime,
      status: mapApiStatusToUiStatus(apiAppt.status),
      priority: "normal", // Placeholder - API não fornece prioridade
      location: apiAppt.time_slot?.college_location_name || "Não informado",
    };
  });
};

// Cabeçalhos da Tabela para Paciente
const headersMinhasConsultas = [
  { id: "intern", label: "Profissional/Estagiário" },
  { id: "specialty", label: "Especialidade" },
  { id: "dateTime", label: "Data/Hora" },
  { id: "location", label: "Local" },
  { id: "status", label: "Status" },
];

// Função de Renderização de Célula para Paciente
const renderMinhaConsultaCell = (consulta: ConsultaPaciente, headerId: string, theme: Theme) => {
  switch (headerId) {
    case "intern":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar src={consulta.internAvatar} sx={{ width: 32, height: 32 }}>
            {consulta.internName?.split(" ").map((n) => n[0]).join("").substring(0,2)}
          </Avatar>
          <Typography variant="body2" fontWeight={500}>{consulta.internName}</Typography>
        </Box>
      );
    case "specialty":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconContainer sx={{bgcolor: alpha(theme.palette.primary.light, 0.2), color: theme.palette.primary.main }}>
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
  const theme = useTheme();
  const pushWithProgress = usePushWithProgress();
  const { showToast } = useToast();

  const [page, setPage] = useState(0); // MUI TablePagination é 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [consultas, setConsultas] = useState<ConsultaPaciente[]>([]);
  const [metaInfo, setMetaInfo] = useState<MetaInfo | null>(null);
  const [loadingConsultas, setLoadingConsultas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConsulta, setSelectedConsulta] = useState<ConsultaPaciente | null>(null);
  const [sortField, setSortField] = useState("date"); // Campo padrão de ordenação
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc"); // Direção padrão

  const fetchConsultas = useCallback(async () => {
    setLoadingConsultas(true);
    setError(null);

    const params = new URLSearchParams({
      "page[size]": rowsPerPage.toString(),
      "page[number]": (page + 1).toString(), // API é 1-indexed para páginas
      sort: `${sortDirection === "desc" ? "-" : ""}${sortField}`,
    });

    try {
      // Espera a resposta completa com 'data' e 'meta'
      const apiResponse = await apiFetch<PaginatedAppointmentsResponse>(`/api/appointments?${params.toString()}`);
      if (apiResponse && apiResponse.data && apiResponse.meta) {
        const transformedData = transformApiAppointments(apiResponse.data);
        setConsultas(transformedData);
        setMetaInfo(apiResponse.meta);
      } else {
        throw new Error("Formato de resposta da API inválido.");
      }
    } catch (err) {
      console.error("Erro ao buscar consultas:", err);
      const errorMessage = err instanceof Error ? err.message : "Não foi possível carregar suas consultas.";
      setError(errorMessage);
      showToast({ message: `Erro ao carregar consultas: ${errorMessage}`, severity: "error" });
      setConsultas([]); // Limpa consultas em caso de erro para não mostrar dados antigos
      setMetaInfo(null); // Limpa meta info
    } finally {
      setLoadingConsultas(false);
    }
  }, [page, rowsPerPage, sortField, sortDirection, showToast]);

  useEffect(() => {
    fetchConsultas();
  }, [fetchConsultas]);

  // KPIs para Paciente (calculados a partir dos dados da PÁGINA ATUAL)
  // Se precisar de KPIs globais, a API deveria fornecer esses totais ou haver outra chamada.
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
    setPage(0); // Volta para a primeira página ao mudar itens por página
  };

  // const paginatedData = consultas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage); // REMOVIDO - API faz a paginação

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

  const handleCancelAppointment = async () => {
    if (selectedConsulta) {
      try {
        await apiFetch(`/api/appointments/${selectedConsulta.id}`, { method: 'DELETE' });
        showToast({ message: "Consulta cancelada com sucesso!", severity: "success" });
        fetchConsultas(); // Re-fetch para atualizar a lista
      } catch (err) {
        console.error("Erro ao cancelar consulta:", err);
        showToast({ message: "Erro ao cancelar consulta.", severity: "error" });
      }
    }
    handleMenuClose();
  };

  const handleRescheduleAppointment = () => {
    if (selectedConsulta) {
      // Idealmente, o ID da consulta a ser reagendada seria passado como query param
      // ou state para a página de agendamento.
      pushWithProgress(`/paciente/agendamento?reagendar=${selectedConsulta.id}`);
    }
    handleMenuClose();
  };

  const consultaActions = (consulta: ConsultaPaciente) => (
    <IconButton size="small" onClick={(e) => handleMenuClick(e, consulta)} sx={{ color: "text.secondary" }}>
      <MoreHorizIcon fontSize="small" />
    </IconButton>
  );

  const getConsultaPriorityBorderColor = (consulta: ConsultaPaciente) => {
    if (!consulta.priority) return `4px solid ${theme.palette.grey[300]}`;
    switch (consulta.priority) {
      case "high": return `4px solid ${theme.palette.error.main}`;
      case "normal": return `4px solid ${theme.palette.info.main}`;
      case "low": return `4px solid ${theme.palette.success.light}`;
      default: return `4px solid ${theme.palette.grey[300]}`;
    }
  };

  if (loadingConsultas && consultas.length === 0) { // Mostrar loading inicial apenas se não houver dados
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
        <Typography sx={{ml: 2}}>Carregando suas consultas...</Typography>
      </Container>
    );
  }

  if (error && consultas.length === 0) { // Mostrar erro apenas se não houver dados
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="contained" onClick={fetchConsultas} sx={{ mt: 2 }}>Tentar Novamente</Button>
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
          onClick={() => pushWithProgress("/paciente/agendamento")}
        >
          Agendar Nova Consulta
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Próximas Consultas"
            value={proximasConsultasCount}
            subtitle="Agendadas e confirmadas (nesta página)"
            icon={<EventAvailableIcon sx={{ color: theme.palette.primary.main }} />}
            iconBgColor={alpha(theme.palette.primary.main, 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Consultas Realizadas"
            value={consultasRealizadasCount}
            subtitle="Concluídas (nesta página)"
            icon={<CheckCircleOutlineIcon sx={{ color: theme.palette.success.main }} />}
            iconBgColor={alpha(theme.palette.success.main, 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pendentes/Aguardando"
            value={consultasPendentesCount}
            subtitle="Aguardando (nesta página)"
            icon={<PendingActionsIcon sx={{ color: theme.palette.warning.main }} />}
            iconBgColor={alpha(theme.palette.warning.main, 0.1)}
          />
        </Grid>
      </Grid>
      {/* Mostra o loader sobre a tabela se estiver carregando novas páginas/filtros */}
      {loadingConsultas && consultas.length > 0 && (
         <Box sx={{ display: 'flex', justifyContent: 'center', py: 2}}>
            <CircularProgress size={24} /> <Typography sx={{ml: 1}}>Atualizando...</Typography>
         </Box>
      )}
       {/* Mostra erro se houver um e não for o erro inicial */}
      {error && consultas.length > 0 && (
        <Typography color="error" align="center" sx={{my:2}}>{error}</Typography>
      )}

      <DashboardTable<ConsultaPaciente>
        title="Meus Agendamentos"
        subtitle="Acompanhe seus compromissos de saúde"
        headers={headersMinhasConsultas}
        data={consultas} // Usa diretamente as consultas da página atual
        renderCell={(consulta, headerId) => renderMinhaConsultaCell(consulta, headerId, theme)}
        rowKeyExtractor={(consulta) => consulta.id}
        actionsColumnLabel="Opções"
        actions={consultaActions}
        getPriorityBorderColor={getConsultaPriorityBorderColor}
        // Informações de paginação vêm do metaInfo
        totalCount={metaInfo?.total_count || 0}
        page={page} // 0-indexed
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        // TODO: Adicionar suporte para ordenação no DashboardTable e ligar a setSortField/setSortDirection
        // onSortRequest={handleSortRequest}
        // sortField={sortField}
        // sortDirection={sortDirection}
        emptyMessage={!loadingConsultas && consultas.length === 0 && !error ? "Você ainda não possui consultas agendadas." : ""}
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