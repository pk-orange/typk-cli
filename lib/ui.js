import React from "react";
import { Box, Text } from "ink";

import { buildPauseStatsLines, buildStatsBox } from "./stats.js";

const BORDER_COLOR = "gray";
const TITLE = "TYPK - CLI";
const INNER_PADDING_X = 4;
const INNER_PADDING_Y = 1;

export function ReadyScreen() {
  return React.createElement(Text, null, "Hit RETURN to start...");
}

export function LoadingScreen() {
  return React.createElement(Text, null, "Fetching...");
}

export function TypingScreen({
  cursorPos,
  attempts,
  successes,
  chars,
  actionLines,
  config,
}) {
  const lines = buildTypingLines({
    chars,
    cursorPos,
    attempts,
    successes,
    actionLines,
    config,
  });
  return renderLines(lines);
}

export function CommandTypingScreen({
  cursorPos,
  attempts,
  successes,
  chars,
  commands,
  activeLine,
  completedLine,
  showTooltip,
  config,
}) {
  const lines = buildCommandLines({
    chars,
    cursorPos,
    attempts,
    successes,
    commands,
    activeLine,
    completedLine,
    showTooltip,
    config,
  });

  return renderLines(lines);
}

export function PauseScreen({ stats, config }) {
  const lines = buildPauseLines({
    stats,
    config,
  });

  return renderLines(lines);
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

function renderLines(lines) {
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

function buildTypingLines({
  chars,
  cursorPos,
  attempts,
  successes,
  actionLines,
  config,
}) {
  const maxRowChar = config.maxRowChar;
  const lines = wrapChars(chars, maxRowChar);
  const currentRow = Math.floor(cursorPos / maxRowChar);
  const showPauseTooltip = config.displayPauseTooltip;
  const tooltipLines = Array.isArray(actionLines)
    ? actionLines
    : showPauseTooltip
      ? ["Hit ESC to pause"]
      : [];

  const termWidth = Number.isFinite(process.stdout.columns)
    ? process.stdout.columns
    : 80;
  const termHeight = Number.isFinite(process.stdout.rows)
    ? process.stdout.rows
    : 24;
  const innerWidth = maxRowChar + INNER_PADDING_X * 2;
  const boxWidth = innerWidth + 2;
  const boxHeight =
    lines.length + 4 + INNER_PADDING_Y * 2 + tooltipLines.length;

  const horizontalPad = Math.max(0, Math.floor((termWidth - boxWidth) / 2));
  const verticalPad = Math.max(0, Math.floor((termHeight - boxHeight) / 2));

  const output = [];

  for (let i = 0; i < verticalPad; i += 1) {
    output.push([{ text: " ".repeat(horizontalPad * 2 + boxWidth) }]);
  }

  tooltipLines.forEach((line) => {
    output.push(
      buildTooltipLine({
        text: line,
        horizontalPad,
        boxWidth,
        termWidth,
        style: { color: config.highlightRowColor, bold: true },
      }),
    );
  });

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

function buildCommandLines({
  chars,
  cursorPos,
  attempts,
  successes,
  commands,
  activeLine,
  completedLine,
  showTooltip,
  config,
}) {
  const maxRowChar = config.maxRowChar;
  const showPauseTooltip = config.displayPauseTooltip;

  const termWidth = Number.isFinite(process.stdout.columns)
    ? process.stdout.columns
    : 80;
  const termHeight = Number.isFinite(process.stdout.rows)
    ? process.stdout.rows
    : 24;
  const innerWidth = maxRowChar + INNER_PADDING_X * 2;
  const boxWidth = innerWidth + 2;
  const horizontalPad = Math.max(0, Math.floor((termWidth - boxWidth) / 2));

  const contentLines = [];
  const activeCommandIndex = 0;

  commands.forEach((command, commandIndex) => {
    const isActiveCommand = commandIndex === activeCommandIndex;

    if (isActiveCommand && activeLine === "command") {
      addTypedLines(contentLines, {
        chars,
        cursorPos,
        attempts,
        successes,
        config,
        maxRowChar,
        horizontalPad,
      });
    } else if (
      isActiveCommand &&
      completedLine &&
      completedLine.type === "command"
    ) {
      addTypedLines(contentLines, {
        chars: completedLine.chars,
        cursorPos: completedLine.chars.length,
        attempts: completedLine.attempts,
        successes: completedLine.successes,
        currentRow: -1,
        config,
        maxRowChar,
        horizontalPad,
      });
    } else {
      addStaticLines(contentLines, {
        text: command.command,
        config,
        maxRowChar,
        horizontalPad,
      });
    }

    if (isActiveCommand && activeLine === "description") {
      addTypedLines(contentLines, {
        chars,
        cursorPos,
        attempts,
        successes,
        config,
        maxRowChar,
        horizontalPad,
      });
    } else {
      addStaticLines(contentLines, {
        text: command.description,
        config,
        maxRowChar,
        horizontalPad,
      });
    }

    if (commandIndex < commands.length - 1) {
      addStaticLines(contentLines, {
        text: "",
        config,
        maxRowChar,
        horizontalPad,
      });
    }
  });

  if (showTooltip) {
    addStaticLines(contentLines, {
      text: "",
      config,
      maxRowChar,
      horizontalPad,
    });
    addStaticLines(contentLines, {
      text: "Hit ENTER for next command",
      config,
      maxRowChar,
      horizontalPad,
      style: { color: config.highlightRowColor, bold: true },
    });
  }

  const boxHeight =
    contentLines.length + 4 + INNER_PADDING_Y * 2 + (showPauseTooltip ? 1 : 0);
  const verticalPad = Math.max(0, Math.floor((termHeight - boxHeight) / 2));

  const output = [];

  for (let i = 0; i < verticalPad; i += 1) {
    output.push([{ text: " ".repeat(horizontalPad * 2 + boxWidth) }]);
  }

  if (showPauseTooltip) {
    output.push(
      buildTooltipLine({
        text: "Hit ESC to pause",
        horizontalPad,
        boxWidth,
        termWidth,
        style: { color: config.highlightRowColor, bold: true },
      }),
    );
  }

  output.push(buildBorderLine(horizontalPad, innerWidth, "-"));
  output.push(buildTitleLine(horizontalPad, innerWidth));
  output.push(buildDividerLine(horizontalPad, innerWidth));

  for (let i = 0; i < INNER_PADDING_Y; i += 1) {
    output.push(buildPaddingLine(horizontalPad, innerWidth, config));
  }

  contentLines.forEach((line) => {
    output.push(line);
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

function buildPauseLines({ stats, config }) {
  const termWidth = Number.isFinite(process.stdout.columns)
    ? process.stdout.columns
    : 80;
  const termHeight = Number.isFinite(process.stdout.rows)
    ? process.stdout.rows
    : 24;

  const contentLines = [
    "Message : PAUSED",
    "Actions : Press ENTER to resume",
    "          Press Q to quit",
  ];

  if (stats) {
    contentLines.push("");
    buildPauseStatsLines(stats).forEach((line) => contentLines.push(line));
  }

  const contentWidth =
    contentLines.reduce((max, line) => Math.max(max, line.length), 0) || 1;
  const innerWidth = contentWidth + INNER_PADDING_X * 2;
  const boxWidth = innerWidth + 2;
  const horizontalPad = Math.max(0, Math.floor((termWidth - boxWidth) / 2));
  const boxHeight = contentLines.length + 2 + INNER_PADDING_Y * 2;
  const remainingHeight = termHeight - boxHeight;
  const topPad = Math.max(0, Math.floor(remainingHeight / 2));
  const bottomPad = Math.max(0, remainingHeight - topPad);

  const output = [];

  for (let i = 0; i < topPad; i += 1) {
    output.push([{ text: " ".repeat(termWidth) }]);
  }

  output.push(
    padLineToWidth(buildBorderLine(horizontalPad, innerWidth, "-"), termWidth),
  );

  for (let i = 0; i < INNER_PADDING_Y; i += 1) {
    output.push(
      padLineToWidth(
        buildPaddingLine(horizontalPad, innerWidth, config),
        termWidth,
      ),
    );
  }

  contentLines.forEach((line) => {
    output.push(
      padLineToWidth(
        buildDialogLine({
          line,
          config,
          innerWidth,
          horizontalPad,
        }),
        termWidth,
      ),
    );
  });

  for (let i = 0; i < INNER_PADDING_Y; i += 1) {
    output.push(
      padLineToWidth(
        buildPaddingLine(horizontalPad, innerWidth, config),
        termWidth,
      ),
    );
  }

  output.push(
    padLineToWidth(buildBorderLine(horizontalPad, innerWidth, "_"), termWidth),
  );

  for (let i = 0; i < bottomPad; i += 1) {
    output.push([{ text: " ".repeat(termWidth) }]);
  }

  return output;
}

function addTypedLines(
  output,
  {
    chars,
    cursorPos,
    attempts,
    successes,
    currentRow,
    config,
    maxRowChar,
    horizontalPad,
  },
) {
  const lines = wrapChars(chars, maxRowChar);
  const resolvedRow =
    typeof currentRow === "number"
      ? currentRow
      : Math.floor(cursorPos / maxRowChar);

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
        currentRow: resolvedRow,
        horizontalPad,
      }),
    );
  });
}

function addStaticLines(
  output,
  { text, config, maxRowChar, horizontalPad, style = null },
) {
  const textChars = Array.from(text || "");
  const lines = wrapChars(textChars, maxRowChar);

  lines.forEach((lineChars) => {
    output.push(
      buildStaticLine({
        lineChars,
        config,
        maxRowChar,
        horizontalPad,
        style,
      }),
    );
  });
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

function buildTooltipLine({ text, horizontalPad, boxWidth, termWidth, style }) {
  const segments = [];
  const clipped = text.length > boxWidth ? text.slice(0, boxWidth) : text;
  const padLeft = Math.max(0, Math.floor((boxWidth - clipped.length) / 2));
  const padRight = Math.max(0, boxWidth - clipped.length - padLeft);

  addSegment(segments, " ".repeat(horizontalPad + padLeft));
  addSegment(segments, clipped, style);
  addSegment(segments, " ".repeat(padRight + horizontalPad));

  return padLineToWidth(segments, termWidth);
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

function buildStaticLine({
  lineChars,
  config,
  maxRowChar,
  horizontalPad,
  style = null,
}) {
  const segments = [];
  const align = alignLine(lineChars.length, maxRowChar, config.textAlign);
  const baseStyle = paddingStyle(config, false);
  const textStyle = {
    color: config.baseColor,
    bold: false,
    ...(style || {}),
  };

  addSegment(segments, " ".repeat(horizontalPad));
  addSegment(segments, "|", { color: BORDER_COLOR });
  addSegment(segments, " ".repeat(INNER_PADDING_X), baseStyle);
  addSegment(segments, " ".repeat(align.left), baseStyle);
  addSegment(segments, lineChars.join(""), textStyle);
  addSegment(segments, " ".repeat(align.right), baseStyle);
  addSegment(segments, " ".repeat(INNER_PADDING_X), baseStyle);
  addSegment(segments, "|", { color: BORDER_COLOR });
  addSegment(segments, " ".repeat(horizontalPad));

  return segments;
}

function buildDialogLine({ line, config, innerWidth, horizontalPad }) {
  const segments = [];
  const baseStyle = paddingStyle(config, false);
  const contentWidth = innerWidth - INNER_PADDING_X * 2;
  const clipped =
    line.length > contentWidth ? line.slice(0, contentWidth) : line;
  const padRight = Math.max(0, contentWidth - clipped.length);

  addSegment(segments, " ".repeat(horizontalPad));
  addSegment(segments, "|", { color: BORDER_COLOR });
  addSegment(segments, " ".repeat(INNER_PADDING_X), baseStyle);
  addSegment(segments, clipped, { color: config.baseColor });
  addSegment(segments, " ".repeat(padRight), baseStyle);
  addSegment(segments, " ".repeat(INNER_PADDING_X), baseStyle);
  addSegment(segments, "|", { color: BORDER_COLOR });
  addSegment(segments, " ".repeat(horizontalPad));

  return segments;
}

function padLineToWidth(segments, width) {
  const length = segments.reduce(
    (sum, segment) => sum + segment.text.length,
    0,
  );

  if (length < width) {
    addSegment(segments, " ".repeat(width - length));
  }

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
