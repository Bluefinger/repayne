+++
date = "2016-05-21T15:07:51Z"
title = "CSS Inject"
tags = ["javascript", "css"]
icon = "javascript"
[[resource]]
title = "CSS Inject code example"
src = "css-inject-header.png"
+++

CSS-Inject is a small utility script for handling dynamic injection of CSS styling onto an HTML document. The use case for this utility is to manage the application of styles that would normally be injected inline using jQuery onto many elements.

<!--more-->

In situations where there's a need to apply dynamic styles at page load to many page elements at once, the most efficient way to achieve this is to just apply a single CSS stylesheet to the document head as opposed to iterating through each page element and assigning inline styles.

### How it works

CSS-Inject works by hooking into a browser's CSSStylesheet Object by creating a style element and appending into the document head. From there, it tracks styles added to this stylesheet object. Each change to the stylesheet forces the browser to repaint the document. By applying style changes directly into a stylesheet object as opposed to adding inline styles to every element, this method has the benefit to out-scale performance when dynamically styling many page elements. For individual element styling, inline styles still are quicker than modifying a stylesheet object.

The utility is markedly quicker than jQuery as it is specialised specifically for styling via javascript, not needing the bloat necessary for supporting legacy browsers unlike jQuery. It is also has a small footprint and is AMD/RequireJS compatible.

### Notes

CSS-Inject was a small project I undertook to improve my JS skills, focusing on a small interest of mine on handling a large amount of inline styling in a manner that was performant. At the time, I read about using the stylesheet object as a means to do performant large scale style changes, and so I coded up a small utility to explore both the performance aspect and to improve my coding skills.

The utility is MIT licensed and free to use as is. [Github Repository](https://github.com/Bluefinger/css-inject)
