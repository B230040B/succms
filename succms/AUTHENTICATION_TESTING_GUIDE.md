# Authentication Testing Guide

## Pre-Deployment Testing Checklist

### 1. Database Schema Verification

Before running the app, ensure the schema is updated with the UNIQUE constraint:

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Create new query
# 3. Check current schema:
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
```

**Expected Result:**
- `full_name` should have `UNIQUE` constraint
- Type: `TEXT`
- `NOT NULL`

If UNIQUE constraint is missing, run:
```sql
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_full_name_key UNIQUE (full_name);
```

---

### 2. Sign-Up Flow Testing

#### Test Case 1: Successful Sign-Up
1. Navigate to login page
2. Click "Create Student Account"
3. Fill form:
   - Username: `testuser123`
   - Email: `testuser@example.com`
   - Password: `securepass123`
   - Confirm: `securepass123`
4. Observe:
   - ✅ Username shows green checkmark (available)
   - ✅ "Create Account" button is enabled
   - ✅ Click creates account
   - ✅ Success message appears
   - ✅ Form auto-switches to Sign-In (3 seconds)

**Verify in Supabase Dashboard:**
```sql
SELECT id, email, full_name, role FROM user_profiles 
WHERE full_name = 'testuser123';
```
Should return 1 row with role='student'

---

#### Test Case 2: Duplicate Username Rejection
1. Try to create second account with same username
2. In sign-up form, enter: `testuser123` (from Test Case 1)
3. Observe:
   - 🔄 Loading spinner appears while checking
   - ❌ Red X appears next to username
   - ❌ "Username already taken" message appears
   - ❌ "Create Account" button disabled/grayed out

---

#### Test Case 3: Username Validation
Test various username inputs:

| Username | Expected | Feedback |
|----------|----------|----------|
| `ab` | ❌ Too short | "Username must be at least 3 characters" |
| `abc` | ✅ Valid | Green checkmark (if not taken) |
| `test user` | ✅ Valid | Spaces allowed |
| `test@user` | ✅ Valid | Special chars allowed |
| `TESTUSER` | ✅ Valid | Case sensitive |

---

#### Test Case 4: Email Validation
Test email field:

| Email | Expected | Feedback |
|-------|----------|----------|
| `user@` | ❌ Invalid | (native HTML validation) |
| `@example.com` | ❌ Invalid | (native HTML validation) |
| `test@example.com` | ✅ Valid | Accepted |
| `test+tag@example.co.uk` | ✅ Valid | Accepted |

---

#### Test Case 5: Password Validation
Test password field:

| Password | Confirm | Expected |
|----------|---------|----------|
| `pass` | `pass` | ❌ "Must be 6+ chars" |
| `pass123` | `pass456` | ❌ "Passwords don't match" |
| `pass123` | `pass123` | ✅ Valid |

---

### 3. Sign-In Flow Testing

#### Test Case 1: Successful Sign-In
1. Click "Sign In as Student"
2. Enter:
   - Username: `testuser123`
   - Password: `securepass123`
3. Observe:
   - ✅ "Sign in successful! Redirecting..." message
   - ✅ Redirected to StudentDashboard
   - ✅ User info displays in header/sidebar

---

#### Test Case 2: Wrong Username
1. Enter: `wronguser`
2. Observe:
   - ❌ Error: "Username not found. Please check and try again."
   - ❌ Remains on login page

---

#### Test Case 3: Wrong Password
1. Enter correct username, wrong password
2. Observe:
   - ❌ Error message appears (from Supabase)
   - ❌ Remains on login page

---

#### Test Case 4: Wrong Role
1. Create student account with username: `testuser1`
2. Try to sign in with:
   - Username: `testuser1`
   - Password: (correct)
   - Role: **Lecturer** (wrong role)
3. Observe:
   - ❌ Error: "This account is registered as a student, not a lecturer. Please select the correct role."

---

#### Test Case 5: Demo Account
1. Click "Try Demo Account" for Student role
2. Observe:
   - ✅ Form pre-fills with demo credentials
   - ✅ Can sign in successfully
   - ✅ Redirects to StudentDashboard

---

### 4. Sign-Out Flow Testing

#### Test Case 1: Sign-Out Functionality
1. Sign in successfully
2. In sidebar, click "Sign Out"
3. Observe:
   - ✅ Immediate redirect to login page
   - ✅ No "Signing out..." delay
   - ✅ Session cleared from browser
   - ✅ Cannot access dashboard without signing in again

---

#### Test Case 2: Session Persistence
1. Sign in
2. Refresh page (F5)
3. Observe:
   - ✅ Remain on dashboard (session persisted)
   - ✅ User info still displayed
   - ✅ No redirect to login

---

#### Test Case 3: Logout Session Cleanup
1. Sign in as Student
2. Open browser DevTools → Application → Local Storage
3. Note the stored data
4. Click Sign Out
5. Check Local Storage again
6. Observe:
   - ✅ Supabase auth token cleared
   - ✅ Session data removed

---

### 5. Multiple Accounts Testing

#### Test Case 1: Multiple Roles for Same Email
1. Create Student account:
   - Username: `john_student`
   - Email: `john@example.com`
   - Password: `pass123456`

2. Create Lecturer account:
   - Username: `john_lecturer`
   - Email: `john@example.com` (same email)
   - Password: `pass123456`

3. Observe:
   - ✅ Both accounts created successfully
   - ✅ Same email allowed for both
   - ✅ Each has unique username

4. Verify:
   ```sql
   SELECT email, full_name, role FROM user_profiles 
   WHERE email = 'john@example.com'
   ORDER BY role;
   ```
   Should return 2 rows

5. Test login for each:
   - Sign in as Student with `john_student`
   - Sign in as Lecturer with `john_lecturer`
   - Both should work

---

### 6. Edge Cases

#### Test Case 1: SQL Injection Prevention
Try username: `'; DROP TABLE user_profiles; --`
- Should be treated as literal string
- Should be rejected if longer than max length
- Database should not be affected

#### Test Case 2: XSS Prevention
Try username: `<img src=x onerror="alert('xss')">`
- Should be treated as literal string
- No alert should appear
- Should be stored as-is (sanitized on display)

#### Test Case 3: Case Sensitivity
1. Create: `TestUser123`
2. Try to login with: `testuser123`
3. Observe:
   - ❌ "Username not found" (usernames are case-sensitive)

#### Test Case 4: Whitespace Handling
1. Try username: ` testuser` (leading space)
2. Try username: `testuser ` (trailing space)
3. Observe:
   - ❌ Should be treated as different usernames
   - ✅ Allowed but distinct

---

### 7. UI/UX Testing

#### Test Case 1: Form Validation
1. Click "Create Account" with empty form
2. Observe:
   - ✅ HTML5 validation prevents submission
   - ✅ "Required" indicators show

#### Test Case 2: Loading States
1. During username check:
   - ✅ Spinner appears
   - ✅ Responsive to network delay (2-3 sec)

2. During account creation:
   - ✅ Button shows "Creating Account..."
   - ✅ Button disabled while loading
   - ✅ Spinner visible in button

3. During sign-in:
   - ✅ Button shows "Signing In..."
   - ✅ Button disabled while loading

#### Test Case 3: Error Messages
1. Intentionally trigger various errors
2. Observe:
   - ✅ Error message appears in red alert
   - ✅ Message is clear and actionable
   - ✅ Previous errors clear when typing

#### Test Case 4: Password Toggle
1. In password field, type password
2. Click eye icon to toggle visibility
3. Observe:
   - ✅ Password becomes visible as plain text
   - ✅ Click again to hide
   - ✅ Confirm password field has same toggle

#### Test Case 5: Role Selection
1. Click role card
2. Observe:
   - ✅ Card highlights
   - ✅ Redirects to appropriate form
   - ✅ "Back" button returns to role selection

---

### 8. Database Validation

#### Query 1: Check Unique Constraint
```sql
-- Should show UNIQUE constraint on full_name
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'user_profiles';
```

#### Query 2: Verify User Profiles Created
```sql
-- Should show all created test accounts
SELECT id, email, full_name, role, created_at 
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 10;
```

#### Query 3: Check Auth Users
```sql
-- Should have corresponding auth users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;
```

#### Query 4: Verify Trigger Works
```sql
-- Test that profile is auto-created when auth user created
-- Sign up should create profile within 1 second
SELECT COUNT(*) as total_profiles FROM user_profiles;
SELECT COUNT(*) as total_auth_users FROM auth.users;
-- Both counts should be approximately equal (profiles ≤ auth users)
```

---

### 9. Browser/Device Testing

Test on:
- [ ] Chrome (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

Expected: All form interactions work smoothly

---

### 10. Performance Testing

#### Test Case 1: Username Availability Check Speed
1. Type a username slowly: `t`, `te`, `tes`, `test`
2. Observe:
   - ✅ Database check happens for each character (≥3 chars)
   - ✅ Responses appear within 500ms
   - ✅ No UI blocking

#### Test Case 2: Form Submission Time
1. Click "Create Account"
2. Measure time to success message
3. Expected: 2-5 seconds (depending on network)

#### Test Case 3: Sign-In Time
1. Click "Sign In"
2. Measure time to dashboard
3. Expected: 2-4 seconds (including redirect)

---

## Test Data Setup

### Pre-created Test Accounts (For Demo)

These are automatically available:

#### Student
- Username: `student`
- Email: `student@university.edu`
- Password: `demo123`
- Role: `student`

#### Lecturer
- Username: `lecturer`
- Email: `lecturer@university.edu`
- Password: `demo123`
- Role: `lecturer`

#### Admin
- Username: `admin`
- Email: `admin@university.edu`
- Password: `demo123`
- Role: `admin`

---

## Troubleshooting

### Issue: "Username already taken" for new username
**Solution:** Check database for existing usernames
```sql
SELECT full_name FROM user_profiles WHERE full_name ILIKE '%your_username%';
```

### Issue: Sign-up succeeds but no profile created
**Solution:** Check trigger is firing
```sql
SELECT * FROM user_profiles WHERE email = 'test@example.com';
```

### Issue: Sign-in fails with correct credentials
**Solution:** Verify user exists and role matches
```sql
SELECT id, email, full_name, role FROM user_profiles 
WHERE full_name = 'username';
```

### Issue: UNIQUE constraint error on signup
**Solution:** Database constraint exists but username already taken
- Use different username
- Or delete old profile: `DELETE FROM user_profiles WHERE full_name = 'username';`

### Issue: Page doesn't redirect after sign-in
**Solution:** Check browser console for errors
- Verify JWT token is valid
- Check that profile data loaded
- Ensure App component properly checks `user` state

---

## Sign-Off Checklist

- [ ] All 10 test cases pass
- [ ] UI/UX looks good on desktop
- [ ] UI/UX responsive on mobile
- [ ] Database queries return expected results
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Demo accounts work
- [ ] Error messages are clear
- [ ] Sign-out clears session
- [ ] Multiple accounts per email works
- [ ] Username uniqueness enforced
- [ ] Role validation working

**Ready for production deployment!** ✅
