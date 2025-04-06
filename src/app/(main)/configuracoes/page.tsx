"use client";

import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useState } from "react";

export default function ConfiguracoesPage() {
  const theme = useTheme();

  const [darkMode, setDarkMode] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [language, setLanguage] = useState("pt-BR");
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSave = () => {
    console.log({
      language,
      darkMode,
      emailNotif,
      twoFactor
    });
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", py: 4, px: 2 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Configurações
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Ajuste suas preferências do sistema e notificações conforme desejar.
      </Typography>

      <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
        {/* Preferências do Sistema */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Preferências do Sistema
          </Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
          }}
        >
          <Box>
            <FormControl fullWidth>
              <InputLabel id="language-label">Idioma</InputLabel>
              <Select
                labelId="language-label"
                id="language-select"
                value={language}
                label="Idioma"
                onChange={(e) => setLanguage(e.target.value)}
              >
                <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                <MenuItem value="en-US">English (US)</MenuItem>
                <MenuItem value="es-ES">Español</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Notificações */}
        <Box sx={{ mt: 5, mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Notificações
          </Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
          }}
        >
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={emailNotif}
                  onChange={() => setEmailNotif((prev) => !prev)}
                />
              }
              label="Receber notificações por e-mail"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        {/* Segurança */}
        <Box sx={{ mt: 5, mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Segurança
          </Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
            gap: 4,
          }}
        >
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={twoFactor}
                  onChange={() => setTwoFactor((prev) => !prev)}
                />
              }
              label="Ativar autenticação de dois fatores (2FA)"
              sx={{ mt: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta.
            </Typography>

            {twoFactor && (
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" size="small" onClick={() => console.log("Configurar 2FA")}>
                  Configurar agora
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 6 }}>
          <Button variant="contained" size="large" onClick={handleSave}>
            Salvar Alterações
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
