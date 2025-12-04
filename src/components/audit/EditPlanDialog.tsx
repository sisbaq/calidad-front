import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import type { AuditPlan } from '@/types/audit';
import { BRAND_BLUE, PLAN_OPTIONS } from '@/constants/audit.constants';

const isAllowedExt = (name = '') => /\.(pdf|doc|docx|xls|xlsx)$/i.test(name);

interface EditPlanDialogProps {
  open: boolean;
  plan: AuditPlan | null;
  onClose: () => void;
  onSave: (updatedPlan: AuditPlan, newFile: File | null) => Promise<void>;
}

export default function EditPlanDialog({ open, plan, onClose, onSave }: EditPlanDialogProps) {
  const [editType, setEditType] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editError, setEditError] = useState('');
  const [editDescError, setEditDescError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (plan) {
      setEditType(plan.planType);
      setEditDescription(plan.description || '');
      setEditFile(null);
      setEditError('');
      setEditDescError('');
      setIsSaving(false);
    }
  }, [plan]);

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditError('');
    const f = e.target.files?.[0];
    if (!f) return;
    if (!isAllowedExt(f.name)) {
      setEditError('Formato no permitido. Usa PDF, DOC/DOCX o XLS/XLSX.');
      setEditFile(null);
      return;
    }
    setEditFile(f);
  };

  const handleSave = async () => {
    if (!plan || isSaving) return;

    if (!editType) {
      setEditError('Selecciona el tipo de plan.');
      return;
    }
    if (!editDescription.trim()) {
      setEditDescError('La descripción del plan es obligatoria.');
      return;
    }

    const updated: AuditPlan = {
      ...plan,
      planType: editType,
      planLabel: PLAN_OPTIONS.find((p) => p.value === editType)?.label || '',
      description: editDescription.trim(),
    };
    
    setIsSaving(true);
    try {
      await onSave(updated, editFile);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar plan de auditoría</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="edit-plan-type-label">Tipo de Plan</InputLabel>
            <Select
              labelId="edit-plan-type-label"
              value={editType}
              label="Tipo de Plan"
              onChange={(e) => setEditType(e.target.value)}
            >
              {PLAN_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{PLAN_OPTIONS.find((t) => t.value === editType)?.hint || ''}</FormHelperText>
          </FormControl>

          <TextField
            label="Descripción del plan"
            multiline
            minRows={2}
            required
            value={editDescription}
            onChange={(e) => {
              setEditDescription(e.target.value);
              if (editDescError) setEditDescError('');
            }}
            error={!!editDescError}
            helperText={editDescError || ' '}
            fullWidth
          />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Reemplazar archivo (opcional)
            </Typography>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
              Seleccionar archivo
              <input type="file" hidden onChange={handleEditFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx" />
            </Button>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {editFile ? editFile.name : 'Sin cambios de archivo'}
            </Typography>
            {editError && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                {editError}
              </Alert>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          sx={{ bgcolor: BRAND_BLUE, '&:hover': { bgcolor: BRAND_BLUE } }}
        >
          {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Guardar cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
