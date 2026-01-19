# typk

A minimal CLI typing trainer built with Ink.

## Requirements

- Node.js 18+ (or a recent LTS)
- npm

## Install

```sh
npm install
```

Optional: expose the `typk` command globally:

```sh
npm link
```

## Usage

Start the typing session:

```sh
typk run
```

Use your own text:

```sh
typk run --file /path/to/text.txt
# or
npx . run --file /path/to/text.txt
```

Use a command deck (flashcards):

```sh
typk run --file inputs/commands/commands-git.js
```

Command deck files should export an array of:

```js
{
  id: 1,
  command: "git status",
  description: "Show the working tree status"
}
```

## Configuration

Create a `typk.config.json` in the directory where you run the command.

```json
{
  "maxRowChar": 40,
  "baseColor": "gray",
  "passColor": "#2ecc71",
  "missColor": "#f1c40f",
  "failColor": "#e74c3c",
  "allowDelete": true,
  "charCase": "default",
  "caseSensitive": true,
  "textAlign": "left",
  "highlightRow": true,
  "highlightRowColor": "white",
  "cursor": "underline",
  "cursorColor": "white",
  "commandsPerScreen": 1,
  "displayTooltips": true,
  "displayPauseTooltip": true
}
```

Notes:
- `maxRowChar` is clamped to 20-60.
- `charCase`: `lower`, `upper`, `default`.
- `textAlign`: `left`, `center`, `right`.
- `cursor`: `line`, `block`, `outline`, `underline`.
- `commandsPerScreen`: how many command cards are visible at once.
- `displayTooltips`: toggle the "Hit ENTER for next command" prompt.
- `displayPauseTooltip`: toggle the "Hit ESC to pause" prompt.
- Colors accept Ink color names or hex (e.g., `#ff9900`, `ff9900`, `0xff9900`).

## Stats

The stats screen shows:
- WPM and CPM as `raw/actual` (actual counts only correct characters).
- ACC as percentage of non-fails over total character attempts.
- Duration as mm:ss.

## Development

Run directly without installing:

```sh
node index.js run
```
