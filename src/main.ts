import '@fontsource-variable/inter';
import './style.css';
import { createTable, identity, joinTable, watchTable } from './backend.ts';
import { normalizeCode, replay, type LobbyEvent } from './events.ts';

const root = document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML = `
  <header><a href="./" class="brand">N / R</a><span>A little mischief after dark</span></header>
  <main>
    <p class="eyebrow">THE ABBEY IS ASLEEP. ARE YOU?</p>
    <h1>Nuns on<br>the Run<span class="dot">.</span></h1>
    <p class="intro">Secret wishes. Watchful guards. One shared table.</p>
    <section id="entry" aria-label="Find your table">
      <div class="field"><label for="player-name">Your name</label><input id="player-name" maxlength="40" autocomplete="nickname" placeholder="What should we call you?" required></div>
      <div class="choices">
        <form id="create"><h2>Gather your players</h2><p>Open a table and invite your friends.</p><label for="table-name">Table name</label><input id="table-name" maxlength="40" value="The midnight abbey" required><button disabled>Create a table <span aria-hidden="true">↗</span></button></form>
        <form id="join"><h2>Already invited?</h2><p>Take a seat at a friend's table.</p><label for="table-code">Table code</label><input id="table-code" maxlength="8" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="8-character code" required><button class="secondary" disabled>Join a table <span aria-hidden="true">→</span></button></form>
      </div>
    </section>
    <section id="lobby" hidden aria-label="Table lobby"><p class="eyebrow">YOUR TABLE</p><h2 id="lobby-name"></h2><p>Invite your friends with this table code.</p><div id="invite-code" aria-label="Invitation code"></div><button id="copy" class="secondary">Copy invite link</button><p id="copy-status" role="status"></p><h3>At the table</h3><ul id="players"></ul><p class="note">The table is open. Gameplay is coming next.</p><details><summary>Table event log</summary><pre id="events"></pre></details><a class="back" href="./">Find another table</a></section>
    <p id="status" role="status" data-state="connecting">Connecting to the abbey…</p>
    <p id="error" role="alert"></p>
  </main>
  <footer><span>A digital board game for your next game night.</span><span>LOBBY · FIRST PLAYABLE INCREMENT</span></footer>`;
const element = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
let uid = '';
let busy = false;
let stopWatching: (() => void) | undefined;
const status = element('status');
const error = element('error');
function ready(text = 'Connected · ready to play') {
  status.textContent = text;
  status.dataset.state = 'ready';
}
function showError(reason: unknown) {
  error.textContent = reason instanceof Error ? reason.message : 'Something went wrong. Please try again.';
}
function playerName() {
  const input = element<HTMLInputElement>('player-name');
  if (!input.value.trim()) { input.focus(); throw new Error('Enter your name to take a seat.'); }
  return input.value.trim();
}
function openTable(code: string) {
  stopWatching?.();
  status.textContent = 'Opening table…';
  status.dataset.state = 'connecting';
  stopWatching = watchTable(code, (events: LobbyEvent[]) => {
    const view = replay(events);
    if (!view) { showError(new Error('Table not found. Check the code and try again.')); ready(); return; }
    if (!view.players.some(player => player.uid === uid)) {
      element<HTMLInputElement>('table-code').value = code;
      ready('Table found · enter your name to join');
      return;
    }
    element('entry').hidden = true;
    element('lobby').hidden = false;
    element('lobby-name').textContent = view.name;
    element('invite-code').textContent = code;
    element('players').replaceChildren(...view.players.map(player => {
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = player.name;
      const tag = document.createElement('small');
      tag.textContent = [player.host ? 'Host' : 'Player', player.uid === uid ? 'You' : ''].filter(Boolean).join(' · ');
      li.append(label, tag);
      return li;
    }));
    element('events').textContent = JSON.stringify(events, null, 2);
    history.replaceState(null, '', `#table=${code}`);
    ready('Connected · table is up to date');
    element('copy').onclick = async () => {
      try { await navigator.clipboard.writeText(location.href); element('copy-status').textContent = 'Invite link copied.'; }
      catch { element('copy-status').textContent = 'Copy the table code above to invite a friend.'; }
    };
  }, showError);
}
async function action(work: () => Promise<string>) {
  if (busy) return;
  busy = true;
  error.textContent = '';
  document.querySelectorAll<HTMLButtonElement>('form button').forEach(button => button.disabled = true);
  try { openTable(await work()); } catch (reason) { showError(reason); }
  finally { busy = false; document.querySelectorAll<HTMLButtonElement>('form button').forEach(button => button.disabled = false); }
}
element<HTMLFormElement>('create').onsubmit = event => {
  event.preventDefault();
  void action(() => createTable(uid, playerName(), element<HTMLInputElement>('table-name').value));
};
element<HTMLFormElement>('join').onsubmit = event => {
  event.preventDefault();
  void action(() => joinTable(uid, playerName(), element<HTMLInputElement>('table-code').value));
};
async function boot() {
  try {
    uid = await identity();
    document.querySelectorAll<HTMLButtonElement>('form button').forEach(button => button.disabled = false);
    ready();
    const code = new URLSearchParams(location.hash.slice(1)).get('table');
    if (code) { element<HTMLInputElement>('table-code').value = normalizeCode(code); openTable(normalizeCode(code)); }
  } catch (reason) { showError(reason); status.textContent = 'Unable to connect. Reload to try again.'; status.dataset.state = 'error'; }
}
void boot();
