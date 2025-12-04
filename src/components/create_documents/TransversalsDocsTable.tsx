import React from "react";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
} from "@mui/material";
import TablePagination, {
  type TablePaginationProps,
} from "@mui/material/TablePagination";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import { appColors } from "@/theme/colors";
import type { SigDocument } from "@/types/document";

export interface TransversalDocsTableProps {
  rows: SigDocument[];
}

function formatOnlyDate(value: string | Date | undefined | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

type Row = SigDocument;
type Align = "left" | "right" | "center" | "inherit" | "justify";
type DateField = "createdAt";
type TextField = "documentTypeName" | "processName" | "descripcion" | "codigo" | "version";

type BaseColumn<TField extends string> = {
  field: TField;
  headerName: string;
  width?: number;
  minWidth?: number;
  flex?: number;
  align?: Align;
  headerAlign?: Align;
};

type DateColumn = BaseColumn<DateField> & { kind: "date" };
type TextColumn = BaseColumn<TextField> & { kind: "text" };
type ActionsColumn = BaseColumn<"actions"> & { kind: "actions" };

type Column = DateColumn | TextColumn | ActionsColumn;

const TablePaginationComponent =
  TablePagination as React.ComponentType<TablePaginationProps>;

export default function TransversalDocsTable(
  props: TransversalDocsTableProps
): React.ReactElement {
  const columns: Column[] = [
    {
      kind: "date",
      field: "createdAt",
      headerName: "Fecha",
      width: 120,
      align: "center",
      headerAlign: "center",
    },
    {
      kind: "text",
      field: "codigo",
      headerName: "Código",
      flex: 1,
      minWidth: 100,
      align: "left",
    },
    {
      kind: "text",
      field: "documentTypeName",
      headerName: "Tipo",
      flex: 1,
      minWidth: 120,
      align: "left",
    },
    {
      kind: "text",
      field: "processName",
      headerName: "Proceso",
      flex: 1.2,
      minWidth: 140,
      align: "left",
    },
    {
      kind: "text",
      field: "descripcion",
      headerName: "Descripción",
      flex: 2,
      minWidth: 220,
      align: "left",
    },
    {
      kind: "text",
      field: "version",
      headerName: "Versión",
      width: 100,
      align: "center",
    },
    {
      kind: "actions",
      field: "actions",
      headerName: "Acciones",
      width: 140,
      align: "center",
      headerAlign: "center",
    },
  ];

  const allRows: Row[] = React.useMemo(() => props.rows, [props.rows]);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

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

  const paginatedRows: Row[] = React.useMemo(
    () => allRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [allRows, page, rowsPerPage]
  );

  return (
    <Paper
      sx={{
        width: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <TableContainer sx={{ maxHeight: 420 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  align={col.headerAlign ?? col.align}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: "#f5f5f5",
                    whiteSpace: "nowrap",
                    ...(col.width
                      ? { width: col.width, maxWidth: col.width }
                      : {}),
                    ...(col.minWidth ? { minWidth: col.minWidth } : {}),
                  }}
                >
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => (
              <TableRow key={row.id} hover>
                {columns.map((col) => {
                  let content: React.ReactNode;

                  if (col.kind === "actions") {
                    const url = row.fileUrl ?? "";
                    const fileName = url.split('/').pop() ?? "documento.pdf";

                    content = (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 12,
                          width: "100%",
                        }}
                      >
                        <button
                          type="button"
                          title="Ver"
                          onClick={() => window.open(url, "_blank")}
                          style={{
                            border: "none",
                            background: "rgba(20,35,52,0.08)",
                            borderRadius: 6,
                            width: 32,
                            height: 32,
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <VisibilityIcon sx={{ color: appColors.blue }} />
                        </button>
                        <button
                          type="button"
                          title="Descargar"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = fileName;
                            a.click();
                          }}
                          style={{
                            border: "none",
                            background: "rgba(39,155,72,0.12)",
                            borderRadius: 6,
                            width: 32,
                            height: 32,
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <DownloadIcon sx={{ color: appColors.green }} />
                        </button>
                      </div>
                    );
                  } else if (col.kind === "date") {
                    const value = row[col.field];
                    content = formatOnlyDate(
                      value as string | Date | undefined | null
                    );
                  } else {
                    const value = row[col.field];
                    const displayValue =
                      value === null || value === undefined || value === ""
                        ? "—"
                        : (value as React.ReactNode);
                    content = displayValue;
                  }

                  return (
                    <TableCell
                      key={col.field}
                      align={col.align}
                      sx={{
                        ...(col.width
                          ? { width: col.width, maxWidth: col.width }
                          : {}),
                        ...(col.minWidth ? { minWidth: col.minWidth } : {}),
                      }}
                    >
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePaginationComponent
                colSpan={columns.length}
                count={allRows.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 20]}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Paper>
  );
}
