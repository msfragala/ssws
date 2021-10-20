import { immutable } from './immutable';
import { Readable } from './readable';

export interface Action {
  type: string;
  [key: string]: any;
}

export interface ReducibleOptions<T> {
  initialState: T;
  reducer: (state: T, action: Action) => void | Partial<T>;
}

export interface Reducible<T> extends Readable<T> {}

export function reducible<T>({ initialState, reducer }: ReducibleOptions<T>) {
  const store = immutable(initialState);

  return {
    subscribe: store.subscribe,
    dispatch(action: Action): void {
      store.update(state => reducer(state, action));
    },
  };
}
