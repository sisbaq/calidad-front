export interface DocFlowStep {
  rol?: string;
  estado?: string;
  fecha?: string;
  color?: string;
}

export interface DocItem {
  id: string | number;
  tipoDocumento?: string;
  descripcion?: string;
  version?: string | number;
  proceso?: string;
  responsable?: string;
  estado?: "Pendiente de aprobación" | "Aprobado" | "Rechazado" | string;
  observacion?: string;
  archivoUrl?: string;
  fechaCreacion?: string; 
  flujo?: DocFlowStep[];
}

const KEY = "docs_sig";

export function loadDocs(): DocItem[] {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    return raw ? (JSON.parse(raw) as DocItem[]) : [];
  } catch {
    return [];
  }
}

export function saveDocs(docs: DocItem[]): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(docs));
  }
}

export function upsertDoc(doc: DocItem): DocItem[] {
  const all = loadDocs();
  const idx = all.findIndex((d) => d.id === doc.id);
  if (idx >= 0) all[idx] = doc;
  else all.unshift(doc);
  saveDocs(all);
  return all;
}

export function updateDocStatus(
  id: DocItem["id"],
  status: NonNullable<DocItem["estado"]>,
  opts: { observacion?: string } = {}
): DocItem[] {
  const all = loadDocs();
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const idx = all.findIndex((d) => d.id === id);
  if (idx >= 0) {
    const current = all[idx];
    all[idx] = {
      ...current,
      estado: status,
      observacion: opts.observacion ?? current.observacion ?? "",
      flujo: (current.flujo || []).map((p, i) => {
        if (i === 0) return { ...p, estado: "Revisado", fecha: now, color: "success" };
        if (i === 1)
          return { ...p, estado: status, fecha: now, color: status === "Aprobado" ? "success" : "warning" };
        return p;
      }),
    } as DocItem;
    saveDocs(all);
  }
  return all;
}
