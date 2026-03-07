import type {
  EditorTheme,
  MarkdownTheme,
  SelectListTheme,
  SettingsListTheme,
} from "@mariozechner/pi-tui";
import chalk from "chalk";
import { highlight, supportsLanguage } from "cli-highlight";
import type { SearchableSelectListTheme } from "../components/searchable-select-list.js";
import { createSyntaxTheme } from "./syntax-theme.js";

const darkPalette = {
  text: "#E8E3D5",
  dim: "#7B7F87",
  accent: "#F6C453",
  accentSoft: "#F2A65A",
  border: "#3C414B",
  userBg: "#2B2F36",
  userText: "#F3EEE0",
  systemText: "#9BA3B2",
  toolPendingBg: "#1F2A2F",
  toolSuccessBg: "#1E2D23",
  toolErrorBg: "#2F1F1F",
  toolTitle: "#F6C453",
  toolOutput: "#E1DACB",
  quote: "#8CC8FF",
  quoteBorder: "#3B4D6B",
  code: "#F0C987",
  codeBlock: "#1E232A",
  codeBorder: "#343A45",
  link: "#7DD3A5",
  error: "#F97066",
  success: "#7DD3A5",
};

/**
 * High-contrast palette for light-background terminals.
 * All foreground colours target ≥ 4.5:1 contrast ratio against white (#FFF)
 * per WCAG AA. Enable via OPENCLAW_THEME=light or COLORFGBG detection.
 */
const lightPalette: typeof darkPalette = {
  text: "#1A1A1A",
  dim: "#555555",
  accent: "#9B6700",
  accentSoft: "#A85400",
  border: "#B0B0B0",
  userBg: "#E8E8E8",
  userText: "#1A1A1A",
  systemText: "#4A5568",
  toolPendingBg: "#E0EFF5",
  toolSuccessBg: "#E0F0E4",
  toolErrorBg: "#FCE4E4",
  toolTitle: "#9B6700",
  toolOutput: "#2D2D2D",
  quote: "#1A5B9C",
  quoteBorder: "#6B8DB5",
  code: "#8B5E00",
  codeBlock: "#F4F4F4",
  codeBorder: "#C0C0C0",
  link: "#1A7F4B",
  error: "#C53030",
  success: "#1A7F4B",
};

/**
 * Detect whether the terminal has a light background.
 *
 * Priority:
 * 1. OPENCLAW_THEME=light|dark (explicit override)
 * 2. COLORFGBG env var (set by many terminals: "fg;bg", bg >= 8 = light)
 */
function isLightBackground(): boolean {
  const explicit = process.env.OPENCLAW_THEME?.toLowerCase();
  if (explicit === "light") {
    return true;
  }
  if (explicit === "dark") {
    return false;
  }

  // COLORFGBG is "foreground;background" using ANSI colour indices (0-15).
  // Indices 7 (white), 9-15 are typically light backgrounds.
  const colorFgBg = process.env.COLORFGBG;
  if (colorFgBg) {
    const parts = colorFgBg.split(";");
    const bgIndex = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(bgIndex) && bgIndex >= 7) {
      return true;
    }
  }

  return false;
}

const palette = isLightBackground() ? lightPalette : darkPalette;

const fg = (hex: string) => (text: string) => chalk.hex(hex)(text);
const bg = (hex: string) => (text: string) => chalk.bgHex(hex)(text);

const syntaxTheme = createSyntaxTheme(fg(palette.code));

/**
 * Highlight code with syntax coloring.
 * Returns an array of lines with ANSI escape codes.
 */
function highlightCode(code: string, lang?: string): string[] {
  try {
    // Auto-detect can be slow for very large blocks; prefer explicit language when available.
    // Check if language is supported, fall back to auto-detect
    const language = lang && supportsLanguage(lang) ? lang : undefined;
    const highlighted = highlight(code, {
      language,
      theme: syntaxTheme,
      ignoreIllegals: true,
    });
    return highlighted.split("\n");
  } catch {
    // If highlighting fails, return plain code
    return code.split("\n").map((line) => fg(palette.code)(line));
  }
}

export const theme = {
  fg: fg(palette.text),
  assistantText: (text: string) => text,
  dim: fg(palette.dim),
  accent: fg(palette.accent),
  accentSoft: fg(palette.accentSoft),
  success: fg(palette.success),
  error: fg(palette.error),
  header: (text: string) => chalk.bold(fg(palette.accent)(text)),
  system: fg(palette.systemText),
  userBg: bg(palette.userBg),
  userText: fg(palette.userText),
  toolTitle: fg(palette.toolTitle),
  toolOutput: fg(palette.toolOutput),
  toolPendingBg: bg(palette.toolPendingBg),
  toolSuccessBg: bg(palette.toolSuccessBg),
  toolErrorBg: bg(palette.toolErrorBg),
  border: fg(palette.border),
  bold: (text: string) => chalk.bold(text),
  italic: (text: string) => chalk.italic(text),
};

export const markdownTheme: MarkdownTheme = {
  heading: (text) => chalk.bold(fg(palette.accent)(text)),
  link: (text) => fg(palette.link)(text),
  linkUrl: (text) => chalk.dim(text),
  code: (text) => fg(palette.code)(text),
  codeBlock: (text) => fg(palette.code)(text),
  codeBlockBorder: (text) => fg(palette.codeBorder)(text),
  quote: (text) => fg(palette.quote)(text),
  quoteBorder: (text) => fg(palette.quoteBorder)(text),
  hr: (text) => fg(palette.border)(text),
  listBullet: (text) => fg(palette.accentSoft)(text),
  bold: (text) => chalk.bold(text),
  italic: (text) => chalk.italic(text),
  strikethrough: (text) => chalk.strikethrough(text),
  underline: (text) => chalk.underline(text),
  highlightCode,
};

const baseSelectListTheme: SelectListTheme = {
  selectedPrefix: (text) => fg(palette.accent)(text),
  selectedText: (text) => chalk.bold(fg(palette.accent)(text)),
  description: (text) => fg(palette.dim)(text),
  scrollInfo: (text) => fg(palette.dim)(text),
  noMatch: (text) => fg(palette.dim)(text),
};

export const selectListTheme: SelectListTheme = baseSelectListTheme;

export const filterableSelectListTheme = {
  ...baseSelectListTheme,
  filterLabel: (text: string) => fg(palette.dim)(text),
};

export const settingsListTheme: SettingsListTheme = {
  label: (text, selected) =>
    selected ? chalk.bold(fg(palette.accent)(text)) : fg(palette.text)(text),
  value: (text, selected) => (selected ? fg(palette.accentSoft)(text) : fg(palette.dim)(text)),
  description: (text) => fg(palette.systemText)(text),
  cursor: fg(palette.accent)("→ "),
  hint: (text) => fg(palette.dim)(text),
};

export const editorTheme: EditorTheme = {
  borderColor: (text) => fg(palette.border)(text),
  selectList: selectListTheme,
};

export const searchableSelectListTheme: SearchableSelectListTheme = {
  ...baseSelectListTheme,
  searchPrompt: (text) => fg(palette.accentSoft)(text),
  searchInput: (text) => fg(palette.text)(text),
  matchHighlight: (text) => chalk.bold(fg(palette.accent)(text)),
};
