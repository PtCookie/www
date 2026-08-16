---
title: "Node-API를 사용한 Node.js 애드온"
subtitle: "Node-API의 C++ 래퍼 node-addon-api를 사용한 애드온 구현"
brief: "지난 번에 Node.js의 Addon에 대해서 조사한 적이 있었습니다. 그 떄는 직접 node.h 헤더를 추가하고, v8 네임스페이스를 사용하여 구현하였습니다.\n하지만 이번에 다른 모듈 작업을 하다가 문서를 확인해보니,\nNode-API에 노출되지 않은 기능을 사용하지 않는다면 Node-API를 사용하라.\n(Unless there is a need for direct access to functionality which is not exposed..."
slug: "build-nodejs-addon-with-node-api"
locale: "ko"
publishedAt: "2025-08-05T00:00:00+09:00"
readTimeInMinutes: 3
tags:
  - name: "nodejs"
    slug: "nodejs"
coverImage:
  url: "../../../assets/covers/ko/build-nodejs-addon-with-node-api.jpeg"
  attribution: null
  photographer: null
---

지난 번에 Node.js의 Addon에 대해서 조사한 적이 있었습니다. 그 떄는 직접 `node.h` 헤더를 추가하고, `v8` 네임스페이스를 사용하여 구현하였습니다.

하지만 이번에 다른 모듈 작업을 하다가 문서를 확인해보니,

`Node-API에 노출되지 않은 기능을 사용하지 않는다면 Node-API를 사용하라.`
(Unless there is a need for direct access to functionality which is not exposed by Node-API, use Node-API.)

라는 내용을 확인 할 수 있었습니다. (역시 처음에는 문서를 읽는 게 중요합니다.)

그리하여 이번에 모듈 작업을 하면서는 `Node-API`에 대해 알아보고, C++ 래퍼인 `node-addon-api`를 사용하여 Addon 작업을 진행해보았습니다.

## Node-API

`Node-API`는 네이티브 애드온을 빌드하기 위한 API로, 이전에 `N-API`라고 불렸습니다. V8 등 Node.js의 JavaScript 엔진과는 독립적으로 작동하며, Node.js의 여러 버전 간에 ABI 호환성을 가지는 애드온을 빌드할 수 있습니다. 또한 Node.js의 일부로서 관리되기 때문에 안정적인 애드온을 만드는 데에 유용합니다.

`Node-API`에서 노출되는 API들은 ECMA-262 Language Specification의 개념과 동작을 따르며 다음과 같은 특성을 갖습니다.

- 모든 `Node-API` 호출은 `napi_status` 타입을 반환하며, 이는 API 호출이 성공했는지 실패했는지를 나타냅니다.
- 반환값은 출력 파라미터를 통해 반환됩니다.
- 모든 JavaScript 값은 `napi_value` 타입을 통해 추상화됩니다.
- 오류 상태 코드의 경우, `napi_get_last_error_info`를 통해 추가적인 정보를 얻을 수 있습니다.

## node-addon-api

`node-addon-api`는 `Node-API`를 호출하는 C++ 코드를 보다 효율적으로 작성하기 위한 공식 C++ 바인딩입니다. 이 래퍼는 헤더 전용 라이브러리로서 인라인 가능한 C++ API를 제공합니다. `node-addon-api`를 통해 빌드된 바이너리는 Node.js가 내보내는 `Node-API`의 C 기반 함수 심볼에 의존합니다.

`node-addon-api`와 `Node-API`를 사용한 코드를 간단하게 비교해보면,

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

`node-addon-api`를 사용하면 굉장히 간결하고 직관적으로 작성할 수 있는 것을 알 수 있습니다.

## Environment setup

이전과 마찬가지로, 빌드에는 `node-gyp`를 사용해서 빌드하도록 하겠습니다.

```sh
pnpm add -D node-gyp node-addon-api
```

`binding.gyp` 파일에도 `node-addon-api`를 사용하기 위한 설정을 추가해서 작성합니다.

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

이번에도 "Hello World"를 작성해 보겠습니다.

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

순서대로 확인해보겠습니다.

```cpp
#include <napi.h>
```

`node-addon-api`의 `napi.h` 헤더를 포함하는 부분입니다. `napi.h`만 포함시키면 되고, `Napi` 네임스페이스에서 애드온에 필요한 타입들을 사용할 수 있습니다.

다음은 메서드 구현입니다.

```cpp
Napi::String Method(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  return Napi::String::New(env, "Hello world");
}
```

직접 구현 시 v8 격리 인스턴스를 사용했던 것과 유사하게 `Napi::Env env`를 통해 실행 환경에 접근할 수 있고, `const Napi::CallbackInfo &info`를 통해 호출 시 전달되는 매개변수 및 컨텍스트 등에 접근할 수 있습니다. 또한, 반환값을 통해 실행 결과를 반환함으로써 조금 더 직관적인 코드를 작성할 수 있습니다.

마지막으로 내보내는 부분입니다.

```cpp
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "greet"),
              Napi::Function::New(env, Method));
  return exports;
}

NODE_API_MODULE(addon, Init)
```

작성한 `Method`를 `greet`라는 이름으로 바인딩하고, `NODE_API_MODULE` 매크로를 사용하여 `Init` 매서드를 내보냅니다.

이전에 직접 `node.h` 헤더와 `v8` 네임스페이스를 사용해서 작성했을때와 비교해서 유사하지만, 보다 간결하게 작성할 수 있었습니다.

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

작성한 애드온을 사용하는 방법은 이전과 동일합니다.

```sh
pnpm run node-gyp configure
pnpm run node-gyp build
```

애드온을 빌드 후,

```javascript
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const addon = require("./build/Release/Addon");

console.log(addon.greet()); // Print "Hello world"
```

JavaScript에서 호출합니다.

## Summary

이번에는 Node.js의 애드온을 빌드하기 위한 API인 `Node-API`와 C++ 래퍼인 `node-addon-api`에 대해 알아보았습니다. 이전에 직접 작성했던 애드온에 비해 간결하고 이해하기 쉬운 코드를 작성할 수 있었습니다.

부가적으로, C++이 아닌 다른 언어 바인딩 또한 존재했는데, 차후에 기회가 되면 알아보도록 하겠습니다.

## Reference

- [Node-API | Node.js Documentation](https://nodejs.org/api/n-api.html)
- [node-addon-api Documents](https://github.com/nodejs/node-addon-api/tree/main/doc)
