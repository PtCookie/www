---
title: "제네레이터를 사용한 데이터 처리"
subtitle: "제네레이터의 기본 개념과 제네레이터를 활용한 페이지네이션 구현"
brief: "웹페이지 작업 중에 페이지네이션을 구현하는 것은 꽤나 흔한 일입니다. API에서 페이지네이션을 지원하는 경우도 많지만, 그렇지 않은 경우도 많습니다.\n한 번에 전체 데이터가 주어지는 경우 클라이언트에서 페이지네이션을 구현해야하는데, 제네레이터를 사용하여 페이지네이션을 구현해보았습니다.\nIntroduction to Generators\n제네레이터는 반복 가능한 객체를 생성하고 제어하는 방법을 제공하는 기능으로써, JavaScript에는 ES6에서 ..."
slug: "data-processing-with-generator"
locale: "ko"
publishedAt: "2025-02-22T12:00:00+09:00"
readTimeInMinutes: 3
tags:
  - name: "typescript"
    slug: "typescript"
coverImage:
  url: "../../../assets/covers/ko/data-processing-with-generator.jpeg"
  attribution: "https://unsplash.com/@mediamodifier"
  photographer: "Mediamodifier"
---

웹페이지 작업 중에 페이지네이션을 구현하는 것은 꽤나 흔한 일입니다. API에서 페이지네이션을 지원하는 경우도 많지만, 그렇지 않은 경우도 많습니다.
한 번에 전체 데이터가 주어지는 경우 클라이언트에서 페이지네이션을 구현해야하는데, 제네레이터를 사용하여 페이지네이션을 구현해보았습니다.

## Introduction to Generators

제네레이터는 반복 가능한 객체를 생성하고 제어하는 방법을 제공하는 기능으로써, JavaScript에는 ES6에서 도입되었습니다.

제네레이터는 함수와 유사하지만 `yield` 키워드를 사용하여 값을 반환하며 실행을 일시 중단합니다. 다시 호출될 경우 중단되었던 지점에서 재개하게 됩니다. 제너레이터는 `Iterator`를 상속합니다.

일반적인 함수와의 차이점으로는 **실행 방식**, **반환 방식** 등이 있습니다.

일반적인 함수의 경우, 호출될 경우 새로운 컨텍스트를 생성하여 실행이 된 후 `return` 키워드를 통해 값을 반환합니다. 그에 반해 제네레이터의 경우, 실행 상태를 유지하며 `yield` 키워드를 통해 여러 값을 순차적으로 반환합니다.

## Generator Syntax and Usage

```typescript
function* generator(): Generator<number, void, unknown> {
  yield 1;
  yield 2;
  yield 3;
}

const gen = generator();

console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
console.log(gen.next().value); // 3
```

JavaScript에서 `Generator`의 생성자에 해당하는 대상은 없고, 제네레이터 함수의 `function*` 키워드를 통해 바인딩을 할당할 수 있습니다.
해당 바인딩을 통해 제네레이터의 컨텍스트를 공유합니다.

```typescript
Generator<T = unknown, TReturn = any, TNext = any>
```

TypeScript 타입의 경우 위와 같은 타입을 사용합니다. `T`는 제네레이터의 `yield` 키워드에서 반환되는 값의 타입, `TReturn`는 `.return()` 메서드를 통해 `return` 키워드에서 반환되는 값의 타입, `TNext`는 `.next()` 메서드에 인수를 전달할 경우 그 타입입니다.

제네레이터에는 `Iterator`에게 상속받은 메서드와 몇 가지 메서드가 있는데, 그 중에서 `yield` 키워드로 반환된 값을 얻으려면 `.next()` 메서드를 사욯합니다.

```typescript
function* generator(): Generator<number, void, unknown> {
  yield 1;
  yield 2;
  yield 3;
}

const gen = generator();

console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }
```

`.next()` 메서드는 `value`와 `done`으로 이루어진 객체를 반환합니다. `value`에서 제네레이터의 반환값을 얻을 수 있고, `done`에서 제네레이터가 끝까지 반복했는지 확인할 수 있습니다.

## Implementing Pagination

이제 제네레이터를 활용하여 페이지네이션을 구현해보겠습니다.

```typescript
function* paginate<T>(items: Array<T>, size: number): Generator<Array<T>, void, unknown> {
  for (let i = 0; i < items.length; i += size) {
    yield items.slice(i, i + size);
  }
}

const items = [1, 2, 3, 4, 5, 6, 7, 8];
const pages = paginate<number>(items, 3);

console.log(pages.next()); // { value: [1, 2, 3], done: false }
console.log(pages.next()); // { value: [4, 5, 6], done: false }
console.log(pages.next()); // { value: [7, 8], done: false }
console.log(pages.next()); // { value: undefined, done: true }
```

제네릭 타입을 활용하여 다양한 타입의 배열을 입력받을 수 있도록 하였고, `size`에 따라 페이지 크기를 정해 페이지네이션하도록 구현하였습니다.

제네레이터는 `Iterator`를 상속하고 있으므로, 다음과 같이 배열을 나누는 데에도 사용할 수 있습니다.

```typescript
...

const items = [1, 2, 3, 4, 5, 6, 7, 8];
const chunks = paginate<number>(items, 3);
const chunkedArray = [...chunks]

console.log(chunkedArray); // [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8 ] ]
```

## Additional Use Cases for Generators

비동기 작업을 순차적으로 실행하는데 비동기 제네레이터를 사용할 수 있습니다.

```typescript
async function work(sec: number): Promise<number> {
  return new Promise((resolve) => setTimeout(() => resolve(sec), sec * 1000));
}

async function* asyncJobs(jobs: number[]): AsyncGenerator<number, void, unknown> {
  for (const job of jobs) {
    yield await work(job);
  }
}

const jobs = [2, 3, 5];
const jobGenerator = asyncJobs(jobs);

let jobDone = await jobGenerator.next();
while (!jobDone.done) {
  console.log(jobDone.value);
  jobDone = await jobGenerator.next();
}
```

위의 예시 코드는 `jobs`의 각 원소만큼 지연 후 각 원소를 순차적으로 출력합니다.

제네레이터 함수는 값이 필요할 때 계산하므로, 무한 시퀸스를 생성하는데에도 사용할 수 있습니다.

```typescript
function* infinite() {
  let index = 0;

  while (true) {
    yield index++;
  }
}

const generator = infinite();

console.log(generator.next().value); // 0
console.log(generator.next().value); // 1
console.log(generator.next().value); // 2
...
```

## Summary

제네레이터의 개념과 구현, 그를 활용한 페이지네이션과 추가적인 사용 방법에 대해 알아보았습니다.

제네레이터는 일반 함수와 유사하지만 `yield` 키워드를 사용하여 값을 반환하며 실행을 일시 중단합니다.
이를 통해 페이지네이션 구현, 비동기 작업 순차 처리나 무한 시퀸스 생성 등 여러 활용이 가능합니다.

실제 작업에서 활용하면 유용할 것으로 보입니다.

**_참조 - [Generator - JavaScript | MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Generator)_**
