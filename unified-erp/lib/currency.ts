export function formatCurrency(value: number | string | null | undefined, currency: string = 'EGP') {
  if (value === null || value === undefined) return '';
  const num = typeof value === 'string' ? Number(value) : value;
  try {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency }).format(num);
  } catch {
    return `${num} ${currency}`;
  }
}