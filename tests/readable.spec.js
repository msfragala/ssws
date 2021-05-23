import { get, readable } from '../dist';

import EventEmitter from 'events';
import test from 'ava';

test('Only exposes a subscribe method, and none to alter the value', t => {
  const store = readable(null);
  const keys = Object.keys(store);
  t.deepEqual(keys, ['subscribe']);
});

/****************************************
  Generic tests
****************************************/

test('Runs start function when going from 0 to 1 subscribers', t => {
  let count = 0;
  const store = readable(null, () => void ++count);
  t.is(count, 0);
  const unsub1 = store.subscribe(() => {});
  t.is(count, 1);
  const unsub2 = store.subscribe(() => {});
  t.is(count, 1);
  unsub1();
  unsub2();
  store.subscribe(() => {});
  t.is(count, 2);
});

test('Runs stop function when going from 1 to 0 subscribers', t => {
  let count = 0;
  const store = readable(null, () => {
    ++count;
    return () => void --count;
  });
  t.is(count, 0);
  const unsub = store.subscribe(() => {});
  t.is(count, 1);
  unsub();
  t.is(count, 0);
});

test('Value can be altered within start function', t => {
  const ee = new EventEmitter();
  const store = readable(null, set => void ee.on('change', set));
  store.subscribe(() => {});
  ee.emit('change', 'hello');
  t.is(get(store), 'hello');
});

test('.subscribe() :: Registers a subscription that runs when the value changes', t => {
  let count = 0;
  const ee = new EventEmitter();
  const store = readable(null, set => void ee.on('change', set));
  store.subscribe(() => void (count += 1));
  ee.emit('change', {});
  t.is(count, 2);
});

test('.subscribe() :: Returns an unsubscribe function to remove subscriber', t => {
  let count = 0;
  const ee = new EventEmitter();
  const store = readable(null, set => void ee.on('change', set));
  const unsub = store.subscribe(() => void (count += 1));
  ee.emit('change', {});
  t.is(count, 2);
  unsub();
  ee.emit('change', {});
  t.is(count, 2);
});
