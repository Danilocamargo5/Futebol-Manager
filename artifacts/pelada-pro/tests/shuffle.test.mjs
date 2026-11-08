import assert from 'node:assert/strict';
import test from 'node:test';
import { shufflePlayers } from '../src/shuffle.ts';

test('preserves every player exactly once and does not mutate input', () => {
  const input = Object.freeze(['a', 'b', 'c', 'd']);
  const result = shufflePlayers(input, () => 0);
  assert.deepEqual(result, ['b', 'c', 'd', 'a']);
  assert.deepEqual(input, ['a', 'b', 'c', 'd']);
});

test('deterministic injected RNG produces repeatable results', () => {
  assert.deepEqual(shufflePlayers([1, 2, 3], () => 0.99), [1, 2, 3]);
  assert.deepEqual(shufflePlayers([1, 2, 3], () => 0.99), [1, 2, 3]);
});

test('handles empty and singleton lists', () => {
  assert.deepEqual(shufflePlayers([], () => 0), []);
  assert.deepEqual(shufflePlayers(['a'], () => 0), ['a']);
});

test('rejects invalid RNG values', () => {
  for (const value of [-0.1, 1, Number.NaN, Infinity]) {
    assert.throws(() => shufflePlayers([1, 2], () => value), RangeError);
  }
});
