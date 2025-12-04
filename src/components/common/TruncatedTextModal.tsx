import { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Tooltip,
} from '@mui/material';

interface TruncatedTextModalProps {
  /** The full text content to display */
  content: string;
  /** Title for the modal dialog */
  title: string;
  /** Maximum width for the truncated text container (default: 320px) */
  maxWidth?: string;
  /** Custom tooltip text (default: "Click para ver completo") */
  tooltipText?: string;
  /** Primary button color (default: "#142334") */
  primaryColor?: string;
  /** Whether the text should be clickable (default: true) */
  clickable?: boolean;
}

/**
 * A reusable component that displays truncated text with ellipsis.
 * When clicked, opens a modal dialog showing the full text content.
 * Includes a copy-to-clipboard button in the dialog.
 *
 * @example
 * ```tsx
 * <TruncatedTextModal
 *   content={row.descripcion}
 *   title="Descripción Completa"
 *   maxWidth="400px"
 * />
 * ```
 */
export default function TruncatedTextModal({
  content,
  title,
  maxWidth = '320px',
  tooltipText = 'Click para ver completo',
  primaryColor = '#142334',
  clickable = true,
}: TruncatedTextModalProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    if (clickable) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content || '');
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <>
      <Tooltip title={clickable ? tooltipText : ''} disableInteractive>
        <Box
          onClick={handleOpen}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth,
            cursor: clickable ? 'pointer' : 'default',
            '&:hover': clickable
              ? { textDecoration: 'underline' }
              : undefined,
          }}
        >
          {content || '—'}
        </Box>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
        <DialogContent dividers sx={{ typography: 'body2' }}>
          <Typography
            component="div"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              lineHeight: 1.6,
            }}
          >
            {content || '—'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopy}>Copiar</Button>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              bgcolor: primaryColor,
              '&:hover': { bgcolor: primaryColor, opacity: 0.9 },
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
