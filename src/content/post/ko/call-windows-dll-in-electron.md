---
title: "Electron에서 Windows DLL 호출하기"
subtitle: "외부 함수 인터페이스(FFI; Foreign Function Interface)를 사용하여 Electron에서 Windows DLL을 호출하기."
brief: "근래 회사에서 시리얼포트 입력을 받아 키보드 입력만 받는 다른 어플리케이션에 보내주는 일종의 브릿지 어플리케이션을 만들고 있었습니다. 대상 플랫폼이 오직 윈도우 뿐이어서, user32.dll을 호출해서 키보드 입력을 에뮬레이션해보기로 했습니다.\nFFI(Foreign Function Interface)\n\n외부 함수 인터페이스(FFI; Foreign Function Interface)는 한 프로그래밍 언어로 작성된 프로그램이 다른 언어로 작성된 서..."
slug: "call-windows-dll-in-electron"
locale: "ko"
publishedAt: "2023-10-29T12:00:00+09:00"
readTimeInMinutes: 4
tags:
  - name: "electron"
    slug: "electron"
  - name: "typescript"
    slug: "typescript"
coverImage:
  url: "../../../assets/covers/ko/call-windows-dll-in-electron.jpeg"
  attribution: "https://unsplash.com/@waldemarbrandt67w"
  photographer: "Waldemar"
---

근래 회사에서 시리얼포트 입력을 받아 키보드 입력만 받는 다른 어플리케이션에 보내주는 일종의 브릿지 어플리케이션을 만들고 있었습니다. 대상 플랫폼이 오직 윈도우 뿐이어서, `user32.dll`을 호출해서 키보드 입력을 에뮬레이션해보기로 했습니다.

## FFI(Foreign Function Interface)

> 외부 함수 인터페이스(FFI; Foreign Function Interface)는 한 프로그래밍 언어로 작성된 프로그램이 다른 언어로 작성된 서비스를 이용할 수 있거나 그에 따른 함수를 호출할 수 있는 구조이다.
>
> *출처:* [*위키백과*](https://ko.wikipedia.org/wiki/%EC%99%B8%EB%B6%80_%ED%95%A8%EC%88%98_%EC%9D%B8%ED%84%B0%ED%8E%98%EC%9D%B4%EC%8A%A4)

Node.js 프로세스인 Electron의 메인 프로세스에서 `user32.dll`을 호출하려면 FFI를 사용하는 게 좋을 것 같아, Node.js의 FFI 모듈을 찾아보았습니다.

### node-ffi and node-ffi-napi

FFI 모듈은 쉽게 찾을 수 있었습니다. 하지만 문제는 그 라이브러리들은 거의 방치되어 있었다는 점이었습니다.

[`node-ffi`](https://github.com/node-ffi/node-ffi)는 마지막 업데이트가 5년 전이고, [`node-ffi-napi`](https://github.com/node-ffi-napi/node-ffi-napi)는 마지막 업데이트가 2년 전이었습니다. 그만큼 안정적이다는 의미일 수도 있지만, 호환성의 문제가 발생할 수도 있다고 생각했습니다.

그럼에도 불구하고, 시도해보기로 했습니다.

```typescript
import os from 'node:os';
import ffi from 'ffi-napi';
import ref from 'ref-napi';
import import_Struct from 'ref-struct-di';
import { codes } from 'keycode';

const arch = os.arch();
const Struct = import_Struct(ref);

const Input = Struct({
  type: 'int',
  wVK: 'short',
  wScan: 'short',
  dwFlags: 'int',
  time: 'int',
  dwExtraInfo: 'int64',
});

const user32 = ffi.Library('user32', {
  SendInput: ['int', ['int', Input, 'int']],
});

const char: keyof typeof codes = 'a';
const keyCode = codes[char];

const entry = new Input();
entry.type = 1;
entry.wVK = keyCode;
entry.wScan = 0;
entry.dwFlags = 0;
entry.time = 0;
entry.dwExtraInfo = 0;

user32.SendInput(1, entry, arch === 'x64' ? 40 : 28);
```

결과는 정상 작동했습니다.

그러나 현재 프로젝트에서 사용 중인 Electron 버전(`24.8.2`)과 호환되지 않았습니다. 조사한 바에 따르면, Electron 버전 20 정도부터 호환되지 않는다고 합니다.

Electron 버전을 내리기엔 위험부담이 커서 다른 라이브러리를 찾아보기로 했습니다.

### koffi

세번째로 찾은 라이브러리는 [`koffi`](https://github.com/Koromix/koffi)였고, 사용 중인 Electron에서 정상적으로 작동했습니다.

`koffi`에서 FFI 함수를 호출하는 방법은 아래와 같습니다.

```typescript
import * as koffi from 'koffi';

const user32 = koffi.load('user32.dll');

const SendInput = user32.stdcall('SendInput', 'int', ['int', Input, 'int']);
```

이제 DLL을 호출하는 방법은 알았고, 키보드 입력을 에뮬레이션 하는 방법을 찾아보았습니다. 마침 `node-ffi-napi`를 사용한 [좋은 구현](https://stackoverflow.com/questions/41350341/using-sendinput-in-node-ffi)이 있어, TypeScript로 리펙토링해서 차용했습니다.

```typescript
// lib/ffi.ts
import os from 'node:os';
import * as koffi from 'koffi';

const arch = os.arch();

const Input = koffi.struct('Input', {
  type: 'int',
  wVK: 'short',
  wScan: 'short',
  dwFlags: 'int',
  time: 'int',
  dwExtraInfo: 'int64',
});

const user32 = koffi.load('user32.dll');
const SendInput = user32.stdcall('SendInput', 'int', ['int', Input, 'int']);
const MapVirtualKeyExA = user32.stdcall('MapVirtualKeyExA', 'uint', ['uint', 'uint', 'int']);

const extendedKeyPrefix = 0xe000;
const INPUT_KEYBOARD = 1;
const KEYEVENTF_EXTENDEDKEY = 0x0001;
const KEYEVENTF_KEYUP = 0x0002;
const KEYEVENTF_SCANCODE = 0x0008;

export class KeyToggle_Options {
  asScanCode = true;
  keyCodeIsScanCode = false;
  flags?: number;
  async = false;
}

const entry: Record<string, number> = {};
entry.type = INPUT_KEYBOARD;
entry.time = 0;
entry.dwExtraInfo = 0;

export function ConvertKeyCodeToScanCode(keyCode: number) {
  return MapVirtualKeyExA(keyCode, 0, 0);
}

export function KeyToggle(
  keyCode: number,
  type: 'down' | 'up' = 'down',
  options?: Partial<KeyToggle_Options>,
): Promise<number> | number {
  const opt: KeyToggle_Options = { ...new KeyToggle_Options(), ...options };

  if (opt.asScanCode) {
    // scan-code approach (default)
    const scanCode = opt.keyCodeIsScanCode ? keyCode : ConvertKeyCodeToScanCode(keyCode);
    const isExtendedKey = (scanCode & extendedKeyPrefix) == extendedKeyPrefix;

    entry.dwFlags = KEYEVENTF_SCANCODE;
    if (isExtendedKey) {
      entry.dwFlags |= KEYEVENTF_EXTENDEDKEY;
    }

    entry.wVK = 0;
    entry.wScan = isExtendedKey ? scanCode - extendedKeyPrefix : scanCode;
  } else {
    // (virtual) key-code approach
    entry.dwFlags = 0;
    entry.wVK = keyCode;
    entry.wScan = 0;
  }

  if (opt.flags != null) {
    entry.dwFlags = opt.flags;
  }

  if (type == 'up') {
    entry.dwFlags |= KEYEVENTF_KEYUP;
  }

  if (opt.async) {
    return new Promise((resolve, reject) => {
      SendInput.async(1, entry, arch === 'x64' ? 40 : 28, (error: Error, result: number) => {
        if (error) reject(error);
        resolve(result);
      });
    });
  }

  return SendInput(1, entry, arch === 'x64' ? 40 : 28);
}

export function KeyTap(keyCode: number, opt?: Partial<KeyToggle_Options>) {
  KeyToggle(keyCode, 'down', opt);
  KeyToggle(keyCode, 'up', opt);
}
```

이제 해당 함수를 Electron의 메인 프로세스에서 호출하도록 하였습니다.

```typescript
// app.ts
import { SerialPort } from 'serialport';
import { codes } from 'keycode';
import { KeyTap } from './lib/ffi';
...

const serialInput = new SerialPort(...);
serialInput.on('data', (chunk: Buffer) => {
  const data = chunk.toString('ascii');
  const dataArray = data.toLowerCase().split('');

  for (const char of dataArray) {
    KeyTap(codes[char as keyof typeof codes]);
  }
...
});
```

시리얼 포트로 들어오는 입력을 ASCII 인코딩 후 한 글자씩 잘라, 해당 글자의 키코드로 변환 후 키보드 입력 에뮬레이션을 진행하도록 하였습니다.

테스트 결과, 정상 작동하는 것을 확인했습니다.

## Summary

그동안 FFI라는 개념은 알고 있었는데, 실제로 사용해본 것은 이번이 처음이었습니다.

다른 언어로 작성된 함수를 사용할 수 있다는 점에서 확장성이 높아 보이고, 차후 네이티브 모듈 쪽도 다뤄볼 기회가 있으면 좋겠습니다.
