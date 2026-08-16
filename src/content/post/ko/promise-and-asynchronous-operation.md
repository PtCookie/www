---
title: "Promise와 비동기 작업"
subtitle: "Promise를 사용해 비동기 작업을 처리하는 방법을 정리해보았습니다."
brief: "Promise object\nPromise 객체는 비동기 작업의 결과물, 즉 완료 혹은 실패 상태 및 그 결과 값을 나타냅니다.\n생성된 시점에서는 아직 알 수 없는 값을 위한 대리자로써, 동기 처리처럼 값을 반환하겠다는 약속을 반환합니다.\nPromise 에는 3가지 상태가 있습니다.\n\n대기: 초기 상태\n이행: 처리 성공\n거부: 처리 실패\n\nECMAScript 2017에서 추가된 async/await 와 함께 사용할 수도 있고, 체이닝을 통해 사용..."
slug: "promise-and-asynchronous-operation"
locale: "ko"
publishedAt: "2023-06-08T12:00:00+09:00"
readTimeInMinutes: 4
tags:
  - name: "typescript"
    slug: "typescript"
coverImage:
  url: "../../../assets/covers/ko/promise-and-asynchronous-operation.jpeg"
  attribution: "https://unsplash.com/@andrewwwpetrov"
  photographer: "Andrew Petrov"
---

## Promise object

`Promise` 객체는 비동기 작업의 결과물, 즉 완료 혹은 실패 상태 및 그 결과 값을 나타냅니다.
생성된 시점에서는 아직 알 수 없는 값을 위한 대리자로써, 동기 처리처럼 값을 반환하겠다는 **약속**을 반환합니다.

`Promise` 에는 3가지 상태가 있습니다.

- 대기: 초기 상태
- 이행: 처리 성공
- 거부: 처리 실패

ECMAScript 2017에서 추가된 `async`/`await` 와 함께 사용할 수도 있고, 체이닝을 통해 사용할 수도 있습니다.
또한 `Promise` 를 지원하지 않는 함수를 감싸 `Promise` 객체를 생성할 수도 있습니다.

## Constructor

생성자를 사용하면 `Promise` 를 지원하지 않는 함수를 `Promise` 객체로 만들어 비동기 처리를 간결하게 표현할 수 있습니다.

```typescript
setTimeout(() => console.log('Wait 3 seconds.'), 3000);
```

위의 `setTimeout` 의 경우, 3초 대기 후 콜백함수를 실행합니다.
단순히 로깅만 하는 경우는 상관없겠지만, 작업이 많아지면 콜백함수가 길어져야하고 여러번 대기해야한다면 콜백지옥에 빠질 가능성이 높아집니다.

```typescript
async function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

try {
  await wait(3000);
  console.log('Wait 3 seconds.');
} catch (err) {
  console.error(err)
}
```

이처럼 `Promise` 생성자로 감싸 객체로 만들 경우, 코드도 간결해지고 콜백지옥에 빠질 위험도 없습니다.
또한 `try`-`catch` 를 사용해 오류를 잡아낼 수도 있습니다.

## Resolve and Reject

비동기 처리 함수에서 처리 결과에 따른 이행 혹은 거부를 반환할 때는 `resolve` 와 `reject` 를 사용합니다.

```typescript
async function getName(): Promise<string> {
  try {
    const apiResponse = await fetch(`${API_ENDPOINT}`);

    if (apiResponse.status === 200) {
      const userName = await apiResponse.text();

      return Promise.resolve(userName);
    } else {
      const errorMessage = await apiResponse.text();

      return Promise.reject(new Error(errorMessage));
    }
  } catch (err) {
      return Promise.reject(err);
  }
}
```

위의 함수 `getName` 에서 `fetch` 의 결과 상태 코드가 `200` 일 경우, API 응답값을 텍스트로 디코딩된 값을 반환하며 이행합니다.
만약 상태 코드가 `200` 이 아니거나 `fetch` 가 실패한 경우, `Error` 객체를 반환하며 거부합니다.

> 이 때, `Promise.resolve` 를 생략해도 암시적으로 `Promise` 를 반환하는 것으로 취급합니다.
>
> ```typescript
> // return Promise.resolve(userName);
> return userName;
> ```

## Wait for click event

`Promise` 객체와 메서드를 활용하면 브라우저의 마우스 클릭 이벤트 등을 기다리는 것도 가능합니다.

```typescript
async function waitForClick(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.error('Timeout.');
      reject(new Error('Click timeout'));
    }, 5 * 1000);

    document.querySelector('button').addEventListener('click', (event) => {
      clearTimeout(timeout);
      console.log('Click.');
      resolve(true);
    });
  })
}
```

## Handle multiple operation

여러 개의 `Promise` 를 처리하는 방법은 다양하게 존재합니다.

### Promise.all()

주어진 모든 `Promise` 가 이행하거나, 하나라도 거부될 때까지 대기하는 `Promise` 입니다.

```typescript
const promise1 = Promise.resolve(0);
const promise2 = new Promise((resolve) => setTimeout(resolve, 100, 'quick'));
const promise3 = new Promise((resolve) => setTimeout(resolve, 500, 'slow'));

const promises = [promise1, promise2, promise3];

Promise.all(promises).then((value) => console.log(value));

// Expected output: Array [0, 'quick', 'slow']
```

주어진 모든 `Promise` 의 상태와 값을 모아놓은 배열로 이행하거나, 가장 먼저 거부된 `Promise` 의 사유로 거부합니다.
모든 작업이 성공해야할 경우 유용합니다.

### Promise.allSettled()

주어진 모든 `Promise` 가 처리(이행 혹은 거부)될 때까지 대기하는 `Promise` 입니다.

```typescript
const promise1 = Promise.reject(0);
const promise2 = new Promise((resolve) => setTimeout(resolve, 100, 'quick'));
const promise3 = new Promise((resolve) => setTimeout(resolve, 500, 'slow'));

const promises = [promise1, promise2, promise3];

Promise.allSettled(promises).then((value) => console.log(value));

// Expected output:
// [
//   {status: 'rejected', reason: 0},
//   {status: 'fulfilled', value: 'quick'},
//   {status: 'fulfilled', value: 'slow'}
// ]
```

주어진 모든 `Promise` 의 상태와 값 혹은 거부 사유를 모아놓은 배열로 이행합니다.
성공 / 실패와 상관없이 모든 작업을 진행 후 결과를 모아보는 경우 유용합니다.
ECMAScript 2020에서 추가되었습니다.

### Promise.any()

주어진 모든 `Promise` 중 하나라도 이행될 때까지 대기하는 `Promise` 입니다.

```typescript
const promise1 = Promise.reject(0);
const promise2 = new Promise((resolve) => setTimeout(resolve, 100, 'quick'));
const promise3 = new Promise((resolve) => setTimeout(resolve, 500, 'slow'));

const promises = [promise1, promise2, promise3];

Promise.any(promises).then((value) => console.log(value));

// Expected output: "quick"
```

가장 먼저 이행된 `Promise` 의 결과값으로 이행합니다.
작업들 중에 가장 빠르게 성공한 작업을 처리하는 경우 유용합니다.
ECMAScript 2021에서 추가되었습니다.

### Promise.race()

주어진 모든 `Promise` 중 하나라도 처리될 때까지 대기하는 `Promise` 입니다.

```typescript
const promise1 = Promise.reject(0);
const promise2 = new Promise((resolve) => setTimeout(resolve, 100, 'quick'));
const promise3 = new Promise((resolve) => setTimeout(resolve, 500, 'slow'));

const promises = [promise1, promise2, promise3];

Promise.race(promises).then((value) => console.log(value));

// Expected output: "Promise {<rejected>: 0}"
```

가장 먼저 처리된 `Promise` 의 결과값으로 이행하거나 거부합니다.
작업들 중에 가장 빠르게 완료된 작업을 처리하는 경우 유용합니다.

## Summary

이상으로 `Promise` 객체에 관해 간략하게 정리해 보았습니다.

API 호출, DB 연결, 입출력 처리 등 다양한 비동기 작업을 수행할 때,
`Promise` 객체를 사용하면 콜백 함수를 사용하는 것 보다 간결하고 읽기 편한 코드를 작성할 수 있습니다.

**_참조 - [Promise - JavaScript | MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Promise)_**
