import type React from "react";
import type { SxProps, Theme } from "@mui/material";

export type Column<T> = {
  label: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string | number;
};

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (row: T) => React.ReactNode;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalCount?: number;
  emptyMessage?: string;
  actionsColumnLabel?: string;
  tableHeadSx?: SxProps<Theme>;
  headerCellSx?: SxProps<Theme>;
  disableAnimation?: boolean;
  hidePagination?: boolean;
}
