import fs from "fs";
import path from "path";

import { WIDTH } from "./constants.js";

// Initialize the stats counters for a session.
export function initialStats() {
  return {
    durationMs: 0,
    pass: 0,
    miss: 0,
    fail: 0,
    characterKeys: 0,
    nonCharacterKeys: 0,
    deleteKeys: 0,
    totalKeys: 0,
  };
}

// Format duration as mm:ss for the fixed-width stats box.
export function formatDuration(durationMs) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Build the boxed stats string.
export function buildStatsBox(stats) {
  let out = "";

  out += top();
  out += header("STATS");
  out += divider();

  out += stat("WPM", formatDualRate(calcWpm(stats), calcActualWpm(stats)));
  out += stat("CPM", formatDualRate(calcCpm(stats), calcActualCpm(stats)));
  out += stat("ACC", formatPercent(calcAccuracy(stats)));
  out += stat("TIME", formatDuration(stats.durationMs));
  out += divider();

  out += header("RESULTS");
  out += divider();
  out += stat("PASS", String(stats.pass));
  out += stat("MISS", String(stats.miss));
  out += stat("FAIL", String(stats.fail));
  out += divider();

  out += header("CHAR COUNT");
  out += divider();
  out += stat("CHAR", String(stats.characterKeys));
  out += stat("NON-CHAR", String(stats.nonCharacterKeys));
  out += stat("DELETE", String(stats.deleteKeys));
  out += divider();

  out += stat("TOTAL", String(stats.totalKeys));
  out += bottom();

  return out;
}

export function buildPauseStatsLines(stats) {
  return [
    `P: ${formatCount(stats.pass)}`,
    `M: ${formatCount(stats.miss)}`,
    `F: ${formatCount(stats.fail)}`,
    `WPM: ${formatRate(calcWpm(stats))}`,
    `CPM: ${formatRate(calcCpm(stats))}`,
  ];
}

// Append the session stats to a CSV file in the current directory.
export function saveStats(stats) {
  const filePath = path.join(process.cwd(), "typk_stats.csv");
  const needsHeader = !fs.existsSync(filePath);

  if (needsHeader) {
    fs.appendFileSync(
      filePath,
      "duration_ms,pass,miss,fail,character_keys,non_character_keys,delete_keys,total_keys\n",
    );
  }

  const rowValues = [
    stats.durationMs,
    stats.pass,
    stats.miss,
    stats.fail,
    stats.characterKeys,
    stats.nonCharacterKeys,
    stats.deleteKeys,
    stats.totalKeys,
  ];

  fs.appendFileSync(filePath, `${rowValues.join(",")}\n`);
  return filePath;
}

function top() {
  return `| ${"-".repeat(WIDTH)} |\n`;
}

function bottom() {
  return `| ${"-".repeat(WIDTH)} |\n`;
}

function divider() {
  return `| ${"".padEnd(WIDTH, "-")} |\n`;
}

function header(title) {
  const centered = centerText(title, WIDTH);
  return `| ${centered} |\n`;
}

function stat(label, value) {
  const labelWidth = 11;
  const valueWidth = WIDTH - labelWidth;
  const valueText = String(value);
  const clippedValue =
    valueText.length > valueWidth ? valueText.slice(-valueWidth) : valueText;
  const left = label.padEnd(labelWidth, " ");
  const right = clippedValue.padStart(valueWidth, " ");
  return `| ${left}${right} |\n`;
}

function calcWpm(stats) {
  return calcWpmFromChars(stats.characterKeys, stats.durationMs);
}

function calcCpm(stats) {
  return calcCpmFromChars(stats.characterKeys, stats.durationMs);
}

function calcActualWpm(stats) {
  return calcWpmFromChars(stats.pass, stats.durationMs);
}

function calcActualCpm(stats) {
  return calcCpmFromChars(stats.pass, stats.durationMs);
}

function calcWpmFromChars(charCount, durationMs) {
  const minutes = durationMs / 60000;
  if (minutes <= 0) {
    return 0;
  }

  return charCount / 5 / minutes;
}

function calcCpmFromChars(charCount, durationMs) {
  const minutes = durationMs / 60000;
  if (minutes <= 0) {
    return 0;
  }

  return charCount / minutes;
}

function formatRate(value) {
  return String(Math.round(value)).padStart(3, "0");
}

function formatCount(value) {
  return String(value).padStart(3, "-");
}

function formatDualRate(value, actualValue) {
  return `${formatRate(value)}/${formatRate(actualValue)}`;
}

function calcAccuracy(stats) {
  const total = stats.pass + stats.miss + stats.fail;
  if (total <= 0) {
    return 0;
  }

  return (stats.pass + stats.miss) / total;
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function centerText(text, width) {
  if (text.length >= width) {
    return text.slice(0, width);
  }

  const padTotal = width - text.length;
  const padLeft = Math.floor(padTotal / 2);
  const padRight = padTotal - padLeft;

  return `${" ".repeat(padLeft)}${text}${" ".repeat(padRight)}`;
}
