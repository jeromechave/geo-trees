/*
 * Deploys the built site to the gh-pages branch.
 *
 * Unlike the previous version, this script:
 *  - builds on top of the existing gh-pages branch instead of replacing it
 *    with an orphan commit, so files uploaded directly to gh-pages
 *    (see README) are kept, and the branch history is preserved;
 *  - pushes without --force;
 *  - never touches your working copy (it works in a temporary git worktree),
 *    so uncommitted changes on master are safe.
 *
 * Usage:
 *   npm run deploy            build and deploy, keeping extra files on gh-pages
 *   npm run deploy -- --clean also remove files on gh-pages that are not in the build
 *
 * Plain CommonJS with no dependencies, so it runs on any Node version that can build the site.
 */
const { execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const BRANCH = 'gh-pages'
const REMOTE = 'origin'
const BUILD_DIR = path.resolve(__dirname, 'dist')
const clean = process.argv.includes('--clean')

const run = (cmd, args, options = {}) =>
  execFileSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32', // npm is npm.cmd on Windows
    ...options
  })

const git = (args, options = {}) =>
  execFileSync('git', args, { encoding: 'utf8', ...options }).trim()

// Lists files relative to dir, ignoring .git
const listFiles = (dir, base = dir) => {
  let files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files = files.concat(listFiles(full, base))
    else files.push(path.relative(base, full))
  }
  return files
}

let worktree

try {
  const source = git(['rev-parse', '--short', 'HEAD'])
  const dirty = git(['status', '--porcelain']) !== ''
  if (dirty) {
    console.warn('Warning: you have uncommitted changes; they will be included in the build.')
  }

  console.log('Building...')
  // webpack 4 needs the legacy OpenSSL provider on Node 17+
  const env = { ...process.env }
  const nodeMajor = Number(process.versions.node.split('.')[0])
  if (nodeMajor >= 17 && !(env.NODE_OPTIONS || '').includes('--openssl-legacy-provider')) {
    env.NODE_OPTIONS = ((env.NODE_OPTIONS || '') + ' --openssl-legacy-provider').trim()
  }
  run('npm', ['run', 'build'], { env })

  console.log('Fetching ' + BRANCH + '...')
  let remoteExists = true
  try {
    git(['fetch', REMOTE, BRANCH], { stdio: 'pipe' })
  } catch (e) {
    remoteExists = false
  }

  worktree = fs.mkdtempSync(path.join(os.tmpdir(), 'geo-trees-deploy-'))
  if (remoteExists) {
    git(['worktree', 'add', '--quiet', '--detach', worktree, REMOTE + '/' + BRANCH])
  } else {
    console.log(BRANCH + ' does not exist yet, creating it.')
    git(['worktree', 'add', '--quiet', '--detach', worktree])
    git(['checkout', '--orphan', 'gh-pages-deploy-tmp'], { cwd: worktree })
    git(['rm', '-rf', '--quiet', '.'], { cwd: worktree })
  }

  // Files on gh-pages that the build does not produce (e.g. uploaded images)
  const built = new Set(listFiles(BUILD_DIR))
  const extra = listFiles(worktree).filter(file => !built.has(file))
  if (extra.length > 0) {
    if (clean) {
      console.log('Removing ' + extra.length + ' file(s) not produced by the build (--clean):')
      extra.forEach(file => {
        console.log('  - ' + file)
        fs.rmSync(path.join(worktree, file))
      })
    } else {
      console.log('Keeping ' + extra.length + ' file(s) on ' + BRANCH + ' that are not in the build:')
      extra.forEach(file => console.log('  = ' + file))
      console.log('Add them to public/ to keep them in the repository; use --clean to remove them.')
    }
  }

  fs.cpSync(BUILD_DIR, worktree, { recursive: true })

  git(['add', '--all'], { cwd: worktree })
  const changed = git(['status', '--porcelain'], { cwd: worktree }) !== ''
  if (!changed) {
    console.log('Nothing changed, nothing to deploy.')
  } else {
    git(['commit', '--quiet', '-m', 'Deploy ' + source + (dirty ? ' (with uncommitted changes)' : '')], { cwd: worktree })
    console.log('Pushing to ' + BRANCH + '...')
    run('git', ['push', REMOTE, 'HEAD:' + BRANCH], { cwd: worktree, shell: false })
    console.log('Successfully deployed ' + source)
  }
} catch (e) {
  console.error('Error: ' + e.message)
  process.exitCode = 1
} finally {
  if (worktree) {
    try {
      git(['worktree', 'remove', '--force', worktree])
    } catch (e) {
      fs.rmSync(worktree, { recursive: true, force: true })
      try { git(['worktree', 'prune']) } catch (e2) { /* ignore */ }
    }
  }
}
