
import { TextField, InputAdornment } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

export interface SearchInputProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar",
}: SearchInputProps) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      size="small"
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon color="primary" />
          </InputAdornment>
        ),
      }}
      sx={{
        maxWidth: 420,
        "& .MuiOutlinedInput-root": { borderRadius: 2 },
      }}
    />
  );
}
