<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Ratification date: 2025-12-14 (original)
- Last amended: 2025-12-17 (today - Phase III additions)
- Modified principles: None (Phase II principles unchanged)
- Added sections:
  * Principle XI: AI Chatbot Architecture (Phase III)
  * Principle XII: Gemini Integration & MCP Tools (Phase III)
  * Principle XIII: Natural Language Understanding (Phase III)
  * Principle XIV: Conversation Management (Phase III)
  * Success Definition - Phase III Completion Criteria
- Removed sections: None
- Templates requiring updates:
  ✅ plan-template.md - No changes needed (Phase III additive)
  ✅ spec-template.md - No changes needed (Phase III additive)
  ✅ tasks-template.md - No changes needed (Phase III additive)
  ✅ All command templates - Verified consistency
- Follow-up TODOs: None - all placeholders filled with concrete values
- Version bump rationale: MINOR bump (1.1.0) - Added new Phase III principles without modifying Phase II principles. Backward compatible (Phase II still works independently).
-->

# Phase II & III Full-Stack Todo Application - Competition Constitution

## Core Principles

### I. Competition Excellence - Exceed All Requirements by 200%

Every decision, every line of code, every design choice MUST be optimized for winning 1st place in Hackathon II.

**Non-Negotiable Rules**:
- Implement ALL 5 basic requirements (signup, login, CRUD, multi-user) flawlessly with zero bugs
- Add minimum 8 advanced features beyond requirements (priorities, tags, search, filter, bulk ops, stats, due dates, dark mode)
- Target judging criteria: Functionality 40/40, Code Quality 20/20, UI/UX 19/20, Innovation 9/10, Presentation 10/10 = 98/100 points
- Every feature MUST have a specification written before implementation
- Zero runtime errors or crashes allowed in demo
- Professional UI that looks like a $100k product, not a hackathon project

**Rationale**: The competition evaluates completeness, quality, innovation, and presentation. Basic implementations will not win. We dominate by delivering production-grade quality across all judging dimensions while competitors deliver "just enough."

---

### II. Spec-Driven Development - All Features Must Have Specifications

No code is written without a complete specification defining requirements, acceptance criteria, and user value.

**Non-Negotiable Rules**:
- Every feature MUST have a spec.md file in `.specify/` before implementation begins
- Specs MUST include: user scenarios, functional requirements, acceptance criteria, success metrics
- Changes to features MUST update specs first, then code
- Use `/speckit.specify` to create specs, `/speckit.plan` to design implementation, `/speckit.tasks` to break down work
- AI implementation via `/speckit.implement` follows specs exactly
- No feature creep - if it's not in the spec, it's not implemented (unless spec is updated first)

**Rationale**: Spec-driven development prevents scope creep, ensures clear requirements, enables parallel work, and demonstrates architectural thinking to judges. Competitors who code-first will miss requirements and deliver inconsistent features.

---

### III. Production-Grade Code Quality - Launch-Ready from Day One

Write code as if launching to 1 million users tomorrow. No hackathon shortcuts, no technical debt, no "we'll fix it later."

**Non-Negotiable Rules**:

**Frontend**:
- TypeScript strict mode enabled, zero `any` types allowed
- Component architecture follows atomic design (atoms, molecules, organisms)
- All user inputs validated with Zod schemas
- Error boundaries catch all errors gracefully
- Loading states use skeleton screens (not spinners)
- Optimistic updates for all mutations (instant UI feedback)
- Code splitting and lazy loading for performance
- Accessibility WCAG 2.1 AA compliant (keyboard nav, ARIA labels, 4.5:1 contrast)

**Backend**:
- FastAPI with async/await everywhere, dependency injection pattern
- Pydantic models for all request/response validation
- Database indexes on all foreign keys and frequently queried columns
- Rate limiting: 5 login attempts per 15 min, 3 signups per hour, 100 API calls per minute
- Input sanitization prevents XSS, SQL injection, NoSQL injection
- Structured logging with request IDs for debugging
- Proper HTTP status codes and detailed error messages
- Auto-generated OpenAPI docs at /docs endpoint

**Database**:
- Fully normalized schema with proper foreign keys and cascades
- NOT NULL, UNIQUE, CHECK constraints enforced
- Timestamps (created_at, updated_at) on all tables
- Alembic migrations for all schema changes, rollback tested
- Connection pooling (min=10, max=50) for performance

**Rationale**: Judges evaluate code quality heavily (20% of score). Production-grade code demonstrates expertise, separates us from competitors who take shortcuts. Quality code also prevents bugs during demo.

---

### IV. Performance-First - Sub-Second Response Times Everywhere

Users expect instant responses. Optimize for perceived and actual performance from the start.

**Non-Negotiable Rules**:
- API response time MUST be <500ms at p95 (verified with DevTools Network tab)
- Page load time MUST be <2 seconds (verified with Lighthouse)
- Lighthouse Performance score MUST be >90 in production
- Animations MUST run at 60fps (GPU-accelerated transforms, no jank)
- Optimistic updates create instant UI feedback (sync in background)
- Debounced search (300ms delay) prevents API spam
- Virtual scrolling supports 1000+ tasks smoothly
- Code splitting reduces initial bundle to <200KB
- Images optimized (WebP format, lazy loading, Next.js Image component)

**Rationale**: Performance is part of UI/UX score (20%). Slow apps frustrate judges and look unprofessional. Competitors often neglect performance until it's too late. We optimize from day one.

---

### V. Mobile-First Responsive Design - Perfect Experience on Every Device

Design for mobile first (320px width), then progressively enhance for tablet and desktop.

**Non-Negotiable Rules**:
- All layouts MUST work perfectly on mobile (iPhone), tablet (iPad), desktop (1440px+)
- Touch targets MUST be minimum 44x44px on mobile
- Text MUST be readable without zooming (minimum 16px base font)
- No horizontal scrolling on any device at any breakpoint
- Single-column layout on mobile, multi-column on desktop
- Floating action buttons within thumb reach on mobile
- Test on Chrome DevTools mobile view before considering feature complete
- Responsive design showcased in demo video (show mobile view)

**Rationale**: Mobile-first is modern best practice. Judges will test on multiple devices. Competitors who design desktop-first will have awkward mobile experiences. We deliver pixel-perfect responsive design.

---

### VI. Security-First - Enterprise-Grade Protection

Implement security as if handling financial data, not todo items. Prevent all OWASP Top 10 vulnerabilities.

**Non-Negotiable Rules**:
- Passwords hashed with bcrypt cost factor 12 (never plain text, never logged)
- JWT tokens expire in 7 days, verified on every request, secure random secret (256-bit)
- Rate limiting prevents brute force: 5 login attempts per 15 min, 3 signups per hour
- Input validation on frontend AND backend (never trust client)
- Parameterized queries only (prevents SQL injection)
- Output escaping prevents XSS (React does this by default, verify)
- CORS whitelist only trusted domains (localhost:3000 in dev, Vercel URL in prod)
- Security headers: X-Frame-Options DENY, X-Content-Type-Options nosniff, Strict-Transport-Security
- HTTPS required in production (Vercel/Railway enforce this)
- Multi-user data isolation enforced at database query level (WHERE user_id = ?)

**Rationale**: Security demonstrates professional competence. Competitors often ignore security until vulnerability found. We implement enterprise security from start, showcase in README/docs.

---

### VII. User Experience Excellence - Delight in Every Interaction

Every user action should feel smooth, intuitive, and delightful. Sweat the small details.

**Non-Negotiable Rules**:
- Smooth 60fps animations using Framer Motion (page transitions, modals, lists, checkboxes)
- Toast notifications for all user actions (success: green, error: red, info: blue)
- Beautiful empty states with illustrations and helpful messages
- Friendly error messages that guide users (not technical jargon or stack traces)
- Micro-interactions on hover (button scale 1.05x, shadow elevation, card lift)
- Keyboard shortcuts for power users (/, n, Escape, Ctrl+Enter, ?)
- Dark mode toggle with smooth transition and localStorage persistence
- Loading states with skeleton screens (match final layout, shimmer effect)
- Confirmation modals for destructive actions (delete tasks)
- Accessibility: keyboard navigation, ARIA labels, screen reader friendly

**Rationale**: UI/UX is 20% of judging score. Delightful experiences impress judges and demonstrate attention to detail. Competitors focus on functionality; we deliver both functionality AND exceptional UX.

---

### VIII. AI-First Development - Claude Code as Primary Implementation Tool

Leverage Claude Code's capabilities for rapid, high-quality implementation following specs.

**Non-Negotiable Rules**:
- Use `/speckit.specify` to write comprehensive feature specifications
- Use `/speckit.plan` to create detailed implementation plans
- Use `/speckit.tasks` to break plans into actionable task lists
- Use `/speckit.implement` to execute tasks using Claude Code
- Claude Code MUST follow specs exactly (no deviations without spec update)
- Human reviews specs/plans, Claude Code implements per spec
- Iterative refinement: spec → plan → tasks → implement → test → refine
- All AI-generated code MUST meet constitution quality standards

**Rationale**: Claude Code accelerates development while maintaining quality. Proper spec-driven workflow ensures AI generates code that meets requirements. Competitors coding manually will be slower and less consistent.

---

### IX. Deployment Excellence - Production-Ready from First Deploy

Deploy early, deploy often. Treat every deployment as production-ready.

**Non-Negotiable Rules**:

**Frontend (Vercel)**:
- Auto-deploy on push to main branch
- Environment variables configured in dashboard (NEXT_PUBLIC_API_URL)
- Preview deployments for PRs (optional, not required for hackathon)
- Health check: frontend accessible via public URL
- Build completes in <2 minutes
- Zero build errors or warnings

**Backend (Railway/Hugging Face)**:
- Auto-deploy on push to main branch
- Environment variables secured in dashboard (DATABASE_URL, JWT_SECRET, CORS_ORIGINS, ENVIRONMENT=production, GEMINI_API_KEY)
- /health endpoint returns 200 OK with database connection verified
- Logging enabled and accessible
- Monitoring dashboard shows uptime
- Rollback procedure documented in README

**Database (Neon)**:
- Connection pooling enabled (pgbouncer)
- Daily backups enabled (Neon automatic)
- All migrations applied successfully
- Foreign keys and indexes created
- Query performance monitored

**Rationale**: Deploy on Day 1 to catch issues early. Competitors who deploy last-minute face unexpected failures. We deploy early, iterate, and ensure rock-solid production readiness.

---

### X. Documentation & Presentation - Show, Don't Just Tell

Comprehensive documentation and spectacular demo video maximize presentation score.

**Non-Functional Rules**:

**README.md**:
- Compelling hero section with project description
- Tech stack table with versions and rationale
- Setup instructions (one-command setup script)
- Environment variables table with descriptions
- Architecture diagram showing frontend, backend, database
- Deployment guide (Vercel, Railway, Neon)
- Troubleshooting section (common issues and solutions)
- Screenshots/GIFs showcasing key features
- Link to live demo (Vercel URL)
- Link to API docs (Railway /docs endpoint)

**API Documentation**:
- Swagger UI at /docs with all endpoints documented
- Request/response examples for each endpoint
- Error codes and messages documented
- Authentication requirements specified
- Rate limiting policies explained

**Demo Video (90 seconds)**:
- 0-5s: Hook ("Watch me build a production-grade todo app")
- 5-10s: Login with smooth animation
- 10-20s: Create tasks with tags, priorities, categories
- 20-30s: Search, filter, sort in action (fast!)
- 30-40s: Bulk operations, drag & drop reordering
- 40-50s: Mobile responsive demo (show phone view)
- 50-60s: Dark mode toggle, keyboard shortcuts
- 60-70s: **NEW: AI chatbot natural language interaction**
- 70-80s: Show code structure, API docs, specs/
- 80-90s: Performance: Sub-second response times
- 90s: Closing: "Deployed, tested, production-ready"
- Professional production: music, overlays, transitions, 1080p quality

**Rationale**: Presentation is 10% of score, but often determines winner among close competitors. Spectacular demo and comprehensive docs separate 1st place from 2nd place.

---

## Phase III Principles - AI Chatbot with Gemini & MCP

### XI. AI Chatbot Architecture - Stateless, MCP-Driven, Database-Persistent

Phase III adds a conversational AI interface where users manage tasks through natural language. Architecture MUST be stateless, tool-based, and database-persistent.

**Non-Negotiable Rules**:

**Stateless Design**:
- Server holds ZERO conversation state in memory (no global variables, no sessions)
- All conversation history stored in database (conversations, messages tables)
- Each chat request fetches full history from DB, processes, stores response, returns
- Server can restart anytime without losing conversations
- Each request is independent and reproducible (idempotent where possible)

**MCP Tools Pattern**:
- AI interacts with tasks ONLY through standardized tool interface (5 tools: add, list, complete, delete, update)
- Each tool is a pure function: receives parameters, queries database, returns structured result
- Tools REUSE existing Phase II database operations (no code duplication)
- Tool definitions include: name, description, parameter schema (Pydantic models)
- Tools validate user_id matches authenticated user (security boundary)

**Single Endpoint Architecture**:
- One chat endpoint handles all AI interactions: POST /api/{user_id}/chat
- Endpoint flow: Verify auth → Get/create conversation → Fetch history → Store user msg → Call Gemini → Execute tools → Store AI response → Return to client
- No streaming (simplicity for hackathon, add later if needed)
- Proper error handling at each step (auth, DB, Gemini API, tool execution)

**Conversation Persistence**:
- conversations table: id, user_id, title, created_at, updated_at
- messages table: id, conversation_id, user_id, role (user/model/system), content, tool_calls (JSONB), created_at
- Full history loaded on each request (Gemini uses history for context)
- Conversations isolated by user_id (multi-user data isolation)

**Rationale**: Stateless architecture is production-grade, scalable, and resilient. MCP tools provide clean abstraction between AI and database. Database persistence ensures conversations survive restarts and enable multi-device access.

---

### XII. Gemini Integration & MCP Tools - Free Tier AI with Function Calling

Use Google Gemini API (free tier, no credit card) for AI chatbot. Implement MCP tools using Gemini's native function calling.

**Non-Negotiable Rules**:

**Gemini API Configuration**:
- Model: gemini-1.5-flash (fast, free tier, 60 requests/minute)
- API Key: GEMINI_API_KEY environment variable (user provided: AIzaSyAgB1vomtnwrwPgtWxmCSci_hwo9uqxr3k)
- Free tier limits: 60 requests/minute, 1500 requests/day (sufficient for development + demos)
- No credit card required (use free tier throughout development)
- Error handling: Retry logic with exponential backoff for rate limit errors
- Fallback responses: If Gemini fails, return friendly error ("AI is temporarily unavailable, please try again")

**Function Calling (MCP Tools)**:
- Gemini natively supports function calling (similar to OpenAI)
- Each tool defined as function with: name, description, parameters schema (JSON Schema)
- Gemini decides when to call functions based on user message and tool descriptions
- Tool execution: Extract function name and arguments → Call Python function → Return result to Gemini
- Gemini generates natural language response incorporating tool results
- Multi-turn support: Gemini can call multiple tools in sequence if needed

**MCP Tool Definitions** (5 tools):

1. **add_task**: Create new task
   - Parameters: title (required), description (optional)
   - Returns: {task_id, status: "created", title}
   - Calls: Existing Phase II task creation database operation

2. **list_tasks**: List user's tasks
   - Parameters: status ("all" | "pending" | "completed")
   - Returns: [{task_id, title, description, completed, priority, due_date}, ...]
   - Calls: Existing Phase II task query database operation

3. **complete_task**: Mark task as complete
   - Parameters: task_id (required)
   - Returns: {task_id, status: "completed", title}
   - Calls: Existing Phase II task update database operation

4. **delete_task**: Delete task permanently
   - Parameters: task_id (required)
   - Returns: {task_id, status: "deleted", title}
   - Calls: Existing Phase II task deletion database operation

5. **update_task**: Update task fields
   - Parameters: task_id (required), title (optional), description (optional)
   - Returns: {task_id, status: "updated", title}
   - Calls: Existing Phase II task update database operation

**Tool Implementation Principles**:
- Each tool receives: user_id (from authenticated request), database session, parameters
- All tools verify user owns the task before modification (security)
- Tools return structured JSON (Pydantic models)
- Tools catch exceptions and return error in structured format
- Tools log execution for debugging (tool name, parameters, result)

**Rationale**: Gemini provides free, fast AI capabilities without credit card requirement. Function calling enables clean tool-based architecture. Reusing Phase II database operations avoids code duplication and ensures consistency between dashboard and chatbot interfaces.

---

### XIII. Natural Language Understanding - Flexible, Context-Aware Interaction

AI chatbot MUST understand natural language variations and maintain conversation context.

**Non-Negotiable Rules**:

**Intent Recognition**:
- System prompt guides Gemini to recognize task management intents
- Supported intents: add_task, list_tasks, complete_task, delete_task, update_task
- Handle varied phrasings: "add X", "I need to X", "remember to X", "create X"
- Ambiguous requests: Ask clarifying questions ("Did you mean task 3 or the 'meeting' task?")

**Context Awareness**:
- Full conversation history sent to Gemini on each request (enables context)
- References resolved using history: "mark that as done" → Gemini identifies "that" from previous message
- Multi-step actions: "delete the meeting task" → Gemini lists tasks first → identifies task_id → deletes
- Conversation continuity: User can build on previous messages without repeating context

**Confirmation Messages**:
- Every action confirmed in natural language: "I've added 'Buy groceries' to your list!"
- Confirmations include task details: "Great! I've marked 'Buy groceries' as complete."
- Error messages friendly and helpful: "I couldn't find task 999. Try 'show me all tasks' to see what's available."
- No technical jargon in user-facing messages (no stack traces, no error codes)

**System Prompt Design**:
```
You are a helpful AI assistant that manages todo tasks for users.

You have access to these tools:
- add_task: Create new tasks
- list_tasks: View tasks (all, pending, or completed)
- complete_task: Mark tasks as complete
- delete_task: Remove tasks
- update_task: Modify task details

When users ask to add, create, or remember something, use add_task.
When users want to see their tasks, use list_tasks.
When users mark something done, use complete_task.
When users want to delete something, use delete_task.
When users want to change a task, use update_task.

Always confirm actions with friendly responses.
Be conversational and helpful.
If task not found, suggest listing tasks to see what's available.
```

**Test Cases** (MUST pass all):
- "Add buy groceries to my list" → Creates task, confirms
- "I need to call mom" → Creates "Call mom" task
- "Show me my tasks" → Lists all tasks
- "What's pending?" → Lists incomplete tasks
- "Mark task 3 as done" → Marks complete, confirms
- "I finished the grocery shopping" → Finds grocery task, marks complete
- "Delete task 2" → Deletes task, confirms
- "Change task 1 to 'Call mom tonight'" → Updates task title

**Rationale**: Flexible natural language understanding makes chatbot intuitive and delightful. Context awareness enables natural conversation flow. Friendly confirmations build trust and provide feedback.

---

### XIV. Conversation Management - Multi-User, Persistent, Accessible

Conversations MUST be isolated per user, persist across sessions, and accessible from chat interface.

**Non-Negotiable Rules**:

**Multi-User Isolation**:
- Each conversation belongs to exactly one user (user_id foreign key)
- Users cannot access each other's conversations (verified at query level)
- All messages filtered by user_id (security boundary)
- Conversation creation requires authenticated user

**Persistence & History**:
- Conversations stored permanently (unless user deletes)
- Full message history retrieved on each chat request (enables context)
- History ordered by created_at (chronological display)
- Title auto-generated from first user message (or "New Conversation")
- Updated_at timestamp updated on each new message (for sorting conversations)

**Frontend Chat Interface**:
- Custom React components (no external chat widgets for simplicity)
- Message bubbles: User messages (right, blue), AI messages (left, gray)
- Conversation list sidebar: Shows past conversations, click to load
- New conversation button: Starts fresh conversation
- Mobile-responsive: Single-column on mobile, sidebar+chat on desktop
- Keyboard accessible: Tab navigation, Enter to send, Escape to close
- Loading indicators: "AI is thinking..." while waiting for response

**Database Schema**:
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'model', 'system')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

**Rationale**: Persistent conversations enable multi-session workflows. Database-backed history ensures data safety and enables future features (search conversations, export history). Clean UI makes chatbot intuitive.

---

## Additional Standards

### Code Organization

**Monorepo Structure** (Phase II + Phase III):
```
phase2/
├── frontend/              # Next.js application
│   ├── app/              # Next.js App Router pages
│   │   ├── dashboard/    # Phase II dashboard page
│   │   └── chat/         # Phase III chat page (NEW)
│   ├── components/       # React components
│   │   ├── TaskList.tsx  # Phase II task components
│   │   ├── ChatMessage.tsx   # Phase III chat components (NEW)
│   │   └── ChatInput.tsx     # Phase III chat components (NEW)
│   ├── lib/              # Utilities, hooks, types
│   │   ├── api.ts        # API client (Phase II + chat endpoint)
│   │   └── hooks/        # useAuth, useTasks, useChat (NEW)
│   └── public/           # Static assets
├── backend/              # FastAPI application
│   ├── app/              # Application code
│   │   ├── models/       # SQLModel database models
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   └── conversation.py  # Phase III (NEW)
│   │   ├── routers/      # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── tasks.py
│   │   │   └── chat.py          # Phase III (NEW)
│   │   ├── mcp/          # MCP tools (NEW)
│   │   │   └── todo_tools.py    # 5 tools for Gemini
│   │   ├── utils/        # Utilities
│   │   │   ├── auth.py
│   │   │   └── gemini_client.py # Gemini API wrapper (NEW)
│   │   └── schemas/      # Pydantic request/response schemas
│   └── alembic/          # Database migrations
├── .specify/             # Specification files
│   ├── memory/           # Constitution, guidance
│   └── templates/        # Spec, plan, task templates
├── specs/                # Feature specifications
│   ├── 002-full-stack-web-app/  # Phase II spec
│   └── 003-ai-chatbot/          # Phase III spec (NEW)
└── README.md             # Project documentation (updated for Phase III)
```

**Rationale**: Clean organization enables parallel work on Phase II and Phase III. Clear separation between dashboard (Phase II) and chat (Phase III) prevents coupling. MCP tools isolated in dedicated module for reusability.

---

### Integration with Phase II - Non-Destructive Additions

Phase III MUST NOT break Phase II functionality. Integration follows these rules:

**Non-Negotiable Rules**:

**Codebase Changes**:
- NEVER modify existing Phase II routes (auth.py, tasks.py remain unchanged)
- NEVER modify Phase II database schema (users, tasks tables unchanged)
- ONLY add new files (chat.py, conversation.py, todo_tools.py, gemini_client.py)
- ONLY add new database tables (conversations, messages)
- Existing imports continue working (no breaking changes to models/__init__.py)

**Database Operations**:
- MCP tools CALL existing Phase II task operations (don't duplicate logic)
- Shared database session (FastAPI dependency injection)
- Same authentication system (JWT verified in chat endpoint)
- Same user isolation (WHERE user_id = ? in MCP tools)

**User Experience**:
- Both interfaces coexist: Dashboard (/dashboard) and Chat (/chat)
- Navigation links to both pages
- Same tasks visible in both interfaces (shared database)
- Users can use either interface (or both) based on preference
- No feature degradation in Phase II dashboard

**Deployment**:
- Same deployment pipelines (Vercel frontend, Railway/HF backend)
- Add GEMINI_API_KEY environment variable (only new env var)
- Database migration applied without downtime (add tables only, no alter)
- Rollback safe (can disable Phase III routes without breaking Phase II)

**Rationale**: Phase III is an additive enhancement, not a replacement. Phase II is already working and competition-ready. We add new capabilities without risking existing functionality.

---

### Testing Strategy

**Phase II Testing** (unchanged from original):
- User flow testing: Signup → Login → Create task → Update → Delete → Logout
- Multi-user isolation: Two browsers, two accounts, verify data isolation
- Mobile responsive: Chrome DevTools mobile view (iPhone, iPad)
- Performance: Lighthouse audit in production (>90 score)
- Security: Rate limiting verification, SQL injection attempts, XSS attempts

**Phase III Testing** (NEW):

**Natural Language Tests**:
- Test command variations: "add task", "I need to", "remember to"
- Test all 5 tool invocations: add, list, complete, delete, update
- Test ambiguous requests: "mark that as done" (uses context)
- Test multi-step: "delete the meeting task" (list first, then delete)
- Test error cases: Invalid task ID, task not found, empty results

**Conversation Tests**:
- Test conversation persistence: Refresh page, verify history retained
- Test multi-turn: Send multiple messages, verify context maintained
- Test multi-user: Two users, verify conversation isolation
- Test concurrent: Multiple conversations simultaneously

**Integration Tests**:
- Create task in chat, verify appears in dashboard
- Create task in dashboard, verify AI can list it
- Complete task in chat, verify updated in dashboard
- Delete task in dashboard, verify removed from AI's list

**Gemini API Tests**:
- Test rate limiting: Verify graceful degradation at 60 req/min
- Test API failures: Simulate network error, verify error handling
- Test tool execution: Verify each tool calls database correctly
- Test function calling: Verify Gemini chooses correct tools

**Rationale**: Comprehensive testing ensures Phase III works correctly and doesn't break Phase II. Natural language tests validate flexible understanding. Integration tests prove dashboard and chatbot operate on same data.

---

### Git Workflow

**Commit Strategy** (updated for Phase III):
- Meaningful commit messages: "feat(phase3): add Gemini chat endpoint", "feat(phase3): implement MCP tools"
- Commit after each completed Phase III task
- Keep Phase II and Phase III commits separate (easier rollback if needed)
- Never commit secrets (GEMINI_API_KEY in .gitignore, .env.example shows format)
- Push to main triggers auto-deploy (Vercel + Railway)

**Branch Strategy** (optional):
- main: production-ready code (Phase II working, Phase III stable)
- feature/phase3-chat: Phase III development branch (optional)
- Merge to main only when Phase III features complete and tested

**Rationale**: Clean Git history shows progression from Phase II to Phase III. Separate commits enable easy rollback if needed during hackathon.

---

## Governance

### Constitution Authority

This constitution supersedes all other development practices, documentation, or verbal agreements. When in doubt, refer to these principles.

**Amendment Process**:
1. Propose amendment with rationale
2. Update constitution.md with version bump
3. Update dependent templates (plan, spec, tasks)
4. Document changes in Sync Impact Report
5. Commit with message: "docs: amend constitution to vX.Y.Z (change description)"

**Version Bump Rules**:
- MAJOR (X.0.0): Backward incompatible principle removals or redefinitions
- MINOR (X.Y.0): New principle added or materially expanded guidance
- PATCH (X.Y.Z): Clarifications, wording fixes, non-semantic refinements

**Compliance Review**:
- All PRs/code reviews MUST verify compliance with constitution principles
- Complexity MUST be justified against principles (Production-Grade, Performance-First)
- Feature decisions MUST align with Competition Excellence principle
- Any deviation from constitution MUST be documented with rationale

**Runtime Guidance**:
- This constitution is the source of truth for project governance
- For runtime development guidance, see plan.md and spec.md for specific features
- For implementation tasks, see tasks.md for actionable breakdown
- For AI implementation, use `/speckit.implement` which enforces constitution compliance

---

## Success Definition - Phase II Completion Criteria

Phase II is COMPETITION-READY and can be submitted when ALL criteria met:

**Functional Completeness** (40% of judging score):
- ✅ User signup with email/password, validation, bcrypt hashing
- ✅ User login with JWT token, rate limiting (5 per 15 min)
- ✅ Create task with title, description, priority, category, tags, due date
- ✅ View all tasks, filtered by user_id, sorted by created_at
- ✅ Update any task field, optimistic UI update
- ✅ Delete task with confirmation modal
- ✅ Mark task complete/incomplete with checkbox animation
- ✅ Multi-user data isolation verified (two users cannot see each other's tasks)
- ✅ 8+ advanced features: priorities, tags, categories, search, filter, sort, bulk ops, stats, due dates, dark mode, keyboard shortcuts
- ✅ Zero runtime errors or crashes during demo

**Code Quality** (20% of judging score):
- ✅ TypeScript strict mode, zero `any` types
- ✅ Comprehensive specs in `.specify/` for all features
- ✅ Clean monorepo structure (frontend/, backend/, specs/)
- ✅ Error handling for network, validation, server errors
- ✅ Meaningful Git commits, no commented code, no console.log in production
- ✅ Environment variables documented in README, .env.example provided

**UI/UX** (20% of judging score):
- ✅ Professional design (Tailwind CSS, consistent color scheme)
- ✅ Smooth 60fps animations (Framer Motion)
- ✅ Mobile-perfect responsive (tested on iPhone, iPad, desktop)
- ✅ Beautiful empty states with illustrations
- ✅ Helpful error messages (not technical jargon)
- ✅ Loading states with skeleton screens
- ✅ Toast notifications for all actions
- ✅ Dark mode toggle with persistence
- ✅ Keyboard shortcuts (/, n, Escape, Ctrl+Enter, ?)
- ✅ Accessibility WCAG 2.1 AA (keyboard nav, ARIA labels, 4.5:1 contrast)

**Innovation** (10% of judging score):
- ✅ Optimistic updates (instant UI feedback)
- ✅ Rate limiting (security beyond requirements)
- ✅ Statistics dashboard (visual progress tracking)
- ✅ Bulk operations (select multiple, delete/complete all)
- ✅ Dark mode (theme toggle)
- ✅ Keyboard shortcuts (power user features)
- ✅ Debounced search (performance optimization)
- ✅ Advanced filtering (multiple criteria combined)

**Presentation** (10% of judging score):
- ✅ Comprehensive README with setup guide, tech stack, screenshots
- ✅ API documentation (Swagger UI at /docs)
- ✅ Spectacular 90-second demo video (professional quality, all features showcased)
- ✅ Performance demonstrated (Lighthouse score, Network tab)
- ✅ Mobile view shown in demo
- ✅ Code structure highlighted (specs/, monorepo)

**Deployment**:
- ✅ Frontend deployed to Vercel, accessible via public URL
- ✅ Backend deployed to Railway/Hugging Face, /health returns 200 OK
- ✅ Database on Neon, connected and working
- ✅ All environment variables configured
- ✅ HTTPS enabled (Vercel/Railway default)
- ✅ Auto-deploy on push to main

**Performance**:
- ✅ API response time <500ms (p95, verified with DevTools)
- ✅ Page load time <2 seconds (verified with Lighthouse)
- ✅ Lighthouse Performance >90 (production URL)
- ✅ Smooth 60fps animations (no jank)

**Security**:
- ✅ JWT authentication working (token issued, verified, expires in 7 days)
- ✅ Passwords bcrypt hashed (cost factor 12)
- ✅ Rate limiting active (login, signup, API calls)
- ✅ Input validation (frontend and backend, Pydantic/Zod)
- ✅ SQL injection prevented (parameterized queries)
- ✅ XSS prevented (output escaping)
- ✅ CORS configured (whitelist only frontend domain)

---

## Success Definition - Phase III Completion Criteria

Phase III (AI Chatbot) is COMPLETE and ready for enhanced demo when ALL criteria met:

**AI Chatbot Functionality**:
- ✅ Chat page accessible at /chat route
- ✅ User can send messages to AI chatbot
- ✅ AI responds with natural language (powered by Gemini)
- ✅ AI can add tasks: "Add buy groceries to my list" → Creates task
- ✅ AI can list tasks: "Show me my tasks" → Lists all tasks
- ✅ AI can complete tasks: "Mark task 3 as done" → Marks complete
- ✅ AI can delete tasks: "Delete the meeting task" → Finds and deletes
- ✅ AI can update tasks: "Change task 1 to 'Call mom tonight'" → Updates
- ✅ Conversation persists across page refreshes
- ✅ Multiple users have isolated conversations
- ✅ Natural language variations understood ("add", "I need to", "remember to")
- ✅ Context-aware responses (resolves "that", "it" from history)

**MCP Tools Integration**:
- ✅ 5 MCP tools implemented (add, list, complete, delete, update)
- ✅ Each tool calls existing Phase II database operations (no duplication)
- ✅ Tools validate user_id matches authenticated user
- ✅ Tools return structured JSON responses
- ✅ Gemini successfully calls tools via function calling
- ✅ Tool execution logged for debugging

**Database & Backend**:
- ✅ Conversations table created with proper indexes
- ✅ Messages table created with proper indexes
- ✅ Alembic migration applied successfully
- ✅ Chat endpoint (POST /api/{user_id}/chat) working
- ✅ Stateless server (no in-memory state)
- ✅ Full conversation history loaded from DB on each request
- ✅ User messages stored before Gemini call
- ✅ AI responses stored after Gemini call
- ✅ Proper error handling (auth, DB, Gemini API, tools)

**Gemini Integration**:
- ✅ Gemini API key configured (GEMINI_API_KEY env var)
- ✅ gemini-1.5-flash model working
- ✅ Function calling implemented correctly
- ✅ System prompt guides Gemini to use tools appropriately
- ✅ Error handling for Gemini API failures
- ✅ Rate limiting respected (60 requests/minute)
- ✅ Free tier sufficient for development and demos

**Frontend Chat UI**:
- ✅ Chat page (/chat) with clean, intuitive interface
- ✅ Message bubbles distinguish user vs AI messages
- ✅ Message input field with send button
- ✅ Loading indicator while AI thinking
- ✅ Error messages display gracefully
- ✅ Mobile-responsive layout
- ✅ Keyboard accessible (Enter to send, Tab navigation)
- ✅ Smooth message animations
- ✅ Conversation list (optional: view past conversations)

**Integration with Phase II**:
- ✅ Phase II dashboard still works (no breaking changes)
- ✅ Navigation includes both Dashboard and Chat links
- ✅ Tasks created in chat appear in dashboard
- ✅ Tasks created in dashboard visible to AI
- ✅ Same authentication system (JWT)
- ✅ Same database (shared tasks table)
- ✅ Multi-user isolation maintained

**Testing**:
- ✅ All natural language test cases pass
- ✅ Conversation persistence verified
- ✅ Multi-user isolation verified
- ✅ Tool execution verified for all 5 tools
- ✅ Error handling tested (invalid task ID, network errors)
- ✅ Mobile responsiveness tested
- ✅ Phase II functionality unchanged (regression test)

**Documentation**:
- ✅ README updated with Phase III features
- ✅ AI chatbot section in README with example commands
- ✅ Architecture diagram updated (shows chat endpoint, MCP tools)
- ✅ GEMINI_API_KEY documented in environment variables
- ✅ Demo video updated (show natural language interaction)

**Deployment**:
- ✅ GEMINI_API_KEY added to Railway/Hugging Face environment
- ✅ Database migration applied in production
- ✅ Chat endpoint accessible in production
- ✅ Frontend /chat page accessible
- ✅ No CORS errors
- ✅ Works end-to-end in production

**When ALL Phase III criteria met**: Phase III is complete! Demo now includes cutting-edge AI chatbot alongside traditional dashboard interface. Estimated score boost: +10-15 points for innovation! 🤖🏆

---

**Version**: 1.1.0 | **Ratified**: 2025-12-14 | **Last Amended**: 2025-12-17
