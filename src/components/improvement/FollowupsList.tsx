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
import type { ImprovementPlanActivity, FileAttachment, FollowupIndex } from '@/types/improvement';
import { viewPlanActividadMejoramientoFile } from '@/services/file.service';

const H2A: Record<FollowupIndex, keyof ImprovementPlanActivity> = {
  1: 'followup1',
  2: 'followup2',
  3: 'followup3',
  4: 'followup4',
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
  const isClosed = activity.closed === true;

  const [infoOpen, setInfoOpen] = useState(false);
  const showClosedInfo = () => setInfoOpen(true);

  const hasContent = (i: FollowupIndex): boolean => {
    const base = (activity[H2A[i]] as unknown as string) ?? '';
    const local = draftSeg?.[i] ?? base;
    return ((local as string)?.length ?? 0) > 0 || !!files?.[i];
  };

  const computeLastVisible = (): FollowupIndex =>
    (([1, 2, 3, 4] as FollowupIndex[]).reduce((acc, i) => (hasContent(i) ? i : acc), 1) as FollowupIndex) || 1;

  const [visibleCount, setVisibleCount] = useState<FollowupIndex>(() => computeLastVisible());

  const handleAdd = () => {
    if (isClosed) {
      showClosedInfo();
      return;
    }
    setVisibleCount((v) => (v < 4 ? ((v + 1) as FollowupIndex) : v));
  };

  const deleteFollowupLocal = (i: FollowupIndex) => {
    setDraftSeg((s) => ({ ...s, [i]: '' }));
    setFiles((s) => ({ ...s, [i]: null }));
    setVisibleCount(() => computeLastVisible());
  };

  const openPreviewSmart = async (fileObj: FileAttachment | File | null, followupIdx: FollowupIndex) => {
    if (!fileObj) return;

    if (fileObj instanceof File) {
      const url = URL.createObjectURL(fileObj);
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (win) win.opener = null;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return;
    }

    // For FileAttachment objects (files already on server), use the new service
    try {
      await viewPlanActividadMejoramientoFile(activity.id, followupIdx);
    } catch (error) {
      console.error('Failed to view file:', error);
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
          {([1, 2, 3, 4] as FollowupIndex[]).map((i) => {
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
              deleteFollowupLocal(i);
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
                isClosed={isClosed}
                onChange={onChangeSafe}
                onPickFile={onPickFileSafe}
                onClearFile={onClearFileSafe}
                onPreviewFile={() => openPreviewSmart(fileObj, i)}
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
