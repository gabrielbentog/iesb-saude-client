import { SxProps, Theme } from "@mui/system";

export type Column<T> = {
  label: string
  accessor?: keyof T
  render?: (row: T) => React.ReactNode
  align?: "left" | "right" | "center"
  width?: string | number
}

export type UpcomingAppointment = {
  id: number
  patient: string
  intern: string
  specialty: string
  date: string
  time: string
  status: string
  icon: React.ReactNode
}

export type Intern = {
  id: number
  name: string
  specialty: string
  avatar: string
  appointmentsCompleted: number
  appointmentsScheduled: number
  status: "Ativo" | "Inativo"
  icon: React.ReactNode
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: (row: T) => React.ReactNode
  page?: number
  rowsPerPage?: number
  onPageChange?: (event: unknown, newPage: number) => void
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  totalCount?: number
  emptyMessage?: string
  actionsColumnLabel?: string
  tableHeadSx?: SxProps<Theme>
  headerCellSx?: SxProps<Theme>
  disableAnimation?: boolean
  hidePagination?: boolean
}