import React, { useState } from "react";
import { useApp, useInput } from "ink";

import { applyCharCase } from "./config.js";
import { initialStats, saveStats } from "./stats.js";
import { getTypedChar, isDeleteKey, matchesExpected } from "./typing.js";
import {
  CommandTypingScreen,
  LoadingScreen,
  PauseScreen,
  ReadyScreen,
  StatsScreen,
  TypingScreen,
} from "./ui.js";

// Stateful Ink app that owns the typing session lifecycle.
export function TypkApp({ mode, chars, commands, config, apiFetcher }) {
  const { exit } = useApp();
  const isCommandMode = mode === "commands";
  const isApiMode = mode === "api";
  const initialChars = isCommandMode
    ? Array.from(commands[0]?.command ?? "")
    : isApiMode
      ? []
      : chars;
  const [screen, setScreen] = useState("ready");
  const [activeChars, setActiveChars] = useState(() => initialChars);
  const [cursorPos, setCursorPos] = useState(0);
  const [attempts, setAttempts] = useState(() =>
    Array(initialChars.length).fill(0),
  );
  const [successes, setSuccesses] = useState(() =>
    Array(initialChars.length).fill(false),
  );
  const [stats, setStats] = useState(() => initialStats());
  const [startedAt, setStartedAt] = useState(null);
  const [statusLine, setStatusLine] = useState("");
  const [pausedAt, setPausedAt] = useState(null);
  const [pausedDurationMs, setPausedDurationMs] = useState(0);
  const [commandIndex, setCommandIndex] = useState(0);
  const [commandPhase, setCommandPhase] = useState("command");
  const [awaitingNext, setAwaitingNext] = useState(false);
  const [completedLine, setCompletedLine] = useState(null);

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

    if (screen === "paused") {
      handlePausedInput(input, key);
      return;
    }

    if (screen === "stats") {
      handleStatsInput(input);
    }
  });

  function startSession() {
    if (isCommandMode) {
      setCommandIndex(0);
      setCommandPhase("command");
      setAwaitingNext(false);
      setCompletedLine(null);
      resetTypingState(Array.from(commands[0].command));
    } else if (isApiMode) {
      setAwaitingNext(false);
      setCompletedLine(null);
      setScreen("loading");
      fetchApiText();
    } else {
      resetTypingState(chars);
    }

    setStats(initialStats());
    setStartedAt(Date.now());
    setStatusLine("");
    setPausedAt(null);
    setPausedDurationMs(0);
    if (!isApiMode) {
      setScreen("typing");
    }
  }

  function handleTypingInput(input, key) {
    if (isApiMode && awaitingNext) {
      if (key.return) {
        fetchApiText();
      } else if (key.escape) {
        completeSession(stats);
      }
      return;
    }

    if (isCommandMode && awaitingNext) {
      if (key.return) {
        advanceCommand();
      }
      return;
    }

    if (key.escape) {
      pauseSession();
      return;
    }

    if (cursorPos >= activeChars.length) {
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
      const expectedChar = activeChars[cursorPos];
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

      if (nextCursor >= activeChars.length) {
        if (isCommandMode) {
          handleCommandSegmentComplete(nextStats, nextAttempts, nextSuccesses);
        } else if (isApiMode) {
          setStats(nextStats);
          setAwaitingNext(true);
        } else {
          completeSession(nextStats);
        }
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

  function handlePausedInput(input, key) {
    if (key.return) {
      resumeSession();
      return;
    }

    if (!input) {
      return;
    }

    const action = input.toLowerCase();

    if (action === "q") {
      exit();
      return;
    }
  }

  function resetTypingState(nextChars) {
    setActiveChars(nextChars);
    setCursorPos(0);
    setAttempts(Array(nextChars.length).fill(0));
    setSuccesses(Array(nextChars.length).fill(false));
  }

  function handleCommandSegmentComplete(
    nextStats,
    nextAttempts,
    nextSuccesses,
  ) {
    if (commandPhase === "command") {
      setCompletedLine({
        type: "command",
        chars: activeChars,
        attempts: nextAttempts,
        successes: nextSuccesses,
      });
      setCommandPhase("description");
      setAwaitingNext(false);
      setStats(nextStats);
      resetTypingState(Array.from(commands[commandIndex].description));
      return;
    }

    if (commandIndex >= commands.length - 1) {
      completeSession(nextStats);
      return;
    }

    setStats(nextStats);
    setAwaitingNext(true);
  }

  function advanceCommand() {
    const nextIndex = commandIndex + 1;

    if (nextIndex >= commands.length) {
      completeSession(stats);
      return;
    }

    setCommandIndex(nextIndex);
    setCommandPhase("command");
    setAwaitingNext(false);
    setCompletedLine(null);
    resetTypingState(Array.from(commands[nextIndex].command));
  }

  function pauseSession() {
    if (screen !== "typing") {
      return;
    }

    setPausedAt(Date.now());
    setScreen("paused");
  }

  function resumeSession() {
    if (pausedAt) {
      const pauseDuration = Date.now() - pausedAt;
      setPausedDurationMs((prev) => prev + pauseDuration);
      setPausedAt(null);
    }

    setScreen("typing");
  }

  function getDurationMs() {
    if (!startedAt) {
      return 0;
    }

    const now = Date.now();
    const totalPaused = pausedDurationMs + (pausedAt ? now - pausedAt : 0);
    return Math.max(0, now - startedAt - totalPaused);
  }

  async function fetchApiText() {
    if (typeof apiFetcher !== "function") {
      return;
    }

    setAwaitingNext(false);
    setScreen("loading");

    try {
      const result = await apiFetcher();
      const text = normalizeApiText(result);
      const displayText = applyCharCase(text, config.charCase);
      resetTypingState(Array.from(displayText));
      setScreen("typing");
    } catch (error) {
      const message =
        error && typeof error.message === "string"
          ? error.message
          : "Unknown error";
      completeSession(stats);
      setStatusLine(`Fetch failed: ${message}`);
    }
  }

  function normalizeApiText(result) {
    if (typeof result === "string") {
      return result;
    }

    if (result && typeof result === "object") {
      if (typeof result.text === "string") {
        return result.text;
      }
      if (typeof result.fact === "string") {
        return result.fact;
      }
      if (typeof result.value === "string") {
        return result.value;
      }
    }

    throw new Error("API files must return a string or an object with text.");
  }

  function completeSession(nextStats) {
    const durationMs = getDurationMs();
    setStats({ ...nextStats, durationMs });
    setScreen("stats");
  }

  if (screen === "ready") {
    return React.createElement(ReadyScreen);
  }

  if (screen === "loading") {
    return React.createElement(LoadingScreen);
  }

  if (screen === "typing") {
    if (isCommandMode) {
      const visibleCommands = commands.slice(
        commandIndex,
        commandIndex + config.commandsPerScreen,
      );

      return React.createElement(CommandTypingScreen, {
        cursorPos,
        attempts,
        successes,
        chars: activeChars,
        commands: visibleCommands,
        activeLine: commandPhase,
        completedLine,
        showTooltip: config.displayTooltips && awaitingNext,
        config,
      });
    }

    return React.createElement(TypingScreen, {
      cursorPos,
      attempts,
      successes,
      chars: activeChars,
      actionLines:
        isApiMode && awaitingNext
          ? ["ESC = Exit to stats", "ENTER = Fetch another"]
          : null,
      config,
    });
  }

  if (screen === "paused") {
    const pauseStats = { ...stats, durationMs: getDurationMs() };

    return React.createElement(PauseScreen, {
      stats: pauseStats,
      config,
    });
  }

  return React.createElement(StatsScreen, {
    stats,
    statusLine,
  });
}
