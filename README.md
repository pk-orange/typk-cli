# typk

A minimal CLI typing trainer built with Ink.

Nuilt to be a lightweight typing practice tool focused on learning through repetition. Designed for quick, on-demand sessions, it helps reinforce muscle memory while tracking performance over time to support measurable improvement.

## Installation

Requirements:

- Node.js 18+ (or a recent LTS)
- npm

Install dependencies:

```sh
npm install
```

Run directly with Node:

```sh
node index.js run
node index.js run --file <file_path>
```

Install globally to use the `typk` command:

```sh
npm link
typk run
typk run --file <file_path>
```

## Usage

Start a typing session:

```sh
typk run
```

Use your own text file:

```sh
typk run --file /path/to/text.txt
# or
npx . run --file /path/to/text.txt
```

## Input folders

Typk treats inputs in `inputs/` differently based on the folder:

Flash cards (`inputs/flash-cards/`):

```sh
typk run --file inputs/flash-cards/commands-git.js
```

Flash card files must export an array of:

```js
{
  id: 1,
  command: "git status",
  description: "Show the working tree status"
}
```

Fetch endpoints (`inputs/fetch/`):

```sh
typk run --file inputs/fetch/api_random_fact.js
```

Fetch files must export a function that returns a string (or an object with a
`text` field). Typk shows one item at a time. After you finish typing, press
ENTER to fetch another item or ESC to exit to stats.

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

Typk tracks the following stats:

- `WPM` (words per minute): raw/actual; actual counts only correct characters.
- `CPM` (characters per minute): raw/actual; actual counts only correct characters.
- `ACC` (accuracy): percentage of non-fails over total character attempts.
- `Duration` (session length): displayed as mm:ss.
