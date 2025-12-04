import type { PlanOption } from '@/types/audit';

export const BRAND_BLUE = '#0e2336';

export const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 1,
    value: 'riesgos',
    label: 'Planes basado en riesgos',
    hint: 'Plan de auditoría priorizado por probabilidad e impacto del riesgo en los procesos.',
  },
  {
    id: 2,
    value: 'gestion_interna',
    label: 'Planes a los sistemas de gestión internos',
    hint: 'Plan para auditar sistemas de gestión que dependen de procesos internos de la entidad.',
  },
  {
    id: 3,
    value: 'gestion_externa',
    label: 'Planes a los sistemas de gestión externa',
    hint: 'Plan para auditar sistemas de gestión que involucran entidades o procesos externos.',
  },
];


