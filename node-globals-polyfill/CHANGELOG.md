# @esbuild-plugins/node-globals-polyfill

## 0.2.3

### Patch Changes

-   e55946b: Fix Vite marking buffer polyfill as external

## 0.2.2

### Patch Changes

-   e8e70c9: Revert polyfill lib change

## 0.2.1

### Patch Changes

-   4af52fa: Handle duplicate globals plugin, fixes #25

## 0.2.0

### Minor Changes

-   66c7bc6: Support for latest esbuild and Vite 4, removed define property from NodeGlobalsPolyfill, replaced node polyfill lib, support for node: buildtin prefix

## 0.1.1

### Patch Changes

-   Fix base64fromByteArray call on Buffer.js

## 0.1.0

### Minor Changes

-   Added plugin interface that changes initialOptions.inject, dedupe polyfills injected

## 0.0.5

### Patch Changes

-   fb88f9a: Small fix

## 0.0.4

### Patch Changes

-   f17a368: API changes

## 0.0.3

### Patch Changes

-   cc834c6: Fix Npm Files

## 0.0.2

### Patch Changes

-   6d2dc97: Prefer unplugged to support PnP

## 0.0.1

### Patch Changes

-   Initial Release
