// Bipartite graph: student nodes connect to course/specialization group nodes.
export default class StudentGraph {
  constructor(students) {
    this.adj = new Map();
    const add = (a, b) => {
      if (!this.adj.has(a)) this.adj.set(a, new Set());
      this.adj.get(a).add(b);
    };
    for (const s of students) {
      const studentNode = `student:${s.id}`;
      const courseNode = `course:${s.course}`;
      const specNode = `specialization:${s.specialization}`;
      add(studentNode, courseNode); add(courseNode, studentNode);
      add(studentNode, specNode); add(specNode, studentNode);
    }
  }
  walk(start, depthFirst = false) {
    if (!this.adj.has(start)) return [];
    const seen = new Set([start]), result = [], work = [start];
    while (work.length) {
      const node = depthFirst ? work.pop() : work.shift();
      result.push(node);
      for (const next of this.adj.get(node) || []) {
        if (!seen.has(next)) { seen.add(next); work.push(next); }
      }
    }
    return result;
  }
}
