import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import type { AutoControlOption } from '@/types/autocontrol';
import { appColors } from '@/theme/colors';

interface AutoControlTypeSelectorProps {
  value: number | '';
  options: AutoControlOption[];
  onChange: (value: number | '') => void;
}

export default function AutoControlTypeSelector({
  value,
  options,
  onChange,
}: AutoControlTypeSelectorProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: appColors.blue,
          letterSpacing: 1,
          mb: 1,
        }}
      >
        Seleccione el tipo de autocontrol
      </Typography>

      <FormControl sx={{ minWidth: 320, maxWidth: 420, width: '100%' }}>
        <InputLabel id="tipo-autocontrol-filter-label">Tipo</InputLabel>
        <Select
          labelId="tipo-autocontrol-filter-label"
          label="Tipo"
          value={value === '' ? '' : String(value)}
          onChange={(e) => {
            const nextValue = e.target.value;
            onChange(nextValue === '' ? '' : Number(nextValue));
          }}
        >
          <MenuItem value="">
            <em>-- Seleccione un tipo --</em>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.id} value={String(option.id)}>
              {option.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
}
