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
  PeriodRow,
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
  const userProcessId = session?.user?.idProceso;

  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dropdown options state
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

  // Snackbar state
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' }>({
    open: false,
    msg: '',
    sev: 'success',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [indicatorsData, frequenciesData, trendsData, unitsData, processesData] = await Promise.all([
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleForm = () => {
    setFormOpen((p) => !p);
    if (formOpen) setEditingIndicator(null);
  };

  const handleCreateOrUpdate = async (indicator: Indicator) => {
    setSaving(true);
    try {
      // Find the IDs for the dropdown values
      const unitOption = units.find(u => u.name === indicator.unit);
      const frequencyOption = frequencies.find(f => {
        // Map periodicity enum to frequency name
        const periodicityToName: Record<string, string> = {
          'MENSUAL': 'Mensual',
          'BIMESTRAL': 'Bimestral',
          'TRIMESTRAL': 'Trimestral',
          'CUATRIMESTRAL': 'Cuatrimestral',
          'SEMESTRAL': 'Semestral',
          'ANUAL': 'Anual',
        };
        return f.name === periodicityToName[indicator.periodicity];
      });
      const trendOption = trends.find(t => {
        // Map trend enum to trend name
        return (indicator.trend === 'ASC' && t.name === 'Ascendente') ||
               (indicator.trend === 'DESC' && t.name === 'Descendente');
      });

      if (!unitOption || !frequencyOption || !trendOption) {
        throw new Error('No se pudieron encontrar los valores de configuracion');
      }

      // For non-admin users, backend will use their assigned process
      // For admins editing, use the existing process ID
      // For admins creating, they would need to select a process (not implemented yet)
      let processId: number | undefined;
      if (editingIndicator?.processId) {
        processId = Number(editingIndicator.processId);
      } else if (isAdmin) {
        // TODO: Admins should select a process when creating
        throw new Error('Los administradores deben seleccionar un proceso');
      }
      // For non-admin users creating, processId can be undefined - backend will use their assigned process

      const payload = mapFrontendToApiPayload(indicator, {
        unitId: unitOption.id,
        frequencyId: frequencyOption.id,
        trendId: trendOption.id,
        processId: processId ?? 0, // Backend will override for non-admins
      });

      if (editingIndicator) {
        await updateIndicator(editingIndicator.id, payload);
        setSnack({ open: true, msg: 'Indicador actualizado correctamente', sev: 'success' });
      } else {
        await createIndicator(payload);
        setSnack({ open: true, msg: 'Indicador creado correctamente', sev: 'success' });
      }

      // Refresh the list
      const updatedIndicators = await getIndicators();
      setIndicators(updatedIndicators);

      setEditingIndicator(null);
      setFormOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al guardar el indicador';
      setSnack({ open: true, msg: errorMsg, sev: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (indicator: Indicator) => {
    setEditingIndicator(indicator);
    setFormOpen(true);
  };

  const handleCancelForm = () => {
    setEditingIndicator(null);
    setFormOpen(false);
  };

  const handleRequestDelete = (indicator: Indicator) => {
    setIndicatorToDelete(indicator);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!indicatorToDelete) {
      setDeleteDialogOpen(false);
      return;
    }

    setDeleting(true);
    try {
      await deleteIndicator(indicatorToDelete.id);
      setIndicators((prev) => prev.filter((i) => i.id !== indicatorToDelete.id));
      setSnack({ open: true, msg: 'Indicador eliminado correctamente', sev: 'success' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar el indicador';
      setSnack({ open: true, msg: errorMsg, sev: 'error' });
    } finally {
      setDeleting(false);
      setIndicatorToDelete(null);
      setDeleteDialogOpen(false);
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

    if (!selectedIndicator) return;

    const mappedRows: PeriodRow[] = rows.map((r) => ({
      id: String(r.index),
      periodLabel: r.label,
      value: r.result ?? 0,
    }));

    void mappedRows;

    setManageOpen(false);
    setSelectedIndicator(null);
  };

  const handleCloseSnack = () => {
    setSnack((prev) => ({ ...prev, open: false }));
  };

  // Backend already filters indicators by process for non-admin users
  const filteredIndicators = indicators;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
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
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: appColors.blue }}
          >
            Gestion de Indicadores
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdmin
              ? 'Visualiza y consulta todos los indicadores de la entidad.'
              : 'Crea y gestiona los indicadores de calidad de la entidad.'}
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
            onCancel={handleCancelForm}
            initialIndicator={editingIndicator}
            units={units}
            frequencies={frequencies}
            trends={trends}
            saving={saving}
          />
        </Box>
      )}

      <IndicatorTable
        indicators={filteredIndicators}
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Eliminar indicador</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estas seguro de eliminar{' '}
            <strong>{indicatorToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnack} severity={snack.sev} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};
