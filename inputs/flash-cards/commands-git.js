const gitCommands = [
  {
    id: 1,
    command: "git init",
    description: "Initialize a new Git repository",
  },
  {
    id: 2,
    command: "git clone <url>",
    description: "Clone an existing repository",
  },
  {
    id: 3,
    command: "git add <file>",
    description: "Add file contents to the staging area",
  },
  { id: 4, command: "git status", description: "Show the working tree status" },
  {
    id: 5,
    command: "git commit",
    description: "Record changes to the repository",
  },
  {
    id: 6,
    command: "git commit -m <msg>",
    description: "Commit with a message",
  },
  { id: 7, command: "git log", description: "Show commit logs" },
  {
    id: 8,
    command: "git diff",
    description: "Show changes between commits and working tree",
  },
  {
    id: 9,
    command: "git branch",
    description: "List, create, or delete branches",
  },
  { id: 10, command: "git switch <name>", description: "Switch to a branch" },
  {
    id: 11,
    command: "git merge <branch>",
    description: "Merge specified branch into current",
  },
  {
    id: 12,
    command: "git pull",
    description: "Fetch from and integrate with a remote",
  },
  { id: 13, command: "git push", description: "Push local commits to remote" },
  {
    id: 14,
    command: "git stash",
    description: "Stash working directory changes",
  },
  {
    id: 15,
    command: "git reset",
    description: "Reset current HEAD to a specified state",
  },
  {
    id: 16,
    command: "git restore <file>",
    description: "Restore working tree files",
  },
  {
    id: 17,
    command: "git revert <commit>",
    description: "Create a new commit that undoes changes",
  },
  {
    id: 18,
    command: "git fetch",
    description: "Download objects and refs from another repository",
  },
  {
    id: 19,
    command: "git remote add <name> <url>",
    description: "Add a remote repository",
  },
  {
    id: 20,
    command: "git remote",
    description: "Manage set of tracked repositories",
  },
  {
    id: 21,
    command: "git tag",
    description: "Create, list, delete or verify tags",
  },

  /* Plumbing & auxiliary commands */
  {
    id: 22,
    command: "git cat-file",
    description: "Provide content or type information for repository objects",
  },
  {
    id: 23,
    command: "git check-ignore",
    description: "Check whether files are ignored",
  },
  {
    id: 24,
    command: "git rev-parse",
    description: "Parse revision parameters",
  },
  {
    id: 25,
    command: "git rev-list",
    description: "List commit objects in reverse chronological order",
  },
  {
    id: 26,
    command: "git ls-files",
    description: "Show information about files in the index",
  },
  {
    id: 27,
    command: "git ls-tree",
    description: "List the contents of a tree object",
  },
  {
    id: 28,
    command: "git show-ref",
    description: "List references in a local repository",
  },
  {
    id: 29,
    command: "git update-index",
    description: "Register file contents in the index",
  },
  {
    id: 30,
    command: "git read-tree",
    description: "Read tree information into the index",
  },
  {
    id: 31,
    command: "git write-tree",
    description: "Create a tree object from the index",
  },
  { id: 32, command: "git commit-tree", description: "Create a commit object" },
  {
    id: 33,
    command: "git hash-object",
    description: "Compute object ID and optionally write object",
  },
  { id: 34, command: "git prune", description: "Prune unreachable objects" },
  {
    id: 35,
    command: "git fsck",
    description: "Verify integrity of the object database",
  },
  {
    id: 36,
    command: "git unpack-objects",
    description: "Read packed objects from stdin",
  },
  {
    id: 37,
    command: "git verify-pack",
    description: "Validate a packed archive",
  },
  {
    id: 38,
    command: "git pack-objects",
    description: "Create packed archive of objects",
  },
  {
    id: 39,
    command: "git index-pack",
    description: "Create an index from a pack",
  },
];

export default gitCommands;
