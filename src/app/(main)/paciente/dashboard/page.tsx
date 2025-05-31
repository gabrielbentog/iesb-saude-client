"use client";

import React from "react";
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
  Stack,
} from "@mui/material";
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";
import { useTheme } from "@mui/material/styles";

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VideocamIcon from "@mui/icons-material/Videocam";
import DescriptionIcon from "@mui/icons-material/Description";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HistoryIcon from "@mui/icons-material/History";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PsychologyIcon from "@mui/icons-material/Psychology";
import RestaurantIcon from "@mui/icons-material/Restaurant";

export default function PatientDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pushWithProgress = usePushWithProgress();

  // Mock data for upcoming appointments
  const upcomingAppointments = [
    {
      id: 1,
      specialty: "Nutrição",
      professional: "Dra. Ana Silva",
      location: "Clínica Mais Saúde - Bloco B",
      address: "Av. Paulista, 1234 • São Paulo",
      date: "Hoje",
      time: "14:00",
      remainingTime: "4h restantes",
      status: "Confirmada",
      isOnline: false,
      icon: <RestaurantIcon fontSize="medium" />,
    },
    {
      id: 2,
      specialty: "Psicologia",
      professional: "Dr. Carlos Mendes",
      location: "Atendimento Online",
      address: "Link disponível 15 min antes",
      date: "Amanhã",
      time: "10:30",
      remainingTime: "1d restante",
      status: "Agendada",
      isOnline: true,
      icon: <PsychologyIcon fontSize="medium" />,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        {/* Header Welcome */}
        {/* <Box mb={5}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Bem-vindo à Plataforma!
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            maxWidth={480}
            mb={3}
            lineHeight={1.6}
          >
            Acesse consultas gratuitas com estagiários de nutrição, psicologia e outras especialidades.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => pushWithProgress("/paciente/agendamento")}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 4,
              fontWeight: 600,
              boxShadow: theme.shadows[3],
            }}
            endIcon={<ArrowForwardIcon />}
          >
            Agendar Nova Consulta
          </Button>
        </Box> */}

        {/* Próximas Consultas */}
        <Typography variant="h6" fontWeight={700} mb={3}>
          Próximas Consultas
        </Typography>

        {upcomingAppointments.length === 0 && (
          <Typography color="text.secondary">Nenhuma consulta agendada.</Typography>
        )}

        <Grid container spacing={3} mb={5}>
          {upcomingAppointments.map((appointment) => (
            <Grid key={appointment.id} item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 1,
                  boxShadow: theme.shadows[1],
                  transition: "box-shadow 0.3s ease, transform 0.3s ease",
                  "&:hover": {
                    boxShadow: theme.shadows[4],
                    transform: "translateY(-4px)",
                  },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: theme.palette.primary.main,
                    color: "common.white",
                    px: 3,
                    py: 2,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      mr: 2,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {appointment.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {appointment.specialty}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {appointment.professional}
                    </Typography>
                  </Box>
                  <Chip
                    label={appointment.status}
                    color={appointment.status === "Confirmada" ? "success" : "warning"}
                    size="small"
                    sx={{
                      ml: "auto",
                      fontWeight: 600,
                      bgcolor: "rgba(255,255,255,0.25)",
                      color: "common.white",
                    }}
                  />
                </Box>

                {/* Body */}
                <Box sx={{ p: 3, flexGrow: 1 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LocationOnIcon color="action" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {appointment.location}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {appointment.address}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {appointment.date} às {appointment.time}
                        </Typography>
                        <Typography variant="caption" color="primary" fontWeight={600}>
                          {appointment.remainingTime}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>

                {/* Footer */}
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  {appointment.isOnline ? (
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<VideocamIcon />}
                      sx={{ textTransform: "none" }}
                    >
                      Entrar na Consulta
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<LocationOnIcon />}
                      sx={{ textTransform: "none" }}
                    >
                      Ver no Mapa
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ textTransform: "none" }}
                  >
                    Detalhes
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Acesso Rápido */}
        <Typography variant="h6" fontWeight={700} mb={3}>
          Acesso Rápido
        </Typography>
        <Grid container spacing={3}>
          {[{
            label: "Agendar Consulta",
            icon: <EventAvailableIcon />,
            color: "primary",
            href: "/paciente/agendamento",
          },{
            label: "Calendário",
            icon: <CalendarMonthIcon />,
            color: "secondary",
            href: "/paciente/calendario",
          },{
            label: "Histórico",
            icon: <HistoryIcon />,
            color: "info",
            href: "/paciente/historico",
          },{
            label: "Documentos",
            icon: <DescriptionIcon />,
            color: "warning",
            href: "/paciente/documentos",
          }].map(({ label, icon, color, href }) => (
            <Grid key={label} item xs={6} sm={3}>
              <Card
                onClick={() => pushWithProgress(href)}
                sx={{
                  p: 2,
                  height: 120,
                  borderRadius: 3,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: theme.shadows[6],
                  },
                }}
                elevation={3}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette[color].light,
                    mb: 1,
                    width: 56,
                    height: 56,
                  }}
                >
                  {icon}
                </Avatar>
                <Typography variant="subtitle1" fontWeight={700}>
                  {label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Floating Button (Mobile) */}
      {isMobile && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => pushWithProgress("/paciente/agendamento")}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            borderRadius: "999px",
            px: 3,
            py: 1.5,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: theme.shadows[5],
            zIndex: 1500,
          }}
          startIcon={<EventAvailableIcon />}
        >
          Agendar Consulta
        </Button>
      )}
    </Box>
  );
}
