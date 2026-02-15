import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { appColors } from '@/theme/colors';

import type {
  Indicator,
  IndicatorPeriodRow,
  FrequencyOption,
  TrendOption,
  UnitOption,
} from '../../types/indicators';
import type { ProcessOption } from '../../types/audit';

import { IndicatorForm } from '../../components/indicators/IndicatorForm';
import { IndicatorManageDialog } from '../../components/indicators/IndicatorManageDialog';
import { IndicatorViewModal } from '../../components/indicators/IndicatorViewModal';
import { IndicatorTable } from '../../components/indicators/IndicatorTable';
import { useAuth } from '@/hooks/useAuth';

import {
  getIndicators,
  createIndicator,
  updateIndicator,
  deleteIndicator,
  getFrequencies,
  getTrends,
  getUnitsOfMeasure,
} from '@/services/indicator.service';
import { getProcesses } from '@/services/findings.service';
import { mapFrontendToApiPayload } from '@/mappers/indicator.mapper';

export const IndicatorsModulePage: React.FC = () => {
  const { session } = useAuth();

  const userRole = session?.user?.role || 'Agente de cambio';
  const isAdmin = userRole === 'Administrador';

  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [frequencies, setFrequencies] = useState<FrequencyOption[]>([]);
  const [trends, setTrends] = useState<TrendOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [processes, setProcesses] = useState<ProcessOption[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);
  const [saving, setSaving] = useState(false);

  const [manageOpen, setManageOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewIndicator, setViewIndicator] = useState<Indicator | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [indicatorToDelete, setIndicatorToDelete] = useState<Indicator | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    sev: 'success' | 'error';
  }>({ open: false, msg: '', sev: 'success' });

  /* ===== DATA LOADING ===== */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          indicatorsData,
          frequenciesData,
          trendsData,
          unitsData,
          processesData,
        ] = await Promise.all([
          getIndicators(),
          getFrequencies(),
          getTrends(),
          getUnitsOfMeasure(),
          getProcesses(),
        ]);

        setIndicators(indicatorsData);
        setFrequencies(frequenciesData);
        setTrends(trendsData);
        setUnits(unitsData);
        setProcesses(processesData);
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  /* ===== HANDLERS ===== */

  const handleToggleForm = () => {
    setFormOpen((p) => !p);
    if (formOpen) setEditingIndicator(null);
  };

  const handleCreateOrUpdate = async (indicator: Indicator) => {
    setSaving(true);

    const unitId = units.find((u) => u.name === indicator.unit)?.id;
    const frequencyId = frequencies.find(
      (f) => f.name.toUpperCase() === indicator.periodicity,
    )?.id;
    const trendId = trends.find((t) => {
      const trendValue = t.name === 'Ascendente' ? 'ASC' : 'DESC';
      return trendValue === indicator.trend;
    })?.id;
    const processId =
      (indicator.processId !== undefined
        ? Number(indicator.processId)
        : undefined) ??
      processes.find((p) => p.name === indicator.process)?.id ??
      (processes.length === 1 ? processes[0].id : undefined);

    if (!unitId || !frequencyId || !trendId || !processId) {
      setSnack({
        open: true,
        msg: 'Faltan datos para asociar unidad, frecuencia, tendencia o proceso.',
        sev: 'error',
      });
      setSaving(false);
      return;
    }

    const payload = mapFrontendToApiPayload(
      {
        name: indicator.name,
        formula: indicator.formula,
        unit: indicator.unit,
        annualTarget: indicator.annualTarget,
        periodicity: indicator.periodicity,
        trend: indicator.trend,
        responsible: indicator.responsible,
        variables: indicator.variables,
        realValue: indicator.realValue,
        tolerance: indicator.tolerance,
      },
      {
        unitId,
        frequencyId,
        trendId,
        processId,
      },
    );

    try {
      if (editingIndicator) {
        await updateIndicator(editingIndicator.id, payload);
      } else {
        await createIndicator(payload);
      }

      const indicatorsData = await getIndicators();
      setIndicators(indicatorsData);

      setSnack({
        open: true,
        msg: editingIndicator
          ? 'Indicador actualizado'
          : 'Indicador creado',
        sev: 'success',
      });

      setFormOpen(false);
      setEditingIndicator(null);
    } catch (err) {
      setSnack({
        open: true,
        msg: 'No se pudo guardar el indicador',
        sev: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (indicator: Indicator) => {
    setEditingIndicator(indicator);
    setFormOpen(true);
  };

  const handleRequestDelete = (indicator: Indicator) => {
    setIndicatorToDelete(indicator);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!indicatorToDelete) return;

    setDeleting(true);
    try {
      await deleteIndicator(indicatorToDelete.id);
      const indicatorsData = await getIndicators();
      setIndicators(indicatorsData);
      setSnack({
        open: true,
        msg: 'Indicador eliminado',
        sev: 'success',
      });
      setDeleteDialogOpen(false);
    } catch (err) {
      setSnack({
        open: true,
        msg: 'No se pudo eliminar el indicador',
        sev: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleManage = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setManageOpen(true);
  };

  const handleView = (indicator: Indicator) => {
    setViewIndicator(indicator);
    setViewOpen(true);
  };

  const handleSaveManage = (rows: IndicatorPeriodRow[]) => {
    void rows;
    setManageOpen(false);
    setSelectedIndicator(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: appColors.blue }}>
            Gestión de Indicadores
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión y consulta de indicadores
          </Typography>
        </Box>

        {!isAdmin && (
          <Button
            variant="contained"
            startIcon={formOpen ? <CloseIcon /> : <AddIcon />}
            sx={{ textTransform: 'none', backgroundColor: appColors.blue }}
            onClick={handleToggleForm}
          >
            {formOpen ? 'Cerrar formulario' : 'Nuevo indicador'}
          </Button>
        )}
      </Box>

      {formOpen && (
        <Box sx={{ mb: 3 }}>
          <IndicatorForm
            onSubmit={handleCreateOrUpdate}
            onCancel={() => setFormOpen(false)}
            initialIndicator={editingIndicator}
            units={units}
            frequencies={frequencies}
            trends={trends}
            saving={saving}
          />
        </Box>
      )}

      <IndicatorTable
        indicators={indicators}
        role={isAdmin ? 'ADMIN' : 'GESTOR'}
        processes={processes}
        onManage={handleManage}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleRequestDelete}
      />

      <IndicatorManageDialog
        open={manageOpen}
        indicator={selectedIndicator}
        onClose={() => setManageOpen(false)}
        onSave={handleSaveManage}
      />

      <IndicatorViewModal
        open={viewOpen}
        indicator={viewIndicator}
        onClose={() => setViewOpen(false)}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar indicador</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Seguro que deseas eliminar{' '}
            <strong>{indicatorToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snack.sev}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};
