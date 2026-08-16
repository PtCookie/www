---
title: "Apply syntax highlighting to Next.js with Prism"
subtitle: "Syntax highlighting with Prism."
brief: "Syntax Highlighting\nI saw code is syntax highlighted in other developer's blog, like Hashnode.\nI'm looking for library to do so, and decided to use Prism.\n1. Rehype plugin\nFirst, I used rehype plugin, which is used in Next blog template.\nRehype plugi..."
slug: "apply-syntax-highlighting-to-nextjs-with-prism"
locale: "en"
publishedAt: "2022-01-02T00:28:00+09:00"
readTimeInMinutes: 2
tags:
  - name: "nextjs"
    slug: "nextjs"
  - name: "typescript"
    slug: "typescript"
coverImage:
  url: "../../../assets/covers/en/apply-syntax-highlighting-to-nextjs-with-prism.jpeg"
  attribution: "https://unsplash.com/@flowforfrank"
  photographer: "Ferenc Almasi"
---

## Syntax Highlighting

I saw code is syntax highlighted in other developer's blog, like [Hashnode](https://hashnode.com/).

I'm looking for library to do so, and decided to use [Prism](https://prismjs.com/).

## 1. Rehype plugin

First, I used rehype plugin, which is used in Next blog template.

Rehype plugin can be used as option in serialize function of [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote).
I choose rehype plugin [@mapbox/rehype-prism](https://github.com/mapbox/rehype-prism), presented as an example in [MDX Syntax highlighting](https://mdxjs.com/guides/syntax-highlighting).

```typescript
// [post].tsx

import { serialize } from 'next-mdx-remote/serialize';
import rehypePrism from '@mapbox/rehype-prism';

const mdxSource = await serialize(content, {
  scope: data,
  mdxOptions: { rehypePlugins: [rehypePrism] }
});

```

There is a problem with this method.

[@mapbox/rehype-prism](https://github.com/mapbox/rehype-prism) plugin doesn't support TypeScript.

I'm looking for other rehype / remark plugin which support TypeScript, but I found no plugin.

I can declare global module to run, but I put my mind to find another method.

```typescript
// global.d.ts

declare module '@mapbox/rehype-prism';

```

## 2. React Hook

Second method is to use useEffect hook of React.

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
    <div className='Code'>
      <pre>
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}

```

_From - [DEV](https://dev.to/amitchauhan/syntax-highlighting-with-prismjs-and-react-1lep)_

Apply this code to my project like below.

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

There is something missed, in second method.

```typescript
// [post].tsx

import 'prismjs/components/prism-typescript.min';
import 'prismjs/components/prism-jsx.min';
import 'prismjs/components/prism-tsx.min';

```

I should import language to syntax highlighting.

Fortunately, there is autoloader plugin in Prism.
But, I cannot apply plugin. I think there are some problems with Webpack config, according to error log.

I will check out later, the way to use autoloader.
