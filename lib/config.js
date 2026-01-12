import fs from "fs";
import path from "path";

export const CONFIG_FILENAME = "typk.config.json";

const DEFAULT_CONFIG = {
  maxRowChar: 40,
  baseColor: "gray",
  passColor: "white",
  missColor: "yellow",
  failColor: "red",
  allowDelete: true,
  charCase: "default",
  caseSensitive: true,
  textAlign: "left",
  highlightRow: true,
  highlightRowColor: "white",
  cursor: "underline",
  cursorColor: "white",
};

const ALLOWED_CASES = new Set(["lower", "upper", "default"]);
const ALLOWED_ALIGN = new Set(["left", "center", "right"]);
const ALLOWED_CURSORS = new Set(["line", "block", "outline", "underline"]);

// Load and normalize config from the current working directory.
export function loadConfig() {
  const filePath = path.join(process.cwd(), CONFIG_FILENAME);

  if (!fs.existsSync(filePath)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const userConfig = JSON.parse(raw);
    return normalizeConfig(userConfig);
  } catch (error) {
    console.error(`Failed to read ${CONFIG_FILENAME}: ${error.message}`);
    return { ...DEFAULT_CONFIG };
  }
}

// Apply the configured casing to the display text.
export function applyCharCase(text, charCase) {
  if (charCase === "lower") {
    return text.toLowerCase();
  }

  if (charCase === "upper") {
    return text.toUpperCase();
  }

  return text;
}

function normalizeConfig(userConfig) {
  const config = { ...DEFAULT_CONFIG };

  if (Number.isFinite(userConfig.maxRowChar)) {
    const rounded = Math.round(userConfig.maxRowChar);
    config.maxRowChar = clamp(rounded, 20, 60);
  }

  const baseColor = normalizeColor(userConfig.baseColor);
  if (baseColor) {
    config.baseColor = baseColor;
  }

  const passColor = normalizeColor(userConfig.passColor);
  if (passColor) {
    config.passColor = passColor;
  }

  const missColor = normalizeColor(userConfig.missColor);
  if (missColor) {
    config.missColor = missColor;
  }

  const failColor = normalizeColor(userConfig.failColor);
  if (failColor) {
    config.failColor = failColor;
  }

  if (typeof userConfig.allowDelete === "boolean") {
    config.allowDelete = userConfig.allowDelete;
  }

  if (ALLOWED_CASES.has(userConfig.charCase)) {
    config.charCase = userConfig.charCase;
  }

  if (typeof userConfig.caseSensitive === "boolean") {
    config.caseSensitive = userConfig.caseSensitive;
  }

  if (ALLOWED_ALIGN.has(userConfig.textAlign)) {
    config.textAlign = userConfig.textAlign;
  }

  if (typeof userConfig.highlightRow === "boolean") {
    config.highlightRow = userConfig.highlightRow;
  }

  const highlightRowColor = normalizeColor(userConfig.highlightRowColor);
  if (highlightRowColor) {
    config.highlightRowColor = highlightRowColor;
  }

  if (ALLOWED_CURSORS.has(userConfig.cursor)) {
    config.cursor = userConfig.cursor;
  }

  const cursorColor = normalizeColor(userConfig.cursorColor);
  if (cursorColor) {
    config.cursorColor = cursorColor;
  }

  return config;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeColor(value) {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const trimmed = value.trim();
  const hex = extractHexColor(trimmed);

  if (hex) {
    return `#${hex.toLowerCase()}`;
  }

  return trimmed;
}

function extractHexColor(value) {
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    return isValidHex(hex) ? hex : null;
  }

  if (value.startsWith("0x") || value.startsWith("0X")) {
    const hex = value.slice(2);
    return isValidHex(hex) ? hex : null;
  }

  return isValidHex(value) ? value : null;
}

function isValidHex(value) {
  return /^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(value);
}
