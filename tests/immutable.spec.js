import { get } from '../dist';
import { immutable } from '../dist/immutable';
import test from 'ava';

test('.update() :: Replaces value with mutated clone if updater function returns undefined', t => {
  const store = immutable([]);
  store.update(value => void value.push(1));
  t.deepEqual(get(store), [1]);
});

test('.update() :: Replaces value with patched clone if updater function returns partial state', t => {
  const store = immutable({ a: true });
  store.update(value => ({ b: true }));
  t.deepEqual(get(store), { a: true, b: true });
  store.update(value => ({ a: false }));
  t.deepEqual(get(store), { a: false, b: true });
});

/****************************************
  Generic tests
****************************************/

test('Runs start function when going from 0 to 1 subscribers', t => {
  let count = 0;
  const store = immutable({}, () => void (count += 1));
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
  const store = immutable({}, () => {
    count += 1;
    return () => (count -= 1);
  });
  const unsub = store.subscribe(() => {});
  t.is(count, 1);
  unsub();
  t.is(count, 0);
});

test('.subscribe() :: Registers a subscription that runs when the value changes', t => {
  let count = 0;
  const store = immutable({});
  store.subscribe(() => void (count += 1));
  t.is(count, 1);
  store.update(() => []);
  t.is(count, 2);
});

test('.subscribe() :: Returns an unsubscribe function to remove subscriber', t => {
  let count = 0;
  const store = immutable({});
  const unsub = store.subscribe(() => void (count += 1));
  store.update(() => []);
  t.is(count, 2);
  unsub();
  store.update(() => []);
  t.is(count, 2);
});
