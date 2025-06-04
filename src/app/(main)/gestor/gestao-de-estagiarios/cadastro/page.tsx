"use client";

import React, { useEffect, useRef, useState, type ChangeEvent } from "react";
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
  Stack,
  LinearProgress,
  Fade,
  IconButton,
  FormHelperText,
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
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import EmailIcon from "@mui/icons-material/Email";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { apiFetch } from "@/app/lib/api";
import { useApi } from "@/app/hooks/useApi";

/* ------------------------------------------------------------------
 * Tipos
 * ------------------------------------------------------------------*/

type CollegeLocation = { id: number; name: string };
type Specialty = { id: number; name: string };

type ApiResponse<T> = { data: T };

/* ------------------------------------------------------------------
 * Zod schema
 * ------------------------------------------------------------------*/
const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

export const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().regex(phoneRegex, "Telefone inválido"),

  college_location_id: z.coerce.number({
    invalid_type_error: "Selecione o campus",
  }),
  specialty_id: z.coerce.number({
    invalid_type_error: "Selecione a especialidade",
  }),

  periodo: z.string().min(1, "Informe o período"),
  observacoes: z.string().optional(),
  avatarUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/* ------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------*/
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

/* ------------------------------------------------------------------
 * API service local
 * ------------------------------------------------------------------*/
async function createIntern(data: FormValues) {
  return apiFetch("/api/users", {
    method: "POST",
    body: JSON.stringify({
      user: {
        name: data.nome,
        email: data.email,
        collegeLocationId: data.college_location_id,
        specialtyId: data.specialty_id,
        profileName: "Estagiário",
        semester: data.periodo,
      },
    }),
  });
}

/* ------------------------------------------------------------------
 * Tab panel helper component
 * ------------------------------------------------------------------*/
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={value === index} timeout={200}>
          <Box sx={{ pt: 3 }}>{children}</Box>
        </Fade>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
 * Main component
 * ------------------------------------------------------------------*/
export default function RegisterInternPage() {
  const router = useRouter();

  /* ----- remote data ----- */
  const { data: locResp, loading: loadingLocs } =
    useApi<ApiResponse<CollegeLocation[]>>("/api/college_locations");
  const locations = locResp?.data ?? [];

  /* react‑hook‑form ---------------------------------------------- */
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      college_location_id: 0, // coerção
      specialty_id: 0,
      periodo: "",
      observacoes: "",
      avatarUrl: "",
    },
  });

  /* specialties depend on campus ---------------------------------- */
  const selectedCampusId = watch("college_location_id");
  const { data: specResp, loading: loadingSpecs } = useApi<
    ApiResponse<Specialty[] | { specialties: { data: Specialty[] } }>
  >(selectedCampusId ? `/api/college_locations/${selectedCampusId}/specialties` : "");

  const specialties: Specialty[] = React.useMemo(() => {
    const raw = specResp?.data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return raw.specialties?.data ?? [];
  }, [specResp]);

  /* ----- miscellaneous UI state ----- */
  const [tabIndex, setTabIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [completedTabs, setCompletedTabs] = useState<number[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  /* ----- progress bar ----- */
  const watchedValues = watch();
  const REQUIRED_FIELDS: (keyof FormValues)[] = [
    "nome",
    "email",
    "telefone",
    "college_location_id",
    "specialty_id",
    "periodo",
  ];

  const progress =
    (REQUIRED_FIELDS.filter((k) => !!watchedValues[k]).length /
      REQUIRED_FIELDS.length) * 100;

  /* ----- effects ----- */
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // limpa a especialidade ao trocar o campus
  useEffect(() => {
    setValue("specialty_id", undefined as unknown as number);
  }, [selectedCampusId, setValue]);

  /* ----- handlers ----- */
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: "Arquivo muito grande. Máximo 5MB.", severity: "warning" });
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    setValue("avatarUrl", url);
  };

  const handleTabChange = async (_: React.SyntheticEvent, newValue: number) => {
    if (newValue > tabIndex) {
      const fieldsToValidate = newValue === 1 ? (["nome", "email", "telefone"] as (keyof FormValues)[]) : [];
      if (fieldsToValidate.length) {
        const ok = await trigger(fieldsToValidate);
        if (!ok) {
          setSnackbar({ open: true, message: "Complete os campos obrigatórios antes de continuar", severity: "warning" });
          return;
        }
        setCompletedTabs((prev) => [...prev, tabIndex]);
      }
    }
    setTabIndex(newValue);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await createIntern(data);
      setSnackbar({ open: true, message: "Estagiário cadastrado com sucesso!", severity: "success" });
      reset();
      setAvatarPreview(null);
      setCompletedTabs([]);
      setTimeout(() => router.push("/gestor/gestao-de-estagiarios"), 1500);
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.message ?? "Erro ao cadastrar.", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------
   * render
   * ------------------------------------------------------------------*/
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <IconButton onClick={() => router.back()} color="primary">
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={600} color="text.primary">
            Cadastro de Estagiário
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Typography variant="body2" color="text.secondary">
            Progresso: {Math.round(progress)}%
          </Typography>
          <LinearProgress value={progress} variant="determinate" sx={{ flexGrow: 1, height: 4, borderRadius: 2 }} />
        </Stack>
      </Box>

      <Paper sx={{ p: 4 }}>
        {/* Tabs */}
        <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth" sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tab icon={<PersonIcon />} iconPosition="start" label={<Stack direction="row" alignItems="center" spacing={1}><span>Informações Pessoais</span>{completedTabs.includes(0) && <CheckCircleIcon color="success" fontSize="small" />}</Stack>} sx={{ textTransform: "none", fontWeight: 500 }} />
          <Tab icon={<SchoolIcon />} iconPosition="start" label={<Stack direction="row" alignItems="center" spacing={1}><span>Dados Acadêmicos</span>{completedTabs.includes(1) && <CheckCircleIcon color="success" fontSize="small" />}</Stack>} sx={{ textTransform: "none", fontWeight: 500 }} />
        </Tabs>

        {/* Form */}
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          {/* Tab 0 */}
          <TabPanel value={tabIndex} index={0}>
            <Grid container spacing={4}>
              {/* Avatar */}
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Foto do Estagiário
                  </Typography>
                  <Avatar src={avatarPreview ?? undefined} sx={{ width: 120, height: 120, mx: "auto", mb: 2, bgcolor: "grey.100" }}>
                    {!avatarPreview && <ImageIcon fontSize="large" color="action" />}
                  </Avatar>
                  <input hidden ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} />
                  <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => fileInputRef.current?.click()} sx={{ textTransform: "none" }}>
                    {avatarPreview ? "Alterar Foto" : "Enviar Foto"}
                  </Button>
                  <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                    Máximo 5MB
                  </Typography>
                </Box>
              </Grid>

              {/* Campos pessoais */}
              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  <Controller name="nome" control={control} render={({ field }) => (
                    <TextField {...field} label="Nome Completo" fullWidth inputRef={firstInputRef} error={!!errors.nome} helperText={errors.nome?.message} InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> }} />
                  )} />

                  <Controller name="email" control={control} render={({ field }) => (
                    <TextField {...field} label="Email" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }} />
                  )} />

                  <Controller name="telefone" control={control} render={({ field }) => (
                    <TextField {...field} label="Telefone" fullWidth placeholder="(61) 99999-9999" value={field.value} onChange={(e) => field.onChange(formatPhone(e.target.value))} error={!!errors.telefone} helperText={errors.telefone?.message} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment> }} />
                  )} />
                </Stack>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 1 */}
          <TabPanel value={tabIndex} index={1}>
            <Grid container spacing={3}>
              {/* Campus */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.college_location_id} disabled={loadingLocs}>
                  <InputLabel id="campus-label">Campus</InputLabel>
                  <Controller name="college_location_id" control={control} render={({ field }) => (
                    <Select {...field} labelId="campus-label" label="Campus">
                      {locations.map((loc) => (
                        <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                      ))}
                    </Select>
                  )} />
                  <FormHelperText>{errors.college_location_id?.message}</FormHelperText>
                </FormControl>
              </Grid>

              {/* Especialidade */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.specialty_id} disabled={!selectedCampusId || loadingSpecs}>
                  <InputLabel id="esp-label">Especialidade</InputLabel>
                  <Controller name="specialty_id" control={control} render={({ field }) => (
                    <Select {...field} labelId="esp-label" label="Especialidade">
                      {specialties.map((s) => (
                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                      ))}
                    </Select>
                  )} />
                  <FormHelperText>{errors.specialty_id?.message}</FormHelperText>
                </FormControl>
              </Grid>

              {/* Período */}
              <Grid item xs={12} md={6}>
                <Controller name="periodo" control={control} render={({ field }) => (
                  <TextField {...field} label="Período/Semestre" fullWidth placeholder="Ex: 6º semestre" error={!!errors.periodo} helperText={errors.periodo?.message} />
                )} />
              </Grid>

              {/* Observações */}
              <Grid item xs={12}>
                <Controller name="observacoes" control={control} render={({ field }) => (
                  <TextField {...field} label="Observações" fullWidth multiline rows={4} placeholder="Informações adicionais sobre o estagiário..." />
                )} />
              </Grid>
            </Grid>
          </TabPanel>

          <Divider sx={{ my: 4 }} />

          {/* Action buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push("/gestor/gestao-de-estagiarios")}
              sx={{ textTransform: "none", px: 3 }}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />} sx={{ textTransform: "none", px: 3 }}>
              {isSubmitting ? "Salvando..." : "Salvar Estagiário"}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Backdrop */}
      <Backdrop open={isSubmitting} sx={{ zIndex: 1300 }}>
        <Stack alignItems="center" spacing={2} color="white">
          <CircularProgress color="inherit" />
          <Typography>Salvando dados...</Typography>
        </Stack>
      </Backdrop>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
