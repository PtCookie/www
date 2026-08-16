---
title: "Promise의 순차적 비동기 작업"
subtitle: "비동기 작업을 순차적으로 실행하는 방법을 찾아보았습니다."
brief: "Sequential or Parallel\n여러 개의 비동기 작업을 순차적으로 처리해야하는 경우는 흔히 있곤 합니다.\n데이터베이스 처리, 인쇄 작업 등 다양한 작업을 하나의 작업이 끝나고 이어서 다음 작업을 처리해야하는 경우는 정말 다양합니다.\n그리고 이렇게 동일하거나 같은 작업을 반복해야하는 경우 반복문을 사용하는게 효율적입니다.\n이런 상황에서 사용하기에 좋은 방법을 찾아보도록 하겠습니다.\nHandle Multiple Promises\n저번에 찾..."
slug: "sequential-asynchronous-task-of-promise"
locale: "ko"
publishedAt: "2024-12-20T12:00:00+09:00"
readTimeInMinutes: 2
tags:
  - name: "typescript"
    slug: "typescript"
coverImage:
  url: "../../../assets/covers/ko/sequential-asynchronous-task-of-promise.jpeg"
  attribution: "https://unsplash.com/@matthewelancaster"
  photographer: "Matthew Lancaster"
---

## Sequential or Parallel

여러 개의 비동기 작업을 순차적으로 처리해야하는 경우는 흔히 있곤 합니다.

데이터베이스 처리, 인쇄 작업 등 다양한 작업을 하나의 작업이 끝나고 이어서 다음 작업을 처리해야하는 경우는 정말 다양합니다.
그리고 이렇게 동일하거나 같은 작업을 반복해야하는 경우 반복문을 사용하는게 효율적입니다.

이런 상황에서 사용하기에 좋은 방법을 찾아보도록 하겠습니다.

## Handle Multiple Promises

저번에 찾아봤던 여러 개의 `Promise` 처리 방법의 경우, 순차적으로 처리되지 않고 병렬로 처리됩니다.

```typescript
async function asyncJob(milliseconds: number): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(() => {
      console.log("done");

      resolve();
    }, milliseconds),
  );
}

Promise.all(Array.from({ length: 5 }, () => asyncJob(1000)));

// Output at same time.
// done
// done
// done
// done
// done
```

작업 처리 속도나 순서와 관계없이 여러 비동기 작업을 처리하고 싶을 경우 문제가 없겠지만, 반드시 순서를 지켜서 진행해야 할 경우(주문번호 처리, 하드웨어 설정값 변경 등) 다른 방법을 찾아야합니다.

## Sequential Execution Patterns

가장 간단한 방법으로, 직접 호출하는 방법이 있습니다.

```typescript
await asyncJob(1000);
await asyncJob(1000);
await asyncJob(1000);
await asyncJob(1000);
await asyncJob(1000);
```

이 경우 항상 이전 작업이 끝나고 다음 작업이 실행되어 작업의 순서를 보장할 수 있습니다. 그러니 직접 호출하기 때문에 호출 횟수가 유동적이거나 많은 횟수의 작업을 호출해야할 경우 적합하지 않습니다.

다음으로는 `for...of` 를 사용하는 방법입니다.

```typescript
for (const _ of Array.from({ length: 5 })) {
  await asyncJob(1000);
}
```

`Array.from` 으로 반복 횟수와 같은 길이를 가진 배열을 생성하고, 해당 배열에 대해 `for...of` 반복을 통해 비동기 작업을 호출합니다.

마지막으로 `Array.reduce` 를 사용하는 방법입니다.

```typescript
Array.from({ length: 5 }, () => asyncJob)
  .reduce((acc, cur) => acc.then(() => cur(1000)), Promise.resolve());
```

`Array.from` 으로 반복 횟수와 동일한 길이를 가진 배열을 생성합니다. 이 때 `Array.from` 의 map 함수에 반복해야할 비동기 작업을 반환하는 함수를 넣어 해당 비동기 함수를 원소로 가지는 배열을 생성합니다.

그 후 해당 배열의 `reduce` 함수를 사용하여 작업을 호출합니다. 이 때 누산기의 초기값으로 `Promise.resolve()` 를 제공하여 배열 내의 모든 원소에 대해 실행할 수 있도록 합니다. 초기값을 제공하지 않을 경우, 배열의 첫번째 원소가 초기값으로 사용되어 오류가 발생할 수 있습니다.

## Summary

이상으로 정리하면,

> 1. 한두개의 비동기 작업을 순차적으로 실행할 경우 직접 호출합니다.
> 2. 여러개 혹은 횟수가 유동적인 경우 `for...of` 나 `Array.reduce` 를 사용하여 호출합니다.

와 같습니다.

## Reference

- [for...of - JavaScript | MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/for...of)
- [Array.prototype.reduce() - JavaScript | MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
