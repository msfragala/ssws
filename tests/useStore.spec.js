import 'global-jsdom/esm/register';
import React, { createElement } from 'react';
import { cleanup, render } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import test from 'ava';
import { get, writable } from '../dist';
import { useStore } from '../dist/react';

test.afterEach(cleanup);

test('When no selector, returns the current store value', t => {
  const store = writable(0);
  const { result } = renderHook(() => useStore(store));
  t.is(result.current, 0);
  store.set(1);
  t.is(result.current, 1);
});

test('When selector is function, returns selected state from current store value', t => {
  const store = writable({ count: 0 });
  const selectCount = state => state.count;
  const { result } = renderHook(() => useStore(store, selectCount));
  t.deepEqual(result.current, 0);
  store.set({ count: 1 });
  t.deepEqual(result.current, 1);
  store.set({});
  t.deepEqual(result.current, undefined);
});

test('When selector is string, returns selected path from current store value', t => {
  const store = writable({ a: { b: { c: 0 } } });
  const { result } = renderHook(() => useStore(store, 'a.b.c'));
  t.deepEqual(result.current, 0);
  store.set({ a: { b: { c: 1 } } });
  t.deepEqual(result.current, 1);
  store.set({});
  t.deepEqual(result.current, undefined);
});

test('Avoids rerender when store updates but selected state is same', t => {
  const store = writable({ count: 0 });
  const { result } = renderHook(() => useStore(store, 'count'));
  t.deepEqual(result.all, [0]);
  store.set({ count: 0 });
  t.deepEqual(result.all, [0]);
  store.set({ count: 1 });
  t.deepEqual(result.all, [0, 1]);
});

test('Avoids rerender when selector changes but selected state is same', t => {
  const store = writable({ name: 'a' });
  let count = 0;

  const Component = () => {
    const name = useStore(store, s => s.name);
    count += 1;
    return null;
  };

  render(React.createElement(Component));

  t.is(count, 1);
  store.set({ name: 'a' });
  t.is(count, 1);
  store.set({ name: 'b' });
  t.is(count, 2);
});

test('When store updates, uses latest selector', t => {
  let selectorId;
  const store = writable({});
  const createSelector = id => () => (selectorId = id);
  let selector = createSelector(1);

  const { rerender } = renderHook(() => useStore(store, selector));
  t.is(selectorId, 1);

  selector = createSelector(2);
  rerender();
  t.is(selectorId, 2);
});

test('Compares selected states via reference check when no compare function provided', t => {
  let count = 0;
  const value = { letter: 'b' };
  const store = writable({ letter: 'a' });
  store.subscribe(() => ++count);
  const { result } = renderHook(() => useStore(store, 'letter'));
  t.deepEqual(result.all, ['a']);
  t.is(count, 1);

  store.set(value);
  t.deepEqual(result.all, ['a', 'b']);
  t.is(count, 2);

  store.set(value);
  t.deepEqual(result.all, ['a', 'b']);
  t.is(count, 3);
});

test('Compares selected state via custom compare function when provided', t => {
  let count = 0;
  const compare = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const store = writable({ letter: 'a' }, undefined, compare);
  store.subscribe(() => ++count);
  const { result } = renderHook(() => useStore(store, 'letter'));
  t.deepEqual(result.all, ['a']);
  t.is(count, 1);

  store.set({ letter: 'b' });
  t.deepEqual(result.all, ['a', 'b']);
  t.is(count, 2);

  store.set({ letter: 'b' });
  t.deepEqual(result.all, ['a', 'b']);
  t.is(count, 3);
});

test('Unsubscribes when component unmounts', t => {
  let count = 0;
  const store = writable([], () => {
    count += 1;
    return () => (count -= 1);
  });

  const Component = () => {
    const name = useStore(store, s => s.name);
    return null;
  };

  const { unmount } = render(React.createElement(Component));
  t.is(count, 1);
  unmount();
  t.is(count, 0);
});
