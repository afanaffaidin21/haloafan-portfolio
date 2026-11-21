import { expect, test } from "vitest";
import { payloadSecret } from "../../src/lib/secret";

test("the configured secret wins in every environment", () => {
  expect(payloadSecret({ NODE_ENV: "production", PAYLOAD_SECRET: "real" })).toBe("real");
  expect(payloadSecret({ NODE_ENV: "development", PAYLOAD_SECRET: "real" })).toBe("real");
});
test("production refuses to start without a secret", () => {
  expect(() => payloadSecret({ NODE_ENV: "production" })).toThrow(/PAYLOAD_SECRET/);
});
test("an empty secret counts as absent in production", () => {
  expect(() => payloadSecret({ NODE_ENV: "production", PAYLOAD_SECRET: "" })).toThrow(/PAYLOAD_SECRET/);
});
test("development and test fall back to the dev-only secret", () => {
  expect(payloadSecret({ NODE_ENV: "development" })).toBe("dev-only-secret");
  expect(payloadSecret({ NODE_ENV: "test" })).toBe("dev-only-secret");
  expect(payloadSecret({})).toBe("dev-only-secret");
});
