import {
  Subscriber,
  Invalidator,
  Unsubscriber,
  StartStopNotifier,
  writable,
} from './writable';

/** Readable interface for subscribing. */
export interface Readable<T> {
  /**
   * Subscribe on value changes.
   * @param {Subscriber<T>} run subscription callback
   * @param {Invalidator<T>} invalidate cleanup callback
   */
  subscribe(
    this: void,
    run: Subscriber<T>,
    invalidate?: Invalidator<T>
  ): Unsubscriber;
}

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
  };
}
