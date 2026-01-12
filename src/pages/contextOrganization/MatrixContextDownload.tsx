import { useState, useEffect, useCallback } from "react";
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
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { getCurrentContextMatrix } from "@services/organization-context.service";
import type { ContextMatrix } from "@/types/organization-context";
import CenteredSpinner from "@components/common/CenteredSpinner";

const BLUE = "#142334";

type Row = {
  id: number;
  nombre: string;
  url: string | null;
};

export default function MatrixContextDownload() {
  const [data, setData] = useState<ContextMatrix | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const context = await getCurrentContextMatrix();
        setData(context);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar los datos",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownload = useCallback((url: string | null) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "matriz_contexto.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  if (loading) {
    return <CenteredSpinner />;
  }

  if (error) {
    return (
      <Box sx={{ width: "100%", p: { xs: 2, md: 3 } }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const row: Row | null = data
    ? {
        id: data.id,
        nombre: data.description,
        url: data.document,
      }
    : null;

  const matchesQuery = row
    ? query.trim() === "" ||
      row.nombre.toLowerCase().includes(query.trim().toLowerCase())
    : false;

  const showRow = row && matchesQuery;

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 3 }, backgroundColor: "#fff" }}>
      <Typography variant="h5" sx={{ fontWeight: 800, color: BLUE, mb: 0.5 }}>
        Consulta y descarga la matriz de contexto
      </Typography>
      <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
        Visualiza y descarga los archivos disponibles
      </Typography>

      <TextField
        placeholder="Buscar"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        size="medium"
        sx={{ mb: 2, maxWidth: 420 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#90a4ae" }} />
            </InputAdornment>
          ),
        }}
      />

      <Card sx={{ width: "100%", borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <TableContainer
            sx={{
              border: "1px solid",
              borderColor: "#e5e7eb",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      backgroundColor: "#f8fafc",
                      color: BLUE,
                    }}
                  >
                    Nombre
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                      backgroundColor: "#f8fafc",
                      color: BLUE,
                      width: 240,
                    }}
                  >
                    Descargar matriz
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {showRow ? (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ color: BLUE }}>{row.nombre}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        onClick={() => handleDownload(row.url)}
                        startIcon={<CloudDownloadIcon />}
                        disabled={!row.url}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          px: 2.2,
                          borderRadius: 999,
                          backgroundColor: !row.url ? "#E5E7EB" : BLUE,
                          color: !row.url ? "#6B7280" : "#fff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          "&:hover": {
                            backgroundColor: !row.url ? "#E5E7EB" : "#0f1d2b",
                          },
                        }}
                      >
                        Descargar matriz
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No se encontraron resultados
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
