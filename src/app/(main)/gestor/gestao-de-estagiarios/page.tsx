"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  IconButton,
  Avatar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DataTable from "@/app/components/DataTable/DataTable";
import { Column, Intern } from "@/app/components/DataTable/types";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

// Dados fictícios (mock) para os estagiários.
// Certifique-se de que o tipo Intern esteja definido com a propriedade `status` como "Ativo" | "Inativo".
const mockInterns: Intern[] = [
  {
    id: 1,
    name: "Ana Silva",
    specialty: "Nutrição",
    avatar: "/placeholder.svg?height=40&width=40",
    appointmentsCompleted: 32,
    appointmentsScheduled: 8,
    status: "Ativo",
    icon: <Avatar src="/placeholder.svg?height=40&width=40" />,
  },
  {
    id: 2,
    name: "Carlos Mendes",
    specialty: "Psicologia",
    avatar: "/placeholder.svg?height=40&width=40",
    appointmentsCompleted: 28,
    appointmentsScheduled: 6,
    status: "Inativo",
    icon: <Avatar src="/placeholder.svg?height=40&width=40" />,
  },
  {
    id: 3,
    name: "Juliana Costa",
    specialty: "Fisioterapia",
    avatar: "/placeholder.svg?height=40&width=40",
    appointmentsCompleted: 18,
    appointmentsScheduled: 4,
    status: "Ativo",
    icon: <Avatar src="/placeholder.svg?height=40&width=40" />,
  },
  {
    id: 4,
    name: "Pedro Santos",
    specialty: "Nutrição",
    avatar: "/placeholder.svg?height=40&width=40",
    appointmentsCompleted: 15,
    appointmentsScheduled: 5,
    status: "Inativo",
    icon: <Avatar src="/placeholder.svg?height=40&width=40" />,
  },
  {
    id: 5,
    name: "Mariana Lima",
    specialty: "Psicologia",
    avatar: "/placeholder.svg?height=40&width=40",
    appointmentsCompleted: 22,
    appointmentsScheduled: 7,
    status: "Ativo",
    icon: <Avatar src="/placeholder.svg?height=40&width=40" />,
  },
  {
    id: 6,
    name: "Gabriel Souza",
    specialty: "Fisioterapia",
    avatar: "/placeholder.svg?height=40&width=40",
    appointmentsCompleted: 19,
    appointmentsScheduled: 3,
    status: "Ativo",
    icon: <Avatar src="/placeholder.svg?height=40&width=40" />,
  },
];

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
    render: (row) => (
      <Box sx={{ display: "flex", alignItems: "center" }}>{row.specialty}</Box>
    ),
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
];

// Função de ação para editar um estagiário
function internActions(row: Intern) {
  return (
    <IconButton
      size="small"
      onClick={() => pushWithProgress(`/gestor/estagiarios/${row.id}`)}
    >
      <EditIcon fontSize="small" />
    </IconButton>
  );
}

// Função mock para navegação (substitua com a lógica de roteamento da sua aplicação)
function pushWithProgress(url: string) {
  console.log(`Navigating to: ${url}`);
}

export default function InternManagementScreen() {
  const theme = useTheme();
  
  // Estados para paginação.
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Funções para manipular a mudança de página e a quantidade de itens por página.
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Realizando a paginação dos dados localmente.
  const paginatedData = mockInterns.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
          onClick={() => pushWithProgress("/gestor/estagiarios/novo")}
        >
          Cadastrar Estagiário
        </Button>
      </Box>
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
  );
}
