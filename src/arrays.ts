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

export function removeAt<T>(arr: T[], idx: number): T[] {
  const out: T[] = [];
  arr.forEach((item, i) => {
    if (i === idx) {
      return;
    }
    out.push(item);
  });
  return out;
}

export function intersection<T>(as: T[], bs: T[]): T[] {
  const int: T[] = [];
  as.forEach(a => {
    if (bs.indexOf(a) !== -1) {
      int.push(a);
    }
  });
  return int;
}

export function union<T>(as: T[], bs: T[]): T[] {
  const out: T[] = [];
  as.forEach(a => {
    out.push(a);
  });
  bs.forEach(b => {
    if (as.indexOf(b) !== -1) {
      return;
    }
    out.push(b);
  });
  return out;
}

export function without<T>(as: T[], without: T[]): T[] {
  const out: T[] = [];
  as.forEach(a => {
    if (without.indexOf(a) !== -1) {
      return;
    }
    out.push(a);
  });
  return out;
}
