import React from "react";
import { Box, Text } from "ink";

import { buildStatsBox } from "./stats.js";

const BORDER_COLOR = "gray";
const TITLE = "TYPK - CLI";
const INNER_PADDING_X = 4;
const INNER_PADDING_Y = 1;

export function ReadyScreen() {
  return React.createElement(Text, null, "Hit RETURN to start...");
}

export function TypingScreen({
  cursorPos,
  attempts,
  successes,
  chars,
  config,
}) {
  const lines = buildTypingLines({
    chars,
    cursorPos,
    attempts,
    successes,
    config,
  });

  const children = lines.map((line, lineIndex) =>
    React.createElement(
      Text,
      { key: `line-${lineIndex}` },
      line.map((segment, segmentIndex) =>
        React.createElement(
          Text,
          {
            key: `seg-${lineIndex}-${segmentIndex}`,
            color: segment.color,
            backgroundColor: segment.backgroundColor,
            bold: segment.bold,
            underline: segment.underline,
            inverse: segment.inverse,
          },
          segment.text,
        ),
      ),
    ),
  );

  return React.createElement(Box, { flexDirection: "column" }, children);
}

export function StatsScreen({ stats, statusLine }) {
  const box = buildStatsBox(stats);
  const lines = [
    box.trimEnd(),
    "",
    "ACTIONS (press key to execute)",
    " R = Retry",
    " S = Save",
    " Q = Quit",
  ];

  if (statusLine) {
    lines.push("", statusLine);
  }

  return React.createElement(Text, null, lines.join("\n"));
}

function buildTypingLines({ chars, cursorPos, attempts, successes, config }) {
  const maxRowChar = config.maxRowChar;
  const lines = wrapChars(chars, maxRowChar);
  const currentRow = Math.floor(cursorPos / maxRowChar);

  const termWidth = Number.isFinite(process.stdout.columns)
    ? process.stdout.columns
    : 80;
  const termHeight = Number.isFinite(process.stdout.rows)
    ? process.stdout.rows
    : 24;
  const innerWidth = maxRowChar + INNER_PADDING_X * 2;
  const boxWidth = innerWidth + 2;
  const boxHeight = lines.length + 4 + INNER_PADDING_Y * 2;

  const horizontalPad = Math.max(0, Math.floor((termWidth - boxWidth) / 2));
  const verticalPad = Math.max(0, Math.floor((termHeight - boxHeight) / 2));

  const output = [];

  for (let i = 0; i < verticalPad; i += 1) {
    output.push([{ text: " ".repeat(horizontalPad * 2 + boxWidth) }]);
  }

  output.push(buildBorderLine(horizontalPad, innerWidth, "-"));
  output.push(buildTitleLine(horizontalPad, innerWidth));
  output.push(buildDividerLine(horizontalPad, innerWidth));

  for (let i = 0; i < INNER_PADDING_Y; i += 1) {
    output.push(buildPaddingLine(horizontalPad, innerWidth, config));
  }

  lines.forEach((lineChars, rowIndex) => {
    output.push(
      buildContentLine({
        lineChars,
        rowIndex,
        cursorPos,
        attempts,
        successes,
        config,
        maxRowChar,
        currentRow,
        horizontalPad,
      }),
    );
  });

  for (let i = 0; i < INNER_PADDING_Y; i += 1) {
    output.push(buildPaddingLine(horizontalPad, innerWidth, config));
  }

  output.push(buildBorderLine(horizontalPad, innerWidth, "_"));

  for (let i = 0; i < verticalPad; i += 1) {
    output.push([{ text: " ".repeat(horizontalPad * 2 + boxWidth) }]);
  }

  return output;
}

function wrapChars(chars, maxRowChar) {
  const lines = [];
  for (let index = 0; index < chars.length; index += maxRowChar) {
    lines.push(chars.slice(index, index + maxRowChar));
  }

  if (lines.length === 0) {
    lines.push([]);
  }

  return lines;
}

function buildBorderLine(horizontalPad, innerWidth, borderChar) {
  const segments = [];
  addSegment(segments, " ".repeat(horizontalPad));
  addSegment(segments, "|", { color: BORDER_COLOR });
  addSegment(segments, borderChar.repeat(innerWidth));
  addSegment(segments, "|", { color: BORDER_COLOR });
  addSegment(segments, " ".repeat(horizontalPad));
  return segments;
}

function buildPaddingLine(horizontalPad, innerWidth, config) {
  const segments = [];
  const baseStyle = paddingStyle(config, false);

  addSegment(segments, " ".repeat(horizontalPad));
  addSegment(segments, "|", { color: BORDER_COLOR });
  addSegment(segments, " ".repeat(innerWidth), baseStyle);
  addSegment(segments, "|", { color: BORDER_COLOR });
  addSegment(segments, " ".repeat(horizontalPad));

  return segments;
}

function buildDividerLine(horizontalPad, innerWidth) {
  return buildBorderLine(horizontalPad, innerWidth, "-");
}

function buildTitleLine(horizontalPad, innerWidth) {
  const segments = [];
  const title = centerText(TITLE, innerWidth);

  addSegment(segments, " ".repeat(horizontalPad));
  addSegment(segments, "|", { color: BORDER_COLOR });
  addSegment(segments, title);
  addSegment(segments, "|", { color: BORDER_COLOR });
  addSegment(segments, " ".repeat(horizontalPad));

  return segments;
}

function buildContentLine({
  lineChars,
  rowIndex,
  cursorPos,
  attempts,
  successes,
  config,
  maxRowChar,
  currentRow,
  horizontalPad,
}) {
  const segments = [];
  const align = alignLine(lineChars.length, maxRowChar, config.textAlign);
  const isCurrentRow = config.highlightRow && rowIndex === currentRow;
  const baseStyle = paddingStyle(config, isCurrentRow);

  addSegment(segments, " ".repeat(horizontalPad));
  addSegment(segments, "|", { color: BORDER_COLOR });
  addSegment(segments, " ".repeat(INNER_PADDING_X), baseStyle);
  addSegment(segments, " ".repeat(align.left), baseStyle);

  for (let col = 0; col < lineChars.length; col += 1) {
    const index = rowIndex * maxRowChar + col;
    const style = charStyle({
      index,
      cursorPos,
      attempts,
      successes,
      config,
      isCurrentRow,
    });
    addSegment(segments, lineChars[col], style);
  }

  addSegment(segments, " ".repeat(align.right), baseStyle);
  addSegment(segments, " ".repeat(INNER_PADDING_X), baseStyle);
  addSegment(segments, "|", { color: BORDER_COLOR });
  addSegment(segments, " ".repeat(horizontalPad));

  return segments;
}

function alignLine(lineLength, maxRowChar, textAlign) {
  const remaining = Math.max(0, maxRowChar - lineLength);

  if (textAlign === "right") {
    return { left: remaining, right: 0 };
  }

  if (textAlign === "center") {
    const left = Math.floor(remaining / 2);
    return { left, right: remaining - left };
  }

  return { left: 0, right: remaining };
}

function charStyle({
  index,
  cursorPos,
  attempts,
  successes,
  config,
  isCurrentRow,
}) {
  const hasAttempt = attempts[index] > 0;
  const isUntyped = index >= cursorPos || !hasAttempt;

  let color = config.baseColor;
  let bold = false;

  if (!isUntyped) {
    if (successes[index]) {
      if (attempts[index] === 1) {
        color = config.passColor;
        bold = true;
      } else {
        color = config.missColor;
      }
    } else {
      color = config.failColor;
    }
  }

  if (config.highlightRow && isCurrentRow && isUntyped) {
    color = config.highlightRowColor;
    bold = true;
  }

  let style = { color, bold };

  if (index === cursorPos) {
    style = applyCursorStyle(style, config);
  }

  return style;
}

function paddingStyle(config, isCurrentRow) {
  if (config.highlightRow && isCurrentRow) {
    return { color: config.highlightRowColor, bold: true };
  }

  return { color: config.baseColor, bold: false };
}

function applyCursorStyle(style, config) {
  const cursorColor = config.cursorColor || style.color;

  if (config.cursor === "block") {
    return {
      ...style,
      backgroundColor: cursorColor,
    };
  }

  if (config.cursor === "outline") {
    return {
      ...style,
      color: cursorColor,
      inverse: true,
    };
  }

  if (config.cursor === "line") {
    return {
      ...style,
      color: cursorColor,
      underline: true,
    };
  }

  return {
    ...style,
    color: cursorColor,
    underline: true,
  };
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

function addSegment(segments, text, style = {}) {
  if (!text) {
    return;
  }

  const previous = segments[segments.length - 1];
  if (previous && sameStyle(previous, style)) {
    previous.text += text;
    return;
  }

  segments.push({ text, ...style });
}

function sameStyle(a, b) {
  return (
    a.color === b.color &&
    a.backgroundColor === b.backgroundColor &&
    a.bold === b.bold &&
    a.underline === b.underline &&
    a.inverse === b.inverse
  );
}
