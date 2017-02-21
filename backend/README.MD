# Setup

## SockJS

* `npm install --save sockjs`
* `npm install --save-dev @types/sockjs-node`

Since the types and the library aren't in the same directory for IntelliJ to find it the following fix is needed.
Add `"types": "../@types/sockjs-node/index.d.ts"` to `node_modules/sockjs/package.json`.