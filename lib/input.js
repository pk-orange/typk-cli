import path from "path";
import process from "process";
import { pathToFileURL } from "url";

import { loadTextFromFile } from "./text.js";

const COMMANDS_DIR = path.resolve(process.cwd(), "inputs", "commands");

export function isCommandsInput(filePath) {
  if (!filePath) {
    return false;
  }

  const resolvedPath = path.resolve(process.cwd(), filePath);
  const relativePath = path.relative(COMMANDS_DIR, resolvedPath);

  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

export async function loadInputFromFile(filePath) {
  if (isCommandsInput(filePath)) {
    const commands = await loadCommandsFromFile(filePath);
    return { type: "commands", commands };
  }

  return { type: "text", text: loadTextFromFile(filePath) };
}

async function loadCommandsFromFile(filePath) {
  const resolvedPath = path.resolve(process.cwd(), filePath);

  try {
    const moduleUrl = pathToFileURL(resolvedPath);
    const loadedModule = await import(moduleUrl.href);
    const commands = extractCommandArray(loadedModule);

    if (!commands) {
      throw new Error("Command files must export an array.");
    }

    validateCommands(commands);
    return commands;
  } catch (error) {
    console.error(`Failed to load commands from ${resolvedPath}: ${error.message}`);
    process.exit(1);
  }
}

function extractCommandArray(loadedModule) {
  if (Array.isArray(loadedModule.default)) {
    return loadedModule.default;
  }

  const arrayExports = Object.values(loadedModule).filter(Array.isArray);

  if (arrayExports.length === 1) {
    return arrayExports[0];
  }

  return null;
}

function validateCommands(commands) {
  if (!Array.isArray(commands) || commands.length === 0) {
    throw new Error("Command files must export a non-empty array.");
  }

  commands.forEach((command, index) => {
    if (!command || typeof command !== "object") {
      throw new Error(`Command at index ${index} must be an object.`);
    }

    if (!Number.isInteger(command.id)) {
      throw new Error(`Command at index ${index} is missing an integer id.`);
    }

    if (!isNonEmptyString(command.command)) {
      throw new Error(`Command at index ${index} is missing a command string.`);
    }

    if (!isNonEmptyString(command.description)) {
      throw new Error(
        `Command at index ${index} is missing a description string.`,
      );
    }
  });
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
