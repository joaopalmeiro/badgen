const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const HEADER = `/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
`

const UPDATE_SNAPSHOTS = Boolean(process.env.TAP_SNAPSHOT || process.env.UPDATE_SNAPSHOTS)
const files = new Map()

function escapeTemplateLiteral(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
}

function loadSnapshotState(snapshotFile) {
  const resolvedPath = path.resolve(snapshotFile)

  if (!files.has(resolvedPath)) {
    let snapshots = {}

    if (fs.existsSync(resolvedPath)) {
      delete require.cache[resolvedPath]
      snapshots = require(resolvedPath)
    }

    files.set(resolvedPath, { resolvedPath, snapshots: { ...snapshots } })
  }

  return files.get(resolvedPath)
}

function writeSnapshotFile(snapshotFile, snapshots) {
  const content = Object.keys(snapshots)
    .sort()
    .map(key => `exports[\`${escapeTemplateLiteral(key)}\`] = \`${escapeTemplateLiteral(snapshots[key])}\`\n`)
    .join('\n')

  fs.writeFileSync(snapshotFile, `${HEADER}${content}`)
}

function formatSnapshot(value) {
  return `\n${String(value)}\n`
}

function matchSnapshot(snapshotFile, key, actual) {
  const state = loadSnapshotState(snapshotFile)
  const snapshotValue = formatSnapshot(actual)

  if (UPDATE_SNAPSHOTS) {
    state.snapshots[key] = snapshotValue
    writeSnapshotFile(state.resolvedPath, state.snapshots)
    return
  }

  assert.ok(
    Object.prototype.hasOwnProperty.call(state.snapshots, key),
    `Missing snapshot "${key}". Run TAP_SNAPSHOT=1 npm test to generate it.`
  )
  assert.equal(snapshotValue, state.snapshots[key])
}

module.exports = { matchSnapshot }
