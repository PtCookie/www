---
title: "Numeric input in HTML input element"
subtitle: "type=\"number\" is not very good answer"
brief: "I've used <input type=\"number\"> when it comes to get numeric input in HTML.\nBut there is some request from the project leader to tweak its behaviour-remove spinner, empty default value(not 0). So I when looked into <input> element, I've came across s..."
slug: "numeric-input-in-html-input-element"
locale: "en"
publishedAt: "2024-06-09T12:00:00+09:00"
readTimeInMinutes: 2
tags:
  - name: "reactjs"
    slug: "reactjs"
coverImage:
  url: "../../../assets/covers/en/numeric-input-in-html-input-element.jpeg"
  attribution: "https://unsplash.com/@florianolv"
  photographer: "Florian Olivo"
---

I've used `<input type="number">` when it comes to get numeric input in HTML.

But there is some request from the project leader to tweak its behaviour-remove spinner, empty default value(not 0). So I when looked into `<input>` element, I've came across some interesting articles.

According to articles, there is problem with `<input type="number">`, so we should use other input type.

## Problems

The very first problem I've got is to remove spinner controls.

According to this [article](https://css-tricks.com/numeric-inputs-a-comparison-of-browser-defaults/), almost every browsers have there own UI implementation of `<input type="number">`, and even for mobile browsers!

Also it can manipulated by keyboard Up/Down arrow key. And some components in React component libraries, such as `<TextField>` in MUI, have unexpected hover mouse wheel event to increase/decrease value.

Second problem is related to TypeScript and React.

```typescript
const [value, setValue] = useState<number>();

return <input type="number" value={value} onChange={onChange} />;
```

If default value of `useState` is not specified, so it will be `undefined`, it occurs *uncontrolled input to be controlled* error in React.

And if default value is `0`, it will be rendered as initial value, which is against project's requirements.

This problem can be easily solved by refactoring `useState<string>`, but first one still remains.

And there are other problem, according to [GOV.UK blog](https://technology.blog.gov.uk/2020/02/24/why-the-gov-uk-design-system-team-changed-the-input-type-for-numbers/) and [Stackoverflow Blog](https://stackoverflow.blog/2022/12/26/why-the-number-input-is-the-worst-input/).

Accessibility problems, user feedback, cross-browser issues, and so-on.

## Solutions

[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number) and previous articles are recommends `<input type="text" inputmode="numeric" />`.

And it works well, renders well!

```typescript
const [value, setValue] = useState<string>('');

return (
  <input
    type="text"
    inputMode="numeric"
    pattern="\d*"
    value={value}
    onChange={(event) => {
      if (event.target.checkValidity()) setValue(event.target.value);
    }}
  />
);
```

For validation, which is varies among those articles, `pattern="\d*"` is just enough for my usecase.

Use `checkValidity` to check if `input` element is in valid state, and if ok set state.

I only need to handle positive integer inputs. If you need to handle floating point numbers, you should look for valid regex, or you may check validity yourself, not depending on `pattern`.

## Summary

Use `<input type="text" inputmode="numeric" />` instead of `<input type="number">`.

For validation, use `pattern` & `checkValidity`, or `onChange` callback function!

## Reference

* [&lt;input type="number"&gt; | MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number)

* [Why the number input is the worst input - Stack Overflow](https://stackoverflow.blog/2022/12/26/why-the-number-input-is-the-worst-input/)

* [Why the GOV.UK Design System team changed the input type for numbers – Technology in government](https://technology.blog.gov.uk/2020/02/24/why-the-gov-uk-design-system-team-changed-the-input-type-for-numbers/)

* [HTML text input - allow only numeric input | Sentry](https://sentry.io/answers/html-text-input-allow-only-numeric-input/)

* [Numeric Inputs - A Comparison Of Browser Defaults | CSS-Tricks](https://css-tricks.com/numeric-inputs-a-comparison-of-browser-defaults/)
