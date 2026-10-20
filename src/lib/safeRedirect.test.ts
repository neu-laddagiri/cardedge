import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safeRedirect";

const origin = "https://cardedge.example";

describe("safeNextPath", () => {
  it("keeps paths on this site", () => {
    expect(safeNextPath("/reset-password", origin)).toBe("/reset-password");
    expect(safeNextPath("/poker?tab=odds#top", origin)).toBe("/poker?tab=odds#top");
  });

  it("falls back for missing or relative values", () => {
    expect(safeNextPath(null, origin)).toBe("/account");
    expect(safeNextPath("", origin)).toBe("/account");
    expect(safeNextPath("account", origin)).toBe("/account");
  });

  it("refuses anything that resolves to another host", () => {
    for (const attack of ["//evil.example", "/\\evil.example", "//evil.example/account", "https://evil.example", "/\t/evil.example"]) {
      expect(safeNextPath(attack, origin), attack).toBe("/account");
    }
  });
});
