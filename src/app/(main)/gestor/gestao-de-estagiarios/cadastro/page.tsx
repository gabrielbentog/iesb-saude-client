"use client";

import React, { useEffect, useRef, useState, ChangeEvent } from "react";
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
  Tooltip,
  Stack,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SaveIcon from "@mui/icons-material/Save";
import ImageIcon from "@mui/icons-material/Image";
import PhoneIcon from "@mui/icons-material/Phone";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useTheme } from "@mui/material/styles";

/* ──────────────────────────────────────────────────────────
 * Mock Data (replace by API fetch later)
 * ────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────
 * Validation Schema
 * ────────────────────────────────────────────────────────── */
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

const formSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  telefone: z.string().regex(phoneRegex, { message: "Telefone inválido" }),
  especialidade: z.string({ required_error: "Selecione uma especialidade" }),
  universidade: z.string({ required_error: "Selecione uma universidade" }),
  periodo: z.string().min(1, { message: "Informe o período" }),
  observacoes: z.string().optional(),
  avatarUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/* ──────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────── */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
const TabPanel = ({ children, value, index }: TabPanelProps) =>
  value === index ? <Box sx={{ mt: 2 }}>{children}</Box> : null;

// Phone formatter without react-input-mask / findDOMNode
const formatPhone = (v: string) => {
  const digits = v.replace(/\D/g, "");
  if (!digits) return "";
  const part1 = digits.slice(0, 2);
  const part2 = digits.slice(2, digits.length > 10 ? 7 : 6);
  const part3 = digits.slice(digits.length > 10 ? 7 : 6, 11);
  let out = "(" + part1;
  if (part1.length === 2) out += ") ";
  if (part2) out += part2;
  if (part3) out += "-" + part3;
  return out;
};

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */
export default function RegisterInternPage() {
  const router = useRouter();
  const theme = useTheme();

  const [tabIndex, setTabIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
    reset,
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
    firstInputRef.current?.focus();
  }, []);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    setValue("avatarUrl", url);
  };

  const handleTabChange = async (_: React.SyntheticEvent, newValue: number) => {
    if (newValue > tabIndex) {
      const ok = await trigger(["nome", "email", "telefone"] as any);
      if (!ok) return;
    }
    setTabIndex(newValue);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setSnackbar({ open: true, message: "Estagiário cadastrado com sucesso!", severity: "success" });
      reset();
      setAvatarPreview(null);
      router.push("/gestor/gestao-de-estagiarios");
    } catch {
      setSnackbar({ open: true, message: "Erro ao cadastrar. Tente novamente.", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Button startIcon={<ArrowBackIosNewIcon />} onClick={() => router.back()}>
            Voltar
          </Button>
          <Typography variant="h5" fontWeight={600} flexGrow={1}>
            Cadastro de Estagiário
          </Typography>
        </Stack>

        {/* Tabs */}
        <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth" sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab label="Informações Pessoais" />
          <Tab label="Dados Acadêmicos" />
        </Tabs>

        {/* Form */}
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          {/* Tab 0 */}
          <TabPanel value={tabIndex} index={0}>
            <Grid container spacing={3} mt={1}>
              <Grid item xs={12} md={4} textAlign="center">
                <Avatar src={avatarPreview ?? undefined} sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}>
                  {!avatarPreview && <ImageIcon fontSize="large" />}
                </Avatar>
                <input hidden ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} />
                <Tooltip title="Enviar foto">
                  <Button variant="outlined" size="small" startIcon={<UploadFileIcon />} onClick={() => fileInputRef.current?.click()}>
                    Upload
                  </Button>
                </Tooltip>
              </Grid>

              <Grid item xs={12} md={8}>
                <Controller
                  name="nome"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Nome Completo" fullWidth inputRef={firstInputRef} error={!!errors.nome} helperText={errors.nome?.message} sx={{ mb: 2 }} />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Email" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} sx={{ mb: 2 }} />
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
                      value={field.value}
                      onChange={(e) => field.onChange(formatPhone(e.target.value))}
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

          {/* Tab 1 */}
          <TabPanel value={tabIndex} index={1}>
            <Grid container spacing={3} mt={1}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.especialidade}>
                  <InputLabel id="esp-label">Especialidade</InputLabel>
                  <Controller
                    name="especialidade"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} labelId="esp-label" label="Especialidade">
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
                  <InputLabel id="uni-label">Universidade</InputLabel>
                  <Controller
                    name="universidade"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} labelId="uni-label" label="Universidade">
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
                    <TextField {...field} label="Período/Semestre" fullWidth error={!!errors.periodo} helperText={errors.periodo?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="observacoes"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Observações" fullWidth multiline rows={4} />}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <Divider sx={{ my: 4 }} />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push("/gestor/gestao-de-estagiarios")}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}>
              {isSubmitting ? "Salvando..." : "Salvar Estagiário"}
            </Button>
          </Stack>
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
