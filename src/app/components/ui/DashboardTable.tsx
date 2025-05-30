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
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import MoreHorizontalIcon from '@mui/icons-material/MoreHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { styled, alpha, useTheme } from '@mui/material/styles';

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
  hasActions?: boolean;
  getPriorityBorderColor?: (row: T) => string;
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
  hasActions = true,
  getPriorityBorderColor,
}: DashboardTableProps<T>) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = React.useState<T | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, row: T) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

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
            <TableRow>{/* Sem espaços entre <TableRow> e <TableCell> */
              headers.map((header) => (
                <TableCell key={header.id} align={header.align || 'left'} sx={{ width: header.width }}>
                  {header.label}
                </TableCell>
              ))
            }{hasActions && <TableCell width={50}></TableCell>}</TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow /* Sem espaços entre <TableRow> e <TableCell> */
                key={rowKeyExtractor(row)}
                sx={{
                  borderLeft: getPriorityBorderColor ? getPriorityBorderColor(row) : 'none',
                  "&:last-child td, &:last-child th": { border: 0 },
                }}
              >{
                headers.map((header) => (
                  <TableCell key={`${rowKeyExtractor(row)}-${header.id}`}>
                    {renderCell(row, header.id)}
                  </TableCell>
                ))
              }{hasActions && (
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, row)}
                    sx={{ color: "text.secondary" }}
                  >
                    <MoreHorizontalIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              )}</TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {onViewAllClick && (
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="text" color="primary" endIcon={<ArrowRightAltIcon />} sx={{ fontWeight: 600 }} onClick={onViewAllClick}>
            Ver todos
          </Button>
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleMenuClose}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Ver detalhes
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
      </Menu>
    </Card>
  );
}