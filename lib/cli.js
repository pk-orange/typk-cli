// CLI helpers live here to keep the entrypoint focused on orchestration.

export function printHelp() {
  console.log("Usage:");
  console.log("  typk run [--file <path>]    Starts the program");
  console.log("");
  console.log("Options:");
  console.log("  --file, -f <path>    Use text from a file");
}

// Minimal argv parser; keep strict options to avoid ambiguous input.
export function parseArgs(rawArgs) {
  const result = {
    command: rawArgs[0],
    filePath: null,
    errors: [],
  };

  if (!result.command) {
    return result;
  }

  let index = 1;
  while (index < rawArgs.length) {
    const arg = rawArgs[index];

    if (arg === "--file" || arg === "-f") {
      const next = rawArgs[index + 1];
      if (!next) {
        result.errors.push(`Missing value for ${arg}.`);
        index += 1;
        continue;
      }
      result.filePath = next;
      index += 2;
      continue;
    }

    if (arg.startsWith("-f=")) {
      const value = arg.slice("-f=".length);
      if (!value) {
        result.errors.push("Missing value for -f.");
      } else {
        result.filePath = value;
      }
      index += 1;
      continue;
    }

    if (arg.startsWith("--file=")) {
      const value = arg.slice("--file=".length);
      if (!value) {
        result.errors.push("Missing value for --file.");
      } else {
        result.filePath = value;
      }
      index += 1;
      continue;
    }

    result.errors.push(`Unknown option: ${arg}`);
    index += 1;
  }

  return result;
}
