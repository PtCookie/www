---
title: "Useful shortcuts for fish shell"
subtitle: "Fish shell is friendly interactive shell, and there are some useful keyboard shortcuts."
brief: "Fish shell\nFish shell is friendly interactive shell. It has many great features, like autosuggestions, syntax highlighting, web based configuration, etc.\nIt also has some useful key bindings. Let's look for some of those.\nMove to previous / next dire..."
slug: "useful-shortcuts-for-fish-shell"
locale: "en"
publishedAt: "2022-12-25T12:00:00+09:00"
readTimeInMinutes: 2
tags:
  - name: "shell"
    slug: "shell"
coverImage:
  url: "../../../assets/covers/en/useful-shortcuts-for-fish-shell.jpeg"
  attribution: "https://unsplash.com/@szutsi"
  photographer: "Gábor Szűts"
---

## Fish shell

Fish shell is friendly interactive shell. It has many great features, like autosuggestions, syntax highlighting, web based configuration, etc.

It also has some useful key bindings. Let's look for some of those.

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

* Run `ls`: `Alt` + `L`

> if `ls` is alias for something, that alias will be used.

```bash
SOME_DIRECTORY/ # press `Alt` + `L` to list contents of SOME_DIRECTORY
```

## Using pager

* Append `&| less`: `Alt` + `P`

* Open with pager: `Alt` + `O`

```bash
cat SOME_LARGE_TEXT # press `Alt` + `P`
cat SOME_LARGE_TEXT &| less

SOME_LARGE_TEXT # press `Alt` + `O` to open with pager
```

## Need help

* Open manual page: `Alt` + `H` or `F1`

* Short description: `Alt` + `W`

```bash
cat # press `Alt` + `H` or `F1` to show manpage

cat # press `Alt` + `W` to show description
```

## Edit command with external editor

* Open `$VISUAL` or `$EDITOR`: `Alt` + `E` or `Alt` + `V`

```bash
SOME VERY_LONG COMMAND WITH_ARGS # press `Alt` + `E` or `Alt` + `V` to edit

SOME \
VERY_LONG \
COMMAND \
WITH_ARGS # After edit
```

## Run previous command with `sudo`

* Run previous command with `sudo`: `Alt` + `S`

```bash
vim /etc/shells # cannot edit without privilege

sudo vim /etc/shells # press `Alt` + `S` to autocomplete
```

## Reference

* [Fish Shell Tips and Tricks by DistroTube](https://youtu.be/8GN9D-OnG-A)

* [Fish official docs](https://fishshell.com/docs/current/interactive.html#shared-bindings)
