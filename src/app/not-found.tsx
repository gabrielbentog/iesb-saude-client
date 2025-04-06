"use client";

import { Box, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={600}>404 - Página não encontrada</Typography>
      <Typography variant="body1">A rota que você acessou não existe.</Typography>
    </Box>
  );
}