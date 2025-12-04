import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';

interface ActivityObservationsDialogProps {
  open: boolean;
  observations?: string;
  onClose: () => void;
}

const BLUE = '#142334';

export default function ActivityObservationsDialog({
  open,
  observations,
  onClose,
}: ActivityObservationsDialogProps) {
  const text = (observations || '').trim();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800, color: BLUE }}>Observaciones</DialogTitle>
      <DialogContent dividers>
        {text ? (
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{text}</Typography>
        ) : (
          <Box sx={{ py: 1 }}>
            <Typography color="text.secondary">Sin observaciones.</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: BLUE, '&:hover': { bgcolor: '#0e1926' } }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
