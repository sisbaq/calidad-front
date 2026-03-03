import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import type { AutoControlOption, AutoControlRecord } from '@/types/autocontrol';
import { appColors } from '@/theme/colors';
import { isoToLocalDateString, localDateStringToIso } from '@/utils/dateUtils';

interface AutoControlRecordDialogProps {
  open: boolean;
  draft: AutoControlRecord;
  tipoAutocontrolOptions: AutoControlOption[];
  origenOptions: AutoControlOption[];
  onClose: () => void;
  onSave: () => void;
  onSetDraft: Dispatch<SetStateAction<AutoControlRecord>>;
}

export default function AutoControlRecordDialog({
  open,
  draft,
  tipoAutocontrolOptions,
  origenOptions,
  onClose,
  onSave,
  onSetDraft,
}: AutoControlRecordDialogProps) {
  const fechaValue = isoToLocalDateString(draft.finding.hacCreado);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: appColors.blue, color: '#fff', fontWeight: 700 }}>
        Crear plan
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Typography sx={{ fontWeight: 700, color: appColors.green }}>
            Datos del hallazgo
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Tipo</InputLabel>
                <Select
                  label="Tipo"
                  value={draft.finding.fkTipoAutocontrol || ''}
                  onChange={(e) =>
                    onSetDraft((prev) => ({
                      ...prev,
                      finding: {
                        ...prev.finding,
                        fkTipoAutocontrol: Number(e.target.value),
                      },
                    }))
                  }
                >
                  {tipoAutocontrolOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                type="date"
                label="Fecha"
                value={fechaValue}
                onChange={(e) =>
                  onSetDraft((prev) => ({
                    ...prev,
                    finding: { ...prev.finding, hacCreado: localDateStringToIso(e.target.value) },
                  }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Fuente</InputLabel>
                <Select
                  label="Fuente"
                  value={draft.finding.fkOrigen || ''}
                  onChange={(e) =>
                    onSetDraft((prev) => ({
                      ...prev,
                      finding: { ...prev.finding, fkOrigen: Number(e.target.value) },
                    }))
                  }
                >
                  {origenOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="Numeral o requisito legal"
                value={draft.finding.hacNormaNumeral}
                onChange={(e) =>
                  onSetDraft((prev) => ({
                    ...prev,
                    finding: { ...prev.finding, hacNormaNumeral: e.target.value },
                  }))
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                multiline
                minRows={4}
                label="Condición"
                value={draft.plan.pmaAnalisisDeCausa}
                onChange={(e) =>
                  onSetDraft((prev) => ({
                    ...prev,
                    plan: { ...prev.plan, pmaAnalisisDeCausa: e.target.value },
                  }))
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                multiline
                minRows={4}
                label="Descripción"
                value={draft.finding.hacDescripcion}
                onChange={(e) =>
                  onSetDraft((prev) => ({
                    ...prev,
                    finding: { ...prev.finding, hacDescripcion: e.target.value },
                  }))
                }
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          sx={{ textTransform: 'none', bgcolor: appColors.green }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
