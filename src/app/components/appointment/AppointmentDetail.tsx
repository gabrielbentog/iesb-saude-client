"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

/* icons */
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";

/* date utils */
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/* next */
import { useParams, useRouter } from "next/navigation";

/* app util */
import { useToast } from "@/app/contexts/ToastContext";
import { apiFetch } from "@/app/lib/api";
import { fetchInterns } from "@/app/lib/api/interns";

/* types */
import type {
  RawAppointment,
  Intern,
  RawStatusHistory,
} from "@/app/types";
import {
  STATUS_LABEL,
  AppointmentStatus,
  RawAppointmentStatus,
} from "@/app/types";
import {
  ActionButton,
  type ActionButtonProps,
} from "@/app/components/ui/ActionButton";

/* ------------------------------------------------------------------ */
/* Types & data adapters                                              */
/* ------------------------------------------------------------------ */
interface Appointment {
  id: string;
  patientName: string;
  patientAvatar: string;
  patientCpf?: string;
  patientPhone?: string;
  patientEmail?: string;
  specialty: string;
  location: string;
  room: string;
  date: string; // yyyy-MM-dd (ISO only date)
  time: string; // HH:mm (24h)
  status: AppointmentStatus;
  description: string;
  createdAt: string;
  internName: string | null;
  internId: string | null;
}

const adapt = (raw: RawAppointment): Appointment => ({
  id: String(raw.id),
  patientName: raw.user.name,
  patientAvatar: raw.user.avatarUrl ?? "",
  patientCpf: raw.user.cpf ?? undefined,
  patientPhone: raw.user.phone ?? undefined,
  patientEmail: raw.user.email ?? undefined,
  specialty:
    raw.consultationRoom?.specialtyName ??
    raw.timeSlot?.specialtyName ??
    "",
  location:
    raw.consultationRoom?.collegeLocationName ??
    raw.timeSlot?.collegeLocationName ??
    "",
  room: raw.consultationRoom?.name ?? "",
  date: raw.date, // yyyy-MM-dd
  time: format(parseISO(raw.startTime), "HH:mm"),
  status: STATUS_LABEL[raw.status as RawAppointmentStatus] as AppointmentStatus,
  description: raw.notes || "Sem descrição",
  createdAt: raw.createdAt,
  internName: raw.intern?.name ?? null,
  internId: raw.intern?.id ? String(raw.intern.id) : null,
});

/* ------------------------------------------------------------------ */
/* Styled helpers                                                     */
/* ------------------------------------------------------------------ */
const StyledBadge = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "badgeType",
})<{ badgeType: AppointmentStatus }>(({ theme, badgeType }) => {
  const cfg = (() => {
    switch (badgeType) {
      case "Confirmada":
        return {
          bg: alpha(theme.palette.success.main, 0.1),
          fg: theme.palette.success.main,
          icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        };
      case "Concluída":
        return {
          bg: alpha(theme.palette.info.main, 0.1),
          fg: theme.palette.info.main,
          icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        };
      case "Aguardando aprovação":
        return {
          bg: alpha(theme.palette.info.main, 0.1),
          fg: theme.palette.info.main,
          icon: <PendingIcon sx={{ fontSize: 16 }} />,
        };
      case "Aguardando confirmação do Paciente":
        return {
          bg: alpha(theme.palette.warning.main, 0.1),
          fg: theme.palette.warning.main,
          icon: <PendingIcon sx={{ fontSize: 16 }} />,
        };
      case "Cancelada pelo gestor":
      case "Cancelada pelo paciente":
      case "Rejeitada":
        return {
          bg: alpha(theme.palette.error.main, 0.1),
          fg: theme.palette.error.main,
          icon: <CancelIcon sx={{ fontSize: 16 }} />,
        };
      default:
        return {
          bg: alpha(theme.palette.grey[500], 0.1),
          fg: theme.palette.grey[700],
          icon: null,
        };
    }
  })();
  return {
    backgroundColor: cfg.bg,
    color: cfg.fg,
    fontWeight: 600,
    fontSize: "0.75rem",
    height: 28,
    "& .MuiChip-icon": { color: cfg.fg },
  };
});

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
}));

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBgColor?: string;
}> = ({ icon, label, value, iconBgColor }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
      <IconContainer
        sx={{ bgcolor: iconBgColor || alpha(theme.palette.primary.main, 0.1) }}
      >
        {icon}
      </IconContainer>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={500}
        >
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600} noWrap>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* Action‑button factory                                              */
/* ------------------------------------------------------------------ */
type Role = "Gestor" | "Paciente" | "Estagiário";

interface ButtonsResult {
  primary?: ActionButtonProps & { action: RawAppointmentStatus };
  secondary?: ActionButtonProps & { action: RawAppointmentStatus };
  tertiary?: ActionButtonProps & { action: RawAppointmentStatus };
}

function buildButtons(
  role: Role,
  status: AppointmentStatus,
  canComplete: boolean,
  change: (s: RawAppointmentStatus) => void,
): ButtonsResult {
  const mk = (
    label: string,
    color: ActionButtonProps["colorKey"],
    icon: ActionButtonProps["iconType"],
    next: RawAppointmentStatus,
    confirmMsg: string,
    disabled = false,
  ) => ({ label, colorKey: color, iconType: icon, action: next, disabled, onClick: () => change(next),
    confirm: {
      title: "Confirmação",
      description: confirmMsg,
      confirmLabel: "Sim, continuar",
      cancelLabel: "Cancelar",
    } 
  });

  if (role === "Gestor") {
    switch (status) {
      case "Aguardando aprovação":
        return {
          primary: mk("Aprovar", "success", "check", "admin_confirmed", "Deseja aprovar esta consulta? Após a aprovação, o paciente terá que confirmar sua presença."),
          secondary: mk("Rejeitar", "error", "close", "rejected", "Deseja rejeitar esta consulta? Após rejeitar o pedido, o horário ficará disponível para outros pacientes."),
        };
      case "Aguardando confirmação do Paciente":
        return {
          secondary: mk("Cancelar", "error", "close", "cancelled_by_admin", "Deseja cancelar esta consulta? Após cancelar, o horário ficará disponível para outros pacientes."),
        };
      case "Confirmada": // patient_confirmed
        return {
          primary: mk("Concluir", "info", "check", "completed", "Deseja concluir esta consulta? Após a conclusão não será possível editar ou cancelar.", !canComplete),
          secondary: mk("Cancelar", "error", "close", "cancelled_by_admin", "Deseja cancelar esta consulta? Após cancelar, o horário ficará disponível para outros pacientes."),
        };
      case "Cancelada pelo gestor":
        return {
          primary: mk("Reabrir", "success", "check", "pending", "Deseja reabrir esta consulta?"),
        };
      case "Cancelada pelo paciente":
        return {
          primary: mk("Reabrir", "success", "check", "pending", "Deseja reabrir esta consulta?"),
        };
      default:
        return {};
    }
  }
  // patient role
  if (status === "Aguardando confirmação do Paciente") {
    return {
      primary: mk("Confirmar", "success", "check", "patient_confirmed", "Deseja confirmar esta consulta?"),
      secondary: mk("Cancelar", "error", "close", "patient_cancelled", "Deseja cancelar esta consulta? Após cancelar, o horário ficará disponível para outros pacientes."),
    };
  }
  return {};
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export interface AppointmentDetailProps {
  currentUser: {
    user: { profile: { name: string } };
  } | null;
}

const AppointmentDetail: React.FC<AppointmentDetailProps> = ({
  currentUser,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const role: Role = currentUser?.user.profile.name as Role;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [history, setHistory] = useState<RawStatusHistory[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedInternId, setSelectedInternId] = useState<string>("");

  const [now, setNow] = useState<Date>(new Date());
  const [tab, setTab] = useState<"details" | "history">("details");

  /* Tick a cada minuto para recalcular canComplete */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  /* ------------------------------------------------------------------ */
  /* Carrega dados: consulta, estagiários, histórico                     */
  /* ------------------------------------------------------------------ */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data: raw }, internsResp, histResp] = await Promise.all([
        apiFetch<{ data: RawAppointment }>(`/api/appointments/${id}`),
        fetchInterns(1, 100),
        apiFetch<{ data: RawStatusHistory[] }>(
          `/api/appointments/${id}/appointment_status_histories`,
        ),
      ]);

      setAppointment(adapt(raw));
      setInterns(internsResp.data);
      setHistory(histResp.data);
    } catch {
      setError("Não foi possível carregar os dados da consulta.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ------------------------------------------------------------------ */
  /* Utilitários                                                        */
  /* ------------------------------------------------------------------ */
  const getInitials = useCallback(
    (name: string) =>
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    [],
  );

  const formatDate = useCallback((d: string) => {
    try {
      return format(parseISO(d), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return d;
    }
  }, []);

  const startDateTime = useMemo(() => {
    if (!appointment) return null;
    return new Date(`${appointment.date}T${appointment.time}:00`);
  }, [appointment]);

  const canComplete = useMemo(() => {
    if (!startDateTime) return false;
    return now >= startDateTime;
  }, [now, startDateTime]);

  /* ------------------------------------------------------------------ */
  /* Ações                                                              */
  /* ------------------------------------------------------------------ */
  const patchStatus = useCallback(
    async (next: RawAppointmentStatus) => {
      try {
        await apiFetch(`/api/appointments/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ appointment: { status: next } }),
        });
        showToast({ message: "Status atualizado!", severity: "success" });
        setAppointment((prev) =>
          prev ? { ...prev, status: STATUS_LABEL[next] } : prev,
        );
        loadData(); // recarrega histórico
      } catch {
        showToast({ message: "Erro ao atualizar status", severity: "error" });
      }
    },
    [id, showToast, loadData],
  );

  const handleAssignIntern = useCallback(async () => {
    if (!selectedInternId || !appointment) return;
    await apiFetch(`/api/appointments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ appointment: { intern_id: selectedInternId } }),
    });
    const chosen = interns.find((i) => i.id === selectedInternId);
    setAppointment({
      ...appointment,
      internName: chosen?.name ?? null,
      internId: selectedInternId,
    });
    setAssignDialogOpen(false);
    setSelectedInternId("");
  }, [appointment, id, interns, selectedInternId]);

  /* ------------------------------------------------------------------ */
  /* Botões                                                             */
  /* ------------------------------------------------------------------ */
  const btnCfg = useMemo(
    () => buildButtons(role, appointment?.status ?? "Aguardando aprovação", canComplete, patchStatus),
    [role, appointment?.status, canComplete, patchStatus],
  );

  /* ------------------------------------------------------------------ */
  /* Guardas de render                                                  */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!appointment) return null;

  /* ------------------------------------------------------------------ */
  /* JSX                                                                */
  /* ------------------------------------------------------------------ */
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.paper", py: 6 }}>
      <Container maxWidth="xl">
        {/* Banner */}
        <Paper sx={{ bgcolor: "primary.main", color: "white" }} elevation={0}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                  onClick={() => router.back()}
                  sx={{ color: "white", bgcolor: alpha("#fff", 0.1) }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight={700}>
                  {appointment.specialty} – {formatDate(appointment.date)}
                </Typography>
              </Box>
              <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                {btnCfg.primary && <ActionButton {...btnCfg.primary} />}
                {btnCfg.secondary && <ActionButton {...btnCfg.secondary} />}
                {btnCfg.tertiary && <ActionButton {...btnCfg.tertiary} />}
              </Box>
            </Box>
          </CardContent>
        </Paper>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="inherit"
          indicatorColor="primary"
          sx={{ mt: 4 }}
        >
          <Tab value="details" label="Detalhes" />
          <Tab value="history" label="Histórico" />
        </Tabs>

        {/* Detalhes */}
        {tab === "details" && (
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {/* Patient card */}
            <Grid item xs={12} md={4}>
              <InfoCard>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}
                  >
                    <Avatar
                      src={appointment.patientAvatar}
                      sx={{
                        width: 80,
                        height: 80,
                        fontSize: "1.5rem",
                        mb: 2,
                        border: `3px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}
                    >
                      {getInitials(appointment.patientName)}
                    </Avatar>
                    <Typography variant="h6" fontWeight={700} textAlign="center">
                      {appointment.patientName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Paciente
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={0}>
                    {appointment.patientPhone && (
                      <InfoRow
                        icon={<PhoneIcon sx={{ color: "success.main" }} />}
                        label="Telefone"
                        value={appointment.patientPhone}
                        iconBgColor={alpha(theme.palette.success.main, 0.1)}
                      />
                    )}
                    {appointment.patientEmail && (
                      <InfoRow
                        icon={<EmailIcon sx={{ color: "info.main" }} />}
                        label="E-mail"
                        value={appointment.patientEmail}
                        iconBgColor={alpha(theme.palette.info.main, 0.1)}
                      />
                    )}
                    {appointment.patientCpf && (
                      <InfoRow
                        icon={<AssignmentIndIcon sx={{ color: "warning.main" }} />}
                        label="CPF"
                        value={appointment.patientCpf}
                        iconBgColor={alpha(theme.palette.warning.main, 0.1)}
                      />
                    )}
                  </Stack>
                </CardContent>
              </InfoCard>
            </Grid>

            {/* Right column */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                {/* Details */}
                <Grid item xs={12}>
                  <InfoCard>
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        mb={3}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        Detalhes da Consulta
                        <StyledBadge
                          label={appointment.status}
                          badgeType={appointment.status}
                        />
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <InfoRow
                            icon={<MedicalServicesIcon sx={{ color: "primary.main" }} />}
                            label="Especialidade"
                            value={appointment.specialty}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoRow
                            icon={<CalendarMonthIcon sx={{ color: "success.main" }} />}
                            label="Data e Hora"
                            value={`${formatDate(appointment.date)} às ${appointment.time}`}
                            iconBgColor={alpha(theme.palette.success.main, 0.1)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoRow
                            icon={<LocationOnIcon sx={{ color: "warning.main" }} />}
                            label="Local"
                            value={appointment.location || "-"}
                            iconBgColor={alpha(theme.palette.warning.main, 0.1)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoRow
                            icon={<AccessTimeIcon sx={{ color: "info.main" }} />}
                            label="Sala"
                            value={appointment.room || "-"}
                            iconBgColor={alpha(theme.palette.info.main, 0.1)}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </InfoCard>
                </Grid>

                {/* Intern */}
                <Grid item xs={12}>
                  <InfoCard sx={{ position: "relative" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={700} mb={3}>
                        Estagiário Designado
                      </Typography>
                      {role === "Gestor" && (
                        <Tooltip
                          title={
                            appointment.internName ? "Alterar estagiário" : "Designar estagiário"
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() => setAssignDialogOpen(true)}
                            sx={{
                              position: "absolute",
                              top: 16,
                              right: 16,
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.16),
                              },
                            }}
                          >
                            {appointment.internName ? <EditIcon /> : <PersonAddIcon />}
                          </IconButton>
                        </Tooltip>
                      )}
                      {appointment.internName ? (
                        <InfoRow
                          icon={<AssignmentIndIcon sx={{ color: "success.main" }} />}
                          label="Estagiário Responsável"
                          value={appointment.internName}
                          iconBgColor={alpha(theme.palette.success.main, 0.1)}
                        />
                      ) : (
                        <Alert
                          severity="info"
                          sx={{ borderRadius: 2, alignItems: "center" }}
                        >
                          Nenhum estagiário designado.
                        </Alert>
                      )}
                    </CardContent>
                  </InfoCard>
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <InfoCard>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={700} mb={2}>
                        Descrição da Consulta
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.6,
                          whiteSpace: "pre-line",
                          p: 2,
                          bgcolor: alpha(theme.palette.grey[500], 0.05),
                          borderRadius: 2,
                        }}
                      >
                        {appointment.description}
                      </Typography>
                    </CardContent>
                  </InfoCard>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Histórico */}
        {tab === "history" && (
          <Box sx={{ mt: 4 }}>
            <Stack spacing={2}>
              {history.map((h) => (
                <Paper
                  key={h.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    borderRadius: 2,
                  }}
                >
                  {/* Avatar do autor (fallback — iniciais) */}
                  <Avatar
                    src={h.changedBy?.avatar ?? ""}
                    sx={{ width: 40, height: 40, fontSize: "0.875rem" }}
                  >
                    {getInitials(h.changedBy?.name ?? "S")}
                  </Avatar>

                  {/* Texto principal */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {h.changedBy ? h.changedBy.name : "Sistema"}
                      {" — "}
                      {format(parseISO(h.changedAt), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Moveu de {h.fromStatus} para {h.toStatus}
                    </Typography>
                  </Box>

                  {/* Badge de status */}
                  <StyledBadge
                    label={h.toStatus}
                    badgeType={h.toStatus}
                    sx={{ flexShrink: 0 }}
                  />
                </Paper>
              ))}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  borderRadius: 2,
                  opacity: 0.7,
                }}
              >
                <Avatar sx={{ width: 40, height: 40, fontSize: "0.875rem", bgcolor: "grey.200", color: "grey.700" }}>
                  S
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    Sistema — {appointment?.createdAt ? format(new Date(appointment.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : ""}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Agendamento criado
                  </Typography>
                </Box>
                <StyledBadge
                  label={"Aguardando aprovação"}
                  badgeType={"Confirmada"}
                  sx={{ flexShrink: 0 }}
                />
              </Paper>
            </Stack>
          </Box>
        )}
      </Container>

      {/* FAB mobile */}
      {isMobile && role === "Gestor" && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 24, right: 24 }}
          onClick={() => setAssignDialogOpen(true)}
        >
          <PersonAddIcon />
        </Fab>
      )}

      {/* Dialog assign intern */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box>
            <Typography component="span" variant="h6" fontWeight={700}>
              Designar Estagiário
            </Typography>
          </Box>
          <Box mt={1}>
            <Typography component="span" variant="body2" color="text.secondary">
              Selecione um estagiário para esta consulta
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Estagiário"
            value={selectedInternId}
            onChange={(e) => setSelectedInternId(e.target.value)}
            margin="normal"
          >
            {interns.map((i) => (
              <MenuItem key={i.id} value={String(i.id)}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>{getInitials(i.name)}</Avatar>
                  {i.name}
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!selectedInternId}
            onClick={handleAssignIntern}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentDetail;
