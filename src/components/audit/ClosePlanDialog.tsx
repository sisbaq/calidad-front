import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Stack
} from '@mui/material';
import { getImprovementPlanActivitiesByPlanId } from '@/services/improvement.service';
import type { ImprovementPlanActivity } from '@/types/improvement';

interface ClosePlanDialogProps {
  open: boolean;
  onClose: () => void;
  plan: {
    id: string;
    activities?: Array<{ closed: boolean }>;
  } | null;
  colorPrimary?: string;
  colorSuccess?: string;
  onConfirm?: (payload: { planId: string; motivo: string }) => void;
}

export default function ClosePlanDialog({
  open,
  onClose,
  plan,
  colorPrimary = '#0e2336',
  colorSuccess = '#01b43d',
  onConfirm,
}: ClosePlanDialogProps) {
  const [motivo, setMotivo] = React.useState<string>('');
  const [activitiesLoading, setActivitiesLoading] = React.useState(false);
  const [activitiesError, setActivitiesError] = React.useState<string | null>(null);
  const [planActivities, setPlanActivities] = React.useState<ImprovementPlanActivity[]>([]);

  const effectiveActivities = plan?.activities ?? planActivities;
  const hasOpenActivities = Boolean(effectiveActivities.some((activity) => !activity.closed));

  React.useEffect(() => {
    if (!open) return;

    setMotivo('');
    setActivitiesError(null);

    if (plan?.activities) {
      setPlanActivities([]);
      setActivitiesLoading(false);
      return;
    }

    if (!plan?.id) {
      setPlanActivities([]);
      setActivitiesLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);
        const activities = await getImprovementPlanActivitiesByPlanId(plan.id);
        setPlanActivities(activities);
      } catch (error) {
        console.error('Error fetching activities for close validation:', error);
        setPlanActivities([]);
        setActivitiesError('No se pudieron validar las actividades del plan.');
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, [open, plan?.id, plan?.activities]);

  const handleClosePlan = () => {
    if (hasOpenActivities) return;
    if (plan?.id && onConfirm) {
      onConfirm({ planId: plan.id, motivo: motivo.trim() });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: colorPrimary }}>
        Cerrar Plan de Mejoramiento
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="warning">
            Esta acción marcará el plan como <b>completado</b> y no se podrá deshacer.
          </Alert>

          {activitiesLoading && (
            <Alert severity="info">
              Validando actividades del plan...
            </Alert>
          )}

          {activitiesError && (
            <Alert severity="error">
              {activitiesError}
            </Alert>
          )}

          {hasOpenActivities && (
            <Alert severity="error">
              No se puede cerrar el plan mientras existan actividades sin cerrar.
            </Alert>
          )}

          <TextField
            label="Motivo del cierre"
            placeholder="Describe por qué se cierra el plan"
            multiline
            minRows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            sx={{
              '& label.Mui-focused': { color: colorPrimary },
              '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: colorPrimary },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleClosePlan}
          variant="contained"
          sx={{ bgcolor: colorSuccess, color: '#fff', '&:hover': { bgcolor: colorSuccess } }}
          disabled={!motivo.trim() || hasOpenActivities || activitiesLoading || Boolean(activitiesError)}
        >
          Cerrar plan
        </Button>
      </DialogActions>
    </Dialog>
  );
}
