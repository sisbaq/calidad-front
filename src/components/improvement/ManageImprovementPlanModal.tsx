import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  DialogContentText,
  Snackbar,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AddActivityModal from './AddActivityModal';
import type { FindingWithPlan, ImprovementPlanActivity } from '@/types/improvement';
import { parseDateString } from '@/utils/dateUtils';

export type Activity = {
  description: string;
  dueDate: string;
};

type ManageImprovementPlanModalProps = {
  open?: boolean;
  onClose: () => void;
  finding: FindingWithPlan | null;
  onSave: (updated: {
    id: string | number;
    analisisCausa: string;
    actividades: ImprovementPlanActivity[];
    fechaInicio: string;
    fechaFin: string;
    estado?: string;
  }) => void;
};

const BLUE = '#142334';
const GREEN = '#279B48';
const GREEN_BG_SOFT = 'rgba(39, 155, 72, 0.08)';
const GREEN_BORDER_SOFT = 'rgba(39, 155, 72, 0.32)';
const MIN_PORQUES = 3;
const MAX_PORQUES = 5;

function SectionTitle({
  icon,
  title,
  required = false,
}: {
  icon: React.ReactNode;
  title: string;
  required?: boolean;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: GREEN,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
        {title} {required && <span style={{ color: '#d32f2f' }}>*</span>}
      </Typography>
    </Stack>
  );
}

export default function ManageImprovementPlanModal({
  open = false,
  onClose = () => {},
  finding,
  onSave = () => {},
}: ManageImprovementPlanModalProps) {
  const hasExistingPlan = Boolean(finding?.improvementPlan);

 const isOportunidadMejora = String(finding?.findingType ?? '')
  .toLowerCase()
  .includes('oportunidad');

  const [analisisPorques, setAnalisisPorques] = useState<string[]>(
    Array.from({ length: MIN_PORQUES }, () => '')
  );
  const [actividades, setActividades] = useState<ImprovementPlanActivity[]>([]);
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  const [editIndex, setEditIndex] = useState(-1);
  const [editValue, setEditValue] = useState<Pick<ImprovementPlanActivity, 'description' | 'dueDate'>>({
    description: '',
    dueDate: '',
  });
  const [triedSave, setTriedSave] = useState(false);

  const [confirmDel, setConfirmDel] = useState<{ open: boolean; idx: number }>({
    open: false,
    idx: -1,
  });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (!open) return;
    setAnalisisPorques(Array.from({ length: MIN_PORQUES }, () => ''));
    setActividades([]);
    setIsAddingActivity(false);
    setEditIndex(-1);
    setEditValue({ description: '', dueDate: '' });
    setTriedSave(false);
    setConfirmDel({ open: false, idx: -1 });
    setSnackbar({ open: false, message: '', severity: 'success' });
  }, [open, finding?.id]);

  const handleAddActivity = (activity: Pick<ImprovementPlanActivity, 'description' | 'dueDate'>) => {
    const newActivity: ImprovementPlanActivity = {
      id: Date.now(), // Temporary ID for new activities
      description: activity.description,
      dueDate: activity.dueDate,
      closed: false,
      followup1: '',
      followup2: '',
      followup3: '',
      followup4: '',
      followup1Sent: false,
      followup2Sent: false,
      followup3Sent: false,
      followup4Sent: false,
      followup1Comment: '',
      followup2Comment: '',
      followup3Comment: '',
      followup4Comment: '',
      files: {
        1: null,
        2: null,
        3: null,
        4: null,
      },
    };
    setActividades((prev) => [...prev, newActivity]);
    setIsAddingActivity(false);
    setSnackbar({
      open: true,
      message: 'Actividad agregada correctamente',
      severity: 'success',
    });
  };

  const requestRemoveActividad = (idx: number) =>
    setConfirmDel({ open: true, idx });

  const cancelRemoveActividad = () =>
    setConfirmDel({ open: false, idx: -1 });

  const confirmRemoveActividad = () => {
    setActividades((prev) => prev.filter((_, i) => i !== confirmDel.idx));
    if (editIndex === confirmDel.idx) {
      setEditIndex(-1);
      setEditValue({ description: '', dueDate: '' });
    }
    setConfirmDel({ open: false, idx: -1 });
    setSnackbar({
      open: true,
      message: 'Actividad eliminada correctamente',
      severity: 'success',
    });
  };

  const updatePorque = (index: number, value: string) => {
    setAnalisisPorques((prev) =>
      prev.map((porque, idx) => (idx === index ? value : porque))
    );
  };

  const addPorque = () => {
    setAnalisisPorques((prev) => {
      if (prev.length >= MAX_PORQUES) return prev;
      return [...prev, ''];
    });
  };

  const removePorque = () => {
    setAnalisisPorques((prev) => {
      if (prev.length <= MIN_PORQUES) return prev;
      return prev.slice(0, -1);
    });
  };

  const analisisOk = useMemo(() => {
    if (isOportunidadMejora) return true;
    const cantidadPorquesValida =
      analisisPorques.length >= MIN_PORQUES &&
      analisisPorques.length <= MAX_PORQUES;
    const todosConTexto = analisisPorques.every(
      (porque) => porque.trim().length > 0
    );

    return cantidadPorquesValida && todosConTexto;
  }, [analisisPorques, isOportunidadMejora]);

  const actividadesOk = useMemo(() => actividades.length > 0, [actividades]);

  const canSubmit = analisisOk && actividadesOk;

  const analisisError =
    triedSave && !analisisOk && !isOportunidadMejora;

  const actividadesError = triedSave && !actividadesOk;

  const handleSave = () => {
    setTriedSave(true);
    if (!canSubmit) return;

    const analisisCausa = analisisPorques
      .map((porque) => porque.trim().replace(/\s+/g, ' '))
      .map((porque, index) => `Por qué ${index + 1}: ${porque}`)
      .join('\n');

    // Get the earliest and latest activity due dates
    const dueDates = actividades
      .filter(a => a.dueDate)
      .map(a => new Date(a.dueDate!).getTime())
      .filter(d => !isNaN(d));
    const fechaInicio = new Date().toISOString().split('T')[0]; // Today in YYYY-MM-DD format
    const fechaFin = dueDates.length > 0 
      ? new Date(Math.max(...dueDates)).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    onSave({
      id: finding?.id || '',
      analisisCausa,
      actividades: actividades,
      fechaInicio,
      fechaFin,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 1,
          pt: 2,
          pl: 3,
        }}
      >
        <DialogTitle
          sx={{ m: 0, p: 0, fontWeight: 800, fontSize: 20, color: BLUE }}
        >
          Gestionar Hallazgo
        </DialogTitle>
        <IconButton onClick={onClose} size="small" sx={{ mr: 1 }}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
        {hasExistingPlan ? (
          <Alert
            icon={false}
            sx={{
              borderRadius: 2,
              bgcolor: GREEN_BG_SOFT,
              border: `1px solid ${GREEN_BORDER_SOFT}`,
              '& .MuiAlert-message': { width: '100%' },
            }}
          >
            <Typography sx={{ fontWeight: 800, color: BLUE, mb: 0.5 }}>
              Este hallazgo ya tiene actividades gestionadas.
            </Typography>
            <Typography variant="body2" sx={{ color: BLUE }}>
              Si necesitas <strong>añadir más actividades</strong> a este plan,
              hazlo desde la opción <strong>“Ver”</strong>, directamente en la
              tabla de actividades.
            </Typography>
          </Alert>
        ) : (
          <>
            {!isOportunidadMejora && (
              <>
                <SectionTitle
                  title="Análisis de causa"
                  icon={<DescriptionRoundedIcon />}
                  required
                />
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderColor: analisisError ? 'error.main' : 'divider',
                  }}
                >
                  <Stack spacing={1.25}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Ingresa entre {MIN_PORQUES} y {MAX_PORQUES} porqués. Debes
                      completar todos los porqués visibles.
                    </Typography>

                    {analisisPorques.map((porque, index) => {
                      const porqueError = triedSave && porque.trim().length === 0;

                      return (
                        <TextField
                          key={index}
                          label={`Por qué ${index + 1}`}
                          placeholder={`Describe el porqué ${index + 1}`}
                          value={porque}
                          onChange={(e) => updatePorque(index, e.target.value)}
                          fullWidth
                          multiline
                          minRows={2}
                          error={porqueError}
                          helperText={
                            porqueError ? 'Este porqué es obligatorio.' : ' '
                          }
                        />
                      );
                    })}

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      justifyContent="space-between"
                      alignItems={{ xs: 'stretch', sm: 'center' }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {analisisPorques.length}/{MAX_PORQUES} porqués
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={removePorque}
                          disabled={analisisPorques.length <= MIN_PORQUES}
                        >
                          Quitar último
                        </Button>
                        <Button
                          startIcon={<AddRoundedIcon />}
                          variant="outlined"
                          size="small"
                          onClick={addPorque}
                          disabled={analisisPorques.length >= MAX_PORQUES}
                        >
                          Agregar porqué
                        </Button>
                      </Stack>
                    </Stack>

                    {analisisError && (
                      <Typography variant="caption" sx={{ color: 'error.main' }}>
                        Debes registrar entre {MIN_PORQUES} y {MAX_PORQUES} porqués,
                        completando cada campo.
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              </>
            )}

            <SectionTitle
              title="Actividades de mejoramiento (resumen)"
              icon={<TaskAltRoundedIcon />}
              required
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                startIcon={<AddRoundedIcon />}
                onClick={() => setIsAddingActivity(true)}
                variant="contained"
                sx={{
                  bgcolor: BLUE,
                  '&:hover': { bgcolor: '#0e1926' },
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Agregar Actividad
              </Button>
            </Box>

            <Paper
              variant="outlined"
              sx={{
                mt: 1.5,
                p: 1.25,
                borderRadius: 2,
                minHeight: 88,
                bgcolor: actividades.length
                  ? 'background.paper'
                  : 'background.default',
                borderStyle: actividades.length ? 'solid' : 'dashed',
                borderColor: actividadesError ? 'error.main' : 'divider',
              }}
            >
              {actividades.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    color: actividadesError
                      ? 'error.main'
                      : 'text.secondary',
                    py: 3,
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                    {actividadesError
                      ? 'Falta añadir actividades'
                      : 'No hay actividades añadidas'}
                  </Typography>
                  <Typography variant="caption">
                    Agrega una o varias actividades de mejoramiento para este
                    hallazgo.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {actividades.map((act, i) => {
                    const editing = i === editIndex;
                    return (
                      <Paper
                        key={i}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: editing ? 'action.hover' : 'background.paper',
                          borderColor: editing ? BLUE : 'divider',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            {editing ? (
                              <Stack spacing={1}>
                                <TextField
                                  value={editValue.description}
                                  onChange={(e) => setEditValue({ ...editValue, description: e.target.value })}
                                  fullWidth
                                  multiline
                                  minRows={2}
                                  autoFocus
                                  label="Descripción"
                                  placeholder="Describa la actividad"
                                />
                                <TextField
                                  type="date"
                                  value={editValue.dueDate}
                                  onChange={(e) => setEditValue({ ...editValue, dueDate: e.target.value })}
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                  label="Fecha de finalización"
                                />
                              </Stack>
                            ) : (
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'anywhere',
                                    mb: 0.75,
                                    fontWeight: 500,
                                  }}
                                >
                                  {act.description}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.secondary',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                  }}
                                >
                                  <TodayRoundedIcon sx={{ fontSize: 14 }} />
                                  Vence: {act.dueDate ? parseDateString(act.dueDate).toLocaleDateString('es-ES') : 'Sin fecha'}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                            {editing ? (
                              <>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    const desc = editValue.description.trim().replace(/\s+/g, ' ');
                                    const dueDate = editValue.dueDate;
                                    if (!desc || !dueDate) return;
                                    setActividades((prev) =>
                                      prev.map((x, idx) => (idx === editIndex ? { ...x, description: desc, dueDate } : x))
                                    );
                                    setEditIndex(-1);
                                    setEditValue({ description: '', dueDate: '' });
                                    setSnackbar({
                                      open: true,
                                      message: 'Actividad actualizada correctamente',
                                      severity: 'success',
                                    });
                                  }}
                                  disabled={!editValue.description.trim() || !editValue.dueDate}
                                  title="Guardar cambios"
                                >
                                  <SaveRoundedIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditIndex(-1);
                                    setEditValue({ description: '', dueDate: '' });
                                  }}
                                  title="Cancelar edición"
                                >
                                  <CancelRoundedIcon fontSize="small" />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditIndex(i);
                                    setEditValue({
                                      description: act.description,
                                      dueDate: act.dueDate || '',
                                    });
                                  }}
                                  sx={{ color: 'text.secondary' }}
                                  title="Editar actividad"
                                >
                                  <EditRoundedIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => requestRemoveActividad(i)}
                                  title="Eliminar actividad"
                                >
                                  <DeleteRoundedIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>

        {hasExistingPlan ? (
          <Button
            variant="contained"
            onClick={onClose}
            sx={{ fontWeight: 700, bgcolor: BLUE }}
          >
            Entendido
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!canSubmit}
            sx={{ fontWeight: 700, bgcolor: BLUE }}
          >
            Guardar gestión
          </Button>
        )}
      </DialogActions>

      <Dialog open={confirmDel.open} onClose={cancelRemoveActividad}>
        <DialogTitle>Eliminar actividad</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás segura(o) de eliminar esta actividad? Esta acción no se puede
            deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelRemoveActividad}>Cancelar</Button>
          <Button
            onClick={confirmRemoveActividad}
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <AddActivityModal
        open={isAddingActivity}
        onClose={() => setIsAddingActivity(false)}
        onSave={handleAddActivity}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
