# Toggl Toggle

A node library that easily *toggles* the last Toggl entry.

## Usage

```js
const token = '<your-api-token>';
const toggle = require('toggl-toggle');

toggle(token).then(console.log).catch(console.error);
```

**Requires node@>=4.3.2**

## How it works

Sadly there's no native toggle API, so this library makes use of multiple API calls.

The logic flow follows:

```text
let task = getCurrentTask()

if (task):
  stop(task)
else:
  let lastTasks = getLastTask()
  start(lastTasks)
```
