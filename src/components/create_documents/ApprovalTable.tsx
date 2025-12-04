import * as React from "react";
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
} from "@mui/material";
import type { StackProps } from "@mui/material/Stack";
import TablePagination, {
  type TablePaginationProps,
} from "@mui/material/TablePagination";
import CheckIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/HighlightOff";
import type { DocItem } from "./documentStore";

const GREEN = "#279B48";
const h = React.createElement;

export interface ApprovalTableProps {
  rows?: DocItem[];
  onSelect?: (doc: DocItem) => void;
  onApprove?: (id: DocItem["id"]) => void;
  onReject?: (id: DocItem["id"], reason?: string) => void;
}

type DataField =
  | "tipoDocumento"
  | "descripcion"
  | "version"
  | "proceso"
  | "responsable";

type DataColumn = {
  kind: "data";
  field: DataField;
  headerName: string;
  width?: number;
  flex?: number;
};

type ActionsColumn = {
  kind: "actions";
  field: "actions";
  headerName: string;
  width?: number;
  flex?: number;
};

type ApprovalColumn = DataColumn | ActionsColumn;


const TablePaginationComponent =
  TablePagination as React.ComponentType<TablePaginationProps>;

export default function ApprovalTable(
  props: ApprovalTableProps
): React.ReactElement {
  const { rows = [], onSelect, onApprove, onReject } = props;

  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const filtered: DocItem[] = useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) =>
      [r.tipoDocumento, r.descripcion, r.proceso, r.responsable]
        .filter((v): v is string => Boolean(v))
        .some((v) => v.toLowerCase().includes(s))
    );
  }, [rows, q]);

  const columns: ApprovalColumn[] = [
    { kind: "data", field: "tipoDocumento", headerName: "Tipo", width: 150 },
    { kind: "data", field: "descripcion", headerName: "Descripción", flex: 1.2 },
    { kind: "data", field: "version", headerName: "Versión", width: 110 },
    { kind: "data", field: "proceso", headerName: "Proceso", width: 220 },
    { kind: "data", field: "responsable", headerName: "Responsable", width: 200 },
    {
      kind: "actions",
      field: "actions",
      headerName: "Acciones",
      width: 150,
    },
  ];

  const dir: StackProps["direction"] = { xs: "column", sm: "row" };

  const handleChangePage: NonNullable<TablePaginationProps["onPageChange"]> = (
    _event,
    newPage
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage: NonNullable<
    TablePaginationProps["onRowsPerPageChange"]
  > = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginated: DocItem[] = useMemo(
    () =>
      filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  return h(
    Card,
    {
      elevation: 3,
      sx: { borderRadius: 3, width: "100%", maxWidth: "100%", height: "100%" },
    },
    h(
      CardContent,
      { sx: { pb: 0 } },
      h(
        Stack,
        {
          direction: dir,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 1,
        },
        h(Typography, { variant: "h6" }, "Pendientes de aprobación"),
        h(TextField, {
          size: "small",
          placeholder: "Buscar…",
          value: q,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setQ(e.target.value),
          sx: { width: { xs: "100%", sm: 280 } },
        })
      ),

      h(
        TableContainer,
        { sx: { maxHeight: 420 } },
        h(
          Table,
          { size: "small", stickyHeader: true },

          h(
            TableHead,
            null,
            h(
              TableRow,
              null,
              columns.map((col) =>
                h(TableCell, {
                  key: col.field,
                  sx: {
                    fontWeight: 600,
                    backgroundColor: "#f5f5f5",
                    whiteSpace: "nowrap",
                    ...(col.width
                      ? { width: col.width, maxWidth: col.width }
                      : {}),
                  },
                  children: col.headerName,
                })
              )
            )
          ),

          h(
            TableBody,
            null,
            paginated.map((row) =>
              h(
                TableRow,
                {
                  key: row.id,
                  hover: true,
                  sx: { cursor: onSelect ? "pointer" : "default" },
                  onClick: () => {
                    if (onSelect) onSelect(row);
                  },
                },
                columns.map((col) => {

                  let content: React.ReactNode;

                  if (col.kind === "actions") {

                    content = h(
                      Stack,
                      { direction: "row", spacing: 1 },
                      h(
                        Tooltip,
                        {
                          title: "Aprobar",
                          children: h(
                            IconButton,
                            {
                              size: "small",
                              sx: { color: GREEN },
                              onClick: (e: React.MouseEvent) => {
                                e.stopPropagation();
                                if (onApprove) onApprove(row.id);
                              },
                            },
                            h(CheckIcon)
                          ),
                        }
                      ),
                      h(
                        Tooltip,
                        {
                          title: "Rechazar",
                          children: h(
                            IconButton,
                            {
                              size: "small",
                              color: "error",
                              onClick: (e: React.MouseEvent) => {
                                e.stopPropagation();
                                if (onReject) {
                                  onReject(row.id, "Rechazado sin comentario");
                                }
                              },
                            },
                            h(CloseIcon)
                          ),
                        }
                      )
                    );
                  } else {
                    const value = row[col.field];
                    const displayValue =
                      value === null || value === undefined ? "—" : value;
                    content = displayValue as React.ReactNode;
                  }

                  return h(TableCell, {
                    key: col.field,
                    sx: col.width
                      ? { width: col.width, maxWidth: col.width }
                      : {},
                    children: content,
                  });
                })
              )
            )
          ),

          h(
            TableFooter,
            null,
            h(
              TableRow,
              null,
              h(TablePaginationComponent, {
                colSpan: columns.length,
                count: filtered.length,
                page,
                onPageChange: handleChangePage,
                rowsPerPage,
                onRowsPerPageChange: handleChangeRowsPerPage,
                rowsPerPageOptions: [8, 15, 25],
              })
            )
          )
        )
      )
    )
  );
}
