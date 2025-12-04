import * as React from "react";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Tooltip,
  IconButton,
  Chip,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  Autocomplete,
  Snackbar,
  Alert,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ApprovalDetail from "@components/create_documents/ApprovalDetail";
import {
  getDocumentsForApproval,
  getRevisionStatuses,
  approveDocument,
  rejectDocument,
} from "@/services/document.service";
import { getProcesses } from "@/services/findings.service";
import type { RevisionStatus, SigDocument } from "@/types/document";
import type { ProcessOption } from "@/types/audit";
import type { Dayjs } from "dayjs";

const BLUE = "#142334";
const GREEN = "#279B48";
const h = React.createElement;

interface FiltersState {
  fecha: Dayjs | null;
  estado: string | null;
  proceso: string | null;
}

export default function ApprovalPage(): React.ReactElement {
  const [docs, setDocs] = useState<SigDocument[]>([]);
  const [selected, setSelected] = useState<SigDocument | null>(null);
  const [filters, setFilters] = useState<FiltersState>({
    fecha: null,
    estado: null,
    proceso: null,
  });
  const [revisionStatuses, setRevisionStatuses] = useState<RevisionStatus[]>(
    []
  );
  const [processes, setProcesses] = useState<ProcessOption[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);


  void loading;

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const backendFilters: {
        fecha?: string;
        estadoRevision?: number;
        procesoId?: number;
        page?: number;
        limit?: number;
      } = {
        page: page + 1,
        limit: rowsPerPage,
      };

      if (filters.fecha)
        backendFilters.fecha = filters.fecha.format("YYYY-MM-DD");

      if (filters.estado) {
        const statusObj = revisionStatuses.find(
          (rs) => rs.edrNomEstado.toLowerCase() === filters.estado?.toLowerCase()
        );
        if (statusObj) backendFilters.estadoRevision = statusObj.edrId;
      }

      if (filters.proceso) {
        const processObj = processes.find(
          (p) => p.name.toLowerCase() === filters.proceso?.toLowerCase()
        );
        if (processObj) backendFilters.procesoId = processObj.id;
      }

      const response = await getDocumentsForApproval(backendFilters);
      setDocs(response.data);
      setTotalCount(response.pagination.total);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statuses, procs] = await Promise.all([
          getRevisionStatuses(),
          getProcesses(),
        ]);
        setRevisionStatuses(statuses);
        setProcesses(procs);
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (
      revisionStatuses.length > 0 ||
      processes.length > 0 ||
      (!filters.estado && !filters.proceso)
    ) {
      setPage(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (
      revisionStatuses.length > 0 ||
      processes.length > 0 ||
      (!filters.estado && !filters.proceso)
    ) {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, rowsPerPage, revisionStatuses, processes]);

  const handleClear = () =>
    setFilters({ fecha: null, estado: null, proceso: null });

  const handleChangePage = (_event: unknown, newPage: number) =>
    setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const rectControlSx = {
    "& .MuiOutlinedInput-root": { minHeight: 48, borderRadius: "6px !important" },
    "& .MuiOutlinedInput-notchedOutline": { borderWidth: 1 },
    "& .MuiInputBase-input": { fontSize: 14, padding: "12px 14px" },
    "& .MuiInputLabel-root": { fontSize: 14 },
    "& label.Mui-focused": { color: BLUE },
    "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: BLUE },
    "& .MuiAutocomplete-endAdornment": { right: 10 },
  };

  return h(
    Box,
    { sx: { width: "100%", px: { xs: 1, sm: 2, md: 4 }, py: 4 } },

    h(
      Typography,
      { variant: "h4", fontWeight: 800, sx: { color: BLUE, mb: 3 } },
      "Aprobación de Documentos"
    ),

    h(
      Paper,
      {
        square: true,
        elevation: 0,
        sx: {
          border: "1px solid",
          borderColor: "divider",
          px: 2,
          py: 1.5,
          bgcolor: "background.paper",
          width: "100%",
          mb: 3,
        },
      },
      h(
        Stack,
        {
          direction: "row",
          alignItems: "center",
          justifyContent: "space-between",
          sx: { mb: 1 },
        },
        h(
          Typography,
          { variant: "subtitle2", sx: { fontWeight: 700, color: BLUE } },
          "Filtros"
        )
      ),
      h(
        LocalizationProvider,
        { dateAdapter: AdapterDayjs as any, adapterLocale: "es" },
        h(
          Grid,
          { container: true, spacing: 1.5, alignItems: "center" },

          h(
            Grid,
            { size: { xs: 12, md: 2.5 } },
            h(DatePicker as any, {
              label: "Fecha de creación",
              value: filters.fecha as any,
              onChange: (val: Dayjs | null) =>
                setFilters((p) => ({ ...p, fecha: val })),
              slotProps: {
                textField: {
                  fullWidth: true,
                  InputLabelProps: { shrink: true },
                  placeholder: "Selecciona una fecha",
                  sx: rectControlSx,
                },
              },
            })
          ),

          h(
            Grid,
            { size: { xs: 12, md: 2.5 } },
            h(Autocomplete as any, {
              options: revisionStatuses.map((rs) =>
                rs.edrNomEstado.toLowerCase()
              ),
              value: filters.estado,
              onChange: (_: any, newValue: string | null) =>
                setFilters((prev) => ({ ...prev, estado: newValue })),
              isOptionEqualToValue: (option: string, value: string) =>
                option === value,
              getOptionLabel: (option: string) =>
                option ? option.charAt(0).toUpperCase() + option.slice(1) : "",
              clearOnEscape: true,
              disablePortal: true,
              fullWidth: true,
              renderInput: (params: any) =>
                h(TextField, {
                  ...params,
                  fullWidth: true,
                  label: "Estado",
                  placeholder: "Selecciona un estado",
                  sx: rectControlSx,
                }),
            })
          ),

          h(
            Grid,
            { size: { xs: 12, md: 4 } },
            h(Autocomplete as any, {
              options: processes.map((p) => p.name.toLowerCase()),
              value: filters.proceso,
              onChange: (_: any, newValue: string | null) =>
                setFilters((prev) => ({ ...prev, proceso: newValue })),
              isOptionEqualToValue: (option: string, value: string) =>
                option === value,
              getOptionLabel: (option: string) =>
                option ? option.charAt(0).toUpperCase() + option.slice(1) : "",
              clearOnEscape: true,
              disablePortal: true,
              fullWidth: true,
              renderInput: (params: any) =>
                h(TextField, {
                  ...params,
                  fullWidth: true,
                  label: "Proceso",
                  placeholder: "Selecciona un proceso",
                  sx: rectControlSx,
                }),
            })
          ),

          h(
            Grid,
            { size: { xs: 12, md: 3 } },
            h(
              Button,
              {
                startIcon: h(RestartAltIcon),
                variant: "outlined",
                onClick: handleClear,
                fullWidth: true,
                sx: {
                  minHeight: 48,
                  borderRadius: "6px !important",
                  fontSize: 14,
                  fontWeight: 700,
                  borderColor: BLUE,
                  color: BLUE,
                  textTransform: "none",
                },
              },
              "Limpiar"
            )
          )
        )
      )
    ),

    // Tabla
    h(
      Paper,
      {
        elevation: 0,
        sx: {
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
          mb: 3,
        },
      },
      h(
        TableContainer,
        {},
        h(
          Table,
          { size: "small", stickyHeader: true },

          h(
            TableHead,
            {},
            h(
              TableRow,
              {},
              h(
                TableCell,
                { align: "center", sx: { fontWeight: 700, color: BLUE } },
                "Fecha"
              ),
              h(
                TableCell,
                { sx: { fontWeight: 700, color: BLUE } },
                "Tipo"
              ),
              h(
                TableCell,
                { sx: { fontWeight: 700, color: BLUE } },
                "Descripción"
              ),
              h(
                TableCell,
                { sx: { fontWeight: 700, color: BLUE } },
                "Proceso"
              ),
              h(
                TableCell,
                { align: "center", sx: { fontWeight: 700, color: BLUE } },
                "Estado"
              ),
              h(
                TableCell,
                { align: "center", sx: { fontWeight: 700, color: BLUE } },
                "Acciones"
              )
            )
          ),

          h(
            TableBody,
            {},
            docs.length === 0
              ? h(
                TableRow,
                {},
                h(
                  TableCell,
                  {
                    colSpan: 6,
                    align: "center",
                    sx: { py: 4, color: "text.secondary" },
                  },
                  "No hay documentos para mostrar"
                )
              )
              : docs.map((doc: SigDocument) => {
                const estado = doc.revisionStatusName
                  ? doc.revisionStatusName.charAt(0).toUpperCase() +
                  doc.revisionStatusName.slice(1).toLowerCase()
                  : "Por revisar";
                let color = BLUE;
                let bg = "#E7EAF1";
                if (estado === "Aprobado") {
                  color = GREEN;
                  bg = "#DFF5E1";
                } else if (estado === "Devuelto") {
                  color = "#D32F2F";
                  bg = "#FDECEC";
                } else if (estado === "Por revisar") {
                  color = BLUE;
                  bg = "#E8EBF3";
                } else if (estado === "Corregido") {
                  color = "#EAB308";
                  bg = "#FEF3C7";
                }

                const formatDate = (dateStr: string) => {
                  if (!dateStr) return "—";
                  const d = new Date(dateStr);
                  const dd = String(d.getDate()).padStart(2, "0");
                  const mm = String(d.getMonth() + 1).padStart(2, "0");
                  const yyyy = d.getFullYear();
                  return `${dd}/${mm}/${yyyy}`;
                };

                return h(
                  TableRow,
                  { key: doc.id, hover: true },

                  h(
                    TableCell,
                    { align: "center" },
                    formatDate(doc.createdAt)
                  ),
                  h(TableCell, {}, doc.documentTypeName || "—"),
                  h(TableCell, {}, doc.descripcion || "—"),
                  h(TableCell, {}, doc.processName || "—"),

                  h(
                    TableCell,
                    { align: "center" },
                    h(Chip, {
                      label: estado,
                      size: "small",
                      sx: { bgcolor: bg, color, fontWeight: 600, borderRadius: 1.5 },
                    })
                  ),

                  h(
                    TableCell,
                    { align: "center" },
                    h(Tooltip, {
                      title: "Gestionar",
                      arrow: true,
                      children: h(
                        IconButton,
                        {
                          size: "small",
                          onClick: () => setSelected(doc),
                          sx: { color: BLUE },
                        },
                        h(VisibilityOutlinedIcon)
                      ),
                    })
                  )
                );
              })
          )
        )
      ),

      h(TablePagination as any, {
        component: "div",
        count: totalCount,
        page,
        onPageChange: handleChangePage,
        rowsPerPage,
        onRowsPerPageChange: handleChangeRowsPerPage,
        rowsPerPageOptions: [5, 10, 25, 50],
        labelRowsPerPage: "Filas por página:",
        labelDisplayedRows: ({
          from,
          to,
          count,
        }: {
          from: number;
          to: number;
          count: number;
        }) => `${from}-${to} de ${count}`,
        sx: {
          borderTop: "1px solid",
          borderColor: "divider",
          "& .MuiTablePagination-actions button": { color: BLUE },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { mx: 1 },
        },
      })
    ),

    h(ApprovalDetail, {
      open: Boolean(selected),
      doc: selected,
      onClose: () => setSelected(null),
      onApproved: async (id) => {
        try {
          await approveDocument(id);
          setSnackbar({
            open: true,
            message: "Documento aprobado exitosamente",
            severity: "success",
          });
          fetchDocuments();
          setSelected(null);
        } catch (error) {
          setSnackbar({
            open: true,
            message:
              error instanceof Error
                ? error.message
                : "Error al aprobar el documento",
            severity: "error",
          });
        }
      },
      onRejected: async (id, reason) => {
        try {
          await rejectDocument(id, reason);
          setSnackbar({
            open: true,
            message: "Documento rechazado exitosamente",
            severity: "success",
          });
          fetchDocuments();
          setSelected(null);
        } catch (error) {
          setSnackbar({
            open: true,
            message:
              error instanceof Error
                ? error.message
                : "Error al rechazar el documento",
            severity: "error",
          });
        }
      },
    }),
    h(
      Snackbar,
      {
        open: snackbar.open,
        autoHideDuration: 6000,
        onClose: () => setSnackbar({ ...snackbar, open: false }),
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      },
      h(
        Alert,
        {
          onClose: () => setSnackbar({ ...snackbar, open: false }),
          severity: snackbar.severity,
          variant: "filled",
          sx: { width: "100%" },
        },
        snackbar.message
      )
    )
  );
}
