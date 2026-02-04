# typk-cli

A minimal CLI typing trainer built with Ink.

Designed for quick, on-demand sessions, it helps reinforce muscle memory while tracking performance over time to support measurable improvement.

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
# Create global symlink
npm link


# Run the command
typk run
# or with local text file
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


## Stats

```
| ------------------------ |
|          STATS           |
| ------------------------ |
| WPM              ###/### |
| CPM              ###/### |
| ACC                   #% |
| TIME               ##:## |
| ------------------------ |
|         RESULTS          |
| ------------------------ |
| PASS                   # |
| MISS                   # |
| FAIL                   # |
| ------------------------ |
|        CHAR COUNT        |
| ------------------------ |
| CHAR                   # |
| NON-CHAR               # |
| DELETE                 # |
| ------------------------ |
| TOTAL                  # |
| ------------------------ |
```

Typk tracks the following stats:

- `WPM` (words per minute): raw/actual; actual counts only correct characters.
- `CPM` (characters per minute): raw/actual; actual counts only correct characters.
- `ACC` (accuracy): percentage of non-fails over total character attempts.
- `Duration` (session length): displayed as mm:ss.
