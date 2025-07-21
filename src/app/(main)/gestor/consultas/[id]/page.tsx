"use client"

import type React from "react"
import { useEffect, useMemo, useState, useCallback } from "react"
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useTheme,
  useMediaQuery,
  Paper,
  Chip,
  styled,
  Fab,
  Tooltip,
} from "@mui/material"
import { alpha } from "@mui/material/styles"

import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import MedicalServicesIcon from "@mui/icons-material/MedicalServices"
import PhoneIcon from "@mui/icons-material/Phone"
import EmailIcon from "@mui/icons-material/Email"
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import EditIcon from "@mui/icons-material/Edit"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import PendingIcon from "@mui/icons-material/Pending"

import { parseISO, format, add, isAfter } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/app/contexts/ToastContext";

import { apiFetch } from "@/app/lib/api"
import { fetchInterns } from "@/app/lib/api/interns"
import type { RawAppointment, Intern } from "@/app/types"
import { STATUS_LABEL } from "@/app/types"
import { ActionButton, type ActionButtonProps } from "@/app/components/ui/ActionButton"
// -----------------------------------------------------------------------------
// Types & helpers
// -----------------------------------------------------------------------------
type AppointmentStatus =
  | "Pendente"
  | "Confirmada"
  | "Cancelada"
  | "Rejeitada"
  | "Concluída"

interface Appointment {
  id: string
  patientName: string
  patientAvatar: string
  patientCpf?: string
  patientPhone?: string
  patientEmail?: string
  specialty: string
  location: string
  room: string
  date: string
  time: string
  status: AppointmentStatus
  description: string
  createdAt: string
  internName: string | null
  internId: string | null
}

const adapt = (raw: RawAppointment): Appointment => ({
  id: String(raw.id),
  patientName: raw.user.name,
  patientAvatar: raw.user.avatarUrl ?? "",
  patientCpf: raw.user.cpf ?? undefined,
  patientPhone: raw.user.phone ?? undefined,
  patientEmail: raw.user.email ?? undefined,
  specialty:
    raw.consultationRoom?.specialtyName ?? raw.timeSlot?.specialtyName ?? "",
  location:
    raw.consultationRoom?.collegeLocationName ??
    raw.timeSlot?.collegeLocationName ??
    "",
  room: raw.consultationRoom?.name ?? "",
  date: raw.date,
  time: format(parseISO(raw.startTime), "HH:mm"),
  status: (STATUS_LABEL[raw.status] as AppointmentStatus) || "Pendente",
  description: raw.notes || "Sem descrição",
  createdAt: raw.date,
  internName: raw.intern?.name ?? null,
  internId: raw.intern?.id ? String(raw.intern.id) : null,
})

// -----------------------------------------------------------------------------
// Styled components (inalterados)
// -----------------------------------------------------------------------------
const StyledBadge = styled(Chip, {
  // impede que a prop personalizada apareça no DOM
  shouldForwardProp: (prop) => prop !== 'badgeType',
})<{ badgeType: AppointmentStatus }>(({ theme, badgeType }) => {
  const getStatusConfig = (status: AppointmentStatus) => {
    switch (status) {
      case 'Confirmada':
        return {
          backgroundColor: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
          icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        }
      case 'Pendente':
        return {
          backgroundColor: alpha(theme.palette.warning.main, 0.1),
          color: theme.palette.warning.main,
          icon: <PendingIcon sx={{ fontSize: 16 }} />,
        }
      case 'Cancelada':
      case 'Rejeitada':
        return {
          backgroundColor: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main,
          icon: <CancelIcon sx={{ fontSize: 16 }} />,
        }
      case 'Concluída':
        return {
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.main,
          icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        }
      default:
        return {
          backgroundColor: alpha(theme.palette.grey[500], 0.1),
          color: theme.palette.grey[700],
          icon: null,
        }
    }
  }

  const config = getStatusConfig(badgeType)

  return {
    backgroundColor: config.backgroundColor,
    color: config.color,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: 28,
    '& .MuiChip-icon': { color: config.color },
  }
})

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
}))

const IconContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
}))

// Info row
const InfoRow: React.FC<{
  icon: React.ReactNode
  label: string
  value: string
  iconBgColor?: string
}> = ({ icon, label, value, iconBgColor }) => {
  const theme = useTheme()
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
      <IconContainer
        sx={{ bgcolor: iconBgColor || alpha(theme.palette.primary.main, 0.1) }}
      >
        {icon}
      </IconContainer>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
const AppointmentDetail: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast();

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedInternId, setSelectedInternId] = useState("")
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000); // 1 min
    return () => clearInterval(t);
  }, []);

  // --------------------------------------------------
  // API calls
  // --------------------------------------------------
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await apiFetch<{ data: RawAppointment }>(
        `/api/appointments/${id}`,
      )
      const internsResp = await fetchInterns(1, 100)
      setAppointment(adapt(data))
      setInterns(internsResp.data)
    } catch {
      setError("Não foi possível carregar os dados da consulta.")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  // helpers
  const getInitials = useMemo(
    () => (name: string) =>
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    [],
  )

  const formatDate = (d: string) => {
    try {
      return format(parseISO(d), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    } catch {
      return d
    }
  }

  const isBeforeStart = useMemo(() => {
    if (!appointment) return false;

    const start = new Date(`${appointment.date}T${appointment.time}:00`);

    return now <= start;
  }, [appointment, now]);

  // PATCH assign intern
  const handleAssignIntern = async () => {
    if (!selectedInternId || !appointment) return
    await apiFetch(`/api/appointments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ appointment: { intern_id: selectedInternId } }),
    })
    const chosen = interns.find((i) => i.id === selectedInternId)
    setAppointment({
      ...appointment,
      internName: chosen?.name ?? null,
      internId: selectedInternId,
    })
    setAssignDialogOpen(false)
    setSelectedInternId("")
  }

  const handleChangeStatus = async (action: 'confirmed' | 'completed' | 'cancelled' | 'rejected' | 'pending') => {
    if (!appointment) return
    await apiFetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ appointment: { status: action } }), // action = 'confirmed', etc.
    })
    const nextLabel = STATUS_LABEL[action] as AppointmentStatus
    showToast({
      message: `Consulta ${nextLabel === 'Pendente' ? 'Reativada' : nextLabel} com sucesso!`,
      severity: "success",
    })
    setAppointment({ ...appointment, status: nextLabel })
  }

  // -----------------------------------------------------------------
  // render
  // -----------------------------------------------------------------
  if (loading)
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    )
  if (error)
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  if (!appointment) return null

  const BUTTONS_BY_STATUS: Record<AppointmentStatus, {
    primary?: ActionButtonProps & { action: 'confirmed' | 'completed' | 'pending' | 'cancelled' | 'rejected' }
    secondary?: ActionButtonProps & { action: 'confirmed' | 'completed' | 'pending' | 'cancelled' | 'rejected' }
  }> = {
    Pendente:   {
      primary:   { label: 'Confirmar', colorKey: 'success', iconType: 'check', action: 'confirmed', onClick: () => handleChangeStatus('confirmed') },
      secondary: { label: 'Rejeitar',  colorKey: 'error',   iconType: 'close', action: 'rejected',  onClick: () => handleChangeStatus('rejected')  },
    },
    Confirmada: {
      primary:   { label: 'Concluir',  colorKey: 'info',    iconType: 'check', action: 'completed', onClick: () => handleChangeStatus('completed') },
      secondary: { label: 'Cancelar',  colorKey: 'error',   iconType: 'close', action: 'cancelled', onClick: () => handleChangeStatus('cancelled') },
    },
    Rejeitada:  {
      primary:   { label: 'Reativar',  colorKey: 'warning', iconType: 'check', action: 'pending',   onClick: () => handleChangeStatus('pending')   },
    },
    Cancelada:  {
      primary:   { label: 'Reativar',  colorKey: 'warning', iconType: 'check', action: 'pending',   onClick: () => handleChangeStatus('pending')   },
    },
    Concluída:  {},
  }

  const btnCfg = BUTTONS_BY_STATUS[appointment.status]

  const disablePrimary =
    appointment.status === "Confirmada" &&
    btnCfg.primary?.label === "Concluir" &&
    isBeforeStart;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.paper", py: 6 }}>
      <Container maxWidth="xl">
        {/* Banner ---------------------------------------------------- */}
        <Paper
          sx={{ bgcolor: "primary.main", color: "white", overflow: "hidden" }}
          elevation={0}
        >
          <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {/*  ESQUERDA  */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={() => router.back()}
                sx={{ color: 'white', bgcolor: alpha('#fff', 0.1) }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" fontWeight={700}>
                {appointment.specialty} – {formatDate(appointment.date)}
              </Typography>
            </Box>

            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              {btnCfg.primary && (
                <ActionButton
                  {...btnCfg.primary}
                  disabled={disablePrimary}
                  onClick={() => handleChangeStatus(btnCfg.primary!.action)}
                />
              )}
              {btnCfg.secondary && (
                <ActionButton
                  {...btnCfg.secondary}
                  onClick={() => handleChangeStatus(btnCfg.secondary!.action)}
                />
              )}
            </Box>
          </Box>
          </CardContent>
        </Paper>

        {/* Body ------------------------------------------------------ */}
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={4}>
            {/* Patient ------------------------------------------------ */}
            <Grid item xs={12} md={4}>
              <InfoCard>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Avatar
                      src={appointment.patientAvatar}
                      sx={{
                        width: 80,
                        height: 80,
                        fontSize: "1.5rem",
                        mb: 2,
                        border: `3px solid ${alpha(
                          theme.palette.primary.main,
                          0.1,
                        )}`,
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
                        icon={
                          <AssignmentIndIcon sx={{ color: "warning.main" }} />
                        }
                        label="CPF"
                        value={appointment.patientCpf}
                        iconBgColor={alpha(theme.palette.warning.main, 0.1)}
                      />
                    )}
                  </Stack>
                </CardContent>
              </InfoCard>
            </Grid>

            {/* Details ------------------------------------------------ */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                {/* Consulta ------------------------------------------ */}
                <Grid item xs={12}>
                  <InfoCard>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={700} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Detalhes da Consulta
                        <StyledBadge label={appointment.status} badgeType={appointment.status} />
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <InfoRow
                            icon={
                              <MedicalServicesIcon
                                sx={{ color: "primary.main" }}
                              />
                            }
                            label="Especialidade"
                            value={appointment.specialty}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoRow
                            icon={
                              <CalendarMonthIcon
                                sx={{ color: "success.main" }}
                              />
                            }
                            label="Data e Hora"
                            value={`${formatDate(appointment.date)} às ${
                              appointment.time
                            }`}
                            iconBgColor={alpha(
                              theme.palette.success.main,
                              0.1,
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoRow
                            icon={<LocationOnIcon sx={{ color: "warning.main" }} />}
                            label="Local"
                            value={appointment.location}
                            iconBgColor={alpha(
                              theme.palette.warning.main,
                              0.1,
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoRow
                            icon={<AccessTimeIcon sx={{ color: "info.main" }} />}
                            label="Sala"
                            value={appointment.room}
                            iconBgColor={alpha(
                              theme.palette.info.main,
                              0.1,
                            )}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </InfoCard>
                </Grid>

                {/* Intern ------------------------------------------- */}
                <Grid item xs={12}>
                  <InfoCard sx={{ position: "relative" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={700} mb={3}>
                        Estagiário Designado
                      </Typography>

                      {/* Botão fixo para adicionar / trocar estagiário */}
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

                {/* Description --------------------------------------- */}
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
        </Box>
      </Container>

      {/* FAB (mobile) ---------------------------------------------- */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 24, right: 24 }}
          onClick={() => setAssignDialogOpen(true)}
        >
          <PersonAddIcon />
        </Fab>
      )}

      {/* Dialog ----------------------------------------------------- */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Designar Estagiário
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Selecione um estagiário para esta consulta
          </Typography>
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
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {getInitials(i.name)}
                  </Avatar>
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
  )
}

export default AppointmentDetail
