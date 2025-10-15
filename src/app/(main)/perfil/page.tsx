"use client";

import React, { useCallback, useEffect, useRef, useState, FC } from "react";
import {
  Box, Typography, Button, Card, CardContent, CardHeader, Grid, Container, Avatar, TextField,
  CircularProgress, IconButton, Stack, Divider, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import {
  Edit, Save, Cancel, PhotoCamera, DeleteOutline, Security, Password, Person, Email
} from "@mui/icons-material";
import { z } from "zod";
import { useForm, Controller, type FieldValues, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { apiFetch } from "@/app/lib/api";
import { useToast } from "@/app/contexts/ToastContext";
import { useApi } from "@/app/hooks/useApi";
import type { User } from '@/app/types';

interface ApiError {
  status?: number;
  data?: { errors?: Record<string, string[]> };
}

// --- Schemas e Tipos ---
const profileSchema = z.object({
  id:    z.string().min(1),
  name:  z.string().trim().min(2, "Informe o nome completo."),
  phone: z.string().trim().optional().refine(v => {
    if (!v) return true;
    // permite formatos com espaços, parênteses, traço e +; valida apenas dígitos entre 10 e 14
    const digits = v.replace(/\D/g, '');
    return /^\d{10,14}$/.test(digits);
  }, "Telefone inválido."),
  cpf:   z.string().trim().optional().refine(v => !v || /^\d{11}$/.test(v), "CPF deve ter 11 dígitos."),
  email: z.string().trim().email("Email inválido."),
  image: z.string().url().optional().or(z.literal("")).nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória."),
  newPassword: z.string().min(8, "Mínimo de 8 caracteres."),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  path: ["confirmPassword"], message: "As senhas não coincidem.",
});
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const emailChangeSchema = z.object({
  newEmail: z.string().trim().email("Email inválido."),
  currentPassword: z.string().min(1, "Senha atual é obrigatória."),
  verificationCode: z.string().min(6, "Código deve ter 6 dígitos.").max(6, "Código deve ter 6 dígitos."),
});
type EmailChangeFormValues = z.infer<typeof emailChangeSchema>;

const deleteAccountSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória para deletar a conta."),
  confirmText: z.string().refine((val) => val === "DELETAR", {
    message: "Digite 'DELETAR' para confirmar.",
  }),
});

interface DeleteAccountFormValues {
  currentPassword: string;
  confirmText: string;
}


interface UserApiResponse {
    data: User;
}

// --- Helpers ---
const initialsFromName = (name?: string): string => !name ? "?" : name.trim().split(/\s+/).slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");

// formata entrada de telefone incrementalmente para +55 (AA) NNNNN-NNNN
const formatPhoneInput = (raw?: string) => {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  let d = digits;
  let prefix = "";
  if (d.startsWith("55")) {
    prefix = "+55 ";
    d = d.slice(2);
  }
  if (d.length <= 2) return `${prefix}(${d}`;
  if (d.length <= 6) return `${prefix}(${d.slice(0,2)}) ${d.slice(2)}`;
  return `${prefix}(${d.slice(0,2)}) ${d.slice(2,7)}${d.length > 7 ? `-${d.slice(7,11)}` : ""}`;
}

const mapUserToForm = (user: User): Omit<ProfileFormValues, 'currentPassword'> => ({
  id: user.id, 
  name: user.name ?? "", 
  email: user.email ?? "",
  phone: user.phone ?? "",
  cpf: user.cpf ?? "",
  image: user.image ?? null,
});

const saveUserToLocalStorage = (user: User) => {
  try {
    const sessionString = localStorage.getItem("session");
    if (sessionString) {
      const session = JSON.parse(sessionString);
      session.user = { ...session.user, ...user };
      localStorage.setItem("session", JSON.stringify(session));
    }
  } catch (e) {
    console.error("Failed to save user to localStorage", e);
  }
  // notify other tabs/listeners
  try { window.dispatchEvent(new Event('sessionUpdated')); } catch {}
};

// monta a URL pública do avatar: se o backend retornar caminho relativo (ex: /uploads/abc.jpg)
// então prefixamos com NEXT_PUBLIC_API_HOST; se já for URL absoluta, usamos como está.
const getAvatarFullUrl = (raw?: string | null) => {
  if (!raw) return undefined;
  if (/^https?:\/\//.test(raw)) return raw;
  const base = process.env.NEXT_PUBLIC_API_HOST ?? '';
  return `${base}${raw}`;
};

const applyBackendErrorsToForm = <
  TFieldValues extends FieldValues = FieldValues
>(
  err: unknown,
  setError: UseFormReturn<TFieldValues>["setError"]
): void => {
  const apiError = err as ApiError;

  if (apiError?.status === 422 && apiError.data?.errors) {
    Object.entries(apiError.data.errors).forEach(([key, msgs]) => {
      setError(key as import("react-hook-form").Path<TFieldValues>, {
        type: "server",
        message: msgs.join(", "),
      });
    });
  }
};

// --- Componentes Aninhados ---
const Section: FC<{ title: React.ReactNode, children: React.ReactNode }> = ({ title, children }) => (
    <Box>
        <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>{title}</Stack>
        <Divider />
        <Box mt={2}>{children}</Box>
    </Box>
);

const ProfileAvatarUploader: FC<{
  mode: 'view' | 'edit';
  avatarUrl?: string | null;
  name?: string;
  onChangeFile: (file: File | null) => void;
  onClear: () => void;
  loading?: boolean;
}> = ({ mode, avatarUrl, name, onChangeFile, onClear, loading }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handlePick = useCallback(() => mode === 'edit' && inputRef.current?.click(), [mode]);
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChangeFile(e.target.files?.[0] ?? null), [onChangeFile]);

    return (
        <Box position="relative" sx={{ width: 120, height: 120 }}>
            <Avatar src={avatarUrl || undefined} sx={{ width: '100%', height: '100%', cursor: mode === 'edit' ? 'pointer' : 'default', opacity: loading ? 0.7 : 1 }} onClick={handlePick}>
                {initialsFromName(name)}
            </Avatar>
            {mode === 'edit' && (
                <>
                    <Tooltip title="Alterar foto">
                        <IconButton size="small" onClick={handlePick} sx={{ position: 'absolute', bottom: 4, right: 4, bgcolor: 'background.paper', '&:hover': { bgcolor: 'grey.200' }}}>
                            <PhotoCamera fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    {avatarUrl && (
                        <Tooltip title="Remover foto">
                            <IconButton size="small" onClick={onClear} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'background.paper', '&:hover': { bgcolor: 'grey.200' }}}>
                                <DeleteOutline fontSize="small" color="error" />
                            </IconButton>
                        </Tooltip>
                    )}
                </>
            )}
            <input type="file" ref={inputRef} hidden accept="image/*" onChange={handleFileChange} />
        </Box>
    );
};

const ProfileHeader: FC<{
    user: User;
    mode: 'view' | 'edit';
    avatarPreview: string | null;
    setAvatarFile: (file: File | null) => void;
  onSave: () => void;
    onCancel: () => void;
    onEdit: () => void;
  onClear?: () => void;
  avatarRemoved?: boolean;
    isSaving: boolean;
}> = ({ user, mode, avatarPreview, setAvatarFile, onSave, onCancel, onEdit, onClear, avatarRemoved, isSaving }) => (
    <CardHeader
      sx={{
        // eixo Y primeiro, depois eixo X
        py: { xs: 3, md: 4 },   // 24 px → 32 px
        px: { xs: 2, md: 4 },   // 16 px → 32 px
      }}
      disableTypography
      title={
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={3} alignItems="center">
            <ProfileAvatarUploader
                mode={mode}
                avatarUrl={
                  // if user opted to remove avatar, force no image shown until save
                  (mode === 'edit' && avatarRemoved) ? undefined : (avatarPreview || getAvatarFullUrl(
                    (user.image as string | undefined) ?? ((user as unknown as Record<string, unknown>)['avatarUrl'] as string | undefined) ?? ((user as unknown as Record<string, unknown>)['avatar'] as string | undefined)
                  ))
                }
                name={user.name ?? undefined}
                onClear={() => {
                  if (typeof onClear === 'function') onClear();
                  setAvatarFile(null);
                }}
                onChangeFile={setAvatarFile}
                loading={isSaving}
            />
            <Box>
              <Typography variant="h5" fontWeight={600}>{user.name}</Typography>
              <Typography color="text.secondary">{user.email}</Typography>
            </Box>
          </Stack>
          <Box>
            {mode === 'edit' ? (
              <Stack direction="row" spacing={1}>
                <Button onClick={onCancel} startIcon={<Cancel />} disabled={isSaving}>Cancelar</Button>
                <Button onClick={onSave} variant="contained" startIcon={isSaving ? <CircularProgress size={20} color="inherit"/> : <Save />} disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </Stack>
            ) : (
              <Button onClick={onEdit} variant="contained" startIcon={<Edit />}>Editar</Button>
            )}
          </Box>
        </Stack>
      }
    />
);

const ProfileForm: FC<{
    control: UseFormReturn<ProfileFormValues>['control'];
    errors: UseFormReturn<ProfileFormValues>['formState']['errors'];
    isLocked: boolean;
    cpfPersisted?: boolean;
}> = ({ control, errors, isLocked, cpfPersisted }) => (
  <Section title={<><Person /> <Typography variant="h6">Informações Pessoais</Typography></>}>
    <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} sm={6}>
            <Controller name="name" control={control} render={({ field }) => (
                <TextField {...field} label="Nome Completo" fullWidth variant="outlined" disabled={isLocked} error={!!errors.name} helperText={errors.name?.message} />
            )} />
        </Grid>
        <Grid item xs={12} sm={6}>
            <Controller name="email" control={control} render={({ field }) => (
                <TextField {...field} label="Email" fullWidth variant="outlined" disabled helperText="Para alterar o email, use a seção de segurança."/>
            )} />
        </Grid>
        <Grid item xs={12} sm={6}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Telefone"
                  fullWidth
                  variant="outlined"
                  disabled={isLocked}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  placeholder="+55 (11) 99999-9999"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(formatPhoneInput(e.target.value))}
                  onBlur={field.onBlur}
                />
              )}
            />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="cpf"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="CPF"
                fullWidth
                variant="outlined"
                disabled={isLocked || cpfPersisted}
                error={!!errors.cpf}
                helperText={ cpfPersisted ? "CPF não pode ser alterado depois de salvo." : errors.cpf?.message }/>
            )}
          />
        </Grid>
    </Grid>
  </Section>
);

const SecuritySettings: FC<{ onOpenChangePassword: () => void; onOpenChangeEmail: () => void; onOpenDeleteAccount: () => void; }> = ({ onOpenChangePassword, onOpenChangeEmail, onOpenDeleteAccount }) => (
    <Section title={<><Security /> <Typography variant="h6">Segurança</Typography></>}>
        <Stack spacing={2} divider={<Divider />}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Alterar seu endereço de e-mail.</Typography>
                <Button variant="outlined" size="small" onClick={onOpenChangeEmail} startIcon={<Email />}>Alterar Email</Button>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Alterar sua senha de acesso.</Typography>
                <Button variant="outlined" size="small" onClick={onOpenChangePassword} startIcon={<Password />}>Alterar Senha</Button>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Deletar permanentemente sua conta e todos os dados.</Typography>
                <Button variant="outlined" size="small" color="error" onClick={onOpenDeleteAccount} startIcon={<DeleteOutline />}>Deletar Conta</Button>
            </Stack>
        </Stack>
    </Section>
);

const ChangePasswordDialog: FC<{ open: boolean; onClose: () => void; userId: string; }> = ({ open, onClose, userId }) => {
    const { showToast } = useToast();
    const { control, handleSubmit, reset, formState: { errors, isSubmitting }, setError } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await apiFetch(`/api/users/${userId}/change_password`, {
                method: "PUT",
                body: JSON.stringify(values),
            });
            showToast({ message: "Senha alterada com sucesso!", severity: "success" });
            onClose();
        } catch (err) {
            applyBackendErrorsToForm(err, setError);
            showToast({ message: "Erro ao alterar senha.", severity: "error" });
        }
    });

    return (
        <Dialog open={open} onClose={onClose} onTransitionExited={reset} fullWidth maxWidth="xs">
            <DialogTitle>Alterar Senha</DialogTitle>
            <form onSubmit={onSubmit}>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Controller name="currentPassword" control={control} render={({ field }) => <TextField {...field} type="password" label="Senha Atual" fullWidth error={!!errors.currentPassword} helperText={errors.currentPassword?.message} />} />
                        <Controller name="newPassword" control={control} render={({ field }) => <TextField {...field} type="password" label="Nova Senha" fullWidth error={!!errors.newPassword} helperText={errors.newPassword?.message} />} />
                        <Controller name="confirmPassword" control={control} render={({ field }) => <TextField {...field} type="password" label="Confirmar Nova Senha" fullWidth error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : "Alterar Senha"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

const EmailChangeDialog: FC<{ open: boolean; onClose: () => void; userId: string; }> = ({ open, onClose, userId }) => {
    const { showToast } = useToast();
    const [isSendingCode, setIsSendingCode] = useState(false);
    
    const { control, handleSubmit, formState: { errors, isSubmitting }, setError, getValues } = useForm<EmailChangeFormValues>({
        resolver: zodResolver(emailChangeSchema),
        defaultValues: { newEmail: "", currentPassword: "", verificationCode: "" },
    });

    const handleRequestCode = async () => {
        const { newEmail, currentPassword } = getValues();
        if (!newEmail || !currentPassword) {
            showToast({ message: "Preencha o novo email e a senha atual para enviar o código.", severity: "warning" });
            return;
        }
        setIsSendingCode(true);
        try {
            await apiFetch(`/api/users/${userId}/request-email-change`, {
                method: "POST",
                body: JSON.stringify({ newEmail, currentPassword }),
            });
            showToast({ message: "Código de verificação enviado!", severity: "success" });
        } catch (err) {
            applyBackendErrorsToForm(err, setError);
            showToast({ message: "Erro ao solicitar código.", severity: "error" });
        } finally {
            setIsSendingCode(false);
        }
    };
    
    const onSubmit = handleSubmit(async (values) => {
        try {
            await apiFetch(`/api/users/${userId}/verify-email-change`, {
                method: "POST",
                body: JSON.stringify(values),
            });
            showToast({ message: "Email alterado com sucesso! A página será recarregada.", severity: "success" });
            setTimeout(() => window.location.reload(), 2000);
            onClose();
        } catch (err) {
            applyBackendErrorsToForm(err, setError);
            showToast({ message: "Código de verificação inválido ou expirado.", severity: "error" });
        }
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Alterar Email</DialogTitle>
            <form onSubmit={onSubmit}>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Controller name="newEmail" control={control} render={({ field }) => 
                            <TextField {...field} label="Novo Email" fullWidth type="email" error={!!errors.newEmail} helperText={errors.newEmail?.message} />
                        } />
                        <Controller name="currentPassword" control={control} render={({ field }) => 
                            <TextField {...field} label="Senha Atual" fullWidth type="password" error={!!errors.currentPassword} helperText={errors.currentPassword?.message} />
                        } />
                        <Divider>Verificação</Divider>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                            <Controller name="verificationCode" control={control} render={({ field }) => 
                                <TextField {...field} label="Código de Verificação" fullWidth error={!!errors.verificationCode} helperText={errors.verificationCode?.message} />
                            } />
                            <Button onClick={handleRequestCode} disabled={isSendingCode}>
                                {isSendingCode ? <CircularProgress size={24} /> : "Enviar Código"}
                            </Button>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : "Verificar e Alterar"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

const DeleteAccountDialog: FC<{ open: boolean; onClose: () => void; userId: string; }> = ({ open, onClose, userId }) => {
    const { showToast } = useToast();
    
    const { control, handleSubmit, reset, formState: { errors, isSubmitting }, setError } = useForm<DeleteAccountFormValues>({
        resolver: zodResolver(deleteAccountSchema),
        defaultValues: { currentPassword: "", confirmText: "" },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await apiFetch(`/api/users/${userId}`, {
                method: "DELETE",
                body: JSON.stringify({ currentPassword: values.currentPassword }),
            });
            
            // Logout completo: limpar todos os dados locais
            localStorage.clear();
            sessionStorage.clear();
            
            // Limpar todos os cookies
            document.cookie.split(";").forEach((c) => {
                const eqPos = c.indexOf("=");
                const name = eqPos > -1 ? c.substr(0, eqPos) : c;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
            });
            
            showToast({ message: "Conta deletada com sucesso. Você será redirecionado.", severity: "success" });
            
            // Redirecionar imediatamente para a tela de login
            setTimeout(() => {
                window.location.replace("/auth/login");
            }, 1500);
            
        } catch (err) {
            applyBackendErrorsToForm(err, setError);
            showToast({ message: "Erro ao deletar conta. Verifique sua senha.", severity: "error" });
        }
    });

    return (
        <Dialog open={open} onClose={onClose} onTransitionExited={reset} fullWidth maxWidth="xs">
            <DialogTitle sx={{ color: 'error.main' }}>
                <DeleteOutline sx={{ mr: 1, verticalAlign: 'middle' }} />
                Deletar Conta
            </DialogTitle>
            <form onSubmit={onSubmit}>
                <DialogContent dividers>
                    <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 500 }}>
                        ⚠️ Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
                    </Typography>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Controller 
                            name="currentPassword" 
                            control={control} 
                            render={({ field }) => 
                                <TextField 
                                    {...field} 
                                    type="password" 
                                    label="Senha Atual" 
                                    fullWidth 
                                    error={!!errors.currentPassword} 
                                    helperText={errors.currentPassword?.message} 
                                />
                            } 
                        />
                        <Controller 
                            name="confirmText" 
                            control={control} 
                            render={({ field }) => 
                                <TextField 
                                    {...field} 
                                    label="Digite 'DELETAR' para confirmar" 
                                    fullWidth 
                                    error={!!errors.confirmText} 
                                    helperText={errors.confirmText?.message || "Digite exatamente 'DELETAR' (maiúsculas)"} 
                                    placeholder="DELETAR"
                                />
                            } 
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" variant="contained" color="error" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : "Deletar Conta"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};


export default function ProfilePage() {
    const { data: apiResponse, loading } = useApi<UserApiResponse>('/api/users/me');    
    const { showToast } = useToast();
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [isSaving, setIsSaving] = useState(false);
    const [pwDialogOpen, setPwDialogOpen] = useState(false);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarRemoved, setAvatarRemoved] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const cpfPersisted = !!user?.cpf;

    const form = useForm<ProfileFormValues>({
      resolver: zodResolver(profileSchema),
      defaultValues: { id: "", name: "", email: "", cpf: "", phone: "", image: "" }
    });

    useEffect(() => {
      if (user) form.reset(mapUserToForm(user));
    }, [user, form]);
    
    useEffect(() => {
      if (!avatarFile) { setAvatarPreview(null); return; }
      const url = URL.createObjectURL(avatarFile);
      setAvatarPreview(url);
      // selecting a new file cancels any previous removal intent
      setAvatarRemoved(false);
      return () => URL.revokeObjectURL(url);
    }, [avatarFile]);

    useEffect(() => {
      if (apiResponse?.data) {
        const userData = apiResponse.data;
        setUser(userData); // <-- Aqui eu guardo os dados do usuário no estado
        form.reset(mapUserToForm(userData));
      }
    }, [apiResponse, form]);

    const handleSave = form.handleSubmit(async (values) => {
      if (!user) return;
      setIsSaving(true);
      try {
          // normalize phone: send only digits or null
          const phoneDigits = values.phone ? String(values.phone).replace(/\D/g, '') : null;

          let response: UserApiResponse;
          if (avatarFile) {
            const form = new FormData();
            form.append('user[avatar]', avatarFile);
            form.append('user[name]', values.name);
            form.append('user[cpf]', values.cpf || '');
            form.append('user[phone]', phoneDigits || '');

            response = await apiFetch<UserApiResponse>(`/api/users/${user.id}`, { method: 'PUT', body: form });
          } else if (avatarRemoved) {
            // user requested removal of avatar
            const body = { user: { name: values.name, cpf: values.cpf || null, phone: phoneDigits || null, avatar: null }};
            response = await apiFetch<UserApiResponse>(`/api/users/${user.id}`, { method: "PUT", body: JSON.stringify(body) });
          } else {
            const body = { user: { 
              name: values.name, 
              cpf: values.cpf || null, 
              phone: phoneDigits || null 
            }};
            response = await apiFetch<UserApiResponse>(`/api/users/${user.id}`, { method: "PUT", body: JSON.stringify(body) });
          }

          const updatedUser = response.data;

          // Persist updated user (including avatarUrl) in the existing session object in localStorage
          saveUserToLocalStorage(updatedUser);

          setMode('view');
          showToast({ message: "Perfil atualizado!", severity: "success" });
          setUser(updatedUser);
          setAvatarRemoved(false);
          window.dispatchEvent(new CustomEvent("profileUpdated"));

      } catch (err: unknown) {
          applyBackendErrorsToForm(err, form.setError);
          showToast({ message: "Erro ao salvar.", severity: "error" });
      } finally {
          setIsSaving(false);
      }
    });

    const handleCancel = () => {
        if (user) form.reset(mapUserToForm(user));
        setAvatarFile(null);
  setAvatarRemoved(false);
        setMode('view');
    }
    
    if (loading) return <Container sx={{py: 4, textAlign: 'center'}}><CircularProgress /></Container>;
    if (!user) return <Container sx={{py: 4}}><Typography color="error">Falha ao carregar perfil.</Typography></Container>;

    return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        boxSizing: 'border-box',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          flexGrow: 1,
          py: { xs: 4, md: 6 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
          <Typography variant="h4" fontWeight={700} gutterBottom>Meu Perfil</Typography>
          <Card>
          <ProfileHeader 
                  user={user} 
                  mode={mode}
                  avatarPreview={avatarPreview}
            setAvatarFile={(f) => { setAvatarFile(f); if (f) setAvatarRemoved(false); }}
                  onSave={handleSave} 
                  onCancel={handleCancel} 
                  onEdit={() => setMode('edit')}
            onClear={() => { setAvatarFile(null); setAvatarRemoved(true); }}
            avatarRemoved={avatarRemoved}
                  isSaving={isSaving}
                />
              <CardContent
                  sx={{
                    // eixo Y primeiro, depois eixo X
                    py: { xs: 3, md: 4 },   // 24 px → 32 px
                    px: { xs: 2, md: 4 },   // 16 px → 32 px
                  }}
                >
                  <Stack spacing={4}>
                      <ProfileForm
                        control={form.control}
                        errors={form.formState.errors}
                        isLocked={mode === 'view' || isSaving}
                        cpfPersisted={cpfPersisted}
                      />
                      <SecuritySettings 
                          onOpenChangePassword={() => setPwDialogOpen(true)} 
                          onOpenChangeEmail={() => setEmailDialogOpen(true)}
                          onOpenDeleteAccount={() => setDeleteAccountDialogOpen(true)}
                      />
                  </Stack>
              </CardContent>
          </Card>
      </Container>
      
      <ChangePasswordDialog open={pwDialogOpen} onClose={() => setPwDialogOpen(false)} userId={user.id} />
      <EmailChangeDialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} userId={user.id} />
      <DeleteAccountDialog open={deleteAccountDialogOpen} onClose={() => setDeleteAccountDialogOpen(false)} userId={user.id} />
    </Box>
  );
}
