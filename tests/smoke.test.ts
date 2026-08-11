import { describe, expect, test } from "bun:test";

describe("smoke", () => {
  test("bun test runner está configurado", () => {
    expect(true).toBe(true);
  });

  test("happy-dom provee document", () => {
    expect(typeof document).toBe("object");
    const el = document.createElement("div");
    el.setAttribute("data-feedback", "");
    expect(el.hasAttribute("data-feedback")).toBe(true);
  });
});
