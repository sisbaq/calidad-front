import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';

interface AddActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (activityName: string) => void | Promise<void>;
}

const BLUE = '#142334';

export default function AddActivityModal({
  open,
  onClose,
  onSave,
}: AddActivityModalProps) {
  const [activityName, setActivityName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!activityName.trim()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(activityName.trim());
      setActivityName('');
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
        <Box sx={{ pt: 1 }}>
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
            helperText="Presione Enter para guardar"
          />
        </Box>
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
          disabled={!activityName.trim() || saving}
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
