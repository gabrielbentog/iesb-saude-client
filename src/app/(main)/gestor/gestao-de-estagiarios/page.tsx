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
  useMediaQuery,
  Menu,
  MenuItem,
  CircularProgress,
  Pagination,
} from "@mui/material"
import { alpha } from "@mui/material/styles"

// Icons
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
// removed specialty icons (column removed)
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import VisibilityIcon from "@mui/icons-material/Visibility"
import EditIcon from "@mui/icons-material/Edit"

import { fetchInterns } from "@/app/lib/api/interns"
import { deleteIntern } from "@/app/lib/api/interns"
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress"
import { useToast } from "@/app/contexts/ToastContext"
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog"
import { StatCard } from "@/app/components/ui/StatCard"
import { DataTable, StyledBadge } from "@/app/components/DataTable"
import type { Intern } from "@/app/types"

const internHeaders = [
  { id: "name",                  label: "Estagiário"          },
  { id: "appointmentsCompleted", label: "Consultas Realizadas"},
  { id: "appointmentsScheduled", label: "Consultas Agendadas" },
  { id: "status",                label: "Status"              },
]

// specialty column removed - no icon helper

const renderInternCell = (intern: Intern, headerId: string) => {
  switch (headerId) {
    case "name":
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
          <Avatar src={((): string | undefined => {
            const rec = intern as unknown as Record<string, unknown>;
            const raw = (rec['avatarUrl'] as string | undefined) ?? (rec['avatar'] as string | undefined);
            if (!raw) return undefined;
            return /^https?:\/\//.test(raw) ? raw : `${process.env.NEXT_PUBLIC_API_HOST}${raw}`;
          })()}
          sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
            {intern.name[0]}
          </Avatar>
          <Typography 
            fontWeight={500}
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: { xs: "150px", sm: "none" }
            }}
          >
            {intern.name}
          </Typography>
        </Box>
      )
    case "appointmentsCompleted":
      return (
        <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
          {intern.appointmentsCompleted}
        </Typography>
      )
    case "appointmentsScheduled":
      return (
        <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
          {intern.appointmentsScheduled}
        </Typography>
      )
    case "status":
      const badgeType = intern.status === "Ativo" ? "Confirmada" : "Pendente"
      return <StyledBadge label={intern.status} badgeType={badgeType} />
    default:
      return null
  }
}

export default function InternManagementScreen() {
  const theme            = useTheme()
  const isMobile         = useMediaQuery(theme.breakpoints.down("sm"))
  const pushWithProgress = usePushWithProgress()
  const { showToast } = useToast()

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
  const [confirmOpen, setConfirmOpen] = useState(false)

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
  const averageAppointments        = activeInterns ? Math.round(totalAppointmentsCompleted / activeInterns) : 0

  const totalPages = Math.ceil(totalCount / rowsPerPage)

  // handlers tabela
  const handlePageChange = (_: unknown, newPage: number) => setPage(isMobile ? newPage - 1 : newPage)
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
    if (selectedIntern) pushWithProgress(`/gestor/gestao-de-estagiarios/editar/${selectedIntern.id}`)
    handleMenuClose()
  }

  const handleDeleteIntern = async () => {
    if (!selectedIntern) {
      handleMenuClose()
      return
    }

    setLoading(true)
    setError(null)
    try {
      await deleteIntern(selectedIntern.id)
      await loadInterns()
      showToast({ message: `Estagiário "${selectedIntern.name}" apagado com sucesso.`, severity: 'success' })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
      setConfirmOpen(false)
      handleMenuClose()
    }
  }

  const internActions = (intern: Intern) => (
    <IconButton size="small" onClick={(e) => handleMenuClick(e, intern)} sx={{ color: "text.secondary" }}>
      <MoreHorizIcon fontSize="small" />
    </IconButton>
  )

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 3 }, px: { xs: 1.5, sm: 3 }, pb: { xs: 6, sm: 8 } }}>
      {/* Cabeçalho */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 1.5, sm: 2 },
          mb: { xs: 2, sm: 3 },
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Gestão de Estagiários
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => pushWithProgress("gestao-de-estagiarios/cadastro")}
          fullWidth={isMobile}
        >
          Cadastrar Estagiário
        </Button>
      </Box>

      {/* KPIs */}
      {isMobile ? (
        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: 2,
            pb: 1,
            scrollSnapType: "x mandatory",
            "& > *": {
              flex: "0 0 85%",
              scrollSnapAlign: "start",
            },
            mb: 3,
          }}
        >
          <StatCard
            title="Estagiários Ativos"
            value={activeInterns}
            subtitle="Total de estagiários ativos"
            icon={<PeopleAltIcon sx={{ color: theme.palette.primary.main }} />}
            iconBgColor={alpha(theme.palette.primary.main, 0.1)}
          />
          <StatCard
            title="Consultas Realizadas"
            value={totalAppointmentsCompleted}
            subtitle="Total de consultas concluídas"
            icon={<AssignmentTurnedInIcon sx={{ color: theme.palette.primary.main }} />}
            iconBgColor={alpha(theme.palette.primary.main, 0.1)}
          />
          <StatCard
            title="Média por Estagiário"
            value={averageAppointments}
            subtitle="Média de consultas por estagiário ativo"
            icon={<TrendingUpIcon sx={{ color: theme.palette.success.main }} />}
            iconBgColor={alpha(theme.palette.success.main, 0.1)}
          />
        </Box>
      ) : (
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
          <Grid item xs={12} sm={12} md={4}>
            <StatCard
              title="Média por Estagiário"
              value={averageAppointments}
              subtitle="Média de consultas por estagiário ativo"
              icon={<TrendingUpIcon sx={{ color: theme.palette.success.main }} />}
              iconBgColor={alpha(theme.palette.success.main, 0.1)}
            />
          </Grid>
        </Grid>
      )}

      {/* Erro */}
      {error && <Typography color="error" mb={2}>{error}</Typography>}

      {/* Cards no mobile / Tabela no desktop */}
      {isMobile ? (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {interns.map((intern) => (
              <Box
                key={intern.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 1,
                  bgcolor: "background.paper",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
                onClick={() => pushWithProgress(`/gestor/estagiarios/${intern.id}`)}
              >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    src={((): string | undefined => {
                      const rec = intern as unknown as Record<string, unknown>;
                      const raw = (rec["avatarUrl"] as string | undefined) ?? (rec["avatar"] as string | undefined);
                      if (!raw) return undefined;
                      return /^https?:\/\//.test(raw) ? raw : `${process.env.NEXT_PUBLIC_API_HOST}${raw}`;
                    })()}
                    sx={{ width: 28, height: 28 }}
                  >
                    {intern.name[0]}
                  </Avatar>

                  {/* Nome + Status */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography fontWeight={600} sx={{ fontSize: "0.95rem" }}>
                      {intern.name}
                    </Typography>
                    <StyledBadge
                      label={intern.status}
                      badgeType={intern.status === "Ativo" ? "Confirmada" : "Pendente"}
                      sx={{
                        fontSize: "0.7rem",
                        px: 0.8,
                        py: 0.2,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Box>

                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMenuClick(e, intern)
                  }}
                >
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
              </Box>
                <Box sx={{ mt: 1.5, display: "flex", gap: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Realizadas
                    </Typography>
                    <Typography fontWeight={600} sx={{ fontSize: "1.1rem" }}>
                      {intern.appointmentsCompleted}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Agendadas
                    </Typography>
                    <Typography fontWeight={600} sx={{ fontSize: "1.1rem" }}>
                      {intern.appointmentsScheduled}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Paginação mobile */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={handlePageChange}
              color="primary"
              size="small"
              shape="rounded"
            />
          </Box>
        </>
      ) : (
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
      )}

      {/* loading */}
      {loading && (
        <Box sx={{ mt: 3, mb: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        sx={{
          "& .MuiPaper-root": {
            width: { xs: "100%", sm: "auto" },
            maxWidth: { xs: "100%", sm: 240 },
            borderRadius: { xs: 0, sm: 2 },
          },
        }}
      >
        <MenuItem 
          onClick={handleViewDetails}
          sx={{ 
            fontSize: { xs: "0.875rem", sm: "1rem" },
            py: { xs: 1, sm: 1.5 }
          }}
        >
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Ver detalhes
        </MenuItem>
        <MenuItem 
          onClick={handleEditIntern}
          sx={{ 
            fontSize: { xs: "0.875rem", sm: "1rem" },
            py: { xs: 1, sm: 1.5 }
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem 
          onClick={() => setConfirmOpen(true)}
          sx={{ 
            fontSize: { xs: "0.875rem", sm: "1rem" },
            py: { xs: 1, sm: 1.5 }
          }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          Apagar
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={confirmOpen}
        title="Apagar estagiário"
        description={selectedIntern ? `Tem certeza que deseja apagar o estagiário "${selectedIntern.name}"? Esta ação não pode ser desfeita.` : "Tem certeza?"}
        confirmLabel="Apagar"
        cancelLabel="Cancelar"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteIntern}
      />
    </Container>
  )
}
