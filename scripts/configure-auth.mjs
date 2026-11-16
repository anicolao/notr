// CLI-only provisioning. Reuses Firebase CLI login without printing or storing tokens.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { getGlobalDefaultAccount, getAccessToken } = require('firebase-tools/lib/auth');
const project = process.argv[2];
if (!project || !/^[a-z][a-z0-9-]+$/.test(project)) throw new Error('Usage: node scripts/configure-auth.mjs PROJECT_ID');
const account = getGlobalDefaultAccount();
if (!account) throw new Error('Run npx firebase login first.');
const { access_token: token } = await getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
async function api(path, method = 'GET', body) {
  const response = await fetch(`https://identitytoolkit.googleapis.com${path}`, {
    method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Goog-User-Project': project },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`${method} ${path}: ${result.error?.message ?? response.status}`);
  return result;
}
const path = `/admin/v2/projects/${project}/config`;
const existing = await api(path);
if (!existing.signIn?.anonymous?.enabled) throw new Error('Run npx firebase deploy --only auth first.');
await api(`${path}?updateMask=authorizedDomains`, 'PATCH', {
  authorizedDomains: [...new Set([...(existing.authorizedDomains ?? []), 'localhost', `${project}.firebaseapp.com`, 'anicolao.github.io'])],
});
const configured = await api(path);
if (configured.signIn?.anonymous?.enabled !== true) throw new Error('Anonymous Auth verification failed.');
console.log(`Anonymous Auth enabled and verified for ${project}.`);
