---
title: "useRef Hook in TypeScript React.js"
subtitle: "useRef returns a mutable ref object whose .current property is initialized to the passed argument (initialValue)."
brief: "useRef Hook\nuseRef returns a mutable ref object whose .current property is initialized to the passed argument (initialValue). The returned object will persist for the full lifetime of the component.\nFrom - Hooks API Reference - React\nReact Hook is ne..."
slug: "useref-hook-in-typescript-reactjs"
locale: "en"
publishedAt: "2022-01-04T02:56:00+09:00"
readTimeInMinutes: 5
tags:
  - name: "reactjs"
    slug: "reactjs"
  - name: "typescript"
    slug: "typescript"
coverImage:
  url: "../../../assets/covers/en/useref-hook-in-typescript-reactjs.png"
  attribution: null
  photographer: null
---

## useRef Hook

`useRef` returns a mutable ref object whose `.current` property is initialized to the passed argument (`initialValue`). The returned object will persist for the full lifetime of the component.

*From -* [*Hooks API Reference - React*](https://reactjs.org/docs/hooks-reference.html#useref)

React Hook is new feature from React v16.8, let function component to use state and other features.

I've used `useState` and `useEffect` hook many times, but barely have used `useRef` hook. This time, I used `useRef` hook for refer to DOM element, implement dropdown menu.

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
  // Dropdown state
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

As I transpile, error occurs.

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

I've met this problem in the past, type problem. This problem can be solved with [Type Assertion](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions).

```typescript
function Dropdown({ name, children }: Property) {
  // ...
  const btnRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

  // ...
}
```

## useRef Hook with EventListener

And next, make dropdown closed when click outside of dropdown with `useEffect` hook.

```typescript
function Dropdown({ name, children }: Property) {
  // Dropdown state
  const [display, setDisplay] = React.useState<boolean>(false);
  const btnRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

  React.useEffect(() => {
    // Close dropdown when click outside
    function handleOutsideClick(event) {
      if (btnRef.current && !btnRef.current.contains(event.target)) {
        setDisplay(false);
      }
    }

    // Add event after component rendering
    document.addEventListener('click', handleOutsideClick, true);
    // Remove event when component unmount
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

Once more, error occurs. It's about parameter `event` of function `handleOutsideClick` in `useEffect` hook.

```plaintext
TS7006: Parameter 'event' implicitly has an 'any' type.
```

I think `MouseEvent` works well as it is mouse click event, in that case, error occurs about parameter of function `btnRef.current.contains`.

```plaintext
TS2345: Argument of type 'EventTarget | null' is not assignable to parameter of type 'Node | null'.
```

So I set type of `event` to `React.BaseSyntheticEvent`, now there is problem with event add/remove of `document`.

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

Looking for solution, and finally, use [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types).

```typescript
function handleOutsideClick(event: React.BaseSyntheticEvent | MouseEvent) {
  if (btnRef.current && !btnRef.current.contains(event.target)) {
    setDisplay(false);
  }
}
```

It transpiles well, and works well.

## Summary

Final code is like below.

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
  // Dropdown state
  const [display, setDisplay] = React.useState<boolean>(false);
  const btnRef = React.useRef() as React.MutableRefObject<HTMLDivElement>;

  React.useEffect(() => {
    // Close dropdown when click outside
    function handleOutsideClick(event: React.BaseSyntheticEvent | MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(event.target)) {
        setDisplay(false);
      }
    }

    // Add event after component rendering
    document.addEventListener('click', handleOutsideClick, true);
    // Remove event when component unmount
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

At this work, I can learn more about `useRef` hook which I know its existence long ago but don't know exactly, learn more about types of TypeScript by using `useRef` hook which I can't use it because of type error.

I would like to learn other React hooks sometime.
