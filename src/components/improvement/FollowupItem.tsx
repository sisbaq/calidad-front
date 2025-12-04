import { useState } from 'react';
import {
  TableRow,
  TableCell,
  Stack,
  TextField,
  Tooltip,
  IconButton,
  Chip,
  Typography,
} from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import FileAttachment from '@components/common/FileAttachment';
import ConfirmDialog from '@components/common/ConfirmDialog';
import type { FileAttachment as FileAttachmentType } from '@/types/improvement';

interface FollowupItemProps {
  activityId: string | number;
  label: string;
  value: string;
  baseValue: string;
  sent: boolean;
  fileObj: FileAttachmentType | File | null;
  onChange: (value: string) => void;
  onPickFile: (file: File) => void;
  onClearFile: () => void;
  onPreviewFile: () => void;
  onSave: () => void;
  onSend: () => void;
  onDelete: () => void;
}

const BLUE = '#142334';

export default function FollowupItem({
  activityId,
  label,
  value,
  baseValue,
  sent,
  fileObj,
  onChange,
  onPickFile,
  onClearFile,
  onPreviewFile,
  onSave,
  onSend,
  onDelete,
}: FollowupItemProps) {
  // Si está enviado, se bloquea edición.
  const disabled = sent;

  // Detecta si hay cambios locales vs. base almacenada (para habilitar Guardar)
  const hasChanges = (value ?? '') !== (baseValue ?? '');

  const [confirmDelFile, setConfirmDelFile] = useState(false);
  const [confirmDelSeg, setConfirmDelSeg] = useState(false);

  return (
    <>
      <TableRow hover>
        {/* Descripción */}
        <TableCell sx={{ minWidth: 360 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
            {label}
          </Typography>
          <TextField
            inputProps={{ 'data-act': `${activityId}-${label}` }}
            fullWidth
            multiline
            minRows={3}
            size="small"
            placeholder={label}
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </TableCell>

        {/* Archivo */}
        <TableCell sx={{ width: 200, verticalAlign: 'top', pt: 3 }}>
          <FileAttachment
            fileObj={fileObj}
            disabled={disabled}
            onPick={onPickFile}
            onPreview={onPreviewFile}
            onDelete={() => setConfirmDelFile(true)}
          />
        </TableCell>

        {/* Estado */}
        <TableCell sx={{ width: 120, verticalAlign: 'top', pt: 3 }}>
          <Chip
            size="small"
            color={sent ? 'success' : hasChanges ? 'warning' : 'default'}
            label={sent ? 'enviado' : hasChanges ? 'borrador' : 'guardado'}
            variant={sent ? 'filled' : 'outlined'}
          />
        </TableCell>

        {/* Acciones (sin botón Editar) */}
        <TableCell align="right" sx={{ width: 180, verticalAlign: 'top', pt: 3 }}>
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            {/* Guardar como borrador (no bloquea) */}
            <Tooltip title="Guardar (no bloquea)">
              <span>
                <IconButton
                  size="small"
                  onClick={onSave}
                  disabled={disabled || !hasChanges}
                  sx={{
                    bgcolor: BLUE,
                    color: '#fff',
                    '&:hover': { bgcolor: '#0e1926' },
                    px: 1.25,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Guardar
                  </Typography>
                </IconButton>
              </span>
            </Tooltip>

            {/* Enviar (bloquea edición) */}
            <Tooltip title="Enviar (bloquea edición)">
              <span>
                <IconButton size="small" onClick={onSend} disabled={disabled}>
                  <SendRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            {/* Eliminar (solo si no está enviado) */}
            <Tooltip title={sent ? 'No se puede eliminar: ya fue enviado' : 'Eliminar seguimiento'}>
              <span>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setConfirmDelSeg(true)}
                  disabled={sent}
                >
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Confirmaciones */}
      <ConfirmDialog
        open={confirmDelFile}
        title="Eliminar archivo"
        message="¿Está seguro de eliminar este archivo de soporte? Esta acción no se puede deshacer."
        onCancel={() => setConfirmDelFile(false)}
        onConfirm={() => {
          onClearFile();
          setConfirmDelFile(false);
        }}
      />
      <ConfirmDialog
        open={confirmDelSeg}
        title="Eliminar seguimiento"
        message="¿Deseas eliminar este seguimiento? No podrás recuperarlo. (Si ya está enviado, no se elimina)."
        onCancel={() => setConfirmDelSeg(false)}
        onConfirm={() => {
          onDelete();
          setConfirmDelSeg(false);
        }}
        confirmText="Eliminar"
      />
    </>
  );
}
