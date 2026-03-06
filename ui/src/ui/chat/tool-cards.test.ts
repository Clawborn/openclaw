import { describe, expect, it } from "vitest";
import { extractToolCards } from "./tool-cards.ts";

describe("extractToolCards", () => {
  it("extracts text from tool_result with string content", () => {
    const message = {
      role: "tool",
      content: [
        {
          type: "tool_result",
          name: "exec",
          content: "hello world",
        },
      ],
    };
    const cards = extractToolCards(message);
    const result = cards.find((c) => c.kind === "result");
    expect(result).toBeDefined();
    expect(result!.text).toBe("hello world");
  });

  it("extracts text from tool_result with array content", () => {
    const message = {
      role: "tool",
      content: [
        {
          type: "tool_result",
          name: "exec",
          content: [{ type: "text", text: "hello from array" }],
        },
      ],
    };
    const cards = extractToolCards(message);
    const result = cards.find((c) => c.kind === "result");
    expect(result).toBeDefined();
    expect(result!.text).toBe("hello from array");
  });

  it("extracts text from tool_result with multi-block array content", () => {
    const message = {
      role: "tool",
      content: [
        {
          type: "tool_result",
          name: "exec",
          content: [
            { type: "text", text: "line 1" },
            { type: "text", text: "line 2" },
          ],
        },
      ],
    };
    const cards = extractToolCards(message);
    const result = cards.find((c) => c.kind === "result");
    expect(result).toBeDefined();
    expect(result!.text).toBe("line 1\nline 2");
  });

  it("returns undefined text for tool_result with empty array content", () => {
    const message = {
      role: "tool",
      content: [
        {
          type: "tool_result",
          name: "exec",
          content: [],
        },
      ],
    };
    const cards = extractToolCards(message);
    const result = cards.find((c) => c.kind === "result");
    expect(result).toBeDefined();
    expect(result!.text).toBeUndefined();
  });
});
