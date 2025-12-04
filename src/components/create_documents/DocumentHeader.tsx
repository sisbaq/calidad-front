import React from "react";
import { Box, Typography } from "@mui/material";
import { appColors } from "../../theme/colors";

function DocumentHeaderBase(): React.ReactElement {
  return React.createElement(
    Box,
    { sx: { mb: 2 } },
    React.createElement(
      Typography,
      { variant: "h4", sx: { fontWeight: 800, color: appColors.text, mb: 0.5 } },
      "Consultar documentos"
    ),
    React.createElement(
      Typography,
      { variant: "body1", sx: { color: appColors.subtle } },
      "Accede a los documentos transversales de la entidad."
    )
  );
}

export default React.memo(DocumentHeaderBase);
