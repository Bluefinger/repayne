+++
date = "2018-02-15T15:00:00Z"
title = "CSS Inject 2"
tags = ["javascript", "css"]
icon = "javascript"
+++

CSS-Inject 2 is a rewrite of [CSS-Inject]({{< ref "portfolio/css-inject.md" >}}), using more modern style of JS to implement a utility for handling dynamic injection of CSS styling onto an HTML document. Just like CSS-Inject before, the use case for CSS-Inject 2 is to manage styles that would normally be applied inline using jQuery onto many html elements.

<!--more-->

CSS-Inject 2 shines in applications where a lot of dynamic styling is occuring on a page across many page elements. The most efficient way to manage this is to instantiate a single stylesheet and apply CSS rules directly to it instead of inlining all the styles on each individual element.

### How it works

CSS-Inject 2 works by getting a CSSStylesheet Object through creating a style element and attaching it to the document head. Once instantiated, CSS-Inject 2 tracks what styles have been applied to the stylesheet. Each change to the stylesheet however, forces the browser to repaint the document so there's still some management required on how and when styles are applied for optimal performance. But by applying style changes directly into a stylesheet object as opposed to adding inline styles to every element, this has the benefit of out-scaling performance when compared to dynamically styling many page elements. For individual element styling, inline styles still are quicker than modifying a stylesheet object.

CSS-Inject 2 provides an interface for styling a page via Javascript and does so without the unnecessary bloat of jQuery. CSS-Inject 2 is packaged as a standalone UMD module, so is compatible with AMD/CommonJs or standard browser environments.

### Notes

CSS-Inject 2 is a quick project I undertook to showcase my current level of JS code knowledge by working off a base of the older CSS-Inject. Mostly to demonstrate my approach to coding, modern tooling and as well as learning documentation styles for further projects.

The utility is MIT licensed and free to use as is. [Github Repository](https://github.com/Bluefinger/CSS-Inject-2)
