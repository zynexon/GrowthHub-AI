# Talent Management Module - Testing Guide

## Overview
Talent Management MVP module for GrowthHub AI - track people for data labeling, operations, and support tasks.

## Setup

### 1. Database Setup
Run the SQL in Supabase SQL Editor:
```sql
-- Copy content from database/talent-tables.sql
```

This creates:
- `talent` table with organization_id, name, email, skill_type, status, task counters
- Indexes for performance
- RLS policies for org-based access control

### 2. Start Backend
```bash
cd backend
python run.py
```

Backend should be running on `http://localhost:5000`

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

Frontend should be running on `http://localhost:5173`

## Testing Steps

### Test 1: View Talent Page
1. Login to GrowthHub AI
2. Click "Talent" in the sidebar (⭐ icon)
3. ✅ Should see empty state with "No talent yet" message
4. ✅ Statistics cards should show all zeros

### Test 2: Add First Talent
1. Click "➕ Add Talent" button
2. Fill in the form:
   - **Name**: John Doe
   - **Email**: john@example.com
   - **Skill Type**: 🏷️ Data Labeling
3. Click "✨ Add Talent"
4. ✅ Should redirect to list view
5. ✅ Should see John in the table
6. ✅ Statistics should update: Total Talent = 1, Active = 1

### Test 3: Add More Talent (Different Skills)
Add multiple people with different skills:

**Person 2:**
- Name: Sarah Smith
- Email: sarah@example.com
- Skill: ✅ QA

**Person 3:**
- Name: Mike Johnson
- Email: mike@example.com  
- Skill: ⚙️ Operations

**Person 4:**
- Name: Emma Wilson
- Email: emma@example.com
- Skill: 💬 Support

✅ All 4 people should appear in the table
✅ Statistics: Total Talent = 4, Active = 4

### Test 4: Edit Talent
1. Click "✏️ Edit" on John Doe
2. Change name to "John Anderson"
3. Change skill to "✅ QA"
4. Click "💾 Save Changes"
5. ✅ Name and skill should update in the table
6. ✅ Should show "✅ QA" badge instead of "🏷️ Data Labeling"

### Test 5: Disable Talent
1. Click "⏸️ Disable" on Sarah Smith
2. ✅ Status badge should change to "○ Inactive"
3. ✅ Button should change to "▶️ Enable"
4. ✅ Statistics: Active = 3, Inactive = 1

### Test 6: Enable Talent
1. Click "▶️ Enable" on Sarah Smith
2. ✅ Status badge should change to "✓ Active"
3. ✅ Button should change to "⏸️ Disable"
4. ✅ Statistics: Active = 4, Inactive = 0

### Test 7: View Performance Data
Check the Performance column for each talent:
- ✅ Should show "0 / 0 tasks"
- ✅ Should show "0% completion"

(Task assignment will be implemented when we connect Data Labeling datasets to talent)

### Test 8: Delete Talent
1. Click "🗑️" on Emma Wilson
2. Confirm the deletion
3. ✅ Emma should disappear from the table
4. ✅ Statistics: Total Talent = 3

### Test 9: UI/UX Validation
Check all visual elements:
- ✅ Purple gradient theme consistent with other pages
- ✅ Icons display correctly (🏷️, ⚙️, ✅, 💬, 🚚)
- ✅ Hover effects on buttons and cards
- ✅ Statistics cards have proper gradients and borders
- ✅ Table rows have hover effect
- ✅ Status badges colored correctly (green for active, gray for inactive)
- ✅ Form has proper focus states

### Test 10: Validation Tests
Try invalid inputs:

**Empty Name:**
1. Try to add talent with empty name
2. ✅ Should show browser validation error

**Invalid Email:**
1. Try to add talent with "notanemail"
2. ✅ Should show email validation error

**Form Cancel:**
1. Click "Add Talent"
2. Fill form partially
3. Click "Cancel"
4. ✅ Should return to list without saving
5. ✅ Form should be empty on next add

## Expected Data Structure

### Talent Object
```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "skill_type": "data_labeling",
  "status": "active",
  "tasks_assigned": 0,
  "tasks_completed": 0,
  "tasks_pending": 0,
  "completion_rate": 0,
  "created_at": "2025-12-30T...",
  "updated_at": "2025-12-30T..."
}
```

### Statistics Object
```json
{
  "total_talent": 4,
  "active_talent": 3,
  "inactive_talent": 1,
  "total_tasks_completed": 0,
  "total_tasks_assigned": 0,
  "overall_completion_rate": 0,
  "skills_breakdown": {
    "data_labeling": 2,
    "qa": 1,
    "operations": 1
  }
}
```

## API Endpoints

All endpoints require authentication and organization context.

### GET /api/talent
Get all talent for organization
```bash
curl -X GET http://localhost:5000/api/talent \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### GET /api/talent/statistics
Get talent statistics
```bash
curl -X GET http://localhost:5000/api/talent/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### POST /api/talent
Create new talent
```bash
curl -X POST http://localhost:5000/api/talent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "skill_type": "data_labeling"
  }'
```

### PUT /api/talent/:id
Update talent
```bash
curl -X PUT http://localhost:5000/api/talent/TALENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Anderson",
    "skill_type": "qa"
  }'
```

### PATCH /api/talent/:id/status
Toggle talent status
```bash
curl -X PATCH http://localhost:5000/api/talent/TALENT_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### DELETE /api/talent/:id
Delete talent
```bash
curl -X DELETE http://localhost:5000/api/talent/TALENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Features Implemented

✅ **Talent Registry**
- Add people manually
- View list in table format
- Minimal fields: name, email, skill_type, status
- No resumes, no onboarding, no verification

✅ **Skill Tagging**
- 5 skill types: Data Labeling, QA, Operations, Support, Field Service
- Single skill per talent
- Icons for visual identification
- Can change skill via edit

✅ **Performance Tracking**
- Tasks assigned counter
- Tasks completed counter
- Tasks pending counter (calculated: assigned - completed)
- Completion rate percentage
- Overall statistics

✅ **Availability Control**
- Enable/disable talent
- Status toggle (active/inactive)
- Visual indicators (green for active, gray for inactive)
- Prevents accidental assignment when inactive

## Known Limitations (By Design)

❌ No login for talent (company-only control)
❌ No leaderboards
❌ No gamification
❌ No multi-skill support (MVP = single skill)
❌ No task assignment UI yet (will connect to Data Labeling later)
❌ Tasks counters are 0 until assignment logic is built

## Next Steps (Future)

1. **Connect to Data Labeling**: Assign datasets to talent
2. **Task Assignment**: Allocate specific rows/tasks to people
3. **Performance Analytics**: Charts, trends, reliability scores
4. **Skill Expansion**: Multiple skills per person
5. **Availability Calendar**: Schedule-based availability
6. **Notifications**: Email alerts for task assignments

## Success Criteria

✅ Company can add/edit/delete talent
✅ Skills are tagged correctly
✅ Status can be toggled (active/inactive)
✅ Performance metrics display (even if 0)
✅ UI matches GrowthHub AI theme
✅ All CRUD operations work
✅ Organization isolation enforced (RLS)
