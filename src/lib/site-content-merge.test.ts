import { describe, it, expect } from "vitest";
import { mergeSiteContentFromDb } from "@/lib/site-content-merge";

describe("mergeSiteContentFromDb", () => {
  it("returns defaults when DB payload is null", () => {
    const defaults = { a: 1, nested: { x: "y" } };
    expect(mergeSiteContentFromDb(defaults, null)).toEqual(defaults);
  });

  it("deep-merges known keys from DB", () => {
    const defaults = {
      siteBrand: { name: "A", footerTagline: "f" },
      extra: { keep: true },
    };
    const fromDb = { siteBrand: { name: "B" } };
    const out = mergeSiteContentFromDb(defaults, fromDb);
    expect(out.siteBrand).toEqual({ name: "B", footerTagline: "f" });
    expect(out.extra).toEqual({ keep: true });
  });
});
