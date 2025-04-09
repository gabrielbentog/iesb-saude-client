"use client";

import React from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

const DetalheConsultaScreen: React.FC = () => {
  const theme = useTheme();

  const appointment = {
    id: "3",
    specialty: "Cardiologia",
    professional: "Dr. Carlos Mendes",
    date: "02/03/2025",
    time: "11:00",
    location: "Hospital Vida - Sala 5",
    status: "Realizada",
    notes: "Consulta realizada com sucesso. Nenhuma intercorrência. Recomendado check-up anual.",
  };

  const goBack = () => {
    // Simular navegação de volta
    window.history.back();
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f7", minHeight: "100vh", py: 6, px: { xs: 2, md: 8 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={goBack} sx={{ mb: 3 }}>
        Voltar
      </Button>

      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              width: 56,
              height: 56,
              mr: 2,
            }}
          >
            <MedicalServicesIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {appointment.specialty}
            </Typography>
            <Typography color="text.secondary">com {appointment.professional}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Detalhes da Consulta
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Data: <strong>{appointment.date}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Horário: <strong>{appointment.time}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Local: <strong>{appointment.location}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Status: <strong>{appointment.status}</strong>
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Observações
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {appointment.notes}
        </Typography>
      </Paper>
    </Box>
  );
};

export default DetalheConsultaScreen;