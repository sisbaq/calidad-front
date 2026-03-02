import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material';
import type { Activity } from './ManageImprovementPlanModal';

interface AddActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (activity: Activity) => void | Promise<void>;
}

const BLUE = '#142334';

export default function AddActivityModal({
  open,
  onClose,
  onSave,
}: AddActivityModalProps) {
  const [activityName, setActivityName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [dateError, setDateError] = useState('');

  const handleSave = async () => {
    if (!activityName.trim()) {
      return;
    }

    if (!dueDate) {
      setDateError('La fecha de finalización es requerida');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        description: activityName.trim(),
        dueDate,
      });
      setActivityName('');
      setDueDate('');
      setDateError('');
      onClose();
    } catch (error) {
      console.error('Failed to save activity:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setActivityName('');
      setDueDate('');
      setDateError('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: BLUE }}>
        Añadir Nueva Actividad
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Nombre de la Actividad"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={saving}
            placeholder="Ingrese el nombre de la actividad..."
            helperText="Descripción de la actividad de mejoramiento"
          />

          <TextField
            fullWidth
            type="date"
            label="Fecha de Finalización"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              if (e.target.value) setDateError('');
            }}
            disabled={saving}
            InputLabelProps={{ shrink: true }}
            error={!!dateError}
            helperText={dateError || 'Fecha en que terminará esta actividad'}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={saving}
          sx={{ textTransform: 'none' }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!activityName.trim() || !dueDate || saving}
          variant="contained"
          sx={{
            bgcolor: BLUE,
            '&:hover': { bgcolor: '#0e1926' },
            textTransform: 'none',
            fontWeight: 700,
          }}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
