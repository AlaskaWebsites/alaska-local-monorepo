const { execSync } = require('child_process');

try {
  const out = execSync('git diff --cached --name-only --no-renames', { encoding: 'utf8' }).trim();
  if (!out) process.exit(0);
  const files = out.split('\n').map(s => s.trim()).filter(Boolean);
  const blocked = files.filter(f => /^\.cursor(\/|$)/.test(f) || /^\.devin(\/|$)/.test(f) || /^\.windsurf(\/|$)/.test(f) || /^\.cline(\/|$)/.test(f));
  if (blocked.length) {
    console.error('\n\x1b[31mERROR: Commit blocked — tool-specific dotfiles detected in the staged changes:\x1b[0m');
    blocked.forEach(f => console.error('  - ' + f));
    console.error('\nThese files are machine/local tool configs and should not be committed.');
    console.error('Options:');
    console.error('  1) Remove from index and keep locally:  git rm --cached <file>');
    console.error('  2) Add pattern to .gitignore if not already ignored');
    console.error('\nIf you really must bypass, use `git commit --no-verify` (not recommended).\n');
    process.exit(1);
  }
  process.exit(0);
} catch (err) {
  console.error('Failed to run git to check staged files:', err.message || err);
  // Don't block commit on unexpected errors — fail open to avoid surprising users
  process.exit(0);
}
