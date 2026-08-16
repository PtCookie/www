---
title: "Sequential asynchronous task of Promise"
subtitle: "Summarize some methods to run sequential asynchronous tasks."
brief: "Sequential or Parallel\nIt is common to deal with multiple asynchronous tasks sequentially.\nThere's many things to do sequentially, such as database processing, printing, etc.,\nand to handle those similar or same job, it's very efficient to use repeat..."
slug: "sequential-asynchronous-task-of-promise"
locale: "en"
publishedAt: "2024-12-20T12:00:00+09:00"
readTimeInMinutes: 2
tags:
  - name: "typescript"
    slug: "typescript"
coverImage:
  url: "../../../assets/covers/en/sequential-asynchronous-task-of-promise.jpeg"
  attribution: "https://unsplash.com/@matthewelancaster"
  photographer: "Matthew Lancaster"
---

## Sequential or Parallel

It is common to deal with multiple asynchronous tasks sequentially.

There's many things to do sequentially, such as database processing, printing, etc.,
and to handle those similar or same job, it's very efficient to use repeat statement.

Let's find out a good way to use in this situation.

## Handle Multiple Promises

In the case of `Promise` processing methods that we've looked for, they are not processed sequentially but in parallel.

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

It is okay if you just want to handle multiple asynchronous tasks regardless of speed or order of the tasks. But when you have to follow task order-such as processing order numbers, changing hardware settings, etc.-you should have to find another way.

## Sequential Execution Patterns

Simplest way is call directly, not to use repeat statement.

```typescript
await asyncJob(1000);
await asyncJob(1000);
await asyncJob(1000);
await asyncJob(1000);
await asyncJob(1000);
```

This always ensures that previous one will end before next one, so this can ensure task order. But as it does not use repeat statement it is not appropriate to use when number of task can vary or number of task is huge.

The next one is to use `for...of`.

```typescript
for (const _ of Array.from({ length: 5 })) {
  await asyncJob(1000);
}
```

Create an array with a length equal to the number of iterations with `Array.from` and call asynchronous operations with `for...of` iterations on that array.

Last one is `Array.reduce`.

```typescript
Array.from({ length: 5 }, () => asyncJob)
  .reduce((acc, cur) => acc.then(() => cur(1000)), Promise.resolve());
```

Create an array with a length equal to the number of iterations with `Array.from`.
In this case, add a callback function which returns an asynchronous operation to the map function of `Array.from` to create an array with that asynchronous function as an element.

Then use `reduce` function of that array. Provide `Promise.resolve()` as the initial value of the accumulator so that it can be executed for all elements of the array. If initial value is not provided, the first element in the array can be used as the initial value, and may causing an error.

## Summary

To summarize this,

> 1. Call directly if you run one or two asynchronous tasks in sequence.
> 2. Use `for...of` or `Array.reduce` when tasks number is large or varies.

will be like above.

## Reference

- [for...of - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of)
- [Array.prototype.reduce() - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
