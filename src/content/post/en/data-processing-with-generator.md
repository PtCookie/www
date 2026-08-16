---
title: "Data processing with generator"
subtitle: "Basic concept of generator, and implement pagination with generator"
brief: "It is very common task to implement pagination in webpage.\nMany APIs support pagination, but there are also many cases where they don't.\nWhen all data is provided at once, pagination must be implemented on the client side.\nI tried implementing pagina..."
slug: "data-processing-with-generator"
locale: "en"
publishedAt: "2025-02-22T12:00:00+09:00"
readTimeInMinutes: 4
tags:
  - name: "typescript"
    slug: "typescript"
coverImage:
  url: "../../../assets/covers/en/data-processing-with-generator.jpeg"
  attribution: "https://unsplash.com/@mediamodifier"
  photographer: "Mediamodifier"
---

It is very common task to implement pagination in webpage.
Many APIs support pagination, but there are also many cases where they don't.
When all data is provided at once, pagination must be implemented on the client side.
I tried implementing pagination using generators.

## Introduction to Generators

Generator provides a way to create and control iterable objects, introduced in JavaScript with ES6.

Generator is similar to function but uses the `yield` keyword to return values and pause execution.
When called again, it resumes from where it left off. Generator inherits from `Iterator`.

The main differences from regular function lies in how they **execute** and **return** values.

A regular function creates a new context when called, runs, and returns a value via the `return` keyword.
In contrast, a generator maintains its execution state and returns multiple values sequentially using `yield` keyword.

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

In JavaScript, there is no constructor for `Generator`; instead, the `function*` keyword defines a generator function.
This binding shares the generator’s context.

For TypeScript, the type is defined as:

```typescript
Generator<T = unknown, TReturn = any, TNext = any>
```

Here, `T` is the type of values yielded, `TReturn` is the type returned by the return keyword via the `.return()` method, and `TNext` is the type of the argument passed to the `.next()` method.

Generator has methods inherited from `Iterator` and some additional ones.
To get the value yielded by `yield`, use the `.next()` method.

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

The `.next()` method returns an object with `value` and `done` properties.
The `value` holds the yielded value, and `done` indicates whether the generator has finished iterating.

## Implementing Pagination

Now, let's implement pagination using generator.

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

By using generic types, this function accepts arrays of various types, and the page size is determined by the `size` parameter.

Since generators inherit from `Iterator`, they can be used to split arrays as follows:

```typescript
...

const items = [1, 2, 3, 4, 5, 6, 7, 8];
const chunks = paginate<number>(items, 3);
const chunkedArray = [...chunks]

console.log(chunkedArray); // [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8 ] ]
```

## Additional Use Cases for Generators

Asynchronous generator can be used to execute asynchronous tasks sequentially.

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

The example above delays for each element in `jobs` and then sequentially outputs each value.

Generator functions calculate values only when needed, so they can also be used to create infinite sequences.

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

We explored the concept and implementation of generators, how to use them for pagination, and additional use cases.

Generator is similar to regular function but uses the `yield` keyword to return values and pause execution.
This enables various applications such as pagination, sequential asynchronous processing, and infinite sequence generation.

They can be very useful in real-world tasks.

**_Reference - [Generator - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)_**
