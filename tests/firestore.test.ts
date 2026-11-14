import { after, before, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

let env: RulesTestEnvironment;
before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-notr', firestore: {
    host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8'),
  } });
  await env.clearFirestore();
});
after(async () => { await env?.cleanup(); });
test('only valid authenticated facts can be appended; existing facts are immutable', async () => {
  const host = env.authenticatedContext('host').firestore();
  const guest = env.authenticatedContext('guest').firestore();
  const anonymous = env.unauthenticatedContext().firestore();
  const path = 'tables/TEST2345/events/created';
  const created = { type: 'TableCreated', version: 1, actor: 'host', displayName: 'Alex', tableName: 'Abbey', seed: '0'.repeat(32) };
  await assertFails(setDoc(doc(anonymous, path), created));
  await assertFails(setDoc(doc(guest, path), created));
  await assertFails(setDoc(doc(host, path), { ...created, players: [] }));
  await assertSucceeds(setDoc(doc(host, path), created));
  await assertFails(updateDoc(doc(host, path), { tableName: 'Changed' }));
  await assertFails(deleteDoc(doc(host, path)));
  await assertFails(getDoc(doc(anonymous, path)));
  await assertFails(getDocs(collection(host, 'tables')));
  const joined = { type: 'PlayerJoined', version: 1, actor: 'guest', displayName: 'Sam' };
  await assertFails(setDoc(doc(guest, 'tables/ZZZZ2345/events/join-guest'), joined));
  await assertFails(setDoc(doc(host, 'tables/TEST2345/events/join-guest'), joined));
  await assertSucceeds(setDoc(doc(guest, 'tables/TEST2345/events/join-guest'), joined));
  await assertFails(setDoc(doc(guest, 'tables/TEST2345/events/join-guest'), joined));
  await assertFails(setDoc(doc(host, 'tables/TEST2345/events/join-host'), { ...joined, actor: 'host' }));
  await assertSucceeds(getDocs(collection(guest, 'tables/TEST2345/events')));
});
