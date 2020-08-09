+++
date = "2020-08-05T11:00:00Z"
title = "Code Payne redesign is live!"
type = "post"
tags = ["news"]
+++

The new version of my portfolio site is now live, built with bleeding edge Javascript/Typescript tech. No more Internet Explorer support, let's dive into _the future_.

<!--more-->

The blog/site is still built with Hugo, as it is mostly static content and thus best suited for a static site generator like Hugo to spit out the HTML for. There's nothing particularly fancy needing to be done there! Instead, the site is augmented with additional dynamic features on top of the statically generated content. But the aims of keeping the site lightweight and ultimately _fast_ means that things like Vue and React too were too bloated for my liking. Performance is not just measured in terms of execution speed, but also size of the runtime and loading times.

So, the building blocks of the code starts with the following libraries: [Rythe](https://github.com/Bluefinger/rythe) (the FRP stream library I made), [Mergerino](https://github.com/fuzetsu/mergerino) (a handy object merging library), and [lit-html](https://lit-html.polymer-project.org/) for the view code. No React/Redux combo! _We're making our own state container!_ And we'll be using a stream library and mergerino to acheive this.

Mergerino allows us to _immutably_ merge one object to another, leaving all unmutated values unchanged. Combined with Rythe, we can create a state container that accepts a patch object to merge/accumulate into the main state object.

```typescript
import { createStream, scan } from "rythe";
import merge from "mergerino";

type State = Record<string, unknown>;
type Actions = Record<string, (...args: any[]) => void>;

const initialState: State = {};
const actions: Actions = {};

const update = createStream<Patch<State>>();

const states = update.pipe(scan<Patch<State>, State>(merge, initialState));
```

The above example is the heart of the state container. We can then use `update` to _update_ our state like so:

```typescript
update({
  component: {
    field: "newValue",
  },
});
```

This forms the skeleton of the [_Meiosis pattern_](https://meiosis.js.org/), from which the application is modelled/built with. The principle of one directional data flow as seen with React/Redux applications is applied here, with global state tracking changes and emitting new states that our view code _subscribes_ to.

For Code Payne, the application container allows for not just simple state changes via actions, but also service layers and effects. Updates are throttled using requestAnimationFrame to prevent unneeded renders from occuring quicker than what is getting rendered to screen anyway. There's also a neat way to register components and views so that everything subscribes neatly to the global state.

Thus, the application is split into nice components that control/manage their own state, and then views that render the result of that state. With lit-html, the render pipeline is very simple and quite functional in style:

```typescript
const viewFn = (state, actions) =>
  html`<button @click=${actions.increment}>${state.counter}</button>`;

const app = document.getElementById("app");

states.pipe((state) => render(viewFn(state, actions), app));
```

It's all functions! Functions and streams that act upon _plain ol' data_. Our view code simply subscribes to our state container, updating whenever a new state object is emtted. No classes, decorators, proxies. Simple javascript that leverages native javascript features. lit-html also does not use a VDOM, so it has one less abstraction to worry about! The same principles can also be applied to a React application, particularly when making use of Hooks.

Couple this with a tool like Rollup, and we have small bundle sizes that make use of dynamic imports to only load the code we need on a given page. We can even combine assets like SVGs into an svg sprite for various icons at compile time, and include the CSS for the dynamically loaded components while keeping the main CSS separate.

Overall, for a Filter and Gallery component, the combined amount of code to have this state container + view code is only around 24KB of minified javascript and CSS. That's _before_ being gzipped and includes all our runtime code. The total cost of the React runtime (core + dom library) is at 128KB minified before gzipping and that's just the runtime alone. With Rollup, lit-html can be reduced in size to only include the code needed for the application, and the same with Rythe, as these libraries have been built with _treeshaking_ in mind. The end result is tiny bundles where the runtime is **not** larger than our application code.

And as a final touch, the entirety of the application code is written in Typescript. So there's the further assurance of compile-time type-checking for building a robust application. It has already been a pleasure to use when it came to refactoring code, as well as digging into writing some advanced types:

```typescript
type inferComponent<
  Comp extends Component<any, any>,
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> = Comp extends Component<infer S, infer A>
  ? Component<State extends S ? S : never, Actions extends A ? A : never>
  : never;

export type Register<
  Components extends Component<any, any>[],
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> = {
  [I in keyof Components]: Components[I] extends Component<any, any>
    ? inferComponent<Components[I], State, Actions>
    : never;
};
```

So to conclude, by getting rid of the requirement to support Internet Explorer 11, I've been able to experiment with the offerings of truly modern browsers. Dynamic imports, template string literal driven view code, as well touching upon iterators and generator functions. _The future is now_ and it is smol.

Where can I take this further? Perhaps diving into the world of WebAssembly, [using an ECS to control/manage state on the front-end](https://medium.com/@david.komer/shipyard-dominator-litelement-b4bcdc7ec42d), and more.
