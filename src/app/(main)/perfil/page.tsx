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
import { useForm, Controller, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { apiFetch } from "@/app/lib/api";
import { useToast } from "@/app/contexts/ToastContext";
import { useApi } from "@/app/hooks/useApi";
import type { User } from '@/app/types';

// --- Schemas e Tipos ---
const profileSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2, "Informe o nome completo."),
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


interface UserApiResponse {
    data: User;
}

// --- Helpers ---
const initialsFromName = (name?: string): string => !name ? "?" : name.trim().split(/\s+/).slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");

const mapUserToForm = (user: User): Omit<ProfileFormValues, 'currentPassword'> => ({
  id: user.id, 
  name: user.name ?? "", 
  email: user.email ?? "",
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
};

const applyBackendErrorsToForm = (err: unknown, setError: UseFormReturn<any>['setError']) => {
    const apiError = err as { status?: number; data?: { errors?: Record<string, string[]> } };
    if (apiError?.status === 422 && apiError?.data?.errors) {
        Object.entries(apiError.data.errors).forEach(([key, msgs]) => {
            setError(key, { type: "server", message: msgs.join(", ") });
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
    isSaving: boolean;
}> = ({ user, mode, avatarPreview, setAvatarFile, onSave, onCancel, onEdit, isSaving }) => (
    <CardHeader
      disableTypography
      title={
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={3} alignItems="center">
            <ProfileAvatarUploader
                mode={mode}
                avatarUrl={avatarPreview || user.image} 
                name={user.name ?? undefined}
                onClear={() => setAvatarFile(null)}
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
}> = ({ control, errors, isLocked }) => (
  <Section title={<><Person /> <Typography variant="h6">Informações Pessoais</Typography></>}>
    <Grid container spacing={2}>
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
    </Grid>
  </Section>
);

const SecuritySettings: FC<{ onOpenChangePassword: () => void; onOpenChangeEmail: () => void; }> = ({ onOpenChangePassword, onOpenChangeEmail }) => (
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
            await apiFetch(`/api/users/${userId}/change-password`, {
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


export default function ProfilePage() {
    const { data: apiResponse, loading } = useApi<UserApiResponse>('/api/users/me');    
    const { showToast } = useToast();
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [isSaving, setIsSaving] = useState(false);
    const [pwDialogOpen, setPwDialogOpen] = useState(false);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const form = useForm<ProfileFormValues>({
      resolver: zodResolver(profileSchema),
      defaultValues: { id: "", name: "", email: "", image: "" }
    });

    useEffect(() => {
      if (user) form.reset(mapUserToForm(user));
    }, [user, form]);
    
    useEffect(() => {
      if (!avatarFile) { setAvatarPreview(null); return; }
      const url = URL.createObjectURL(avatarFile);
      setAvatarPreview(url);
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
          const body = { user: { name: values.name } };
          const response = await apiFetch<UserApiResponse>(`/api/users/${user.id}`, { method: "PUT", body: JSON.stringify(body) });
          const updatedUser = response.data;
          saveUserToLocalStorage(updatedUser);
          setMode('view');
          showToast({ message: "Perfil atualizado!", severity: "success" });
          setUser(updatedUser);
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
        bgcolor: 'grey.50',
        boxSizing: 'border-box',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          flexGrow: 1,
          py: 6, // padding moveu pra dentro
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
                  setAvatarFile={setAvatarFile}
                  onSave={handleSave} 
                  onCancel={handleCancel} 
                  onEdit={() => setMode('edit')}
                  isSaving={isSaving}
              />
              <CardContent>
                  <Stack spacing={4}>
                      <ProfileForm control={form.control} errors={form.formState.errors} isLocked={mode === 'view' || isSaving} />
                      <SecuritySettings 
                          onOpenChangePassword={() => setPwDialogOpen(true)} 
                          onOpenChangeEmail={() => setEmailDialogOpen(true)}
                      />
                  </Stack>
              </CardContent>
          </Card>
      </Container>
      
      <ChangePasswordDialog open={pwDialogOpen} onClose={() => setPwDialogOpen(false)} userId={user.id} />
      <EmailChangeDialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} userId={user.id} />
    </Box>
  );
}
