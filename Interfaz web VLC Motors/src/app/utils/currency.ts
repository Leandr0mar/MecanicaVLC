/**
 * Formatea un número como moneda peruana (Soles - S/)
 * @param amount - El monto a formatear
 * @returns String formateado como S/ XX,XXX.XX
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea un número como moneda peruana sin decimales
 * @param amount - El monto a formatear
 * @returns String formateado como S/ XX,XXX
 */
export function formatCurrencyCompact(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
