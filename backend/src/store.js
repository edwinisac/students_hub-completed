import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, "../data");
const dbPath = path.join(dataDir, "db.json");

const initialDb = {
  users: [],
  students: [
    { id: "stu-1001", rollNo: 1001, name: "Aarav Menon", email: "aarav@example.com", course: "MCA", specialization: "Cloud Computing", semester: 1, marks: 86, status: "Active", createdAt: "2026-07-15T08:00:00.000Z" },
    { id: "stu-1002", rollNo: 1002, name: "Diya Nair", email: "diya@example.com", course: "MCA", specialization: "Data Science", semester: 1, marks: 92, status: "Active", createdAt: "2026-07-16T08:00:00.000Z" },
    { id: "stu-1003", rollNo: 1003, name: "Ishaan Thomas", email: "ishaan@example.com", course: "BCA", specialization: "Full Stack", semester: 3, marks: 74, status: "Active", createdAt: "2026-07-17T08:00:00.000Z" },
    { id: "stu-1004", rollNo: 1004, name: "Meera Joseph", email: "meera@example.com", course: "MCA", specialization: "Cloud Computing", semester: 2, marks: 81, status: "On Leave", createdAt: "2026-07-18T08:00:00.000Z" },
    { id: "stu-1005", rollNo: 1005, name: "Rohan Das", email: "rohan@example.com", course: "BSc CS", specialization: "Cybersecurity", semester: 4, marks: 67, status: "Active", createdAt: "2026-07-19T08:00:00.000Z" },
    { id: "stu-1006", rollNo: 1006, name: "Ananya Pillai", email: "ananya@example.com", course: "BCA", specialization: "Data Science", semester: 2, marks: 88, status: "Active", createdAt: "2026-07-20T08:00:00.000Z" }
  ],
  activity: [],
  deletedStudents: []
};

export async function ensureDb() {
  await fs.mkdir(dataDir, { recursive: true });
  try { await fs.access(dbPath); }
  catch {
    await fs.writeFile(dbPath, JSON.stringify(initialDb, null, 2));
  }
}
export async function readDb() {
  await ensureDb();
  return JSON.parse(await fs.readFile(dbPath, "utf8"));
}
export async function writeDb(db) {
  await ensureDb();
  const tempPath = `${dbPath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(db, null, 2));
  await fs.rename(tempPath, dbPath);
}
