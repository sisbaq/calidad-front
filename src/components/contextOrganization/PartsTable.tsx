import {
  Paper, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

type Colors = {
  blue: string;
  green: string;
  subtle: string;
  border: string;
};

type MatrizParte = {
  id: string;
  fecha: string;
  descripcion: string;
  archivoNombre: string;
};

type Props = {
  matrices: MatrizParte[];
  onDownload: (id: string) => void;
  colors: Colors;
};

export default function PartesTable({ matrices, onDownload, colors }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: colors.border,
        boxShadow: "none",
        bgcolor: "#FFFFFF",
        borderRadius: 3,
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow
            sx={{
              "& th": {
                fontSize: 13.5,
                fontWeight: 600,
                letterSpacing: 0.2,
                color: colors.blue,
                borderBottomColor: colors.border,
                whiteSpace: "nowrap",
                bgcolor: "#FAFBFC",
              },
            }}
          >
            <TableCell>Fecha</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Archivo</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {(!matrices || matrices.length === 0) ? (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 5, borderBottomColor: colors.border }}>
                <Typography sx={{ fontSize: 13.5, color: colors.subtle }}>
                  Aún no se han cargado matrices.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            matrices.map((m) => (
              <TableRow
                key={m.id}
                hover
                sx={{
                  "& td": { borderBottomColor: colors.border, fontSize: 13.5 },
                }}
              >
                <TableCell>{m.fecha}</TableCell>
                <TableCell sx={{ maxWidth: 560, pr: 2 }}>
                  <Typography sx={{ fontSize: 13.5 }}>{m.descripcion}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 13.5, color: colors.blue }}>
                    {m.archivoNombre}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ width: 120 }}>
                  <IconButton
                    aria-label="Descargar"
                    onClick={() => onDownload(m.id)}
                    sx={{
                      color: colors.green,
                      border: `1px solid ${colors.green}66`,
                      borderRadius: 2,
                      width: 34,
                      height: 34,
                      "&:hover": { bgcolor: `${colors.green}10` },
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
