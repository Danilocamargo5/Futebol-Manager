import assert from 'node:assert/strict';
import test from 'node:test';
import { isDuplicatePlayerName } from '../src/playerValidation.ts';

const players = [
  { id: '1', name: 'Rafael Santos' },
  { id: '2', name: 'Bruno Lima' },
];

test('rejects a repeated full name ignoring case and extra spaces', () => {
  assert.equal(isDuplicatePlayerName(players, '  RAFAEL   santos '), true);
});

test('allows new distinct names and empty input (required field handles empty)', () => {
  assert.equal(isDuplicatePlayerName(players, 'Caio Souza'), false);
  assert.equal(isDuplicatePlayerName(players, '  '), false);
});

test('allows editing the same player without renaming', () => {
  assert.equal(isDuplicatePlayerName(players, 'rafael santos', '1'), false);
});

test('rejects changing a player name to another existing player name', () => {
  assert.equal(isDuplicatePlayerName(players, 'Bruno Lima', '1'), true);
});

test('handles accented case and non-breaking whitespace in Brazilian names', () => {
  const existing = [{ id: '3', name: 'João da Silva' }];
  assert.equal(isDuplicatePlayerName(existing, ' JOÃO\u00a0DA   SILVA '), true);
  assert.equal(isDuplicatePlayerName(existing, 'João da Silva', '3'), false);
});

test('does not mutate the player collection during validation', () => {
  const existing = Object.freeze([Object.freeze({ id: '4', name: 'Ana Maria' })]);
  assert.equal(isDuplicatePlayerName(existing, 'ANA MARIA'), true);
  assert.deepEqual(existing, [{ id: '4', name: 'Ana Maria' }]);
});
