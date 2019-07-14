export function filterMap<A, B>(arr: A[], f: (t: A) => B | null): B[] {
  const out: B[] = [];
  arr.forEach(item => {
    const res = f(item);
    if (res === null) {
      return;
    }
    out.push(res);
  });
  return out;
}

export function max(arr: number[]): number {
  return arr.reduce((currMax, i) => Math.max(currMax, i), 0);
}

export function min(arr: number[]): number {
  return arr.reduce((currMin, i) => Math.min(currMin, i), Infinity);
}
