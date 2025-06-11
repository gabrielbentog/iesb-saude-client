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
  Tab,
  Tabs,
  TextField,
  Typography,
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
import { useToast } from "@/app/contexts/ToastContext";

/* ------------------------------------------------------------------
 * Tipos
 * ------------------------------------------------------------------*/

type CollegeLocation = { id: number; name: string };
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
      periodo: "",
      observacoes: "",
      avatarUrl: "",
    },
  });

  /* ----- miscellaneous UI state ----- */
  const [tabIndex, setTabIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [completedTabs, setCompletedTabs] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  /* ----- progress bar ----- */
  const watchedValues = watch();
  const REQUIRED_FIELDS: (keyof FormValues)[] = [
    "nome",
    "email",
    "telefone",
    "college_location_id",
    "periodo",
  ];

  const progress =
    (REQUIRED_FIELDS.filter((k) => !!watchedValues[k]).length /
      REQUIRED_FIELDS.length) * 100;

  /* ----- effects ----- */
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  /* ----- handlers ----- */
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast({
        message: "A foto deve ter no máximo 5MB",
        severity: "error",
      });
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
          showToast({
            message: "Complete os campos obrigatórios antes de continuar",
            severity: "warning",
          });
          return;
        }
        setCompletedTabs((prev) => [...prev, tabIndex]);
      }
    }
    setTabIndex(newValue);
  };

  const goToNext = async () => {
    // Campos obrigatórios da etapa 1
    const ok = await trigger(["nome", "email", "telefone"]);
    if (!ok) {
      showToast({
        message: "Complete os campos obrigatórios antes de continuar",
        severity: "warning",
      });
      return;
    }
    setCompletedTabs((prev) => [...prev, 0]); // marca etapa concluída
    setTabIndex(1);                           // vai para aba 2
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await createIntern(data);
      showToast({
        message: "Estagiário cadastrado com sucesso!",
        severity: "success",
      });
      reset();
      setAvatarPreview(null);
      setCompletedTabs([]);
      setTimeout(() => router.push("/gestor/gestao-de-estagiarios"), 1500);
    } catch (err: unknown) {
      showToast({
        message: (err instanceof Error ? err.message : "Erro ao cadastrar estagiário"),
        severity: "error",
      });
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
            <Button
              variant="outlined"
              onClick={() => router.push("/gestor/gestao-de-estagiarios")}
              sx={{ textTransform: "none", px: 3 }}
            >
              Cancelar
            </Button>

            {tabIndex === 0 ? (
              // --- PRIMEIRA ETAPA ------------------------------------
              <Button
                variant="contained"
                onClick={goToNext}
                sx={{ textTransform: "none", px: 3 }}
              >
                Próximo
              </Button>
            ) : (
              // --- ÚLTIMA ETAPA --------------------------------------
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{ textTransform: "none", px: 3 }}
              >
                {isSubmitting ? "Salvando..." : "Salvar Estagiário"}
              </Button>
            )}
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
    </Container>
  );
}
