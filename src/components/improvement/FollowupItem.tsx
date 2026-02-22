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
  showStatus?: boolean;
  fileObj: FileAttachmentType | File | null;
  isClosed?: boolean;
  onChange: (value: string) => void;
  onPickFile: (file: File) => void;
  onClearFile: () => void;
  onPreviewFile: () => void;
  onSave: () => void;
  onSend: () => void;
  onDelete: () => void;
  enableSend?: boolean;
}

const BLUE = '#142334';

export default function FollowupItem({
  activityId,
  label,
  value,
  baseValue,
  sent,
  showStatus = true,
  fileObj,
  isClosed = false,
  onChange,
  onPickFile,
  onClearFile,
  onPreviewFile,
  onSave,
  onSend,
  onDelete,
  enableSend = false,
}: FollowupItemProps) {
  const hasBase = (baseValue ?? '').trim().length > 0;
  const effectiveSent = sent || (enableSend && hasBase);
  // Si está enviado o la actividad está cerrada, se bloquea edición.
  const disabled = effectiveSent || isClosed;

  // Detecta si hay cambios locales vs. base almacenada (para habilitar Guardar)
  const hasChanges = (value ?? '') !== (baseValue ?? '');
  const canSend = !disabled && !hasBase && (value ?? '').trim().length > 0;

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
            placeholder="Escribe el seguimiento..."
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
        {showStatus && (
          <TableCell sx={{ width: 120, verticalAlign: 'top', pt: 3 }}>
            <Chip
              size="small"
              color={effectiveSent ? 'success' : hasChanges ? 'warning' : 'default'}
              label={effectiveSent ? 'enviado' : hasChanges ? 'borrador' : 'guardado'}
              variant={effectiveSent ? 'filled' : 'outlined'}
            />
          </TableCell>
        )}

        {/* Acciones (sin botón Editar) */}
        <TableCell align="right" sx={{ width: 180, verticalAlign: 'top', pt: 3 }}>
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            {!enableSend && (
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
            )}

            {enableSend && (
              <Tooltip title="Enviar seguimiento (bloquea edición)">
                <span>
                  <IconButton
                    size="small"
                    onClick={onSend}
                    disabled={!canSend}
                    sx={{
                      bgcolor: '#0f6b3b',
                      color: '#fff',
                      '&:hover': { bgcolor: '#0a522d' },
                      px: 1.25,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      Enviar
                    </Typography>
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {/* Eliminar (solo si no está enviado y actividad no cerrada) */}
            <Tooltip title={isClosed ? 'No se puede eliminar: actividad cerrada' : sent ? 'No se puede eliminar: ya fue enviado' : 'Eliminar seguimiento'}>
              <span>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setConfirmDelSeg(true)}
                  disabled={disabled}
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
