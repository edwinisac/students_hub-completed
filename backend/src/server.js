import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { ensureDb, readDb, writeDb } from "./store.js";
import { requireAuth } from "./middleware/auth.js";
import LinkedList from "./dsa/LinkedList.js";
import Stack from "./dsa/Stack.js";
import Queue from "./dsa/Queue.js";
import StudentBST from "./dsa/BST.js";
import { mergeSort } from "./dsa/mergeSort.js";
import StudentGraph from "./dsa/StudentGraph.js";
import { greedyPlan, optimalPlan, buildTimetable } from "./dsa/planning.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
const PORT = Number(process.env.PORT) || 4000;
const secret = () => process.env.JWT_SECRET || "development-only-secret";

async function seedAdmin() {
  const db = await readDb();
  if (!db.users.some(u => u.email === "admin@studenthub.local")) {
    db.users.push({
      id: randomUUID(), name: "StudentHub Admin", email: "admin@studenthub.local",
      passwordHash: await bcrypt.hash("StudentHub@123", 12), role: "admin", createdAt: new Date().toISOString()
    });
    await writeDb(db);
  }
}
function safeUser(user) { return { id: user.id, name: user.name, email: user.email, role: user.role }; }
function recordActivity(db, action, detail, userId) {
  const item = { id: randomUUID(), action, detail, userId, createdAt: new Date().toISOString() };
  db.activity.push(item);
  const queue = new Queue(db.activity);
  // FIFO processing demonstration: activity jobs are consumed in arrival order.
  const processed = [];
  while (!queue.isEmpty()) processed.push(queue.dequeue());
  db.activity = processed.slice(-100);
}
function makeList(students) { const list = new LinkedList(); students.forEach(s => list.append(s)); return list; }

app.get("/api/health", (_req,res) => res.json({ status: "ok", service: "StudentHub API" }));

app.post("/api/auth/login", async (req,res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
  const db = await readDb();
  const user = db.users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }
  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, secret(), { expiresIn: "8h" });
  res.json({ token, user: safeUser(user) });
});
app.get("/api/auth/me", requireAuth, async (req,res) => {
  const db = await readDb();
  const user = db.users.find(u => u.id === req.user.sub);
  if (!user) return res.status(401).json({ message: "Account not found." });
  res.json({ user: safeUser(user) });
});
app.post("/api/auth/change-password", requireAuth, async (req,res) => {
  const currentPassword = String(req.body.currentPassword || "");
  const newPassword = String(req.body.newPassword || "");
  if (newPassword.length < 10) return res.status(400).json({ message: "New password must contain at least 10 characters." });
  const db = await readDb();
  const user = db.users.find(u => u.id === req.user.sub);
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) return res.status(400).json({ message: "Current password is incorrect." });
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await writeDb(db);
  res.json({ message: "Password updated. Sign in again next time with your new password." });
});

app.use("/api", requireAuth);

app.get("/api/dashboard", async (_req,res) => {
  const db = await readDb(), students = db.students;
  const active = students.filter(s => s.status === "Active").length;
  const byCourse = {};
  students.forEach(s => { byCourse[s.course] = (byCourse[s.course] || 0) + 1; });
  res.json({ total: students.length, active, onLeave: students.length-active, averageMarks: students.length ? Math.round(students.reduce((n,s)=>n+s.marks,0)/students.length) : 0, byCourse, recentActivity: db.activity.slice(-6).reverse() });
});

app.get("/api/students", async (req,res) => {
  const db = await readDb();
  let students = makeList(db.students).toArray(); // Phase 1: custom linked list traversal
  const q = String(req.query.q || "").trim().toLowerCase();
  const course = String(req.query.course || "");
  const status = String(req.query.status || "");
  if (q) students = students.filter(s => [s.name,s.email,String(s.rollNo),s.specialization].some(v => v.toLowerCase().includes(q))); // linear search
  if (course) students = students.filter(s => s.course === course);
  if (status) students = students.filter(s => s.status === status);
  const sortBy = ["name","rollNo","marks","semester","createdAt"].includes(req.query.sortBy) ? req.query.sortBy : "name";
  students = mergeSort(students, sortBy); // Phase 3: merge sort
  if (req.query.order === "desc") students.reverse();
  res.json({ students, total: students.length, meta: { source: "custom linked list + merge sort", sortBy, order: req.query.order === "desc" ? "desc" : "asc" } });
});
app.post("/api/students", async (req,res) => {
  const { name, email, rollNo, course, specialization, semester, marks, status } = req.body;
  if (!String(name || "").trim() || !String(email || "").trim() || !rollNo || !String(course || "").trim()) return res.status(400).json({ message: "Name, email, roll number, and course are required." });
  const db = await readDb();
  const numericRoll = Number(rollNo), numericMarks = Number(marks ?? 0), numericSemester = Number(semester ?? 1);
  if (!Number.isInteger(numericRoll) || numericRoll <= 0) return res.status(400).json({ message: "Roll number must be a positive integer." });
  if (db.students.some(s => s.rollNo === numericRoll)) return res.status(409).json({ message: "That roll number already exists." });
  if (db.students.some(s => s.email.toLowerCase() === String(email).trim().toLowerCase())) return res.status(409).json({ message: "That email is already registered." });
  if (numericMarks < 0 || numericMarks > 100) return res.status(400).json({ message: "Marks must be between 0 and 100." });
  const student = { id: randomUUID(), rollNo: numericRoll, name: String(name).trim(), email: String(email).trim().toLowerCase(), course: String(course).trim(), specialization: String(specialization || "General").trim(), semester: numericSemester, marks: numericMarks, status: status === "On Leave" ? "On Leave" : "Active", createdAt: new Date().toISOString() };
  db.students.push(student); recordActivity(db,"Student added",`${student.name} (${student.rollNo})`,req.user.sub); await writeDb(db);
  res.status(201).json({ student, message: "Student added successfully." });
});
app.put("/api/students/:id", async (req,res) => {
  const db = await readDb(), index = db.students.findIndex(s => s.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: "Student not found." });
  const old = db.students[index], input = req.body;
  const updated = { ...old, name: String(input.name ?? old.name).trim(), email: String(input.email ?? old.email).trim().toLowerCase(), course: String(input.course ?? old.course).trim(), specialization: String(input.specialization ?? old.specialization).trim(), semester: Number(input.semester ?? old.semester), marks: Number(input.marks ?? old.marks), status: input.status === "On Leave" ? "On Leave" : (input.status === "Active" ? "Active" : old.status) };
  if (!updated.name || !updated.email || updated.marks < 0 || updated.marks > 100) return res.status(400).json({ message: "Check required fields and ensure marks are 0–100." });
  if (db.students.some((s,i)=>i!==index && s.email === updated.email)) return res.status(409).json({ message: "That email is already registered." });
  db.students[index] = updated; recordActivity(db,"Student updated",`${updated.name} (${updated.rollNo})`,req.user.sub); await writeDb(db);
  res.json({ student: updated, message: "Student updated successfully." });
});
app.delete("/api/students/:id", async (req,res) => {
  const db = await readDb(), index = db.students.findIndex(s => s.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: "Student not found." });
  const [student] = db.students.splice(index,1);
  const stack = new Stack(db.deletedStudents); stack.push({ student, deletedAt: new Date().toISOString() }); db.deletedStudents = stack.toArray().slice(-20);
  recordActivity(db,"Student deleted",`${student.name} (${student.rollNo})`,req.user.sub); await writeDb(db);
  res.json({ message: "Student moved to Recently Deleted. You can restore the latest record.", student });
});
app.post("/api/students/undo-delete", async (_req,res) => {
  const db = await readDb(), stack = new Stack(db.deletedStudents), item = stack.pop();
  if (!item) return res.status(404).json({ message: "There are no deleted students to restore." });
  if (db.students.some(s => s.rollNo === item.student.rollNo || s.email === item.student.email)) return res.status(409).json({ message: "A record with the same roll number or email now exists; cannot restore automatically." });
  db.students.push(item.student); db.deletedStudents = stack.toArray(); recordActivity(db,"Student restored",`${item.student.name} (${item.student.rollNo})`, "system"); await writeDb(db);
  res.json({ message: `Restored ${item.student.name}.`, student: item.student });
});
app.get("/api/students/search/roll/:rollNo", async (req,res) => {
  const db = await readDb(), tree = new StudentBST();
  db.students.forEach(s => tree.insert(s));
  const student = tree.search(Number(req.params.rollNo)); // Phase 2: BST lookup
  if (!student) return res.status(404).json({ message: "No student found with that roll number." });
  res.json({ student, meta: { algorithm: "Binary Search Tree", key: "rollNo" } });
});
app.get("/api/students/:id/related", async (req,res) => {
  const db = await readDb(), student = db.students.find(s=>s.id===req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found." });
  const graph = new StudentGraph(db.students);
  const mode = req.query.mode === "dfs" ? "dfs" : "bfs";
  const nodes = graph.walk(`student:${student.id}`, mode === "dfs");
  const relatedIds = nodes.filter(n=>n.startsWith("student:")).map(n=>n.slice(8)).filter(id=>id!==student.id);
  res.json({ student, relatedStudents: db.students.filter(s=>relatedIds.includes(s.id)), meta: { algorithm: mode.toUpperCase(), relationship: "shared course or specialization" } });
});
app.get("/api/activity", async (_req,res) => { const db = await readDb(); res.json(db.activity.slice(-50).reverse()); });
app.get("/api/deleted", async (_req,res) => { const db = await readDb(); res.json(new Stack(db.deletedStudents).toArray().reverse().map(x=>({...x.student, deletedAt:x.deletedAt}))); });

const tasks = [
  { id:"t1", title:"Revise data structures", minutes:45, priority:9 },
  { id:"t2", title:"Practice JavaScript", minutes:30, priority:7 },
  { id:"t3", title:"Review database concepts", minutes:40, priority:8 },
  { id:"t4", title:"Read project documentation", minutes:20, priority:4 },
  { id:"t5", title:"Solve an algorithm problem", minutes:25, priority:8 }
];
app.get("/api/planner/tasks", (_req,res) => res.json(tasks));
app.post("/api/planner/greedy", (req,res) => res.json({ algorithm:"Greedy priority-first", ...greedyPlan(tasks, req.body.budget) }));
app.post("/api/planner/optimal", (req,res) => res.json({ algorithm:"Dynamic programming (0/1 knapsack)", ...optimalPlan(tasks, req.body.budget) }));
app.post("/api/planner/timetable", (req,res) => {
  const slots = [{label:"Morning",capacity:60},{label:"Afternoon",capacity:60},{label:"Evening",capacity:90}];
  res.json({ algorithm:"Backtracking", ...buildTimetable(tasks.slice(0, Number(req.body.taskCount)||3), slots) });
});

app.use((err,_req,res,_next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error." });
});
await ensureDb();
await seedAdmin();
app.listen(PORT, () => console.log(`StudentHub API listening on http://localhost:${PORT}`));
