import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Link,
} from '@mui/material';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import type { FileAttachment as FileAttachmentType } from '@/types/improvement';

interface FileAttachmentProps {
  fileObj: FileAttachmentType | File | null;
  disabled?: boolean;
  onPick: (file: File) => void;
  onPreview: () => void;
  onDelete: () => void;
}

const truncateMiddle = (name = '', max = 26): string => {
  if (name.length <= max) return name;
  const keep = Math.floor((max - 3) / 2);
  return name.slice(0, keep) + '...' + name.slice(-keep);
};

const kb = (bytes = 0): string => `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default function FileAttachment({
  fileObj,
  disabled = false,
  onPick,
  onPreview,
  onDelete,
}: FileAttachmentProps) {
  const [dragOver, setDragOver] = useState(false);

  const pick = () => {
    if (disabled) return;
    const el = document.createElement('input');
    el.type = 'file';
    el.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const f = target.files?.[0];
      if (f) onPick(f);
    };
    el.click();
  };

  if (!fileObj) {
    return (
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled) return;
          const f = e.dataTransfer.files?.[0];
          if (f) onPick(f);
        }}
        sx={{
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          color: 'text.secondary',
          cursor: disabled ? 'not-allowed' : 'pointer',
          bgcolor: dragOver ? 'action.hover' : 'transparent',
        }}
        onClick={pick}
      >
        <UploadFileRoundedIcon />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Seleccionar archivo
        </Typography>
      </Box>
    );
  }

  const name =
    fileObj instanceof File
      ? fileObj.name
      : (fileObj as FileAttachmentType).name ||
        (fileObj as FileAttachmentType).filename ||
        '';
  const size =
    fileObj instanceof File
      ? kb(fileObj.size)
      : (fileObj as FileAttachmentType).size
      ? kb((fileObj as FileAttachmentType).size!)
      : (fileObj as FileAttachmentType).bytes
      ? kb((fileObj as FileAttachmentType).bytes!)
      : '';
  const hasUrl = fileObj instanceof File || Boolean((fileObj as FileAttachmentType)?.url);

  return (
    <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {truncateMiddle(name)}
          </Typography>
          {size && (
            <Typography variant="caption" color="text.secondary">
              {size}
            </Typography>
          )}
        </Box>

        <Tooltip title="Ver en nueva pestaña">
          <span>
            <IconButton size="small" onClick={onPreview} disabled={!hasUrl}>
              <VisibilityRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Eliminar">
          <span>
            <IconButton size="small" onClick={onDelete} disabled={disabled}>
              <DeleteRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {!disabled && (
        <Box sx={{ mt: 0.5 }}>
          <Link component="button" underline="hover" onClick={pick} sx={{ fontSize: 12 }}>
            Cambiar archivo
          </Link>
        </Box>
      )}
    </Paper>
  );
}
