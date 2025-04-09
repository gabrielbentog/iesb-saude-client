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

type Column<T> = {
  label: string
  accessor?: keyof T
  render?: (row: T) => React.ReactNode
  align?: "left" | "right" | "center"
  width?: string | number
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: (row: T) => React.ReactNode
  page: number
  rowsPerPage: number
  onPageChange: (event: unknown, newPage: number) => void
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  totalCount: number
  emptyMessage?: string
}

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
}: DataTableProps<T>) {
  const theme = useTheme()

  const headerBg = theme.palette.mode === "light" ? theme.palette.grey[200] : theme.palette.grey[800]

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell
                  key={idx}
                  align={col.align || "left"}
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: headerBg,
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
                  }}
                >
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ display: "table-row" }}
              >
                {columns.map((col, idx) => (
                  <TableCell key={idx} align={col.align || "left"}>
                    {col.render
                      ? col.render(row)
                      : (row[col.accessor!] as unknown as string | number | boolean | null)}
                  </TableCell>
                ))}
                {actions && <TableCell>{actions(row)}</TableCell>}
              </motion.tr>
            ))}

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

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 15]}
        labelRowsPerPage="Itens por página:"
      />
    </Paper>
  )
}

export default DataTable
