# Technology Research & Decisions

**Feature**: Competition-Winning Full-Stack Todo Application
**Version**: 1.0.0
**Last Updated**: 2025-12-14

---

## Executive Summary

This document captures all technology choices made for the Hackathon II Phase II competition entry. Every decision is optimized for winning 1st place (98/100 target score) by balancing:
- **Development Speed** (2-day timeline)
- **Production Quality** (judges evaluate code quality)
- **Performance** (Lighthouse score >90)
- **Security** (enterprise-grade protection)
- **Innovation** (stand out from competitors)

**Key Philosophy**: Use battle-tested technologies with minimal configuration over bleeding-edge tools that require extensive setup.

---

## 1. Frontend Technology Stack

### 1.1 Framework: Next.js 16 (App Router)

**Decision**: Use Next.js 16 with App Router architecture

**Alternatives Considered**:
1. **Next.js Pages Router**: Stable, more documentation
2. **Create React App**: Simpler, but deprecated
3. **Remix**: Better DX, modern patterns
4. **Vite + React**: Fastest dev server

**Rationale for Next.js App Router**:
- ✅ **Performance**: React Server Components reduce JavaScript bundle
  - Judges use Lighthouse → Better scores out of the box
  - Automatic code splitting by route
  - Built-in image optimization
- ✅ **Production Ready**: Backed by Vercel, used by Fortune 500
  - Shows technical maturity (code quality points)
- ✅ **Deployment**: Zero-config Vercel deployment
  - Deploy in <5 minutes
  - No DevOps needed (saves 4-6 hours)
- ✅ **Future-Proof**: Recommended by React team
  - Shows awareness of modern best practices (innovation points)

**Trade-offs**:
- ⚠️ Steeper learning curve vs Pages Router
  - Mitigated by: Detailed code examples in implementation plan
- ⚠️ Less Stack Overflow answers for App Router
  - Mitigated by: Official docs are excellent

**Winning Edge**: App Router gives 5-10 point Lighthouse boost vs CRA, directly improving UI/UX score (20% of total).

---

### 1.2 State Management: TanStack Query v5 + React Hooks

**Decision**: Use TanStack Query for server state, React Hooks for local state

**Alternatives Considered**:
1. **Redux Toolkit**: Industry standard, predictable
2. **Zustand**: Lightweight (1KB), simple API
3. **Recoil**: Facebook's solution
4. **Apollo Client**: GraphQL-specific

**Rationale for TanStack Query**:
- ✅ **Perfect for REST APIs**: Built specifically for server state
  - Automatic caching (5-minute staleTime)
  - Background refetching
  - Optimistic updates (key differentiator for competition)
- ✅ **DevTools**: React Query Devtools for debugging
  - Impresses judges during demo
- ✅ **Performance**: Smart caching reduces API calls
  - Faster perceived performance
- ✅ **Code Quality**: Eliminates boilerplate
  - Cleaner code vs Redux (code quality points)

**When to Use Each**:
- TanStack Query: All server data (tasks, user profile, statistics)
- React Hooks (useState): UI state (modals open/closed, form inputs)
- Zustand: Only if complex global state needed (likely not for Phase II)

**Winning Edge**: Optimistic updates pattern (unique to TanStack Query) makes app feel instant. Most competitors will have laggy UIs.

---

### 1.3 Styling: Tailwind CSS 3.4

**Decision**: Use Tailwind CSS with custom theme configuration

**Alternatives Considered**:
1. **CSS Modules**: Scoped styles, type-safe
2. **Styled Components**: CSS-in-JS, dynamic styles
3. **MUI (Material-UI)**: Pre-built components
4. **Chakra UI**: Component library with great a11y

**Rationale for Tailwind**:
- ✅ **Speed**: Prototype 3x faster than custom CSS
  - Critical for 2-day timeline
- ✅ **Consistency**: Design system built-in
  - Professional look (UI/UX points)
  - No random colors/spacing
- ✅ **Performance**: JIT mode generates minimal CSS
  - Only classes you use → Smaller bundle
- ✅ **Responsive**: Mobile-first utilities (sm:, md:, lg:)
  - Perfect responsive design (UI/UX requirement)
- ✅ **Dark Mode**: dark: variant built-in
  - Bonus feature, minimal effort

**Configuration**:
```javascript
// tailwind.config.js - Competition-optimized theme
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',  // Blue - professional, trustworthy
          600: '#2563eb',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),  // Better form styles
  ]
}
```

**Winning Edge**: Consistent design system makes app look professional. Competitors using vanilla CSS will have inconsistent spacing/colors.

---

### 1.4 Animations: Framer Motion 11

**Decision**: Use Framer Motion for all animations

**Alternatives Considered**:
1. **CSS Animations**: No dependencies, simple
2. **React Spring**: Physics-based animations
3. **GSAP**: Most powerful, but overkill
4. **Anime.js**: Lightweight alternative

**Rationale for Framer Motion**:
- ✅ **React Integration**: Designed for React, uses components
  - `<motion.div>` syntax is clean
- ✅ **60fps Performance**: GPU-accelerated
  - Smooth animations (UI/UX points)
- ✅ **Declarative**: Variants pattern is readable
  - Code quality points
- ✅ **Gesture Support**: Drag, tap, hover built-in
  - If time for drag-to-reorder tasks

**Usage Strategy**:
- Page transitions: 0.3s fade
- List animations: Stagger children (0.05s delay each)
- Modal: Slide up from bottom
- Completed task: Scale + fade

**Winning Edge**: Smooth 60fps animations feel premium. Most todo apps have no animations or janky CSS transitions.

---

### 1.5 Form Handling: React Hook Form + Zod

**Decision**: Use React Hook Form for forms, Zod for validation

**Alternatives Considered**:
1. **Formik**: Popular, but heavier
2. **Vanilla React**: useState for each field
3. **Final Form**: Similar to Formik
4. **Native HTML5 validation**: Lightweight

**Rationale for React Hook Form + Zod**:
- ✅ **Performance**: Minimal re-renders
  - Uncontrolled inputs = faster than Formik
- ✅ **DX**: Less boilerplate than vanilla React
  - Cleaner code (code quality points)
- ✅ **Validation**: Zod schemas are TypeScript-first
  - Type safety catches bugs at compile time
  - Can share schemas with backend (consistency)
- ✅ **Error Handling**: Built-in error state management
  - Professional error messages (UI/UX points)

**Example**:
```typescript
// Shared validation schema
const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['high', 'medium', 'low']),
})

// Use in form
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(taskSchema)
})
```

**Winning Edge**: Real-time validation with clear error messages. Competitors likely have buggy form validation or no validation at all.

---

### 1.6 Icons: Lucide React

**Decision**: Use Lucide React icon library

**Alternatives Considered**:
1. **React Icons**: More icons (10,000+)
2. **Heroicons**: Tailwind team's official icons
3. **Font Awesome**: Most popular
4. **Custom SVGs**: Full control

**Rationale for Lucide**:
- ✅ **Modern Design**: Clean, consistent style
  - Professional appearance
- ✅ **Tree-Shakeable**: Import only icons you use
  - Smaller bundle size
- ✅ **TypeScript**: Full type definitions
  - Better DX
- ✅ **Customizable**: Stroke width, size props
  - Easy to adjust

**Icon Usage**:
- Check (✓): Task completion
- Trash: Delete action
- Edit: Edit action
- Plus: Create task
- Search: Search input
- Calendar: Due date
- User: User profile

**Winning Edge**: Consistent icon style makes UI look polished. Mixing icon libraries looks unprofessional.

---

## 2. Backend Technology Stack

### 2.1 Framework: FastAPI 0.104+

**Decision**: Use FastAPI as web framework

**Alternatives Considered**:
1. **Django REST Framework**: Full-featured, mature
2. **Flask**: Lightweight, flexible
3. **Express.js (Node)**: JavaScript everywhere
4. **NestJS**: TypeScript, Angular-like

**Rationale for FastAPI**:
- ✅ **Speed**: Fastest Python framework (on par with Node)
  - <500ms API response target achievable
- ✅ **Auto Documentation**: Swagger UI at /docs
  - Zero effort documentation (presentation points)
  - Impresses judges
- ✅ **Type Safety**: Pydantic models catch errors
  - Fewer bugs (functionality points)
- ✅ **Async Support**: async/await for DB queries
  - Better performance under load
- ✅ **Modern**: Industry momentum (used by Netflix, Uber)
  - Shows awareness of best practices (innovation points)

**Why Not Django**:
- Django is excellent, but slower development for APIs
- Django REST Framework adds boilerplate
- FastAPI's auto docs are unmatched

**Why Not Node/Express**:
- Python has better ecosystem for data/ML (future extensibility)
- Pydantic validation > manual validation
- SQLModel (Python) is cleaner than TypeORM

**Winning Edge**: /docs endpoint with interactive API testing. Judges can test API in browser without Postman.

---

### 2.2 ORM: SQLModel 0.0.14

**Decision**: Use SQLModel (Pydantic + SQLAlchemy wrapper)

**Alternatives Considered**:
1. **Raw SQLAlchemy**: More control, mature
2. **Prisma (Python)**: Modern, but experimental
3. **Tortoise ORM**: Async-first
4. **Django ORM**: Excellent, but tied to Django

**Rationale for SQLModel**:
- ✅ **DRY Principle**: One model = DB + API validation
  - No duplicate Pydantic models
  - Less code to maintain (code quality points)
- ✅ **Type Safety**: Full mypy support
  - Catches errors at development time
- ✅ **FastAPI Integration**: Same author (Sebastián Ramírez)
  - Designed to work together
  - Auto OpenAPI schema generation
- ✅ **SQLAlchemy Under the Hood**: Mature, proven
  - Production-ready
  - All SQLAlchemy features available if needed

**Example**:
```python
# One model for everything
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    completed: bool = False

# Use for:
# 1. Database schema (alembic migrations)
# 2. API request validation
# 3. API response serialization
# 4. Type hints in business logic
```

**Winning Edge**: Single source of truth. Competitors using SQLAlchemy + Pydantic separately will have inconsistencies and bugs.

---

### 2.3 Database: PostgreSQL (Neon Serverless)

**Decision**: Use Neon PostgreSQL for development and production

**Alternatives Considered**:
1. **SQLite**: Simple, no server needed
2. **MySQL**: Popular, well-supported
3. **MongoDB**: NoSQL, flexible schema
4. **Supabase PostgreSQL**: Firebase alternative

**Rationale for PostgreSQL**:
- ✅ **Production Standard**: Fortune 500 default
  - Shows production thinking (code quality points)
- ✅ **ACID Compliance**: Transactions, foreign keys
  - Data integrity
  - Prevents bugs in multi-user isolation
- ✅ **Performance**: Excellent query optimization
  - Indexes, query planner
- ✅ **JSON Support**: JSONB columns if needed
  - Flexibility without sacrificing relational model

**Rationale for Neon Specifically**:
- ✅ **Serverless**: Auto-scaling, connection pooling
  - No database management (saves 2-4 hours)
- ✅ **Free Tier**: Generous limits
  - No credit card required for hackathon
- ✅ **Instant Setup**: Database ready in 30 seconds
  - No docker-compose needed for development
- ✅ **Branch** ing: Can create DB branch for testing
  - Advanced feature (innovation points)

**Why Not SQLite**:
- Judgesexpect production database
- No concurrent write support (multi-user fails)

**Why Not MongoDB**:
- Relational data (users → tasks → tags)
- Foreign keys critical for data integrity
- PostgreSQL is expected for production apps

**Winning Edge**: Neon connection pooling handles traffic spikes. Competitors using SQLite will fail multi-user testing.

---

### 2.4 Authentication: JWT (PyJWT)

**Decision**: Use JWT tokens for authentication

**Alternatives Considered**:
1. **Session Cookies**: Server-side session storage
2. **OAuth2 Password Flow**: More complex
3. **Auth0/Supabase Auth**: Third-party service
4. **Magic Links**: Passwordless, but unusual

**Rationale for JWT**:
- ✅ **Stateless**: No server-side session storage
  - Scales horizontally (shows architectural thinking)
- ✅ **Standard**: Industry default for SPA + API
  - Expected by judges
- ✅ **Frontend-Friendly**: Easy to store in localStorage
  - Simple axios interceptor
- ✅ **Self-Contained**: User info in payload
  - No database query to validate (performance)

**Configuration**:
- Algorithm: HS256 (symmetric, faster than RS256)
- Expiration: 7 days (balance security vs UX)
- Payload: user_id, email (minimal data)
- Secret: 256-bit random (generated with secrets module)

**Security Measures**:
- ✅ HTTPS only (Vercel/Railway enforce this)
- ✅ Short expiration (7 days, not 30)
- ✅ No sensitive data in payload
- ✅ Verify signature on every request

**Winning Edge**: Stateless architecture impresses judges (shows scalability knowledge). Session-based auth is seen as outdated.

---

### 2.5 Password Hashing: Passlib (bcrypt)

**Decision**: Use bcrypt with cost factor 12

**Alternatives Considered**:
1. **Argon2**: Newer, more secure
2. **scrypt**: Memory-hard, GPU-resistant
3. **PBKDF2**: Standard, but slower
4. **SHA256**: NEVER use plain hashing

**Rationale for bcrypt**:
- ✅ **Industry Standard**: Used by 90% of applications
  - Expected by judges
- ✅ **Proven Security**: 25+ years in production
  - No vulnerabilities
- ✅ **Configurable Cost**: Can increase as hardware improves
  - Future-proof
- ✅ **Python Support**: passlib library is mature
  - Well-tested, no surprises

**Cost Factor Selection**:
- Cost 12 = ~250ms to hash
- Balance: Slow enough to deter brute force, fast enough for UX
- Competitors using cost 10 = less secure
- Competitors using cost 14 = poor UX (slow signups)

**Implementation**:
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password, scheme="bcrypt", rounds=12)
```

**Winning Edge**: bcrypt cost 12 is Goldilocks (just right). Shows security knowledge without hurting UX.

---

### 2.6 Rate Limiting: slowapi

**Decision**: Use slowapi for rate limiting

**Alternatives Considered**:
1. **fastapi-limiter**: Redis-based
2. **Manual implementation**: Decorators + Redis
3. **Nginx rate limiting**: Infrastructure level
4. **No rate limiting**: Skip this feature

**Rationale for slowapi**:
- ✅ **Simple**: In-memory, no Redis needed
  - Saves 2-3 hours of setup
- ✅ **FastAPI Integration**: Decorators on routes
  - Clean code
- ✅ **Flexible**: Different limits per endpoint
  - 5/15min for login, 3/hour for signup, 100/min for API
- ✅ **Production Ready**: Used in production apps
  - Not a toy library

**Rate Limits**:
- POST /api/auth/signup: 3 per hour per IP
- POST /api/auth/login: 5 per 15 minutes per IP
- GET /api/tasks: 100 per minute per user
- POST /PUT /PATCH /DELETE: 50 per minute per user

**Why Not Redis**:
- Competition timeline (2 days)
- Single backend instance (no need for distributed rate limiting)
- Can upgrade to Redis later if needed

**Winning Edge**: Rate limiting is rare in hackathon projects. Shows security thinking (code quality + innovation points).

---

## 3. Deployment & Infrastructure

### 3.1 Frontend Hosting: Vercel

**Decision**: Deploy frontend to Vercel

**Alternatives Considered**:
1. **Netlify**: Similar to Vercel
2. **AWS Amplify**: More features, complex
3. **GitHub Pages**: Free, but static only
4. **Cloud Run**: More control, harder setup

**Rationale for Vercel**:
- ✅ **Zero Config**: Connect GitHub, auto-deploy
  - Deploy in <5 minutes
- ✅ **Next.js Optimized**: Made by Next.js creators
  - Best performance possible
  - Edge functions, ISR work perfectly
- ✅ **Global CDN**: Fast worldwide
  - Better Lighthouse scores
- ✅ **Free Tier**: Generous (100GB bandwidth)
  - No credit card for hackathon
- ✅ **Preview Deploys**: Every PR gets URL
  - Easy to test (development bonus)

**Configuration**:
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build"
}
```

**Winning Edge**: Vercel + Next.js = perfect Lighthouse scores. Competitors on generic hosting will score lower.

---

### 3.2 Backend Hosting: Railway

**Decision**: Deploy backend to Railway

**Alternatives Considered**:
1. **Heroku**: Popular, but expensive
2. **Render**: Free tier, but slower cold starts
3. **Fly.io**: Modern, but complex
4. **DigitalOcean App Platform**: Good, but costs $5/month
5. **AWS Elastic Beanstalk**: Powerful, overkill

**Rationale for Railway**:
- ✅ **Simple**: GitHub connect, auto-deploy
  - Like Vercel for backends
- ✅ **Free Tier**: $5 credit monthly
  - Enough for hackathon
- ✅ **Health Checks**: Built-in monitoring
  - App stays awake
- ✅ **Environment Variables**: Easy UI
  - No config file hell
- ✅ **Logs**: Real-time logs in dashboard
  - Easy debugging

**Configuration**:
```toml
# railway.toml
[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
```

**Why Not Heroku**:
- Expensive ($7/month after free tier removed)
- Railway is newer, faster

**Winning Edge**: Railway's health checks keep app responsive. Competitors on Render will have cold start delays during judging.

---

### 3.3 Database Hosting: Neon

**Decision**: Use Neon for PostgreSQL (already decided in 2.3)

**Deployment Integration**:
- Backend (Railway) connects to Neon via DATABASE_URL
- Connection pooling handled by Neon (pgbouncer)
- No database server to manage

**Winning Edge**: Managed database = zero downtime. Competitors self-hosting PostgreSQL may have connection issues during judging.

---

## 4. Development Tools

### 4.1 Version Control: Git + GitHub

**Decision**: Use Git with GitHub (standard)

**Commit Strategy**:
- Conventional Commits format: `feat:`, `fix:`, `refactor:`
- Commit frequently (after each task in implementation plan)
- Use branches for phases (optional, may skip for speed)

**Why This Matters**:
- Clean commit history shows professionalism (code quality points)
- Judges may review commits to verify solo work

---

### 4.2 Code Editor: VS Code (Assumed)

**Recommended Extensions**:
- ESLint: Catch JavaScript errors
- Pylance: Python type checking
- Tailwind CSS IntelliSense: Autocomplete classes
- Pretty TypeScript Errors: Better error messages
- SQLTools: Database queries

**Settings**:
- Format on save (Prettier)
- Auto-import organization
- TypeScript strict mode

---

### 4.3 API Testing: FastAPI /docs (Swagger UI)

**Decision**: Use built-in Swagger UI instead of Postman

**Rationale**:
- ✅ Auto-generated from code
  - Zero effort documentation
- ✅ Interactive**: Test endpoints in browser
  - Judges can try API themselves
- ✅ Always Accurate**: Docs can't go stale
  - Synced with code

**Winning Edge**: Judges love /docs. Easier than reading curl commands in README.

---

## 5. Testing Strategy

### 5.1 Manual Testing (Primary)

**Decision**: Focus on manual testing, skip automated tests

**Rationale**:
- ✅ **Time**: 2-day timeline prioritizes features
  - Writing tests takes 30-40% extra time
- ✅ **Competition Context**: Judges don't see tests
  - Better to have more features + no tests
  - Than fewer features + 80% test coverage
- ✅ **Demo Video**: Serves as acceptance test
  - Proves all features work

**Manual Testing Checklist**: See Phase 6 of implementation plan

**Trade-offs**:
- ⚠️ More prone to bugs
  - Mitigated by: Comprehensive manual testing checklist
- ⚠️ No CI/CD validation
  - Mitigated by: Deploy early, test continuously

---

### 5.2 Optional Automated Tests (If Time Permits)

**If ahead of schedule**, add tests for:
- Auth endpoints (signup, login, JWT validation)
- Task CRUD endpoints
- Frontend form validation

**Tools**:
- Backend: pytest + TestClient
- Frontend: Jest + React Testing Library

**Winning Edge**: If time permits, tests show professionalism. But features > tests for competition.

---

## 6. Performance Strategy

### 6.1 Frontend Performance

**Techniques**:
- Code splitting (automatic with Next.js App Router)
- Image optimization (Next.js Image component)
- Prefetching (Next.js Link component)
- Lazy loading modals (React.lazy)
- TanStack Query caching (5-minute staleTime)

**Targets**:
- Lighthouse Performance: >90
- First Contentful Paint: <1.8s
- Time to Interactive: <3.4s

---

### 6.2 Backend Performance

**Techniques**:
- Database indexes (user_id, completed, priority)
- Connection pooling (Neon provides this)
- Async/await for all DB queries
- Avoid N+1 queries (use joinedload)

**Targets**:
- API response: <500ms at p95
- Database query: <100ms

---

## 7. Security Checklist

✅ **Authentication**:
- bcrypt cost 12
- JWT HS256
- 7-day expiration
- HTTPS only

✅ **Authorization**:
- User ID from JWT
- Filter queries by user_id
- Return 404 (not 403) for unauthorized access

✅ **Input Validation**:
- Zod on frontend
- Pydantic on backend
- SQLModel parameterized queries (SQL injection protection)

✅ **Rate Limiting**:
- 3 signups per hour
- 5 logins per 15 minutes
- 100 API calls per minute

✅ **CORS**:
- Whitelist Vercel domain
- Never use "*" in production

✅ **Headers**:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security

---

## 8. Risk Mitigation

### 8.1 Technology Risks

| Technology | Risk | Mitigation |
|------------|------|------------|
| Next.js 16 | Breaking changes, bugs | Use stable tag, test early |
| Neon | Service outage | Have backup DATABASE_URL (local PostgreSQL) |
| Railway | Deployment fails | Deploy early (Phase 1), test continuously |
| TanStack Query | Learning curve | Use examples from plan, reference docs |

### 8.2 Contingency Plans

**If technology doesn't work**:
- Next.js → Fall back to Create React App (lose 6 hours)
- FastAPI → Fall back to Flask (lose 4 hours)
- Neon → Use local PostgreSQL (lose 2 hours)
- Railway → Use Render (lose 1 hour)

**Priority**: Keep Next.js and FastAPI at all costs. Others are replaceable.

---

## 9. Innovation Opportunities

### 9.1 Implemented Innovations

**Optimistic Updates**:
- Unique to TanStack Query
- Most competitors won't have this
- Feels instant (UI/UX points)

**Rate Limiting**:
- Rare in hackathon projects
- Shows security thinking (innovation + code quality points)

**Auto-Generated API Docs**:
- FastAPI /docs
- Impresses judges

**Keyboard Shortcuts**:
- Power user feature
- Shows attention to UX

**Dark Mode**:
- Modern expectation
- Easy with Tailwind

### 9.2 Skipped "Innovations"

**Not pursuing** (time vs value):
- ❌ GraphQL (REST is simpler)
- ❌ Microservices (overkill)
- ❌ Redis caching (TanStack Query sufficient)
- ❌ WebSockets (not needed for todo app)
- ❌ PWA/offline mode (nice to have, not MVP)

---

## 10. Final Tech Stack Summary

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.3+ (strict mode)
- **Styling**: Tailwind CSS 3.4
- **State**: TanStack Query v5 + React Hooks
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion 11
- **Icons**: Lucide React
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI 0.104
- **Language**: Python 3.11+
- **ORM**: SQLModel 0.0.14
- **Database**: PostgreSQL 15 (Neon)
- **Auth**: JWT (PyJWT)
- **Validation**: Pydantic V2
- **Rate Limiting**: slowapi
- **Deployment**: Railway

### Infrastructure
- **Version Control**: Git + GitHub
- **Database**: Neon PostgreSQL
- **Frontend Host**: Vercel
- **Backend Host**: Railway
- **Domain**: Default (.vercel.app + .railway.app)

---

## 11. Success Metrics

**This tech stack achieves**:
- ✅ **Speed**: 2-day timeline achievable
- ✅ **Quality**: Production-grade code
- ✅ **Performance**: Lighthouse >90
- ✅ **Security**: Enterprise-level protection
- ✅ **Innovation**: 3-4 unique features
- ✅ **Deployment**: Zero downtime
- ✅ **Documentation**: Auto-generated API docs

**Expected Score**: 98/100 = 1ST PLACE 🏆

---

## 12. References

- Next.js: https://nextjs.org/docs
- FastAPI: https://fastapi.tiangolo.com
- TanStack Query: https://tanstack.com/query
- Tailwind CSS: https://tailwindcss.com/docs
- SQLModel: https://sqlmodel.tiangolo.com
- Neon: https://neon.tech/docs
- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app

---

**Document Status**: ✅ Complete
**Next Step**: Review data-model.md for database schema details
