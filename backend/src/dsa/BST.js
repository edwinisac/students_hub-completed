class TreeNode {
  constructor(student) { this.student = student; this.left = null; this.right = null; }
}
export default class StudentBST {
  constructor() { this.root = null; }
  insert(student) {
    const node = new TreeNode(student);
    if (!this.root) { this.root = node; return; }
    let current = this.root;
    while (true) {
      if (student.rollNo < current.student.rollNo) {
        if (!current.left) { current.left = node; return; }
        current = current.left;
      } else if (student.rollNo > current.student.rollNo) {
        if (!current.right) { current.right = node; return; }
        current = current.right;
      } else { current.student = student; return; }
    }
  }
  search(rollNo) {
    let current = this.root;
    while (current) {
      if (rollNo === current.student.rollNo) return current.student;
      current = rollNo < current.student.rollNo ? current.left : current.right;
    }
    return null;
  }
}
