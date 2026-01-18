import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
} from '@mui/material';

interface FollowupComments {
  1?: string;
  2?: string;
  3?: string;
  4?: string;
}

interface ActivityObservationsDialogProps {
  open: boolean;
  comments: FollowupComments;
  onClose: () => void;
}

const BLUE = '#142334';
const GREEN = '#279B48';

export default function ActivityObservationsDialog({
  open,
  comments,
  onClose,
}: ActivityObservationsDialogProps) {
  const hasAnyComment = Object.values(comments).some((c) => c && c.trim());

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800, color: BLUE }}>Observaciones del Auditor</DialogTitle>
      <DialogContent dividers>
        {hasAnyComment ? (
          <Stack spacing={2}>
            {([1, 2, 3, 4] as const).map((i) => {
              const comment = comments[i];
              if (!comment || !comment.trim()) return null;
              return (
                <Box
                  key={i}
                  sx={{
                    p: 1.5,
                    bgcolor: 'rgba(39, 155, 72, 0.08)',
                    borderLeft: `3px solid ${GREEN}`,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ color: GREEN, fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Seguimiento {i}
                  </Typography>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{comment}</Typography>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Box sx={{ py: 1 }}>
            <Typography color="text.secondary">Sin observaciones del auditor.</Typography>
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
