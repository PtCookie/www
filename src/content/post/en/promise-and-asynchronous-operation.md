---
title: "Promise and asynchronous operation"
subtitle: "Summarize some methods to handle asynchronous operation with Promise."
brief: "Promise object\nPromise object represents the result of asynchronous operation, which includes its state whether success or fail, and value.\nIt is proxy for value which cannot known at created, it returns a promise to return value.\nPromise have 3 stat..."
slug: "promise-and-asynchronous-operation"
locale: "en"
publishedAt: "2023-06-08T12:00:00+09:00"
readTimeInMinutes: 4
tags:
  - name: "typescript"
    slug: "typescript"
coverImage:
  url: "../../../assets/covers/en/promise-and-asynchronous-operation.jpeg"
  attribution: "https://unsplash.com/@andrewwwpetrov"
  photographer: "Andrew Petrov"
---

## Promise object

`Promise` object represents the result of asynchronous operation, which includes its state whether success or fail, and value.
It is proxy for value which cannot known at created, it returns a **promise** to return value.

`Promise` have 3 states

- Pending: Initial state
- Fulfilled: Completed successfully
- Rejected: Failed

`Promise` can be used with `async`/`await` of ECMAScript 2017, or with chaining.
Also `Promise` can wrap functions which do not support `Promise`.

## Constructor

Asynchronous operation with non-`Promise` functions can be simple with `Promise` constructor.

```typescript
setTimeout(() => console.log('Wait 3 seconds.'), 3000);
```

`setTimeout` function above execute callback function after 3 seconds.
It is fine with simple logging, but as operation becomes complicated, callback function become huge and if you need more wait, you may get into callback hell.

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

Like this above, code becomes clearer and no more callback hell with `Promise` constructor.
Also errors can be caught with `try`-`catch` block.

## Resolve and Reject

`resolve` and `reject` is used in asynchronous functions to return fulfilled or rejected.

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

In function `getName`, when status code of `fetch` is `200`, it returns fulfill with value of decoded API response string.
If status code is `200` or when `fetch` fails, it rejects with return `Error` object.

> When `Promise.resolve` is omitted, it implicitly returns `Promise`.
>
> ```typescript
> // return Promise.resolve(userName);
> return userName;
> ```

## Wait for click event

It is possible to wait browser event like mouse click, by using `Promise` object and methods.

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

There are some methods to handle multiple `Promise`.

### Promise.all()

Wait for all `Promise` to be fulfilled, or for any to be rejected.

```typescript
const promise1 = Promise.resolve(0);
const promise2 = new Promise((resolve) => setTimeout(resolve, 100, 'quick'));
const promise3 = new Promise((resolve) => setTimeout(resolve, 500, 'slow'));

const promises = [promise1, promise2, promise3];

Promise.all(promises).then((value) => console.log(value));

// Expected output: Array [0, 'quick', 'slow']
```

This method returns fulfilled with aggregating array of fulfilled `Promise`s, or rejected reason of first rejected `Promise`.
It is useful if all operation should success.

### Promise.allSettled()

Wait for all `Promise` to be settled, whether fulfill or reject.

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

This method returns `Promise` that fulfills outcome form all of given `Promise`, whether fulfill or reject.
It is useful when you want result of all operation don't care if it is successful.
This method added at ECMAScript 2020.

### Promise.any()

Wait for any of given `Promise` fulfilled.

```typescript
const promise1 = Promise.reject(0);
const promise2 = new Promise((resolve) => setTimeout(resolve, 100, 'quick'));
const promise3 = new Promise((resolve) => setTimeout(resolve, 500, 'slow'));

const promises = [promise1, promise2, promise3];

Promise.any(promises).then((value) => console.log(value));

// Expected output: "quick"
```

This method returns first fulfilled value of given `Promise`.
It is useful to handle first successful operation.
This method added at ECMAScript 2021.

### Promise.race()

Wait for any of given `Promise` fulfilled or rejected.

```typescript
const promise1 = Promise.reject(0);
const promise2 = new Promise((resolve) => setTimeout(resolve, 100, 'quick'));
const promise3 = new Promise((resolve) => setTimeout(resolve, 500, 'slow'));

const promises = [promise1, promise2, promise3];

Promise.race(promises).then((value) => console.log(value));

// Expected output: "Promise {<rejected>: 0}"
```

This method returns first fulfilled value or rejected reason of given `Promise`.
It is useful to handle first operation.

## Summary

This is the end of brief summary about `Promise`.

When you operate asynchronous jobs like invoking API, connecting DB, handling IO,
`Promise` object helps you write simple and readable code than using callback functions.

**_Reference - [Promise - JavaScript | MDN](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)_**
