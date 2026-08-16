---
title: "TypeScript React.js에서 useRef Hook 사용하기"
subtitle: "useRef는 .current 프로퍼티로 전달된 인자(initialValue)로 초기화된 변경 가능한 ref 객체를 반환합니다."
brief: "useRef Hook\nuseRef는 .current 프로퍼티로 전달된 인자(initialValue)로 초기화된 변경 가능한 ref 객체를 반환합니다. 반환된 객체는 컴포넌트의 전 생애주기를 통해 유지될 것입니다.\n출처 - Hooks API Reference - React\nReact Hook은 React v16.8부터 추가된 기능으로 함수형 컴포넌트에서도 상태 관리 등을 할 수 있도록 합니다.\n지금까지 useState나 useEffect Hook..."
slug: "useref-hook-in-typescript-reactjs"
locale: "ko"
publishedAt: "2022-01-04T12:00:00+09:00"
readTimeInMinutes: 5
tags:
  - name: "reactjs"
    slug: "reactjs"
  - name: "typescript"
    slug: "typescript"
coverImage:
  url: "../../../assets/covers/ko/useref-hook-in-typescript-reactjs.png"
  attribution: null
  photographer: null
---

## useRef Hook

`useRef`는 `.current` 프로퍼티로 전달된 인자(`initialValue`)로 초기화된 변경 가능한 ref 객체를 반환합니다. 반환된 객체는 컴포넌트의 전 생애주기를 통해 유지될 것입니다.

*출처 -* [*Hooks API Reference - React*](https://ko.reactjs.org/docs/hooks-reference.html#useref)

React Hook은 React v16.8부터 추가된 기능으로 함수형 컴포넌트에서도 상태 관리 등을 할 수 있도록 합니다.

지금까지 `useState`나 `useEffect` Hook은 많이 사용해 봤지만, `useRef` Hook은 그다지 사용한 적이 없었습니다. 그러다가 이번에 드랍다운 메뉴를 구현하면서, DOM 요소를 참조하기 위해 사용해보게 되었습니다.

## useRef Hook in TypeScript

```typescript
// src/Dropdown.tsx
import React from 'react';
import styled, { css } from 'styled-components';

// Property
type Property = {
  name: string;
  children: React.ReactChild;
};

// Styled-components
const Button = styled('div')<{ $display: boolean }>`
  position: relative;

  cursor: pointer;

  ${(props) =>
    props.$display
      ? css`
          & :nth-child(2) {
            display: block;
          }
        `
      : css`
          &:hover :nth-child(2) {
            display: block;
          }
        `}
`;
const Name = styled('span')`
  display: block;

  padding: 0.5rem;

  color: #606060;

  &:hover {
    color: #0d0d0d;
  }
`;

function Dropdown({ name, children }: Property) {
  // Dropdown 표시 상태
  const [display, setDisplay] = React.useState<boolean>(false);
  const btnRef = React.useRef();

  return (
    <Button ref={btnRef} $display={display} onClick={() => setDisplay(!display)}>
      <Name>{name}</Name>
      {children}
    </Button>
  );
}

export default Dropdown;
```

작성은 쉽게 했지만, 에러가 발생했습니다.

```plaintext
TS2769: No overload matches this call.
  Overload 1 of 2, '(props: { slot?: string | undefined; style?: CSSProperties | undefined; title?: string | undefined; ref?: ((instance: HTMLDivElement | null) => void) | RefObject<...> | null | undefined; ... 252 more ...; $display: boolean; } & { ...; } & { ...; }): ReactElement<...>', gave the following error.
    Type 'MutableRefObject<undefined>' is not assignable to type '((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement> | null | undefined'.
      Type 'MutableRefObject<undefined>' is not assignable to type 'RefObject<HTMLDivElement>'.
        Types of property 'current' are incompatible.
          Type 'undefined' is not assignable to type 'HTMLDivElement | null'.
  Overload 2 of 2, '(props: StyledComponentPropsWithAs<"div", any, { $display: boolean; }, never, "div", "div">): ReactElement<StyledComponentPropsWithAs<"div", any, { $display: boolean; }, never, "div", "div">, string | ... 1 more ... | (new (props: any) => Component<...>)>', gave the following error.
    Type 'MutableRefObject<undefined>' is not assignable to type '((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement> | null | undefined'.
      Type 'MutableRefObject<undefined>' is not assignable to type 'RefObject<HTMLDivElement>'.
    44 |
    45 |   return (
  > 46 |     <Button ref={btnRef} $display={display} onClick={() => setDisplay(!display)}>
       |             ^^^
    47 |       <Name>{name}</Name>
    48 |       {children}
    49 |     </Button>
```

예전에도 겪었던 문제인데, 타입 설정의 문제였습니다. 문제는 타입 표명([Type Assertion](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions))을 통해 해결할 수 있었습니다.

```typescript
function Dropdown({ name, children }: Property) {
  // ...
  const btnRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

  // ...
}
```

## useRef Hook with EventListener

그 후, `useEffect` Hook을 사용하여 드랍다운 메뉴 외부를 클릭할 경우 드랍다운이 닫히도록 하였습니다.

```typescript
function Dropdown({ name, children }: Property) {
  // Dropdown 표시 상태
  const [display, setDisplay] = React.useState<boolean>(false);
  const btnRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

  React.useEffect(() => {
    // Component 외부를 클릭 시 dropdown 표시 해제
    function handleOutsideClick(event) {
      if (btnRef.current && !btnRef.current.contains(event.target)) {
        setDisplay(false);
      }
    }

    // Component rendering 후 이벤트 등록
    document.addEventListener('click', handleOutsideClick, true);
    // Component 제거 시 이벤트 제거
    return () => {
      document.removeEventListener('click', handleOutsideClick, true);
    };
  }, [btnRef]);

  return (
    <Button ref={btnRef} $display={display} onClick={() => setDisplay(!display)}>
      <Name>{name}</Name>
      {children}
    </Button>
  );
}
```

이 때 다시 한 번 에러가 발생했습니다. `useEffect` Hook 내부의 `handleOutsideClick` 함수의 파라미터 `event`의 타입 설정이었습니다.

```plaintext
TS7006: Parameter 'event' implicitly has an 'any' type.
```

마우스 클릭 이벤트이니 `MouseEvent`로 지정하면 된다고 생각했는데, 그럴 경우 `btnRef.current.contains` 함수의 파라미터 타입에 맞지 않는다는 에러가 발생했습니다.

```plaintext
TS2345: Argument of type 'EventTarget | null' is not assignable to parameter of type 'Node | null'.
```

그래서 React의 이벤트인 `React.BaseSyntheticEvent`로 지정하자, 이번에는 `document`의 이벤트 리스너 추가/제거에서 에러가 발생했습니다.

```plaintext
TS2769: No overload matches this call.
  Overload 1 of 2, '(type: "click", listener: (this: Document, ev: MouseEvent) => any, options?: boolean | AddEventListenerOptions | undefined): void', gave the following error.
    Argument of type '(event: BaseSyntheticEvent<object, any, any>) => void' is not assignable to parameter of type '(this: Document, ev: MouseEvent) => any'.
      Types of parameters 'event' and 'ev' are incompatible.
        Type 'MouseEvent' is missing the following properties from type 'BaseSyntheticEvent<object, any, any>': nativeEvent, isDefaultPrevented, isPropagationStopped, persist
  Overload 2 of 2, '(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void', gave the following error.
    Argument of type '(event: BaseSyntheticEvent<object, any, any>) => void' is not assignable to parameter of type 'EventListenerOrEventListenerObject'.
      Type '(event: BaseSyntheticEvent<object, any, any>) => void' is not assignable to type 'EventListener'.
        Types of parameters 'event' and 'evt' are incompatible.
          Type 'Event' is missing the following properties from type 'BaseSyntheticEvent<object, any, any>': nativeEvent, isDefaultPrevented, isPropagationStopped, persist
```

방법을 고민하다가 유니온 타입([Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types))을 사용해보기로 했습니다.

```typescript
function handleOutsideClick(event: React.BaseSyntheticEvent | MouseEvent) {
  if (btnRef.current && !btnRef.current.contains(event.target)) {
    setDisplay(false);
  }
}
```

정상적으로 트랜스파일되고, 원하는 동작을 확인할 수 있었습니다.

## Summary

최종 코드는 아래와 같습니다.

```typescript
// src/Dropdown.tsx
import React from 'react';
import styled, { css } from 'styled-components';

// Property
type Property = {
  name: string;
  children: React.ReactChild;
};

// Styled-components
const Button = styled('div')<{ $display: boolean }>`
  position: relative;

  cursor: pointer;

  ${(props) =>
    props.$display
      ? css`
          & :nth-child(2) {
            display: block;
          }
        `
      : css`
          &:hover :nth-child(2) {
            display: block;
          }
        `}
`;
const Name = styled('span')`
  display: block;

  padding: 0.5rem;

  color: #606060;

  &:hover {
    color: #0d0d0d;
  }
`;

function Dropdown({ name, children }: Property) {
  // Dropdown 표시 상태
  const [display, setDisplay] = React.useState<boolean>(false);
  const btnRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

  React.useEffect(() => {
    // Component 외부를 클릭 시 dropdown 표시 해제
    function handleOutsideClick(event: React.BaseSyntheticEvent | MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(event.target)) {
        setDisplay(false);
      }
    }

    // Component rendering 후 이벤트 등록
    document.addEventListener('click', handleOutsideClick, true);
    // Component 제거 시 이벤트 제거
    return () => {
      document.removeEventListener('click', handleOutsideClick, true);
    };
  }, [btnRef]);

  return (
    <Button ref={btnRef} $display={display} onClick={() => setDisplay(!display)}>
      <Name>{name}</Name>
      {children}
    </Button>
  );
}

export default Dropdown;
```

이번 작업을 통해 전부터 존재하는 지 알고 있었지만 잘 사용하지 않아 알지 못 했던 `useRef` Hook에 대해 많이 알 수 있었고, 여러 JavaScript 예시들에서 보아 왔지만 타입 에러 때문에 제대로 사용하지 못 한 `useRef` Hook을 TypeScript에서 사용하며 TypeScript의 타입에 관해서도 더 많이 알 수 있었습니다.

기회가 되면 React의 다른 Hook에 대해서도 알아보도록 하겠습니다.
