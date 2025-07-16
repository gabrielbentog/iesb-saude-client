"use client";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Typography,
  useTheme,
  styled,
  CircularProgress,
  Fade,
  Collapse,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Schedule as ScheduleIcon,
  Shield as ShieldIcon,
  DeleteOutline as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Notifications as NotificationsIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { useToast } from '@/app/contexts/ToastContext';
import type { User } from '@/app/types';

// ────────────────────────────────────────────────────────────────────────────────
// Styled Components
// ────────────────────────────────────────────────────────────────────────────────
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: theme.shadows[1],
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
}));

const EditableField = styled(Box)(({ theme }) => ({
  position: "relative",
  borderRadius: 8,
  padding: theme.spacing(2),
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(3, 3, 2, 3),
  "& .section-title": {
    fontWeight: 600,
    fontSize: "1.125rem",
    color: theme.palette.text.primary,
  },
  "& .section-icon": {
    color: theme.palette.primary.main,
  },
}));

const SectionDivider = styled(Box)(({ theme }) => ({
  height: 32,
  display: "flex",
  alignItems: "center",
  margin: theme.spacing(1, 0),
  "& .MuiDivider-root": {
    flex: 1,
  },
}));

// ────────────────────────────────────────────────────────────────────────────────
// Editable Field Component
// ────────────────────────────────────────────────────────────────────────────────
interface EditableFieldProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  isEditing: boolean;
  onChange: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  type?: "text" | "email" | "password";
  required?: boolean;
  disabled?: boolean;
  description?: string;
}

function EditableFieldComponent({
  label,
  value,
  icon,
  isEditing,
  onChange,
  onEdit,
  onSave,
  onCancel,
  type = "text",
  required = false,
  disabled = false,
  description,
}: EditableFieldProps) {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(localValue);
    onSave();
  };

  const handleCancel = () => {
    setLocalValue(value);
    onCancel();
  };

  return (
    <EditableField>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {icon}
          <Box>
            <Typography variant="body1" fontWeight={500}>
              {label}
              {required && <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {description}
              </Typography>
            )}
          </Box>
        </Box>
        
        {!disabled && (
          <Box sx={{ display: "flex", gap: 1 }}>
            {isEditing ? (
              <>
                <IconButton size="small" onClick={handleSave} color="primary">
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleCancel} color="secondary">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <IconButton size="small" onClick={onEdit} sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ ml: 4 }}>
        <Collapse in={isEditing}>
          <TextField
            fullWidth
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            variant="outlined"
            size="small"
            type={type === "password" && !showPassword ? "password" : "text"}
            InputProps={{
              endAdornment: type === "password" && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Collapse>

        <Collapse in={!isEditing}>
          <Typography
            variant="body1"
            sx={{
              minHeight: 24,
              py: 1,
              color: value ? "text.primary" : "text.secondary",
              fontStyle: value ? "normal" : "italic",
            }}
          >
            {type === "password" ? "••••••••" : value || "Não informado"}
          </Typography>
        </Collapse>
      </Box>
    </EditableField>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Preference Toggle Component
// ────────────────────────────────────────────────────────────────────────────────
interface PreferenceToggleProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function PreferenceToggle({ label, description, icon, checked, onChange }: PreferenceToggleProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {icon}
        <Box>
          <Typography variant="body1" fontWeight={500}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>
      <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </Box>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Action Button Component
// ────────────────────────────────────────────────────────────────────────────────
interface ActionButtonProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: "primary" | "error";
  variant?: "contained" | "outlined";
}

function ActionButton({ label, description, icon, onClick, color = "primary", variant = "outlined" }: ActionButtonProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        {icon}
        <Box>
          <Typography variant="body1" fontWeight={500}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ ml: 4 }}>
        <Button
          variant={variant}
          color={color}
          startIcon={icon}
          onClick={onClick}
          sx={{ 
            textTransform: "none",
            borderRadius: 2,
            px: 3,
            py: 1,
          }}
        >
          {label}
        </Button>
      </Box>
    </Box>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────────────────────
export default function PerfilPage() {
  const theme = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    darkMode: false,
    twoFactorAuth: false,
  });

  const { showToast } = useToast();

  // ───────────── Fetch User Data ─────────────
  useEffect(() => {
    let ignore = false;
    setLoadingUser(true);
    const session = localStorage.getItem("session");
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed?.user) {
        if (!ignore) {
          setUser(parsed.user);
          setLoadingUser(false);
        }
      } else {
        if (!ignore) setLoadingUser(false);
      }
    } else {
      if (!ignore) setLoadingUser(false);
    }
    return () => {
      ignore = true;
    };
  }, []);

  // ───────────── Handlers ─────────────
  const handleEdit = (field: string) => {
    setEditingFields(prev => ({ ...prev, [field]: true }));
  };

  const handleSave = async (field: string) => {
    if (!user) return;

    try {
      const res = await apiFetch<User>(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          user: {
            [field]: user[field as keyof User],
          },
        }),
      });

      const updatedUser = (res as any).data ? (res as any).data : res;
      
      const session = localStorage.getItem("session");
      if (session) {
        const parsed = JSON.parse(session);
        parsed.user = { ...parsed.user, ...updatedUser };
        localStorage.setItem("session", JSON.stringify(parsed));
      }

      setEditingFields(prev => ({ ...prev, [field]: false }));
      setUnsavedChanges(false);
      showToast({ message: "Perfil atualizado com sucesso!", severity: "success" });
    } catch (err: any) {
      console.error("Falha ao atualizar perfil:", err);
      showToast({ message: `Erro ao atualizar perfil: ${err.message || 'Erro desconhecido'}`, severity: "error" });
    }
  };

  const handleCancel = (field: string) => {
    setEditingFields(prev => ({ ...prev, [field]: false }));
    setUnsavedChanges(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, [field]: value } : null);
    setUnsavedChanges(true);
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    showToast({ message: "Preferência atualizada!", severity: "success" });
  };

  // ───────────── Loading State Render ─────────────
  if (loadingUser) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <Typography variant="h6" color="text.secondary">Não foi possível carregar as informações do perfil.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: "auto", px: 3 }}>
        
        {/* Header com Avatar e Informações Básicas */}
        <StyledCard sx={{ mb: 4, overflow: "visible" }}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: "white",
              p: 4,
              borderRadius: "16px 16px 0 0",
              position: "relative",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
              <Avatar
                src={user.image || undefined}
                alt={user.name || "Usuário"}
                sx={{
                  width: 80,
                  height: 80,
                  border: `3px solid ${alpha(theme.palette.common.white, 0.3)}`,
                  bgcolor: !user.image ? theme.palette.secondary.main : undefined,
                  fontSize: 28,
                  fontWeight: 600,
                  boxShadow: theme.shadows[4],
                }}
              >
                {!user.image && user.name
                  ? user.name
                      .trim()
                      .split(" ")
                      .map((word) => word[0]?.toUpperCase())
                      .slice(0, 2)
                      .join("")
                  : null}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Meu Perfil
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                  Gerencie suas informações pessoais e configurações
                </Typography>
                <Chip
                  label={`Membro desde ${new Date(user.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`}
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                    color: "white",
                    fontWeight: 500,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </StyledCard>

        {/* Alerta de Mudanças Não Salvas */}
        <Fade in={unsavedChanges}>
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 2 }}
            icon={<WarningIcon />}
          >
            Você tem alterações não salvas. Certifique-se de salvar antes de sair.
          </Alert>
        </Fade>

        {/* Card Principal com Todas as Seções */}
        <StyledCard>
          
          {/* Seção: Informações Pessoais */}
          <SectionHeader>
            <PersonIcon className="section-icon" />
            <Typography className="section-title">Informações Pessoais</Typography>
          </SectionHeader>
          
          <EditableFieldComponent
            label="Nome completo"
            value={user.name || ""}
            icon={<PersonIcon fontSize="small" color="primary" />}
            isEditing={editingFields.name || false}
            onChange={(value) => handleFieldChange("name", value)}
            onEdit={() => handleEdit("name")}
            onSave={() => handleSave("name")}
            onCancel={() => handleCancel("name")}
            required
            description="Como você gostaria de ser chamado"
          />

          <EditableFieldComponent
            label="E-mail"
            value={user.email || ""}
            icon={<EmailIcon fontSize="small" color="primary" />}
            isEditing={editingFields.email || false}
            onChange={(value) => handleFieldChange("email", value)}
            onEdit={() => handleEdit("email")}
            onSave={() => handleSave("email")}
            onCancel={() => handleCancel("email")}
            type="email"
            required
            description="E-mail para login e notificações"
          />

          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <ScheduleIcon fontSize="small" color="primary" />
              <Typography variant="body1" fontWeight={500}>
                Data de cadastro
              </Typography>
            </Box>
            <Box sx={{ ml: 4 }}>
              <Typography variant="body1" sx={{ py: 1 }}>
                {new Date(user.createdAt).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID do usuário: {user.id}
              </Typography>
            </Box>
          </Box>

          <SectionDivider>
            <Divider />
          </SectionDivider>

          {/* Seção: Preferências */}
          <SectionHeader>
            <PaletteIcon className="section-icon" />
            <Typography className="section-title">Preferências</Typography>
          </SectionHeader>
          
          <PreferenceToggle
            label="Notificações por E-mail"
            description="Receba atualizações importantes por e-mail"
            icon={<NotificationsIcon fontSize="small" color="primary" />}
            checked={preferences.emailNotifications}
            onChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
          />

          <PreferenceToggle
            label="Modo Escuro"
            description="Alterar aparência da interface"
            icon={<PaletteIcon fontSize="small" color="primary" />}
            checked={preferences.darkMode}
            onChange={(checked) => handlePreferenceChange("darkMode", checked)}
          />

          <SectionDivider>
            <Divider />
          </SectionDivider>

          {/* Seção: Segurança */}
          <SectionHeader>
            <SecurityIcon className="section-icon" />
            <Typography className="section-title">Segurança</Typography>
          </SectionHeader>
          
          <PreferenceToggle
            label="Autenticação de dois fatores"
            description="Adicione uma camada extra de segurança à sua conta"
            icon={<ShieldIcon fontSize="small" color="primary" />}
            checked={preferences.twoFactorAuth}
            onChange={(checked) => handlePreferenceChange("twoFactorAuth", checked)}
          />

          <ActionButton
            label="Alterar Senha"
            description="Mantenha sua conta segura com uma senha forte"
            icon={<LockIcon fontSize="small" />}
            onClick={() => showToast({ message: "Funcionalidade em desenvolvimento", severity: "info" })}
          />

          <SectionDivider>
            <Divider />
          </SectionDivider>

          {/* Seção: Zona de Perigo */}
          <SectionHeader>
            <WarningIcon className="section-icon" sx={{ color: "error.main !important" }} />
            <Typography className="section-title" sx={{ color: "error.main !important" }}>
              Zona de Perigo
            </Typography>
          </SectionHeader>
          
          <ActionButton
            label="Excluir Conta"
            description="Esta ação apagará permanentemente sua conta e não poderá ser desfeita"
            icon={<DeleteIcon fontSize="small" />}
            onClick={() => showToast({ message: "Funcionalidade em desenvolvimento", severity: "info" })}
            color="error"
          />

        </StyledCard>
      </Box>
    </Box>
  );
}