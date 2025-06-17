"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Paper,
  CircularProgress,
  Stack,
  Tabs,
  Tab,
  CardHeader,
  Fade,
  Slide,
  useMediaQuery,
  Tooltip,
  LinearProgress,
  Skeleton,
  useTheme,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import HistoryIcon from "@mui/icons-material/History";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { alpha, styled } from "@mui/material/styles";
import { useParams, useRouter } from "next/navigation";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  STATUS_LABEL,
  statusPriority,
  humanDate,
  RawAppointment,
} from "@/app/types";
import { apiFetch } from "@/app/lib/api";
import { fetchInterns } from "@/app/lib/api/interns";
import type { Intern } from "@/app/types";


// --------------------------------------------------
// LOCAL TYPES — adaptados para o UI detalhado
// --------------------------------------------------

type AppointmentStatus = "Pendente" | "Confirmada" | "Cancelada" | "Rejeitada" | "Concluída";

type Priority = "high" | "normal" | "low";

interface Appointment {
  id: string;
  patientName: string;
  patientAvatar: string;
  patientPhone?: string;
  patientEmail?: string;
  patientCpf?: string;
  specialty: string;
  location: string;
  room: string;
  date: string; // ISO string (yyyy-mm-dd)
  time: string; // HH:mm
  status: AppointmentStatus;
  priority: Priority;
  internName: string | null;
  internId: string | null;
  description: string;
  symptoms: string[];
  medicalHistory: string[];
  medications: string[];
  createdAt: string; // ISO
  requestedBy: string;
}

// --------------------------------------------------
// UI helpers para loading
// --------------------------------------------------
const LoadingFallback = () => (
  <Box sx={{ py: 10, textAlign: "center" }}>
    <CircularProgress size={48} />
  </Box>
);

// --------------------------------------------------
// STYLED COMPONENTS (mesmos do mock original)
// --------------------------------------------------
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 1,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    transform: "translateY(-2px)",
  },
}));

const GradientBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(
    theme.palette.secondary.main,
    0.05,
  )} 100%)`,
  borderRadius: 1,
  padding: theme.spacing(3),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2),
  borderRadius: 1,
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderColor: alpha(theme.palette.primary.main, 0.2),
  },
}));

interface StatusChipProps {
  status: AppointmentStatus;
}

const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "status",
})<StatusChipProps>(({ theme, status }) => {
const colorMap = {
  Confirmada: { bg: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, border: alpha(theme.palette.success.main, 0.3) },
  Cancelada:  { bg: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, border: alpha(theme.palette.warning.main, 0.3) },
  Rejeitada:  { bg: alpha(theme.palette.error.main,   0.1), color: theme.palette.error.main,   border: alpha(theme.palette.error.main,   0.3) },
  Concluída:  { bg: alpha(theme.palette.info.main,    0.1), color: theme.palette.info.main,    border: alpha(theme.palette.info.main,    0.3) },
  Pendente:   { bg: alpha(theme.palette.grey[500],    0.1), color: theme.palette.text.secondary, border: alpha(theme.palette.grey[500],   0.3) },
} as const;

  const colors = colorMap[status];

  return {
    backgroundColor: colors.bg,
    color: colors.color,
    borderRadius: 1,
    border: `1px solid ${colors.border}`,
    fontWeight: 600,
    fontSize: "0.875rem",
    height: 32,
  };
});

// --------------------------------------------------
// TAB COMPONENT
// --------------------------------------------------
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

// --------------------------------------------------
// UTILS — adaptação do payload da API à UI
// --------------------------------------------------
const adaptAppointment = (raw: RawAppointment): Appointment => {
  const statusLabel: AppointmentStatus =
    (STATUS_LABEL[raw.status] as AppointmentStatus) || "Pendente";

  const specialty =
    raw.consultationRoom?.specialtyName || raw.timeSlot?.specialtyName || "";
  const location =
    raw.consultationRoom?.collegeLocationName || raw.timeSlot?.collegeLocationName || "";
  const room = raw.consultationRoom?.name || "";

  return {
    id: String(raw.id),
    patientName: raw.user.name,
    patientAvatar: raw.user.avatarUrl || "",
    specialty,
    location,
    room,
    date: raw.date,
    time: raw.startTime.slice(0, 5),
    status: statusLabel,
    priority: statusPriority(statusLabel),
    internName: raw.intern?.name || null,
    internId: raw.intern?.id ? String(raw.intern.id) : null,
    description: raw.notes || "Sem descrição",
    symptoms: [], // backend ainda não provê
    medicalHistory: [], // idem
    medications: [], // idem
    createdAt: raw.date, // substitua quando houver created_at
    requestedBy: "" /* backend não fornece no payload atual */,
    patientPhone: raw.user.phone || undefined,
    patientEmail: raw.user.email || undefined,
    patientCpf: raw.user.cpf || undefined,
  };
};

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------
const AppointmentDetailScreen: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const { id: appointmentId } = useParams<{ id: string }>();

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string>("");

  // dialogs
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);

  // local fields
  const [selectedIntern, setSelectedIntern] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [tabValue, setTabValue] = useState<number>(0);
  const [cancelDialog, setCancelDialog] = useState(false);

  // interns list
  const [interns, setInterns] = useState<Intern[]>([]);

  // --------------------------------------------------
  // FETCH DATA
  // --------------------------------------------------
  const loadAppointment = useCallback(async () => {
    try {
      setLoading(true);
      const json = await apiFetch<{ data: RawAppointment }>(
        `/api/appointments/${appointmentId}`,
      );
      if (json?.data) {
        const adapted = adaptAppointment(json.data);
        setAppointment(adapted);
      } else {
        setApiError("Consulta não encontrada");
      }
    } catch (err: unknown) {
      console.error(err);
      setApiError("Erro ao carregar consulta");
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  const loadInterns = useCallback(async () => {
    try {
      const { data } = await fetchInterns(1, 5); // ajuste userId se necessário
      setInterns(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (appointmentId) {
      loadAppointment();
      loadInterns();
    }
  }, [appointmentId, loadAppointment, loadInterns]);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------
  const getInitials = useMemo(
    () =>
      (name: string) =>
        name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
    [],
  );

  const handleBack = () => router.back();

  // --------------------------------------------------
  // RENDER — estados de carregamento/erro
  // --------------------------------------------------
  if (loading) return <LoadingFallback />;
  if (apiError) return <Alert severity="error">{apiError}</Alert>;
  if (!appointment) return null;

  // --------------------------------------------------
  // ACTIONS (mantidas as versões mock por enquanto)
  // TODO: integrar PATCH/PUT na API
  // --------------------------------------------------
  const handleApprove = async () => {
    // Exemplo de update — ajuste conforme parâmetros aceitos pela API
    try {
      setLoading(true);
      await apiFetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        body: JSON.stringify({ appointment: { status: "confirmed", notes } }),
      });
      setAppointment((prev) =>
        prev ? { ...prev, status: "Confirmada" } : prev,
      );
      setApprovalDialog(false);
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = async () => {
    try {
      setLoading(true);
      await apiFetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        body: JSON.stringify({ appointment: { status: "cancelled" } }),
      });
      setAppointment((prev) => (prev ? { ...prev, status: "Cancelada" } : prev));
      setCancelDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    try {
      setLoading(true);
      await apiFetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        body: JSON.stringify({ appointment: { status: "rejected", notes: rejectionReason } }),
      });
      setAppointment((prev) =>
        prev ? { ...prev, status: "Rejeitada" } : prev,
      );
      setRejectionDialog(false);
      setRejectionReason("");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignIntern = async () => {
    if (!selectedIntern) return;
    try {
      setLoading(true);
      await apiFetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        body: JSON.stringify({ appointment: { intern_id: String(selectedIntern) } }),
      });
      const intern = interns.find((i) => String(i.id) === selectedIntern);
      setAppointment((prev) =>
        prev ? { ...prev, internName: intern?.name || "", internId: selectedIntern } : prev,
      );
      setAssignDialog(false);
      setSelectedIntern("");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/consultas/${appointment.id}/editar`);
  };

  // ---------- Primary action buttons ----------
const PrimaryActions = ({ dense = false }: { dense?: boolean }) => {
    const commonSx = {
      borderRadius: 2,
      px: dense ? 2 : 3,
      fontWeight: 600,
      textTransform: "none",
    };

    const EditButton = (
      <Button
        variant="outlined"
        color="primary"
        size={dense ? "medium" : "large"}
        onClick={handleEdit}
        disabled={loading}
        startIcon={<EditIcon />}
        sx={commonSx}
      >
        Editar
      </Button>
    );

    switch (appointment.status) {
      case "Pendente":
        return (
          <>
            {EditButton}
            <Button
              variant="contained"
              color="success"
              size={dense ? "medium" : "large"}
              onClick={() => setApprovalDialog(true)}
              disabled={loading}
              startIcon={<CheckCircleIcon />}
              sx={commonSx}
            >
              Confirmar
            </Button>
            <Button
              variant="outlined"
              color="error"
              size={dense ? "medium" : "large"}
              onClick={() => setRejectionDialog(true)}
              disabled={loading}
              startIcon={<CancelIcon />}
              sx={commonSx}
            >
              Rejeitar
            </Button>
          </>
        );

      case "Confirmada":
        return (
          <>
            {EditButton}
            <Button
              variant="contained"
              color="warning"
              size={dense ? "medium" : "large"}
              onClick={() => setCancelDialog(true)}
              disabled={loading}
              startIcon={<CancelIcon />}
              sx={commonSx}
            >
              Cancelar
            </Button>
          </>
        );

      case "Cancelada":
        return (
          <>
            {EditButton}
            <Button
              variant="contained"
              color="primary"
              size={dense ? "medium" : "large"}
              onClick={() => {
                /* abrir modal de reagendamento */
              }}
              startIcon={<CalendarMonthIcon />}
              sx={commonSx}
            >
              Reagendar
            </Button>
          </>
        );

      case "Rejeitada":
        return (
          <>
            {EditButton}
            <Button
              variant="outlined"
              color="info"
              size={dense ? "medium" : "large"}
              onClick={() => {
                /* opcional: reabrir */
              }}
              startIcon={<InfoIcon />}
              sx={commonSx}
            >
              Reabrir
            </Button>
          </>
        );

      default:
        return EditButton;
    }
  };

  // --------------------------------------------------
  // RENDER PRINCIPAL
  // --------------------------------------------------
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Fade in timeout={600}>
          <GradientBox sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
              {/* Left */}
              <Stack direction="row" alignItems="center" gap={2}>
                <Tooltip title="Voltar">
                  <IconButton
                    onClick={handleBack}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    Detalhes da Consulta
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {appointment.id} • Criada em {format(parseISO(appointment.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </Typography>
                </Box>
              </Stack>

              {/* Right */}
              <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                <StatusChip
                  label={appointment.status}
                  status={appointment.status}
                  icon={
                    appointment.status === "Confirmada" ? (
                      <CheckCircleIcon />
                    ) : appointment.status === "Cancelada" || appointment.status === "Rejeitada" ? (
                      <CancelIcon />
                    ) : (
                      <InfoIcon />
                    )
                  }
                />
                {!isMobile && (
                  <Stack direction="row" gap={1.2} ml={1}>
                    <PrimaryActions dense />
                  </Stack>
                )}
              </Stack>
            </Stack>
          </GradientBox>
        </Fade>

        {/* GRID principal */}
        <Grid container spacing={3}>
          {/* Sidebar Paciente */}
          <Grid item xs={12} lg={4}>
            <Slide direction="right" in timeout={800}>
              <StyledCard sx={{ position: isMobile ? "static" : "sticky", top: 24 }}>
                <CardHeader
                  avatar={
                    <Avatar
                      src={appointment.patientAvatar}
                      sx={{
                        width: 64,
                        height: 64,
                        fontSize: "1.5rem",
                        fontWeight: 600,
                        bgcolor: theme.palette.primary.main,
                      }}
                    >
                      {getInitials(appointment.patientName)}
                    </Avatar>
                  }
                  title={<Typography variant="h6" fontWeight={600}>{appointment.patientName}</Typography>}
                  subheader={<Typography variant="body2" color="text.secondary">CPF: {appointment.patientCpf || "—"}</Typography>}
                />
                <CardContent>
                  <Stack spacing={3}>
                    {/* Contatos */}
                    <Stack spacing={2}>
                      <InfoItem>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), mr: 2, width: 40, height: 40 }}>
                          <PhoneIcon sx={{ color: theme.palette.info.main }} />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>Telefone</Typography>
                          <Typography variant="body2" color="text.secondary">{appointment.patientPhone || "—"}</Typography>
                        </Box>
                      </InfoItem>
                      <InfoItem>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), mr: 2, width: 40, height: 40 }}>
                          <EmailIcon sx={{ color: theme.palette.success.main }} />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>E-mail</Typography>
                          <Typography variant="body2" color="text.secondary">{appointment.patientEmail || "—"}</Typography>
                        </Box>
                      </InfoItem>
                    </Stack>
                    {/* Histórico (placeholder) */}
                    <Divider />
                    <Box>
                      <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <HistoryIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight={600}>Histórico Médico</Typography>
                      </Stack>
                      {appointment.medicalHistory.length ? (
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                          {appointment.medicalHistory.map((c) => (
                            <Chip key={c} label={c} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">Sem informações.</Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </StyledCard>
            </Slide>
          </Grid>

          {/* Conteúdo principal */}
          <Grid item xs={12} lg={8}>
            <Slide direction="left" in timeout={800}>
              <StyledCard>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    variant={isMobile ? "fullWidth" : "standard"}
                    sx={{ px: 3, "& .MuiTab-root": { fontWeight: 600, textTransform: "none", fontSize: "1rem" } }}
                  >
                    <Tab label="Detalhes da Consulta" icon={<LocalHospitalIcon />} iconPosition="start" sx={{ gap: 1 }} />
                    <Tab label="Estagiário" icon={<AssignmentIndIcon />} iconPosition="start" sx={{ gap: 1 }} />
                  </Tabs>
                </Box>

                {/* ----- Tab 0 ----- */}
                <TabPanel value={tabValue} index={0}>
                  <CardContent>
                    <Stack spacing={4}>
                      <Grid container spacing={3}>
                        {/* Especialidade */}
                        <Grid item xs={12} sm={6}>
                          <InfoItem>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), mr: 2, width: 48, height: 48 }}>
                              <MedicalServicesIcon sx={{ color: theme.palette.primary.main }} />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">Especialidade</Typography>
                              <Typography variant="h6" fontWeight={600}>{appointment.specialty}</Typography>
                            </Box>
                          </InfoItem>
                        </Grid>
                        {/* Data */}
                        <Grid item xs={12} sm={6}>
                          <InfoItem>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), mr: 2, width: 48, height: 48 }}>
                              <CalendarMonthIcon sx={{ color: theme.palette.info.main }} />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">Data e Hora</Typography>
                              <Typography variant="h6" fontWeight={600}>{humanDate(appointment.date)} às {appointment.time}</Typography>
                            </Box>
                          </InfoItem>
                        </Grid>
                        {/* Local */}
                        <Grid item xs={12} sm={6}>
                          <InfoItem>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), mr: 2, width: 48, height: 48 }}>
                              <LocationOnIcon sx={{ color: theme.palette.success.main }} />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">Local</Typography>
                              <Typography variant="h6" fontWeight={600}>{appointment.location} - {appointment.room}</Typography>
                            </Box>
                          </InfoItem>
                        </Grid>
                        {/* Solicitado por */}
                        <Grid item xs={12} sm={6}>
                          <InfoItem>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), mr: 2, width: 48, height: 48 }}>
                              <PersonIcon sx={{ color: theme.palette.warning.main }} />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">Solicitado por</Typography>
                              <Typography variant="h6" fontWeight={600}>{appointment.requestedBy || "—"}</Typography>
                            </Box>
                          </InfoItem>
                        </Grid>
                      </Grid>
                      <Divider />
                      <Box>
                        <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <InfoIcon color="primary" /> Descrição da Consulta
                        </Typography>
                        <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, borderRadius: 2 }}>
                          <Typography variant="body1" sx={{ lineHeight: 1.7 }}>{appointment.description}</Typography>
                        </Paper>
                      </Box>
                    </Stack>
                  </CardContent>
                </TabPanel>

                {/* ----- Tab 1 ----- */}
                <TabPanel value={tabValue} index={1}>
                  <CardContent>
                    <Stack spacing={3}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={600}>Estagiário Designado</Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AssignmentIndIcon />}
                          onClick={() => setAssignDialog(true)}
                          disabled={appointment.status === "Rejeitada"}
                          sx={{ borderRadius: 2 }}
                        >
                          {appointment.internName ? "Alterar" : "Designar"}
                        </Button>
                      </Stack>
                      {appointment.internName ? (
                        <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.success.main, 0.05), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`, borderRadius: 2 }}>
                          <Stack direction="row" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.success.main, fontSize: "1.25rem", fontWeight: 600 }}>{getInitials(appointment.internName)}</Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight={600}>{appointment.internName}</Typography>
                              <Typography variant="body2" color="text.secondary">Especialidade: {appointment.specialty}</Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      ) : (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          Nenhum estagiário foi designado para esta consulta ainda.
                        </Alert>
                      )}
                    </Stack>
                  </CardContent>
                </TabPanel>
              </StyledCard>
            </Slide>
          </Grid>
        </Grid>

        {/* ---------------- Dialogs ---------------- */}
        {/* Approve Dialog */}
        <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle variant="h5" sx={{ pb: 1, fontWeight: 600 }}>
            Confirmar Consulta
          </DialogTitle>
          <DialogContent>
            <Typography mb={3} color="text.secondary">Tem certeza que deseja confirmar esta consulta para {appointment.patientName}?</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setApprovalDialog(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancelar</Button>
            <Button onClick={handleApprove} variant="outlined" color="success" disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : <CheckCircleIcon />} sx={{ borderRadius: 2, px: 3 }}>
              Aprovar
            </Button>
          </DialogActions>
          {loading && <LinearProgress />}
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle variant="h5" sx={{ pb: 1, fontWeight: 600 }}>
            Rejeitar Consulta
          </DialogTitle>
          <DialogContent>
            <Typography mb={3} color="text.secondary">Por favor, informe o motivo da rejeição desta consulta:</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motivo da rejeição *"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setRejectionDialog(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancelar</Button>
            <Button onClick={handleReject} variant="contained" color="error" disabled={loading || !rejectionReason.trim()} startIcon={loading ? <CircularProgress size={16} /> : <CancelIcon />} sx={{ borderRadius: 2, px: 3 }}>
              Rejeitar
            </Button>
          </DialogActions>
          {loading && <LinearProgress />}
        </Dialog>

        {/* Assign Intern Dialog */}
        <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle variant="h5" sx={{ pb: 1, fontWeight: 600 }}>
            Designar Estagiário
          </DialogTitle>
          <DialogContent>
            <Typography mb={3} color="text.secondary">Selecione um estagiário para esta consulta de {appointment.specialty}:</Typography>
            <TextField
              select
              fullWidth
              label="Estagiário"
              value={selectedIntern}
              onChange={(e) => setSelectedIntern(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              {interns.map((intern) => (
                <MenuItem key={intern.id} value={String(intern.id)}>
                  <Stack direction="row" alignItems="center" gap={2}>
                    <Avatar sx={{ width: 32, height: 32 }}>{getInitials(intern.name)}</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{intern.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{intern.specialty}</Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setAssignDialog(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancelar</Button>
            <Button onClick={handleAssignIntern} variant="contained" disabled={loading || !selectedIntern} startIcon={loading ? <CircularProgress size={16} /> : <AssignmentIndIcon />} sx={{ borderRadius: 2, px: 3 }}>
              Designar
            </Button>
          </DialogActions>
          {loading && <LinearProgress />}
        </Dialog>

        {/* Cancel Dialog */}
        <Dialog
          open={cancelDialog}
          onClose={() => setCancelDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle variant="h5" sx={{ pb: 1, fontWeight: 600 }}>
            Cancelar Consulta
          </DialogTitle>

          <DialogContent>
            <Typography mb={3} color="text.secondary">
              Tem certeza de que deseja cancelar esta consulta?
            </Typography>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={() => setCancelDialog(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Voltar
            </Button>
            <Button
              onClick={handleCancel}
              variant="contained"
              color="warning"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <CancelIcon />}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Cancelar
            </Button>
          </DialogActions>

          {loading && <LinearProgress />}
        </Dialog>
      </Container>
    </Box>
  );
};

export default AppointmentDetailScreen;
