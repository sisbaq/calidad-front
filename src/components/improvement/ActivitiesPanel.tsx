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
  /** (opcional) callback para el botón Añadir actividad */
  onAddActivity?: (findingId: string | number, activity: string) => void;
}

const BLUE = '#142334';

export default function ActivitiesPanel({
  finding,
  onUpdateSeg = () => { },
  onSendSeg = () => { },
  onDeleteSeg = () => { },
  onAddActivity = () => { },
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

  const openSend = (payload: Parameters<typeof onSendSeg>[0]) =>
    setConfirm({ open: true, payload });
  const closeSend = () => setConfirm({ open: false, payload: null });
  const doSend = async () => {
    const p = confirm.payload;
    if (!p) return;
    await onSendSeg(p);
    closeSend();
  };

  const [obsOpen, setObsOpen] = useState(false);
  const [obsText, setObsText] = useState<string>('');
  const handleOpenObs = (text?: string) => {
    setObsText(text || '');
    setObsOpen(true);
  };
  const handleCloseObs = () => setObsOpen(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseAddModal = () => setAddModalOpen(false);
  const handleSaveActivity = async (activityName: string) => {
    await onAddActivity(finding.id, activityName);
  };

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
                    1: !!a.seguimientoIEnviado,
                    2: !!a.seguimientoIIEnviado,
                    3: !!a.seguimientoIIIEnviado,
                    4: !!a.seguimientoIVEnviado,
                  };
                  const draft = {
                    1: a.seguimientoI ?? '',
                    2: a.seguimientoII ?? '',
                    3: a.seguimientoIII ?? '',
                    4: a.seguimientoIV ?? '',
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
                      onOpenObservations={(text) => handleOpenObs(text)}
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

      <ActivityObservationsDialog
        open={obsOpen}
        observations={obsText}
        onClose={handleCloseObs}
      />

      <AddActivityModal
        open={addModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleSaveActivity}
      />
    </Box>
  );
}
