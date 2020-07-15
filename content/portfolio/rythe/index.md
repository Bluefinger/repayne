+++
date = "2020-01-01T09:00:00Z"
title = "Rythe"
description = "Rythe is a functional reactive stream library written in Typescript, designed to be fast and small"
tags = ["typescript", "javascript"]
icon = "typescript"
+++

Rythe is a functional reactive stream library written in Typescript, with the focus of being both fast and very treeshakeable for small bundle sizes. The project itself was written as a way to explore and learn new programming paradigms for Javascript and further my experience with Typescript.

<!--more-->

Rythe was inspired by looking at the Observables and reactive streams paradigm from the likes of [RxJS](https://github.com/ReactiveX/rxjs), with [Flyd](https://github.com/paldepind/flyd) as another inspiration on the more functional side of things. However, the concept didn't quite click, so I embarked on a project to really understand how it worked and to implement a library taking parts from other libraries while aiming for particular goals.

At it's most simple example, Rythe is a functional stream library, where a function emits to subscribed streams. This takes more the approach formulated by Flyd, in contrast to RxJS.

```typescript
import { createStream, map, filter } from "rythe";

const stream = createStream<number>();

const result = stream.pipe(
  filter((n) => n % 2 === 0),
  map((n) => n ** 2)
);

stream(5)(6); // -> emits two values, 5 & 6.
result(); // -> receives only one value, 36, as 5 was filtered out before being mapped.
```

Given that streams can have multiple parents or multiple dependents, a group of connected streams represents a graph problem in terms of resolving updates. Rythe focuses on providing atomic updates to an entire dependency tree, so one input should always yield one output. Therefore a dependency tree could be described as a directed acyclic graph.

Rythe uses a depth-first recursive search to process all dependent streams, starting from newest to oldest. It does a pass to mark each stream is changing and whether to wait for updates if a stream has more than one parent. It then does a second pass to push the updates to each marked stream.

In general, the performance is quite good, and handles complex dependency trees pretty well while still yielding atomic updates. As Rythe is written to be very treeshakeable, the library is able to be bundled right down to only including code being used in an application, perfect for bundlers like Rollup. The library is small though, coming in at 5.5KB for all the code after bundling/minification. This can be brought down as low as 1KB depending on the use case thanks to Rollup.

Developing Rythe also allowed me to explore more complex types/interfaces in Typescript. Writing a `select` function proved to require some heavy and even recursive types to infer the return type of a deep property access.

```typescript
export type Tail<T extends any[]> = ((...t: T) => any) extends (
  _: any,
  ...tail: infer U
) => any
  ? U
  : [];
export type Length<T extends any[]> = T["length"];
export type First<T extends any[]> = T[0];
export type Key = string | number | symbol;

export type DeepSearch<T extends any, K extends Key[]> = {
  next: First<K> extends keyof T
    ? DeepSearch<NonNullable<T[First<K>]>, Tail<K>>
    : never;
  done: T;
}[Length<K> extends 0 ? "done" : "next"];
```

Getting type inference working on the generic Stream type proved to also be an interesting problem to solve, especially when extracting the wrapped value type from a Stream or array of Streams:

```typescript
export type StreamValue<T> = T extends Stream<infer V> ? V : never;

export type StreamArray<T> = T extends (infer U)[] ? StreamValue<U> : never;

export type StreamTuple<F extends Stream<any>[]> = {
  [K in keyof F]: StreamValue<F[K]>;
};
```

All in all, working on this library was an exercise in exploring both new paradigms, learning approaches to algorithms and deep diving into Typescript's typing and interface magic.

Rythe is available on [Github](https://github.com/Bluefinger/rythe) and is published to NPM. The library is MIT licensed.
