import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Stack,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ActivityRow from './ActivityRow';
import ConfirmDialog from '@components/common/ConfirmDialog';
import ActivityObservationsDialog from '@components/improvement/ActivityObservationDialog';
import AddActivityModal from './AddActivityModal';
import type { FindingWithPlan } from '@/types/improvement';

interface ActivitiesPanelProps {
  finding: FindingWithPlan;
  onUpdateSeg?: (payload: {
    findingId: string | number;
    activityId: string | number;
    segKey: string;
    value: string;
  }) => void;
  onSendSeg?: (payload: {
    findingId: string | number;
    activityId: string | number;
    segKey: string;
    value: string;
    file?: File;
  }) => void;
  onDeleteSeg?: (payload: {
    findingId: string | number;
    activityId: string | number;
    segKey: string;
  }) => void;
  onDeleteActivity?: (payload: {
    findingId: string | number;
    activityId: string | number;
  }) => void | Promise<void>;
  /** (opcional) callback para el botón Añadir actividad */
  onAddActivity?: (findingId: string | number, activity: string) => void;
  hideObservations?: boolean;
  hideFollowupStatus?: boolean;
  /** Solo para auditoria: habilita boton Enviar seguimiento */
  enableSend?: boolean;
}

const BLUE = '#142334';

export default function ActivitiesPanel({
  finding,
  onUpdateSeg = () => { },
  onSendSeg = () => { },
  onDeleteSeg = () => { },
  onDeleteActivity = () => { },
  onAddActivity = () => { },
  hideObservations = false,
  hideFollowupStatus = false,
  enableSend = false,
}: ActivitiesPanelProps) {
  if (!finding) return null;
  const activities = Array.isArray(finding.activities) ? finding.activities : [];

  // paginación a nivel de ACTIVIDADES
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return activities.slice(start, start + rowsPerPage);
  }, [activities, page, rowsPerPage]);

  // confirmación al ENVIAR seguimiento
  const [confirm, setConfirm] = useState<{
    open: boolean;
    payload: Parameters<typeof onSendSeg>[0] | null;
  }>({ open: false, payload: null });

  // error message for validation
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openSend = (payload: Parameters<typeof onSendSeg>[0]) => {
    // Validate that seguimiento text is not empty
    if (!payload.value || payload.value.trim() === '') {
      setErrorMsg('El campo de seguimiento es requerido para enviar');
      return;
    }
    setConfirm({ open: true, payload });
  };
  const closeSend = () => setConfirm({ open: false, payload: null });
  const doSend = async () => {
    const p = confirm.payload;
    if (!p) return;
    await onSendSeg(p);
    closeSend();
  };

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    activityId: string | number | null;
  }>({ open: false, activityId: null });

  const requestDeleteActivity = (activityId: string | number, hasSent: boolean) => {
    if (hasSent) {
      setErrorMsg('No se puede eliminar la actividad porque ya tiene seguimientos enviados');
      return;
    }
    setConfirmDelete({ open: true, activityId });
  };

  const cancelDeleteActivity = () => setConfirmDelete({ open: false, activityId: null });

  const confirmDeleteActivity = async () => {
    if (!confirmDelete.activityId) return;
    try {
      await onDeleteActivity({ findingId: finding.id, activityId: confirmDelete.activityId });
      setConfirmDelete({ open: false, activityId: null });
    } catch (error) {
      console.error('Failed to delete activity:', error);
      const msg = error instanceof Error ? error.message : 'No se pudo eliminar la actividad.';
      setErrorMsg(msg);
    }
  };

  const [obsOpen, setObsOpen] = useState(false);
  const [obsComments, setObsComments] = useState<{ 1?: string; 2?: string; 3?: string; 4?: string }>({});
  const handleOpenObs = (comments: { 1?: string; 2?: string; 3?: string; 4?: string }) => {
    setObsComments(comments);
    setObsOpen(true);
  };
  const handleCloseObs = () => setObsOpen(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseAddModal = () => setAddModalOpen(false);

  return (
    <Box
      sx={{
        bgcolor: 'rgba(20,35,52,0.03)',
        borderRadius: 2,
        p: { xs: 1.5, md: 2 },
      }}
    >
      <Box sx={{ maxWidth: 960, mx: 'auto', width: '100%' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: BLUE }}>
            Actividades
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenAddModal}
            sx={{
              bgcolor: BLUE,
              '&:hover': { bgcolor: '#0e1926' },
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            Añadir actividad
          </Button>
        </Stack>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflowX: 'auto',
            bgcolor: '#fff',
          }}
        >
          <Table size="small" sx={{ minWidth: 680 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 48 }} />
                <TableCell sx={{ fontWeight: 700 }}>Nombre de la Actividad</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, width: 160 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay actividades para mostrar
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((a, idx) => {
                  const act = { ...a, description: a.description ?? '' };
                  const sentFlags = {
                    1: !!a.followup1Sent,
                    2: !!a.followup2Sent,
                    3: !!a.followup3Sent,
                    4: !!a.followup4Sent,
                  };
                  const draft = {
                    1: a.followup1 ?? '',
                    2: a.followup2 ?? '',
                    3: a.followup3 ?? '',
                    4: a.followup4 ?? '',
                  };
                  const files = a.files || { 1: null, 2: null, 3: null, 4: null };

                  return (
                    <ActivityRow
                      key={a.id || idx}
                      findingId={finding.id}
                      activity={act}
                      initialDraftSeg={draft}
                      initialFiles={files}
                      sentFlags={sentFlags}
                      onSaveSeg={onUpdateSeg}
                      onSendSeg={openSend}
                      onDeleteSeg={onDeleteSeg}
                      onDeleteActivity={(activity, hasSent) => requestDeleteActivity(activity.id, hasSent)}
                      onOpenObservations={(comments) => handleOpenObs(comments)}
                      hideObservations={hideObservations}
                      hideFollowupStatus={hideFollowupStatus}
                      enableSend={enableSend}
                    />
                  );
                })
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={activities.length}
            page={page}
            onPageChange={(_e, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Filas por página:"
          />
        </TableContainer>
      </Box>

      <ConfirmDialog
        open={confirm.open}
        title="Enviar seguimiento"
        message="¿Está seguro de ENVIAR este seguimiento? Luego no podrá editarlo."
        onCancel={closeSend}
        onConfirm={doSend}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        title="Eliminar actividad"
        message="¿Seguro que deseas eliminar esta actividad? Esta acción no se puede deshacer."
        onCancel={cancelDeleteActivity}
        onConfirm={confirmDeleteActivity}
        confirmText="Eliminar"
      />

      {!hideObservations && (
        <ActivityObservationsDialog
          open={obsOpen}
          comments={obsComments}
          onClose={handleCloseObs}
        />
      )}

      <AddActivityModal
        open={addModalOpen}
        onClose={handleCloseAddModal}
        onSave={(activity) => onAddActivity(finding.id ?? 0, activity.description)}
      />

      {/* Error Snackbar for validation */}
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={4000}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorMsg(null)} severity="error" sx={{ width: '100%' }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
