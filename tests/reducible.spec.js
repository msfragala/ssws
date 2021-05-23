import { get, reducible } from '../dist';
import test from 'ava';

test('.dispatch() :: Invokes reducer with action and alters value with result', t => {
  const sample = { type: 'change', payload: 'bye' };
  const store = reducible({
    initialState: { name: 'hello' },
    reducer(state, action) {
      t.is(action, sample);
      return { name: action.payload };
    },
  });
  store.dispatch(sample);
  t.deepEqual(get(store), { name: 'bye' });
});

test('.dispatch() :: Replaces state with mutated clone if reducer returns undefined', t => {
  const store = reducible({
    initialState: { name: 'hello' },
    reducer(state, action) {
      state.name = 'bye';
    },
  });
  store.dispatch({ type: 'change' });
  t.deepEqual(get(store), { name: 'bye' });
});

test('.dispatch() :: Replaces state with patched clone if reducer returns partial state', t => {
  const store = reducible({
    initialState: { name: 'hello' },
    reducer(state, action) {
      return { name: 'bye' };
    },
  });
  store.dispatch({ type: 'change' });
  t.deepEqual(get(store), { name: 'bye' });
});

/****************************************
  Generic tests
****************************************/

test('.subscribe() :: Registers a subscription that runs when the value changes', t => {
  let count = 0;
  const store = reducible({ initialState: {}, reducer() {} });
  store.subscribe(() => void (count += 1));
  t.is(count, 1);
  store.dispatch({});
  t.is(count, 2);
});

test('.subscribe() :: Returns an unsubscribe function to remove subscriber', t => {
  let count = 0;
  const store = reducible({ initialState: {}, reducer() {} });
  const unsub = store.subscribe(() => void (count += 1));
  store.dispatch({});
  t.is(count, 2);
  unsub();
  store.dispatch({});
  t.is(count, 2);
});
