import { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  Alert,
  Chip,
  TextField,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import type { AuditPlan } from '@/types/audit';
import { BRAND_BLUE, PLAN_OPTIONS } from '@/constants/audit.constants';

const isAllowedExt = (name = '') => /\.(pdf|doc|docx|xls|xlsx)$/i.test(name);

interface UploadPlanFormProps {
  onPlanAdd: (newPlan: Omit<AuditPlan, 'id' | 'createdAt' | 'reports' | 'fileMeta'>, file: File) => Promise<void>;
  loading: boolean;
  setSnack: (snack: { open: boolean; msg: string; sev: 'success' | 'error' | 'warning' }) => void;
}

export default function UploadPlanForm({ onPlanAdd, loading, setSnack }: UploadPlanFormProps) {
  const [planType, setPlanType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [submitTried, setSubmitTried] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const f = e.target.files?.[0];
    if (!f) return;
    if (!isAllowedExt(f.name)) {
      setError('Formato no permitido. Sube PDF, Word (.doc/.docx) o Excel (.xls/.xlsx).');
      setFile(null);
      setSnack({ open: true, msg: 'Formato no permitido.', sev: 'error' });
      return;
    }
    setFile(f);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitTried(true);
    setError('');

    if (!planType) {
      setSnack({ open: true, msg: 'Selecciona el tipo de plan.', sev: 'warning' });
      return;
    }
    if (!description.trim()) {
      setSnack({ open: true, msg: 'No es posible subir el plan: la descripción es obligatoria.', sev: 'warning' });
      return;
    }
    if (!file) {
      setSnack({ open: true, msg: 'Selecciona un archivo.', sev: 'warning' });
      setError('Selecciona el archivo del plan de auditoría.');
      return;
    }
    
    const newPlanData = {
      planType,
      planLabel: PLAN_OPTIONS.find((p) => p.value === planType)?.label || '',
      description: description.trim(),
    };

    await onPlanAdd(newPlanData, file);

    // Clear form
    setFile(null);
    setDescription('');
    setPlanType('');
    setSubmitTried(false);
  };
  
  const handleClear = () => {
    setPlanType('');
    setDescription('');
    setSubmitTried(false);
    setFile(null);
    setError('');
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <DescriptionIcon sx={{ color: BRAND_BLUE }} />
        <Typography variant="h6" fontWeight={700}>Cargue el plan de auditoría</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Selecciona el tipo de plan de auditoría, escribe una breve descripción y sube el archivo correspondiente.
      </Typography>

      <FormControl fullWidth>
        <InputLabel id="plan-type-label">Tipo de Plan de Auditoría</InputLabel>
        <Select labelId="plan-type-label" value={planType} label="Tipo de Plan de Auditoría" onChange={(e) => setPlanType(e.target.value)}>
          {PLAN_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
        </Select>
        <FormHelperText>{(PLAN_OPTIONS.find((p) => p.value === planType)?.hint) || 'Elige una opción.'}</FormHelperText>
      </FormControl>

      <TextField
        label="Descripción del plan"
        placeholder="Ejemplo: Plan basado en riesgos para procesos críticos 2025."
        multiline
        minRows={2}
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={() => { if (!description.trim()) setSubmitTried(true); }}
        error={submitTried && !description.trim()}
        helperText={submitTried && !description.trim() ? 'La descripción del plan es obligatoria.' : ' '}
        fullWidth
      />

      {planType && (
        <Box component="form" onSubmit={handleUpload}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">Archivo del Plan de Auditoría</Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}
                sx={{ minWidth: 220, borderRadius: 2, borderColor: BRAND_BLUE, color: BRAND_BLUE }}>
                Seleccionar archivo
                <input type="file" hidden onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx" />
              </Button>

              <Stack flex={1}>
                {file ? <Chip label={file.name} variant="outlined" sx={{ alignSelf: 'flex-start' }} /> :
                  <Typography variant="body2" color="text.secondary">Ningún archivo seleccionado</Typography>}
                <FormHelperText>Formatos permitidos: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)</FormHelperText>
              </Stack>
            </Stack>

            {error && <Alert severity="warning">{error}</Alert>}

            <Stack direction="row" spacing={1}>
              <Button
                type="submit"
                variant="contained"
                disableElevation
                sx={{ borderRadius: 2, bgcolor: BRAND_BLUE, '&:hover': { bgcolor: BRAND_BLUE } }}
                disabled={!planType || !file || loading}
              >
                {loading ? 'Cargando...' : 'Cargar Plan de Auditoría'}
              </Button>
              <Button
                variant="text"
                onClick={handleClear}
                sx={{ color: BRAND_BLUE }}
              >
                Limpiar
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
