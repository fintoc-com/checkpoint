<h1 align="center">Checkpoint</h1>

> Tired of always failing in life? Well, we cannot help with that. But we can help you fail less in a node application.

[![npm package][npm-img]][npm-url]
[![Downloads][downloads-img]][downloads-url]
[![Code Coverage][codecov-img]][codecov-url]



`checkpoint` is the ultimate flaky code helper. With modern days applications, where we must integrate with external services, which can fail. We have to figure out a way of retrying our code. We must go back to somewhere we know we where fine. We must return to a `checkpoint`.

## Install

```bash
npm install @fintoc/checkpoint
```

## Usage

```ts
import { checkpoint, retry } from '@fintoc/checkpoint';

// we define how many retries we can make
await checkpoint({ retries: 3 }, () => {
  // do some awesome stuff
  // ...
  // ...

  // this is weird, this number should not be bigger than the other
  if (someNumber < otherNumber) retry();

  try {
    // solving SAT in polynomial time
  } catch (error) {
    // this error is a flaky one, we should just retry
    retry();
  }
});
```

### Nested Checkpoints
At one point or another, we might want to set different checkpoints, and to go back to which ever checkpoint we want. We can do this by specifying a name for a specific checkpoint.

```ts
await checkpoint({ name: 'first' }, async () => {
  // doing really important stuff
  // ...

  await checkpoint({ name: 'second' }, () => {

    if (somethingHappends) {
      // something went horrible, we must go even further back
      retry('first');
    }
  });
});
```

### On Retry Callback
We might have to perfom some operations in order to come back to a useful state in order to retry our code. We can set this by using the `onRetry` callback option.

```ts
function onRetry() {
  a = 0;
}
await checkpoint({ onRetry }, () => {

  // a changes its value

  if (someThingHappends) {
     retry(); // a will start at 0 at the next try
  }
});
```

### Checkpoint Options
The checkpoint options are as followed:

```ts
{
  name: 'checkpointId', // checkpoint name to reference in retries, defaults to null
  logger: console.log, // function to log the checkpoint execution, defaults to null
  retries: 3, // how many retries are available before raising an error, defaults to 1
  onRetry: () => { // specify a callback before retrying
    // do things
  },
  onFailure: () => { // specify a callback when retry limit is reached
    // raise custom error or whatever you want
  },
}
```

### Return Value
Additionally, the `checkpoint` function returns the value of the callback function passed as its parameter (if the function reaches a return value before any `retry` or exception). In the case in which the checkpoint reaches the retry limit, then the checkpoint returns the value of the `onFailure` function

```ts
function onFailure() {
  return 'failed'
}

// returnValue might endup being 'failed' or 'success'
const returnValue = await checkpoint({ onFailure }, () => {
  ...
  // it may retry at some point
  ...
  return 'success'
});
```

[downloads-img]:https://img.shields.io/npm/dt/@fintoc/checkpoint
[downloads-url]:https://www.npmtrends.com/@fintoc/checkpoint
[npm-img]:https://img.shields.io/npm/v/@fintoc/checkpoint
[npm-url]:https://www.npmjs.com/package/@fintoc/checkpoint
[codecov-img]:https://codecov.io/gh/ryansonshine/typescript-npm-package-template/branch/main/graph/badge.svg
[codecov-url]:https://codecov.io/gh/ryansonshine/typescript-npm-package-template
