
export const BRAND = {
  blue: "#142334",
  green: "#279B48",
} as const;

export interface Role {
  proceso: string;
  responsable: string;
}

export const ROLES: Role[] = [
  { proceso: "Direccionamiento Estratégico y Planeación", responsable: "Secretaría de Planeación" },
  { proceso: "Gestión de Recursos Financieros", responsable: "Secretaría de Hacienda" },
  { proceso: "Gestión de las Tecnologías e Información", responsable: "Gerencia TIC" },
  { proceso: "Gestión de la comunicación", responsable: "Secretaría de Comunicaciones" },
  { proceso: "Gestión Documental", responsable: "Secretaría General / Archivo Distrital" },
  { proceso: "Gestión Jurídica", responsable: "Secretaría Jurídica Distrital" },
  { proceso: "Gestión Humana y SST", responsable: "Talento Humano / SST" },
  { proceso: "Gestión de la Contratación", responsable: "Oficina de Contratación" },
  { proceso: "Gestión de la Infraestructura Física", responsable: "Agencia Distrital de Infraestructura (ADI)" },
  { proceso: "Fortalecimiento a la Justicia", responsable: "Secretaría de Gobierno / Inspecciones" },
  { proceso: "Gestión del Riesgo de Emergencias y Desastres", responsable: "Oficina de Gestión del Riesgo" },
  { proceso: "Evaluación Independiente", responsable: "Gerencia de Control Interno de Gestión" },
  { proceso: "Gestión Disciplinaria", responsable: "Secretaría Jurídica / Control Interno Disciplinario" },
  { proceso: "Atención al Ciudadano", responsable: "Atención al Ciudadano / Gobierno Digital" },
  { proceso: "Participación Ciudadana", responsable: "Oficina de Participación Ciudadana" },
  { proceso: "Gestión del Desarrollo Económico", responsable: "Secretaría de Desarrollo Económico" },
  { proceso: "Gestión del Turismo", responsable: "Secretaría de Desarrollo Económico (Turismo)" },
  { proceso: "Gestión Cultural y Patrimonio", responsable: "Secretaría de Cultura y Patrimonio" },
  { proceso: "Ordenamiento y Desarrollo Físico", responsable: "Secretaría de Planeación / Control Urbano" },
  { proceso: "Gestión del Diseño y Control de Obras", responsable: "Secretaría de Obras Públicas / ADI" },
  { proceso: "Gestión de Tránsito y Seguridad Vial", responsable: "Secretaría de Tránsito y Seguridad Vial" },
  { proceso: "Hábitat", responsable: "Secretaría de Planeación / ADI (según alcance)" },
  { proceso: "Gestión de la Seguridad", responsable: "Oficina para la Seguridad y Convivencia" },
  { proceso: "Gestión y Desarrollo Social", responsable: "Gerencia de Desarrollo Social" },
  { proceso: "Gestión del Servicio Educativo", responsable: "Secretaría de Educación" },
  { proceso: "Gestión de la Salud", responsable: "Secretaría de Salud" },
  { proceso: "Gestión de Recreación y Deporte", responsable: "Secretaría de Recreación y Deporte" },
];
