import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper,
} from '@mui/material';

import type {
  Indicator,
  FrequencyOption,
  TrendOption,
  UnitOption,
  Periodicity,
} from '@/types/indicators';
import { frequencyNameToEnum, mapEnumToFrequencyName } from '@/mappers/indicator.mapper';

interface IndicatorFormProps {
  initialIndicator?: Indicator | null;
  units: UnitOption[];
  frequencies: FrequencyOption[];
  trends: TrendOption[];
  saving?: boolean;
  onSubmit: (indicator: Indicator) => void;
  onCancel: () => void;
}

export const IndicatorForm: React.FC<IndicatorFormProps> = ({
  initialIndicator,
  units,
  frequencies,
  trends,
  saving = false,
  onSubmit,
  onCancel,
}) => {
  type IndicatorFormState = Omit<Indicator, 'annualTarget' | 'tolerance' | 'periodicity'> & {
    annualTarget: number | '';
    tolerance: number | '';
    periodicity: string; 
  };

  const [form, setForm] = useState<IndicatorFormState>({
    id: crypto.randomUUID(),
    name: '',
    unit: '',
    formula: '',
    annualTarget: '',
    tolerance: '',
    periodicity: '',
    trend: 'ASC',
    responsible: '',
    active: true,
    variables: [],
  });
  const [annualTargetTouched, setAnnualTargetTouched] = useState(false);
  const [toleranceTouched, setToleranceTouched] = useState(false);

  useEffect(() => {
    if (initialIndicator) {
      // Convert periodicity enum to frequency name for display in dropdown
      const frequencyName = mapEnumToFrequencyName(initialIndicator.periodicity as Periodicity);

      setForm({
        ...initialIndicator,
        periodicity: frequencyName,
        tolerance: initialIndicator.tolerance ?? '',
      });
    }
  }, [initialIndicator]);

  const handleChange =
    (field: keyof Indicator) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const nextValue =
        field === 'annualTarget' || field === 'tolerance'
          ? rawValue === ''
            ? ''
            : Number(rawValue)
          : rawValue;

      setForm((prev) => ({
        ...prev,
        [field]: nextValue,
      }));
    };

  const annualTargetValue =
    form.annualTarget === '' ? Number.NaN : Number(form.annualTarget);
  const annualTargetError =
    Number.isNaN(annualTargetValue) ||
    annualTargetValue <= 0 ||
    annualTargetValue > 100;

  const toleranceValue =
    form.tolerance === '' ? Number.NaN : Number(form.tolerance);
  const toleranceError =
    Number.isNaN(toleranceValue) || toleranceValue < 0 || toleranceValue > 100;

  const handleSubmit = () => {
    if (annualTargetError || toleranceError) {
      setAnnualTargetTouched(true);
      setToleranceTouched(true);
      return;
    }

    // Convert frequency name to enum value
    const periodicity: Periodicity = form.periodicity
      ? frequencyNameToEnum(form.periodicity)
      : 'MENSUAL';

    onSubmit({
      ...form,
      periodicity,
      annualTarget: annualTargetValue,
      tolerance: toleranceValue,
      variables: [],
    } as Indicator);
  };

  return (
    <Paper sx={{ p: 3, width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Crear Nuevo Indicador
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Define la información básica, la fórmula y la configuración de tu indicador.
      </Typography>

      {/* ===================== INFORMACIÓN BÁSICA ===================== */}
      <Typography
        variant="subtitle2"
        sx={{ mb: 1.5, color: 'green', fontWeight: 600 }}
      >
        Información Básica
      </Typography>

      <Grid container spacing={2}>
        {/* Nombre */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Nombre del Indicador *"
            fullWidth
            value={form.name}
            onChange={handleChange('name')}
          />
        </Grid>

        {/* Unidad */}
        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            select
            label="Unidad *"
            fullWidth
            value={form.unit}
            onChange={handleChange('unit')}
          >
            {units.map((u) => (
              <MenuItem key={u.id} value={u.name}>
                {u.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Fórmula */}
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Fórmula del Indicador *"
            fullWidth
            value={form.formula}
            onChange={handleChange('formula')}
          />
        </Grid>

        {/* Tolerancia */}
        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            label="Tolerancia *"
            type="number"
            fullWidth
            value={form.tolerance}
            onChange={handleChange('tolerance')}
            onBlur={() => setToleranceTouched(true)}
            error={toleranceTouched && toleranceError}
            helperText={
              toleranceTouched && toleranceError
                ? 'No debe superar 100%.'
                : ' '
            }
          />
        </Grid>
      </Grid>

      {/* ===================== CONFIGURACIÓN ===================== */}
      <Typography
        variant="subtitle2"
        sx={{ mt: 4, mb: 1.5, color: 'green', fontWeight: 600 }}
      >
        Configuración
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="Meta Anual *"
            type="number"
            fullWidth
            value={form.annualTarget}
            onChange={handleChange('annualTarget')}
            onBlur={() => setAnnualTargetTouched(true)}
            error={annualTargetTouched && annualTargetError}
            helperText={
              annualTargetTouched && annualTargetError
                ? 'Debe ser un valor positivo y no superar 100%.'
                : ' '
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            label="Frecuencia"
            fullWidth
            value={form.periodicity}
            onChange={handleChange('periodicity')}
          >
            {frequencies.map((f) => (
              <MenuItem key={f.id} value={f.name}>
                {f.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            label="Tendencia"
            fullWidth
            value={form.trend}
            onChange={handleChange('trend')}
          >
            {trends.map((t) => (
              <MenuItem
                key={t.id}
                value={t.name === 'Ascendente' ? 'ASC' : 'DESC'}
              >
                {t.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="Responsable (cargo) *"
            fullWidth
            value={form.responsible}
            onChange={handleChange('responsible')}
          />
        </Grid>
      </Grid>

      {/* ===================== ACTIONS ===================== */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || annualTargetError || toleranceError}
        >
          {saving ? 'Guardando…' : 'Guardar Indicador'}
        </Button>
      </Box>
    </Paper>
  );
};
