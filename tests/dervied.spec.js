import test from 'ava';
import { writable, derived, get } from '../dist';
test('Store updates when dependencies update', t => {
  const a = writable(2);
  const b = writable(5);
  const store = derived([a, b], ([$a, $b]) => $a * $b, 0, true);
  t.is(get(store), 10);
  a.set(3);
  t.is(get(store), 15);
  b.set(6);
  t.is(get(store), 18);
});

test('Only exposes a subscribe method, and none to alter the value', t => {
  const a = writable(2);
  const store = derived(a, ($a, set) => set($a * 10));
  const keys = Object.keys(store);
  t.deepEqual(keys, ['subscribe', 'value']);
});

/****************************************
  Generic tests
****************************************/

test('.subscribe() :: Registers a subscription that runs when the value changes', t => {
  let count = 0;
  const $a = writable(1);
  const store = derived($a, a => a * 10);
  store.subscribe(() => void (count += 1));
  $a.set(2);
  t.is(count, 2);
});

test('.subscribe() :: Returns an unsubscribe function to remove subscriber', t => {
  let count = 0;
  const $a = writable(1);
  const store = derived($a, a => a * 10);
  const unsub = store.subscribe(() => void (count += 1));
  $a.set(2);
  t.is(count, 2);
  unsub();
  $a.set(2);
  t.is(count, 2);
});
