import { describe, expect, it } from "vitest";
import {
  formatCents,
  formatCurrency,
  fromCents,
  signedCurrencyFromCents,
  toCents,
} from "./money";

describe("money helpers", () => {
  it("rounds dollar input to exact cents", () => {
    expect(toCents(12.345)).toBe(1235);
    expect(fromCents(1235)).toBe(12.35);
  });

  it("formats compact USD values and signed results", () => {
    expect(formatCurrency(200)).toBe("$200");
    expect(formatCents(20050)).toBe("$200.50");
    expect(signedCurrencyFromCents(12500)).toBe("+$125");
    expect(signedCurrencyFromCents(-2500)).toBe("−$25");
  });
});
