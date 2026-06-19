import { expect, test } from "vitest";
import { version } from "../src/index.ts";

test("library version is defined", () => {
  expect(version).toBe("0.0.1");
});
