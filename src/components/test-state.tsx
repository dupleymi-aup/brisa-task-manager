import type { WebContext } from 'brisa';

export default function Test({ state }: WebContext) {
  const count = state(0);
  return <div>{count.value}</div>;
}