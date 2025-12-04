import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Autocomplete, { type AutocompleteChangeReason } from '@mui/material/Autocomplete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

type Option = string;

export interface PlanSearchFiltersValue {
  proceso: Option | null;
  estado: Option | null;
}

interface PlanSearchFiltersProps {
  procesos?: Option[];
  estados?: Option[];
  value?: PlanSearchFiltersValue;
  onChange: (next: PlanSearchFiltersValue) => void;
  onClear: () => void;
  colorPrimary?: string;
}

const DEFAULT_VALUE: PlanSearchFiltersValue = { proceso: null, estado: null };

const rectControlSx = (colorPrimary: string) => ({
  '& .MuiOutlinedInput-root': {
    minHeight: 48,
    borderRadius: '6px !important',
  },
  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 1 },
  '& .MuiInputBase-input': { fontSize: 14, padding: '12px 14px' },
  '& .MuiInputLabel-root': { fontSize: 14 },
  '& label.Mui-focused': { color: colorPrimary },
  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: colorPrimary },
  '& .MuiAutocomplete-endAdornment': { right: 10 },
});

export default function PlanSearchFilters({
  procesos = [],
  estados = [],
  value = DEFAULT_VALUE,
  onChange,
  onClear,
  colorPrimary = '#142334',
}: PlanSearchFiltersProps) {
  const handleProceso = (_: React.SyntheticEvent, v: Option | null, __: AutocompleteChangeReason) =>
    onChange({ ...value, proceso: v });

  const handleEstado = (_: React.SyntheticEvent, v: Option | null, __: AutocompleteChangeReason) =>
    onChange({ ...value, estado: v });

  return (
    <Paper
      square
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        px: 2,
        py: 1.5,
        bgcolor: 'background.paper',
        width: '100%',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colorPrimary }}>
          Filtros
        </Typography>
      </Stack>

      <Grid container spacing={1.5} alignItems="center">
        <Grid size= {{xs:12, md:5}}>
          <Autocomplete<Option, false, false, false>
            options={procesos}
            value={value.proceso}
            onChange={handleProceso}
            isOptionEqualToValue={(a, b) => a === b}
            getOptionLabel={(o) => o ?? ''}
            clearOnEscape
            disablePortal
            fullWidth
            sx={{ width: '100%', minWidth: 200 }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Buscar por Proceso"
                placeholder="Escribe o selecciona un proceso"
                sx={{ ...rectControlSx(colorPrimary), minWidth: 200 }}
              />
            )}
          />
        </Grid>

        <Grid size= {{xs:12, md:5}}>
          <Autocomplete<Option, false, false, false>
            options={estados}
            value={value.estado}
            onChange={handleEstado}
            isOptionEqualToValue={(a, b) => a === b}
            getOptionLabel={(o) => o ?? ''}
            clearOnEscape
            disablePortal
            fullWidth
            sx={{ width: '100%', minWidth: 200 }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Buscar por Estado"
                placeholder="Abierto, Cerrado, Vencido"
                sx={{ ...rectControlSx(colorPrimary), minWidth: 200 }}
              />
            )}
          />
        </Grid>

        <Grid size= {{xs:12, md:2}}>
          <Button
            startIcon={<RestartAltIcon />}
            onClick={onClear}
            variant="outlined"
            fullWidth
            sx={{
              minHeight: 48,
              borderRadius: '6px !important',
              fontSize: 14,
              fontWeight: 700,
              borderColor: colorPrimary,
              color: colorPrimary,
              textTransform: 'none',
              minWidth: 200,
            }}
          >
            Limpiar
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
