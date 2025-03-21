"use client"

import React, { useState, useEffect } from "react"
import { styled, useTheme } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import LinearProgress from "@mui/material/LinearProgress"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import useMediaQuery from "@mui/material/useMediaQuery"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"

const drawerWidth = 240

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}))

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}))

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

export default function PatientDashboard() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [open, setOpen] = useState(!isMobile)
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    setOpen(!isMobile)
  }, [isMobile])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: theme.palette.background.default }}>
      <Main open={open && !isMobile}>
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Olá, João Paulo
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Terça-feira, 19 de Março • Bem-vindo ao seu painel de saúde
                </Typography>
              </Box>
              <Button variant="contained" sx={{ display: { xs: "none", md: "flex" } }}>
                Agendar Consulta
              </Button>
            </Box>

            {/* Card de Próxima Consulta */}
            <Card
              sx={{
                mb: 4,
                background: `linear-gradient(to right bottom, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                color: "white",
              }}
            >
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                      Próxima Consulta
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                      Sua consulta está agendada para hoje
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                      display: { xs: "none", md: "flex" },
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: 200,
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "50%",
                          border: "4px dashed rgba(255,255,255,0.3)",
                        }}
                      />
                      <Box
                        sx={{
                          width: 150,
                          height: 150,
                          borderRadius: "50%",
                          bgcolor: "rgba(255,255,255,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column",
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold">
                          4h
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          restantes
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Abas de Agendamento */}
            <Box sx={{ width: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="appointment tabs"
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                  <Tab label="Próximas Consultas" {...a11yProps(0)} />
                  <Tab label="Histórico" {...a11yProps(1)} />
                </Tabs>
                <Button
                  variant="outlined"
                  startIcon={<CalendarMonthIcon />}
                  size="small"
                  sx={{ display: { xs: "none", md: "flex" } }}
                >
                  Ver Calendário
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Main>
      {/* Botão para mobile */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Button variant="contained" sx={{ position: "fixed", bottom: 16, right: 16 }}>
          Agendar Consulta
        </Button>
      </Box>
    </Box>
  )
}
