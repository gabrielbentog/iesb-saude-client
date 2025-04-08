"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Tabs,
  Tab,
  useMediaQuery,
  Chip,
} from "@mui/material";
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";
import { useTheme } from "@mui/material/styles";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

export default function PatientDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pushWithProgress = usePushWithProgress();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.mode === "dark" ? "#111" : "#fafafa",
        color: theme.palette.text.primary,
        px: { xs: 2, md: 6 },
        py: { xs: 4, md: 6 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 5,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Olá, João Paulo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Terça-feira, 19 de Março
          </Typography>
        </Box>

        {/* Botão principal */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => pushWithProgress("/paciente/agendamento")}
          sx={{
            textTransform: "none",
            borderRadius: "999px",
            px: 4,
            py: 1.2,
            fontWeight: 600,
            boxShadow: theme.shadows[3],
            transition: "transform 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: theme.shadows[5],
            },
          }}
        >
          Agendar Consulta
        </Button>
      </Box>

      {/* Seção de cartões (usando Box + CSS Grid) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 4,
        }}
      >
        {/* Card 1 - Próxima Consulta */}
        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${
              theme.palette.background.paper
            } 0%, ${
              theme.palette.mode === "dark" ? "#2B2B2B" : "#f3f3f3"
            } 100%)`,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[1],
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <LocalHospitalIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Próxima Consulta
            </Typography>
            <Chip
              label="Confirmada"
              color="success"
              size="small"
              sx={{ ml: "auto", fontWeight: 500 }}
            />
          </Box>

          <Typography variant="body1" fontWeight={500}>
            Clínica Mais Saúde
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Avenida Paulista, 1234 • São Paulo
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2">Hoje às 14:00</Typography>
            <Chip
              label="4h restantes"
              size="small"
              sx={{
                ml: "auto",
                bgcolor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
                fontWeight: 500,
              }}
            />
          </Box>
        </Card>

        {/* Card 2 - Acesso Rápido */}
        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${
              theme.palette.background.paper
            } 0%, ${
              theme.palette.mode === "dark" ? "#2B2B2B" : "#f3f3f3"
            } 100%)`,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[1],
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CalendarMonthIcon fontSize="small" color="secondary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Acesso Rápido
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Visualize e gerencie suas consultas através do calendário interativo.
            </Typography>
          </Box>

          <Button
            startIcon={<CalendarMonthIcon fontSize="small" />}
            variant="text"
            sx={{
              mt: 3,
              textTransform: "none",
              fontWeight: 500,
              alignSelf: "flex-start",
              px: 0,
              color: theme.palette.secondary.main,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Ver Calendário
          </Button>
        </Card>
      </Box>

      {/* Seção de Tabs */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Consultas
        </Typography>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            mb: 2,
            ".MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
              px: 2,
            },
          }}
        >
          <Tab label="Próximas" />
          <Tab label="Histórico" />
        </Tabs>

        <Box sx={{ py: 2 }}>
          {tabValue === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Você tem 1 consulta agendada para hoje.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhum histórico encontrado.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Floating Button (Mobile) */}
      {isMobile && (
        <Button
          variant="contained"
          color="primary"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            borderRadius: "999px",
            px: 4,
            py: 1.25,
            textTransform: "none",
            fontWeight: 500,
            boxShadow: theme.shadows[4],
            transition: "transform 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: theme.shadows[6],
            },
          }}
        >
          Agendar
        </Button>
      )}
    </Box>
  );
}
