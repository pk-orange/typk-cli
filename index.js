#!/usr/bin/env node
import process from "process";
import React from "react";
import { render } from "ink";

import { LOREM_TEXT } from "./lib/constants.js";
import { applyCharCase, loadConfig } from "./lib/config.js";
import { parseArgs, printHelp } from "./lib/cli.js";
import { TypkApp } from "./lib/app.js";
import { shuffleCommands } from "./lib/commands.js";
import { loadInputFromFile } from "./lib/input.js";

// Entry point: parse args first so we can exit cleanly without loading the app.
const { command, filePath, errors } = parseArgs(process.argv.slice(2));

if (errors.length > 0) {
  errors.forEach((error) => console.error(error));
  printHelp();
  process.exit(1);
}

if (!command || command === "-h" || command === "--help") {
  printHelp();
  process.exit(0);
}

if (command !== "run") {
  console.error("Unknown command.\n");
  printHelp();
  process.exit(0);
}

const config = loadConfig();
const input = filePath
  ? await loadInputFromFile(filePath)
  : { type: "text", text: LOREM_TEXT };

if (input.type === "commands") {
  const commands = shuffleCommands(input.commands).map((command) => ({
    ...command,
    command: applyCharCase(command.command, config.charCase),
    description: applyCharCase(command.description, config.charCase),
  }));

  render(React.createElement(TypkApp, { mode: "commands", commands, config }));
} else {
  const displayText = applyCharCase(input.text, config.charCase);
  const chars = Array.from(displayText);

  render(React.createElement(TypkApp, { mode: "text", chars, config }));
}
