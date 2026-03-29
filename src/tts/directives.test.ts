import { describe, expect, it } from "vitest";
import { parseTtsDirectives } from "./directives.js";
import type { SpeechModelOverridePolicy } from "./provider-types.js";

const enabledPolicy: SpeechModelOverridePolicy = {
  enabled: true,
  allowText: true,
  allowProvider: true,
  allowVoice: true,
  allowModelId: true,
  allowVoiceSettings: true,
  allowNormalization: true,
  allowSeed: true,
};

describe("parseTtsDirectives", () => {
  it("parses a real tts:text directive", () => {
    const text = "[[tts:text]]hello world[[/tts:text]]";
    const result = parseTtsDirectives(text, enabledPolicy);
    expect(result.hasDirective).toBe(true);
    expect(result.ttsText).toBe("hello world");
  });

  it("does not parse tts tags inside fenced code blocks", () => {
    const text = "Use this syntax:\n```\n[[tts:text]]hello[[/tts:text]]\n```\nDone.";
    const result = parseTtsDirectives(text, enabledPolicy);
    expect(result.hasDirective).toBe(false);
    expect(result.cleanedText).toContain("[[tts:text]]hello[[/tts:text]]");
  });

  it("does not parse tts tags inside inline code spans", () => {
    const text = "You can write `[[tts:voice=Audrey]]` as an example.";
    const result = parseTtsDirectives(text, enabledPolicy);
    expect(result.hasDirective).toBe(false);
    expect(result.cleanedText).toContain("[[tts:voice=Audrey]]");
  });

  it("parses real directive while leaving code examples intact", () => {
    const text = "[[tts:text]]speak this[[/tts:text]] but ignore `[[tts:voice=Audrey]]` in code.";
    const result = parseTtsDirectives(text, enabledPolicy);
    expect(result.hasDirective).toBe(true);
    expect(result.ttsText).toBe("speak this");
    expect(result.cleanedText).toContain("`[[tts:voice=Audrey]]`");
  });

  it("returns unchanged text when policy is disabled", () => {
    const text = "[[tts:text]]hello[[/tts:text]]";
    const result = parseTtsDirectives(text, { ...enabledPolicy, enabled: false });
    expect(result.hasDirective).toBe(false);
    expect(result.cleanedText).toBe(text);
  });
});
