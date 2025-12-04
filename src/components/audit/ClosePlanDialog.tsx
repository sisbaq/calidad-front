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

interface ClosePlanDialogProps {
  open: boolean;
  onClose: () => void;
  plan: { id: string } | null;
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

  React.useEffect(() => {
    if (open) setMotivo('');
  }, [open]);

  const handleClosePlan = () => {
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
          disabled={!motivo.trim()}
        >
          Cerrar plan
        </Button>
      </DialogActions>
    </Dialog>
  );
}
