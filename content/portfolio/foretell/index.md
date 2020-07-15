+++
date = "2019-09-25T09:00:00Z"
title = "Foretell"
description = "Foretell is a Promise/A+ 1.1 implementation in Typescript, with a focus on being both fast and tiny"
tags = ["typescript", "javascript"]
icon = "typescript"
+++

Foretell is a Promise/A+ 1.1 implementation in Typescript, with a focus on being both a *fast* Promise polyfill library as well as *tiny*. The project itself was an exercise in writing code that targets a spec as well as seeing how far I could optimise an implementation.

<!--more-->

Foretell was inspired by looking at the [Zousan](https://github.com/bluejava/zousan) library, another Promise/A+ 1.1 implementation that focuses on being both small and tiny. Part of learning to understand the underlying mechanisms for Promises in Javascript was by examining a number of Promise libraries and seeing how they implemented things.

Initially, I used the promises-aplus-tests library to provide the specification tests for the project, but due to it being unmaintained, I eventually brought in the tests manually and ran them through Typescript too as an extra measure. Further tests were added to cover parts of the library not covered by the specifications.

Foretell is written around using a class with private variables and methods tracking its state, and powered by a queue for deferring task execution. The code was based on what made Zousan fast, but a few improvements were made to further boost performance and allow for smaller file sizes.

```javascript
function callQueue()
{
  while(fq.length - fqStart) // this approach allows new yields to pile on during the execution of these
  {
    try { fq[fqStart]() } // no context or args..
    catch(err) { Zousan.error(err) }
    fq[fqStart++] = _undefined	// increase start pointer and dereference function just called
    if(fqStart == bufferSize)
    {
      fq.splice(0,bufferSize)
      fqStart = 0
    }
  }
}
```

Code example from Zousan's queue implementation wrapped the execution in a `try` block, and used `splice` to trim the queue down once the pointer variable hit a certain size. While fast, I saw room for optimisation. First, execution didn't need to be wrapped in a `try` block since it was already being handled within the promise execution model. The second optimisation here was then switching the use of `splice` with `slice`.

`splice` yields an array of removed values *and* mutates the original array. Thus it invokes array creation and also mutation, allocating memory for an array that will be immediately garbage collected and then allocating space for the mutated original array. For Foretell, the optimised code looks as follows:

```typescript
const flushQueue = () => {
  // Loops until the result of length vs pointer equals 0, a
  // falsey value. Then the while loop terminates.
  while (queue.length - pointer) {
    // executeTasks returns void, so acts as a quick setting of `undefined`
    // without needing to do it explicitly, shaving off a few bytes.
    queue[pointer] = executeTasks(queue[pointer]);
    // Pre-increment pointer value before comparison here, allows for
    // smaller build code while still advancing the loop.
    if (++pointer === QUEUE_SIZE) {
      // Slice new state of queue instead of splice to create one single new array
      // with the correct 'view' of queued tasks.
      // This is instead of creating a new array AND mutating the original as
      // with splice. Results in faster ops for shrinking the queue.
      // slice() also requires less arguments and is shorter, so more shaved bytes
      queue = queue.slice(QUEUE_SIZE);
      // Pointer reset to zero to point to start of new queue state.
      pointer = 0;
    }
  }
};
```

`slice` however *does not mutate* the original array, leaving it unmolested. It only creates a new array. It performs one memory operation versus the two of `splice`. On the space savings side, the method is also shorter and needs only one parameter for this use case compared to `splice`. Shaving all the bytes! (Just a few actually, but still...)

The pointer increment is done at the comparison step with a preincrement. This makes it easier to reason when accessing and modifying the queue position. `executeTasks` however presents another optimisation in itself. The function itself returns `void` so in `flushQueue`, it acts as an implicit assignment of `undefined`, like what Zousan is doing. Two lines of code to one line!

`executeTasks` however accepts not just a Foretell promise, *but also an array of Foretell promises*. Why would we want to do that? Turns out, allocating to the queue is not without overhead, so one way to optimise is to reduce the amount of allocations we need in order to process all potential tasks.

```typescript
// To minimise allocations to the queue, both array and non-array
// values are allowed to be added to the queue. This means that
// client arrays can be directly accessed and iterated on instead of
// each client promise being added individually. This results in less
// churn with the queue and thus more performance.
const executeTasks = (tasks: any | any[]): void => {
  // Accessing the protected method here is 'allowed' as this is
  // internal code only. Outside of this scope, this and the method
  // name will be mangled anyway for saving space and obfuscation.
  if (isArray(tasks)) {
    for (let i = 0; i < tasks.length; i += 1) tasks[i].$$Execute$$();
  } else {
    tasks.$$Execute$$();
  }
};
```

Due to Typescript restrictions on accessing private/protected methods, I'm cheating here by using `any` to get around these restrictions. This is considered *unsafe* for good reason, but this queue and this function are only ever used within the context of Foretell and is never exposed to outside use. Thus we can make some assumptions on any invariants and represents an implementation detail. When chasing performance, one might have to do... unsavoury things to reach one's goals.

The circumstance though for adding an array of promises is when there are many *client* promises waiting on a parent promise to resolve. When the parent resolves, the clients are added to the queue to be resolved as well. In Zousan, they opt to create a function which they then add to the queue to eventually execute.

```javascript
if(clients)
  soon(function() {
      for(let n=0, l=clients.length;n<l;n++)
        rejectClient(clients[n],reason)
    })
```

Foretell opts to avoid creating functions (less stuff being allocated/deallocated) and just passes the promise into the queue to process. But with an array of clients to be resolved, Foretell simply queues the array instead:

```typescript
if (clients) {
  // Simply defer the entire clients queue instead of
  // adding each client promise individually
  defer(clients);
}
```

And the `defer` function then looks like so:

```typescript
const defer = (then: Foretell<any> | Foretell<any>[]) => {
  if (queue.push(then) - pointer === 1) schedule();
};
```

Referring back to `executeTasks`, it then checks whether the task is an array or a single promise, executing the task accordingly. This then reduces the amount of queueing that has to occur.

Foretell's optimisations focused around minimising object/function creation, as well as taking advantage of more modern APIs where possible for allocating microTasks. By focusing on writing with very specific goals in mind, it has allowed Foretell to not only yield better performance than Zousan, but also smaller file sizes thanks to more aggressive minification optimisations and settings.

The code is available on [Github](https://github.com/Bluefinger/foretell) and is published to NPM. Foretell is MIT licensed.
