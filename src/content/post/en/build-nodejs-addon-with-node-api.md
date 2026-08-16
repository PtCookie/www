---
title: "Build Node.js addon with Node-API"
subtitle: "Build addon with node-addon-api, C++ wrapper module of Node-API"
brief: "Previously, I've studied about addons in Node.js. At that time, I've added node.h header directly in my source code, and implemented addon using v8 namespace.\nBut currently, while working on another modules, when I checked the document I found-\nUnles..."
slug: "build-nodejs-addon-with-node-api"
locale: "en"
publishedAt: "2025-08-05T00:00:00+09:00"
readTimeInMinutes: 4
tags:
  - name: "nodejs"
    slug: "nodejs"
coverImage:
  url: "../../../assets/covers/en/build-nodejs-addon-with-node-api.jpeg"
  attribution: null
  photographer: null
---

Previously, I've studied about addons in Node.js. At that time, I've added `node.h` header directly in my source code, and implemented addon using `v8` namespace.

But currently, while working on another modules, when I checked the document I found-

`Unless there is a need for direct access to functionality which is not exposed by Node-API, use Node-API.`

(It is alway good for your to Read The Manual first!)

So at this time I' ll study about `Node-API`, and use its C++ wrapper `node-addon-api` to create some module.

## Node-API

`Node-API`, formerly known as `N-API`, is an API for building native Addons. It is independent from JavaScript runtime of Node.js like V8, and help you to build ABI-compatible addon across various versions of Node.js. As it is maintained as part of Node.js, it also help you to build stable addon.

APIs exposed by `Node-API` are follow concepts and operations of ECMA-262 Language Specification, and have the following properties.

- All `Node-API` calls return type `napi_status`, which indicates whether call succeeded or not.
- The API's return value is passed via an out parameter.
- All JavaScript values are abstracted by `napi_value` type.
- In case of an error status code, `napi_get_last_error_info` have additional information.

## node-addon-api

`node-addon-api` is the official C++ binding that provides a more efficient way to write C++ code that calls `Node-API`. This wrapper is a header-only library that offers an inlinable C++ API. Binaries built with `node-addon-api` will depend on the symbols of the `Node-API` C-based functions exported by Node.js.

Let's compare `node-addon-api` and `Node-API` code.

```cpp
// node-addon-api (C++)
Object obj = Object::New(env);
obj["foo"] = String::New(env, "bar"); 
```

```c
// Node-API (C)
napi_status status;
napi_value object, string;
status = napi_create_object(env, &object);
if (status != napi_ok) {
  napi_throw_error(env, ...);
  return;
}

status = napi_create_string_utf8(env, "bar", NAPI_AUTO_LENGTH, &string);
if (status != napi_ok) {
  napi_throw_error(env, ...);
  return;
}

status = napi_set_named_property(env, object, "foo", string);
if (status != napi_ok) {
  napi_throw_error(env, ...);
  return;
}
```

You can write clear code with `node-addon-api`.

## Environment setup

As previously, we will use `node-gyp` to build.

```sh
pnpm add -D node-gyp node-addon-api
```

You also need to add settings to the `binding.gyp` file to use `node-addon-api`.

```python
{
  "targets": [
    {
      "target_name": "Addon",
      "sources": [
        "src/addon.cc"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ]
    }
  ]
}
```

## Hello World

Let's write "Hello World" this time as well.

```cpp
// src/addon.cc (node-addon-api)
#include <napi.h>

Napi::String Method(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  return Napi::String::New(env, "Hello world");
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "greet"),
              Napi::Function::New(env, Method));
  return exports;
}

NODE_API_MODULE(addon, Init)
```

Let's check them in order.

```cpp
#include <napi.h>
```

This part includes the `napi.h` header from `node-addon-api`. You only need to include `napi.h`, and you can use the types required for your addon from the `Napi` namespace.

The following is the method implementation.

```cpp
Napi::String Method(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  return Napi::String::New(env, "Hello world");
}
```

When implementing directly, similar to using a v8 isolated instance, you can access the execution environment through `Napi::Env env`, and access parameters and context passed during the call through `const Napi::CallbackInfo &info`. Additionally, by returning the execution result through the return value, you can write more intuitive code.

Finally, the export section.

```cpp
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "greet"),
              Napi::Function::New(env, Method));
  return exports;
}

NODE_API_MODULE(addon, Init)
```

The written `Method` is bound with the name `greet`, and the `Init` method is exported using the `NODE_API_MODULE` macro.

Compared to when it was previously written directly using the `node.h` header and `v8` namespace, it is similar but could be written more concisely.

```cpp
// src/addon.cc (previously)
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

The method for utilizing the addon created this time remains unchanged.

```sh
pnpm run node-gyp configure
pnpm run node-gyp build
```

After building the addon,

```javascript
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const addon = require("./build/Release/Addon");

console.log(addon.greet()); // Print "Hello world"
```

Invoke it from JavaScript.

## Summary

This time, I learned about `Node-API`, an API for building Node.js addons, and `node-addon-api`, its C++ wrapper. I was able to write code that was more concise and easier to understand compared to the addons I had previously written myself.

Additionally, there were other language bindings besides C++, which I will explore if the opportunity arises.

## Reference

- [Node-API | Node.js Documentation](https://nodejs.org/api/n-api.html)
- [node-addon-api Documents](https://github.com/nodejs/node-addon-api/tree/main/doc)
