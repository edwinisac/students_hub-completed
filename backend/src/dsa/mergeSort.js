export function mergeSort(items, key) {
  if (items.length <= 1) return [...items];
  const middle = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, middle), key);
  const right = mergeSort(items.slice(middle), key);
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    const a = left[i][key], b = right[j][key];
    const cmp = typeof a === "string" ? a.localeCompare(String(b)) : Number(a) - Number(b);
    if (cmp <= 0) result.push(left[i++]); else result.push(right[j++]);
  }
  return result.concat(left.slice(i), right.slice(j));
}
