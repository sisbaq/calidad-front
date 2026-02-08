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
  Chip,
  Alert,
  DialogContentText,
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

type FindingWithPlan = {
  id: string | number;
  activities?: Array<{
    id: string | number;
    description?: string;
    [k: string]: any;
  }>;
  [k: string]: any;
};

type ManageImprovementPlanModalProps = {
  open?: boolean;
  onClose: () => void;
  finding: FindingWithPlan | null;
  onSave: (updated: {
    id: string | number;
    analisisCausa: string;
    actividades: string[];
    fechaInicio: string;
    fechaFin: string;
    estado?: string;
  }) => void;
};

const BLUE = '#142334';
const GREEN = '#279B48';
const GREEN_BG_SOFT = 'rgba(39, 155, 72, 0.08)';
const GREEN_BORDER_SOFT = 'rgba(39, 155, 72, 0.32)';

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
  const hasExistingActivities = (finding?.activities?.length ?? 0) > 0;

 const isOportunidadMejora = String(finding?.findingType ?? '')
  .toLowerCase()
  .includes('oportunidad');


  const [analisis, setAnalisis] = useState('');
  const [actividadDraft, setActividadDraft] = useState('');
  const [actividades, setActividades] = useState<string[]>([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [editIndex, setEditIndex] = useState(-1);
  const [editValue, setEditValue] = useState('');
  const [triedSave, setTriedSave] = useState(false);

  const [confirmDel, setConfirmDel] = useState<{ open: boolean; idx: number }>({
    open: false,
    idx: -1,
  });

  useEffect(() => {
    if (!open) return;
    setAnalisis('');
    setActividadDraft('');
    setActividades([]);
    setFechaInicio('');
    setFechaFin('');
    setEditIndex(-1);
    setEditValue('');
    setTriedSave(false);
    setConfirmDel({ open: false, idx: -1 });
  }, [open, finding?.id]);

  const addActividad = () => {
    const v = actividadDraft.trim().replace(/\s+/g, ' ');
    if (!v) return;
    setActividades((prev) => [...prev, v]);
    setActividadDraft('');
  };

  const requestRemoveActividad = (idx: number) =>
    setConfirmDel({ open: true, idx });

  const cancelRemoveActividad = () =>
    setConfirmDel({ open: false, idx: -1 });

  const confirmRemoveActividad = () => {
    setActividades((prev) => prev.filter((_, i) => i !== confirmDel.idx));
    if (editIndex === confirmDel.idx) {
      setEditIndex(-1);
      setEditValue('');
    }
    setConfirmDel({ open: false, idx: -1 });
  };

  const startEdit = (idx: number, value: string) => {
    setEditIndex(idx);
    setEditValue(value);
  };

  const cancelEdit = () => {
    setEditIndex(-1);
    setEditValue('');
  };

  const saveEdit = () => {
    if (editIndex < 0) return;
    const v = editValue.trim().replace(/\s+/g, ' ');
    if (!v) return;
    setActividades((prev) =>
      prev.map((x, i) => (i === editIndex ? v : x))
    );
    setEditIndex(-1);
    setEditValue('');
  };

  const analisisOk = useMemo(
    () => (isOportunidadMejora ? true : analisis.trim().length > 0),
    [analisis, isOportunidadMejora]
  );

  const actividadesOk = useMemo(() => actividades.length > 0, [actividades]);

  const fechasOk = useMemo(() => {
    if (!fechaInicio || !fechaFin) return false;
    return fechaInicio <= fechaFin;
  }, [fechaInicio, fechaFin]);

  const canSubmit = analisisOk && actividadesOk && fechasOk;

  const analisisError =
    triedSave && !analisisOk && !isOportunidadMejora;

  const actividadesError = triedSave && !actividadesOk;
  const fechasError = triedSave && (!fechaInicio || !fechaFin || !fechasOk);

  const handleSave = () => {
    setTriedSave(true);
    if (!canSubmit) return;

    onSave({
      id: finding?.id || '',
      analisisCausa: analisis.trim(),
      actividades,
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
        {hasExistingActivities ? (
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
                <TextField
                  placeholder="Describe el análisis de causa del hallazgo..."
                  value={analisis}
                  onChange={(e) => setAnalisis(e.target.value)}
                  multiline
                  minRows={4}
                  fullWidth
                  error={analisisError}
                  helperText={
                    analisisError
                      ? 'Debes ingresar el análisis de causa.'
                      : ' '
                  }
                />
              </>
            )}

            <SectionTitle
              title="Actividades de mejoramiento (resumen)"
              icon={<TaskAltRoundedIcon />}
              required
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                placeholder="Añade una actividad…"
                value={actividadDraft}
                onChange={(e) => setActividadDraft(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
              <Button
                startIcon={<AddRoundedIcon />}
                onClick={addActividad}
                variant="contained"
                sx={{ bgcolor: BLUE, '&:hover': { bgcolor: '#0e1926' } }}
              >
                Agregar
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
                      <Box
                        key={i}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 1,
                          p: 1,
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          {editing ? (
                            <TextField
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              fullWidth
                              multiline
                              minRows={2}
                              autoFocus
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                overflowWrap: 'anywhere',
                                pr: 1,
                              }}
                            >
                              {act}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {editing ? (
                            <>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={saveEdit}
                              >
                                <SaveRoundedIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={cancelEdit}>
                                <CancelRoundedIcon fontSize="small" />
                              </IconButton>
                            </>
                          ) : (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => startEdit(i, act)}
                                sx={{ color: 'text.secondary' }}
                              >
                                <EditRoundedIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => requestRemoveActividad(i)}
                              >
                                <DeleteRoundedIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Paper>

            <SectionTitle title="Fechas" icon={<TodayRoundedIcon />} required />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                type="date"
                label="Inicio"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                error={fechasError && !fechaInicio}
                helperText={
                  fechasError && !fechaInicio ? 'Obligatoria' : ' '
                }
              />
              <TextField
                type="date"
                label="Fin"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                error={fechasError && !fechaFin}
                helperText={fechasError && !fechaFin ? 'Obligatoria' : ' '}
              />
            </Stack>

            {triedSave && fechaInicio && fechaFin && !fechasOk && (
              <Chip
                color="error"
                label="La fecha de inicio no puede ser mayor que la fecha fin"
              />
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>

        {hasExistingActivities ? (
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
    </Dialog>
  );
}
