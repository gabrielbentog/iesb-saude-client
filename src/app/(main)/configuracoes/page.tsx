"use client";

import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  TextField,
  FormControlLabel,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import { useState } from "react";

export default function ConfiguracoesPage() {
  const theme = useTheme();

  const [darkMode, setDarkMode] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [language, setLanguage] = useState("pt-BR");
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSave = () => {
    // Exemplo de ação
    console.log({
      language,
      darkMode,
      emailNotif,
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Preferências do Sistema
          </Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Idioma"
              select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={() => setDarkMode((prev) => !prev)}
                />
              }
              label="Ativar modo escuro"
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 5, mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Notificações
          </Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
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
          </Grid>
        </Grid>

      <Box sx={{ mt: 5, mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Segurança
        </Typography>
        <Divider sx={{ mt: 1 }} />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
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
        </Grid>
      </Grid>

        <Box sx={{ mt: 6 }}>
          <Button variant="contained" size="large" onClick={handleSave}>
            Salvar Alterações
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
