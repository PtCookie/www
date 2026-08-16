---
title: "Horizontal floating display"
subtitle: "Make text floating display like digital signage."
brief: "There are digital signage with floating text on them.\nMake that display with CSS.\nI'll use MUI for base components.\nLet's use Typography to create floating component.\nfunction FloatingText({ children }: { children: ReactNode }) {\n  return (\n    <Typo..."
slug: "horizontal-floating-display"
locale: "en"
publishedAt: "2023-12-28T12:00:00+09:00"
readTimeInMinutes: 2
tags:
  - name: "css"
    slug: "css"
coverImage:
  url: "../../../assets/covers/en/horizontal-floating-display.jpeg"
  attribution: "https://unsplash.com/@lucabravo"
  photographer: "Luca Bravo"
---

There are digital signage with floating text on them.
Make that display with CSS.

I'll use [MUI](https://mui.com/) for base components.

Let's use `Typography` to create floating component.

```typescript
function FloatingText({ children }: { children: ReactNode }) {
  return (
    <Typography
      position={"absolute"}
      left={"100%"}
      variant={"h1"}
      fontWeight={900}
      whiteSpace={"nowrap"}
    >
      {children}
    </Typography>
  );
}
```

Apply `position: absolute` and `left: 100%`, as component will slide in from outside of display.
Adjust font size and weight, and add `white-space: nowrap` to prevent linebreak.

Replicate this component, so that prevent break while next text is sliding in.

```typescript
function FloatingText({ children }: { children: ReactNode }) {
  return (
    <Box position={"relative"} height={"10vh"} display={"flex"} alignItems={"center"}>
      <Typography
        position={"absolute"}
        left={"100%"}
        variant={"h1"}
        fontWeight={900}
        whiteSpace={"nowrap"}
      >
        {children}
      </Typography>
      <Typography
        position={"absolute"}
        left={"100%"}
        variant={"h1"}
        fontWeight={900}
        whiteSpace={"nowrap"}
      >
        {children}
      </Typography>
    </Box>
  );
}
```

Wrap those components with `Box`, and set `position: relative` to become reference for `absolute`.
Set proper height for component, and add `display: flex` and `align-items: center` to align veritcal center.

Add animation with `keyframes`.

```typescript
const carousel = keyframes`
  0% {
    left: 100%;
  }
  100% {
    left: -100%;
  }
`;
```

It starts from `left: 100%`, ends at `left: -100%` as it should slide out to end of display.

Apply animation to components and wrap again to prevent horizontal scroll.

```typescript
function FloatingText({ children }: { children: ReactNode }) {
  return (
    <Box overflow={"hidden"}>
      <Box position={"relative"} height={"10vh"} display={"flex"} alignItems={"center"}>
        <Typography
          position={"absolute"}
          left={"100%"}
          variant={"h1"}
          fontWeight={900}
          whiteSpace={"nowrap"}
          sx={{ animation: `8s linear infinite ${carousel}` }}
        >
          {children}
        </Typography>
        <Typography
          position={"absolute"}
          left={"100%"}
          variant={"h1"}
          fontWeight={900}
          whiteSpace={"nowrap"}
          sx={{ animation: `8s linear infinite ${carousel}`, animationDelay: "4s" }}
        >
          {children}
        </Typography>
      </Box>
    </Box>
  );
}
```

Apply same animation to two components, and delayed animation of second component half of animation duration.
Because the components is off-screen, scroll bar is displayed. So add `overflow: hidden` to prevent this condition.

Completed component looks like below.

```typescript
import { type ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { keyframes } from "@mui/material/styles";

const carousel = keyframes`
  0% {
    left: 100%;
  }
  100% {
    left: -100%;
  }
`;

function FloatingText({ children }: { children: ReactNode }) {
  return (
    <Box overflow={"hidden"}>
      <Box position={"relative"} height={"10vh"} display={"flex"} alignItems={"center"}>
        <Typography
          position={"absolute"}
          left={"100%"}
          variant={"h1"}
          fontWeight={900}
          whiteSpace={"nowrap"}
          sx={{ animation: `8s linear infinite ${carousel}` }}
        >
          {children}
        </Typography>
        <Typography
          position={"absolute"}
          left={"100%"}
          variant={"h1"}
          fontWeight={900}
          whiteSpace={"nowrap"}
          sx={{ animation: `8s linear infinite ${carousel}`, animationDelay: "4s" }}
        >
          {children}
        </Typography>
      </Box>
    </Box>
  );
}

export default function App() {
  return <FloatingText>Floating Text</FloatingText>;
}
```
