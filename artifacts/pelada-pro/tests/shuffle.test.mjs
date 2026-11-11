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

test('all six permutations of three players are reachable with deterministic RNG', () => {
  const permutations = new Set();
  const choices = [0, 0.5, 0.999999];
  for (const first of choices) {
    for (const second of choices) {
      const draws = [first, second];
      let index = 0;
      const result = shufflePlayers(['a', 'b', 'c'], () => draws[index++]);
      assert.equal(index, 2, 'Fisher-Yates consumes exactly n - 1 draws');
      assert.equal(new Set(result).size, 3, 'no player is duplicated');
      permutations.add(result.join(','));
    }
  }
  assert.equal(permutations.size, 6, 'all 3! possible orders are reachable');
});
