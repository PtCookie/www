---
title: "Use Python range() like iteration in TypeScript"
subtitle: "Python range is commonly used for looping a specific number of times in loops. Use iteration like that in TypeScript."
brief: "range() in Python\nIn Python, there is range class which makes sequence of numbers.\nIt is commonly used for looping a specific number of times in for loops.\nfor i in range(5):\n    print(i)\n\n# output\n# 0\n# 1\n# 2\n# 3\n# 4\n\nIt is useful when you want to i..."
slug: "use-python-range-like-iteration-in-typescript"
locale: "en"
publishedAt: "2022-12-17T12:00:00+09:00"
readTimeInMinutes: 2
tags:
  - name: "typescript"
    slug: "typescript"
coverImage:
  url: "../../../assets/covers/en/use-python-range-like-iteration-in-typescript.jpeg"
  attribution: "https://unsplash.com/@davidclode"
  photographer: "David Clode"
---

## range() in Python

In Python, there is `range` class which makes sequence of numbers.
It is commonly used for looping a specific number of times in `for` loops.

```python
for i in range(5):
    print(i)

# output
# 0
# 1
# 2
# 3
# 4
```

It is useful when you want to iterate specific number of times, so let's find out how to iterate like this in TypeScript.

## `Array.from`

`Array.from` is static method which creates shallow copy of new `Array` instance from an iterable or array-like object.
It is useful to make array with unique array.

```typescript
const duplicatedArray = ['Apple', 'Apple', 'Banana', 'Banana', 'Chocolate'];

Array.from(new Set(duplicatedArray));
// [ 'Apple', 'Banana', 'Chocolate' ]
```

As optional second parameter of `Array.from` is map function to call on every element of the array, so you don't need to use `forEach` or `map` to iterate.

```typescript
Array.from([1, 2, 3], (value) => value * 2);
// [ 2, 4, 6 ]
```

`Array.from` can also generate sequence of numbers, what we are looking for.

```typescript
Array.from({ length: 5 });
// [ undefined, undefined, undefined, undefined, undefined ]

Array.from({ length: 5 }, (value, index) => index);
// [ 0, 1, 2, 3, 4 ]
```

To make complete `range` class of Python which is able to set start, stop, and step of sequence, we can find reference out from [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#sequence_generator_range).

```typescript
function range(start: number, stop: number, step: number): Array<number> {
  return Array.from({ length: (stop - start) / step + 1 }, (_, index) => start + index * step);
}

range(0, 5, 1);
// [ 0, 1, 2, 3, 4, 5 ]

range(2, 12, 3);
// [ 2, 5, 8, 11 ]
```

## Summary

Although I do not use Python very often, but when I have to iterate specific times, `range` of Python come to mind.

It will help me write concise code as I found similar functionality this time.
