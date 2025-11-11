// src/app/(main)/paciente/consultas/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
  Avatar,
  CircularProgress,
  Tooltip,
  Button,
  Pagination,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// more icon removed for estagiario view
import PersonIcon from "@mui/icons-material/Person";

import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";
import { useToast } from "@/app/contexts/ToastContext";
import { StatCard } from "@/app/components/ui/StatCard";
import { DataTable, StyledBadge, IconContainer } from "@/app/components/DataTable";

// Tipagens e utilidades compartilhadas com a tela do Gestor
import {
  RawAppointment,
  PaginatedResponse,
  UIAppointment,
  MetaWithPagination,
} from "@/app/types";
import { mapRaw } from "@/app/utils/appointment-mapper";
import { apiFetch } from "@/app/lib/api";

// ────────────────────────────────────────────────────────────────────────────────
// Cabeçalhos da Tabela (Visão Estagiário)
// ────────────────────────────────────────────────────────────────────────────────
const internHeaders = [
  { id: "patient", label: "Paciente" },
  { id: "specialty", label: "Especialidade" },
  { id: "location", label: "Local" },
  { id: "dateTime", label: "Data/Hora" },
  { id: "status", label: "Status" },
] as const;

type InternHeaderId = (typeof internHeaders)[number]["id"];

// ────────────────────────────────────────────────────────────────────────────────
// Renderização de células
// ────────────────────────────────────────────────────────────────────────────────
const renderInternCell = (a: UIAppointment, id: InternHeaderId) => {
  switch (id) {
    case "patient": {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
          <Avatar 
            src={((): string | undefined => {
              const raw = a.patientAvatar;
              if (!raw) return undefined;
              return /^https?:\/\//.test(raw) ? raw : `${process.env.NEXT_PUBLIC_API_HOST}${raw}`;
            })()} 
            sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}
          >
            {a.patientName ? a.patientName.split(" ").map((n) => n[0]).join("") : <PersonIcon fontSize="small" />}
          </Avatar>
          <Typography 
            variant="body2" 
            fontWeight={500}
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: { xs: "120px", sm: "none" }
            }}
          >
            {a.patientName}
          </Typography>
        </Box>
      )
    }
    case "specialty": {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconContainer sx={{ color: "primary.main" }}>{a.icon}</IconContainer>
          <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            {a.specialty}
          </Typography>
        </Box>
      );
    }
    case "location":
      return (
        <Typography 
          variant="body2" 
          title={a.location}
          sx={{
            fontSize: { xs: "0.875rem", sm: "1rem" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: { xs: "100px", sm: "none" }
          }}
        >
          {a.location}
        </Typography>
      );
    case "dateTime":
      return (
        <Typography sx={{ 
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          whiteSpace: { xs: "normal", sm: "nowrap" }
        }}>
          {a.date} às {a.time}
        </Typography>
      );
    case "status":
      return (
        <StyledBadge
          label={a.status === "Aguardando confirmação do Paciente"
            ? "Aguard. Confirmação"
            : a.status}
          badgeType={a.status}
        />
      );
    default:
      return null;
  }
};

// ────────────────────────────────────────────────────────────────────────────────
// Componente principal (Visão Paciente)
// ────────────────────────────────────────────────────────────────────────────────
export default function AppointmentPatientScreen() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pushWithProgress = usePushWithProgress();
  const { showToast } = useToast();

  // Paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [metaInfo, setMetaInfo] = useState<MetaWithPagination | null>(null);

  // Dados
  const [appointments, setAppointments] = useState<UIAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Menu (não usado para estagiário)

  // ───────────── Fetch paginado ─────────────
  const showToastRef = React.useRef(showToast);
  useEffect(() => { showToastRef.current = showToast }, [showToast]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch<PaginatedResponse<RawAppointment>>(
        `/api/appointments?page[number]=${page + 1}&page[size]=${rowsPerPage}`
      );
      setAppointments(res.data.map(mapRaw));
      setMetaInfo(res.meta);
    } catch (err) {
      console.error("Falha ao buscar consultas", err);
      const message = err instanceof Error ? err.message : "Não foi possível buscar suas consultas.";
      setError(message);
      try { showToastRef.current({ message: `Erro: ${message}`, severity: "error" }) } catch { /* swallow */ }
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchAppointments();
    // only re-run when page or rowsPerPage change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  // ───────────── KPIs dinâmicos (prefira valores do meta quando disponíveis) ─────────────
  const upcomingCount =
    typeof metaInfo?.nextAppointmentCount === "number"
      ? metaInfo.nextAppointmentCount
      : appointments.filter((a) => ["Confirmada", "Aguardando aprovação"].includes(a.status)).length;

  const completedCount =
    typeof metaInfo?.completedAppointmentsCount === "number"
      ? metaInfo.completedAppointmentsCount
      : appointments.filter((a) => a.status === "Concluída").length;

  const totalCount = metaInfo?.pagination?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  // ───────────── Handlers de paginação ─────────────
  const handlePageChange = (_: unknown, newPage: number) => setPage(isMobile ? newPage - 1 : newPage);
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // O estagiário apenas visualiza. Navegar para detalhe ao clicar na linha.

  const borderColor = (a: UIAppointment) => {
    switch (a.priority) {
      case "high": return `4px solid ${theme.palette.error.main}`;
      case "normal": return `4px solid ${theme.palette.info.main}`;
      case "low": return `4px solid ${theme.palette.success.main}`;
      default: return `4px solid ${theme.palette.grey[300]}`;
    }
  };

  // ────────────────────────────────────────────────────────────────────
  if (loading && appointments.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando suas consultas...</Typography>
      </Container>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="contained" onClick={fetchAppointments} sx={{ mt: 2 }}>Tentar Novamente</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3 }, px: { xs: 1.5, sm: 3 }, pb: { xs: 6, sm: 8 } }}>
      {/* Cabeçalho */}
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between", 
        alignItems: { xs: "stretch", sm: "center" },
        gap: { xs: 1.5, sm: 2 },
        mb: { xs: 2, sm: 3 }
      }}>
        <Typography variant="h6" fontWeight={700}>
          Minhas Consultas
        </Typography>
      </Box>

      {/* KPI Cards */}
      {isMobile ? (
        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            overflowY: "hidden",
            gap: 2,
            pb: 1,
            mb: 3,
            scrollSnapType: "x mandatory",
            width: "100%",
            px: 1.5,
            boxSizing: "border-box",
            "&::-webkit-scrollbar": { display: "none" },
            "& > *": {
              flex: "0 0 85%",
              scrollSnapAlign: "start",
            },
          }}
        >
          <Box sx={{ pl: 0.5 }}>
            <StatCard
              title="Próximas Consultas"
              value={upcomingCount}
              subtitle="Agendadas ou confirmadas"
              icon={<CalendarMonthIcon sx={{ color: theme.palette.primary.main }} />}
              iconBgColor={alpha(theme.palette.primary.main, 0.1)}
            />
          </Box>
          <StatCard
            title="Concluídas"
            value={completedCount}
            subtitle="Finalizadas"
            icon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
            iconBgColor={alpha(theme.palette.success.main, 0.1)}
          />
        </Box>
      ) : (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={6}>
            <StatCard
              title="Próximas Consultas"
              value={upcomingCount}
              subtitle="Agendadas ou confirmadas"
              icon={<CalendarMonthIcon sx={{ color: theme.palette.primary.main }} />}
              iconBgColor={alpha(theme.palette.primary.main, 0.1)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <StatCard
              title="Consultas Concluídas"
              value={completedCount}
              subtitle="Finalizadas"
              icon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
              iconBgColor={alpha(theme.palette.success.main, 0.1)}
            />
          </Grid>
        </Grid>
      )}

      {/* Loader para atualizações */}
      {loading && appointments.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 1 }}>Atualizando...</Typography>
        </Box>
      )}

      {/* Cards no mobile / Tabela no desktop */}
      {isMobile ? (
        <>
          {appointments.length === 0 ? (
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
                Nenhuma consulta encontrada
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Você ainda não possui consultas agendadas.
              </Typography>
              <Button
                variant="contained"
                onClick={() => pushWithProgress("/estagiario/calendario")}
                startIcon={<CalendarMonthIcon />}
              >
                Ver Calendário
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {appointments.map((a) => (
                  <Box
                    key={a.id}
                    onClick={() => pushWithProgress(`/estagiario/consultas/${a.id}`)}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      boxShadow: 1,
                      borderLeft: borderColor(a),
                      bgcolor: "background.paper",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:active": {
                        transform: "scale(0.98)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar 
                        src={(() => {
                          const raw = a.patientAvatar;
                          if (!raw) return undefined;
                          return /^https?:\/\//.test(raw) 
                            ? raw 
                            : `${process.env.NEXT_PUBLIC_API_HOST}${raw}`;
                        })()}
                        sx={{ width: 28, height: 28 }}
                      >
                        {a.patientName ? a.patientName.split(" ").map((n) => n[0]).join("") : <PersonIcon fontSize="small" />}
                      </Avatar>
                      <Typography fontWeight={600} sx={{ fontSize: "0.95rem" }}>
                        {a.patientName}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {a.specialty}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {a.date} às {a.time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {a.location}
                    </Typography>
                    <StyledBadge 
                      label={a.status === "Aguardando confirmação do Paciente" ? "Aguard. Confirmação" : a.status} 
                      badgeType={a.status} 
                      sx={{ mt: 1 }} 
                    />
                  </Box>
                ))}
              </Box>

              {/* Paginação mobile */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={handlePageChange}
                    color="primary"
                    size="small"
                    shape="rounded"
                  />
                </Box>
              )}
            </>
          )}
        </>
      ) : (
        <DataTable<UIAppointment>
          title="Minhas Consultas"
          subtitle="Acompanhe suas consultas agendadas"
          headers={[...internHeaders]}
          data={appointments}
          renderCell={(a, id) => renderInternCell(a, id as InternHeaderId)}
          rowKeyExtractor={(a) => a.id}
          getPriorityBorderColor={borderColor}
          totalCount={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          emptyMessage={!loading && appointments.length === 0 ? "Você ainda não possui consultas agendadas." : ""}
          rowOnClick={(a) => pushWithProgress(`/estagiario/consultas/${a.id}`)}
        />
      )}
      {/* Estagiário não tem menu de ações nesta tela */}
    </Container>
  );
}
