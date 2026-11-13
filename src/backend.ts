import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, signInAnonymously } from 'firebase/auth';
import { collection, connectFirestoreEmulator, doc, getFirestore, onSnapshot, runTransaction } from 'firebase/firestore';
import config from './firebase-config.json';
import { normalizeCode, type LobbyEvent, type TableCreated } from './events.ts';

const emulator = import.meta.env.VITE_EMULATORS === 'true';
const app = initializeApp(emulator ? { apiKey: 'demo-key', projectId: 'demo-notr', authDomain: 'demo-notr.firebaseapp.com' } : config);
const auth = getAuth(app);
const db = getFirestore(app);
if (emulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}
export async function identity(): Promise<string> {
  await auth.authStateReady();
  return auth.currentUser?.uid ?? (await signInAnonymously(auth)).user.uid;
}
function entropy(bytes: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)), n => n.toString(16).padStart(2, '0')).join('');
}
function tableCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(8)), n => alphabet[n % 32]).join('');
}
function name(value: string, label: string): string {
  const result = value.trim();
  if (!result || result.length > 40) throw new Error(`${label} must be 1–40 characters.`);
  return result;
}
export async function createTable(uid: string, displayName: string, tableName: string): Promise<string> {
  const code = tableCode();
  const event: TableCreated = { type: 'TableCreated', version: 1, actor: uid,
    displayName: name(displayName, 'Your name'), tableName: name(tableName, 'Table name'), seed: entropy(16) };
  await runTransaction(db, async tx => {
    const target = doc(db, 'tables', code, 'events', 'created');
    if ((await tx.get(target)).exists()) throw new Error('That code is in use. Please try again.');
    tx.set(target, event);
  });
  return code;
}
export async function joinTable(uid: string, displayName: string, input: string): Promise<string> {
  const code = normalizeCode(input);
  const playerName = name(displayName, 'Your name');
  await runTransaction(db, async tx => {
    const created = await tx.get(doc(db, 'tables', code, 'events', 'created'));
    if (!created.exists()) throw new Error('Table not found. Check the code and try again.');
    if (created.data().actor === uid) return;
    const target = doc(db, 'tables', code, 'events', `join-${uid}`);
    if ((await tx.get(target)).exists()) return;
    tx.set(target, { type: 'PlayerJoined', version: 1, actor: uid, displayName: playerName });
  });
  return code;
}
export function watchTable(code: string, next: (events: LobbyEvent[]) => void, error: (error: Error) => void) {
  return onSnapshot(collection(db, 'tables', code, 'events'), { includeMetadataChanges: true }, snapshot => {
    // Only show committed events. Local speculative writes are not accepted decisions.
    if (!snapshot.metadata.hasPendingWrites && !snapshot.metadata.fromCache)
      next(snapshot.docs.map(entry => entry.data() as LobbyEvent));
  }, error);
}
