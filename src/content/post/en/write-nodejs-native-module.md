---
title: "Write Node.js native module"
subtitle: "Create Node.js native module with node-gyp."
brief: "I've worked on DLL calling in Electron previously, and I thought it might be able to call it in C++ directly without using FFI.\nThe FFI library like koffi used at the time is also a native module that calls code written in C++ from JavaScript through..."
slug: "write-nodejs-native-module"
locale: "en"
publishedAt: "2024-01-27T12:00:00+09:00"
readTimeInMinutes: 3
tags:
  - name: "nodejs"
    slug: "nodejs"
coverImage:
  url: "../../../assets/covers/en/write-nodejs-native-module.jpeg"
  attribution: "https://unsplash.com/@freestocks"
  photographer: "freestocks"
---

I've worked on DLL calling in Electron previously, and I thought it might be able to call it in C++ directly without using FFI.

The FFI library like `koffi` used at the time is also a native module that calls code written in C++ from JavaScript through binding.

So I decided to create a native module like that.

## C++ Addon

In Node.js, *Addon* is dynamically-linked shared objects written in C++.
It can be loaded as ordinary Node.js modules through `require()` function.

## Environment setup

First setup environment.

```sh
mkdir gyp-module
cd gyp-module
yarn init

yarn add -D node-gyp

# or, install globally
npm -g install node-gyp
```

Requirement of `node-gyp` can be found in [GitHub repository](https://github.com/nodejs/node-gyp).
Check python version which supported by the repository as it might cause problems depending on it.

If you have multiple versions of python installed, use the version that supported in the following way.

```sh
node-gyp <command> --python /path/to/executable/python

# or, set env variable
export npm_config_python=/path/to/executable/python

export PYTHON=/path/to/executable/python

export NODE_GYP_FORCE_PYTHON=/path/to/executable/python
```

## Hello world

Hello world is always the entry point.

```cpp
// src/addon.cc
#include <node.h>

namespace addon {

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

void Method(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();
  args.GetReturnValue().Set(
      String::NewFromUtf8(isolate, "Hello world").ToLocalChecked());
}

void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "greet", Method);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)

} // namespace addon
```

Let's check it out from the beginning.

```cpp
#include <node.h>

namespace addon {

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

...
```

Include `node.h` header to build Node.js Addon, and use types from `v8` namespace.
Of course you can use C++ types in C++ Addon, but JavaScript only understands the types from `v8` namespace, so use types from `v8` namespace.

Next create method of Addon.

```cpp
void Method(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();
  args.GetReturnValue().Set(
      String::NewFromUtf8(isolate, "Hello world").ToLocalChecked());
}
```

`v8::Isolate*`, isolated instance of V8 engine is VM used in Node.js to run JavaScript. It can be used for context access.

You can access return value of method through `args.GetReturnValue()`. Return `Hello world` string of type `v8::String`.

And export this method.

```cpp
void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "greet", Method);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
```

Method `void Method(const FunctionCallbackInfo<Value> &args)` is binded to `"greet"`, and export `void Initialize(Local<Object> exports)` using `NODE_MODULE` macro.

It is important that **Every Node.js Addon must export Initialize function**.

## Build with `node-gyp`

Before build module, write `binding.gyp` which configure build.

```python
{
  "targets": [
    {
      "target_name": "addon",
      "sources": ["src/addon.cc"]
    }
  ]
}
```

We will build one Addon setting `"target_name": "addon"`, so we'll get `addon.node`.
We build only one file this time, but when there are more files to build, add those file to `sources`.

Now everything is ready, run `node-gyp`.

```sh
yarn run node-gyp configure

# global install
node-gyp configure
```

After `configure`, you will have either `Makefile` or `vcxproj` file, and able to build.

```sh
yarn run node-gyp build

# global install
node-gyp build
```

Built Addon can be found in `build/Release/`.

```sh
# build/Release/
obj.target/
addon.node*
```

## Use addon in JavaScript

Now use Addon in JavaScript.

```javascript
const addon = require('./build/Release/addon');

console.log(addon.greet()); // Print "Hello world"
```

If you want ESM, use [createRequire](https://nodejs.org/api/module.html#module_module_createrequire_filename) to create and use `require`.

```javascript
// index.mjs
import { createRequire } from "node:module"

const addon = createRequire(import.meta.url)("./build/Release/addon.node");

console.log(addon.greet()); // Print "Hello world"
```

## Summary

This is end of glance about C++ Addon of Node.js.
I thought it would be difficult, but it wasn't that difficult i thought. Thanks to official documents and many good articles.

It will be good choise in case of performance issue.

## Reference

- [C++ addons | Node.js Documentation](https://nodejs.org/api/addons.html)
- [Can not import .node file in esm · Issue #40541 · nodejs/node](https://github.com/nodejs/node/issues/40541)
