---
title: "Next.js에서 Prism을 사용하여 구문 강조하기"
subtitle: "게시글 내의 코드에 Syntax highlighting 을 적용해보았습니다."
brief: "Syntax Highlighting\n예전부터 다른 개발자분들의 블로그나 Hashnode에서\n게시글 내의 코드가 구문 강조되어 있는 것을 볼 수 있었습니다.\n관련된 라이브러리를 찾아보니 다양한 라이브러리가 있는 것을 알 수 있었고,\n그 중에서 Prism를 사용해 보기로 하였습니다.\n1. Rehype plugin\n처음으로 사용한 방법은 Next blog template에 있는 rehype plugin을 사용하는 방법이었습니다.\nnext-mdx-re..."
slug: "apply-syntax-highlighting-to-nextjs-with-prism"
locale: "ko"
publishedAt: "2022-01-02T12:00:00+09:00"
readTimeInMinutes: 2
tags:
  - name: "nextjs"
    slug: "nextjs"
  - name: "typescript"
    slug: "typescript"
coverImage:
  url: "../../../assets/covers/ko/apply-syntax-highlighting-to-nextjs-with-prism.jpeg"
  attribution: "https://unsplash.com/@flowforfrank"
  photographer: "Ferenc Almasi"
---

## Syntax Highlighting

예전부터 다른 개발자분들의 블로그나 [Hashnode](https://hashnode.com/)에서
게시글 내의 코드가 구문 강조되어 있는 것을 볼 수 있었습니다.

관련된 라이브러리를 찾아보니 다양한 라이브러리가 있는 것을 알 수 있었고,
그 중에서 [Prism](https://prismjs.com/)를 사용해 보기로 하였습니다.

## 1. Rehype plugin

처음으로 사용한 방법은 Next blog template에 있는 rehype plugin을 사용하는 방법이었습니다.

[next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)의 serialize 함수의 옵션으로 rehype plugin을 사용할 수 있었고,
그 중에서 [MDX Syntax highlighting](https://mdxjs.com/guides/syntax-highlighting) 페이지에서 예제로 제시된
[@mapbox/rehype-prism](https://github.com/mapbox/rehype-prism)을 사용해보기로 하였습니다.

```typescript
// [post].tsx

import { serialize } from 'next-mdx-remote/serialize';
import rehypePrism from '@mapbox/rehype-prism';

const mdxSource = await serialize(content, {
  scope: data,
  mdxOptions: { rehypePlugins: [rehypePrism] },
});
```

이 방법에는 문제가 있었습니다.

@mapbox/rehype-prism plugin이 TypeScript를 지원하지 않았습니다.

다른 Rehype 나 Remark plugin도 찾아보았지만, 특별히 TypeScript를 지원하는 경우를 찾지 못 했습니다.

임시 방편으로 global module로 정의하여 동작하게 할 수는 있었지만, 아무래도 찝찝한 기분이었습니다.

```typescript
// global.d.ts

declare module '@mapbox/rehype-prism';
```

## 2. React Hook

두번째로 찾게 된 방법이 React의 useEffect hook을 사용하는 방법이었습니다.

```typescript
import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import './styles.css';

export default function Code({ code, language }) {
  useEffect(() => {
    Prism.highlightAll();
  }, []);
  return (
    <div className="Code">
      <pre>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
```

_출처 - [DEV](https://dev.to/amitchauhan/syntax-highlighting-with-prismjs-and-react-1lep)_

위의 코드를 적용하여, 구문 강조를 적용할 수 있었습니다.

```typescript
// [post].tsx

import { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript.min';
import 'prismjs/components/prism-jsx.min';
import 'prismjs/components/prism-tsx.min';

export default function Post() {
  useEffect(() => {
    Prism.highlightAll();
  }, []);
}
```

```typescript
// _app.tsx

import 'prismjs/themes/prism-tomorrow.css';
```

## Summary

두번째 방법을 통해서 Prism를 적용할 수 있었지만, 아직 해결되지 않은 부분이 있었습니다.

```typescript
// [post].tsx

import 'prismjs/components/prism-typescript.min';
import 'prismjs/components/prism-jsx.min';
import 'prismjs/components/prism-tsx.min';
```

이처럼 사용할 언어를 미리 import 해야하는 점이었습니다.

다행히 Prism의 plugin으로 autoloader가 있긴 했지만,
webpack 설정의 문제인지 찾아낸 언어의 스크립트 파일을 불러오지 못 하는 것을 확인했습니다.

일단은 Prism에 명시된 기본 언어인 markup, css, js와 jsx, ts, tsx로 사용에 지장은 없었지만, 차후에 autoloader를 사용하는 법을 확인해야겠습니다.
