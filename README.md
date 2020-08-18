# drippy-is-lame
The Web-Assembly implementation of LAME for both browsers and Node.JS

## Module setup

This library is lightweight and only requires TypeScript and RequireJS typings! Run:
```
npm install
```

## Module Build

The following command will get LAME sources if not present yet and run `make` + `emcc` (see [Makefile](Makefile)), plus transpile TypeScript bindings:
```
npm run build
```

## Further information
 - Make sure your machine is ready for compilation (`build-essential` and `automake` for Linux)
 - Compilation only tested under Linux environments (more specifically Ubuntu 18.04 LTS), no guarantees of working with `MinGW` or `Cygwin` under Windows machines
 - Emscripten is required. See [Installation](https://emscripten.org/docs/getting_started/downloads.html#installation-instructions)
