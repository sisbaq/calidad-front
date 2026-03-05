/**
 * Convierte una fecha ISO string a formato YYYY-MM-DD en la zona horaria local
 * @param isoString - Fecha en formato ISO (ej: '2026-03-05T08:30:00.000Z') o YYYY-MM-DD
 * @returns Fecha en formato YYYY-MM-DD basada en la zona horaria local
 */
export function isoToLocalDateString(isoString: string): string {
  if (!isoString) return '';

  // Si ya está en formato YYYY-MM-DD, devolverlo directamente
  if (isoString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return isoString;
  }

  // Si es una ISO string, convertir
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Mantiene la fecha en formato simple YYYY-MM-DD
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns La misma fecha en formato YYYY-MM-DD
 */
export function localDateStringToIso(dateString: string): string {
  if (!dateString) return '';

  // Mantener el formato YYYY-MM-DD simple (sin convertir a ISO string con timezone)
  return dateString;
}

/**
 * Parsea una fecha en formato YYYY-MM-DD sin problemas de timezone
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Date object en la zona horaria local
 */
export function parseDateString(dateString: string): Date {
  if (!dateString) return new Date();

  // Parsear manualmente para evitar problemas de timezone
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Crear fecha en zona horaria local, NO en UTC
  return new Date(year, month - 1, day);
}
