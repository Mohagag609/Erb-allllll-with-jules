/**
 * Formats a number as a currency string for SAR.
 * @param amount The number to format.
 * @returns A formatted currency string, e.g., "١٬٢٣٤٫٥٦ ر.س.‏"
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) {
    return "";
  }
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
  }).format(amount);
};
