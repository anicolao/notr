# Firebase operations

Project: `notr-anicolao`. Firestore Standard database: `(default)`, location `nam5`. Anonymous Auth is the only sign-in method used by the client.

The Web SDK configuration in `src/firebase-config.json` is public metadata. Access is controlled by Firestore rules, not by hiding the API key. Never commit CLI login tokens, service-account keys, or emulator user exports.

Provisioning commands used for PR1:

```sh
npx firebase login
npx firebase projects:create notr-anicolao --display-name 'Nuns on the Run'
npx firebase apps:create WEB 'Nuns on the Run' --project notr-anicolao
npx firebase firestore:databases:create '(default)' --location nam5 --project notr-anicolao
npx firebase deploy --only auth,firestore --project notr-anicolao
node scripts/configure-auth.mjs notr-anicolao
```

Fetch the registered web application's SDK config with `firebase apps:sdkconfig WEB APP_ID --project notr-anicolao`. Save the JSON configuration as `src/firebase-config.json`. App IDs can be found with `firebase apps:list --project notr-anicolao`.

`firebase.json` declares `auth.providers.anonymous: true`; `firebase deploy --only auth` enables it using the [Firebase CLI provider configuration](https://firebase.google.com/docs/auth/configure-providers-cli). The checked-in command then uses the existing CLI login and the [Identity Toolkit configuration API](https://cloud.google.com/identity-platform/docs/reference/rest/v2/projects/updateConfig) to add the Pages domain and verify Anonymous Auth is enabled. Tokens stay in process memory. Existing authorized domains are preserved.

Rules deployment is an explicit operator action, independent of frontend preview publishing. PR workflows do not receive administrator credentials. Test rule changes against the emulator before deploying. Main and PR previews currently share the same public lobby backend; they contain no secret gameplay data.

Anonymous identity survives reload in the same browser/origin. Browsers on the same Pages origin share Auth storage across paths. Another device gets a separate seat; losing browser storage currently loses access to the original seat.

References: [Anonymous Auth](https://firebase.google.com/docs/auth/web/anonymous-auth), [Firestore rules](https://firebase.google.com/docs/firestore/security/rules-conditions), [transactions](https://firebase.google.com/docs/firestore/manage-data/transactions).
