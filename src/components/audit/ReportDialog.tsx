import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import type { AuditReport } from '@/types/audit';
import { BRAND_BLUE } from '@/constants/audit.constants';

const isAllowedExt = (name = '') => /\.(pdf|doc|docx|xls|xlsx)$/i.test(name);

interface ReportDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  report: AuditReport | null;
  onClose: () => void;
  onSave: (desc: string, file: File | null) => Promise<void>;
  isSaving?: boolean;
}

export default function ReportDialog({
  open,
  mode,
  report,
  onClose,
  onSave,
  isSaving = false,
}: ReportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setDesc(mode === 'edit' && report ? report.desc || '' : '');
      setFile(null);
      setError('');
    }
  }, [open, mode, report]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!isAllowedExt(f.name)) {
      setFile(null);
      setError('Formato no permitido. Usa PDF/DOC/XLS.');
      return;
    }
    setFile(f);
    setError('');
  };

  const handleSave = () => {
    if (mode === 'create' && !file) {
      setError('Selecciona un archivo para el informe.');
      return;
    }
    onSave(desc, file);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Subir informe' : 'Editar informe'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Descripción del informe (opcional)"
            multiline
            minRows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            fullWidth
          />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              {mode === 'create' ? 'Selecciona el archivo' : 'Cambiar archivo (opcional)'}
            </Typography>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
              {mode === 'create' ? 'Seleccionar archivo' : 'Seleccionar nuevo archivo'}
              <input type="file" hidden onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx" />
            </Button>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {file
                ? file.name
                : mode === 'edit'
                ? 'Mantener archivo actual si no seleccionas uno nuevo.'
                : 'Ningún archivo seleccionado'}
            </Typography>

            {error && <Alert severity="warning" sx={{ mt: 1 }}>{error}</Alert>}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          sx={{ bgcolor: BRAND_BLUE, '&:hover': { bgcolor: BRAND_BLUE } }}
        >
          {isSaving ? (
            <CircularProgress size={24} color="inherit" />
          ) : mode === 'create' ? (
            'Subir informe'
          ) : (
            'Guardar'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
