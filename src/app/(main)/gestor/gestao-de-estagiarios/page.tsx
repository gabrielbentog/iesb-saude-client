"use client"

import type React from "react"
import { useState } from "react"
import { Box, Button, Container, Typography, Paper, IconButton, Avatar, Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import DataTable from "@/app/components/DataTable/DataTable"
import type { Column, Intern } from "@/app/components/DataTable/types"
import EditIcon from "@mui/icons-material/Edit"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import EventNoteIcon from "@mui/icons-material/EventNote"
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress"

// Componente de KPI Card
interface KpiCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description: string
  color: string
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, description, color }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          p: 1.5,
          borderRadius: "0 0 0 16px",
          bgcolor: `${color}.light`,
          color: `${color}.dark`,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: "auto" }}>
        {description}
      </Typography>
    </Paper>
  )
}

// Dados fictícios (mock) para os estagiários.
// Certifique-se de que o tipo Intern esteja definido com a propriedade `status` como "Ativo" | "Inativo".
const mockInterns: Intern[] = [
  {
    id: 1,
    name: "Ana Silva",
    specialty: "Nutrição",
    avatar: "",
    appointmentsCompleted: 32,
    appointmentsScheduled: 8,
    status: "Ativo",
    icon: <Avatar src="" />,
  },
  {
    id: 2,
    name: "Carlos Mendes",
    specialty: "Psicologia",
    avatar: "",
    appointmentsCompleted: 28,
    appointmentsScheduled: 6,
    status: "Inativo",
    icon: <Avatar src="" />,
  },
  {
    id: 3,
    name: "Juliana Costa",
    specialty: "Fisioterapia",
    avatar: "",
    appointmentsCompleted: 18,
    appointmentsScheduled: 4,
    status: "Ativo",
    icon: <Avatar src="" />,
  },
  {
    id: 4,
    name: "Pedro Santos",
    specialty: "Nutrição",
    avatar: "",
    appointmentsCompleted: 15,
    appointmentsScheduled: 5,
    status: "Inativo",
    icon: <Avatar src="" />,
  },
  {
    id: 5,
    name: "Mariana Lima",
    specialty: "Psicologia",
    avatar: "",
    appointmentsCompleted: 22,
    appointmentsScheduled: 7,
    status: "Ativo",
    icon: <Avatar src="" />,
  },
  {
    id: 6,
    name: "Gabriel Souza",
    specialty: "Fisioterapia",
    avatar: "",
    appointmentsCompleted: 19,
    appointmentsScheduled: 3,
    status: "Ativo",
    icon: <Avatar src="" />,
  },
]

// Definindo as colunas da tabela para exibir os dados do estagiário.
const internColumns: Column<Intern>[] = [
  {
    label: "Nome",
    render: (row) => (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Avatar src={row.avatar} sx={{ mr: 2, width: 32, height: 32 }} />
        {row.name}
      </Box>
    ),
  },
  {
    label: "Especialidade",
    render: (row) => <Box sx={{ display: "flex", alignItems: "center" }}>{row.specialty}</Box>,
  },
  {
    label: "Consultas Realizadas",
    accessor: "appointmentsCompleted",
  },
  {
    label: "Consultas Agendadas",
    accessor: "appointmentsScheduled",
  },
  {
    label: "Status",
    render: (row) => <Box>{row.status}</Box>,
  },
]

export default function InternManagementScreen() {
  const theme = useTheme()
  const pushWithProgress = usePushWithProgress()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // Cálculo dos KPIs
  const activeInterns = mockInterns.filter((intern) => intern.status === "Ativo").length
  const totalAppointmentsCompleted = mockInterns.reduce((sum, intern) => sum + intern.appointmentsCompleted, 0)
  const totalAppointmentsScheduled = mockInterns.reduce((sum, intern) => sum + intern.appointmentsScheduled, 0)
  const averageAppointmentsPerIntern = Math.round(totalAppointmentsCompleted / activeInterns)
  const occupancyRate = Math.round((totalAppointmentsScheduled / (activeInterns * 10)) * 100) // Assumindo capacidade de 10 consultas por estagiário

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const paginatedData = mockInterns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const internActions = (row: Intern) => (
    <IconButton size="small" onClick={() => pushWithProgress(`/gestor/estagiarios/${row.id}`)}>
      <EditIcon fontSize="small" />
    </IconButton>
  )

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Gestão de Estagiários
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => pushWithProgress("gestao-de-estagiarios/cadastro")}
        >
          Cadastrar Estagiário
        </Button>
      </Box>

      {/* Dashboard de KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Estagiários Ativos"
            value={activeInterns}
            icon={<PeopleAltIcon />}
            description="Total de estagiários atualmente ativos"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Consultas Realizadas"
            value={totalAppointmentsCompleted}
            icon={<AssignmentTurnedInIcon />}
            description="Total de consultas concluídas"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Média por Estagiário"
            value={averageAppointmentsPerIntern}
            icon={<TrendingUpIcon />}
            description="Média de consultas por estagiário ativo"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Taxa de Ocupação"
            value={`${occupancyRate}%`}
            icon={<EventNoteIcon />}
            description="Porcentagem de capacidade utilizada"
            color="warning"
          />
        </Grid>
      </Grid>

      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: theme.shadows[2],
        }}
      >
        <DataTable<Intern>
          data={paginatedData}
          columns={internColumns}
          actions={internActions}
          totalCount={mockInterns.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          emptyMessage="Nenhum estagiário encontrado."
          actionsColumnLabel="Ações"
        />
      </Paper>
    </Container>
  )
}
