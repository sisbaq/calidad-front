import { useState, useMemo, Fragment } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Collapse,
  Typography,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import ActivitiesPanel from './ActivitiesPanel';
import type { FindingWithPlan } from '@/types/improvement';

const BLUE = '#142334';

const ESTADO_COLORS: Record<string, { bg: string; fg: string }> = {
  Abierto: { bg: '#279B48', fg: '#ffffff' },
  Cerrado: { bg: '#142334', fg: '#ffffff' },
  Vencido: { bg: '#C62828', fg: '#ffffff' },
};

const SUBMISSION_STATUS_CONFIG: Record<string, { color: string; label: string; icon: any }> = {
  draft: { color: '#FDA946', label: 'Pendiente', icon: HourglassEmptyRoundedIcon },
  submitted: { color: '#142334', label: 'Enviado', icon: HourglassEmptyRoundedIcon },
  approved: { color: '#279B48', label: 'Aprobado', icon: CheckCircleRoundedIcon },
  rejected: { color: '#C62828', label: 'Rechazado', icon: WarningAmberRoundedIcon },
};

function EstadoChip({ estado = 'Abierto' }: { estado: string }) {
  const { bg, fg } = ESTADO_COLORS[estado] || ESTADO_COLORS.Abierto;
  return <Chip size="small" label={estado} sx={{ bgcolor: bg, color: fg, fontWeight: 600, borderRadius: 1 }} />;
}

function ApprovalStatusChip({ status = 'draft' }: { status?: string }) {
  const config = SUBMISSION_STATUS_CONFIG[status] || SUBMISSION_STATUS_CONFIG.draft;
  const Icon = config.icon;
  return (
    <Chip
      size="small"
      label={config.label}
      icon={<Icon />}
      sx={{
        bgcolor: config.color,
        color: '#ffffff',
        fontWeight: 600,
        borderRadius: 1,
      }}
    />
  );
}
const fmtDate = (d?: string): string => {
  if (!d) return '—';
  const raw = String(d).trim();

  // Parse without timezone shift: build a local date from components.
  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;

  if (raw.includes('/')) {
    const [dd, mm, yyyy] = raw.split('/');
    day = Number(dd);
    month = Number(mm);
    year = Number(yyyy);
  } else if (raw.includes('-')) {
    const [yyyy, mm, dd] = raw.split('-');
    day = Number(dd);
    month = Number(mm);
    year = Number(yyyy);
  }

  if (!year || !month || !day) return raw;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString('es-CO');
};

type RowId = string | number;
type FindingRow = FindingWithPlan;

interface FindingsTableCollapseProps {
  rows: FindingWithPlan[];
  pageSize?: number;
  onManage?: (finding: FindingWithPlan) => void;
  onAddActivity?: (findingId: RowId, activity: { description: string; dueDate: string }) => void;
  onUpdateSeg?: (payload: { findingId: RowId; activityId: RowId; segKey: string; value: string }) => void;
  onSendSeg?: (payload: { findingId: RowId; activityId: RowId; segKey: string; value: string; file?: File }) => void;
  onExpand?: (findingId: RowId) => void;
  onDeleteSeg?: (payload: { findingId: RowId; activityId: RowId; segKey: string }) => void;
  onDeleteActivity?: (payload: { findingId: RowId; activityId: RowId }) => void | Promise<void>;
}

export default function FindingsTableCollapse({
  rows = [],
  pageSize = 10,
  onManage,
  onUpdateSeg,
  onSendSeg,
  onExpand,
  onAddActivity,
  onDeleteSeg,
  onDeleteActivity,
}: FindingsTableCollapseProps) {
  const effectiveRows = rows.length ? rows : [];

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  const [expandedActivitiesId, setExpandedActivitiesId] = useState<RowId | null>(null);
  const [expandedDetailsId, setExpandedDetailsId] = useState<RowId | null>(null);

  const [detail, setDetail] = useState<{ open: boolean; title: string; content: string }>({
    open: false,
    title: '',
    content: '',
  });

  const [notManaged, setNotManaged] = useState<{ open: boolean; finding?: FindingWithPlan }>({ open: false });

  const [rejectionDetails, setRejectionDetails] = useState<{
    open: boolean;
    finding?: FindingWithPlan;
    observation?: string;
    auditorName?: string;
  }>({ open: false });

  const openDetail = (title: string, content: string) => setDetail({ open: true, title, content });
  const closeDetail = () => setDetail({ open: false, title: '', content: '' });

  const copyDetail = async () => {
    try {
      await navigator.clipboard.writeText(detail.content || '');
    } catch {
      /* noop */
    }
  };

  const handleToggleActivities = (row: FindingWithPlan) => {
    const r = row as FindingRow;
    const isManaged = Boolean(r.improvementPlan);
    if (!isManaged) {
      setNotManaged({ open: true, finding: row });
      return;
    }
    if (r.id != null) onExpand?.(r.id);
    setExpandedActivitiesId((prev) => (prev === r.id ? null : r.id ?? null));
  };

  const handleToggleDetails = (row: FindingWithPlan) => {
    const r = row as FindingRow;
    setExpandedDetailsId((prev) => (prev === r.id ? null : r.id ?? null));
  };

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return effectiveRows.slice(start, start + rowsPerPage);
  }, [effectiveRows, page, rowsPerPage]);

  const HEADER_COLS = 9;

  return (
    <Box sx={{ width: '100%', borderRadius: 3, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}
      >
        <Table size="small" sx={{ minWidth: 980 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>No. hallazgo</TableCell>
              <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tipo hallazgo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Fecha de vencimiento</TableCell>
              <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Aprobación</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Gestionar</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Ver</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Detalles</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={HEADER_COLS} align="center">
                  <Typography variant="body2" color="text.secondary">No hay hallazgos para mostrar</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row, idx) => {
                const r = row as FindingRow;
                const key = String(r.id ?? idx);
                const isActivitiesOpen = expandedActivitiesId === r.id;
                const isDetailsOpen = expandedDetailsId === r.id;
                const isManaged = Boolean(r.improvementPlan);

                return (
                  <Fragment key={key}>
                    <TableRow hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.id ?? '—'}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtDate(r.date)}</TableCell>
                      <TableCell>{r.findingType || '—'}</TableCell>
                      <TableCell><EstadoChip estado={r.status || 'Abierto'} /></TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}> {fmtDate(r.improvementPlan?.startDate)}</TableCell>

                      <TableCell>
                        <ApprovalStatusChip status={r.improvementPlan?.submissionStatus} />
                        {r.improvementPlan?.submissionStatus === 'rejected' && (
                          <Tooltip title="Ver observaciones del auditor">
                            <IconButton
                              size="small"
                              onClick={() => setRejectionDetails({
                                open: true,
                                finding: row,
                                observation: r.improvementPlan?.auditorObservation,
                                auditorName: r.improvementPlan?.auditorName,
                              })}
                              sx={{ ml: 1, color: '#C62828' }}
                            >
                              <WarningAmberRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title={isManaged ? 'Plan ya gestionado' : 'Gestionar'}>
                          <IconButton
                            size="small"
                            onClick={() => onManage?.(row)}
                            aria-label="gestionar"
                          >
                            <ManageSearchRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title={isManaged ? (isActivitiesOpen ? 'Ocultar actividades' : 'Ver actividades') : 'Primero gestiona el plan'}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleActivities(row)}
                              aria-label="ver-actividades"
                              disabled={!isManaged}
                            >
                              <KeyboardArrowRightRoundedIcon
                                sx={{ transform: isActivitiesOpen ? 'rotate(90deg)' : 'none' }}
                              />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title={isDetailsOpen ? 'Ocultar detalles' : 'Ver detalles'}>
                          <IconButton size="small" onClick={() => handleToggleDetails(row)} aria-label="ver-detalles">
                            {isDetailsOpen ? (
                              <KeyboardArrowRightRoundedIcon sx={{ transform: 'rotate(90deg)' }} />
                            ) : (
                              <InfoOutlinedIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={HEADER_COLS} sx={{ p: 0, border: 0 }}>
                        <Collapse in={isDetailsOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2, pt: 1.5, bgcolor: 'rgba(20,35,52,0.02)' }}>
                            <Typography variant="subtitle2" sx={{ color: BLUE, fontWeight: 800, mb: 1 }}>
                              Detalles del hallazgo
                            </Typography>

                            <Table size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700, width: 260 }}>Numeral/Requisito Legal</TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>Condición</TableCell>
                                  <TableCell sx={{ fontWeight: 700 }}>Descripción del Hallazgo</TableCell>
                                  <TableCell sx={{ fontWeight: 700, width: 220 }}>Reportado por</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                <TableRow>
                                  <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{r.requirementNumeral || '—'}</TableCell>

                                  <TableCell sx={{ maxWidth: 520 }}>
                                    <Tooltip title={r.condition || ''} arrow placement="top-start">
                                      <span
                                        onClick={() => openDetail('Condición', r.condition || '')}
                                        style={{
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          display: 'inline-block',
                                          maxWidth: '100%',
                                          cursor: r.condition ? 'pointer' : 'default',
                                          textDecoration: r.condition ? 'underline dotted' : 'none',
                                        }}
                                      >
                                        {r.condition || '—'}
                                      </span>
                                    </Tooltip>
                                  </TableCell>

                                  <TableCell sx={{ maxWidth: 520 }}>
                                    <Tooltip title={r.description || ''} arrow placement="top-start">
                                      <span
                                        onClick={() => openDetail('Descripción del Hallazgo', r.description || '')}
                                        style={{
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          display: 'inline-block',
                                          maxWidth: '100%',
                                          cursor: r.description ? 'pointer' : 'default',
                                          textDecoration: r.description ? 'underline dotted' : 'none',
                                        }}
                                      >
                                        {r.description || '—'}
                                      </span>
                                    </Tooltip>
                                  </TableCell>

                                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.reportedBy || '—'}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={HEADER_COLS} sx={{ p: 0, border: 0 }}>
                        <Collapse in={isActivitiesOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2 }}>
                            <ActivitiesPanel
                              finding={row}
                              onUpdateSeg={onUpdateSeg}
                              onSendSeg={onSendSeg}
                              onDeleteSeg={onDeleteSeg}
                              onDeleteActivity={onDeleteActivity}
                              onAddActivity={onAddActivity}
                              enableSend
                            />
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>

                    {(isActivitiesOpen || isDetailsOpen) && (
                      <TableRow>
                        <TableCell colSpan={HEADER_COLS} sx={{ py: 0 }}>
                          <Divider />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={effectiveRows.length}
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

      <Dialog open={detail.open} onClose={closeDetail} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{detail.title}</DialogTitle>
        <DialogContent dividers sx={{ typography: 'body2' }}>
          <Typography
            component="div"
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.6 }}
          >
            {detail.content || '—'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={copyDetail}>Copiar</Button>
          <Button onClick={closeDetail} variant="contained" sx={{ bgcolor: BLUE, '&:hover': { bgcolor: '#0e1926' } }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={notManaged.open} onClose={() => setNotManaged({ open: false })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Plan no gestionado</DialogTitle>
        <DialogContent dividers>
          <Typography>Este hallazgo aún no tiene un <strong>plan de mejoramiento</strong> gestionado.</Typography>
          <Typography sx={{ mt: 1 }}>
            Para ver y añadir actividades, primero debes completar la opción <strong>“Gestionar”</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotManaged({ open: false })} variant="contained" sx={{ bgcolor: BLUE, '&:hover': { bgcolor: '#0e1926' } }}>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={rejectionDetails.open} onClose={() => setRejectionDetails({ open: false })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberRoundedIcon sx={{ color: '#C62828' }} />
          Plan de Mejoramiento Rechazado
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              El auditor ha rechazado tu plan de mejoramiento.
            </Typography>
            <Typography variant="body2">
              Por favor revisa las observaciones a continuación y realiza los cambios necesarios.
            </Typography>
          </Alert>

          {rejectionDetails.auditorName && (
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              <strong>Auditor: {rejectionDetails.auditorName}</strong>
            </Typography>
          )}

          <Box sx={{ bgcolor: 'rgba(198,40,40,0.08)', p: 2, borderRadius: 1, border: '1px solid rgba(198,40,40,0.2)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#C62828' }}>
              Observaciones del auditor:
            </Typography>
            <Typography
              variant="body2"
              component="div"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}
            >
              {rejectionDetails.observation || 'Sin observaciones'}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>
            Acciones recomendadas:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ ml: 2 }}>
            <li>Lee cuidadosamente las observaciones del auditor</li>
            <li>Realiza los ajustes necesarios a tu análisis de causa o actividades</li>
            <li>Reenvia el plan para nueva revisión haciendo clic en "Gestionar"</li>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDetails({ open: false })}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: BLUE, '&:hover': { bgcolor: '#0e1926' } }}
            onClick={() => {
              if (rejectionDetails.finding) {
                onManage?.(rejectionDetails.finding);
              }
              setRejectionDetails({ open: false });
            }}
          >
            Ir a Gestionar
          </Button>
        </DialogActions>
      </Dialog>    </Box>
  );
}
