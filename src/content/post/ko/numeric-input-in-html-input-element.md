---
title: "Html 입력 엘리먼트의 숫자 입력"
subtitle: "type=\"number\"은 그다지 좋지 않은 방법입니다."
brief: "HTML에서 숫자 입력을 받을 때, 보통 <input type=\"number\">을 사용해 왔습니다.\n하지만 프로젝트 진행 중 증가/감소 스피너 제거 및 0이 아닌 비어있는 기본값 설정 등 몇 가지 성질을 변경할 필요가 있었습니다. 그래서 <input> 엘리먼트에 대해 조사를 해보던 중, 몇 가지 재미있는 게시글을 발견했습니다.\n그 게시글들에 의하면, <input type=\"number\">에는 몇 가지 문제가 있으며, 다른 입력 방법을 사용하는 ..."
slug: "numeric-input-in-html-input-element"
locale: "ko"
publishedAt: "2024-06-09T12:00:00+09:00"
readTimeInMinutes: 2
tags:
  - name: "reactjs"
    slug: "reactjs"
coverImage:
  url: "../../../assets/covers/ko/numeric-input-in-html-input-element.jpeg"
  attribution: "https://unsplash.com/@florianolv"
  photographer: "Florian Olivo"
---

HTML에서 숫자 입력을 받을 때, 보통 `<input type="number">`을 사용해 왔습니다.

하지만 프로젝트 진행 중 증가/감소 스피너 제거 및 0이 아닌 비어있는 기본값 설정 등 몇 가지 성질을 변경할 필요가 있었습니다. 그래서 `<input>` 엘리먼트에 대해 조사를 해보던 중, 몇 가지 재미있는 게시글을 발견했습니다.

그 게시글들에 의하면, `<input type="number">`에는 몇 가지 문제가 있으며, 다른 입력 방법을 사용하는 것이 좋다고 합니다.

## Problems

첫 번째 문제는 스피너 조절기를 제거하는 것이었습니다.

[이 게시글](https://css-tricks.com/numeric-inputs-a-comparison-of-browser-defaults/)에 따르면, 거의 모든 브라우저가(모바일 브라우저 마저도,) 독자적인 `<input type="number">`의 UI 구현을 가지고 있고 있었습니다.

또한, 해당 스피너는 키보드의 위/아래 방향키를 통해 조절할 수 있습니다. 그리고 MUI의 `<TextField>`와 같은 일부 React 컴포넌트 라이브러리의 경우, 예상치 못한 호버 마우스 휠 이벤트로 인해 값이 증가/감소되는 문제도 발생했습니다.

두 번째 문제는 TypeScript와 React에 관한 것이었습니다.

```typescript
const [value, setValue] = useState<number>();

return <input type="number" value={value} onChange={onChange} />;
```

만약 `useState`의 기본값을 설정하지 않게되면 그 값은 `undefined`가 되고, React의 *uncontrolled input to be controlled* 에러를 발생시킵니다.

이 때 기본값을 `0`으로 설정하게 되면 기본값으로 표시되게 되고, 프로젝트의 요구사항인 비어있는 입력란에 어긋나게 됩니다.

이 문제는 `useState<string>`로 타입을 지정하는 것으로 쉽게 해결할 수 있지만, 여전히 첫 번째 문제가 해결되지 않습니다.

또한 [GOV.UK blog](https://technology.blog.gov.uk/2020/02/24/why-the-gov-uk-design-system-team-changed-the-input-type-for-numbers/)와 [Stackoverflow Blog](https://stackoverflow.blog/2022/12/26/why-the-number-input-is-the-worst-input/)에 따르면 여전히 접근성이나 유저 피드백, 크로스 브라우저 문제 등 해결해야 할 다른 문제들이 남아 있습니다.

## Solutions

[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number)과 앞서 언급한 게시글들에서는 `<input type="text" inputmode="numeric" />`을 추천하고 있습니다.

실제로 원하는 대로 동작했고, 표시 또한 원하는 대로 그려졌습니다.

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

입력값 검증에 대해서는 게시글들에서 다양한 방법을 제시하였지만, 프로젝트 요구사항에는 `pattern="\d*"`면 충분했습니다.

`checkValidity`를 사용해 `input`의 상태를 검증했고, 문제가 없을 경우 상태를 저장했습니다.

프로젝트에서는 양의 정수 입력만을 고려하면 되었지만, 만약 소숫점 입력이 필요하다면 적절한 정규표현식을 사용하거나, `pattern`이 아닌 다른 방식으로 검증해야 할 것으로 보입니다.

## Summary

`<input type="number">` 대신 `<input type="text" inputmode="numeric" />`을 사용하세요.

입력값 검증에는 `pattern`과 `checkValidity`, 혹은 `onChange` 콜백 함수를 사용하세요!

## Reference

* [&lt;input type="number"&gt; | MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number)

* [Why the number input is the worst input - Stack Overflow](https://stackoverflow.blog/2022/12/26/why-the-number-input-is-the-worst-input/)

* [Why the GOV.UK Design System team changed the input type for numbers – Technology in government](https://technology.blog.gov.uk/2020/02/24/why-the-gov-uk-design-system-team-changed-the-input-type-for-numbers/)

* [HTML text input - allow only numeric input | Sentry](https://sentry.io/answers/html-text-input-allow-only-numeric-input/)

* [Numeric Inputs - A Comparison Of Browser Defaults | CSS-Tricks](https://css-tricks.com/numeric-inputs-a-comparison-of-browser-defaults/)
