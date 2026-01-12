import fs from "fs";
import path from "path";
import process from "process";

// Read text input from a file path relative to the current working directory.
export function loadTextFromFile(filePath) {
  const resolvedPath = path.resolve(process.cwd(), filePath);

  try {
    return fs.readFileSync(resolvedPath, "utf8");
  } catch (error) {
    console.error(`Failed to read ${resolvedPath}: ${error.message}`);
    process.exit(1);
  }
}
