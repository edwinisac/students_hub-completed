class Node {
  constructor(value) { this.value = value; this.next = null; }
}
export default class LinkedList {
  constructor() { this.head = null; this.length = 0; }
  append(value) {
    const node = new Node(value);
    if (!this.head) this.head = node;
    else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }
    this.length++;
  }
  toArray() {
    const result = [];
    let current = this.head;
    while (current) { result.push(current.value); current = current.next; }
    return result;
  }
}
