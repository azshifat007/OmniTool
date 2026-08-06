'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import CopyButton from '@/components/CopyButton';
import { useHistory } from '@/components/HistoryProvider';

const categories = [
  {
    name: 'Setup',
    icon: '[+]',
    commands: [
      { cmd: 'git init', desc: 'Initialize a new Git repository', example: 'git init' },
      { cmd: 'git clone <url>', desc: 'Clone a repository from a remote URL', example: 'git clone https://github.com/user/repo.git' },
      { cmd: 'git config', desc: 'Set configuration options', example: 'git config --global user.name "Your Name"' },
      { cmd: 'git help', desc: 'Show help for a command', example: 'git help log' },
    ],
  },
  {
    name: 'Stage',
    icon: '[+]',
    commands: [
      { cmd: 'git add <file>', desc: 'Stage a file for commit', example: 'git add index.js' },
      { cmd: 'git add .', desc: 'Stage all changes in the working tree', example: 'git add .' },
      { cmd: 'git add -p', desc: 'Stage changes interactively by hunk', example: 'git add -p' },
      { cmd: 'git rm <file>', desc: 'Remove a file from the working tree and stage the removal', example: 'git rm old.js' },
      { cmd: 'git mv <src> <dst>', desc: 'Move or rename a file and stage it', example: 'git mv a.js b.js' },
    ],
  },
  {
    name: 'Snapshot',
    icon: '[S]',
    commands: [
      { cmd: 'git commit -m "<msg>"', desc: 'Commit staged changes with a message', example: 'git commit -m "Fix login bug"' },
      { cmd: 'git commit -a -m "<msg>"', desc: 'Stage all tracked changes and commit', example: 'git commit -a -m "Refactor utils"' },
      { cmd: 'git commit --amend', desc: 'Amend the last commit (edit message or add files)', example: 'git commit --amend -m "Better message"' },
      { cmd: 'git status', desc: 'Show the working tree status', example: 'git status' },
    ],
  },
  {
    name: 'Branch & Merge',
    icon: '[B]',
    commands: [
      { cmd: 'git branch', desc: 'List local branches', example: 'git branch' },
      { cmd: 'git branch <name>', desc: 'Create a new branch', example: 'git branch feature-x' },
      { cmd: 'git branch -d <name>', desc: 'Delete a branch', example: 'git branch -d old-feature' },
      { cmd: 'git checkout <branch>', desc: 'Switch to a branch', example: 'git checkout main' },
      { cmd: 'git checkout -b <name>', desc: 'Create and switch to a new branch', example: 'git checkout -b feature-x' },
      { cmd: 'git merge <branch>', desc: 'Merge a branch into the current branch', example: 'git merge feature-x' },
      { cmd: 'git rebase <branch>', desc: 'Reapply commits on top of another branch', example: 'git rebase main' },
      { cmd: 'git tag', desc: 'List tags', example: 'git tag' },
      { cmd: 'git tag <name>', desc: 'Create a tag at current commit', example: 'git tag v1.0.0' },
    ],
  },
  {
    name: 'Inspect',
    icon: '[i]',
    commands: [
      { cmd: 'git log', desc: 'Show commit log', example: 'git log --oneline -10' },
      { cmd: 'git log --oneline', desc: 'Show compact commit log', example: 'git log --oneline --graph' },
      { cmd: 'git diff', desc: 'Show unstaged changes', example: 'git diff' },
      { cmd: 'git diff --staged', desc: 'Show staged changes', example: 'git diff --staged' },
      { cmd: 'git show <ref>', desc: 'Show details of a commit or object', example: 'git show HEAD' },
      { cmd: 'git shortlog', desc: 'Summarize git log output grouped by author', example: 'git shortlog -sn' },
      { cmd: 'git blame <file>', desc: 'Show file with line-by-line attribution', example: 'git blame app.js' },
      { cmd: 'git describe', desc: 'Describe a commit using the nearest tag', example: 'git describe --tags' },
    ],
  },
  {
    name: 'Share & Update',
    icon: '[~]',
    commands: [
      { cmd: 'git remote add <name> <url>', desc: 'Add a remote repository', example: 'git remote add origin https://github.com/user/repo.git' },
      { cmd: 'git remote -v', desc: 'List remote repositories', example: 'git remote -v' },
      { cmd: 'git push', desc: 'Push commits to the remote branch', example: 'git push origin main' },
      { cmd: 'git push --tags', desc: 'Push all tags to remote', example: 'git push --tags' },
      { cmd: 'git pull', desc: 'Fetch and merge from the remote branch', example: 'git pull origin main' },
      { cmd: 'git fetch', desc: 'Download objects and refs from remote', example: 'git fetch origin' },
    ],
  },
  {
    name: 'Rewrite',
    icon: '[~]',
    commands: [
      { cmd: 'git reset HEAD <file>', desc: 'Unstage a file', example: 'git reset HEAD index.js' },
      { cmd: 'git reset --soft HEAD~1', desc: 'Undo last commit, keep changes staged', example: 'git reset --soft HEAD~1' },
      { cmd: 'git reset --hard HEAD~1', desc: 'Undo last commit, discard changes', example: 'git reset --hard HEAD~1' },
      { cmd: 'git revert <commit>', desc: 'Revert a commit with a new commit', example: 'git revert abc123' },
      { cmd: 'git cherry-pick <commit>', desc: 'Apply a commit from another branch', example: 'git cherry-pick abc123' },
      { cmd: 'git rebase -i HEAD~3', desc: 'Interactive rebase of last 3 commits', example: 'git rebase -i HEAD~3' },
    ],
  },
  {
    name: 'Temp Commits',
    icon: '[s]',
    commands: [
      { cmd: 'git stash', desc: 'Stash working directory changes', example: 'git stash' },
      { cmd: 'git stash list', desc: 'List all stashes', example: 'git stash list' },
      { cmd: 'git stash pop', desc: 'Apply and drop the latest stash', example: 'git stash pop' },
      { cmd: 'git stash drop', desc: 'Drop the latest stash', example: 'git stash drop' },
    ],
  },
  {
    name: 'Maintenance',
    icon: '[#]',
    commands: [
      { cmd: 'git gc', desc: 'Run garbage collection to optimize the repository', example: 'git gc --aggressive' },
      { cmd: 'git prune', desc: 'Prune unreachable objects from the object database', example: 'git prune' },
      { cmd: 'git clean -fd', desc: 'Remove untracked files and directories', example: 'git clean -fd' },
      { cmd: 'git archive', desc: 'Create an archive of the repository', example: 'git archive --format=zip HEAD > repo.zip' },
      { cmd: 'git bisect', desc: 'Binary search to find the commit that introduced a bug', example: 'git bisect start' },
    ],
  },
];

export default function GitRefPage() {
  const { addEntry } = useHistory();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(categories.map(() => true));

  const toggleCategory = useCallback((idx) => {
    setExpanded(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  }, []);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text);
    addEntry('Git Reference');
  }, [addEntry]);

  const filtered = categories.map(cat => ({
    ...cat,
    commands: cat.commands.filter(c =>
      !search.trim() ||
      c.cmd.toLowerCase().includes(search.toLowerCase()) ||
      c.desc.toLowerCase().includes(search.toLowerCase()) ||
      c.example.toLowerCase().includes(search.toLowerCase())
    ),
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl text-cat-devops">[G]</span>
        <h1 className="font-heading text-2xl font-bold text-text">Git Reference</h1>
      </div>

      <GlassCard>
        <div className="p-4">
          <label className="text-xs text-text-tertiary mb-2 block">Search commands</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. commit, branch, merge..."
            className="w-full bg-surface rounded-lg px-3 py-2 text-sm font-mono text-text border border-border focus:border-primary focus:outline-none transition-colors" />
        </div>
      </GlassCard>

      <div className="mt-5 space-y-4">
        {filtered.map((cat, ci) => cat.commands.length > 0 && (
          <GlassCard key={cat.name}>
            <div className="p-4">
              <button onClick={() => toggleCategory(ci)}
                className="w-full flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-cat-devops font-bold">{cat.name}</span>
                  <span className="text-xs text-text-tertiary">({cat.commands.length})</span>
                </div>
                <span className={`text-text-tertiary text-xs transition-transform duration-200 ${expanded[ci] ? 'rotate-180' : ''}`}>
                  &#9660;
                </span>
              </button>

              {expanded[ci] && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-text-tertiary border-b border-border">
                        <th className="text-left py-2 pr-3 font-medium">Command</th>
                        <th className="text-left py-2 pr-3 font-medium hidden sm:table-cell">Description</th>
                        <th className="text-left py-2 font-medium hidden md:table-cell">Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.commands.map(({ cmd, desc, example }) => (
                        <tr key={cmd} onClick={() => handleCopy(cmd)}
                          className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-surface/50 transition-colors">
                          <td className="py-2 pr-3 text-text font-mono text-xs whitespace-nowrap">
                            <span className="text-cat-devops">$ </span>{cmd}
                          </td>
                          <td className="py-2 pr-3 text-text-secondary text-xs hidden sm:table-cell">{desc}</td>
                          <td className="py-2 text-text-tertiary text-[11px] font-mono hidden md:table-cell">{example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {filtered.every(c => c.commands.length === 0) && (
        <div className="mt-4 text-cat-text text-xs bg-cat-text/10 rounded-lg px-3 py-2 border border-cat-text/20">No matching commands found.</div>
      )}
    </motion.div>
  );
}
