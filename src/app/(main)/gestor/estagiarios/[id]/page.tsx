"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EmailIcon from "@mui/icons-material/Email";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import { deleteIntern } from "@/app/lib/api/interns";
import { useToast } from "@/app/contexts/ToastContext";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { usePushWithProgress } from "@/app/hooks/usePushWithProgress";
// Detalhe local simplificado para o que esta página precisa
interface InternDetail {
  id: string;
  name: string;
  avatar?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  appointmentsCompleted?: number;
  appointmentsScheduled?: number;
}

// (not using global Intern type here)

function formatPhone(raw?: string | number | null) {
  if (!raw) return "";
  const s = String(raw).replace(/\D/g, "");
  if (!s) return "";
  if (s.length === 10) return `(${s.slice(0,2)}) ${s.slice(2,6)}-${s.slice(6)}`;
  if (s.length === 11) return `(${s.slice(0,2)}) ${s.slice(2,7)}-${s.slice(7)}`;
  return s;
}

const Section = ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) => (
  <Box>
    <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>{title}</Stack>
    <Divider />
    <Box mt={2}>{children}</Box>
  </Box>
);

export default function InternDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname?.split("/").pop() ?? "";

  const [intern, setIntern] = useState<InternDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();
  const pushWithProgress = usePushWithProgress();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const resp = await apiFetch(`/api/users/${id}`);
  const u = (resp as unknown as { data: Record<string, unknown> }).data as Record<string, unknown>;
        // normalize to Intern shape as much as possible
        const loaded: InternDetail = {
          id: String(u["id"] ?? id),
          name: (u["name"] as string | undefined) ?? "",
          avatar: (u["avatarUrl"] as string | undefined) ?? (u["avatar"] as string | undefined) ?? null,
          email: (u["email"] as string | undefined) ?? null,
          phone: (u["phone"] as string | undefined) ?? null,
          status: (u["status"] as string | undefined) ?? null,
          appointmentsCompleted: Number((u["appointmentsCompleted"] as number | undefined) ?? 0),
          appointmentsScheduled: Number((u["appointmentsScheduled"] as number | undefined) ?? 0),
        };
        setIntern(loaded);
      } catch (err) {
        console.error(err);
        setError("Falha ao carregar estagiário.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleEdit = () => {
    if (!intern) return;
    pushWithProgress(`/gestor/gestao-de-estagiarios/editar/${intern.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!intern) return;
    try {
      await deleteIntern(intern.id);
      showToast({ message: `Estagiário "${intern.name}" apagado.`, severity: "success" });
      router.push("/gestor/gestao-de-estagiarios");
    } catch (err) {
      console.error(err);
      showToast({ message: "Erro ao apagar estagiário.", severity: "error" });
    }
  };

  if (loading) return <Container sx={{ py: 6, textAlign: "center" }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ py: 6 }}><Typography color="error">{error}</Typography></Container>;
  if (!intern) return <Container sx={{ py: 6 }}><Typography color="text.secondary">Estagiário não encontrado.</Typography></Container>;

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', boxSizing: 'border-box' }}>
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 4, md: 6 }, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Detalhes do Estagiário</Typography>

        <Card>
          <CardHeader
            sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, md: 4 } }}
            avatar={<Avatar src={intern.avatar ?? undefined} sx={{ width: 96, height: 96 }}>{intern.name?.[0]}</Avatar>}
            disableTypography
            title={
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={3} alignItems="center">
                  <Box>
                    <Typography variant="h5" fontWeight={600}>{intern.name}</Typography>
                    <Typography color="text.secondary">{intern.email}</Typography>
                  </Box>
                </Stack>
                <Box>
                  <Stack direction="row" spacing={1}>
                    <Button startIcon={<EditIcon />} onClick={handleEdit} variant="contained">Editar</Button>
                    <Button startIcon={<DeleteOutlineIcon />} color="error" variant="outlined" onClick={() => setConfirmOpen(true)}>Apagar</Button>
                  </Stack>
                </Box>
              </Stack>
            }
          />

          <CardContent sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, md: 4 } }}>
            <Stack spacing={4}>
              <Section title={<><EmailIcon /> <Typography variant="h6">Contato</Typography></>}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <Typography color="text.secondary">Email</Typography>
                      <Typography>{intern.email ?? '—'}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <Typography color="text.secondary">Telefone</Typography>
                      <Typography>{formatPhone(intern.phone) || '—'}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Section>

              <Section title={<><Typography variant="h6">Dados</Typography></>}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <Typography color="text.secondary">Status</Typography>
                      <Typography><strong>{intern.status || '—'}</strong></Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <Typography color="text.secondary">Consultas realizadas</Typography>
                      <Typography><strong>{intern.appointmentsCompleted}</strong></Typography>
                    </Stack>
                    <Stack spacing={1} mt={2}>
                      <Typography color="text.secondary">Consultas agendadas</Typography>
                      <Typography><strong>{intern.appointmentsScheduled}</strong></Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Section>
            </Stack>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={confirmOpen}
          title="Apagar estagiário"
          description={`Tem certeza que deseja apagar o estagiário "${intern.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Apagar"
          cancelLabel="Cancelar"
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      </Container>
    </Box>
  );
}
