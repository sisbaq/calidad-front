import type { Finding } from '@/types/audit';

type FindingFormData = Omit<Finding, 'id'>;

export const getInitialFindingData = (): FindingFormData => ({
  auditReportId: "",
  auditReportDescription: "",
  findingType: "",
  date: "",
  auditedProcess: "",
  reportedBy: "",
  description: "",
  auditType: "",
  source: "",
  requirementNumeral: "",
  condition: "",
});

export const getInitialTouchedState = (): Record<keyof FindingFormData, boolean> => {
  const base = getInitialFindingData();
  return Object.keys(base).reduce((acc, k) => ({ ...acc, [k]: false }), {}) as Record<keyof FindingFormData, boolean>;
};

export function validateFinding(data: Partial<FindingFormData>): Partial<Record<keyof FindingFormData, string>> {
  const errors: Partial<Record<keyof FindingFormData, string>> = {};
  const req = (v: string | null | undefined) => v != null && String(v).trim() !== "";

  const numeral = String(data.requirementNumeral || "").trim();
  const isAlfanumerico = /^[\p{L}\p{M}0-9\s.\-_/(),:]+$/u.test(numeral);

  if (!req(data.auditReportId)) errors.auditReportId = "Seleccione el informe de auditoría";
  if (!req(data.findingType)) errors.findingType = "Seleccione el tipo de registro";
  if (!req(data.date)) errors.date = "Seleccione la fecha";
  if (!req(data.auditedProcess)) errors.auditedProcess = "Seleccione el proceso auditado";
  if (!req(data.auditType)) errors.auditType = "Seleccione el tipo de auditoría";
  if (!req(data.source)) errors.source = "Seleccione la fuente";

  if (!req(data.requirementNumeral)) {
    errors.requirementNumeral = "Ingrese el numeral o requisito";
  } else if (!isAlfanumerico) {
    errors.requirementNumeral = "Debe ser alfanumérico (ej.: 12, 12A, 9.2.1)";
  }

  if (!req(data.condition)) errors.condition = "Ingrese la condición";
  if (!req(data.description)) errors.description = "Ingrese la descripción del hallazgo";
  if (!req(data.reportedBy)) errors.reportedBy = "Ingrese el nombre del auditor";

  return errors;
}
