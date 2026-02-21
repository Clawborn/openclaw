import { describe, expect, it } from "vitest";
import { ModelProviderSchema } from "./zod-schema.core.js";

describe("ModelProviderSchema: baseUrl and models are optional", () => {
  it("accepts apiKey-only config (Ollama env-var auto-discovery pattern)", () => {
    const result = ModelProviderSchema.safeParse({ apiKey: "ollama-local" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (auto-discovery with no explicit config)", () => {
    const result = ModelProviderSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts full config with baseUrl and models", () => {
    const result = ModelProviderSchema.safeParse({
      baseUrl: "http://localhost:11434/v1",
      apiKey: "test",
      models: [{ id: "llama3", name: "Llama 3" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty baseUrl string", () => {
    const result = ModelProviderSchema.safeParse({ baseUrl: "", apiKey: "test" });
    expect(result.success).toBe(false);
  });

  it("rejects unknown keys (strict mode)", () => {
    const result = ModelProviderSchema.safeParse({ unknownKey: "value" });
    expect(result.success).toBe(false);
  });
});
