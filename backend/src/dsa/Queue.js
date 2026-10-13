// FIFO queue used to process activity jobs in arrival order.
export default class Queue {
  constructor(items = []) { this.items = [...items]; }
  enqueue(item) { this.items.push(item); }
  dequeue() { return this.items.shift() ?? null; }
  isEmpty() { return this.items.length === 0; }
  toArray() { return [...this.items]; }
}
