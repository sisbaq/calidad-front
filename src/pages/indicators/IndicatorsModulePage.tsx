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

/* ===== BACKEND SERVICES (comentados por mock) ===== */
// import {
//   getIndicators,
//   createIndicator,
//   updateIndicator,
//   deleteIndicator,
//   getFrequencies,
//   getTrends,
//   getUnitsOfMeasure,
// } from '@/services/indicator.service';
// import { getProcesses } from '@/services/findings.service';
// import { mapFrontendToApiPayload } from '@/mappers/indicator.mapper';

/* ================================================= */

const USE_MOCK = true;

/* ===== MOCK DATA ===== */

const mockIndicators: Indicator[] = [
  {
    id: '1',
    name: 'Cumplimiento del plan de auditorías',
    formula: 'auditorias cerradas / auditorias programadas * 100',
    unit: '%',
    annualTarget: 100,
    periodicity: 'MENSUAL',
    trend: 'ASC',
    active: true,
    responsible: 'Auditor líder',
    variables: [],
    process: 'Gestión de Calidad',

    // ⬇️ AQUÍ va la opción B
    periods: [
      {
        period: 'Enero',
        sent: true,
      },
    ],
  },
];

const mockFrequencies: FrequencyOption[] = [
  { id: 1, name: 'Mensual' },
  { id: 2, name: 'Trimestral' },
];

const mockTrends: TrendOption[] = [
  { id: 1, name: 'Ascendente' },
  { id: 2, name: 'Descendente' },
];

const mockUnits: UnitOption[] = [
  { id: 1, name: '%' },
  { id: 2, name: 'Número' },
];

const mockProcesses: ProcessOption[] = [
  { id: 1, name: 'Gestión de Calidad' },
];

/* ===================== */

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
    if (!USE_MOCK) {
      /*
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
        } catch (err) {
          setError('Error al cargar los datos');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
      */
      return;
    }

    // ===== MOCK =====
    setIndicators(mockIndicators);
    setFrequencies(mockFrequencies);
    setTrends(mockTrends);
    setUnits(mockUnits);
    setProcesses(mockProcesses);
    setLoading(false);
  }, []);

  /* ===== HANDLERS ===== */

  const handleToggleForm = () => {
    setFormOpen((p) => !p);
    if (formOpen) setEditingIndicator(null);
  };

  const handleCreateOrUpdate = async (indicator: Indicator) => {
    setSaving(true);

    if (USE_MOCK) {
      setIndicators((prev) => {
        if (editingIndicator) {
          return prev.map((i) =>
            i.id === editingIndicator.id ? indicator : i,
          );
        }
        return [...prev, indicator];
      });

      setSnack({
        open: true,
        msg: editingIndicator
          ? 'Indicador actualizado (mock)'
          : 'Indicador creado (mock)',
        sev: 'success',
      });

      setFormOpen(false);
      setEditingIndicator(null);
      setSaving(false);
      return;
    }

    /*
    // BACKEND REAL AQUÍ
    */
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

    if (USE_MOCK) {
      setIndicators((prev) =>
        prev.filter((i) => i.id !== indicatorToDelete.id),
      );
      setSnack({
        open: true,
        msg: 'Indicador eliminado (mock)',
        sev: 'success',
      });
      setDeleting(false);
      setDeleteDialogOpen(false);
      return;
    }

    /*
    // BACKEND REAL AQUÍ
    */
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
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
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
