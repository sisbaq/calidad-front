export type DocumentItem = {
  id: number | string;
  name: string;
  type: string;
  version: string;
};

export type CategoryOption = {
  key: string;
  label: string;
};

export const documents: DocumentItem[] = [
  { id: 1, name: "Formato de Solicitud de Vacaciones", type: "Formato", version: "v2.1" },
  { id: 2, name: "Procedimiento de Contratación de Personal", type: "Procedimiento", version: "v3.0" },
  { id: 3, name: "Instructivo para Uso de Equipos de Seguridad", type: "Instructivo", version: "v1.5" },
  { id: 4, name: "Manual de Evaluación Interna", type: "Manual", version: "v1.0" },
  { id: 5, name: "Guía para Reportes", type: "Guía", version: "v1.2" },
  { id: 6, name: "Plantilla Libre", type: "Documento libre", version: "v1.0" },
  { id: 7, name: "Registro X", type: "Otros", version: "v0.9" },
];

export const categories: CategoryOption[] = [
  { key: "all", label: "Todos" },
  { key: "manual", label: "Manual" },
  { key: "procedimiento", label: "Procedimiento" },
  { key: "formato", label: "Formato" },
  { key: "instructivo", label: "Instructivo" },
  { key: "documento libre", label: "Documento libre" },
  { key: "guia", label: "Guía" },
  { key: "otros", label: "Otros" },
];
