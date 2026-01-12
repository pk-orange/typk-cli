import React, { useState } from "react";
import { useApp, useInput } from "ink";

import { initialStats, saveStats } from "./stats.js";
import { getTypedChar, isDeleteKey, matchesExpected } from "./typing.js";
import { ReadyScreen, StatsScreen, TypingScreen } from "./ui.js";

// Stateful Ink app that owns the typing session lifecycle.
export function TypkApp({ chars, config }) {
  const { exit } = useApp();
  const [screen, setScreen] = useState("ready");
  const [cursorPos, setCursorPos] = useState(0);
  const [attempts, setAttempts] = useState(() => Array(chars.length).fill(0));
  const [successes, setSuccesses] = useState(() =>
    Array(chars.length).fill(false),
  );
  const [stats, setStats] = useState(() => initialStats());
  const [startedAt, setStartedAt] = useState(null);
  const [statusLine, setStatusLine] = useState("");

  // Route keystrokes based on the current screen state.
  useInput((input, key) => {
    if (screen === "ready") {
      if (key.return) {
        startSession();
      }
      return;
    }

    if (screen === "typing") {
      handleTypingInput(input, key);
      return;
    }

    if (screen === "stats") {
      handleStatsInput(input);
    }
  });

  function startSession() {
    setCursorPos(0);
    setAttempts(Array(chars.length).fill(0));
    setSuccesses(Array(chars.length).fill(false));
    setStats(initialStats());
    setStartedAt(Date.now());
    setStatusLine("");
    setScreen("typing");
  }

  function handleTypingInput(input, key) {
    if (cursorPos >= chars.length) {
      return;
    }

    const nextStats = { ...stats, totalKeys: stats.totalKeys + 1 };

    if (isDeleteKey(key)) {
      nextStats.deleteKeys += 1;
      setStats(nextStats);
      if (config.allowDelete) {
        setCursorPos(Math.max(cursorPos - 1, 0));
      }
      return;
    }

    const typedChar = getTypedChar(input, key);
    if (typedChar) {
      const expectedChar = chars[cursorPos];
      const nextAttempts = [...attempts];
      const nextSuccesses = [...successes];

      nextStats.characterKeys += 1;
      nextAttempts[cursorPos] += 1;

      if (matchesExpected(typedChar, expectedChar, config.caseSensitive)) {
        nextSuccesses[cursorPos] = true;
        if (nextAttempts[cursorPos] === 1) {
          nextStats.pass += 1;
        } else {
          nextStats.miss += 1;
        }
      } else {
        nextStats.fail += 1;
      }

      const nextCursor = cursorPos + 1;
      setAttempts(nextAttempts);
      setSuccesses(nextSuccesses);
      setCursorPos(nextCursor);

      if (nextCursor >= chars.length) {
        const durationMs = startedAt ? Date.now() - startedAt : 0;
        setStats({ ...nextStats, durationMs });
        setScreen("stats");
      } else {
        setStats(nextStats);
      }

      return;
    }

    nextStats.nonCharacterKeys += 1;
    setStats(nextStats);
  }

  function handleStatsInput(input) {
    if (!input) {
      return;
    }

    const key = input.toLowerCase();

    if (key === "r") {
      setScreen("ready");
      setStatusLine("");
      return;
    }

    if (key === "q") {
      exit();
      return;
    }

    if (key === "s") {
      try {
        const savedPath = saveStats(stats);
        setStatusLine(`Saved to ${savedPath}`);
      } catch (error) {
        setStatusLine(`Save failed: ${error.message}`);
      }
    }
  }

  if (screen === "ready") {
    return React.createElement(ReadyScreen);
  }

  if (screen === "typing") {
    return React.createElement(TypingScreen, {
      cursorPos,
      attempts,
      successes,
      chars,
      config,
    });
  }

  return React.createElement(StatsScreen, {
    stats,
    statusLine,
  });
}
