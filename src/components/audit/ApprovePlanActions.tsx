import * as React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';

interface ApprovePlanActionsProps {
  planId: string | number;
  planStatus: number;
  onApprove?: (planId: string | number) => Promise<void>;
  onReject?: (planId: string | number, observation: string) => Promise<void>;
  onSuccess?: () => void;
  colorPrimary?: string;
  colorSuccess?: string;
  colorError?: string;
  disabled?: boolean;
}

export default function ApprovePlanActions({
  planId,
  planStatus,
  onApprove,
  onReject,
  onSuccess,
  colorPrimary = '#142334',
  colorSuccess = '#279B48',
  colorError = '#d32f2f',
  disabled = false,
}: ApprovePlanActionsProps) {
  const [approveDialogOpen, setApproveDialogOpen] = React.useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [rejectionObservation, setRejectionObservation] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Don't show buttons if plan is already closed (status 2)
  if (planStatus === 2) {
    return null;
  }

  const handleApproveClick = () => {
    setApproveDialogOpen(true);
    setError(null);
  };

  const handleRejectClick = () => {
    setRejectDialogOpen(true);
    setRejectionObservation('');
    setError(null);
  };

  const confirmApprove = async () => {
    if (!onApprove) return;

    try {
      setApproveDialogOpen(false);
      setLoading(true);
      setError(null);
      await onApprove(planId);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error approving plan:', err);
      const message = err instanceof Error ? err.message : 'No se pudo aprobar el plan.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!onReject || !rejectionObservation.trim()) {
      setError('Debe ingresar una observación para rechazar el plan.');
      return;
    }

    try {
      setRejectDialogOpen(false);
      setLoading(true);
      setError(null);
      await onReject(planId, rejectionObservation.trim());
      setRejectionObservation('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error rejecting plan:', err);
      const message = err instanceof Error ? err.message : 'No se pudo rechazar el plan.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1.5}>
        <Button
          variant="contained"
          size="small"
          startIcon={<ThumbUpOutlinedIcon />}
          onClick={handleApproveClick}
          disabled={disabled || loading}
          sx={{
            backgroundColor: colorSuccess,
            color: '#fff',
            fontWeight: 700,
            '&:hover': {
              backgroundColor: colorSuccess,
              opacity: 0.9,
            },
          }}
        >
          APROBAR
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<ThumbDownOutlinedIcon />}
          onClick={handleRejectClick}
          disabled={disabled || loading}
          sx={{
            backgroundColor: colorError,
            color: '#fff',
            fontWeight: 700,
            '&:hover': {
              backgroundColor: colorError,
              opacity: 0.9,
            },
          }}
        >
          RECHAZAR
        </Button>
      </Stack>

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => !loading && setApproveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: colorPrimary }}>
          Aprobar plan de mejoramiento
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ py: 1 }}>
            ¿Está seguro que desea aprobar este plan de mejoramiento?
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setApproveDialogOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={confirmApprove}
            disabled={loading}
            sx={{
              backgroundColor: colorSuccess,
              '&:hover': {
                backgroundColor: colorSuccess,
                opacity: 0.9,
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />
                Aprobando...
              </>
            ) : (
              'Confirmar'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog with Observation Field */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => !loading && setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: colorPrimary }}>
          Rechazar plan de mejoramiento
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            label="Observación del rechazo"
            placeholder="Ingrese el motivo del rechazo del plan..."
            value={rejectionObservation}
            onChange={(e) => setRejectionObservation(e.target.value)}
            disabled={loading}
            required
            sx={{
              mt: 1,
              '& label.Mui-focused': { color: colorPrimary },
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                borderColor: colorPrimary,
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRejectDialogOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={confirmReject}
            disabled={loading || !rejectionObservation.trim()}
            sx={{
              backgroundColor: colorError,
              '&:hover': {
                backgroundColor: colorError,
                opacity: 0.9,
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />
                Rechazando...
              </>
            ) : (
              'Rechazar'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
