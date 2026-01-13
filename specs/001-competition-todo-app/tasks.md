# Tasks: Competition-Winning Full-Stack Todo Application (Phase II)

**Input**: Design documents from `/specs/001-competition-todo-app/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅
**Target**: 1st Place (98/100 score) in Hackathon II
**Timeline**: 40-48 hours over December 12-14, 2025

**Tests**: Manual testing approach (see Phase 6). Automated tests are OPTIONAL for this competition timeline.

**Organization**: Tasks grouped by functional requirement (FR) to enable systematic implementation and testing.

## Format: `[ID] [P?] [FR] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[FR]**: Which functional requirement this task belongs to (FR1-FR7)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `backend/` and `frontend/` at repository root
- Backend: `backend/app/` for source code
- Frontend: `frontend/` with Next.js App Router structure
- Tests: Within respective backend/frontend directories

---

## Phase 1: Setup & Project Initialization (4-6 hours)

**Purpose**: Create project structure, install dependencies, configure tools

- [ ] T001 Create root project directory structure (backend/, frontend/, .gitignore, README.md)
- [ ] T002 [P] Initialize backend Python project with venv in backend/
- [ ] T003 [P] Initialize frontend Next.js 16 project with TypeScript in frontend/
- [ ] T004 [P] Create backend directory structure (backend/app/models, backend/app/routers, backend/app/schemas, backend/app/services, backend/app/utils, backend/alembic)
- [ ] T005 [P] Create frontend directory structure (frontend/app, frontend/components/ui, frontend/components/tasks, frontend/components/auth, frontend/components/layout, frontend/lib/api, frontend/lib/hooks, frontend/lib/types, frontend/lib/utils)
- [ ] T006 [P] Install backend dependencies from requirements.txt (FastAPI, SQLModel, Alembic, PyJWT, passlib, slowapi, etc.)
- [ ] T007 [P] Install frontend dependencies from package.json (Next.js 16, React 19, TanStack Query, Tailwind CSS, Framer Motion, etc.)
- [ ] T008 [P] Configure TypeScript strict mode in frontend/tsconfig.json
- [ ] T009 [P] Configure Tailwind CSS in frontend/tailwind.config.js with custom theme
- [ ] T010 [P] Configure ESLint and Prettier for frontend
- [ ] T011 [P] Generate JWT secret using Python secrets module and document in backend/.env.example
- [ ] T012 Create Neon PostgreSQL database and note connection string in backend/.env

**Checkpoint**: Project structure ready, dependencies installed, tools configured

---

## Phase 2: Foundational Infrastructure (BLOCKS all feature work)

**Purpose**: Core infrastructure that MUST be complete before ANY functional requirement can be implemented

**⚠️ CRITICAL**: No feature work can begin until this phase is complete

### Backend Foundation

- [ ] T013 Create backend/app/config.py with Pydantic Settings for environment variables
- [ ] T014 Create backend/app/database.py with SQLModel engine and connection pooling (pool_size=10, max_overflow=20)
- [ ] T015 Create backend/app/main.py with FastAPI app initialization, CORS middleware, and rate limiter setup
- [ ] T016 Add health check endpoint GET /health in backend/app/main.py
- [ ] T017 [P] Initialize Alembic for database migrations in backend/alembic/
- [ ] T018 [P] Configure Alembic env.py to use SQLModel metadata and settings.database_url

### Frontend Foundation

- [ ] T019 Create frontend/lib/queryClient.ts with TanStack Query client configuration (5min staleTime, 10min gcTime)
- [ ] T020 Create frontend/lib/api.ts with Axios instance and JWT interceptors (request: add Bearer token, response: handle 401)
- [ ] T021 Create frontend/lib/types/index.ts with TypeScript interfaces for User, Task, Tag, AuthResponse
- [ ] T022 Create frontend/app/layout.tsx as root layout with Inter font
- [ ] T023 Create frontend/app/providers.tsx with QueryClientProvider and Toaster
- [ ] T024 Create frontend/app/globals.css with Tailwind directives
- [ ] T025 Create frontend/.env.local with NEXT_PUBLIC_API_URL=http://localhost:8001

### Database Schema

- [ ] T026 Create backend/app/models/user.py with User model (id UUID, email, name, password_hash, created_at, updated_at)
- [ ] T027 Create backend/app/models/task.py with Task model and PriorityEnum (id, user_id, title, description, completed, priority, category, due_date, estimated_minutes, created_at, updated_at)
- [ ] T028 Create backend/app/models/tag.py with Tag model (id, user_id, name, color, created_at)
- [ ] T029 Create backend/app/models/tag.py with TaskTag junction model (task_id, tag_id as composite primary key)
- [ ] T030 Generate Alembic migration with `alembic revision --autogenerate -m "Initial schema"`
- [ ] T031 Apply migration with `alembic upgrade head` and verify tables created in Neon dashboard

### Deployment Setup

- [ ] T032 Create backend/railway.toml with deployment configuration (startCommand, healthcheckPath)
- [ ] T033 Create frontend/vercel.json with Next.js deployment configuration
- [ ] T034 [P] Deploy backend to Railway and configure environment variables (DATABASE_URL, JWT_SECRET, CORS_ORIGINS)
- [ ] T035 [P] Deploy frontend to Vercel and configure environment variables (NEXT_PUBLIC_API_URL)
- [ ] T036 Test deployed health check endpoint at https://your-api.railway.app/health
- [ ] T037 Verify frontend loads at https://your-app.vercel.app
- [ ] T038 Update Railway CORS_ORIGINS to include Vercel URL

**Checkpoint**: Foundation complete - FastAPI running, Next.js running, database connected, deployed

---

## Phase 3: FR-1 Authentication & Authorization (4-5 hours) 🎯 CRITICAL

**Goal**: Secure user signup, login, logout, JWT token management, multi-user data isolation

**Independent Test**: Create two user accounts, verify each sees only their own data

### Authentication Utilities

- [ ] T039 [P] [FR1] Create backend/app/utils/auth.py with hash_password() and verify_password() functions using bcrypt cost 12
- [ ] T040 [P] [FR1] Create backend/app/utils/jwt.py with create_access_token() and verify_token() functions using PyJWT HS256
- [ ] T041 [FR1] Create backend/app/utils/dependencies.py with get_current_user() FastAPI dependency using HTTPBearer

### Authentication Schemas

- [ ] T042 [P] [FR1] Create backend/app/schemas/auth.py with SignupRequest model (name optional, email EmailStr, password min 8 chars)
- [ ] T043 [P] [FR1] Create backend/app/schemas/auth.py with LoginRequest model (email, password)
- [ ] T044 [P] [FR1] Create backend/app/schemas/auth.py with UserResponse model (id, name, email, created_at)
- [ ] T045 [P] [FR1] Create backend/app/schemas/auth.py with AuthResponse model (user UserResponse, token str, expires_at str)

### Authentication Endpoints

- [ ] T046 [FR1] Create backend/app/routers/auth.py with APIRouter prefix="/api/auth"
- [ ] T047 [FR1] Implement POST /api/auth/signup endpoint with rate limit 3/hour (check email unique, hash password, create user, return token)
- [ ] T048 [FR1] Implement POST /api/auth/login endpoint with rate limit 5/15minute (verify credentials, return token, generic error on failure)
- [ ] T049 [FR1] Implement GET /api/auth/me endpoint (requires auth, returns current user info)
- [ ] T050 [FR1] Register auth router in backend/app/main.py with app.include_router(auth.router)

### Frontend Authentication Hooks

- [ ] T051 [FR1] Create frontend/lib/hooks/useAuth.ts with signup mutation (saves token to localStorage, redirects to /dashboard)
- [ ] T052 [FR1] Add login mutation to frontend/lib/hooks/useAuth.ts (saves token, sets currentUser in query cache, redirects to /dashboard)
- [ ] T053 [FR1] Add logout function to frontend/lib/hooks/useAuth.ts (clears token, clears query cache, redirects to /login)
- [ ] T054 [FR1] Add currentUser query to frontend/lib/hooks/useAuth.ts (fetches from /api/auth/me if token exists)

### Frontend Authentication Pages

- [ ] T055 [FR1] Create frontend/app/signup/page.tsx with signup form using React Hook Form + Zod validation
- [ ] T056 [FR1] Add name field (optional), email field (required, email validation), password field (required, min 8 chars, show/hide toggle) to signup form
- [ ] T057 [FR1] Add real-time validation feedback to signup form (inline error messages below fields)
- [ ] T058 [FR1] Add submit button with loading state (disabled during submission) to signup form
- [ ] T059 [FR1] Add "Already have an account? Log in" link to signup form
- [ ] T060 [FR1] Create frontend/app/login/page.tsx with login form using React Hook Form + Zod validation
- [ ] T061 [FR1] Add email and password fields to login form with show/hide password toggle
- [ ] T062 [FR1] Add submit button with loading state to login form
- [ ] T063 [FR1] Add "Don't have an account? Sign up" link to login form

### Manual Testing for FR-1

- [ ] T064 [FR1] Test signup with valid email/password (verify account created, JWT returned, redirected to /dashboard)
- [ ] T065 [FR1] Test signup with duplicate email (verify 409 error with "Email already registered")
- [ ] T066 [FR1] Test signup with password <8 chars (verify 422 error with clear message)
- [ ] T067 [FR1] Test login with correct credentials (verify JWT returned, redirected to /dashboard)
- [ ] T068 [FR1] Test login with wrong password (verify 401 error with "Invalid email or password")
- [ ] T069 [FR1] Test login rate limiting by attempting 6 logins rapidly (verify 429 error after 5th attempt)
- [ ] T070 [FR1] Test logout (verify token cleared, redirected to /login)
- [ ] T071 [FR1] Test accessing /dashboard without token (verify redirected to /login)
- [ ] T072 [FR1] Test multi-user isolation (create User A and User B, verify User A cannot see User B's data)

**Checkpoint**: Authentication complete and tested - users can signup, login, logout securely

---

## Phase 4: FR-2 Task Management CRUD (5-6 hours) 🎯 MVP CORE

**Goal**: Create, read, update, delete, and toggle completion of tasks

**Independent Test**: Create task, view in list, edit title, mark complete, delete task

### Task Schemas

- [ ] T073 [P] [FR2] Create backend/app/schemas/task.py with TaskCreate model (title required 1-200 chars, description optional max 2000, priority enum, category optional, due_date optional, estimated_minutes optional 1-1440)
- [ ] T074 [P] [FR2] Create backend/app/schemas/task.py with TaskUpdate model (all fields optional for partial updates)
- [ ] T075 [P] [FR2] Create backend/app/schemas/task.py with TaskResponse model (all task fields including id, user_id, timestamps)
- [ ] T076 [P] [FR2] Create backend/app/schemas/task.py with TaskListResponse model (tasks list, total int, completed int, pending int)

### Task Endpoints

- [ ] T077 [FR2] Create backend/app/routers/tasks.py with APIRouter prefix="/api/tasks"
- [ ] T078 [FR2] Implement GET /api/tasks endpoint with filters (completed bool, priority str, category str, search str) and sorting (sort_by, sort_order) - returns TaskListResponse with statistics
- [ ] T079 [FR2] Implement POST /api/tasks endpoint (requires auth, creates task with current user_id, returns TaskResponse)
- [ ] T080 [FR2] Implement GET /api/tasks/{task_id} endpoint (requires auth, returns 404 if not found or not owned by user)
- [ ] T081 [FR2] Implement PUT /api/tasks/{task_id} endpoint (requires auth, updates task, returns 404 if not owned, updates updated_at timestamp)
- [ ] T082 [FR2] Implement PATCH /api/tasks/{task_id}/complete endpoint (requires auth, toggles completed boolean, optimized for optimistic updates)
- [ ] T083 [FR2] Implement DELETE /api/tasks/{task_id} endpoint (requires auth, deletes task, returns 404 if not owned, returns 204 No Content on success)
- [ ] T084 [FR2] Register tasks router in backend/app/main.py with app.include_router(tasks.router)

### Frontend Task Hooks

- [ ] T085 [FR2] Create frontend/lib/hooks/useTasks.ts with useQuery for fetching tasks (supports filter parameters)
- [ ] T086 [FR2] Add createTask mutation to useTasks hook (calls POST /api/tasks, invalidates tasks query, shows success toast)
- [ ] T087 [FR2] Add updateTask mutation to useTasks hook (calls PUT /api/tasks/:id, invalidates tasks query, shows success toast)
- [ ] T088 [FR2] Add toggleComplete mutation to useTasks hook with optimistic update (immediately updates UI, rolls back on error)
- [ ] T089 [FR2] Add deleteTask mutation to useTasks hook (calls DELETE /api/tasks/:id, invalidates tasks query, shows success toast)

### Frontend Dashboard Layout

- [ ] T090 [FR2] Create frontend/components/layout/DashboardNav.tsx with logo, user email/name, and logout button
- [ ] T091 [FR2] Create frontend/app/dashboard/page.tsx with protected route (redirects to /login if not authenticated)
- [ ] T092 [FR2] Add task statistics cards to dashboard (Total Tasks, Completed, Pending) using stats from useTasks hook
- [ ] T093 [FR2] Add "My Tasks" header with "Create Task" button to dashboard

### Frontend Task Components

- [ ] T094 [FR2] Create frontend/components/tasks/TaskList.tsx to render array of tasks (shows empty state if tasks.length === 0)
- [ ] T095 [FR2] Create frontend/components/tasks/TaskCard.tsx with checkbox, title, description, priority badge, category badge, due date, edit button, delete button
- [ ] T096 [FR2] Add optimistic checkbox toggle to TaskCard (calls toggleComplete mutation, animates immediately)
- [ ] T097 [FR2] Add strikethrough animation to completed tasks in TaskCard
- [ ] T098 [FR2] Add delete confirmation to TaskCard (shows confirm dialog before calling deleteTask mutation)
- [ ] T099 [FR2] Add priority color coding to TaskCard (red for high, yellow for medium, green for low)

### Create/Edit Task Modal

- [ ] T100 [FR2] Create frontend/components/tasks/CreateTaskButton.tsx (opens create modal)
- [ ] T101 [FR2] Create frontend/components/tasks/TaskModal.tsx with Headless UI Dialog for create/edit
- [ ] T102 [FR2] Add form fields to TaskModal: title (required), description (textarea), priority (dropdown), category (dropdown), due date (date picker), estimated time (dropdown)
- [ ] T103 [FR2] Add React Hook Form + Zod validation to TaskModal
- [ ] T104 [FR2] Add submit button with loading state to TaskModal (calls createTask or updateTask mutation)
- [ ] T105 [FR2] Wire up edit button in TaskCard to open TaskModal with pre-filled data

### Manual Testing for FR-2

- [ ] T106 [FR2] Test creating task with only title (verify default values applied: completed=false, priority=medium)
- [ ] T107 [FR2] Test creating task with all fields (verify all data saved correctly)
- [ ] T108 [FR2] Test viewing tasks list (verify sorted by created_at desc, shows all user's tasks)
- [ ] T109 [FR2] Test editing task (verify updated data persists)
- [ ] T110 [FR2] Test toggling completion (verify checkbox animates, strikethrough applied, statistics update)
- [ ] T111 [FR2] Test deleting task (verify confirmation shown, task removed from list, statistics update)
- [ ] T112 [FR2] Test empty state (delete all tasks, verify "No tasks yet" message with add button)
- [ ] T113 [FR2] Test user data isolation (create task as User A, login as User B, verify User B doesn't see User A's task)

**Checkpoint**: Core CRUD complete - users can manage tasks end-to-end

---

## Phase 5: FR-3 Advanced Features (6-8 hours)

**Goal**: Priorities, tags, categories, search, filtering, sorting, bulk operations, statistics

**Independent Test**: Create tasks with different priorities/categories, filter by priority, search by keyword, bulk delete

### Search Implementation

- [ ] T114 [P] [FR3] Create frontend/lib/hooks/useDebounce.ts hook with 300ms delay
- [ ] T115 [FR3] Add search input to dashboard with debounced query (uses useDebounce hook)
- [ ] T116 [FR3] Wire search input to useTasks filter parameter (refetches with search query)
- [ ] T117 [FR3] Add clear button (X icon) to search input

### Filter & Sort UI

- [ ] T118 [P] [FR3] Create frontend/components/tasks/FilterBar.tsx with dropdowns for Status (All/Pending/Completed), Priority (All/High/Medium/Low), Category (All + predefined list)
- [ ] T119 [FR3] Create frontend/components/tasks/SortControls.tsx with dropdown for sort field (Created Date, Due Date, Priority, Title) and order (Asc/Desc)
- [ ] T120 [FR3] Wire FilterBar to useTasks filter parameters (updates query on change)
- [ ] T121 [FR3] Wire SortControls to useTasks sort parameters
- [ ] T122 [FR3] Add active filter chips below FilterBar (removable with X icon)
- [ ] T123 [FR3] Add "Clear All Filters" button to reset to default view

### Bulk Operations

- [ ] T124 [FR3] Add checkbox to TaskCard for selection (tracks selected task IDs in component state)
- [ ] T125 [FR3] Add "Select All" checkbox to dashboard header (selects all visible tasks)
- [ ] T126 [FR3] Show bulk action bar when tasks selected with count (e.g., "3 tasks selected")
- [ ] T127 [FR3] Add "Mark All Complete" button to bulk action bar (calls PATCH /api/tasks/:id/complete for each)
- [ ] T128 [FR3] Add "Mark All Incomplete" button to bulk action bar
- [ ] T129 [FR3] Add "Delete All" button to bulk action bar with confirmation modal
- [ ] T130 [FR3] Clear selection after bulk operation completes

### Task Statistics Dashboard

- [ ] T131 [FR3] Create frontend/components/tasks/TaskStats.tsx with completion rate calculation (completed / total \* 100)
- [ ] T132 [FR3] Add progress bar visualization to TaskStats showing completion percentage
- [ ] T133 [FR3] Add category breakdown to TaskStats (e.g., "5 Work, 3 Personal, 2 Shopping")
- [ ] T134 [FR3] Add priority breakdown to TaskStats (e.g., "2 High, 5 Medium, 1 Low")
- [ ] T135 [FR3] Add tasks due today count to TaskStats (filters tasks where due_date = today)
- [ ] T136 [FR3] Add overdue tasks count to TaskStats (filters tasks where due_date < today and completed = false)

### Manual Testing for FR-3

- [ ] T137 [FR3] Test search (type "project", verify only matching tasks shown, verify 300ms debounce)
- [ ] T138 [FR3] Test filter by priority (select "High", verify only high priority tasks shown)
- [ ] T139 [FR3] Test filter by category (select "Work", verify only work tasks shown)
- [ ] T140 [FR3] Test combined filters (Status=Pending + Priority=High, verify correct tasks shown)
- [ ] T141 [FR3] Test sorting by due date (verify tasks ordered by due_date ascending)
- [ ] T142 [FR3] Test sorting by priority (verify high→medium→low order)
- [ ] T143 [FR3] Test "Clear All Filters" button (verify resets to default view)
- [ ] T144 [FR3] Test bulk select all (verify all visible tasks selected)
- [ ] T145 [FR3] Test bulk mark complete (select 3 tasks, verify all marked complete)
- [ ] T146 [FR3] Test bulk delete (select 2 tasks, verify confirmation shown, both deleted)
- [ ] T147 [FR3] Test statistics (verify completion rate, category breakdown, priority breakdown accurate)

**Checkpoint**: Advanced features complete - app feels powerful and professional

---

## Phase 6: FR-4 UI/UX Excellence (4-5 hours)

**Goal**: Animations, dark mode, keyboard shortcuts, responsive design, accessibility, loading states

**Independent Test**: Toggle dark mode, try keyboard shortcuts, test on mobile device

### Animations

- [ ] T148 [P] [FR4] Add Framer Motion page transitions to frontend/app/dashboard/page.tsx (fade in on mount)
- [ ] T149 [P] [FR4] Add stagger list animation to TaskList component (tasks animate in with 50ms delay each)
- [ ] T150 [P] [FR4] Add slide-up animation to TaskModal (modal slides up from bottom on open)
- [ ] T151 [P] [FR4] Add checkmark animation to TaskCard checkbox (smooth scale + fade on toggle)
- [ ] T152 [P] [FR4] Add exit animation to TaskCard on delete (slide left + fade out)

### Dark Mode

- [ ] T153 [FR4] Add dark mode toggle button to DashboardNav
- [ ] T154 [FR4] Create frontend/lib/hooks/useDarkMode.ts with localStorage persistence
- [ ] T155 [FR4] Add dark: classes to all Tailwind components (dark:bg-gray-900, dark:text-white, etc.)
- [ ] T156 [FR4] Add system preference detection to useDarkMode (checks prefers-color-scheme media query)
- [ ] T157 [FR4] Test dark mode across all pages (dashboard, signup, login)

### Keyboard Shortcuts

- [ ] T158 [FR4] Create frontend/lib/hooks/useKeyboardShortcuts.ts
- [ ] T159 [FR4] Add 'n' shortcut to open create task modal
- [ ] T160 [FR4] Add '/' shortcut to focus search input
- [ ] T161 [FR4] Add 'Escape' shortcut to close modals
- [ ] T162 [FR4] Add '?' shortcut to show keyboard shortcuts help modal
- [ ] T163 [FR4] Create frontend/components/tasks/KeyboardShortcutsModal.tsx with list of all shortcuts

### Responsive Design

- [ ] T164 [FR4] Test dashboard on mobile (375px width) and adjust layout to single column
- [ ] T165 [FR4] Ensure touch targets are minimum 44x44px on TaskCard buttons
- [ ] T166 [FR4] Make TaskModal full-screen on mobile (<640px), modal on desktop
- [ ] T167 [FR4] Add hamburger menu to DashboardNav on mobile (collapses nav items)
- [ ] T168 [FR4] Test filters on mobile (stack vertically instead of horizontal)

### Loading & Empty States

- [ ] T169 [P] [FR4] Create frontend/components/tasks/TaskListSkeleton.tsx with shimmer animation
- [ ] T170 [FR4] Show TaskListSkeleton while tasks are loading in dashboard
- [ ] T171 [FR4] Create frontend/components/tasks/EmptyState.tsx with icon and helpful message
- [ ] T172 [FR4] Show EmptyState when tasks.length === 0 with different messages based on active filters

### Accessibility

- [ ] T173 [P] [FR4] Add ARIA labels to all icon buttons (aria-label="Delete task", etc.)
- [ ] T174 [P] [FR4] Ensure all form inputs have associated labels (htmlFor attribute)
- [ ] T175 [P] [FR4] Add focus visible styles to all interactive elements (ring-2 ring-blue-500)
- [ ] T176 [P] [FR4] Test keyboard navigation (Tab through all elements, Enter to activate)
- [ ] T177 [P] [FR4] Ensure color contrast meets WCAG AA standards (use WebAIM contrast checker)

### Manual Testing for FR-4

- [ ] T178 [FR4] Test animations are smooth at 60fps (use Chrome DevTools Performance tab)
- [ ] T179 [FR4] Test dark mode toggle (verify all components use dark theme correctly)
- [ ] T180 [FR4] Test keyboard shortcuts (n, /, Escape, ?) work as expected
- [ ] T181 [FR4] Test responsive design on mobile device or Chrome DevTools (375px, 768px, 1024px widths)
- [ ] T182 [FR4] Test touch targets on mobile (buttons are easy to tap, no mis-taps)
- [ ] T183 [FR4] Test loading states (throttle network in DevTools, verify skeletons show)
- [ ] T184 [FR4] Test empty states (verify helpful messages and call-to-action buttons)
- [ ] T185 [FR4] Test accessibility with keyboard only (Tab, Enter, Escape navigation)

**Checkpoint**: UI/UX polished - app looks and feels professional

---

## Phase 7: FR-5 & FR-6 Performance & Security (3-4 hours)

**Goal**: Optimize performance, run Lighthouse audit, implement security best practices

**Independent Test**: Run Lighthouse audit, verify performance >90, test rate limiting

### Performance Optimization

- [ ] T186 [P] [FR5] Add dynamic import to TaskModal in CreateTaskButton (reduces initial bundle size)
- [ ] T187 [P] [FR5] Optimize TaskCard with React.memo if list has >100 tasks (prevents unnecessary re-renders)
- [ ] T188 [P] [FR5] Add Next.js Image component for any logos or images (converts to WebP, lazy loads)
- [ ] T189 [FR5] Run `npm run build` and analyze bundle size with @next/bundle-analyzer
- [ ] T190 [FR5] Verify TanStack Query caching is working (check Network tab, no duplicate requests)

### Lighthouse Audit

- [ ] T191 [FR5] Build production frontend with `npm run build && npm run start`
- [ ] T192 [FR5] Run Lighthouse audit in Chrome DevTools (Performance, Accessibility, Best Practices, SEO)
- [ ] T193 [FR5] Fix any Lighthouse warnings (missing alt tags, contrast issues, etc.)
- [ ] T194 [FR5] Take screenshot of Lighthouse scores (target: Performance >90, Accessibility >95, Best Practices >90, SEO >90)

### Security Hardening

- [ ] T195 [P] [FR6] Verify CORS whitelist in backend (only Vercel URL and localhost, no "\*")
- [ ] T196 [P] [FR6] Add security headers middleware to backend (X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Strict-Transport-Security)
- [ ] T197 [P] [FR6] Verify rate limiting is active (test login 6 times, expect 429 on 6th attempt)
- [ ] T198 [P] [FR6] Verify JWT expiration is 7 days (decode token, check exp claim)
- [ ] T199 [P] [FR6] Verify passwords are hashed with bcrypt cost 12 (check database, hash should start with $2b$12$)
- [ ] T200 [P] [FR6] Test SQL injection in search query (try "'; DROP TABLE tasks; --", verify no effect)
- [ ] T201 [P] [FR6] Test XSS in task title (try "<script>alert('xss')</script>", verify escaped in UI)

### Manual Testing for FR-5 & FR-6

- [ ] T202 [FR5] Test API response times in DevTools Network tab (verify <500ms for GET /api/tasks)
- [ ] T203 [FR5] Test page load time with Lighthouse (verify <2 seconds)
- [ ] T204 [FR5] Verify zero console errors in production build
- [ ] T205 [FR5] Verify zero console warnings in production build
- [ ] T206 [FR6] Test unauthorized access (request /api/tasks without token, expect 401)
- [ ] T207 [FR6] Test accessing other user's task (User A tries to GET User B's task ID, expect 404)
- [ ] T208 [FR6] Test rate limiting on signup (create 4 accounts, expect 429 on 4th)
- [ ] T209 [FR6] Verify HTTPS enforced in production (check Vercel and Railway URLs)

**Checkpoint**: Performance optimized, security hardened, Lighthouse >90

---

## Phase 8: FR-7 Documentation & Demo (4-5 hours) 🎬 CRITICAL

**Goal**: Comprehensive README, API documentation, 90-second demo video, final submission materials

**Independent Test**: Follow README to setup project from scratch, watch demo video

### README Documentation

- [ ] T210 [FR7] Create root README.md with project title, description, live demo links
- [ ] T211 [FR7] Add Features section to README listing all 5 basic + 10 advanced features with checkmarks
- [ ] T212 [FR7] Add Quick Start section to README with prerequisites and installation steps
- [ ] T213 [FR7] Add Tech Stack section to README (Frontend: Next.js 16, React 19, TypeScript, Tailwind; Backend: FastAPI, SQLModel, PostgreSQL)
- [ ] T214 [FR7] Add Architecture section to README with key decisions (JWT auth, optimistic updates, TanStack Query)
- [ ] T215 [FR7] Add Performance Metrics section to README (API <500ms, Page load <2s, Lighthouse >90, zero errors)
- [ ] T216 [FR7] Add Security section to README (Bcrypt cost 12, JWT 7-day expiration, rate limiting, CORS whitelist)
- [ ] T217 [FR7] Add Development section to README with testing and linting commands

### Screenshots

- [ ] T218 [P] [FR7] Take screenshot of login page (light mode)
- [ ] T219 [P] [FR7] Take screenshot of dashboard with tasks (light mode)
- [ ] T220 [P] [FR7] Take screenshot of create task modal with all fields filled
- [ ] T221 [P] [FR7] Take screenshot of dashboard with filters active (showing active filter chips)
- [ ] T222 [P] [FR7] Take screenshot of dashboard in dark mode
- [ ] T223 [P] [FR7] Take screenshot of mobile view (375px width)
- [ ] T224 [FR7] Add all screenshots to README.md in Screenshots section

### API Documentation

- [ ] T225 [FR7] Verify /docs endpoint works at backend URL (FastAPI auto-generated Swagger UI)
- [ ] T226 [FR7] Add link to API docs in README (https://your-api.railway.app/docs)
- [ ] T227 [FR7] Test all endpoints in Swagger UI (signup, login, create task, get tasks, etc.)

### Demo Video

- [ ] T228 [FR7] Write demo script following 90-second structure (0-10s: auth, 10-25s: create task, 25-40s: optimistic updates, 40-55s: search/filters, 55-70s: dark mode/mobile, 70-85s: statistics/performance, 85-90s: thank you)
- [ ] T229 [FR7] Record screen with high-quality screen recording software (OBS Studio, Loom, or macOS Screen Recording)
- [ ] T230 [FR7] Edit video to 90 seconds exactly (cut unnecessary parts, add smooth transitions)
- [ ] T231 [FR7] Add text overlays to highlight key features (e.g., "Optimistic Updates", "Sub-500ms API", "Lighthouse Score: 94")
- [ ] T232 [FR7] Export video at 1080p 30fps
- [ ] T233 [FR7] Upload video to YouTube (unlisted or public)
- [ ] T234 [FR7] Add video link to README (https://youtu.be/your-video-id)

### Final Submission

- [ ] T235 [FR7] Create .env.example files for backend and frontend (remove actual secrets)
- [ ] T236 [FR7] Verify .gitignore excludes .env, node_modules, venv, **pycache**, .next
- [ ] T237 [FR7] Run final build for frontend (`npm run build`) and verify no errors
- [ ] T238 [FR7] Run TypeScript check (`npm run type-check`) and verify zero errors
- [ ] T239 [FR7] Run ESLint (`npm run lint`) and verify zero warnings
- [ ] T240 [FR7] Test deployed application end-to-end (signup, login, create tasks, all features)
- [ ] T241 [FR7] Run full manual testing checklist from Phase 2, 4, 5, 6, 7 (ensure all tests pass)
- [ ] T242 [FR7] Create submission document with links (GitHub repo, live frontend, live backend/docs, demo video)

**Checkpoint**: Documentation complete, demo spectacular, submission ready

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all feature work
- **FR-1 Authentication (Phase 3)**: Depends on Phase 2 - BLOCKS FR-2 and all subsequent phases
- **FR-2 Task CRUD (Phase 4)**: Depends on FR-1 (needs authentication) - **MVP CORE**
- **FR-3 Advanced Features (Phase 5)**: Depends on FR-2 (needs tasks to filter/search)
- **FR-4 UI/UX (Phase 6)**: Depends on FR-2 and FR-3 (needs features to animate/style)
- **FR-5 & FR-6 Performance/Security (Phase 7)**: Depends on all features being complete
- **FR-7 Documentation (Phase 8)**: Depends on all features being complete and tested

### Critical Path (MVP)

To have a working MVP (minimum viable product), complete:

1. **Phase 1**: Setup (T001-T012)
2. **Phase 2**: Foundational (T013-T038)
3. **Phase 3**: FR-1 Authentication (T039-T072)
4. **Phase 4**: FR-2 Task CRUD (T073-T113)

**STOP at Phase 4 and VALIDATE**: You now have a working todo app with auth and basic CRUD. Test thoroughly before adding advanced features.

### Incremental Delivery Strategy

- **MVP (Phases 1-4)**: Basic todo app with auth - 20-24 hours
- **Enhanced (+ Phase 5)**: Add advanced features - 6-8 hours more
- **Polished (+ Phase 6)**: Add UI/UX excellence - 4-5 hours more
- **Optimized (+ Phase 7)**: Add performance/security - 3-4 hours more
- **Competition-Ready (+ Phase 8)**: Add documentation/demo - 4-5 hours more

**Total**: 40-48 hours to 1st place

### Parallel Opportunities

**Within Phase 1 (Setup)**:

- T002 (backend init) and T003 (frontend init) can run in parallel
- T004 (backend structure) and T005 (frontend structure) can run in parallel
- T006 (backend deps) and T007 (frontend deps) can run in parallel
- T008-T011 (various configs) can all run in parallel

**Within Phase 2 (Foundational)**:

- T017 (Alembic init) and T018 (Alembic config) can run after T013-T016
- T026-T029 (all model files) can run in parallel
- T034 (Railway deploy) and T035 (Vercel deploy) can run in parallel

**Within Phase 3 (FR-1)**:

- T039 (hash functions) and T040 (JWT functions) can run in parallel
- T042-T045 (all schema files) can run in parallel

**Within Phase 4 (FR-2)**:

- T073-T076 (all task schemas) can run in parallel

**Within Phase 5 (FR-3)**:

- T114 (debounce hook) and T118-T119 (filter/sort UI) can run in parallel

**Within Phase 6 (FR-4)**:

- T148-T152 (all animations) can run in parallel
- T173-T177 (all accessibility improvements) can run in parallel

**Within Phase 7 (Performance/Security)**:

- T186-T188 (performance optimizations) can run in parallel
- T195-T201 (security checks) can run in parallel

**Within Phase 8 (Documentation)**:

- T218-T223 (all screenshots) can run in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch these tasks together (different files, no dependencies):
Task: "Create backend/app/models/user.py with User model"
Task: "Create backend/app/models/task.py with Task model"
Task: "Create backend/app/models/tag.py with Tag model"

# Or launch these together:
Task: "Deploy backend to Railway"
Task: "Deploy frontend to Vercel"
```

---

## Implementation Strategy

### Day 1 (20-24 hours): MVP Foundation

**Goal**: Working todo app with authentication and basic CRUD

- [ ] Morning (8h): Phase 1 + Phase 2 (Setup + Foundational)
- [ ] Afternoon (8h): Phase 3 (FR-1 Authentication)
- [ ] Evening (6h): Phase 4 (FR-2 Task CRUD)
- [ ] Deploy to Vercel + Railway
- [ ] Test end-to-end: signup, login, create task, edit, delete

**Checkpoint**: MVP working - you can stop here if behind schedule

### Day 2 (16-20 hours): Advanced Features + Polish

**Goal**: Add differentiation and professional polish

- [ ] Morning (8h): Phase 5 (FR-3 Advanced Features)
- [ ] Afternoon (6h): Phase 6 (FR-4 UI/UX Excellence)
- [ ] Evening (4h): Phase 7 (FR-5 & FR-6 Performance/Security)
- [ ] Run Lighthouse audit
- [ ] Test all advanced features

**Checkpoint**: Feature-complete - ready for documentation

### Day 3 (4-5 hours): Documentation & Demo

**Goal**: Create spectacular submission materials

- [ ] Morning (3h): Phase 8 Part 1 (README + Screenshots + API Docs)
- [ ] Afternoon (2h): Phase 8 Part 2 (Demo Video + Final Testing)
- [ ] Submit by deadline

---

## Risk Mitigation

**If behind schedule after Day 1**:

- ✅ You have MVP (Phases 1-4) - can submit this as basic entry
- 🔪 Cut Phase 5 or simplify (only search + one filter)
- 🔪 Cut Phase 6 optional features (animations, keyboard shortcuts)
- ✅ Keep Phase 7 (performance/security are critical)
- ✅ Keep Phase 8 (documentation wins presentation points)

**If behind schedule after Day 2**:

- 🔪 Skip some Phase 6 features (dark mode, advanced animations)
- ✅ Must complete Phase 7 security checks
- ✅ Must complete Phase 8 demo video (worth 10% of score)

**Minimum Viable Submission** (if only 24 hours available):

- Phase 1-4 only (22 hours)
- Phase 8 README + Screenshots (2 hours)
- **Total: 24 hours** = Still competitive with solid fundamentals

---

## Success Metrics

**This task list achieves**:

- ✅ **242 tasks** organized by functional requirement
- ✅ **8 phases** from setup to submission
- ✅ **Clear MVP path** (Phases 1-4, 50% of work)
- ✅ **Parallel opportunities** identified with [P] marker
- ✅ **Independent testing** checkpoints after each phase
- ✅ **File paths** specified for every implementation task
- ✅ **Competition optimization** targeting 98/100 score

**Expected Score**: 98/100 = 1ST PLACE 🏆

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [FR#] label maps task to specific functional requirement for traceability
- Each phase should be independently completable and testable
- Commit after each task or logical group (T001-T012 = one commit, etc.)
- Stop at any checkpoint to validate phase independently
- Refer to plan.md for detailed code examples for each task
- Refer to data-model.md for database schema details
- Refer to research.md for technology decision rationale
- Manual testing is primary approach (automated tests optional due to timeline)
- Deploy early and often (after Phase 2, after Phase 4, after Phase 6)
- Focus on features over perfect code (competition context, not production)
- Use provided code examples from plan.md (copy-paste ready)
- If stuck, refer back to spec.md for acceptance criteria

---

**Document Status**: ✅ Complete - Ready for Implementation
**Total Tasks**: 242
**Estimated Duration**: 40-48 hours
**Target**: 🥇 1ST PLACE (98/100)
