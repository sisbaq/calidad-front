import * as React from "react";
import { Card, CardContent, MenuItem, TextField, Box } from "@mui/material";
import type { DocumentType } from "@/types/document";
import type { ProcessOption } from "@/types/audit";

const YEARS: number[] = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - i);

export interface DocumentsFiltersProps {
  type: string;
  year: number | "" | string;
  process: string;
  onChange: React.Dispatch<
    React.SetStateAction<{ type: string; year: number | "" | string; process: string }>
  >;
  documentTypes: DocumentType[];
  processes: ProcessOption[];
}

export default function DocumentsFilters(props: DocumentsFiltersProps): React.ReactElement {
  const h = React.createElement;
  const { type, year, process, onChange, documentTypes, processes } = props;

  return h(
    Box,
    { sx: { mt: 2 } },
    h(
      Card,
      {
        sx: {
          width: "100%",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#f6f7f9",
        },
      },
      h(
        CardContent,
        { sx: { pt: 2 } },
        h(
          Box,
          {
            sx: {
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            },
          },
          h(TextField, {
            select: true,
            fullWidth: true,
            size: "medium",
            label: "Filtrar por tipo",
            value: type,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              onChange((f) => ({ ...f, type: e.target.value })),
            InputLabelProps: { shrink: true },
            sx: { minHeight: 56 },
            children: [
              h(MenuItem, { key: "all-t", value: "" }, "Todos"),
              ...documentTypes.map((t) => h(MenuItem, { key: t.tipId, value: t.tipNombre }, t.tipNombre)),
            ],
          }),
          h(TextField, {
            select: true,
            fullWidth: true,
            size: "medium",
            label: "Filtrar por proceso",
            value: process,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              onChange((f) => ({ ...f, process: e.target.value })),
            InputLabelProps: { shrink: true },
            sx: { minHeight: 56 },
            children: [
              h(MenuItem, { key: "all-p", value: "" }, "Todos"),
              ...processes.map((p) => h(MenuItem, { key: p.id, value: p.name }, p.name)),
            ],
          }),
          h(TextField, {
            select: true,
            fullWidth: true,
            size: "medium",
            label: "Filtrar por año",
            value: year,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              onChange((f) => ({ ...f, year: e.target.value })),
            InputLabelProps: { shrink: true },
            sx: { minHeight: 56 },
            children: [
              h(MenuItem, { key: "all-y", value: "" }, "Todos"),
              ...YEARS.map((y) => h(MenuItem, { key: y, value: y }, String(y))),
            ],
          })
        )
      )
    )
  );
}
