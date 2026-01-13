# Frontend Guidelines - Hackathon Todo App

## Tech Stack

- **Framework**: Next.js 16.0.0 (App Router)
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5.3+ (strict mode, zero 'any' types)
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: TanStack Query v5.17.0 (React Query)
- **Forms**: React Hook Form 7.49.3 + Zod 3.22.4 validation
- **HTTP Client**: Axios 1.6.5 with interceptors
- **Animations**: Framer Motion 11.0.0
- **Notifications**: react-hot-toast 2.4.1
- **Icons**: lucide-react 0.307.0

## Project Structure

```
frontend/
├── app/                        # Next.js App Router (file-based routing)
│   ├── layout.tsx             # Root layout (wraps all pages)
│   ├── page.tsx               # Landing page (/)
│   ├── providers.tsx          # React Query provider
│   ├── globals.css            # Global Tailwind styles
│   ├── login/                 # Login page (/login)
│   │   └── page.tsx
│   ├── signup/                # Signup page (/signup)
│   │   └── page.tsx
│   └── dashboard/             # Dashboard page (/dashboard) - Protected
│       └── page.tsx
├── components/                 # Reusable React components
│   ├── TaskList.tsx           # Main task list with filters
│   ├── TaskItem.tsx           # Individual task card
│   ├── TaskForm.tsx           # Create/edit task modal
│   ├── FilterBar.tsx          # Filter controls
│   ├── SearchBar.tsx          # Search input
│   ├── StatsCard.tsx          # Statistics widget
│   ├── TagManager.tsx         # Tag creation/editing
│   └── ui/                    # Base UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Select.tsx
│       └── ...
├── lib/                       # Utilities and business logic
│   ├── api.ts                 # Axios instance with auth interceptor
│   ├── queryClient.ts         # TanStack Query configuration
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   └── hooks/                 # Custom React hooks
│       ├── useAuth.ts         # Authentication logic
│       ├── useTasks.ts        # Task CRUD operations
│       ├── useTags.ts         # Tag operations
│       └── useKeyboardShortcuts.ts  # Keyboard shortcut handler
├── public/                    # Static assets (images, fonts)
├── .env.local                 # Environment variables (NOT in git)
├── .env.example               # Environment variable template
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration (strict mode)
└── package.json               # Dependencies and scripts
```

## Coding Patterns

### 1. Component Structure

Always use this pattern for components:

```typescript
// File: components/TaskItem.tsx
// Spec: specs/001-competition-todo-app/spec.md § FR-2.2 (View Tasks)

'use client' // Only if component uses hooks or interactivity

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Task } from '@/lib/types'

interface TaskItemProps {
  task: Task
  onUpdate: (task: Task) => void
  onDelete: (id: number) => void
}

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
    >
      {/* Component JSX */}
    </motion.div>
  )
}
```

**Key Points**:
- Always include file comment with spec reference
- Use `'use client'` directive for interactive components
- Define strict TypeScript interfaces for props
- Use Framer Motion for animations
- Support dark mode (`dark:` classes)
- Use semantic HTML (`<button>`, `<form>`, not just `<div>`)

### 2. API Client Usage

All backend calls go through the centralized API client:

```typescript
// File: lib/api.ts

import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

**Usage in Hooks**:

```typescript
// File: lib/hooks/useTasks.ts

import api from '@/lib/api'

export function useTasks() {
  // GET /tasks
  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.get<Task[]>('/tasks')
      return response.data
    },
  })

  // POST /tasks
  const createTask = useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const response = await api.post<Task>('/tasks', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created')
    },
  })

  return { tasks, createTask }
}
```

### 3. State Management with TanStack Query

Use TanStack Query (React Query) for server state:

```typescript
// Queries (GET requests)
const { data, isLoading, error } = useQuery({
  queryKey: ['tasks', filters], // Include dependencies in key
  queryFn: async () => {
    const response = await api.get('/tasks', { params: filters })
    return response.data
  },
  staleTime: 5 * 60 * 1000, // 5 minutes (balance freshness and performance)
})

// Mutations (POST/PATCH/DELETE requests)
const mutation = useMutation({
  mutationFn: async (data) => {
    return await api.post('/tasks', data)
  },
  onMutate: async (newTask) => {
    // Optimistic update - show immediately
    await queryClient.cancelQueries({ queryKey: ['tasks'] })
    const previousTasks = queryClient.getQueryData(['tasks'])
    queryClient.setQueryData(['tasks'], (old) => [...old, newTask])
    return { previousTasks }
  },
  onError: (err, newTask, context) => {
    // Revert on error
    queryClient.setQueryData(['tasks'], context.previousTasks)
    toast.error('Failed to create task')
  },
  onSuccess: () => {
    // Refetch to get server state
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    toast.success('Task created')
  },
})
```

**Query Key Strategy**:
- `['tasks']` - All tasks
- `['tasks', { status: 'pending' }]` - Filtered tasks
- `['tasks', taskId]` - Single task
- `['tags']` - All tags
- `['currentUser']` - Current user profile

### 4. Form Validation with React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Define Zod schema
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  category: z.string().optional(),
  dueDate: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

function TaskForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  })

  const onSubmit = (data: TaskFormData) => {
    createTask.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          {...register('title')}
          className="border rounded px-3 py-2"
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>

      <button type="submit">Create Task</button>
    </form>
  )
}
```

### 5. Styling with Tailwind CSS

**Conventions**:
- Use utility classes, avoid inline styles
- Group related utilities: `px-4 py-2` (padding), then `bg-blue-500 text-white` (colors)
- Use `dark:` prefix for dark mode styles
- Extract repeated patterns to components, not @apply
- Use `clsx` or `tailwind-merge` for conditional classes

```typescript
import { clsx } from 'clsx'

<div className={clsx(
  'px-4 py-2 rounded-lg',
  'bg-white dark:bg-gray-800',
  'border border-gray-200 dark:border-gray-700',
  task.priority === 'high' && 'border-l-4 border-l-red-500',
  task.completed && 'opacity-50 line-through'
)}>
```

**Color Palette** (from tailwind.config.ts):
- Primary: `blue-500` (buttons, links)
- Success: `green-500` (completed tasks)
- Warning: `yellow-500` (medium priority)
- Danger: `red-500` (high priority, delete)
- Neutral: `gray-100` to `gray-900` (text, backgrounds)

**Responsive Breakpoints**:
- Mobile: default (< 640px)
- Tablet: `sm:` (640px+)
- Laptop: `md:` (768px+)
- Desktop: `lg:` (1024px+)
- Large Desktop: `xl:` (1280px+)

### 6. Animations with Framer Motion

```typescript
import { motion, AnimatePresence } from 'framer-motion'

// Fade in on mount
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>

// Slide up from bottom
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
>

// Scale in (modal)
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ type: 'spring', duration: 0.3 }}
>

// List animations
<AnimatePresence>
  {tasks.map((task) => (
    <motion.div
      key={task.id}
      layout // Smooth reordering
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <TaskItem task={task} />
    </motion.div>
  ))}
</AnimatePresence>
```

**Animation Guidelines**:
- Keep duration short (200-300ms)
- Use `type: 'spring'` for natural motion
- Always wrap list items in `<AnimatePresence>`
- Respect `prefers-reduced-motion` (Framer Motion does this automatically)

### 7. Notifications with react-hot-toast

```typescript
import toast from 'react-hot-toast'

// Success
toast.success('Task created successfully')

// Error
toast.error('Failed to save task')

// Loading (with promise)
toast.promise(
  createTask.mutateAsync(data),
  {
    loading: 'Creating task...',
    success: 'Task created!',
    error: 'Failed to create task',
  }
)

// Custom toast
toast.custom((t) => (
  <div className="bg-white px-4 py-3 rounded-lg shadow-lg">
    Custom message
  </div>
))
```

### 8. Dark Mode Support

Use `next-themes` for dark mode:

```typescript
// In layout.tsx
import { ThemeProvider } from 'next-themes'

<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>

// In any component
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
```

**Tailwind Dark Mode Classes**:
```html
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

### 9. TypeScript Patterns

**Type Definitions** (lib/types/index.ts):

```typescript
// Backend matches these exactly (from Pydantic schemas)
export interface User {
  id: number
  email: string
  name?: string
  created_at: string
}

export interface Task {
  id: number
  user_id: number
  title: string
  description?: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  category?: string
  due_date?: string
  created_at: string
  updated_at: string
  tags?: Tag[]
}

export interface Tag {
  id: number
  name: string
  color: string
  created_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Frontend-only types
export interface TaskFilters {
  status?: 'all' | 'pending' | 'completed'
  priority?: 'high' | 'medium' | 'low'
  category?: string
  tag?: string
  search?: string
}
```

**Strict Mode Rules**:
- NO `any` types (use `unknown` if truly unknown)
- NO `ts-ignore` comments
- NO optional chaining abuse (`?.?.?.`)
- Use type guards for narrowing
- Prefer interfaces over types for objects

### 10. Accessibility (WCAG 2.1 AA)

**Requirements**:
- Color contrast ≥ 4.5:1 for text
- All images have `alt` text
- All buttons have accessible labels
- Keyboard navigation works (Tab, Enter, Escape)
- Focus visible on all interactive elements
- ARIA labels on icon buttons
- Form inputs have associated labels
- Error messages linked to form fields

**Example**:

```typescript
<button
  aria-label="Delete task"
  className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
>
  <TrashIcon className="w-5 h-5" />
</button>

<input
  id="task-title"
  aria-describedby={errors.title ? 'title-error' : undefined}
  aria-invalid={!!errors.title}
/>
{errors.title && (
  <p id="title-error" role="alert" className="text-red-500">
    {errors.title.message}
  </p>
)}
```

## Environment Variables

Required in `.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8001

# Only NEXT_PUBLIC_* variables are exposed to the browser
# Never put secrets in NEXT_PUBLIC_* variables
```

## Common Tasks

### Add a New Page

1. Create file in `app/my-page/page.tsx`
2. Export default function component
3. Page auto-routes to `/my-page`

```typescript
// app/my-page/page.tsx
export default function MyPage() {
  return <div>My Page</div>
}
```

### Add a New Component

1. Create file in `components/MyComponent.tsx`
2. Use PascalCase for component name
3. Export as named export

```typescript
// components/MyComponent.tsx
interface MyComponentProps {
  // ...
}

export function MyComponent({ ...props }: MyComponentProps) {
  return <div>...</div>
}
```

### Add a New API Hook

1. Create file in `lib/hooks/useMyFeature.ts`
2. Use TanStack Query for data fetching
3. Return data and mutations

```typescript
// lib/hooks/useMyFeature.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'

export function useMyFeature() {
  const { data } = useQuery({ ... })
  const mutation = useMutation({ ... })

  return { data, mutation }
}
```

## Performance Optimization

1. **Code Splitting**: Next.js handles automatically
2. **Image Optimization**: Use `next/image` component
3. **Font Optimization**: Use `next/font`
4. **Bundle Analysis**: `npm run build` shows bundle sizes
5. **TanStack Query Caching**: Set appropriate `staleTime` and `cacheTime`
6. **Optimistic Updates**: Update UI before API response
7. **Debouncing**: Debounce search inputs (300ms delay)

## Debugging

- **React DevTools**: Inspect component tree and props
- **React Query Devtools**: Inspect query cache and states
- **Network Tab**: Check API requests/responses
- **Console**: Use descriptive console.log messages
- **TypeScript Errors**: Run `npm run type-check` before committing

## Security Best Practices

1. **XSS Prevention**: React escapes by default, never use `dangerouslySetInnerHTML`
2. **CSRF**: JWT tokens immune to CSRF (not using cookies)
3. **Token Storage**: localStorage (acceptable for JWTs, not for session cookies)
4. **Environment Variables**: NEVER commit `.env.local`, use `.env.example`
5. **Input Validation**: Validate on frontend AND backend (don't trust client)
6. **HTTPS Only**: Production must use HTTPS (Vercel handles this)

## Testing

Manual testing required for hackathon. Use this checklist:

- [ ] All pages load without errors
- [ ] Login/signup works
- [ ] Task CRUD operations work
- [ ] Filters and search work
- [ ] Mobile responsive (test on real device or Chrome DevTools)
- [ ] Dark mode toggles correctly
- [ ] No console errors
- [ ] Lighthouse score > 90

## Build and Deploy

```bash
# Development
npm run dev

# Type check (before committing)
npm run type-check

# Lint (before committing)
npm run lint

# Production build
npm run build

# Test production build locally
npm run start
```

## Links

- **Main Spec**: `@../specs/001-competition-todo-app/spec.md`
- **Root CLAUDE.md**: `@../CLAUDE.md`
- **Backend CLAUDE.md**: `@../backend/CLAUDE.md`
- **API Testing**: `@../API_TESTING.md`

---

**Remember**: This is a competition. Code quality matters. Always reference the spec. No shortcuts.
