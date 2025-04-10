"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Backdrop,
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SaveIcon from "@mui/icons-material/Save";
import ImageIcon from "@mui/icons-material/Image";
import PhoneIcon from "@mui/icons-material/Phone";

const specialties = [
  { id: "nutricao", name: "Nutrição" },
  { id: "psicologia", name: "Psicologia" },
  { id: "fisioterapia", name: "Fisioterapia" },
  { id: "enfermagem", name: "Enfermagem" },
  { id: "farmacia", name: "Farmácia" },
];

const universities = [
  { id: "usp", name: "Universidade de São Paulo (USP)" },
  { id: "unicamp", name: "Universidade Estadual de Campinas (UNICAMP)" },
  { id: "unesp", name: "Universidade Estadual Paulista (UNESP)" },
  { id: "unifesp", name: "Universidade Federal de São Paulo (UNIFESP)" },
  { id: "puc", name: "Pontifícia Universidade Católica (PUC)" },
];

const formSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  telefone: z.string().min(10, { message: "Telefone inválido" }),
  especialidade: z.string({ required_error: "Selecione uma especialidade" }),
  universidade: z.string({ required_error: "Selecione uma universidade" }),
  periodo: z.string().min(1, { message: "Informe o período" }),
  observacoes: z.string().optional(),
  avatarUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return value === index ? <Box sx={{ mt: 2 }}>{children}</Box> : null;
}

export default function RegisterInternPage() {
  const router = useRouter();
  const theme = useTheme();

  const [tabIndex, setTabIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      especialidade: "",
      universidade: "",
      periodo: "",
      observacoes: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (firstInputRef.current) firstInputRef.current.focus();
  }, []);

  const handleAvatarChange = (value: string) => {
    setValue("avatarUrl", value);
    setAvatarPreview(value);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 1500));
      setSnackbar({
        open: true,
        message: "Estagiário cadastrado com sucesso!",
        severity: "success",
      });
      router.push("/gestor/gestao-de-estagiarios");
    } catch {
      setSnackbar({
        open: true,
        message: "Erro ao cadastrar. Tente novamente.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button startIcon={<ArrowBackIosNewIcon />} onClick={() => window.history.back()} variant="text" color="primary">
            Voltar
          </Button>
          <Typography variant="h5" sx={{ ml: 2, fontWeight: 600 }}>
            Cadastro de Estagiário
          </Typography>
        </Box>

        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab label="Informações Pessoais" />
          <Tab label="Dados Acadêmicos" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
        <TabPanel value={tabIndex} index={0}>
            <Grid container spacing={3} mt={1}>
              <Grid item xs={12} md={4} textAlign="center">
                <Avatar sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}>
                  <ImageIcon fontSize="large" />
                </Avatar>
              </Grid>

              <Grid item xs={12} md={8}>
                <Controller
                  name="nome"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome Completo"
                      fullWidth
                      inputRef={firstInputRef}
                      error={!!errors.nome}
                      helperText={errors.nome?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
                <Controller
                  name="telefone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Telefone"
                      fullWidth
                      inputMode="tel"
                      error={!!errors.telefone}
                      helperText={errors.telefone?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabIndex} index={1}>
            <Grid container spacing={3} mt={1}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.especialidade}>
                  <InputLabel id="especialidade-label">Especialidade</InputLabel>
                  <Controller
                    name="especialidade"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} labelId="especialidade-label" label="Especialidade">
                        {specialties.map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.especialidade && (
                    <Typography variant="caption" color="error">
                      {errors.especialidade.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.universidade}>
                  <InputLabel id="universidade-label">Universidade</InputLabel>
                  <Controller
                    name="universidade"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} labelId="universidade-label" label="Universidade">
                        {universities.map((u) => (
                          <MenuItem key={u.id} value={u.id}>
                            {u.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.universidade && (
                    <Typography variant="caption" color="error">
                      {errors.universidade.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="periodo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Período/Semestre"
                      fullWidth
                      error={!!errors.periodo}
                      helperText={errors.periodo?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="observacoes"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Observações" fullWidth multiline rows={4} />
                  )}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <Divider sx={{ my: 4 }} />

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={() => router.push("/gestor/gestao-de-estagiarios")} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar Estagiário"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Backdrop open={isSubmitting} sx={{ zIndex: theme.zIndex.modal + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
