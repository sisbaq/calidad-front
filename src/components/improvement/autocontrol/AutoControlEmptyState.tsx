import { Paper, Stack, Typography } from '@mui/material';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { appColors } from '@/theme/colors';

export default function AutoControlEmptyState() {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        minHeight: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Stack alignItems="center" spacing={1}>
        <FolderOpenOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
        <Typography variant="h6" sx={{ color: appColors.blue, fontWeight: 700 }}>
          Seleccione un tipo de autocontrol
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Elija entre Indicadores, Riesgos u Otros para ver los hallazgos asociados.
        </Typography>
      </Stack>
    </Paper>
  );
}
