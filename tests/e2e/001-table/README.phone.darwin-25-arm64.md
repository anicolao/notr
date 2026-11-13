# Create and join a table

Two anonymous players share a table backed by the immutable Firestore event log.

## Find a table

![Find a table](./screenshots/phone/darwin-25-arm64/000-welcome.png)

- [x] Anonymous authentication enables creating and joining.

## Host opens the table

![Host opens the table](./screenshots/phone/darwin-25-arm64/001-created.png)

- [x] The host appears in the roster with an invitation code.

## A friend joins from a separate device

![A friend joins from a separate device](./screenshots/phone/darwin-25-arm64/002-joined.png)

- [x] The host receives the guest through the Firestore subscription.

## Reload restores the same table and seat

![Reload restores the same table and seat](./screenshots/phone/darwin-25-arm64/003-restored.png)

- [x] The original anonymous identity and both seats survive reload.
- [x] There are exactly two immutable facts; reload did not add an event.
- [x] Both browser contexts run without uncaught application errors.
