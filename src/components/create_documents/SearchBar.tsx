import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { appColors } from "../../theme/colors";

type Props = {
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
  // estilos adicionales opcionales
  sx?: Record<string, unknown>;
};

function SearchBarBase(props: Props): React.ReactElement {
  const { value, onChange, sx = {}, fullWidth = true } = props;

  const handle = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return React.createElement(TextField, {
    fullWidth,
    value,
    onChange: handle,
    placeholder: "Buscar documentos…",
    size: "medium",
    inputProps: { "aria-label": "Buscar documentos" },
    InputProps: {
      startAdornment: React.createElement(
        InputAdornment,
        { position: "start" },
        React.createElement(SearchIcon, { sx: { color: appColors.subtle } })
      ),
    },
    sx: {
      "& .MuiOutlinedInput-root": {
        bgcolor: "#FFF",
        borderRadius: 2,
      },
      ...sx,
    },
  });
}

export default React.memo(SearchBarBase);
