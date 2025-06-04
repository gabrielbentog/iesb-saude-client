import React from "react"
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Paper,
  Typography,
} from "@mui/material"
import { motion } from "framer-motion"
import { useTheme } from "@mui/material/styles"
import type { DataTableProps } from "@/app/types"

function DataTable<T>({
  data,
  columns,
  actions,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  totalCount,
  emptyMessage = "Nenhum dado encontrado.",
  actionsColumnLabel = "Ações",
  tableHeadSx,
  headerCellSx,
  disableAnimation = false,
  hidePagination = false,
}: DataTableProps<T>) {
  const theme = useTheme()

  const headerBg = theme.palette.primary.main
  const headerTextColor = theme.palette.primary.contrastText
  const stripedRowColor =
    theme.palette.mode === "light"
      ? theme.palette.action.hover
      : theme.palette.action.selected

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: theme.shadows[2],
      }}
    >
      <TableContainer>
        <Table>
          <TableHead sx={tableHeadSx}>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell
                  key={idx}
                  align={col.align || "left"}
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: headerBg,
                    color: headerTextColor,
                    p: 2,
                    ...headerCellSx,
                  }}
                  width={col.width}
                >
                  {col.label}
                </TableCell>
              ))}
              {actions && (
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: headerBg,
                    color: headerTextColor,
                    p: 2,
                    ...headerCellSx,
                  }}
                >
                  {actionsColumnLabel}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, i) => {
              const contentCells = columns.map((col, idx) => (
                <TableCell key={idx} align={col.align || "left"} sx={{ p: 2 }}>
                  {col.render
                    ? col.render(row)
                    : (row[col.accessor!] as unknown as React.ReactNode)}
                </TableCell>
              ))

              const commonRowProps = {
                sx: {
                  backgroundColor: i % 2 === 0 ? "inherit" : stripedRowColor,
                  transition: "background-color 0.3s ease",
                },
              }

              if (disableAnimation) {
                return (
                  <TableRow key={i} hover {...commonRowProps}>
                    {contentCells}
                    {actions && <TableCell sx={{ p: 2 }}>{actions(row)}</TableCell>}
                  </TableRow>
                )
              } else {
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ display: "table-row" }}
                  >
                    {contentCells}
                    {actions && <TableCell style={{ padding: 16 }}>{actions(row)}</TableCell>}
                  </motion.tr>
                )
              }
            })}

            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!hidePagination &&
        page !== undefined &&
        rowsPerPage !== undefined &&
        totalCount !== undefined && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange!}
            onRowsPerPageChange={onRowsPerPageChange!}
            rowsPerPageOptions={[5, 10, 15]}
            labelRowsPerPage="Itens por página:"
          />
        )}
    </Paper>
  )
}

export default DataTable
