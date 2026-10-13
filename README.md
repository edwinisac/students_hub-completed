# StudentHub — Full-Stack Student Management

A practical student administration application built with React + Vite and Node.js + Express. It includes authentication, protected routes, persistent file-backed storage, student CRUD, filters, sorting, search, dashboard metrics, course relationships, an undo-delete flow, and a small academic planning utility.

## Requirements
- Node.js 20+ and npm
- Two terminals

## Run it

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
The API runs at `http://localhost:4000`. On first run, it creates `backend/data/db.json` with demo records and a demo account.

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

### Demo login
- Email: `admin@studenthub.local`
- Password: `StudentHub@123`

Change the demo password and `JWT_SECRET` before using this beyond local learning.

## Folder layout
- `frontend/` — React UI, auth context, protected routes, API client, pages, styles
- `backend/` — Express API, JWT authentication, validation, file persistence, DSA modules
- `backend/data/db.json` — local persistent data store (created automatically)

## Four DSA phases implemented meaningfully

### Phase 1 — Linear data structures
- **Linked list:** student records are loaded into a custom singly linked list for list traversal and sequential operations.
- **Stack:** recently deleted students are pushed onto a stack; Undo Restore pops the latest deleted student and restores it.
- **Queue:** a FIFO queue stores pending admin actions in the activity/operations endpoint, so requests can be processed in order.
- **Persistence:** actual application records are stored in the backend JSON file; the data structures are used for application logic, not as the permanent database.

### Phase 2 — Trees and graphs
- **Binary Search Tree (BST):** built from student roll numbers for efficient lookup by roll number. This is an educational in-memory index rebuilt from persisted records.
- **Graph:** students are connected to course/specialization group nodes. BFS and DFS traverse the relationship graph and return reachable related records.

### Phase 3 — Searching and sorting
- Linear search by name/email/roll number.
- BST lookup by numeric roll number.
- Merge sort for student names/marks/roll numbers.
- Sorting supports ascending/descending order and server-side filtering.

### Phase 4 — Algorithmic problem solving
- **Greedy:** a study-planning endpoint selects the highest-priority tasks first within a time budget.
- **Dynamic programming:** a 0/1 knapsack-style planner chooses study tasks that maximize priority under a minute budget.
- **Backtracking:** a timetable helper searches for a conflict-free placement for selected tasks in available time slots.
- These are demonstrative academic-planning features with real application utility, not security- or business-critical logic.

## Important security and production notes
This is a complete local learning project, **not a fully production-hardened deployment**. It includes password hashing with bcrypt, JWT auth, protected API routes, input validation, and environment-based secrets. For real production use, replace JSON-file storage with PostgreSQL/MySQL, add refresh-token/session revocation, rate limiting, CSRF strategy appropriate to the auth design, structured logging, backups, automated tests, HTTPS, and deployment secrets. The JWT is stored in localStorage for simplicity in this learning app; an HttpOnly secure cookie is preferable for many production setups.
