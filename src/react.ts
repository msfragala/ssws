import { useEffect, useLayoutEffect, useReducer, useRef } from 'react';
import { Readable } from './index';
import dlv from 'dlv';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

function select(state, selector) {
  if (typeof selector === 'function') return selector(state);
  if (typeof selector === 'string') return dlv(state, selector);
  return state;
}

export type Selector<T, S> = string | ((state: T) => S);

export type Comparator<S> = (prev: S, next: S) => boolean;

export function useStore<T, S = T>(
  store: Readable<T>,
  selector?: Selector<T, S>,
  compare: Comparator<S> = (a, b) => a === b
) {
  const [, forceRender] = useReducer(s => s + 1, 0);
  const prevSelector = useRef<Selector<T, S>>();
  const prevState = useRef<T>();
  const prevSelectedState = useRef<S>();

  const state = store.value;
  let selectedState = prevSelectedState.current;

  const revalidate =
    selector !== prevSelector.current || store.value !== prevState.current;

  if (revalidate) {
    const next = select(state, selector);
    if (!compare(next, prevSelectedState.current)) {
      selectedState = next;
    }
  }

  useIsomorphicLayoutEffect(() => {
    prevSelector.current = selector;
    prevState.current = state;
    prevSelectedState.current = selectedState;
  });

  useIsomorphicLayoutEffect(() => {
    return store.subscribe(state => {
      const next = select(state, prevSelector.current);
      if (compare(next, prevSelectedState.current)) return;
      prevSelectedState.current = next;
      prevState.current = state;
      forceRender();
    });
  }, [store]);

  return selectedState;
}
