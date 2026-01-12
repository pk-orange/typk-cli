// Detect backspace/delete keys.
export function isDeleteKey(key) {
  return Boolean(key.backspace || key.delete);
}

// Normalize key input into a typed character or null.
export function getTypedChar(input, key) {
  if (!input || input.length === 0) {
    return null;
  }

  if (key.ctrl || key.meta) {
    return null;
  }

  if (
    key.return ||
    key.escape ||
    key.tab ||
    key.upArrow ||
    key.downArrow ||
    key.leftArrow ||
    key.rightArrow
  ) {
    return null;
  }

  // Use the first character if multiple characters arrive at once.
  return input[0];
}

// Compare typed and expected characters with optional case sensitivity.
export function matchesExpected(typedChar, expectedChar, caseSensitive) {
  if (caseSensitive) {
    return typedChar === expectedChar;
  }

  return typedChar.toLowerCase() === expectedChar.toLowerCase();
}
