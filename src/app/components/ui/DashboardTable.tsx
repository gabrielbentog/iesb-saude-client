// components/DashboardTable.tsx

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

// StyledBadge e IconContainer (certifique-se de que estão definidos ou importados corretamente)
export const StyledBadge = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "badgeType",
})<{ badgeType?: string }>(({ theme, badgeType }) => {
  let backgroundColor = theme.palette.grey[100];
  let textColor = theme.palette.grey[800];

  if (badgeType === "Confirmada" || badgeType === "Ativo") {
    backgroundColor = alpha(theme.palette.success.main, 0.1);
    textColor = theme.palette.success.dark;
  } else if (badgeType === "Pendente") {
    backgroundColor = alpha(theme.palette.warning.main, 0.1);
    textColor = theme.palette.warning.dark;
  } else if (badgeType === "Reagendada" || badgeType === "Inativo") {
    backgroundColor = alpha(theme.palette.info.main, 0.1);
    textColor = theme.palette.info.dark;
  }

  return {
    backgroundColor,
    color: textColor,
    fontWeight: 500,
    fontSize: 12,
    height: 24,
    borderRadius: 4,          // Deixa mais retangular
    padding: '0 8px',         // Ajusta o espaçamento horizontal
    textTransform: 'none',    // Mantém a capitalização original
    "&:hover": {
      backgroundColor: alpha(backgroundColor, 0.8),
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


interface TableHeader {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
}

interface DashboardTableProps<T> {
  title: string;
  subtitle: string;
  headers: TableHeader[];
  data: T[];
  renderCell: (row: T, headerId: string) => React.ReactNode;
  onAddClick?: () => void;
  onViewAllClick?: () => void;
  rowKeyExtractor: (row: T) => string | number;
  getPriorityBorderColor?: (row: T) => string;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowsPerPageOptions?: Array<number | { value: -1; label: string }>;
  /**
   * Função para renderizar as ações personalizadas para cada linha da tabela.
   * Recebe o objeto da linha como argumento e deve retornar um React.ReactNode (ex: IconButton, Menu, etc.).
   */
  actions?: (row: T) => React.ReactNode;
  /**
   * O rótulo para a coluna de ações da tabela. Só é exibido se a prop 'actions' for fornecida.
   */
  actionsColumnLabel?: string;
  /**
   * Mensagem a ser exibida quando não houver dados na tabela.
   */
  emptyMessage?: string;
}

export function DashboardTable<T extends { id: string | number }>({
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
}: DashboardTableProps<T>) {

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