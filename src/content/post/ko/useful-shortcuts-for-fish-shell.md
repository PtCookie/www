---
title: "Fish shell의 유용한 단축키들"
subtitle: "Fish shell은 유저 친화적인 상호작용 shell입니다. Fish shell에는 몇 가지 유용한 키보드 단축키가 있습니다."
brief: "Fish shell\nFish shell은 유저 친화적인 상호작용 shell입니다. Fish shell은 자동 완성, 문법 강조, 웹 기반 설정 등 좋은 기능이 많이 있습니다.\n또한 몇 가지 유용한 키보드 단축키가 있습니다. 그 일부에 대해 알아보도록 하겠습니다.\nMove to previous / next directory\n\nprevd: Alt + Left\n\nnextd: Alt + Right\n\n\npwd # $HOME\n\ncd Downloads # ..."
slug: "useful-shortcuts-for-fish-shell"
locale: "ko"
publishedAt: "2022-12-25T12:00:00+09:00"
readTimeInMinutes: 2
tags:
  - name: "shell"
    slug: "shell"
coverImage:
  url: "../../../assets/covers/ko/useful-shortcuts-for-fish-shell.jpeg"
  attribution: "https://unsplash.com/@szutsi"
  photographer: "Gábor Szűts"
---

## Fish shell

Fish shell은 유저 친화적인 상호작용 shell입니다. Fish shell은 자동 완성, 문법 강조, 웹 기반 설정 등 좋은 기능이 많이 있습니다.

또한 몇 가지 유용한 키보드 단축키가 있습니다. 그 일부에 대해 알아보도록 하겠습니다.

## Move to previous / next directory

* `prevd`: `Alt` + `Left`

* `nextd`: `Alt` + `Right`

```bash
pwd # $HOME

cd Downloads # pwd: $HOME/Downloads/

prevd # pwd: $HOME

nextd # pwd: $HOME/Downloads/
```

## List directory contents

* `ls` 실행: `Alt` + `L`

> `ls`가 무언가의 alias 라면, 그 alias가 실행됩니다.

```bash
SOME_DIRECTORY/ # press `Alt` + `L` to list contents of SOME_DIRECTORY
```

## Using pager

* `&| less` 추가: `Alt` + `P`

* pager로 열기: `Alt` + `O`

```bash
cat SOME_LARGE_TEXT # press `Alt` + `P`
cat SOME_LARGE_TEXT &| less

SOME_LARGE_TEXT # press `Alt` + `O` to open with pager
```

## Need help

* 설명 페이지 열기: `Alt` + `H` or `F1`

* 짧은 설명: `Alt` + `W`

```bash
cat # press `Alt` + `H` or `F1` to show manpage

cat # press `Alt` + `W` to show description
```

## Edit command with external editor

* `$VISUAL`나 `$EDITOR`로 열기: `Alt` + `E` or `Alt` + `V`

```bash
SOME VERY_LONG COMMAND WITH_ARGS # press `Alt` + `E` or `Alt` + `V` to edit

SOME \
VERY_LONG \
COMMAND \
WITH_ARGS # After edit
```

## Run previous command with `sudo`

* 이전 명령어를 `sudo`로 실행하기: `Alt` + `S`

```bash
vim /etc/shells # cannot edit without privilege

sudo vim /etc/shells # press `Alt` + `S` to autocomplete
```

## Reference

* [Fish Shell Tips and Tricks by DistroTube](https://youtu.be/8GN9D-OnG-A)

* [Fish 공식 문서](https://fishshell.com/docs/current/interactive.html#shared-bindings)
