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
