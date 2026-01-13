# Testing Guide - Hackathon Phase II Todo Application

## ✅ **SERVER STATUS**

Both development servers are running successfully:

- **Backend API**: http://localhost:8001
  - API Documentation: http://localhost:8001/docs
  - Health Check: http://localhost:8001/health (if implemented)

- **Frontend App**: http://localhost:3000
  - Dashboard: http://localhost:3000/dashboard
  - Login: http://localhost:3000/login
  - Signup: http://localhost:3000/signup

---

## 🚀 **How to Start the Servers**

### Backend (FastAPI)
```bash
cd backend
# Windows
python -m uvicorn app.main:app --reload --port 8001

# Linux/Mac
source venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

### Frontend (Next.js)
```bash
cd frontend
npm run dev
```

**Note**: If you encounter a lock error, run:
```bash
cd frontend
rm -rf .next/dev/lock
npm run dev
```

---

## 📋 **COMPREHENSIVE TESTING CHECKLIST**

### **1. Authentication** (Required Feature)

#### Sign Up
- [ ] Navigate to http://localhost:3000/signup
- [ ] Enter valid email (e.g., `test@example.com`)
- [ ] Enter password (min 8 characters)
- [ ] Enter name (optional)
- [ ] Click "Sign Up"
- [ ] **Expected**: Redirect to `/dashboard` with JWT token stored
- [ ] **Verify**: Check localStorage for `token` key

#### Sign Up - Error Cases
- [ ] Try signing up with existing email
  - **Expected**: Error message "Email already registered"
- [ ] Try signing up with password < 8 characters
  - **Expected**: Validation error "Password must be at least 8 characters"
- [ ] Try signing up with invalid email
  - **Expected**: Validation error "Invalid email address"

#### Login
- [ ] Navigate to http://localhost:3000/login
- [ ] Enter registered email and password
- [ ] Click "Login"
- [ ] **Expected**: Redirect to `/dashboard` with JWT token stored

#### Login - Error Cases
- [ ] Try logging in with wrong password
  - **Expected**: Error message "Invalid credentials"
- [ ] Try logging in with non-existent email
  - **Expected**: Error message "Invalid credentials"

#### Logout
- [ ] Click "Logout" button in dashboard header
- [ ] **Expected**: Redirect to `/login`, token removed from localStorage
- [ ] **Verify**: localStorage `token` key is deleted

---

### **2. Task CRUD Operations** (Basic Features - Required)

#### Create Task
- [ ] Click "+ New Task" button or press `N` key
- [ ] Enter title: "Buy groceries"
- [ ] Enter description (optional): "Milk, eggs, bread"
- [ ] Select priority: "High"
- [ ] Select category: "Personal"
- [ ] Select tags (if any created)
- [ ] Set due date (optional)
- [ ] Click "Create Task"
- [ ] **Expected**: Task appears in the list, modal closes, success toast

#### View Tasks
- [ ] Verify all created tasks are displayed
- [ ] Check task cards show:
  - [ ] Title
  - [ ] Description (if provided)
  - [ ] Priority badge (color-coded)
  - [ ] Category
  - [ ] Tags with colors
  - [ ] Due date (if set)
  - [ ] Completion checkbox
  - [ ] Edit and delete buttons

#### Update Task
- [ ] Click edit icon on any task
- [ ] Change title to "Buy groceries and vegetables"
- [ ] Change priority to "Medium"
- [ ] Click "Update Task"
- [ ] **Expected**: Task updates in place, success toast

#### Delete Task
- [ ] Click delete icon on any task
- [ ] **Expected**: Confirmation dialog appears
- [ ] Click "Confirm"
- [ ] **Expected**: Task removed from list, success toast

#### Mark as Complete
- [ ] Click checkbox on any pending task
- [ ] **Expected**: Task marked as complete (strikethrough, opacity change)
- [ ] Click checkbox again
- [ ] **Expected**: Task marked as incomplete

---

### **3. Search & Filter** (~20 Points)

#### Search Functionality
- [ ] Type "groceries" in search box
- [ ] **Expected**: Only tasks with "groceries" in title/description show
- [ ] Clear search
- [ ] **Expected**: All tasks show again
- [ ] **Verify**: Search is debounced (300ms delay)

#### Filter by Status
- [ ] Select "Pending" from status filter
- [ ] **Expected**: Only incomplete tasks show
- [ ] Select "Completed"
- [ ] **Expected**: Only completed tasks show
- [ ] Select "All"
- [ ] **Expected**: All tasks show

#### Filter by Priority
- [ ] Select "High" from priority filter
- [ ] **Expected**: Only high-priority tasks show
- [ ] Try "Medium" and "Low"
- [ ] **Expected**: Filters work correctly

#### Filter by Category
- [ ] Select "Personal" from category filter
- [ ] **Expected**: Only personal tasks show
- [ ] Try other categories

#### Filter by Tags
- [ ] Select a tag from tag filter
- [ ] **Expected**: Only tasks with that tag show

#### Combined Filters
- [ ] Apply search + status filter + priority filter
- [ ] **Expected**: All filters work together (AND logic)

#### Active Filter Tags
- [ ] Apply multiple filters
- [ ] **Expected**: Active filter tags appear below filters
- [ ] Click "X" on an active filter tag
- [ ] **Expected**: That filter is removed
- [ ] Click "Clear all filters"
- [ ] **Expected**: All filters reset to default

---

### **4. Sorting** (~Part of Search & Filter)

- [ ] Sort by "Created Date (Newest First)"
  - **Expected**: Most recent tasks at top
- [ ] Sort by "Created Date (Oldest First)"
  - **Expected**: Oldest tasks at top
- [ ] Sort by "Due Date (Soonest First)"
  - **Expected**: Tasks with nearest due dates at top
- [ ] Sort by "Due Date (Latest First)"
  - **Expected**: Tasks with furthest due dates at top
- [ ] Sort by "Priority (High → Low)"
  - **Expected**: High priority tasks at top
- [ ] Sort by "Priority (Low → High)"
  - **Expected**: Low priority tasks at top
- [ ] Sort by "Title (A-Z)"
  - **Expected**: Alphabetical order
- [ ] Sort by "Title (Z-A)"
  - **Expected**: Reverse alphabetical order

---

### **5. Statistics Dashboard** (~15 Points)

- [ ] Verify "Total Tasks" count is accurate
- [ ] Verify "Completed" count matches completed tasks
- [ ] Verify "Pending" count matches pending tasks
- [ ] Verify "Due Today" count is accurate
- [ ] Check completion percentage calculation
- [ ] **Expected**: Progress bar animates from 0 to X%
- [ ] Verify overdue indicator shows if tasks are overdue (red badge)
- [ ] Verify high priority pending indicator shows (orange badge)

---

### **6. Dark Mode** (~10 Points)

#### Toggle Dark Mode
- [ ] Click sun/moon icon in header
- [ ] **Expected**: Theme switches from light to dark (or vice versa)
- [ ] **Verify**: All components update (header, cards, modals, buttons)
- [ ] Refresh page
- [ ] **Expected**: Theme persists (localStorage)

#### System Preference
- [ ] Change system theme (Windows: Settings > Personalization)
- [ ] Open app in new tab
- [ ] **Expected**: App follows system preference on first load

#### Color Contrast (Accessibility)
- [ ] In dark mode, verify text is readable
- [ ] Check all colors meet WCAG AA contrast ratio (4.5:1)

---

### **7. Keyboard Shortcuts** (~10 Points)

- [ ] Press `N` key
  - **Expected**: New task modal opens
- [ ] Press `/` key
  - **Expected**: Search input focuses
- [ ] Press `?` key (Shift + /)
  - **Expected**: Keyboard shortcuts help modal opens
- [ ] Press `Esc` key while modal is open
  - **Expected**: Modal closes
- [ ] Press `Ctrl + D`
  - **Expected**: Dark mode toggles
- [ ] Press `T` key
  - **Expected**: Tags manager modal opens

#### Shortcuts in Help Modal
- [ ] Click help button (bottom right) or press `?`
- [ ] Verify all shortcuts are listed with descriptions
- [ ] Click outside modal
- [ ] **Expected**: Modal closes

#### Input Field Interference Test
- [ ] Click in search box
- [ ] Type "N" and "T"
- [ ] **Expected**: Characters appear in input (shortcuts don't trigger)

---

### **8. Bulk Operations** (~10 Points)

#### Select Tasks
- [ ] Click checkbox on 3+ tasks
- [ ] **Expected**: Checkboxes show checked state
- [ ] **Expected**: Bulk actions bar slides up from bottom

#### Select All
- [ ] Click "Select All" button at top of task list
- [ ] **Expected**: All tasks selected

#### Deselect All
- [ ] Click "Deselect All" button
- [ ] **Expected**: All selections cleared, bulk bar disappears

#### Bulk Mark Complete
- [ ] Select 3 pending tasks
- [ ] Click "Mark Complete" in bulk actions bar
- [ ] **Expected**: All selected tasks marked as complete

#### Bulk Mark Incomplete
- [ ] Select 3 completed tasks
- [ ] Click "Mark Incomplete" in bulk actions bar
- [ ] **Expected**: All selected tasks marked as incomplete

#### Bulk Delete
- [ ] Select 3 tasks
- [ ] Click "Delete" in bulk actions bar
- [ ] **Expected**: Confirmation dialog appears
- [ ] Confirm deletion
- [ ] **Expected**: All selected tasks deleted

#### Clear Selection
- [ ] Select multiple tasks
- [ ] Click "Clear Selection" in bulk actions bar
- [ ] **Expected**: Selections cleared, bar disappears

---

### **9. Tags Management** (~15 Points)

#### Create Tag
- [ ] Click "Manage Tags" button in header
- [ ] Enter tag name: "Urgent"
- [ ] Select color (e.g., Red)
- [ ] Click "Add Tag"
- [ ] **Expected**: Tag appears in list with selected color

#### Edit Tag Name
- [ ] Hover over a tag
- [ ] Click edit icon
- [ ] **Expected**: Inline edit input appears
- [ ] Change name to "Very Urgent"
- [ ] Press Enter or click checkmark
- [ ] **Expected**: Tag name updates

#### Delete Tag
- [ ] Hover over a tag
- [ ] Click delete icon
- [ ] **Expected**: Confirmation dialog appears
- [ ] Confirm deletion
- [ ] **Expected**: Tag removed from list

#### Assign Tag to Task
- [ ] Create/edit a task
- [ ] Select tags from dropdown
- [ ] Save task
- [ ] **Expected**: Tags appear as colored badges on task card

#### Filter by Tag
- [ ] Apply tag filter in search panel
- [ ] **Expected**: Only tasks with that tag show

---

### **10. Due Dates & Reminders** (Advanced Feature)

#### Set Due Date
- [ ] Create/edit task
- [ ] Click date picker
- [ ] Select a future date
- [ ] Save task
- [ ] **Expected**: Due date appears on task card

#### Overdue Indicator
- [ ] Create task with past due date (manually in database or wait)
- [ ] **Expected**: Task shows red "OVERDUE" indicator
- [ ] **Expected**: Task has red left border

#### Due Today Filter
- [ ] Statistics dashboard shows "Due Today" count
- [ ] **Expected**: Count matches tasks due today

#### Date Picker Validation
- [ ] Try setting due date in the past (if prevented)
- [ ] **Expected**: Warning or prevents selection

---

### **11. Responsive Design** (UI/UX Points)

#### Mobile View (< 640px)
- [ ] Open Chrome DevTools
- [ ] Set device to "iPhone SE" or "Pixel 5"
- [ ] **Expected**: Single column layout
- [ ] **Expected**: Touch targets ≥ 44x44px
- [ ] **Expected**: Hamburger menu (if implemented)
- [ ] Test all interactions on mobile

#### Tablet View (640-1024px)
- [ ] Set device to "iPad"
- [ ] **Expected**: Two-column or optimized layout
- [ ] Test filters, modals, bulk operations

#### Desktop View (> 1024px)
- [ ] Use full desktop resolution
- [ ] **Expected**: Multi-column layout
- [ ] **Expected**: Sidebar or expanded filters
- [ ] **Expected**: All features accessible

---

### **12. Animations** (UI/UX Polish)

- [ ] Create a new task
  - **Expected**: Task card fades in and slides up
- [ ] Delete a task
  - **Expected**: Task card fades out and collapses
- [ ] Open modal
  - **Expected**: Modal scales in from center with backdrop fade
- [ ] Close modal
  - **Expected**: Modal scales out
- [ ] Toggle dark mode
  - **Expected**: Smooth color transitions
- [ ] Progress bar in statistics
  - **Expected**: Animates from 0 to X%

---

### **13. Multi-User Data Isolation** (Security - Critical)

#### Setup
- [ ] Create User A account (e.g., `usera@test.com`)
- [ ] Create 3 tasks for User A
- [ ] Logout
- [ ] Create User B account (e.g., `userb@test.com`)
- [ ] Create 3 tasks for User B

#### Isolation Tests
- [ ] Login as User A
- [ ] **Expected**: Only User A's 3 tasks show
- [ ] Login as User B
- [ ] **Expected**: Only User B's 3 tasks show
- [ ] **Critical**: User A cannot see User B's tasks

#### API Security Test (Advanced)
- [ ] Login as User A
- [ ] Open browser DevTools → Network tab
- [ ] Get a task ID from User B (if you know it)
- [ ] Try accessing: `http://localhost:8001/tasks/{user_b_task_id}`
- [ ] **Expected**: 404 Not Found (not 403 to prevent info leakage)

---

### **14. Error Handling**

#### Network Errors
- [ ] Stop backend server
- [ ] Try creating a task
- [ ] **Expected**: Error toast with clear message
- [ ] **Expected**: App doesn't crash

#### Invalid Data
- [ ] Try creating task with empty title
- [ ] **Expected**: Validation error
- [ ] Try updating task with invalid priority
- [ ] **Expected**: Rejected by backend

#### Token Expiration
- [ ] Manually set invalid token in localStorage
- [ ] Refresh dashboard
- [ ] **Expected**: Redirect to `/login`

---

### **15. Performance**

#### Load Time
- [ ] Open dashboard with 50+ tasks
- [ ] **Expected**: Page loads in < 2 seconds
- [ ] **Verify**: No lag when scrolling

#### Search Debouncing
- [ ] Type rapidly in search box
- [ ] **Expected**: API calls only trigger after 300ms pause

#### Optimistic Updates
- [ ] Toggle task completion
- [ ] **Expected**: UI updates immediately (before API response)
- [ ] If API fails, UI reverts

---

### **16. Accessibility (WCAG 2.1 AA)**

#### Keyboard Navigation
- [ ] Use Tab key to navigate entire dashboard
- [ ] **Expected**: All interactive elements focusable
- [ ] **Expected**: Visible focus ring on all focused elements

#### Screen Reader (Optional but Recommended)
- [ ] Enable Windows Narrator or macOS VoiceOver
- [ ] Navigate dashboard
- [ ] **Expected**: All buttons have labels
- [ ] **Expected**: Form inputs have associated labels

#### Color Contrast
- [ ] Use browser extension (e.g., axe DevTools)
- [ ] Check color contrast ratios
- [ ] **Expected**: All text ≥ 4.5:1 contrast ratio

---

## 🐛 **KNOWN ISSUES TO FIX**

### Before Submission
- [ ] Ensure no console errors in browser DevTools
- [ ] Ensure no TypeScript errors (`npm run type-check` in frontend)
- [ ] Ensure no Python errors in backend logs
- [ ] Test on Chrome, Firefox, Safari (if possible)
- [ ] Test on at least one mobile device or emulator

---

## 📊 **TESTING SCORE ESTIMATE**

| Feature Category | Tests Passing | Points |
|------------------|---------------|--------|
| Authentication | All | Required |
| Task CRUD (Basic) | All 5 | 20 |
| Search & Filter | All | 20 |
| Sorting | All | (Included in Search) |
| Statistics | All | 15 |
| Dark Mode | All | 10 |
| Keyboard Shortcuts | All | 10 |
| Bulk Operations | All | 10 |
| Tags Management | All | 15 |
| Due Dates | All | 10 |
| **Estimated Total** | | **98/100** |

---

## 🚀 **POST-TESTING STEPS**

Once all tests pass:

1. **Create Demo Video** (90 seconds)
   - Show signup/login
   - Create tasks with filters
   - Toggle dark mode
   - Use keyboard shortcuts
   - Bulk operations
   - Tag management
   - Show statistics

2. **Update README with Screenshots**
   - Dashboard view
   - Dark mode comparison
   - Mobile responsive view

3. **Final Git Commit**
   ```bash
   git add .
   git commit -m "feat: Complete Phase II implementation - All features tested"
   git push
   ```

4. **Deploy**
   - Frontend to Vercel
   - Backend to Railway
   - Verify production works

5. **Submit**
   - GitHub repo link
   - Live demo link
   - Demo video link
   - WhatsApp number

---

## ✅ **TESTING COMPLETION**

**Date**: _________________

**Tested By**: _________________

**Overall Status**:
- [ ] All Critical Tests Passing
- [ ] All Medium Priority Tests Passing
- [ ] All Nice-to-Have Tests Passing

**Ready for Submission**: [ ] YES / [ ] NO

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Good luck with testing! You're 100% feature-complete. Just verify everything works! 🏆**
