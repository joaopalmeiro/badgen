const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { calcWidth } = require('../dist')
const { matchSnapshot } = require('./snapshot')

const snapshotFile = path.join(__dirname, '..', 'tap-snapshots', 'test', 'calc-width.spec.js.test.cjs')
const snapshotKey = name => `test/calc-width.spec.js TAP ${name} > result is correct 1`

test('basic functions', () => {
  assert.equal(typeof calcWidth, 'function')
  assert.equal(Number.isFinite(calcWidth('')), true)
  assert.equal(calcWidth(''), 0)
})

test('calc width for "npm"', () => {
  matchSnapshot(snapshotFile, snapshotKey('calc width for "npm"'), calcWidth('npm'))
})

test('calc width for unicode', () => {
  matchSnapshot(snapshotFile, snapshotKey('calc width for unicode'), calcWidth('壹佰贰拾叁'))
})

test('calc width for special chars', () => {
  matchSnapshot(snapshotFile, snapshotKey('calc width for special chars'), calcWidth('<{[(&)]}>'))
})

test('calc width for accented characters', () => {
  assert.equal(calcWidth('i'), calcWidth('ï'))
  assert.equal(calcWidth('e'), calcWidth('é'))
  assert.equal(calcWidth('s'), calcWidth('ṣ'))
})

test('calc width for emojis', () => {
  matchSnapshot(snapshotFile, snapshotKey('calc width for emojis'), calcWidth('💩🤱🦄'))
})
