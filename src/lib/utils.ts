import type { Readable } from '../readable';

export function noop() {}

export function runAll(fns) {
  fns.forEach(run);
}

export function run(fn) {
  return fn();
}

export function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}

export function safeNotEqual(a, b) {
  return a != a
    ? b == b
    : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

export function isFunction(thing: any): thing is Function {
  return typeof thing === 'function';
}

export function getStoreValue<T>(store: Readable<T>): T {
  let value;
  subscribe(store, v => (value = v))();
  return value;
}
