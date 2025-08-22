"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Box,
  Button,
  Container,
  Typography,
  IconButton,
  Avatar,
  Grid,
  useTheme,
  Menu,
  MenuItem,
  LinearProgress,
  CircularProgress,
} from "@mui/material"
import { alpha } from "@mui/material/styles"

// Icons
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import EventNoteIcon from "@mui/icons-material/EventNote"
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import PsychologyIcon from "@mui/icons-material/Psychology"
import MedicalServicesIcon from "@mui/icons-material/MedicalServices"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import VisibilityIcon from "@mui/icons-material/Visibility"
import EditIcon from "@mui/icons-material/Edit"

import { fetchInterns } from "@/app/lib/api/interns"
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress"
import { StatCard } from "@/app/components/ui/StatCard"
import { DataTable, StyledBadge, IconContainer } from "@/app/components/DataTable"
import type { Intern } from "@/app/types"

const internHeaders = [
  { id: "name",                  label: "Estagiário"          },
  { id: "specialty",             label: "Especialidade"       },
  { id: "appointmentsCompleted", label: "Consultas Realizadas"},
  { id: "appointmentsScheduled", label: "Consultas Agendadas" },
  // { id: "performance",           label: "Performance"         },
  { id: "status",                label: "Status"              },
]

// helper p/ specialty → ícone
const specialtyIcon = (s: string) => {
  switch (s) {
    case "Nutrição":     return <RestaurantIcon fontSize="small" />
    case "Psicologia":   return <PsychologyIcon fontSize="small" />
    case "Odontologia": return <MedicalServicesIcon fontSize="small" />
    default:             return null
  }
}

const renderInternCell = (intern: Intern, headerId: string) => {
  switch (headerId) {
    case "name":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={intern.avatar ?? undefined} sx={{ width: 32, height: 32 }}>
            {intern.name[0]}
          </Avatar>
          <Typography fontWeight={500}>{intern.name}</Typography>
        </Box>
      )
    case "specialty":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconContainer sx={{ color: "primary.main" }}>
            {specialtyIcon(intern.specialty)}
          </IconContainer>
          {intern.specialty}
        </Box>
      )
    case "appointmentsCompleted":
      return intern.appointmentsCompleted
    case "appointmentsScheduled":
      return intern.appointmentsScheduled
    // case "performance":
    //   return (
    //     <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: 100 }}>
    //       <LinearProgress variant="determinate" value={intern.performance} sx={{ flexGrow: 1, height: 6, borderRadius: 3 }} />
    //       <Typography variant="caption" fontWeight={500}>{intern.performance}%</Typography>
    //     </Box>
    //   )
    case "status":
      const badgeType = intern.status === "Ativo" ? "Confirmada" : "Pendente"
      return <StyledBadge label={intern.status} badgeType={badgeType} />
    default:
      return null
  }
}

export default function InternManagementScreen() {
  const theme            = useTheme()
  const pushWithProgress = usePushWithProgress()

  // paginação
  const [page,        setPage]        = useState(0)   // ZERO-based
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // dados
  const [interns,     setInterns]     = useState<Intern[]>([])
  const [totalCount,  setTotalCount]  = useState(0)

  // estados auxiliares
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  // menu de ações
  const [anchorEl,        setAnchorEl]   = useState<null | HTMLElement>(null)
  const [selectedIntern,  setSelectedIntern] = useState<Intern | null>(null)

  const loadInterns = useCallback(async () => {
    setLoading(true);
    try {
      const { data, meta } = await fetchInterns(page + 1, rowsPerPage);
      setInterns(data);
      setTotalCount(meta.pagination.totalCount);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    loadInterns()
  }, [loadInterns])

  // KPIs
  const activeInterns              = interns.filter((i) => i.status === "Ativo").length
  const totalAppointmentsCompleted = interns.reduce((sum, i) => sum + i.appointmentsCompleted, 0)
  const totalAppointmentsScheduled = interns.reduce((sum, i) => sum + i.appointmentsScheduled, 0)
  const averageAppointments        = activeInterns ? Math.round(totalAppointmentsCompleted / activeInterns) : 0
  const occupancyRate              = activeInterns ? Math.round((totalAppointmentsScheduled / (activeInterns * 10)) * 100) : 0

  // handlers tabela
  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage)
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  // menu ações
  const handleMenuClick = (e: React.MouseEvent<HTMLElement>, intern: Intern) => {
    setAnchorEl(e.currentTarget)
    setSelectedIntern(intern)
  }
  const handleMenuClose   = () => { setAnchorEl(null); setSelectedIntern(null) }
  const handleViewDetails = () => {
    if (selectedIntern) pushWithProgress(`/gestor/estagiarios/${selectedIntern.id}`)
    handleMenuClose()
  }
  const handleEditIntern  = () => {
    if (selectedIntern) pushWithProgress(`/gestor/estagiarios/editar/${selectedIntern.id}`)
    handleMenuClose()
  }

  const internActions = (intern: Intern) => (
    <IconButton size="small" onClick={(e) => handleMenuClick(e, intern)} sx={{ color: "text.secondary" }}>
      <MoreHorizIcon fontSize="small" />
    </IconButton>
  )

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Gestão de Estagiários</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => pushWithProgress("gestao-de-estagiarios/cadastro")}
        >
          Cadastrar Estagiário
        </Button>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Estagiários Ativos"
            value={activeInterns}
            subtitle="Total de estagiários ativos"
            icon={<PeopleAltIcon sx={{ color: theme.palette.primary.main }} />}
            iconBgColor={alpha(theme.palette.primary.main, 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Consultas Realizadas"
            value={totalAppointmentsCompleted}
            subtitle="Total de consultas concluídas"
            icon={<AssignmentTurnedInIcon sx={{ color: theme.palette.primary.main }} />}
            iconBgColor={alpha(theme.palette.primary.main, 0.1)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Média por Estagiário"
            value={averageAppointments}
            subtitle="Média de consultas por estagiário ativo"
            icon={<TrendingUpIcon sx={{ color: theme.palette.success.main }} />}
            iconBgColor={alpha(theme.palette.success.main, 0.1)}
          />
        </Grid>
        {/* <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Taxa de Ocupação"
            value={`${occupancyRate}%`}
            subtitle="Porcentagem de capacidade utilizada"
            icon={<EventNoteIcon sx={{ color: theme.palette.success.main }} />}
            iconBgColor={alpha(theme.palette.success.main, 0.1)}
            trendComponent={
              <LinearProgress
                variant="determinate"
                value={occupancyRate}
                sx={{
                  mt: 1,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.success.main, 0.2),
                  "& .MuiLinearProgress-bar": { bgcolor: theme.palette.success.main },
                }}
              />
            }
          />
        </Grid> */}
      </Grid>

      {/* Tabela */}
      {error && <Typography color="error" mb={2}>{error}</Typography>}
      <DataTable<Intern>
        title="Gestão de Estagiários"
        subtitle="Acompanhe o desempenho e atividades dos estagiários"
        headers={internHeaders}
        data={interns}
        renderCell={renderInternCell}
        rowKeyExtractor={(i) => i.id}
        actionsColumnLabel="Ações"
        actions={internActions}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage={loading ? "Carregando..." : "Nenhum estagiário encontrado."}
      />

      {/* loading overlay quando DataTable não suporta isLoading */}
      {loading && <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", mt: "-20px", ml: "-20px" }} />}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right",  vertical: "top" }}
        anchorOrigin={{   horizontal: "right",  vertical: "bottom" }}
      >
        <MenuItem onClick={handleViewDetails}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Ver detalhes
        </MenuItem>
        <MenuItem onClick={handleEditIntern}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
      </Menu>
    </Container>
  )
}
