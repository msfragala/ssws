import { StartStopNotifier, writable, Writable } from './writable';

/** Readable interface for subscribing. */
export type Readable<T> = Omit<Writable<T>, 'set' | 'update'>;

/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier} start start and stop notifications for subscriptions
 */
export function readable<T>(
  value: T,
  start: StartStopNotifier<T>
): Readable<T> {
  return {
    subscribe: writable(value, start).subscribe,
    get value() {
      return value;
    },
  };
}
