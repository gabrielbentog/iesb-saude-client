"use client"

import React, { useState, useMemo } from "react"
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Avatar,
  Tooltip,
  useMediaQuery,
  Menu,
  MenuItem,
  IconButton,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  TablePagination,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { motion } from "framer-motion"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import DataTable from "@/app/components/DataTable"

interface Appointment {
  id: string
  specialty: string
  professional: string
  date: string
  time: string
  location: string
  status: "Confirmada" | "Pendente" | "Realizada"
}

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
]

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

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

const ConsultasScreen: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [statusFilter, setStatusFilter] = useState("Todos")

  // Menu & Modal
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setSelectedId(id)
    setMenuAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => setMenuAnchorEl(null)

  const handleCancel = () => {
    setOpenDialog(true)
    handleCloseMenu()
  }

  const confirmCancel = () => {
    console.log("Consulta cancelada:", selectedId)
    setOpenDialog(false)
  }

  const filteredAppointments = useMemo(() => {
    return statusFilter === "Todos"
      ? appointments
      : appointments.filter((a) => a.status === statusFilter)
  }, [statusFilter])

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage
    return filteredAppointments.slice(start, start + rowsPerPage)
  }, [page, rowsPerPage, filteredAppointments])

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const columns = [
    { label: "Especialidade", accessor: "specialty" as keyof Appointment },
    {
      label: "Profissional",
      render: (a: Appointment) => (
        <Box display="flex" gap={1} alignItems="center">
          {a.professional}
        </Box>
      ),
    },
    { label: "Data", accessor: "date" as keyof Appointment },
    { label: "Horário", accessor: "time" as keyof Appointment },
    {
      label: "Local",
      render: (a: Appointment) => (
        <Tooltip title={a.location}>
          <Typography noWrap sx={{ maxWidth: 150 }}>{a.location}</Typography>
        </Tooltip>
      ),
    },
    {
      label: "Status",
      render: (a: Appointment) => (
        <Chip label={a.status} color={getStatusColor(a.status)} size="small" />
      ),
    },
  ]

  const renderDesktopTable = () => (
    <>
      <DataTable
        data={paginatedData}
        columns={columns}
        actions={(row: Appointment) => (
          <IconButton onClick={(e) => handleOpenMenu(e, row.id)}>
            <MoreVertIcon />
          </IconButton>
        )}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredAppointments.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => console.log("Ver detalhes:", selectedId)}>Ver Detalhes</MenuItem>
        <MenuItem onClick={() => console.log("Reagendar:", selectedId)}>Reagendar</MenuItem>
        <MenuItem onClick={handleCancel}>Cancelar</MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Cancelar Consulta</DialogTitle>
        <DialogContent>
          <Typography>Deseja realmente cancelar esta consulta?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Não</Button>
          <Button onClick={confirmCancel} color="error" variant="contained">Sim, Cancelar</Button>
        </DialogActions>
      </Dialog>
    </>
  )

  const renderMobileCards = () => (
    <Box>
      {paginatedData.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Paper elevation={0} sx={{ mb: 2, p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box display="flex" gap={1} alignItems="center">
                <Avatar>{getInitials(a.professional)}</Avatar>
                <Box>
                  <Typography fontWeight={600}>{a.specialty}</Typography>
                  <Typography variant="body2" color="text.secondary">{a.professional}</Typography>
                </Box>
              </Box>
              <Chip label={a.status} color={getStatusColor(a.status)} size="small" />
            </Box>

            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <CalendarTodayOutlinedIcon fontSize="small" />
              <Typography variant="body2">{a.date}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <AccessTimeOutlinedIcon fontSize="small" />
              <Typography variant="body2">{a.time}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOnOutlinedIcon fontSize="small" />
              <Typography variant="body2" noWrap sx={{ maxWidth: "80%" }}>
                {a.location}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <IconButton onClick={(e) => handleOpenMenu(e, a.id)}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Paper>
        </motion.div>
      ))}

      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={filteredAppointments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10))
          setPage(0)
        }}
        sx={{ justifyContent: "center", display: "flex" }}
      />
    </Box>
  )

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: "100vh", py: 6, px: { xs: 2, md: 8 } }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700} sx={{
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
          }}>
            Minhas Consultas
          </Typography>

          <Button variant="outlined" sx={{ borderRadius: "8px" }}>
            Nova Consulta
          </Button>
        </Box>

        <Box mb={4} maxWidth={200}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              native
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(0)
              }}
            >
              <option value="Todos">Todos</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Pendente">Pendente</option>
              <option value="Realizada">Realizada</option>
            </Select>
          </FormControl>
        </Box>

        {isMobile ? renderMobileCards() : renderDesktopTable()}
      </Box>
    </Box>
  )
}

export default ConsultasScreen
