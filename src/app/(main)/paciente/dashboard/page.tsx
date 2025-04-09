"use client"

import React from "react"
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
  Container
} from "@mui/material"
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress"
import { useTheme } from "@mui/material/styles"

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import VideocamIcon from "@mui/icons-material/Videocam"
import DescriptionIcon from "@mui/icons-material/Description"
import EventAvailableIcon from "@mui/icons-material/EventAvailable"
import HistoryIcon from "@mui/icons-material/History"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import PsychologyIcon from "@mui/icons-material/Psychology"
import RestaurantIcon from "@mui/icons-material/Restaurant"

export default function PatientDashboard() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const pushWithProgress = usePushWithProgress()

  // Mock data for upcoming appointments
  const upcomingAppointments = [
    {
      id: 1,
      specialty: "Nutrição",
      professional: "Dra. Ana Silva",
      location: "Clínica Mais Saúde - Bloco B",
      address: "Avenida Paulista, 1234 • São Paulo",
      date: "Hoje",
      time: "14:00",
      remainingTime: "4h restantes",
      status: "Confirmada",
      isOnline: false,
      icon: <RestaurantIcon />,
    },
    {
      id: 2,
      specialty: "Psicologia",
      professional: "Dr. Carlos Mendes",
      location: "Atendimento Online",
      address: "Link disponível 15 minutos antes",
      date: "Amanhã",
      time: "10:30",
      remainingTime: "1d restante",
      status: "Agendada",
      isOnline: true,
      icon: <PsychologyIcon />,
    },
  ]

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
              Bem-vindo à Plataforma!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, maxWidth: "80%" }}>
              Acesse consultas gratuitas com estagiários de nutrição, psicologia e outras especialidades.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => pushWithProgress("/paciente/agendamento")}
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
              endIcon={<ArrowForwardIcon />}
            >
              Agendar Nova Consulta
            </Button>
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
              onClick={() => pushWithProgress("/paciente/agendamento")}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.light,
                  mb: 1,
                  width: 50,
                  height: 50,
                }}
              >
                <EventAvailableIcon />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={600}>
                Agendar Consulta
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
              onClick={() => pushWithProgress("/paciente/calendario")}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.secondary.light,
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
              onClick={() => pushWithProgress("/paciente/historico")}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.info.light,
                  mb: 1,
                  width: 50,
                  height: 50,
                }}
              >
                <HistoryIcon />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={600}>
                Histórico
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
              onClick={() => pushWithProgress("/paciente/documentos")}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.warning.light,
                  mb: 1,
                  width: 50,
                  height: 50,
                }}
              >
                <DescriptionIcon />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={600}>
                Documentos
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Next Appointment Section */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Próxima Consulta
        </Typography>
        {upcomingAppointments.length > 0 && (
          <Card
            sx={{
              p: 0,
              borderRadius: 3,
              overflow: "hidden",
              mb: 4,
              boxShadow: theme.shadows[1],
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[3],
              },
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: theme.palette.primary.main,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", mr: 2 }}>{upcomingAppointments[0].icon}</Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {upcomingAppointments[0].specialty}
                  </Typography>
                  <Typography variant="body2">{upcomingAppointments[0].professional}</Typography>
                </Box>
              </Box>
              <Chip
                label={upcomingAppointments[0].status}
                color="success"
                size="small"
                sx={{ fontWeight: 500, bgcolor: "rgba(255,255,255,0.2)" }}
              />
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                    <LocationOnIcon fontSize="small" color="action" sx={{ mt: 0.5, mr: 1 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {upcomingAppointments[0].location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {upcomingAppointments[0].address}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                    <AccessTimeIcon fontSize="small" color="action" sx={{ mt: 0.5, mr: 1 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {upcomingAppointments[0].date} às {upcomingAppointments[0].time}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        {upcomingAppointments[0].remainingTime}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                {upcomingAppointments[0].isOnline ? (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<VideocamIcon />}
                    sx={{ textTransform: "none", mr: 2 }}
                  >
                    Entrar na Consulta
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<LocationOnIcon />}
                    sx={{ textTransform: "none", mr: 2 }}
                  >
                    Ver no Mapa
                  </Button>
                )}
                <Button variant="contained" color="primary" sx={{ textTransform: "none" }}>
                  Detalhes
                </Button>
              </Box>
            </Box>
          </Card>
        )}
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
            boxShadow: theme.shadows[4],
            zIndex: 1000,
          }}
          startIcon={<EventAvailableIcon />}
        >
          Agendar Consulta
        </Button>
      )}
    </Box>
  )
}
