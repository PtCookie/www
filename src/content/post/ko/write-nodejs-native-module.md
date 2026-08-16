---
title: "Node.js 네이티브 모듈 만들기"
subtitle: "node-gyp를 사용하여 Node.js 네이티브 모듈을 작성해보았습니다."
brief: "지난 번에 Electron에서 DLL을 호출하는 작업을 진행했었는데, FFI를 통하지 않고 직접 C++에서 호출할 수 있지 않을까 생각했습니다.\n당시 사용했던 koffi 같은 FFI 라이브러리도 네이티브 모듈로, C++로 작성된 코드를 바인딩을 통해 JavaScript에서 호출하는 모듈입니다.\n이와 같은 네이티브 모듈을 작성해보기로 했습니다.\nC++ Addon\nNode.js에서 Addon은 C++로 작성된 동적 라이브러리(dynamically-..."
slug: "write-nodejs-native-module"
locale: "ko"
publishedAt: "2024-01-27T12:00:00+09:00"
readTimeInMinutes: 3
tags:
  - name: "nodejs"
    slug: "nodejs"
coverImage:
  url: "../../../assets/covers/ko/write-nodejs-native-module.jpeg"
  attribution: "https://unsplash.com/@freestocks"
  photographer: "freestocks"
---

지난 번에 Electron에서 DLL을 호출하는 작업을 진행했었는데, FFI를 통하지 않고 직접 C++에서 호출할 수 있지 않을까 생각했습니다.

당시 사용했던 `koffi` 같은 FFI 라이브러리도 네이티브 모듈로, C++로 작성된 코드를 바인딩을 통해 JavaScript에서 호출하는 모듈입니다.

이와 같은 네이티브 모듈을 작성해보기로 했습니다.

## C++ Addon

Node.js에서 *Addon*은 C++로 작성된 동적 라이브러리(dynamically-linked shared objects)입니다.
`require()`를 사용하여 일반적인 Node.js 모듈과 같이 사용할 수 있습니다.

## Environment setup

우선 개발 환경을 준비합니다.

```sh
mkdir gyp-module
cd gyp-module
yarn init

yarn add -D node-gyp

# or, install globally
npm -g install node-gyp
```

`node-gyp`의 요구사항의 경우 [GitHub repository](https://github.com/nodejs/node-gyp)를 참조합니다.
python 버전에 따라 문제가 생길 수 있으니 저장소에서 지원하는 python 버전을 확인합니다.

여러 버전의 python이 설치되어 있는 경우, 아래와 같은 방법으로 지원하는 버전을 사용하도록 합니다.

```sh
node-gyp <command> --python /path/to/executable/python

# or, set env variable
export npm_config_python=/path/to/executable/python

export PYTHON=/path/to/executable/python

export NODE_GYP_FORCE_PYTHON=/path/to/executable/python
```

## Hello world

역시 처음은 Hello world로 시작합니다.

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

처음부터 확인해보도록 하겠습니다.

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

Node.js Addon 빌드를 위해 `node.h` 헤더를 포함하고, 필요한 타입들을 `v8` 네임스페이스에서 사용하도록 합니다.
C++ Addon에서는 당연히 C++ 타입들을 사용할 수 있지만, JavaScript에서는 오직 `v8` 네임스페이스의 타입만 이해할 수 있으므로, `v8` 네임스페이스의 타입을 사용합니다.

다음으로 Addon의 메서드를 작성합니다.

```cpp
void Method(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();
  args.GetReturnValue().Set(
      String::NewFromUtf8(isolate, "Hello world").ToLocalChecked());
}
```

`v8::Isolate*`은 V8 엔진의 격리된 인스턴스로, Node.js에서 JavaScript를 실행하기 위한 VM입니다. 현재 실행중인 컨텍스트에 접근하기 위해 사용할 수 있습니다.

`args.GetReturnValue()`을 통해 메서드의 반환값에 접근할 수 있습니다. `v8::String` 타입을 사용하여 문자열 `Hello world`를 반환하도록 합니다.

다음으로 작성한 메서드를 내보냅니다.

```cpp
void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "greet", Method);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
```

작성한 메서드 `void Method(const FunctionCallbackInfo<Value> &args)`를 `"greet"`로 바인딩하고, `NODE_MODULE` 매크로를 사용하여 `void Initialize(Local<Object> exports)`를 내보냅니다.

중요한 점은, **모든 Node.js Addon은 초기화 함수를 내보내야한다**는 점입니다.

## Build with `node-gyp`

빌드를 진행하기에 앞서, 빌드를 설정하기 위한 `binding.gyp` 파일을 작성합니다.

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

빌드할 Addon은 한개로, `"target_name": "addon"`으로 설정하였으므로 `addon.node`를 얻게됩니다.
이번에는 하나의 파일을 빌드하지만, 여러 파일을 빌드해야한다면 `sources`에 해당 파일을 추가해줍니다.

이제 모든 준비를 마쳤고, `node-gyp`를 실행합니다.

```sh
yarn run node-gyp configure

# global install
node-gyp configure
```

`configure`를 마치면 `Makefile` 혹은 `vcxproj` 파일이 생성되고, 빌드를 실행할 수 있습니다.

```sh
yarn run node-gyp build

# global install
node-gyp build
```

`build/Release/`를 확인하면 빌드된 Addon을 확인할 수 있습니다.

```sh
# build/Release/
obj.target/
addon.node*
```

## Use addon in JavaScript

이제 빌드한 Addon을 JavaScript에서 사용해보겠습니다.

```javascript
const addon = require('./build/Release/addon');

console.log(addon.greet()); // Print "Hello world"
```

ESM을 사용할 경우, [createRequire](https://nodejs.org/api/module.html#module_module_createrequire_filename)을 사용하여 `require`를 사용할 수 있습니다.

```javascript
// index.mjs
import { createRequire } from "node:module"

const addon = createRequire(import.meta.url)("./build/Release/addon.node");

console.log(addon.greet()); // Print "Hello world"
```

## Summary

간단하게 Node.js의 C++ Addon에 대해 알아보았습니다.
막연히 어려울 것이라고만 생각했는데, 공식 문서나 여러 자료들을 찾을 수 있어 그렇게 어렵지 않았습니다.

성능적인 이슈가 생기는 부분에서 사용해보면 좋은 선택이 될 것 같습니다.

## Reference

- [C++ addons | Node.js Documentation](https://nodejs.org/api/addons.html)
- [Can not import .node file in esm · Issue #40541 · nodejs/node](https://github.com/nodejs/node/issues/40541)
