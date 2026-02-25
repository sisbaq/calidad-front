import * as React from 'react';
import { Container, Stack, Typography, Divider, CircularProgress, Alert, Snackbar } from '@mui/material';
import PlanSearchFilters from '@components/audit/PlanSearchFilters';
import type { PlanSearchFiltersValue } from '@components/audit/PlanSearchFilters';
import PlanesTable from '@components/audit/PlanesTable';
import type { ImprovementPlanWithDetails } from '@/types/improvement';
import PlanDetailDialog from '@components/audit/PlanDetailDialog';
import ClosePlanDialog from '@components/audit/ClosePlanDialog';
import {
  getImprovementPlansRaw,
  closeImprovementPlan,
  getImprovementPlanActivitiesByPlanId,
} from '@/services/improvement.service';
import { mapApiPlanToTableRow } from '@/mappers/improvement.mapper';

const COLOR_PRIMARY = '#0e2336';
const COLOR_SUCCESS = '#01b43d';

export type Estado = 'Abierto' | 'Cerrado' | 'Vencido';

export default function PlanesMejoramientoPage() {
  const [plans, setPlans] = React.useState<ImprovementPlanWithDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<PlanSearchFiltersValue>({ proceso: null, estado: null });
  const [selected, setSelected] = React.useState<ImprovementPlanWithDetails | null>(null);
  const [openDetail, setOpenDetail] = React.useState(false);
  const [openClose, setOpenClose] = React.useState(false);
  const [successSnackbar, setSuccessSnackbar] = React.useState(false);
  const [errorSnackbar, setErrorSnackbar] = React.useState<{ open: boolean; message: string }>(
    { open: false, message: '' }
  );
  const [closeBlockedMessage, setCloseBlockedMessage] = React.useState<string>('');

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiPlans = await getImprovementPlansRaw();
        const mappedPlans = apiPlans.map(mapApiPlanToTableRow);
        setPlans(mappedPlans);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('No se pudieron cargar los planes de mejoramiento.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const procesos = React.useMemo(
    () => Array.from(new Set(plans.map((p) => p.processName))).sort(),
    [plans]
  );
  const estados: Estado[] = ['Abierto', 'Cerrado', 'Vencido'];

  const data: ImprovementPlanWithDetails[] = React.useMemo(() => {
    return plans.filter((p) => {
      const okProceso = filters.proceso ? p.processName === filters.proceso : true;
      // Map status number to status string for filtering
      const statusMap: Record<number, Estado> = { 1: 'Abierto', 2: 'Cerrado', 3: 'Vencido' };
      const statusText = statusMap[p.status] || 'Abierto';
      const okEstado = filters.estado ? statusText === filters.estado : true;
      return okProceso && okEstado;
    });
  }, [plans, filters]);

  const hasOpenActivities = React.useCallback((plan: ImprovementPlanWithDetails | null) => {
    if (!plan?.activities || plan.activities.length === 0) return false;
    return plan.activities.some((activity) => !activity.closed);
  }, []);

  const openVer = (row: ImprovementPlanWithDetails) => {
    setSelected(row);
    setOpenDetail(true);
  };

  const openCloseDlg = (row: ImprovementPlanWithDetails) => {
    if (hasOpenActivities(row)) {
      setErrorSnackbar({
        open: true,
        message: 'No se puede cerrar el plan mientras existan actividades abiertas.',
      });
      setCloseBlockedMessage('No se puede cerrar el plan mientras existan actividades abiertas.');
      return;
    }
    setSelected(row);
    setOpenClose(true);
    setCloseBlockedMessage('');
  };

  const handleClosePlan = async (payload: { planId: string; motivo: string }) => {
    try {
      let activities = selected?.activities;
      if ((!activities || activities.length === 0) && selected?.id) {
        try {
          activities = await getImprovementPlanActivitiesByPlanId(selected.id);
        } catch (err) {
          console.error('Error fetching plan activities for validation:', err);
        }
      }

      if (activities?.some((activity) => !activity.closed)) {
        setErrorSnackbar({
          open: true,
          message: 'No se puede cerrar el plan mientras existan actividades abiertas.',
        });
        return;
      }
      await closeImprovementPlan(payload.planId, payload.motivo);
      const apiPlans = await getImprovementPlansRaw();
      const mappedPlans = apiPlans.map(mapApiPlanToTableRow);
      setPlans(mappedPlans);
      setOpenClose(false);
      setSelected(null);
      setSuccessSnackbar(true);
    } catch (err) {
      console.error('Error closing plan:', err);
      setErrorSnackbar({
        open: true,
        message: 'No se pudo cerrar el plan de mejoramiento.',
      });
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{ py: 3, px: { xs: 2, md: 4 } }}   // <- ocupa todo el ancho con padding lateral
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: COLOR_PRIMARY }}>
          Consulta y cierre de Planes de Mejoramiento
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <PlanSearchFilters
        colorPrimary={COLOR_PRIMARY}
        procesos={procesos}
        estados={estados}
        value={filters}
        onChange={setFilters}
        onClear={() => setFilters({ proceso: null, estado: null })}
      />

      <Divider sx={{ my: 2 }} />

      {closeBlockedMessage && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {closeBlockedMessage}
        </Alert>
      )}

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <PlanesTable
          rows={data}
          colorPrimary={COLOR_PRIMARY}
          onVer={openVer}
          onCerrar={openCloseDlg}
        />
      )}

      <PlanDetailDialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        plan={selected}
        colorPrimary={COLOR_PRIMARY}
        colorSuccess={COLOR_SUCCESS}
      />

      <ClosePlanDialog
        open={openClose}
        onClose={() => setOpenClose(false)}
        plan={selected ? { id: String(selected.id) } : null}
        colorPrimary={COLOR_PRIMARY}
        colorSuccess={COLOR_SUCCESS}
        onConfirm={handleClosePlan}
      />

      <Snackbar
        open={successSnackbar}
        autoHideDuration={3000}
        onClose={() => setSuccessSnackbar(false)}
      >
        <Alert severity="success" onClose={() => setSuccessSnackbar(false)}>
          Plan de mejoramiento cerrado exitosamente
        </Alert>
      </Snackbar>

      <Snackbar
        open={errorSnackbar.open}
        autoHideDuration={3000}
        onClose={() => setErrorSnackbar({ open: false, message: '' })}
      >
        <Alert severity="error" onClose={() => setErrorSnackbar({ open: false, message: '' })}>
          {errorSnackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
