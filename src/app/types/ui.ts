import type React from 'react';
import type { Control } from "react-hook-form";

export interface SidebarProps {
  open: boolean;
  drawerWidth: number;
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isMobile: boolean;
}

export interface HeaderProps {
  open: boolean;
  drawerWidth: number;
  onToggleSidebar: () => void;
  isMobile: boolean;
}

export interface UserData {
  name?: string;
  avatar?: string;
  email?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trendComponent?: React.ReactNode;
}

export interface TableHeader {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
}

export interface DashboardTableProps<T> {
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
  actions?: (row: T) => React.ReactNode;
  actionsColumnLabel?: string;
  emptyMessage?: string;
}

export interface ScheduleItemProps {
  control: Control<any>;
  index: number;
  repeatType: number;
  onRemoveDay: () => void;
  disableRemoveDay: boolean;
}
export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface MainLayoutProps {
  children: React.ReactNode;
}
