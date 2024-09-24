# ssws

SSWS is pronounced "swiss" and stands for `Svelte stores without Svelte`. True to its name, it's essentially just a copy of [Svelte stores](https://svelte.dev/docs#svelte_store) — plus some additional store types and a React hook for subscribing to updates.

## Installation

```sh
npm install ssws
```

## Usage

- [writable](#writable)
- [readable](#readable)
- [derived](#derived)
- [immutable](#immutable)
- [reducible](#reducible)
- [get](#get)
- [useStore](#usestore)

### writable

Creates a store whose state can be updated from the outside via `set` and `update` methods.

```js
import { writable } from 'ssws';
const counter = writable(0);

// Use `set` to replace the current store value:
counter.set(1);

// Use `update` to derive the next state from the current:
counter.update(count => count + 10);
```

### readable

Creates a read-only store whose value cannot be updated from the outside. It has no `set` or `update` methods, only `subscribe`. The value can be updated within the `start` callback, however:

```js
import { readable } from 'ssws';

const time = readable(null, set => {
  set(new Date());

  const interval = setInterval(() => {
    set(new Date());
  }, 1000);

  return () => clearInterval(interval);
});
```

### immutable

Creates a writable store with limitations around how updates work. Immutable stores can only be updated via the `update` method. The callback passed to `update` receives a clone of the current state in order to derive the next. If the callback returns a value, that value is merged with the current state, allowing you to return partial state updates. If the callback returns `undefined` then the cloned state replaces the current state, enabling you to simply mutate the clone.

```js
import { immutable, get } from 'ssws';
const store = immutable({ names: [] });

// Return partial updates to be shallowly merged with the current state
store.update(state => ({ places: [] });

get(store); // { names: [], places: [] }

// Mutate the cloned state directly and return nothing
store.update(state => {
  delete state.places;
  state.names.push('Bailey');
});

get(store); // { names: ['Bailey'] }
```

### reducible

Creates a store that works as a reducer. Rather than methods to set or update state directly, it has a `dispatch` method to pass actions to the reducer. Reducers are immutable since `reducible` is a wrapper around `immutable`. The state that the reducer receives is a clone of the current state, like with `immutable().update`, so reducers can return partial state updates or mutate the cloned state and return nothing.

```js
import { reducible } from 'ssws';

const todoStore = reducible({
  initialValue: { todos: [] },
  reducer(state, action) {
    switch (action.type) {
      case 'DELETE_TODO':
        // Return partial state updates
        return { todos: state.todos.filter(todo => todo !== action.todo) };
      case 'ADD_TODO':
        // Mutate the cloned state directly and return nothing
        state.todos.push(action.todo);
        return;
      default:
        return state;
    }
  }
});

todo.dispatch({ type: 'ADD_TODO, todo: 'Play with puppies' });
```

### derived

Derives a store from one or more other stores. Whenever one of the dependencies updates, the callback runs and the derived store value is recalculated.

```js
import { derived, writable, get } from 'ssws';
const dogs = writable(2);
const cats = writable(0);
const allPets = derived(
  [dogs, cats],
  ([dogCount, catCount]) => dogCount + catCount
);

get(allPets); // 2

cats.set(2);
get(allPets); // 4
```

### get

Synchronously get the current state of a store

```js
import { get, writable } from 'ssws';

const store = writable(0);
get(store); // 0
```

### useStore

Access store state in React components using the `useStore` hook to subscribe to updates. Selectors can be either a function or a string.

```js
import { writable } from 'ssws';
import { useStore } from 'ssws/react';

const $todos = writable({ todos: ['Play with a puppy'] });

function Todos() {
  const todos = useStore($todos, state => state.todos);
  const firstTodo = useStore($todos, 'todos.0');
}
```

`useStore` will only cause a rerender if the selected state changes, based on an equality function. By default, only referential equality is checked. So if you're using `reducible` or `immutable` and your selector returns an object or array, it will likely always fail the equality check and trigger a rerender. If your selector returns a non-primitive value, it's recommended to use multiple `useStore` hooks that do or pass in a custom equality function as a third argument:

```js
import { immutable } from 'ssws';
import { useStore } from 'ssws/react';
import shallowEqual from 'shallowequal';

const $todos = immutable({ todos: [{ title: 'Play with puppies' }] });

function Todos() {
  const firstTodo = useStore($todos, 'todos.0', shallowEqual);
}
```
