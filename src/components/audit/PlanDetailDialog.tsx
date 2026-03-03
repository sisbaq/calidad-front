import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Paper, Typography, Stack, Button, IconButton,
  TextField, Snackbar, Alert, Accordion, AccordionSummary,
  AccordionDetails, Tooltip, CircularProgress
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';

import { getImprovementPlanActivitiesByPlanId, updateActivityObservation, closeImprovementPlanActivity } from '@/services/improvement.service';
import { getFindingById } from '@/services/findings.service';
import { viewPlanActividadMejoramientoFile } from '@/services/file.service';
import type { ImprovementPlanActivity, ImprovementPlanWithDetails } from '@/types/improvement';
import type { Finding } from '@/types/audit';
import { mapPlanStatus } from '@/mappers/improvement.mapper';

interface PlanDetailDialogProps {
  open: boolean;
  onClose: () => void;
  plan: ImprovementPlanWithDetails | null;
  colorPrimary?: string; // #142334
  colorSuccess?: string; // #279B48
}

const segRoman: string[] = ['I', 'II', 'III', 'IV'];

interface SectionCardProps {
  title?: string;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
}

function SectionCard({ title, children, sx }: SectionCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 1.5, ...sx }}>
      {title && (
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          {title}
        </Typography>
      )}
      {children}
    </Paper>
  );
}

export default function PlanDetailDialog({
  open,
  onClose,
  plan,
  colorPrimary = '#142334',
  colorSuccess = '#279B48',
}: PlanDetailDialogProps) {

  const [activities, setActivities] = React.useState<ImprovementPlanActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = React.useState(false);
  const [activitiesError, setActivitiesError] = React.useState<string | null>(null);

  const [obsOpen, setObsOpen] = React.useState(false);
  const [obsText, setObsText] = React.useState('');
  const [targetSeg, setTargetSeg] = React.useState<{ activityId: string | number; seguimiento: 1 | 2 | 3 | 4; titulo: string } | null>(null);

  const [editOpen, setEditOpen] = React.useState(false);
  const [editText, setEditText] = React.useState('');
  const [editTarget, setEditTarget] = React.useState<{ activityId: string | number; seguimiento: 1 | 2 | 3 | 4 } | null>(null);


  const [closeDlg, setCloseDlg] = React.useState<{ open: boolean; activityId: string | number | null }>({ open: false, activityId: null });
  const [closing, setClosing] = React.useState(false);
  const [closingId, setClosingId] = React.useState<string | number | null>(null);
  const [closedIds, setClosedIds] = React.useState<Set<string | number>>(new Set());


  const [snackbar, setSnackbar] = React.useState<{ open: boolean; msg: string; sev: 'success' | 'info' | 'warning' | 'error' }>({
    open: false,
    msg: '',
    sev: 'success',
  });

  const [findingOpen, setFindingOpen] = React.useState(false);
  const [findingLoading, setFindingLoading] = React.useState(false);
  const [findingError, setFindingError] = React.useState<string | null>(null);
  const [findingDetail, setFindingDetail] = React.useState<Finding | null>(null);


  React.useEffect(() => {
    if (open && plan?.id) {
      const fetchActivities = async () => {
        try {
          setLoadingActivities(true);
          setActivitiesError(null);
          const data = await getImprovementPlanActivitiesByPlanId(plan.id);
          setActivities(data);
        } catch (err) {
          console.error('Error fetching activities:', err);
          setActivitiesError('No se pudieron cargar las actividades.');
        } finally {
          setLoadingActivities(false);
        }
      };
      fetchActivities();
    } else {
      setActivities([]);
    }
  }, [open, plan?.id]);

  if (!plan) return null;

  const saveBtnSx = { backgroundColor: colorPrimary, '&:hover': { backgroundColor: colorPrimary } };

  const openObs = (activityId: string | number, seguimiento: 1 | 2 | 3 | 4, titulo: string) => {
    setTargetSeg({ activityId, seguimiento, titulo });
    setObsText('');
    setObsOpen(true);
  };

  const saveObs = async () => {
    if (!obsText.trim() || !targetSeg) return;
    try {
      await updateActivityObservation(targetSeg.activityId, targetSeg.seguimiento, obsText.trim());
      const data = await getImprovementPlanActivitiesByPlanId(plan.id);
      setActivities(data);
      setObsOpen(false);
      setSnackbar({ open: true, msg: 'Observación guardada correctamente', sev: 'success' });
    } catch (err) {
      console.error('Error saving observation:', err);
      setSnackbar({ open: true, msg: 'Error al guardar la observación', sev: 'error' });
    }
  };

  const openEdit = (activityId: string | number, seguimiento: 1 | 2 | 3 | 4, currentText: string) => {
    setEditTarget({ activityId, seguimiento });
    setEditText(currentText || '');
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editText.trim() || !editTarget) return;
    try {
      await updateActivityObservation(editTarget.activityId, editTarget.seguimiento, editText.trim());
      const data = await getImprovementPlanActivitiesByPlanId(plan.id);
      setActivities(data);
      setEditOpen(false);
      setSnackbar({ open: true, msg: 'Observación actualizada', sev: 'success' });
    } catch (err) {
      console.error('Error updating observation:', err);
      setSnackbar({ open: true, msg: 'Error al actualizar la observación', sev: 'error' });
    }
  };


  const hasActivityFollowup = (activity: ImprovementPlanActivity): boolean => {
    const followups = [
      activity.followup1,
      activity.followup2,
      activity.followup3,
      activity.followup4,
    ];

    return followups.some((item) => typeof item === 'string' && item.trim().length > 0);
  };

  const requestCloseActivity = (activity: ImprovementPlanActivity) => {
    if (!hasActivityFollowup(activity)) {
      setSnackbar({
        open: true,
        msg: 'No se puede cerrar una actividad sin seguimiento.',
        sev: 'warning',
      });
      return;
    }

    setCloseDlg({ open: true, activityId: activity.id });
  };

  const confirmCloseActivity = async () => {
    if (!closeDlg.activityId) return;
    try {
      setClosing(true);
      setClosingId(closeDlg.activityId);

      const activity = activities.find((act) => act.id === closeDlg.activityId);
      if (activity && !hasActivityFollowup(activity)) {
        setSnackbar({
          open: true,
          msg: 'No se puede cerrar una actividad sin seguimiento.',
          sev: 'warning',
        });
        setCloseDlg({ open: false, activityId: null });
        return;
      }

      // Call the close service directly - returns the updated activity
      const updatedActivity = await closeImprovementPlanActivity(closeDlg.activityId);

      // Update the local state with the returned activity
      setActivities(prev => 
        prev.map(act => 
          act.id === updatedActivity.id ? updatedActivity : act
        )
      );

      setClosedIds(prev => {
        const next = new Set(prev);
        next.add(closeDlg.activityId!);
        return next;
      });

      setSnackbar({ open: true, msg: 'Actividad cerrada correctamente.', sev: 'success' });
      setCloseDlg({ open: false, activityId: null });
    } catch (err) {
      console.error('Error closing activity:', err);
      setSnackbar({ open: true, msg: 'No se pudo cerrar la actividad.', sev: 'error' });
    } finally {
      setClosing(false);
      setClosingId(null);
    }
  };

  const openFindingDetail = async () => {
    if (!plan.findingId) return;

    try {
      setFindingOpen(true);
      setFindingLoading(true);
      setFindingError(null);
      const finding = await getFindingById(plan.findingId);
      setFindingDetail(finding);
    } catch (error) {
      console.error('Error fetching finding detail:', error);
      setFindingDetail(null);
      const message = error instanceof Error ? error.message : 'No se pudo cargar el hallazgo.';
      setFindingError(message);
    } finally {
      setFindingLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          mr: findingOpen ? { md: '260px' } : 0,
          transition: 'margin-right 200ms          ease',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: colorPrimary }}>
        Detalle del Plan de Mejoramiento
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Box>
          <SectionCard>
            <Stack direction="row" spacing={2}>
              <Box flex={1}>
                <Typography variant="caption" color="text.secondary">Proceso</Typography>
                <Typography variant="body2">{plan.processName || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Estado</Typography>
                <Typography variant="body2">{mapPlanStatus(plan.status)}</Typography>
              </Box>
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'flex-end' }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={openFindingDetail}
                  sx={{
                    color: '#fff',
                    backgroundColor: colorSuccess,
                    fontWeight: 700,
                    '&:hover': {
                      backgroundColor: colorSuccess,
                    },
                  }}
                >
                  VER HALLAZGO
                </Button>
              </Box>
            </Stack>
          </SectionCard>

          {loadingActivities ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Cargando actividades...
              </Typography>
            </Stack>
          ) : activitiesError ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {activitiesError}
            </Alert>
          ) : (
            <SectionCard title="Actividades de mejoramiento">
              {activities.length > 0 ? (
                activities.map((activity) => {
                  const followups = [
                    { num: 1, text: activity.followup1, file: activity.files?.[1], obs: activity.followup1Comment },
                    { num: 2, text: activity.followup2, file: activity.files?.[2], obs: activity.followup2Comment },
                    { num: 3, text: activity.followup3, file: activity.files?.[3], obs: activity.followup3Comment },
                    { num: 4, text: activity.followup4, file: activity.files?.[4], obs: activity.followup4Comment },
                  ].filter(seg => seg.text);

                  return (
                    <Accordion
                      key={`act-${activity.id}`}
                      sx={{ mb: 1, borderRadius: 2, '&:before': { display: 'none' } }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ bgcolor: '#fafafa', borderRadius: 2 }}
                      >
                        <Stack direction="row" alignItems="center" sx={{ width: '100%' }}>
                          <Typography sx={{ fontWeight: 700, color: colorPrimary, flex: 1, pr: 2 }}>
                            {activity.description || 'Actividad'}
                          </Typography>

                          <Tooltip
                            title={
                              activity.closed
                                ? 'La actividad ya esta cerrada'
                                : !hasActivityFollowup(activity)
                                  ? 'No se puede cerrar una actividad si no tiene un seguimiento diligenciado'
                                  : 'Cerrar esta actividad'
                            }
                          >
                            <Box
                              component="div"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                            >
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestCloseActivity(activity);
                                }}
                                disabled={
                                  activity.closed ||
                                  closedIds.has(activity.id) ||
                                  closingId === activity.id ||
                                  !hasActivityFollowup(activity)
                                }
                                sx={{
                                  fontWeight: 700,
                                  borderRadius: 1.5,
                                  minWidth: 140,
                                  backgroundColor: colorSuccess,
                                  '&:hover': { backgroundColor: colorSuccess }
                                }}
                              >
                                CERRAR ACTIVIDAD
                              </Button>
                            </Box>
                          </Tooltip>
                        </Stack>
                      </AccordionSummary>

                      <AccordionDetails>
                        <Stack spacing={1}>
                          {followups.length > 0 ? (
                            followups.map((seg) => (
                              <Paper key={`seg-${seg.num}`} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colorPrimary }}>
                                    {`Seguimiento ${segRoman[seg.num - 1]}`}
                                  </Typography>
                                  <Stack direction="row" spacing={0.5}>
                                    <Tooltip title={activity.closed ? "No se pueden agregar observaciones a actividades cerradas" : "Agregar observación"}>
                                      <span>
                                        <IconButton
                                          size="small"
                                          onClick={() => openObs(activity.id, seg.num as 1 | 2 | 3 | 4, `Seguimiento ${segRoman[seg.num - 1]}`)}
                                          disabled={activity.closed}
                                          sx={{ color: colorPrimary }}
                                        >
                                          <ChatBubbleOutlineIcon fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                    {seg.file && (
                                      <Tooltip title="Ver archivo">
                                        <IconButton
                                          size="small"
                                          onClick={async () => {
                                            try {
                                              await viewPlanActividadMejoramientoFile(activity.id, seg.num as 1 | 2 | 3 | 4);
                                            } catch (error) {
                                              console.error('Failed to view file:', error);
                                              const errorMsg = error instanceof Error ? error.message : 'No se pudo abrir el archivo';
                                              setSnackbar({ 
                                                open: true, 
                                                msg: errorMsg === 'Archivo no encontrado' 
                                                  ? 'El archivo no se encuentra en el servidor. Es posible que haya sido eliminado.'
                                                  : errorMsg, 
                                                sev: 'error' 
                                              });
                                            }
                                          }}
                                          sx={{ color: colorPrimary }}
                                        >
                                          <AttachFileOutlinedIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Stack>
                                </Stack>

                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 1 }}>
                                  {seg.text}
                                </Typography>

                                {seg.obs && (
                                  <Paper variant="outlined" sx={{ p: 1, bgcolor: '#fffbf0', borderColor: '#ffc107' }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                                      <Box flex={1}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#f57c00' }}>
                                          Observación del auditor:
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                                          {seg.obs}
                                        </Typography>
                                      </Box>
                                      <Tooltip title={activity.closed ? "No se pueden editar observaciones de actividades cerradas" : "Editar observación"}>
                                        <span>
                                          <IconButton
                                            size="small"
                                            onClick={() => openEdit(activity.id, seg.num as 1 | 2 | 3 | 4, seg.obs || '')}
                                            disabled={activity.closed}
                                            sx={{ color: colorPrimary, ml: 1 }}
                                          >
                                            <EditOutlinedIcon fontSize="small" />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                    </Stack>
                                  </Paper>
                                )}
                              </Paper>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No hay seguimientos registrados para esta actividad.
                            </Typography>
                          )}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay actividades registradas para este plan.
                </Typography>
              )}
            </SectionCard>
          )}

          {(plan.startDate || plan.endDate) && (
            <Paper variant="outlined" sx={{ borderRadius: 2, mt: 1, p: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                Cronograma
              </Typography>
              <Stack direction="row" spacing={3}>
                {plan.startDate && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonthIcon color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Fecha inicial</Typography>
                      <Typography variant="body2" sx={{ mt: 0.25 }}>{plan.startDate}</Typography>
                    </Box>
                  </Stack>
                )}
                {plan.endDate && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonthIcon color="error" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Fecha terminación</Typography>
                      <Typography variant="body2" sx={{ mt: 0.25 }}>{plan.endDate}</Typography>
                    </Box>
                  </Stack>
                )}
              </Stack>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ color: colorPrimary }}>Cerrar</Button>
      </DialogActions>

      <Dialog
        open={findingOpen}
        onClose={() => setFindingOpen(false)}
        fullWidth
        maxWidth="sm"
        hideBackdrop
        disableEnforceFocus
        disableAutoFocus
        sx={{
          '& .MuiDialog-container': {
            justifyContent: 'flex-end',
            alignItems: 'stretch',
            pointerEvents: 'none',
          },
          '& .MuiDialog-paper': {
            m: 0,
            width: { xs: '100%', sm: 520 },
            maxWidth: '100%',
            height: '100%',
            borderRadius: 0,
            backgroundColor: colorPrimary,
            pointerEvents: 'auto',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#fff', backgroundColor: colorPrimary }}>
          Detalle del hallazgo
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: colorPrimary }}>
          {findingLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
              <CircularProgress size={32} sx={{ color: '#fff' }} />
              <Typography variant="body2" sx={{ mt: 2, color: '#fff' }}>
                Cargando hallazgo...
              </Typography>
            </Stack>
          ) : findingError ? (
            <Alert severity="error">{findingError}</Alert>
          ) : findingDetail ? (
            <Stack spacing={1.5}>
              <SectionCard>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">ID hallazgo</Typography>
                    <Typography variant="body2">{findingDetail.id}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Proceso auditado</Typography>
                    <Typography variant="body2">{findingDetail.auditedProcess || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Informe de auditoría</Typography>
                    <Typography variant="body2">{findingDetail.auditReportDescription || 'N/A'}</Typography>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">Tipo auditoría</Typography>
                      <Typography variant="body2">{findingDetail.auditType || 'N/A'}</Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">Tipo hallazgo</Typography>
                      <Typography variant="body2">{findingDetail.findingType || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">Fuente</Typography>
                      <Typography variant="body2">{findingDetail.source || 'N/A'}</Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">Fecha reporte</Typography>
                      <Typography variant="body2">{findingDetail.reportedOnDate || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Numeral</Typography>
                    <Typography variant="body2">{findingDetail.requirementNumeral || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Condición</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {findingDetail.condition || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Descripción del hecho</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {findingDetail.description || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Reportado por</Typography>
                    <Typography variant="body2">{findingDetail.reportedBy || 'N/A'}</Typography>
                  </Box>
                </Stack>
              </SectionCard>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No hay información de hallazgo disponible.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colorPrimary }}>
          <Button onClick={() => setFindingOpen(false)} sx={{ color: '#fff' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={obsOpen} onClose={() => setObsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colorPrimary, fontWeight: 700 }}>
          Agregar observación {targetSeg ? `– ${targetSeg.titulo}` : ''}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            label="Observación"
            value={obsText}
            onChange={(e) => setObsText(e.target.value)}
            sx={{
              '& label.Mui-focused': { color: colorPrimary },
              '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: colorPrimary },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setObsOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveObs} sx={saveBtnSx}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: colorPrimary, fontWeight: 700 }}>
          Editar observación
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            label="Observación"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            sx={{
              '& label.Mui-focused': { color: colorPrimary },
              '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: colorPrimary },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveEdit} sx={saveBtnSx}>Guardar cambios</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={closeDlg.open} onClose={() => setCloseDlg({ open: false, activityId: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: colorPrimary }}>Cerrar actividad</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            ¿Confirmas que deseas cerrar esta actividad?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDlg({ open: false, activityId: null })}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={confirmCloseActivity}
            disabled={closing}
            sx={{ backgroundColor: colorSuccess, '&:hover': { backgroundColor: colorSuccess } }}
          >
            {closing ? 'Cerrando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.sev}
          sx={{ width: '100%' }}
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
