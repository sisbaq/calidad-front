import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TablePagination,
} from "@mui/material";
import type { LabelDisplayedRowsArgs } from "@mui/material/TablePagination";
import SearchIcon from "@mui/icons-material/Search";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

const BLUE = "#142334";
const h = React.createElement;

type Row = {
  id: number;
  name: string;
  url: string;
};

const rows: ReadonlyArray<Row> = [
  {
    id: 1,
    name: "Matriz de Partes Interesadas – 2025",
    url: "/files/matriz-partes-interesadas.xlsx",
  },
];

export default function MatrizPartesAgente(): React.ReactElement {
  const [query, setQuery] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);

  const filtered = React.useMemo(
    () => rows.filter((r) => r.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const paginated = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleChangePage = React.useCallback(
    (_e: unknown, newPage: number) => setPage(newPage),
    []
  );

  const handleChangeRowsPerPage = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = parseInt(e.target.value, 10);
      setRowsPerPage(Number.isNaN(value) ? 10 : value);
      setPage(0);
    },
    []
  );

  const handleDownload = React.useCallback((row: Row) => {
    const link = document.createElement("a");
    link.href = row.url;
    link.download = "Matriz_Partes_interesadas.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  return h(
    Box,
    { sx: { width: "100%", p: { xs: 2, md: 3 }, backgroundColor: "#fff" } },
    h(
      Typography,
      { variant: "h5", sx: { fontWeight: 800, color: BLUE, mb: 0.5 } },
      "Consulta y descarga la matriz de partes interesadas"
    ),
    h(
      Typography,
      { variant: "body2", sx: { color: "#64748b", mb: 2 } },
      "Visualiza y descarga los archivos disponibles"
    ),
    h(TextField, {
      placeholder: "Buscar",
      value: query,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
      size: "medium",
      sx: { mb: 2, maxWidth: 420 },
      InputProps: {
        startAdornment: h(InputAdornment, { position: "start" }, h(SearchIcon, { sx: { color: "#90a4ae" } })),
      },
    }),
    h(
      Card,
      { sx: { width: "100%", borderRadius: 3, boxShadow: 3 } },
      h(
        CardContent,
        { sx: { p: { xs: 2, md: 3 } } },
        h(
          TableContainer,
          {
            sx: {
              border: "1px solid",
              borderColor: "#e5e7eb",
              borderRadius: 2,
              overflow: "hidden",
            },
          },
          h(
            Table,
            null,
            h(
              TableHead,
              null,
              h(
                TableRow,
                null,
                h(
                  TableCell,
                  {
                    sx: {
                      fontWeight: 700,
                      backgroundColor: "#f8fafc",
                      color: BLUE,
                    },
                  },
                  "Nombre"
                ),
                h(
                  TableCell,
                  {
                    align: "right",
                    sx: {
                      fontWeight: 700,
                      backgroundColor: "#f8fafc",
                      color: BLUE,
                      width: 240,
                    },
                  },
                  "Descargar matriz"
                )
              )
            ),
            h(
              TableBody,
              null,
              ...(
                paginated.length > 0
                  ? paginated.map((row) =>
                      h(
                        TableRow,
                        { key: row.id, hover: true },
                        h(TableCell, { sx: { color: BLUE } }, row.name),
                        h(
                          TableCell,
                          { align: "right" },
                          h(Button, {
                            variant: "contained",
                            onClick: () => handleDownload(row),
                            startIcon: h(CloudDownloadIcon, {}),
                            sx: {
                              textTransform: "none",
                              fontWeight: 700,
                              px: 2.2,
                              borderRadius: 999,
                              backgroundColor: BLUE,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                              "&:hover": { backgroundColor: "#0f1d2b" },
                            },
                            children: "Descargar matriz",
                          })
                        )
                      )
                    )
                  : [
                      h(
                        TableRow,
                        { key: "empty" },
                        h(
                          TableCell,
                          { colSpan: 2, align: "center", sx: { py: 4 } },
                          h(Typography, { color: "text.secondary" }, "No se encontraron resultados")
                        )
                      ),
                    ]
              )
            )
          ),
          h(TablePagination, {
            // NOTA: no pasamos `component`
            count: filtered.length,
            page,
            onPageChange: handleChangePage,
            rowsPerPage,
            onRowsPerPageChange: handleChangeRowsPerPage,
            rowsPerPageOptions: [10, 25, 50],
            labelRowsPerPage: "Filas por página",
            labelDisplayedRows: (info: LabelDisplayedRowsArgs) =>
              `${info.from}-${info.to} de ${info.count !== -1 ? info.count : `más de ${info.to}`}`,
            sx: {
              borderTop: "1px solid #e5e7eb",
              ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                color: "#64748b",
              },
            },
          })
        )
      )
    )
  );
}
