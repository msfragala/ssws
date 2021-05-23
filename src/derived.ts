import { isFunction, noop, runAll, subscribe } from './lib/utils';
import { readable, Readable } from './readable';
import { Unsubscriber } from './writable';

/** One or more `Readable`s. */
type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>];

/** One or more values from `Readable` stores. */
type StoresValues<T> = T extends Readable<infer U>
  ? U
  : { [K in keyof T]: T[K] extends Readable<infer U> ? U : never };

/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * @param stores - input stores
 * @param fn - function callback that aggregates the values
 * @param initial_value - when used asynchronously
 */
export function derived<S extends Stores, T>(
  stores: S,
  fn: (values: StoresValues<S>, set: (value: T) => void) => Unsubscriber | void,
  initial_value?: T
): Readable<T>;

/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * @param stores - input stores
 * @param fn - function callback that aggregates the values
 * @param initial_value - initial value
 */
export function derived<S extends Stores, T>(
  stores: S,
  fn: (values: StoresValues<S>) => T,
  initial_value?: T
): Readable<T>;

/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * @param stores - input stores
 * @param fn - function callback that aggregates the values
 */
export function derived<S extends Stores, T>(
  stores: S,
  fn: (values: StoresValues<S>) => T
): Readable<T>;

export function derived<T>(
  stores: Stores,
  fn: Function,
  initial_value?: T
): Readable<T> {
  const single = !Array.isArray(stores);
  const stores_array: Array<Readable<any>> = single
    ? [stores as Readable<any>]
    : (stores as Array<Readable<any>>);

  const auto = fn.length < 2;

  return readable(initial_value, set => {
    let inited = false;
    const values = [];

    let pending = 0;
    let cleanup = noop;

    const sync = () => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set);
      if (auto) {
        set(result as T);
      } else {
        cleanup = isFunction(result) ? (result as Unsubscriber) : noop;
      }
    };

    const unsubscribers = stores_array.map((store, i) =>
      subscribe(
        store,
        value => {
          values[i] = value;
          pending &= ~(1 << i);
          if (inited) {
            sync();
          }
        },
        () => {
          pending |= 1 << i;
        }
      )
    );

    inited = true;
    sync();

    return function stop() {
      runAll(unsubscribers);
      cleanup();
    };
  });
}
