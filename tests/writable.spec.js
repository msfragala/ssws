import { get, writable } from '../dist';

import test from 'ava';

test('Runs start function when going from 0 to 1 subscribers', t => {
  let count = 0;
  const store = writable({}, () => void (count += 1));
  store.set({});
  store.update(() => []);
  t.is(count, 0);
  const unsub1 = store.subscribe(() => {});
  t.is(count, 1);
  const unsub2 = store.subscribe(() => {});
  t.is(count, 1);
  unsub1();
  unsub2();
  t.is(count, 1);
  store.subscribe(() => {});
  t.is(count, 2);
});

test('Runs stop function when going from 1 to 0 subscribers', t => {
  let count = 0;
  const store = writable({}, () => {
    count += 1;
    return () => (count -= 1);
  });
  const unsub = store.subscribe(() => {});
  t.is(count, 1);
  unsub();
  t.is(count, 0);
});

test('.set() :: Replaces value', t => {
  const store = writable({});
  const a = get(store);
  store.set({});
  const b = get(store);
  t.not(a, b);
});

test('.update() :: Replaces value with result of updater function', t => {
  const store = writable({});
  const a = get(store);
  store.update(() => ({}));
  const b = get(store);
  t.not(a, b);
});

test('.subscribe() :: Registers a subscription that runs when the value changes', t => {
  let count = 0;
  const store = writable({});
  store.subscribe(() => void (count += 1));
  t.is(count, 1);
  store.set({});
  t.is(count, 2);
});

test('.subscribe() :: Returns an unsubscribe function to remove subscriber', t => {
  let count = 0;
  const store = writable({});
  const unsub = store.subscribe(() => void (count += 1));
  store.set({});
  t.is(count, 2);
  unsub();
  store.set({});
  t.is(count, 2);
});
