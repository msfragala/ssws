import { Readable, StartStopNotifier, writable } from '.';

import { klona } from 'klona';

export type ImmutableUpdater<T> = (value: T) => void | Partial<T>;

export interface Immutable<T> extends Readable<T> {
  /**
   * Update value using callback and inform subscribers.
   * @param updater callback
   */
  update(this: void, updater: ImmutableUpdater<T>): void;
}

/**
 * Create an immutable `Writable` store that allows both updating and reading by subscription.
 * Updater functions receive a clone of the current value.
 * If the updater function returns nothing, then any mutations to the cloned value as copied to the
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
export function immutable<T>(
  value: T,
  start?: StartStopNotifier<T>
): Immutable<T> {
  const store = writable(value, start);

  return {
    subscribe: store.subscribe,
    update(fn: ImmutableUpdater<T>) {
      store.update(state => {
        const clone = klona(state);
        const next = fn(clone);
        return next === undefined ? clone : { ...state, ...next };
      });
    },
  };
}
