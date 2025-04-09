"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  Button,
  Avatar,
  Tooltip,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"

// Tipagem de uma consulta
interface Appointment {
  id: string
  specialty: string
  professional: string
  date: string // ex: "10/04/2025"
  time: string // ex: "14:00"
  location: string
  status: "Confirmada" | "Pendente" | "Realizada"
}

// Exemplo de lista única (contém consultas futuras e passadas)
const appointments: Appointment[] = [
  {
    id: "1",
    specialty: "Clínico Geral",
    professional: "Dr. João Silva",
    date: "10/04/2025",
    time: "14:00",
    location: "Clínica Central - Sala 3",
    status: "Confirmada",
  },
  {
    id: "2",
    specialty: "Dermatologia",
    professional: "Dra. Ana Costa",
    date: "12/04/2025",
    time: "09:30",
    location: "Policlínica Sul - Sala 2",
    status: "Pendente",
  },
  {
    id: "3",
    specialty: "Cardiologia",
    professional: "Dr. Carlos Mendes",
    date: "02/03/2025",
    time: "11:00",
    location: "Hospital Vida - Sala 5",
    status: "Realizada",
  },
  {
    id: "4",
    specialty: "Oftalmologia",
    professional: "Dr. Lucas Andrade",
    date: "20/04/2025",
    time: "13:00",
    location: "Clínica Oeste - Sala 8",
    status: "Confirmada",
  },
  {
    id: "5",
    specialty: "Ortopedia",
    professional: "Dra. Fernanda Lima",
    date: "18/02/2025",
    time: "15:30",
    location: "OrtoClínica - Sala 1",
    status: "Realizada",
  },
  // Adicione quantas quiser para testar a paginação
]

// Definir cor do Chip baseado no status
const getStatusColor = (status: Appointment["status"]) => {
  switch (status) {
    case "Confirmada":
      return "success"
    case "Pendente":
      return "warning"
    case "Realizada":
      return "info"
    default:
      return "default"
  }
}

// Definir cor de fundo baseado no status (para cards mobile)
const getStatusBgColor = (status: Appointment["status"], theme: import("@mui/material/styles").Theme) => {
  switch (status) {
    case "Confirmada":
      return theme.palette.success.light
    case "Pendente":
      return theme.palette.warning.light
    case "Realizada":
      return theme.palette.info.light
    default:
      return theme.palette.grey[100]
  }
}

// Criar iniciais do profissional para o Avatar
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

// Função para simular navegação
const pushWithProgress = (url: string) => {
  console.log("Navegando para:", url)
}

const ConsultasScreen: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Estados para paginação
  const [page, setPage] = useState(0) // MUI TablePagination trabalha com base 0
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // Lida com mudança de página
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  // Lida com mudança de número de itens por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Calcular dados para paginação
  const startIndex = page * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedData = appointments.slice(startIndex, endIndex)

  // Renderiza a versão desktop (tabela)
  const renderDesktopTable = () => (
    <Paper
      elevation={0}
      sx={{
        overflow: "hidden",
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Especialidade</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Profissional</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Data</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Horário</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Local</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((appointment, index) => (
              <TableRow
                key={appointment.id}
                hover
                sx={{
                  "&:last-child td": { border: 0 },
                  backgroundColor: index % 2 === 0 ? "rgba(0, 0, 0, 0.02)" : "white",
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {appointment.specialty}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      {getInitials(appointment.professional)}
                    </Avatar>
                    <Typography variant="body2">{appointment.professional}</Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarTodayOutlinedIcon fontSize="small" color="action" />
                    <Typography variant="body2">{appointment.date}</Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AccessTimeOutlinedIcon fontSize="small" color="action" />
                    <Typography variant="body2">{appointment.time}</Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Tooltip title={appointment.location} arrow>
                    <Box display="flex" alignItems="center" gap={0.5} sx={{ maxWidth: 180 }}>
                      <LocationOnOutlinedIcon fontSize="small" color="action" />
                      <Typography variant="body2" noWrap>
                        {appointment.location}
                      </Typography>
                    </Box>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <Chip
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                    size="small"
                    sx={{
                      fontWeight: 500,
                      borderRadius: "6px",
                      px: 0.5,
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => pushWithProgress(`/detalhes/${appointment.id}`)}
                    sx={{
                      borderRadius: "8px",
                      textTransform: "none",
                      boxShadow: "none",
                      "&:hover": {
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {/* Caso não existam dados */}
            {appointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhuma consulta encontrada.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação no canto inferior direito */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={appointments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        labelRowsPerPage="Itens por página:"
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ display: "flex", justifyContent: "flex-end" }}
      />
    </Paper>
  )

  // Renderiza a versão mobile (cards)
  const renderMobileCards = () => (
    <Box>
      {paginatedData.map((appointment) => (
        <Card
          key={appointment.id}
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid rgba(0,0,0,0.05)",
            position: "relative",
            overflow: "visible",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "6px",
              height: "100%",
              backgroundColor: getStatusBgColor(appointment.status, theme),
              borderTopLeftRadius: "12px",
              borderBottomLeftRadius: "12px",
            },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  {getInitials(appointment.professional)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {appointment.specialty}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.professional}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={appointment.status}
                color={getStatusColor(appointment.status)}
                size="small"
                sx={{
                  fontWeight: 500,
                  borderRadius: "6px",
                  px: 0.5,
                }}
              />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarTodayOutlinedIcon fontSize="small" color="action" />
                  <Typography variant="body2">{appointment.date}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTimeOutlinedIcon fontSize="small" color="action" />
                  <Typography variant="body2">{appointment.time}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOnOutlinedIcon fontSize="small" color="action" />
                  <Typography variant="body2" noWrap>
                    {appointment.location}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              fullWidth
              onClick={() => pushWithProgress(`/detalhes/${appointment.id}`)}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                },
              }}
            >
              Ver Detalhes
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Caso não existam dados */}
      {appointments.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            backgroundColor: "white",
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Nenhuma consulta encontrada.
          </Typography>
        </Box>
      )}

      {/* Paginação centralizada para mobile */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={appointments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        labelRowsPerPage="Itens:"
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ display: "flex", justifyContent: "center" }}
      />
    </Box>
  )

  return (
    <Box
      sx={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        py: 6,
        px: { xs: 2, md: 8 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: 0,
                width: 40,
                height: 4,
                backgroundColor: theme.palette.primary.main,
                borderRadius: 2,
              },
            }}
          >
            Minhas Consultas
          </Typography>

          <Button
            variant="outlined"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
            }}
          >
            Nova Consulta
          </Button>
        </Box>

        {isMobile ? renderMobileCards() : renderDesktopTable()}
      </Box>
    </Box>
  )
}

export default ConsultasScreen
