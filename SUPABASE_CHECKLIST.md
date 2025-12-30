# SUCCMS Supabase Integration Checklist

## ✅ Phase 1: Initial Setup (5-10 minutes)

### Supabase Project Setup
- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project "SUCCMS Learn 4.0"
- [ ] Copy Project URL from Settings → API
- [ ] Copy Anon Key from Settings → API

### Local Environment Setup
- [ ] Create `.env.local` file in `/workspaces/succms/succms/`
- [ ] Add `VITE_SUPABASE_URL=` with your Project URL
- [ ] Add `VITE_SUPABASE_ANON_KEY=` with your Anon Key
- [ ] Verify `.env.local` is in `.gitignore`

### Install Dependencies
- [ ] Run `npm install` in project root
- [ ] Verify `@supabase/supabase-js` is installed
- [ ] Verify `@supabase/auth-helpers-react` is installed
- [ ] Run `npm run build` to verify compilation

---

## ✅ Phase 2: Database Setup (5 minutes)

### Run SQL Schema
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Click "New query"
- [ ] Copy entire contents of `supabase/schema.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Wait for all tables to be created
- [ ] Verify no errors in output

### Verify Database
- [ ] Check "Tables" in Supabase sidebar - should see 14 tables:
  - [ ] `user_profiles`
  - [ ] `courses`
  - [ ] `course_enrollments`
  - [ ] `assignments`
  - [ ] `assignment_submissions`
  - [ ] `student_grades`
  - [ ] `attendance`
  - [ ] `student_gpa`
  - [ ] `posts`
  - [ ] `post_comments`
  - [ ] `post_likes`
  - [ ] `reactions`
  - [ ] `post_views`
  - [ ] `stories`
  - [ ] `story_views`
  - [ ] `announcements`
  - [ ] `announcement_reads`
  - [ ] `leaderboard`
- [ ] Check RLS is enabled on all tables (padlock icon)
- [ ] Check indexes exist (14+ in Database → Indexes)

### Verify Views
- [ ] Check "Views" tab - should see 4 views:
  - [ ] `course_summary`
  - [ ] `student_course_summary`
  - [ ] `post_engagement`
  - [ ] `active_stories_summary`

---

## ✅ Phase 3: Application Integration (10 minutes)

### Update Main Entry Point
- [ ] Open `src/main.tsx`
- [ ] Import `AuthProvider` from `@/contexts/AuthContext`
- [ ] Wrap `<App />` with `<AuthProvider>`
- [ ] Save and verify compilation

### Update App Component
- [ ] Open `src/App.tsx`
- [ ] Import `useAuth` hook
- [ ] Add auth state check for unauthenticated view
- [ ] Use `userRole` to show correct dashboard
- [ ] Test that app compiles

### Update Login Component
- [ ] Open `src/components/Login.tsx`
- [ ] Import `useAuth` hook
- [ ] Replace hardcoded login with Supabase calls
- [ ] Use `signIn()` and `signUp()` from context
- [ ] Add role selection to sign-up form
- [ ] Test form submission

### Test Authentication Flow
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to login page
- [ ] Try signing up with a test email
- [ ] Check Supabase Dashboard → Authentication → Users (should appear)
- [ ] Check `user_profiles` table (should have profile)
- [ ] Try signing in with test credentials
- [ ] Verify you're logged in and see dashboard

---

## ✅ Phase 4: Component Updates (Optional but Recommended)

### Student Dashboard
- [ ] Update to use `useCourses()` hook for real data
- [ ] Update to use `useAssignments()` for assignments
- [ ] Update to use `useStudentGrades()` for grades
- [ ] Update to use `usePosts()` for forum posts
- [ ] Verify courses/assignments display correctly

### Lecturer Dashboard
- [ ] Add create course functionality
- [ ] Add student enrollment management
- [ ] Add assignment grading interface
- [ ] Use `useLeaderboard()` to show rankings

### Admin Dashboard
- [ ] Add announcement creation form
- [ ] Add user management interface
- [ ] Add course/enrollment overview
- [ ] Add system statistics

### Student Profile
- [ ] Use `useAuth()` to get current user profile
- [ ] Add profile update form using `updateProfile()`
- [ ] Display GPA from `student_gpa` table

### Forum/Posts Component
- [ ] Use `useRealtimePosts()` for live updates
- [ ] Add post creation with user verification
- [ ] Add comment functionality
- [ ] Add like/reaction buttons

### Stories Component
- [ ] Verify stories already working with Supabase
- [ ] Check that close button works
- [ ] Verify auto-progression at 5 seconds
- [ ] Confirm stories expire after 24 hours

---

## ✅ Phase 5: Testing & Verification (10 minutes)

### Security Testing
- [ ] Create student account and verify can't see other students' grades
- [ ] Create lecturer account and verify can see enrolled students
- [ ] Create admin account and verify can see all data
- [ ] Test RLS policies blocking unauthorized access

### Feature Testing
- [ ] Create a course (as lecturer)
- [ ] Enroll a student (as lecturer or admin)
- [ ] Create an assignment (as lecturer)
- [ ] Submit assignment (as student)
- [ ] Grade submission (as lecturer)
- [ ] Check student can see grade
- [ ] Create forum post
- [ ] Add comment to post
- [ ] Like/react to post
- [ ] Create story
- [ ] View others' stories
- [ ] Story auto-progression working
- [ ] Story close button working

### Performance Testing
- [ ] App loads in <2 seconds
- [ ] Database queries return data quickly
- [ ] Real-time subscriptions working
- [ ] No console errors

### Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test on mobile (if applicable)

---

## ✅ Phase 6: Documentation & Cleanup

### Documentation
- [ ] Read through `SUPABASE_SETUP.md`
- [ ] Review `SUPABASE_EXAMPLES.md` for your use cases
- [ ] Bookmark `SUPABASE_QUICK_REFERENCE.md` for quick lookup
- [ ] Save Supabase project URL and credentials securely

### Cleanup
- [ ] Remove any hardcoded test data from components
- [ ] Clean up console.log statements (keep for now if debugging)
- [ ] Verify `.env.local` is NOT committed to git
- [ ] Verify `.env.example` HAS the template variables

### Production Preparation
- [ ] Set up CI/CD environment variables
- [ ] Plan database backup strategy
- [ ] Review RLS policies before production
- [ ] Set up monitoring/logging
- [ ] Plan for database migrations

---

## ✅ Phase 7: Advanced Features (Optional)

### File Storage
- [ ] Enable Supabase Storage for course materials
- [ ] Implement file upload component
- [ ] Create storage bucket with RLS policies

### Real-time Features
- [ ] Set up Supabase Realtime for live notifications
- [ ] Implement live user count
- [ ] Add notification bell updates

### Automated Tasks
- [ ] Create function to expire old stories (24h)
- [ ] Create function to auto-calculate GPA
- [ ] Set up cron jobs for nightly updates

### Email Notifications
- [ ] Set up SendGrid integration
- [ ] Send email on grade posted
- [ ] Send email on new announcement
- [ ] Send email on assignment reminder

---

## 📊 Verification Commands

Run these to verify setup:

```bash
# Check all files exist
bash check-supabase-setup.sh

# Build project to verify no TypeScript errors
npm run build

# Run dev server
npm run dev

# Test auth flow in browser
# Navigate to http://localhost:5173
```

---

## 🎯 Success Criteria

You've successfully completed setup when:

✅ User can sign up with email/password/role  
✅ User can sign in and see their dashboard  
✅ Lecturer can create courses  
✅ Student can enroll in courses  
✅ Grades/posts/stories display correctly  
✅ Real-time updates work (posts, stories)  
✅ RLS policies prevent unauthorized access  
✅ No console errors or TypeScript errors  
✅ All database tables populated with data  
✅ Production build completes successfully  

---

## 📞 Support & Troubleshooting

### If something breaks:

1. Check `SUPABASE_SETUP.md` troubleshooting section
2. Run `check-supabase-setup.sh` to identify missing pieces
3. Check Supabase dashboard → Logs for database errors
4. Verify `.env.local` has correct URL and key
5. Clear browser cache and restart dev server
6. Check GitHub Issues in your repo

### Common Issues:

**"Cannot find module '@supabase/supabase-js'"**
→ Run `npm install` and restart dev server

**RLS blocking all queries**
→ Check user role in user_profiles table matches policy

**Authentication not working**
→ Verify email confirmation is handled or disabled

**Data not visible**
→ Ensure RLS policy allows SELECT for your role

---

## 📅 Estimated Timeline

| Phase | Duration | Critical? |
|-------|----------|-----------|
| Phase 1: Setup | 5-10 min | ✅ YES |
| Phase 2: Database | 5 min | ✅ YES |
| Phase 3: Integration | 10 min | ✅ YES |
| Phase 4: Components | 30-60 min | ❌ Optional |
| Phase 5: Testing | 10 min | ✅ YES |
| Phase 6: Cleanup | 5 min | ✅ YES |
| Phase 7: Advanced | Variable | ❌ Optional |

**Total Critical Path**: ~35-50 minutes  
**Total with Components**: 1-2 hours  

---

## 🚀 Next Steps After Setup

1. Deploy to production (Vercel, Netlify, etc.)
2. Set up CI/CD with environment variables
3. Implement file storage for uploads
4. Add real-time notifications
5. Create admin panel for management
6. Set up database backups
7. Monitor performance and errors
8. Gather user feedback and iterate

---

**Created**: November 25, 2025  
**Status**: Complete and Ready to Deploy  
**Maintenance**: Regular backups and security updates recommended  

