// components/DataTable.tsx

import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Card,
  Chip,
  TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { styled, alpha } from '@mui/material/styles';

import type { DataTableProps } from "@/app/types";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import type { AppointmentStatus } from "@/app/types";
// StyledBadge e IconContainer (certifique-se de que estão definidos ou importados corretamente)
export const StyledBadge = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "badgeType",
})<{ badgeType: AppointmentStatus }>(({ theme, badgeType }) => {
  const cfg = (() => {
    switch (badgeType) {
      case "Confirmada":
        return {
          bg: alpha(theme.palette.success.main, 0.1),
          fg: theme.palette.success.main,
          icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        };
      case "Concluída":
        return {
          bg: alpha(theme.palette.info.main, 0.1),
          fg: theme.palette.info.main,
          icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        };
      case "Pendente":
      case "Aguardando confirmação do Paciente":
        return {
          bg: alpha(theme.palette.warning.main, 0.1),
          fg: theme.palette.warning.main,
          icon: <PendingIcon sx={{ fontSize: 16 }} />,
        };
      case "Cancelada pelo gestor":
      case "Cancelada pelo paciente":
      case "Rejeitada":
        return {
          bg: alpha(theme.palette.error.main, 0.1),
          fg: theme.palette.error.main,
          icon: <CancelIcon sx={{ fontSize: 16 }} />,
        };
      default:
        return {
          bg: alpha(theme.palette.grey[500], 0.1),
          fg: theme.palette.grey[700],
          icon: null,
        };
    }
  })();
  return {
    backgroundColor: cfg.bg,
    color: cfg.fg,
    fontWeight: 600,
    fontSize: "0.75rem",
    height: 28,
    borderRadius: 4,
    padding: '0 8px',
    textTransform: 'none',
    "& .MuiChip-icon": { color: cfg.fg },
    "&:hover": {
      backgroundColor: alpha(cfg.bg, 0.8),
    },
  };
});

export const IconContainer = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.grey[100],
}));

export function DataTable<T extends { id: string | number }>({
  title,
  subtitle,
  headers,
  data,
  renderCell,
  onAddClick,
  onViewAllClick,
  rowKeyExtractor,
  getPriorityBorderColor,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  actions, // Prop de ações
  actionsColumnLabel = '', // Prop para o rótulo da coluna de ações, com valor padrão vazio
  emptyMessage = 'Nenhum registro encontrado.', // Prop para mensagem de vazio, com valor padrão
  rowsPerPageOptions = [5, 10, 25, { label: 'Todas', value: -1 }],
}: DataTableProps<T>) {

  const showActionsColumn = typeof actions === 'function'; // Verifica se a prop actions foi fornecida

  return (
    <Card>
      <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        {onAddClick && (
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={onAddClick}>
            Adicionar Novo
          </Button>
        )}
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header.id} align={header.align || 'left'} sx={{ width: header.width }}>
                  {header.label}
                </TableCell>
              ))}
              {showActionsColumn && (
                <TableCell width={50} align="right">
                  {actionsColumnLabel}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length + (showActionsColumn ? 1 : 0)} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={rowKeyExtractor(row)}
                  sx={{
                    borderLeft: getPriorityBorderColor ? getPriorityBorderColor(row) : 'none',
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  {headers.map((header) => (
                    <TableCell key={`${rowKeyExtractor(row)}-${header.id}`}>
                      {renderCell(row, header.id)}
                    </TableCell>
                  ))}
                  {showActionsColumn && (
                    <TableCell align="right">
                      {actions && actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Paginação */}
      {typeof page === 'number' &&
      typeof rowsPerPage === 'number' &&
      typeof totalCount === 'number' &&
      onPageChange &&
      onRowsPerPageChange && data.length > 0 && ( // Adicionado data.length > 0 para não exibir paginação em tabela vazia
        <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "flex-end" }}>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage} // <--- Este valor é crucial
            onRowsPerPageChange={onRowsPerPageChange}
            labelRowsPerPage="Linhas por página:" // <--- Este label
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
            }
            rowsPerPageOptions={rowsPerPageOptions}

          />
        </Box>
      )}

      {/* Botão "Ver todos" */}
      {onViewAllClick && data.length > 0 && ( // Adicionado data.length > 0 para não exibir o botão em tabela vazia
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="text" color="primary" endIcon={<ArrowRightAltIcon />} sx={{ fontWeight: 600 }} onClick={onViewAllClick}>
            Ver todos
          </Button>
        </Box>
      )}
    </Card>
  );
}