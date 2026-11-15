import assert from 'node:assert/strict';
import test from 'node:test';
import { getPlayerNameError, isDuplicatePlayerName } from '../src/playerValidation.ts';

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

test('treats composed and decomposed Unicode accents as the same player name', () => {
  const existing = [{ id: '5', name: 'José Araújo' }];
  assert.equal(isDuplicatePlayerName(existing, 'Jose\u0301 Arau\u0301jo'), true);
  assert.equal(isDuplicatePlayerName([{ id: '5', name: 'Jose\u0301 Arau\u0301jo' }], 'José Araújo'), true);
  assert.equal(isDuplicatePlayerName(existing, 'Jose\u0301 Arau\u0301jo', '5'), false);
});


test('rejects visually duplicate names with invisible separator characters', () => {
  for (const codePoint of [0x200B, 0x2060, 0xFEFF]) {
    const invisible = String.fromCodePoint(codePoint);
    assert.equal(isDuplicatePlayerName(players, `Rafa${invisible}el Santos`), true);
    assert.equal(isDuplicatePlayerName([{ id: '3', name: `Rafa${invisible}el Santos` }], 'Rafael Santos'), true);
    assert.equal(isDuplicatePlayerName(players, `Rafa${invisible}el Santos`, '1'), false);
  }
  assert.equal(isDuplicatePlayerName(players, 'Rafael Souza'), false);
});

for (const name of ['', '   ', '\t\n', '\u00a0', '\u200B', '\u2060', '\uFEFF', ' \u200B\u2060\uFEFF ']) {
  test(`requires a nonempty name after normalization: ${JSON.stringify(name)}`, () => {
    for (const editingId of [undefined, '1']) {
      assert.equal(getPlayerNameError(players, name, editingId), 'Informe o nome do jogador.');
    }
  });
}

test('the form validator rejects duplicates on create and edit using existing normalization', () => {
  for (const name of ['Rafael Santos', ' RAFAEL\u00a0 santos ', 'Rafa\u200Bel Santos']) {
    assert.equal(getPlayerNameError(players, name), 'Já existe um jogador com esse nome.');
    assert.equal(getPlayerNameError(players, name, '2'), 'Já existe um jogador com esse nome.');
    assert.equal(getPlayerNameError(players, name, '1'), null);
  }
  const accented = [{ id: '3', name: 'José Araújo' }];
  assert.equal(getPlayerNameError(accented, 'Jose\u0301 Arau\u0301jo'), 'Já existe um jogador com esse nome.');
  assert.equal(getPlayerNameError(accented, 'Jose\u0301 Arau\u0301jo', '3'), null);
});

test('inactive players still reserve their names against duplicate registration', () => {
  const inactive = [{ id: '3', name: 'Ana Maria', active: false }];
  assert.equal(getPlayerNameError(inactive, 'ANA MARIA'), 'Já existe um jogador com esse nome.');
  assert.equal(getPlayerNameError(inactive, 'Ana Maria', '3'), null);
});

test('accepts distinct names without imposing new spelling or length rules', () => {
  for (const name of ['Caio', '  João da Silva  ', 'Ana-Maria', "D’Ávila", '李明']) {
    assert.equal(getPlayerNameError(players, name), null);
    assert.equal(getPlayerNameError(players, name, '1'), null);
  }
});

test('form validation does not modify the collection or existing player data', () => {
  const existing = Object.freeze([Object.freeze({ id: '1', name: 'Ana Maria', active: false })]);
  assert.equal(getPlayerNameError(existing, ' \u200B '), 'Informe o nome do jogador.');
  assert.equal(getPlayerNameError(existing, 'ANA MARIA'), 'Já existe um jogador com esse nome.');
  assert.equal(getPlayerNameError(existing, 'Ana Maria', '1'), null);
  assert.deepEqual(existing, [{ id: '1', name: 'Ana Maria', active: false }]);
});
