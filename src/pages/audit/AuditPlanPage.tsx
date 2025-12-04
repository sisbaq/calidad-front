import { useState, useEffect, useRef } from 'react';
import { Container, Stack, Paper, Snackbar, Alert, Box, CircularProgress } from '@mui/material';
import type { AuditPlan, AuditReport } from '@/types/audit';
import UploadPlanForm from '@/components/audit/UploadPlanForm';
import PlansTable from '@/components/audit/PlansTable';
import EditPlanDialog from '@/components/audit/EditPlanDialog';
import DeleteConfirmationDialog from '@/components/audit/DeleteConfirmationDialog';
import ReportDialog from '@/components/audit/ReportDialog';
import * as auditService from '@/services/audit.service';

const cardSx = {
  p: 3,
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 8px 24px rgba(14,35,54,0.06), 0 2px 6px rgba(14,35,54,0.05)',
};

export default function AuditPlanPage() {
  const [allPlans, setAllPlans] = useState<AuditPlan[]>([]);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'warning' }>({
    open: false,
    msg: '',
    sev: 'success',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [editingPlan, setEditingPlan] = useState<AuditPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<AuditPlan | null>(null);

  const [reportForm, setReportForm] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    planId: number | string | null;
    report: AuditReport | null;
  }>({ open: false, mode: 'create', planId: null, report: null });

  const [reportToDelete, setReportToDelete] = useState<{ planId: number | string; report: AuditReport } | null>(null);
  const [isSavingReport, setIsSavingReport] = useState(false);

  // Manage Blob URLs to prevent memory leaks
  const blobUrlsRef = useRef(new Set<string>());

  useEffect(() => {
    // Cleanup function to revoke all blob URLs on component unmount
    return () => {
      for (const u of blobUrlsRef.current) {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      }
      blobUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const fetchPlansAndReports = async () => {
      setInitialLoading(true);
      try {
        // Fetch both plans and reports in parallel
        const [plans, reports] = await Promise.all([
          auditService.getAuditPlans(),
          auditService.getAuditReports(),
        ]);

        // Create a map of reports by their planId for efficient lookup
        const reportsByPlanId = new Map<string | number, AuditReport>();
        reports.forEach((report) => {
          // The report object from the mapper now includes the planId
          if (report?.planId) {
            reportsByPlanId.set(report.planId, report);
          }
        });

        // Map the reports to their corresponding plans
        const plansWithReports = plans.map((plan) => {
          const report = reportsByPlanId.get(plan.id);
          return {
            ...plan,
            reports: report ? [report] : [],
          };
        });

        setAllPlans(plansWithReports);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Error al cargar los datos.';
        setSnack({ open: true, msg, sev: 'error' });
      } finally {
        setInitialLoading(false);
      }
    };
    fetchPlansAndReports();
  }, []);

  // Reset page if it's out of bounds when data changes
  useEffect(() => {
    const totalPages = Math.ceil(allPlans.length / rowsPerPage);
    if (page >= totalPages && totalPages > 0) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [allPlans.length, page, rowsPerPage]);

  const handlePlanAdd = async (
    newPlanData: Omit<AuditPlan, 'id' | 'createdAt' | 'reports' | 'fileMeta'>,
    file: File,
  ) => {
    try {
      setLoading(true);
      const createdPlan = await auditService.createAuditPlan({
        description: newPlanData.description,
        planType: newPlanData.planType,
        file: file,
      });

      setAllPlans((prev) => [createdPlan, ...prev]);
      setSnack({ open: true, msg: 'Plan de auditoría creado con éxito.', sev: 'success' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo crear el plan.';
      setSnack({ open: true, msg, sev: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenEdit = (plan: AuditPlan) => {
    setEditingPlan(plan);
  };

  const handleSaveEdit = async (updatedPlan: AuditPlan, newFile: File | null) => {
    try {
      setLoading(true);
      const savedPlan = await auditService.updateAuditPlan(updatedPlan, newFile);
      setAllPlans((prev) => prev.map((p) => (p.id === savedPlan.id ? savedPlan : p)));
      setEditingPlan(null);
      setSnack({ open: true, msg: 'Plan actualizado con éxito.', sev: 'success' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo actualizar el plan.';
      setSnack({ open: true, msg, sev: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDelete = (plan: AuditPlan) => {
    setPlanToDelete(plan);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;
    try {
      setLoading(true);
      await auditService.deleteAuditPlan(planToDelete.id);
      // Remove the deleted plan from the local state
      setAllPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
      setPlanToDelete(null);
      setSnack({ open: true, msg: 'Plan eliminado con éxito.', sev: 'success' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo eliminar el plan.';
      setSnack({ open: true, msg, sev: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReportDialog = (mode: 'create' | 'edit', planId: number | string, report: AuditReport | null = null) => {
    setReportForm({ open: true, mode, planId, report });
  };

  const handleCloseReportDialog = () => {
    setReportForm({ open: false, mode: 'create', planId: null, report: null });
  };

  const handleSaveReport = async (desc: string, file: File | null) => {
    const { mode, planId, report } = reportForm;
    if (!planId) return;

    setIsSavingReport(true);
    try {
      if (mode === 'create') {
        if (!file) {
          setSnack({ open: true, msg: 'Debe seleccionar un archivo para el informe.', sev: 'warning' });
          return;
        }
        const newReport = await auditService.createAuditReport(planId, desc, file);
        setAllPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, reports: [newReport, ...(p.reports || [])] } : p)),
        );
        setSnack({ open: true, msg: 'Informe subido.', sev: 'success' });
      } else {
        // Edit mode
        if (!report) return;
        const updatedReport = await auditService.updateAuditReport(report.id, desc, file);
        setAllPlans((prev) =>
          prev.map((p) => {
            if (p.id !== planId) return p;
            return {
              ...p,
              reports: (p.reports || []).map((r) => (r.id === updatedReport.id ? updatedReport : r)),
            };
          }),
        );
        setSnack({ open: true, msg: 'Informe actualizado.', sev: 'success' });
      }
      handleCloseReportDialog();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Ocurrió un error al guardar el informe.';
      setSnack({ open: true, msg, sev: 'error' });
    } finally {
      setIsSavingReport(false);
    }
  };

  const handleOpenDeleteReport = (planId: number | string, report: AuditReport) => {
    setReportToDelete({ planId, report });
  };

  const handleDeleteReportConfirm = async () => {
    if (!reportToDelete) return;
    const { report } = reportToDelete;
    try {
      setLoading(true);
      await auditService.deleteAuditReport(report.id);

      // Remove the deleted report from the local state
      setAllPlans((prev) =>
        prev.map((p) => {
          if (p.id !== reportToDelete.planId) return p;
          return {
            ...p,
            reports: (p.reports || []).filter((r) => r.id !== report.id),
          };
        }),
      );
      setReportToDelete(null);
      setSnack({ open: true, msg: 'Informe eliminado.', sev: 'success' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo eliminar el informe.';
      setSnack({ open: true, msg, sev: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{ py: 4, px: { xs: 2, md: 4 } }}  // <- ocupa todo el ancho con padding lateral
    >
      <Stack spacing={3}>
        {/* Carga */}
        <Paper elevation={0} sx={cardSx}>
          <UploadPlanForm onPlanAdd={handlePlanAdd} loading={loading} setSnack={setSnack} />
        </Paper>

        {/* Listado */}
        <Paper elevation={0} sx={cardSx}>
          {initialLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <PlansTable
              plans={allPlans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
              count={allPlans.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onReportAdd={handleOpenReportDialog}
              onReportEdit={handleOpenReportDialog}
              onReportDelete={handleOpenDeleteReport}
            />
          )}
        </Paper>
      </Stack>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.sev}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Dialogs */}
      <EditPlanDialog
        open={!!editingPlan}
        plan={editingPlan}
        onClose={() => setEditingPlan(null)}
        onSave={handleSaveEdit}
      />
      <DeleteConfirmationDialog
        open={!!planToDelete}
        title="Eliminar plan"
        content="¿Seguro que deseas eliminar el plan seleccionado?"
        onClose={() => setPlanToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
      <ReportDialog
        open={reportForm.open}
        mode={reportForm.mode}
        report={reportForm.report}
        onClose={handleCloseReportDialog}
        onSave={handleSaveReport}
        isSaving={isSavingReport}
      />
      <DeleteConfirmationDialog
        open={!!reportToDelete}
        title="Eliminar informe"
        content="¿Seguro que deseas eliminar el informe seleccionado?"
        onClose={() => setReportToDelete(null)}
        onConfirm={handleDeleteReportConfirm}
      />
    </Container>
  );
}
