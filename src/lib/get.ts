import type { Readable } from '../stores/readable';
import { subscribe } from './utils';

export function get<T>(store: Readable<T>): T {
  let value;
  subscribe(store, v => (value = v))();
  return value;
}
