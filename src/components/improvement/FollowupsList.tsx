import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Typography,
  Button,
  Tooltip,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FollowupItem from './FollowupItem';
import type { ImprovementPlanActivity, FileAttachment } from '@/types/improvement';

type Idx = 1 | 2 | 3 | 4;

const H2A: Record<Idx, keyof ImprovementPlanActivity> = {
  1: 'seguimientoI',
  2: 'seguimientoII',
  3: 'seguimientoIII',
  4: 'seguimientoIV',
} as const;

interface FollowupsListProps {
  findingId: string | number;
  activity: ImprovementPlanActivity;
  draftSeg: Record<number, string>;
  setDraftSeg: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  files: Record<number, FileAttachment | File | null>;
  setFiles: React.Dispatch<React.SetStateAction<Record<number, FileAttachment | File | null>>>;
  sentFlags: Record<number, boolean>;
  onSave: (idx: number, value: string) => void;
  onSend: (idx: number, value: string) => void;
  onDelete?: (idx: number) => void;
}

const BLUE = '#142334';
const GREEN = '#279B48';

type ActivityCloseHints = ImprovementPlanActivity & Partial<{
  closed: boolean;
  status: string;
  closedAt: string | Date | null;
}>;

const guessMimeFromName = (name = ''): string => {
  const n = name.toLowerCase();
  if (n.endsWith('.pdf')) return 'application/pdf';
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
  if (n.endsWith('.webp')) return 'image/webp';
  if (n.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
};

export default function FollowupsList({
  activity,
  draftSeg,
  setDraftSeg,
  files,
  setFiles,
  sentFlags,
  onSave,
  onSend,
  onDelete,
}: FollowupsListProps) {
  const a = activity as ActivityCloseHints;
  const isClosed = a.closed === true || a.status === 'Cerrada' || Boolean(a.closedAt);

  const [infoOpen, setInfoOpen] = useState(false);
  const showClosedInfo = () => setInfoOpen(true);

  const hasContent = (i: Idx): boolean => {
    const base = (activity[H2A[i]] as unknown as string) ?? '';
    const local = draftSeg?.[i] ?? base;
    return ((local as string)?.length ?? 0) > 0 || !!files?.[i];
  };

  const computeLastVisible = (): Idx =>
    (([1, 2, 3, 4] as Idx[]).reduce((acc, i) => (hasContent(i) ? i : acc), 1) as Idx) || 1;

  const [visibleCount, setVisibleCount] = useState<Idx>(() => computeLastVisible());

  const handleAdd = () => {
    if (isClosed) {
      showClosedInfo();
      return;
    }
    setVisibleCount((v) => (v < 4 ? ((v + 1) as Idx) : v));
  };

   const deleteSeguimientoLocal = (i: Idx) => {
    setDraftSeg((s) => ({ ...s, [i]: '' }));
    setFiles((s) => ({ ...s, [i]: null }));
    setVisibleCount(() => computeLastVisible());
  };

  const openPreviewSmart = async (fileObj: FileAttachment | File | null) => {
    if (!fileObj) return;

    if (fileObj instanceof File) {
      const url = URL.createObjectURL(fileObj);
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (win) win.opener = null;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return;
    }

    const directUrl = (fileObj as FileAttachment).url || '';
    if (!directUrl) return;

    try {
      const res = await fetch(directUrl, { method: 'GET' });
      if (!res.ok) throw new Error('No se pudo obtener el archivo');

      const serverType = res.headers.get('Content-Type') || '';
      const mime =
        serverType ||
        guessMimeFromName(
          (fileObj as FileAttachment).name ||
          (fileObj as FileAttachment).filename ||
          directUrl
        );
      const blob = await res.blob();

      const objectUrl = URL.createObjectURL(new Blob([blob], { type: mime }));
      const win = window.open(objectUrl, '_blank', 'noopener,noreferrer');
      if (win) win.opener = null;

      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch {
      window.open(directUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Seguimientos
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip size="small" label={`${visibleCount}/4 seguimientos`} />
          <Tooltip
            title={
              isClosed
                ? 'Actividad cerrada por el auditor'
                : visibleCount >= 4
                  ? 'Límite alcanzado'
                  : 'Agregar seguimiento'
            }
          >
            <span>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddRoundedIcon />}
                disabled={isClosed || visibleCount >= 4}
                onClick={handleAdd}
                sx={{ bgcolor: BLUE, '&:hover': { bgcolor: '#0e1926' } }}
              >
                Agregar seguimiento
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Box>
      {isClosed && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Alert
            severity="info"
            sx={{
              borderLeft: `6px solid ${GREEN}`,
              '& .MuiAlert-message': { fontSize: 14 },
            }}
          >
            El auditor ha considerado que esta actividad está cerrada; no puede añadir más
            seguimientos.
          </Alert>
        </Box>
      )}

      <Table size="small" sx={{ opacity: isClosed ? 0.8 : 1 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
            <TableCell sx={{ fontWeight: 700, width: 200 }}>Archivo</TableCell>
            <TableCell sx={{ fontWeight: 700, width: 120 }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 700, width: 180 }} align="right">
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {([1, 2, 3, 4] as Idx[]).map((i) => {
            const baseValue = (activity[H2A[i]] as unknown as string) ?? '';
            const value = draftSeg?.[i] ?? baseValue;
            const sent = !!sentFlags?.[i];
            const fileObj = files?.[i] || null;
            const show = ((value?.length ?? 0) > 0 || !!fileObj) || i <= visibleCount;
            if (!show) return null;
            const onChangeSafe = (v: string) => {
              if (isClosed) return showClosedInfo();
              return setDraftSeg((s) => ({ ...s, [i]: v }));
            };
            const onPickFileSafe = (f: File) => {
              if (isClosed) return showClosedInfo();
              return setFiles((s) => ({ ...s, [i]: f }));
            };
            const onClearFileSafe = () => {
              if (isClosed) return showClosedInfo();
              return setFiles((s) => ({ ...s, [i]: null }));
            };
            const onSaveSafe = () => {
              if (isClosed) return showClosedInfo();
              return onSave(i, value);
            };
            const onSendSafe = () => {
              if (isClosed) return showClosedInfo();
              return onSend(i, value);
            };
            const onDeleteSafe = () => {
              if (isClosed) return showClosedInfo();
              if (sent) return;
              deleteSeguimientoLocal(i);
              onDelete?.(i);
            };

            return (
              <FollowupItem
                key={i}
                activityId={activity.id}
                label={`Seguimiento ${i}`}
                value={value}
                baseValue={baseValue}
                sent={sent}
                fileObj={fileObj}
                onChange={onChangeSafe}
                onPickFile={onPickFileSafe}
                onClearFile={onClearFileSafe}
                onPreviewFile={() => openPreviewSmart(fileObj)}
                onSave={onSaveSafe}
                onSend={onSendSafe}
                onDelete={onDeleteSafe}
              />
            );
          })}
        </TableBody>
      </Table>
      <Snackbar
        open={infoOpen}
        autoHideDuration={3000}
        onClose={() => setInfoOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setInfoOpen(false)} severity="info" sx={{ width: '100%' }}>
          El auditor ha considerado que esta actividad está cerrada; no puede añadir más seguimientos.
        </Alert>
      </Snackbar>
    </Paper>
  );
}
