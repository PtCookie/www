---
title: "Call Windows DLL in Electron"
subtitle: "Call Windows DLL in Electron, through FFI(Foreign Function Interface)."
brief: "I have made some kind of bridge application these days at work, which receives input from serialport and send it to other application which only receives keyboard input. I decide to call user32.dll to emulate keyboard input, as target platform of thi..."
slug: "call-windows-dll-in-electron"
locale: "en"
publishedAt: "2023-10-29T12:00:00+09:00"
readTimeInMinutes: 4
tags:
  - name: "electron"
    slug: "electron"
  - name: "typescript"
    slug: "typescript"
coverImage:
  url: "../../../assets/covers/en/call-windows-dll-in-electron.jpeg"
  attribution: "https://unsplash.com/@waldemarbrandt67w"
  photographer: "Waldemar"
---

I have made some kind of bridge application these days at work, which receives input from serialport and send it to other application which only receives keyboard input. I decide to call `user32.dll` to emulate keyboard input, as target platform of this application is only Windows.

## FFI(Foreign Function Interface)

> A foreign function interface (FFI) is a mechanism by which a program written in one programming language can call routines or make use of services written or compiled in another one.
>
> *from* [*wikipedia*](https://en.wikipedia.org/wiki/Foreign_function_interface)

It seems would be better to use FFI to call `user32.dll` from Electron main process, so I looked for FFI module of Node.js.

### node-ffi and node-ffi-napi

It is easy to find FFI module. But problem is that those libraries seems abandoned.

[`node-ffi`](https://github.com/node-ffi/node-ffi) was updated 5 years ago, and [`node-ffi-napi`](https://github.com/node-ffi-napi/node-ffi-napi) was updated 2 years ago. This may means it is stable, but it may occurs compatibility issues.

Nevertheless, I give it a try.

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

It works as intended.

But it is not compatible with Electron version(`24.8.2`) my project uses. I found out that Electron version above 20 is not compatible with those libraries.

It looks very dangerous to downgrade Electron version, so I've looking for other library.

### koffi

Third library I've found is [`koffi`](https://github.com/Koromix/koffi), and it works well with Electron version I used.

Calling FFI function with `koffi` looks like below.

```typescript
import * as koffi from 'koffi';

const user32 = koffi.load('user32.dll');

const SendInput = user32.stdcall('SendInput', 'int', ['int', Input, 'int']);
```

Now I'm able to call DLL, it's time to looking for the way to emulate keyboard input. I've found [good implementation](https://stackoverflow.com/questions/41350341/using-sendinput-in-node-ffi) using `node-ffi-napi`, so let me refactor it to TypeScript.

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

And call this function in main process of Electron.

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

Split ASCII encoded serialport input by one character, translate it to keycode and emulate keyboard input.

It works very well.

## Summary

I've known the concept of FFI for long time, but this is the first time I've used it.

It seems very extensible in that can use function from other languages, and I hope there will be an opportunity to deal with native modules in the future.
