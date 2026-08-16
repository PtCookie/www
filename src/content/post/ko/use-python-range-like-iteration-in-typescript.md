---
title: "TypeScript에서 Python의 range()와 유사한 반복 사용법"
subtitle: "Python에서는 일정 횟수를 반복할 때 range를 사용합니다. TypeScript에서 그와 유사한 반복을 사용해보겠습니다."
brief: "range() in Python\nPython에는 연속적인 숫자를 만들어내는 range 클래스가 있습니다.\nfor 반복문 등에서 특정한 횟수를 반복할 때 자주 사용됩니다.\nfor i in range(5):\n    print(i)\n\n# output\n# 0\n# 1\n# 2\n# 3\n# 4\n\n일정한 횟수만 실행하고 싶을 때 유용한 기능이고, TypeScript에서도 유사하게 사용할 수 없을지 알아보게 되었습니다.\nArray.from\nArray.from은 ..."
slug: "use-python-range-like-iteration-in-typescript"
locale: "ko"
publishedAt: "2022-12-17T12:00:00+09:00"
readTimeInMinutes: 2
tags:
  - name: "typescript"
    slug: "typescript"
coverImage:
  url: "../../../assets/covers/ko/use-python-range-like-iteration-in-typescript.jpeg"
  attribution: "https://unsplash.com/@davidclode"
  photographer: "David Clode"
---

## range() in Python

Python에는 연속적인 숫자를 만들어내는 `range` 클래스가 있습니다.
`for` 반복문 등에서 특정한 횟수를 반복할 때 자주 사용됩니다.

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

일정한 횟수만 실행하고 싶을 때 유용한 기능이고, TypeScript에서도 유사하게 사용할 수 없을지 알아보게 되었습니다.

## `Array.from`

`Array.from`은 반복 가능 객체나 유사 배열 객체를 얕게 복사해 새로운 `Array` 객체를 만드는 정적 메서드입니다.
중복없는 배열을 만들때도 유용합니다.

```typescript
const duplicatedArray = ['Apple', 'Apple', 'Banana', 'Banana', 'Chocolate'];

Array.from(new Set(duplicatedArray));
// [ 'Apple', 'Banana', 'Chocolate' ]
```

`Array.from`은 선택적인 두번째 파라미터로 배열의 모든 요소에서 호출할 맵핑 함수를 가질 수 있어 `forEach`나 `map`을 사용할 필요가 없습니다.

```typescript
Array.from([1, 2, 3], (value) => value * 2);
// [ 2, 4, 6 ]
```

또한 `Array.from`는 찾고 있던 기능인 연속적인 숫자를 만드는 기능을 가지고 있습니다.

```typescript
Array.from({ length: 5 });
// [ undefined, undefined, undefined, undefined, undefined ]

Array.from({ length: 5 }, (value, index) => index);
// [ 0, 1, 2, 3, 4 ]
```

Python의 `range` 클래스와 유사하게 시작, 끝, 간격을 설정하고 싶을때는 [MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/from#%EC%8B%9C%ED%80%80%EC%8A%A4_%EC%83%9D%EC%84%B1%EA%B8%B0range)의 예제를 참조하면 됩니다.

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

Python을 자주 사용하지는 않지만, 특정한 횟수만큼 반복을 해야할 때는 Python의 `range`가 떠오르곤 합니다.

이번에 유사한 기능을 찾을 수 있어 간결한 코드를 작성하는데 도움이 될 것 같습니다.
