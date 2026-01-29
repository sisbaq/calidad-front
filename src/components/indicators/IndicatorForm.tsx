import { useEffect, useState } from 'react';
import type { FC, FormEvent, ChangeEvent } from 'react';

import Grid from '@mui/material/Grid';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import Autocomplete from '@mui/material/Autocomplete';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { appColors } from '@/theme/colors';
import type { 
  Indicator, 
  IndicatorVariable, 
  FrequencyOption, 
  TrendOption, 
  UnitOption 
} from '../../types/indicators';
import {
  MAX_INDICATOR_VARIABLES,
  createId,
} from '../../types/indicators';


const extractFormulaSuggestions = (formula: string): string[] => {
  if (!formula) return [];
  const splitRegex = /[+\-*/()%]/g;

  const rawChunks = formula
    .split(splitRegex)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const nonNumeric = rawChunks.filter((chunk) => !/^[0-9.,]+$/.test(chunk));

  return Array.from(new Set(nonNumeric));
};

interface IndicatorFormProps {
  onSubmit: (indicator: Indicator) => void;
  onCancel?: () => void;
  initialIndicator?: Indicator | null;
  units: UnitOption[];
  frequencies: FrequencyOption[];
  trends: TrendOption[];
  saving?: boolean;
}

interface IndicatorFormValues {
  id?: string;
  name: string;
  formula: string;
  unit: string;
  annualTarget: string;
  frequency: string;
  trend: string;
  realValue: string;
  responsible: string;
  variables: IndicatorVariable[];
}

const buildInitialValues = (initial?: Indicator | null, frequencies?: FrequencyOption[], trends?: TrendOption[]): IndicatorFormValues => {
  // Helper to map frontend periodicity enum to frequency name
  const getFrequencyName = (periodicity: string): string => {
    const map: Record<string, string> = {
      'MENSUAL': 'Mensual',
      'BIMESTRAL': 'Bimestral',
      'TRIMESTRAL': 'Trimestral',
      'CUATRIMESTRAL': 'Cuatrimestral',
      'SEMESTRAL': 'Semestral',
      'ANUAL': 'Anual',
    };
    return map[periodicity] ?? frequencies?.[0]?.name ?? '';
  };

  // Helper to map frontend trend enum to trend name
  const getTrendName = (trend: string): string => {
    const map: Record<string, string> = {
      'ASC': 'Ascendente',
      'DESC': 'Descendente',
    };
    return map[trend] ?? trends?.[0]?.name ?? '';
  };

  // Always create exactly MAX_INDICATOR_VARIABLES variable slots
  const createVariableSlots = (existingVariables?: IndicatorVariable[]): IndicatorVariable[] => {
    return Array.from({ length: MAX_INDICATOR_VARIABLES }, (_, i) => ({
      id: existingVariables?.[i]?.id || createId(),
      key: existingVariables?.[i]?.key ?? '',
      label: existingVariables?.[i]?.label ?? '',
      description: existingVariables?.[i]?.description ?? '',
    }));
  };

  if (!initial) {
    return {
      id: undefined,
      name: '',
      formula: '',
      unit: '',
      annualTarget: '',
      frequency: frequencies?.[0]?.name ?? '',
      trend: trends?.[0]?.name ?? '',
      realValue: '',
      responsible: '',
      variables: createVariableSlots(),
    };
  }

  return {
    id: initial.id,
    name: initial.name,
    formula: initial.formula,
    unit: initial.unit ?? '',
    annualTarget: String(initial.annualTarget),
    frequency: getFrequencyName(initial.periodicity),
    trend: getTrendName(initial.trend),
    realValue: String(initial.realValue ?? ''),
    responsible: initial.responsible ?? '',
    variables: createVariableSlots(initial.variables),
  };
};

export const IndicatorForm: FC<IndicatorFormProps> = ({ 
  onSubmit, 
  onCancel,
  initialIndicator, 
  units, 
  frequencies, 
  trends,
  saving = false,
}) => {
  const [values, setValues] = useState<IndicatorFormValues>(() =>
    buildInitialValues(initialIndicator, frequencies, trends),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(buildInitialValues(initialIndicator, frequencies, trends));
    setError(null);
  }, [initialIndicator, frequencies, trends]);

  const formulaSuggestions = extractFormulaSuggestions(values.formula);

  const handleTextChange = (field: keyof IndicatorFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleFrequencyChange = (event: SelectChangeEvent) => {
    setValues((prev) => ({ ...prev, frequency: event.target.value }));
  };

  const handleTrendChange = (event: SelectChangeEvent) => {
    setValues((prev) => ({ ...prev, trend: event.target.value }));
  };

  const handleVariableFieldChange = (id: string, field: keyof IndicatorVariable) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValues((prev) => ({ ...prev, variables: prev.variables.map((v) => (v.id === id ? { ...v, [field]: value } : v)) }));
  };

  const handleVariableNameChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, variables: prev.variables.map((v) => (v.id === id ? { ...v, key: value } : v)) }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = values.name.trim();
    const formula = values.formula.trim();
    const unit = values.unit.trim();
    const annualTargetStr = values.annualTarget.trim();
    const realValueStr = values.realValue.trim();
    const responsible = values.responsible.trim();

    if (!name) {
      setError('El nombre del indicador es obligatorio.');
      return;
    }
    if (!unit) {
      setError('La unidad de medida es obligatoria.');
      return;
    }
    if (!formula) {
      setError('La formula del indicador es obligatoria.');
      return;
    }
    if (!responsible) {
      setError('El responsable (cargo) es obligatorio.');
      return;
    }
    if (!annualTargetStr) {
      setError('La meta anual es obligatoria.');
      return;
    }
    if (!realValueStr) {
      setError('El valor real es obligatorio.');
      return;
    }

    const annualTarget = Number(annualTargetStr);
    const realValue = Number(realValueStr);

    if (!Number.isFinite(annualTarget)) {
      setError('Meta anual debe ser un numero valido.');
      return;
    }
    if (!Number.isFinite(realValue)) {
      setError('Valor real debe ser un numero valido.');
      return;
    }

    const cleanedVariables = values.variables
      .map((v) => ({ ...v, key: v.key.trim(), label: v.label.trim(), description: v.description?.trim() || undefined }))
      .filter((v) => v.key && v.label);

    if (cleanedVariables.length === 0) {
      setError('Define al menos una variable con Nombre y Descripcion.');
      return;
    }

    if (cleanedVariables.length > MAX_INDICATOR_VARIABLES) {
      setError(`Solo se permiten hasta ${MAX_INDICATOR_VARIABLES} variables.`);
      return;
    }

    const expectedNames = extractFormulaSuggestions(formula);
    if (expectedNames.length === 0) {
      setError('La formula debe contener al menos una variable (no solo numeros u operadores).');
      return;
    }

    const toLower = (s: string) => s.toLowerCase();

    const missingVariablesFromFormula = expectedNames.filter((seg) => !cleanedVariables.some((v) => toLower(v.key) === toLower(seg)));
    const extraVariablesNotInFormula = cleanedVariables.filter((v) => !expectedNames.some((seg) => toLower(seg) === toLower(v.key)));

    if (missingVariablesFromFormula.length > 0) {
      const list = missingVariablesFromFormula.map((s) => `"${s}"`).join(', ');
      setError(`Debes definir una variable para cada nombre usado en la formula. Faltan variables para: ${list}.`);
      return;
    }
    if (extraVariablesNotInFormula.length > 0) {
      const list = extraVariablesNotInFormula.map((v) => `"${v.key}"`).join(', ');
      setError(`Algunas variables definidas no aparecen en la formula: ${list}. Revisa los nombres o ajusta la formula.`);
      return;
    }

    // Map frequency name back to periodicity enum
    const mapFrequencyToPeriodicity = (freqName: string): Indicator['periodicity'] => {
      const map: Record<string, Indicator['periodicity']> = {
        'Mensual': 'MENSUAL',
        'Bimestral': 'BIMESTRAL',
        'Trimestral': 'TRIMESTRAL',
        'Cuatrimestral': 'CUATRIMESTRAL',
        'Semestral': 'SEMESTRAL',
        'Anual': 'ANUAL',
      };
      return map[freqName] ?? 'MENSUAL';
    };

    // Map trend name back to trend enum
    const mapTrendNameToEnum = (trendName: string): Indicator['trend'] => {
      return trendName === 'Ascendente' ? 'ASC' : 'DESC';
    };

    const id = values.id ?? initialIndicator?.id ?? createId();

    const indicator: Indicator = {
      id,
      name,
      formula,
      unit,
      annualTarget,
      periodicity: mapFrequencyToPeriodicity(values.frequency),
      trend: mapTrendNameToEnum(values.trend),
      realValue,
      active: true,
      responsible,
      variables: cleanedVariables,
    };

    onSubmit(indicator);

    if (!initialIndicator) {
      setValues(buildInitialValues(null, frequencies, trends));
      setError(null);
    }
  };

  const isEditing = Boolean(initialIndicator);

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, border: '1px solid #e0e0e0' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: appColors.blue }}>
        {isEditing ? 'Editar Indicador' : 'Crear Nuevo Indicador'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Define la informacion basica, la formula y la configuracion de tu indicador.
      </Typography>

      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: appColors.green, mb: 1 }}>
              Informacion Basica
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 10 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth required label="Nombre del Indicador" value={values.name} onChange={handleTextChange('name')} size="small" disabled={saving} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small" required>
                  <InputLabel id="unidad-label">Unidad</InputLabel>
                  <Select 
                    labelId="unidad-label" 
                    label="Unidad" 
                    value={values.unit} 
                    onChange={(e) => setValues((p) => ({ ...p, unit: e.target.value }))}
                    disabled={saving}
                  >
                    {units.map((option) => (
                      <MenuItem key={option.id} value={option.name}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  required
                  label="Formula del Indicador"
                  placeholder='Ej: riesgos controlados / riesgos totales * 100'
                  value={values.formula}
                  onChange={handleTextChange('formula')}
                  size="small"
                  disabled={saving}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={'Escribe la formula usando los mismos textos que registraras debajo.'}>
                          <InfoOutlinedIcon fontSize="small" sx={{ color: appColors.blue, cursor: 'pointer' }} />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: appColors.green, mb: 1 }}>
            Variables del Indicador ({MAX_INDICATOR_VARIABLES} requeridas)
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Primero escribe la formula. Luego, en <Box component="span" fontWeight={600}>Nombre de la variable</Box> ingresa o selecciona desde la ayuda los textos que usaste en la formula. En <Box component="span" fontWeight={600}>Descripcion</Box> explica que representa cada variable.
          </Typography>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${appColors.blue}1A` }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: '5%' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: '35%' }}>Nombre de la variable</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Descripcion de la variable</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {values.variables.map((variable, index) => (
                  <TableRow key={variable.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Autocomplete 
                        freeSolo 
                        options={formulaSuggestions} 
                        value={variable.key} 
                        onInputChange={(_, newValue) => handleVariableNameChange(variable.id, newValue ?? '')} 
                        disabled={saving}
                        renderInput={(params) => <TextField {...params} required fullWidth size="small" placeholder="Ej: riesgos controlados" />} 
                      />
                    </TableCell>
                    <TableCell>
                      <TextField 
                        fullWidth 
                        required 
                        size="small" 
                        placeholder="Ej: Numero de riesgos controlados" 
                        value={variable.label} 
                        onChange={handleVariableFieldChange(variable.id, 'label')} 
                        disabled={saving}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Grid container spacing={2} alignItems="flex-start" sx={{ mt: 3 }}>
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: appColors.green, mb: 1 }}>Configuracion</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 10 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth required label="Meta Anual" type="number" value={values.annualTarget} onChange={handleTextChange('annualTarget')} size="small" inputProps={{ min: 0, step: '0.01' }} disabled={saving} />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="periodicidad-label">Frecuencia</InputLabel>
                  <Select labelId="periodicidad-label" label="Frecuencia" value={values.frequency} onChange={handleFrequencyChange} disabled={saving}>
                    {frequencies.map((option) => (
                      <MenuItem key={option.id} value={option.name}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="tendencia-label">Tendencia</InputLabel>
                  <Select labelId="tendencia-label" label="Tendencia" value={values.trend} onChange={handleTrendChange} disabled={saving}>
                    {trends.map((option) => (
                      <MenuItem key={option.id} value={option.name}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField fullWidth required label="Valor Real" type="number" value={values.realValue} onChange={handleTextChange('realValue')} size="small" inputProps={{ step: '0.01' }} disabled={saving} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth required label="Responsable (cargo)" value={values.responsible} onChange={handleTextChange('responsible')} size="small" disabled={saving} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {error && <Typography variant="body2" color="error" sx={{ mt: 2 }}>{error}</Typography>}

        <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="flex-start">
          <Button 
            variant="outlined" 
            sx={{ textTransform: 'none', borderColor: appColors.blue, color: appColors.blue, backgroundColor: '#fff' }}
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ textTransform: 'none', backgroundColor: appColors.blue, '&:hover': { backgroundColor: appColors.blue, opacity: 0.9 } }}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Guardar Indicador')}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};
