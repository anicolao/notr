import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCode, replay, type LobbyEvent } from '../../src/events.ts';

test('replay is pure and independent of snapshot document order', () => {
  const created = Object.freeze({ type: 'TableCreated', version: 1, actor: 'host', displayName: 'Alex', tableName: 'Abbey', seed: '0'.repeat(32) } as const);
  const joined = Object.freeze({ type: 'PlayerJoined', version: 1, actor: 'guest', displayName: 'Sam' } as const);
  const events: readonly LobbyEvent[] = Object.freeze([joined, created]);
  assert.deepEqual(replay(events), { name: 'Abbey', players: [
    { uid: 'host', name: 'Alex', host: true }, { uid: 'guest', name: 'Sam', host: false },
  ] });
  assert.deepEqual(replay(events), replay([created, joined]));
  assert.equal(replay([]), null);
});
test('invitation normalization rejects invalid paths and ambiguous characters', () => {
  assert.equal(normalizeCode(' abcd2345 '), 'ABCD2345');
  for (const code of ['../admin', 'IIIIIIII', 'OOOOOOOO', '123', '']) assert.throws(() => normalizeCode(code));
});
