import { useEffect, useState } from 'react';
import type { FC, FormEvent, ChangeEvent } from 'react';

import Grid from '@mui/material/Grid';
import {
  Box,
  Button,
  FormControl,
  IconButton,
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

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { appColors } from '@/theme/colors';
import type { Indicator, IndicatorVariable } from '../../types/indicators';
import {
  PERIODICITY_CONFIG,
  TREND_OPTIONS,
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
  initialIndicator?: Indicator | null;
}

interface IndicatorFormValues {
  id?: string;
  name: string;
  formula: string;
  unit: string;
  annualTarget: string;
  periodicity: Indicator['periodicity'];
  trend: Indicator['trend'];
  realValue: string;
  responsible: string;
  variables: IndicatorVariable[];
}

const buildInitialValues = (initial?: Indicator | null): IndicatorFormValues => {
  if (!initial) {
    return {
      id: undefined,
      name: '',
      formula: '',
      unit: '',
      annualTarget: '',
      periodicity: 'MENSUAL',
      trend: 'ASC',
      realValue: '',
      responsible: '',
      variables: [
        {
          id: createId(),
          key: '',
          label: '',
          description: '',
        },
      ],
    };
  }

  return {
    id: initial.id,
    name: initial.name,
    formula: initial.formula,
    unit: initial.unit ?? '',
    annualTarget: String(initial.annualTarget),
    periodicity: initial.periodicity,
    trend: initial.trend,
    realValue: String(initial.realValue ?? ''),
    responsible: (initial as any).responsible ?? '',
    variables:
      initial.variables && initial.variables.length > 0
        ? initial.variables.map((v) => ({ ...v, id: v.id || createId() }))
        : [
          {
            id: createId(),
            key: '',
            label: '',
            description: '',
          },
        ],
  };
};

export const IndicatorForm: FC<IndicatorFormProps> = ({ onSubmit, initialIndicator }) => {
  const [values, setValues] = useState<IndicatorFormValues>(() =>
    buildInitialValues(initialIndicator),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(buildInitialValues(initialIndicator));
    setError(null);
  }, [initialIndicator]);

  const formulaSuggestions = extractFormulaSuggestions(values.formula);

  const handleTextChange = (field: keyof IndicatorFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePeriodicityChange = (event: SelectChangeEvent) => {
    setValues((prev) => ({ ...prev, periodicity: event.target.value as Indicator['periodicity'] }));
  };

  const handleTrendChange = (event: SelectChangeEvent) => {
    setValues((prev) => ({ ...prev, trend: event.target.value as Indicator['trend'] }));
  };

  const handleVariableFieldChange = (id: string, field: keyof IndicatorVariable) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValues((prev) => ({ ...prev, variables: prev.variables.map((v) => (v.id === id ? { ...v, [field]: value } : v)) }));
  };

  const handleVariableNameChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, variables: prev.variables.map((v) => (v.id === id ? { ...v, key: value } : v)) }));
  };

  const handleAddVariable = () => {
    if (!canAddVariable) return;

    setValues((prev) => ({
      ...prev,
      variables: [
        ...prev.variables,
        { id: createId(), key: '', label: '', description: '' },
      ],
    }));
  };


  const handleRemoveVariable = (id: string) => {
    setValues((prev) => {
      if (prev.variables.length <= 1) return prev;
      return { ...prev, variables: prev.variables.filter((v) => v.id !== id) };
    });
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
      setError('La fórmula del indicador es obligatoria.');
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
      setError('Meta anual debe ser un número válido.');
      return;
    }
    if (!Number.isFinite(realValue)) {
      setError('Valor real debe ser un número válido.');
      return;
    }

    const cleanedVariables = values.variables
      .map((v) => ({ ...v, key: v.key.trim(), label: v.label.trim(), description: v.description?.trim() || undefined }))
      .filter((v) => v.key && v.label);

    if (cleanedVariables.length === 0) {
      setError('Define al menos una variable con Nombre y Descripción.');
      return;
    }

    const expectedNames = extractFormulaSuggestions(formula);
    if (expectedNames.length === 0) {
      setError('La fórmula debe contener al menos una variable (no solo números u operadores).');
      return;
    }

    const toLower = (s: string) => s.toLowerCase();

    const missingVariablesFromFormula = expectedNames.filter((seg) => !cleanedVariables.some((v) => toLower(v.key) === toLower(seg)));
    const extraVariablesNotInFormula = cleanedVariables.filter((v) => !expectedNames.some((seg) => toLower(seg) === toLower(v.key)));

    if (missingVariablesFromFormula.length > 0) {
      const list = missingVariablesFromFormula.map((s) => `"${s}"`).join(', ');
      setError(`Debes definir una variable para cada nombre usado en la fórmula. Faltan variables para: ${list}.`);
      return;
    }
    if (extraVariablesNotInFormula.length > 0) {
      const list = extraVariablesNotInFormula.map((v) => `"${v.key}"`).join(', ');
      setError(`Algunas variables definidas no aparecen en la fórmula: ${list}. Revisa los nombres o ajusta la fórmula.`);
      return;
    }

    const id = values.id ?? initialIndicator?.id ?? createId();

    const indicator: Indicator = {
      id,
      name,
      formula,
      unit,
      annualTarget,
      periodicity: values.periodicity,
      trend: values.trend,
      realValue,
      active: true,
      responsible,
      variables: cleanedVariables,
    };

    onSubmit(indicator);

    if (!initialIndicator) {
      setValues(buildInitialValues(null));
      setError(null);
    }
  };

  const isEditing = Boolean(initialIndicator);


  const normalize = (s: string) => s.trim().toLowerCase();

  const expectedVariableKeys = extractFormulaSuggestions(values.formula).map(normalize);

  const selectedVariableKeys = values.variables
    .map((v) => v.key)
    .filter(Boolean)
    .map(normalize);

  const allFormulaVariablesSelected =
    expectedVariableKeys.length > 0 &&
    expectedVariableKeys.every((key) => selectedVariableKeys.includes(key));

  const canAddVariable =
    expectedVariableKeys.length > 0 && !allFormulaVariablesSelected;


  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1, border: '1px solid #e0e0e0' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: appColors.blue }}>
        {isEditing ? 'Editar Indicador' : 'Crear Nuevo Indicador'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Define la información básica, la fórmula y la configuración de tu indicador.
      </Typography>

      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: appColors.green, mb: 1 }}>
              Información Básica
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 10 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth required label="Nombre del Indicador" value={values.name} onChange={handleTextChange('name')} size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small" required>
                  <InputLabel id="unidad-label">Unidad</InputLabel>
                  <Select labelId="unidad-label" label="Unidad" value={values.unit} onChange={(e) => setValues((p) => ({ ...p, unit: e.target.value }))}>
                    <MenuItem value="Porcentaje">Porcentaje</MenuItem>
                    <MenuItem value="Numérica">Numérica</MenuItem>
                    <MenuItem value="Hectáreas">Hectáreas</MenuItem>
                    <MenuItem value="Pesos">Pesos</MenuItem>
                    <MenuItem value="Metros">Metros</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  required
                  label="Fórmula del Indicador"
                  placeholder='Ej: riesgos controlados / riesgos totales * 100'
                  value={values.formula}
                  onChange={handleTextChange('formula')}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={'Escribe la fórmula usando los mismos textos que registrarás debajo.'}>
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
            Variables del Indicador
          </Typography>

          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2, flex: 1 }}>
              Primero escribe la fórmula. Luego, en <Box component="span" fontWeight={600}>Nombre de la variable</Box> ingresa o selecciona desde la ayuda los textos que usaste en la fórmula. En <Box component="span" fontWeight={600}>Descripción</Box> explica qué representa cada variable.
            </Typography>

            <Tooltip
              title={
                !canAddVariable
                  ? 'Ya definiste todas las variables usadas en la fórmula'
                  : ''
              }
              arrow
            >
              <span>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddVariable}
                  disabled={!canAddVariable}
                  sx={{
                    textTransform: 'none',
                    backgroundColor: appColors.blue,
                    '&:hover': { backgroundColor: appColors.blue, opacity: 0.9 },
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    ml: 2,
                  }}
                  variant="contained"
                >
                  Añadir variable
                </Button>
              </span>
            </Tooltip>


          </Stack>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${appColors.blue}1A` }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: '30%' }}>Nombre de la variable</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Descripción de la variable</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, width: 60 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {values.variables.map((variable) => (
                  <TableRow key={variable.id}>
                    <TableCell>
                      <Autocomplete freeSolo options={formulaSuggestions} value={variable.key} onInputChange={(_, newValue) => handleVariableNameChange(variable.id, newValue ?? '')} renderInput={(params) => <TextField {...params} required fullWidth size="small" placeholder="Ej: riesgos controlados" />} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth required size="small" placeholder="Ej: Número de riesgos controlados" value={variable.label} onChange={handleVariableFieldChange(variable.id, 'label')} />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleRemoveVariable(variable.id)} disabled={values.variables.length <= 1}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Grid container spacing={2} alignItems="flex-start" sx={{ mt: 3 }}>
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: appColors.green, mb: 1 }}>Configuración</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 10 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth required label="Meta Anual" type="number" value={values.annualTarget} onChange={handleTextChange('annualTarget')} size="small" inputProps={{ min: 0, step: '0.01' }} />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="periodicidad-label">Frecuencia</InputLabel>
                  <Select labelId="periodicidad-label" label="Frecuencia" value={values.periodicity} onChange={handlePeriodicityChange}>
                    {PERIODICITY_CONFIG.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="tendencia-label">Tendencia</InputLabel>
                  <Select labelId="tendencia-label" label="Tendencia" value={values.trend} onChange={handleTrendChange}>
                    {TREND_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField fullWidth required label="Valor Real" type="number" value={values.realValue} onChange={handleTextChange('realValue')} size="small" inputProps={{ step: '0.01' }} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField fullWidth required label="Responsable (cargo)" value={values.responsible} onChange={handleTextChange('responsible')} size="small" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {error && <Typography variant="body2" color="error" sx={{ mt: 2 }}>{error}</Typography>}

        <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="flex-start">
          <Button variant="outlined" sx={{ textTransform: 'none', borderColor: appColors.blue, color: appColors.blue, backgroundColor: '#fff' }}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" sx={{ textTransform: 'none', backgroundColor: appColors.blue, '&:hover': { backgroundColor: appColors.blue, opacity: 0.9 } }}>
            {isEditing ? 'Guardar cambios' : 'Guardar Indicador'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};
