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
