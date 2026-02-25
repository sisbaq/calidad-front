import { Box, Button, TextField, MenuItem, Paper } from '@mui/material';
import { Grid } from '@mui/material';
import type { ImprovementPlanFilters } from '@/types/improvement';


type ExtendedFilters = ImprovementPlanFilters & {
  auditType?: string;
  sourceType?: string;
  noHallazgo?: string;
};

interface GlobalSearchProps {
  tipoOptions?: string[];
  estadoOptions?: string[];
  auditTypeOptions?: string[];
  sourceTypeOptions?: string[];
  filters: ExtendedFilters;
  onFiltersChange: (filters: ExtendedFilters) => void;
}

export default function GlobalSearch({
  tipoOptions = [],
  estadoOptions = ['Abierto', 'Cerrado', 'Vencido'],
  auditTypeOptions = [],
  sourceTypeOptions = [],
  filters = { tipo: '', estado: '', auditType: '', sourceType: '', noHallazgo: '' },
  onFiltersChange = () => { },
}: GlobalSearchProps) {
  const setFilter = (key: keyof ExtendedFilters, val: string) =>
    onFiltersChange({ ...filters, [key]: val });

  const commonSx = { '& .MuiOutlinedInput-root': { borderRadius: 1 } };
  const shrink = { shrink: true } as const;

  const clearFilters = () => {
    onFiltersChange({
      tipo: '',
      estado: '',
      auditType: '',
      sourceType: '',
      noHallazgo: '',
    });
  };

  return (
    <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }} variant="outlined">
      <Box>
        <Grid container spacing={1.5} alignItems="center" wrap="wrap">
          <Grid size={{ xs: 12, sm: "auto" }}>
            <TextField
              size="small"
              label="No. hallazgo"
              value={filters.noHallazgo ?? ''}
              onChange={(e) => setFilter('noHallazgo', e.target.value)}
              sx={{ width: 160, ...commonSx }}
              InputLabelProps={shrink}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              placeholder="Ej. 1024"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: "auto" }}>
            <TextField
              select
              size="small"
              label="Tipo de hallazgo"
              value={filters.tipo ?? ''}
              onChange={(e) => setFilter('tipo', e.target.value)}
              sx={{ width: 200, ...commonSx }}
              InputLabelProps={shrink}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {tipoOptions.map((t) => (
                <MenuItem key={t || '—'} value={t}>
                  {t || '—'}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 6, sm: "auto" }}>
            <TextField
              select
              size="small"
              label="Estado"
              value={filters.estado ?? ''}
              onChange={(e) => setFilter('estado', e.target.value)}
              sx={{ width: 160, ...commonSx }}
              InputLabelProps={shrink}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {estadoOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: "auto" }}>
            <TextField
              select
              size="small"
              label="Tipo de auditoría"
              value={filters.auditType ?? ''}
              onChange={(e) => setFilter('auditType', e.target.value)}
              sx={{ width: 200, ...commonSx }}
              InputLabelProps={shrink}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {auditTypeOptions.map((opt) => (
                <MenuItem key={`aud-${opt}`} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: "auto" }}>
            <TextField
              select
              size="small"
              label="Tipo de fuente"
              value={filters.sourceType ?? ''}
              onChange={(e) => setFilter('sourceType', e.target.value)}
              sx={{ width: 200, ...commonSx }}
              InputLabelProps={shrink}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {sourceTypeOptions.map((opt) => (
                <MenuItem key={`src-${opt}`} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: "auto" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={clearFilters}
              sx={{ height: 40 }}
            >
              Limpiar filtros
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
