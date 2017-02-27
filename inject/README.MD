# Build

* `npm run build` Builds all distributions `dist/`
* `npm run build:node` Builds node distribution in `dist/node/`
* `npm run build:web` Builds web distribution in `dist/web/`
* `npm run test` Builds and runs tests in `test/`

## Node

`tsconfig.node.json` with `"module": "commonjs"` is used to build `dist/node` distributable. 

## Web

For the web distributable [rollup.js](http://rollupjs.org) is used. *rollup.js* uses `es6` `import/export` statements to
discover dependencies. That for `tsconfig.es6.json` with `"module": "es6"` is used to compile the distributable `dist/es6`
used by *rollup.js*. *rollup.js* bundles all dependencies in a single file using `ums` module api.

## Test

`tsconfig.json` is used to build `src/main` as well as `src/test` into `test/node`. Tests are run with `jasmine`
in node.