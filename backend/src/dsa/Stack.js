// LIFO: the most recently deleted student is the first one restored.
export default class Stack {
  constructor(items = []) { this.items = [...items]; }
  push(item) { this.items.push(item); }
  pop() { return this.items.pop() ?? null; }
  peek() { return this.items.at(-1) ?? null; }
  size() { return this.items.length; }
  toArray() { return [...this.items]; }
}
