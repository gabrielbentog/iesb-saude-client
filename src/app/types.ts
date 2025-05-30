import type React from "react";
import type { TableCellProps, SxProps, Theme } from "@mui/material";

// Define a estrutura de uma coluna para a tabela
export interface ColumnDefinition<T> {
  id: string; // Um identificador único para a coluna
  label: string; // O texto que aparece no cabeçalho da coluna
  accessor?: keyof T | string; // A chave do objeto T para acessar o valor ou um caminho
  align?: TableCellProps['align']; // Alinhamento do texto na célula (left, center, right)
  width?: number | string; // Largura da coluna
  render?: (row: T) => React.ReactNode; // Função para renderizar o conteúdo da célula, se for complexo
}

// Define as props para o componente DataTable/DashboardTable
export interface DataTableProps<T> {
  data: T[]; // Array de objetos que representam as linhas da tabela
  columns: ColumnDefinition<T>[]; // Array de definições de coluna
  actions?: (row: T) => React.ReactNode; // Função que retorna os elementos de ação para uma linha
  page?: number; // Página atual (para paginação controlada)
  rowsPerPage?: number; // Quantidade de linhas por página (para paginação controlada)
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void; // Callback para mudança de página
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; // Callback para mudança de linhas por página
  totalCount?: number; // Número total de itens (para paginação)
  emptyMessage?: string; // Mensagem a ser exibida quando não há dados
  actionsColumnLabel?: string; // Rótulo para a coluna de ações
  tableHeadSx?: SxProps<Theme>; // Estilos SX para o TableHead
  headerCellSx?: SxProps<Theme>; // Estilos SX para as células do cabeçalho
  disableAnimation?: boolean; // Desabilita animações de linha
  hidePagination?: boolean; // Oculta a paginação
  rowKeyExtractor: (row: T) => string | number; // Função para extrair uma chave única para cada linha
  title?: string; // Título da tabela
  subtitle?: string; // Subtítulo da tabela
  onAddClick?: () => void; // Callback para o botão "Adicionar Novo"
  onViewAllClick?: () => void; // Callback para o botão "Ver todos"
  getPriorityBorderColor?: (row: T) => string; // Função para cor da borda da linha
}