import { useState } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Collapse,
  Box,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import FollowupsList from './FollowupsList';
import type { ImprovementPlanActivity, FileAttachment } from '@/types/improvement';

interface ActivityRowProps {
  findingId: string | number;
  activity: ImprovementPlanActivity;
  initialDraftSeg: Record<number, string>;
  initialFiles: Record<number, FileAttachment | File | null>;
  sentFlags: Record<number, boolean>;
  onSaveSeg: (payload: {
    findingId: string | number;
    activityId: string | number;
    segKey: string;
    value: string;
  }) => void;
  onSendSeg: (payload: {
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

  onOpenObservations?: (text?: string) => void;
}


type ActivityWithObs = ImprovementPlanActivity & Partial<{
  observations: string;
  observacion: string;
  observaciones: string;
  notes: string;
}>;

export default function ActivityRow({
  findingId,
  activity,
  initialDraftSeg,
  initialFiles,
  sentFlags,
  onSaveSeg,
  onSendSeg,
  onDeleteSeg,
  onOpenObservations = () => { },
}: ActivityRowProps) {
  const toNum = (obj: Record<number, unknown> = {}): Record<number, string> => ({
    1: (obj[1] ?? '') as string,
    2: (obj[2] ?? '') as string,
    3: (obj[3] ?? '') as string,
    4: (obj[4] ?? '') as string,
  });

  const toNumFiles = (
    obj: Record<number, unknown> = {}
  ): Record<number, FileAttachment | File | null> => ({
    1: (obj[1] ?? null) as FileAttachment | File | null,
    2: (obj[2] ?? null) as FileAttachment | File | null,
    3: (obj[3] ?? null) as FileAttachment | File | null,
    4: (obj[4] ?? null) as FileAttachment | File | null,
  });

  const toBools = (obj: Record<number, unknown> = {}): Record<number, boolean> => ({
    1: Boolean(obj[1]),
    2: Boolean(obj[2]),
    3: Boolean(obj[3]),
    4: Boolean(obj[4]),
  });

  const [expanded, setExpanded] = useState(false);
  const [draftSeg, setDraftSeg] = useState<Record<number, string>>(toNum(initialDraftSeg));
  const [files, setFiles] = useState<Record<number, FileAttachment | File | null>>(
    toNumFiles(initialFiles)
  );
  const sentNum = toBools(sentFlags);

  const idxToSegKey = (idx: 1 | 2 | 3 | 4) =>
    ({
      1: 'seguimientoI',
      2: 'seguimientoII',
      3: 'seguimientoIII',
      4: 'seguimientoIV',
    } as const)[idx];

  const obsText =
    (activity as ActivityWithObs).observations ??
    (activity as ActivityWithObs).observacion ??
    (activity as ActivityWithObs).observaciones ??
    (activity as ActivityWithObs).notes ??
    undefined;

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ width: 48, py: 0 }}>
          <Tooltip title={expanded ? 'Ocultar seguimientos' : 'Ver seguimientos'}>
            <IconButton size="small" onClick={() => setExpanded((v) => !v)}>
              <KeyboardArrowRightRoundedIcon
                fontSize="small"
                sx={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
              />
            </IconButton>
          </Tooltip>
        </TableCell>

        <TableCell>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
            }}
          >
            {activity.description}
          </Typography>
        </TableCell>

        <TableCell align="right" sx={{ width: 160 }}>
          <Tooltip title="Ver observaciones">
            <IconButton size="small" onClick={() => onOpenObservations(obsText)}>
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={3} sx={{ p: 0, border: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, bgcolor: 'rgba(20,35,52,0.03)' }}>
              <FollowupsList
                findingId={findingId}
                activity={activity}
                draftSeg={draftSeg}
                setDraftSeg={setDraftSeg}
                files={files}
                setFiles={setFiles}
                sentFlags={sentNum}
                onSave={(idx, value) => {
                  const segKey = idxToSegKey(idx as 1 | 2 | 3 | 4);
                  onSaveSeg({ findingId, activityId: activity.id, segKey, value });
                }}
                onSend={(idx, value) => {
                  const segKey = idxToSegKey(idx as 1 | 2 | 3 | 4);
                  onSendSeg({
                    findingId,
                    activityId: activity.id,
                    segKey,
                    value,
                    file: (files[idx] instanceof File ? (files[idx] as File) : undefined),
                  });
                }}
                onDelete={(idx) => {
                  const sent = !!sentNum[idx];
                  if (sent) return;
                  const segKey = idxToSegKey(idx as 1 | 2 | 3 | 4);
                  onDeleteSeg?.({ findingId, activityId: activity.id, segKey });
                }}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
