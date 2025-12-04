// src/components/create_documents/ApprovalHistoryTable.tsx
import * as React from "react";
import {
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
} from "@mui/material";
import type { DocItem } from "./documentStore";

const BLUE = "#142334";

const h = React.createElement;

export interface ApprovalHistoryTableProps {
  rows?: DocItem[];
}

type ColumnDef<Row> = {
  field: keyof Row;
  headerName: string;
  width?: number;
  flex?: number;
  renderCell?: (row: Row) => React.ReactNode;
};

const columns: ColumnDef<DocItem>[] = [
  { field: "tipoDocumento", headerName: "Tipo", width: 160 },
  { field: "descripcion", headerName: "Descripción", flex: 1.4 },
  { field: "version", headerName: "Versión", width: 110 },
  { field: "proceso", headerName: "Proceso", width: 220 },
  { field: "responsable", headerName: "Responsable", width: 200 },
  { field: "estado", headerName: "Estado", width: 170 },
  {
    field: "observacion",
    headerName: "Observación",
    flex: 1.2,
    renderCell: (row: DocItem) => row.observacion ?? "—",
  },
  {
    field: "archivoUrl",
    headerName: "Archivo",
    width: 150,
    renderCell: (row: DocItem) =>
      row.archivoUrl
        ? h(
          "a",
          {
            href: row.archivoUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            style: { textDecoration: "underline", color: BLUE },
            onClick: (e: React.MouseEvent) => e.stopPropagation(),
          },
          "Ver PDF"
        )
        : "—",
  },
];

export default function ApprovalHistoryTable(
  props: ApprovalHistoryTableProps
): React.ReactElement {
  const rows = props.rows ?? [];

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(8);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRows = React.useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, page, rowsPerPage]
  );

  return h(
    Card,
    { elevation: 3, sx: { borderRadius: 3, width: "100%", maxWidth: "100%" } },
    h(
      CardContent,
      null,
      h(
        "div",
        {
          style: {
            height: 420,
            width: "100%",
            display: "flex",
            flexDirection: "column",
          },
        },
        h(
          TableContainer,
          { style: { flex: 1, overflowY: "auto" } },
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
                  h(
                    TableCell,
                    {
                      key: col.field as string,
                      sx: {
                        fontWeight: 600,
                        backgroundColor: "#f5f5f5",
                        ...(col.width
                          ? { width: col.width, maxWidth: col.width }
                          : {}),
                        whiteSpace: "nowrap",
                      },
                    },
                    col.headerName
                  )
                )
              )
            ),
            h(
              TableBody,
              null,
              paginatedRows.map((row) =>
                h(
                  TableRow,
                  { key: row.id },
                  columns.map((col) =>
                    h(
                      TableCell,
                      {
                        key: col.field as string,
                        sx: {
                          ...(col.width
                            ? { width: col.width, maxWidth: col.width }
                            : {}),
                        },
                      },
                      col.renderCell
                        ? col.renderCell(row)
                        : ((row[col.field] as React.ReactNode) ?? "—")
                    )
                  )
                )
              )
            )
          )
        ),
        h(TablePagination, {
          count: rows.length,
          page,
          onPageChange: handleChangePage,
          rowsPerPage,
          onRowsPerPageChange: handleChangeRowsPerPage,
          rowsPerPageOptions: [8, 15, 25],
        })
      )
    )
  );
}
