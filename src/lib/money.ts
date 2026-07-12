const usdWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const usdCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

export function toCents(value: number): number {
  return Math.round(roundMoney(value) * 100);
}

export function fromCents(value: number): number {
  return roundMoney(value / 100);
}

export function formatCurrency(value: number): string {
  const rounded = roundMoney(value);
  return Number.isInteger(rounded) ? usdWhole.format(rounded) : usdCents.format(rounded);
}

export function formatCents(value: number): string {
  return formatCurrency(fromCents(value));
}

export function signedCurrencyFromCents(value: number): string {
  if (value === 0) return formatCents(0);
  return `${value > 0 ? "+" : "−"}${formatCents(Math.abs(value))}`;
}
