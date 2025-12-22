# Authentication Flow Diagrams

## Sign-Up Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SIGN-UP FLOW                                │
└─────────────────────────────────────────────────────────────────────┘

1. SELECT ROLE
   ┌──────────────────┐
   │  Role Selection  │
   │ Student / Lecturer│
   │   / Admin        │
   └────────┬─────────┘
            │
            ▼
2. CREATE ACCOUNT FORM
   ┌───────────────────────────────────┐
   │ Username (min 3 chars)            │  ← Real-time check
   │ [Loading spinner if checking]     │     against database
   │ [✓ Available / ✗ Taken feedback] │
   │                                    │
   │ Email (for verification)          │
   │ [Validate email format]            │
   │                                    │
   │ Password (min 6 chars)             │
   │ [Security indicator]               │
   │                                    │
   │ Confirm Password                  │
   │ [Match check: ✓ / ✗]              │
   └───────────────┬─────────────────┘
                   │
                   ▼
3. VALIDATION
   ┌─────────────────────────────────┐
   │ Check All Fields                │
   │ • Username length ≥ 3?          │
   │ • Username unique in DB?        │
   │ • Email valid format?            │
   │ • Password length ≥ 6?          │
   │ • Passwords match?              │
   │ • Role selected?                │
   └──────────┬──────────────────┬──┘
              │                  │
         ✓ PASS             ✗ FAIL
              │                  │
              ▼                  ▼
   ┌────────────────┐    ┌──────────────────┐
   │  Create Auth   │    │ Show Error Msg   │
   │  User +        │    │ • Field required │
   │  Profile       │    │ • Too short      │
   │  in Supabase   │    │ • Already taken  │
   └────────┬───────┘    │ • Invalid email  │
            │            │ • Mismatch       │
            ▼            └──────────────────┘
4. SUCCESS
   ┌──────────────────────────────────┐
   │ "Account Created Successfully!"  │
   │ "Please sign in with username    │
   │  'yourname' to access platform" │
   │                                  │
   │ [Waiting 3 seconds...]           │
   └────────┬─────────────────────────┘
            │
            ▼
5. AUTO-SWITCH TO SIGN-IN
   ┌─────────────────────────┐
   │ Sign-In Form Displayed  │
   │ (ready for login)       │
   └─────────────────────────┘
```

## Sign-In Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SIGN-IN FLOW                                │
└─────────────────────────────────────────────────────────────────────┘

1. SELECT ROLE
   ┌──────────────────┐
   │  Role Selection  │
   │ Student / Lecturer│
   │   / Admin        │
   └────────┬─────────┘
            │
            ▼
2. SIGN-IN FORM
   ┌──────────────────────────┐
   │ Username                 │
   │ [Enter your username]    │
   │                          │
   │ Password                 │
   │ [••••••••]               │
   │ [👁 toggle visibility]   │
   └────────┬─────────────────┘
            │
            ▼
3. VALIDATION
   ┌────────────────────────────────┐
   │ Check Fields                   │
   │ • Username not empty?          │
   │ • Password not empty?          │
   │ • Role selected?               │
   └──────────┬──────────────┬──────┘
              │              │
         ✓ PASS         ✗ FAIL
              │              │
              ▼              ▼
   ┌──────────────────┐  ┌─────────────────┐
   │ Look up username │  │ Show error:     │
   │ in database      │  │ "Missing field" │
   └────────┬─────────┘  └─────────────────┘
            │
            ▼
4. USERNAME LOOKUP
   ┌─────────────────────────────┐
   │ Query: SELECT email, role   │
   │ FROM user_profiles          │
   │ WHERE full_name = username  │
   └──────────┬──────────────┬───┘
              │              │
         FOUND         NOT FOUND
              │              │
              ▼              ▼
   ┌────────────────┐  ┌──────────────────┐
   │ Get user's email│  │ Error:           │
   │ and role       │  │ "Username not    │
   │                │  │  found. Please   │
   │ Check: role    │  │  check and try   │
   │ matches        │  │  again."         │
   │ selected?      │  └──────────────────┘
   └────────┬───────┘
            │
            ▼
5. ROLE CHECK
   ┌────────────────────────┐
   │ user_role ==          │
   │ selected_role?        │
   └───────┬───────────┬───┘
           │           │
        ✓YES         ✗NO
           │           │
           ▼           ▼
   ┌──────────────┐  ┌──────────────────┐
   │ Authenticate │  │ Error:           │
   │ with         │  │ "Account is      │
   │ Supabase     │  │  registered as   │
   │ Auth         │  │  [actual role],  │
   │ email +      │  │  not [selected   │
   │ password     │  │  role]. Please   │
   │              │  │  select the      │
   │              │  │  correct role."  │
   │              │  └──────────────────┘
   └──────┬───────┘
          │
          ▼
6. AUTHENTICATION
   ┌────────────────────────────────┐
   │ Supabase: signInWithPassword   │
   │ (email, password)              │
   └──────────┬──────────────┬──────┘
              │              │
          ✓ AUTH         ✗ FAILED
            PASS           │
              │            ▼
              │    ┌──────────────────┐
              │    │ Error:           │
              │    │ "Invalid password│
              │    │  or user unknown"│
              │    └──────────────────┘
              │
              ▼
7. SUCCESS
   ┌──────────────────────────┐
   │ "Sign in successful!     │
   │  Redirecting..."         │
   │                          │
   │ [Session stored in JWT]  │
   │ [Profile loaded]         │
   └─────────────┬────────────┘
                 │
                 ▼
8. REDIRECT TO DASHBOARD
   ┌────────────────────────────┐
   │ Role-based Dashboard       │
   │ • Student → StudentDash    │
   │ • Lecturer → LecturerDash  │
   │ • Admin → AdminDash        │
   └────────────────────────────┘
```

## Sign-Out Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SIGN-OUT FLOW                                 │
└─────────────────────────────────────────────────────────────────────┘

1. USER IN DASHBOARD
   ┌──────────────────────────┐
   │ [Sidebar Navigation]     │
   │                          │
   │ ┌──────────────────────┐ │
   │ │ 📤 Sign Out          │ │ ← Click here
   │ └──────────────────────┘ │
   └────────────┬─────────────┘
                │
                ▼
2. HANDLE LOGOUT
   ┌──────────────────────────┐
   │ handleLogout() called    │
   │                          │
   │ IMMEDIATE:              │
   │ • Clear user state      │
   │ • Clear profile data    │
   │ • Clear session         │
   │ • Clear role            │
   │ → UI updates instantly  │
   │                          │
   │ BACKGROUND:             │
   │ • Call supabase.auth    │
   │   .signOut()            │
   │ (don't wait for this)   │
   └────────────┬─────────────┘
                │
                ▼
3. REDIRECT TO LOGIN
   ┌──────────────────────────┐
   │ Check: !user             │
   │ Return <Login />         │
   │                          │
   │ User sees Login page     │
   │ with role selection      │
   └──────────────────────────┘
```

## Username Availability Check

```
┌──────────────────────────────────────────────────────────────────────┐
│               USERNAME AVAILABILITY CHECKER (REAL-TIME)               │
└──────────────────────────────────────────────────────────────────────┘

SIGN-UP FORM → User Types in Username Field
                         │
                         ▼
            Is username length < 3?
              │                  │
           YES              NO
              │                  │
              ▼                  ▼
         (no check,       [🔄 Loading spinner]
          wait)           Query Database
              │                  │
              │                  ▼
              │        SELECT id FROM user_profiles
              │        WHERE full_name = ?
              │                  │
              │         ┌────────┴────────┐
              │         │                 │
              │      FOUND           NOT FOUND
              │         │                 │
              │         ▼                 ▼
              │    ❌ username taken  ✅ username available
              │         │                 │
              └─────────┴─────────────────┘
                        │
                        ▼
            ┌────────────────────────────────┐
            │ Display Visual Feedback        │
            │                                │
            │ ✅ Green checkmark:            │
            │    "Username is available!"   │
            │                                │
            │ ❌ Red X:                      │
            │    "Username already taken"   │
            │                                │
            │ 🟠 Warning text:               │
            │    "Username too short"       │
            └────────────────────────────────┘
                        │
                        ▼
            ┌────────────────────────────────┐
            │ Form Submission Check:         │
            │                                │
            │ Can user click "Create Acct"? │
            │                                │
            │ Only if:                       │
            │ • All fields filled            │
            │ • Username ≥ 3 chars           │
            │ • ✅ Username available       │
            │ • Email valid format           │
            │ • Password ≥ 6 chars           │
            │ • Passwords match              │
            └────────────────────────────────┘
```

## Database Query Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│              DATABASE QUERIES FOR AUTHENTICATION                      │
└──────────────────────────────────────────────────────────────────────┘

CHECK USERNAME EXISTS (During Sign-Up)
────────────────────────────────────────
Query:
  SELECT id FROM user_profiles 
  WHERE full_name = 'desired_username'

Result: No rows → Available ✅
Result: 1 row  → Taken ❌


LOOK UP USER (During Sign-In)
────────────────────────────────────────
Query:
  SELECT id, email, role, full_name 
  FROM user_profiles 
  WHERE full_name = 'entered_username'

Result: No rows → "Username not found" ❌
Result: 1 row  → Get email for auth ✅
           └─→ Check role matches ✅/❌


CREATE USER PROFILE (After Auth Sign-Up)
────────────────────────────────────────
Triggered by: Supabase Auth signal
Database trigger automatically:
  INSERT INTO user_profiles (
    id,        -- from auth.users.id
    email,     -- from auth.users.email
    full_name, -- from metadata.full_name (username)
    role       -- from metadata.role
  )

Indexes:
  • PRIMARY KEY (id) - UUID from auth
  • UNIQUE (full_name) - ensures username uniqueness


GET PROFILE (After Sign-In)
────────────────────────────────────────
Query:
  SELECT * FROM user_profiles 
  WHERE id = current_user_id

Result: User profile loaded into React context
        → Available for rendering dashboard
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│              AUTHCONTEXT STATE MANAGEMENT                             │
└──────────────────────────────────────────────────────────────────────┘

INITIAL STATE
─────────────
{
  user: null
  profile: null
  session: null
  isLoading: true
  selectedRole: null
}

         │
         ▼

ON APP LOAD
────────────
getSession() from Supabase
         │
         ├─→ No session found
         │   setState({
         │     user: null,
         │     session: null,
         │     isLoading: false
         │   })
         │
         └─→ Session exists
             SELECT * FROM user_profiles WHERE id = user.id
             setState({
               user: session.user,
               session: session,
               profile: userData,
               isLoading: false
             })

         │
         ▼

AUTH STATE LISTENER (onAuthStateChange)
─────────────────────────────────────────
Event: SIGNED_IN
└─→ Fetch profile from DB
    setState({ user, session, profile })

Event: SIGNED_OUT
└─→ setState({ 
      user: null, 
      session: null, 
      profile: null 
    })

Event: USER_UPDATED
└─→ Refresh profile data

Event: TOKEN_REFRESHED
└─→ Update session token

         │
         ▼

AVAILABLE FOR COMPONENTS
─────────────────────────
const { user, profile, isLoading, signIn, signUp, signOut } = useAuth()

user: { id, email, ...supabase user data }
profile: { id, full_name, email, role, ... }
isLoading: boolean
signIn: (username, password, role) => Promise
signUp: (email, password, username, role) => Promise
signOut: () => Promise
```

---

## Key Points

### Username Uniqueness
- Enforced at **database level** with UNIQUE constraint
- Checked in real-time during sign-up form
- Prevents duplicate accounts

### Role Validation
- User can create separate accounts for different roles
- Same email, different usernames for each role
- Role validated on every login

### Email Flexibility
- Same email can be used for multiple accounts
- Each username maps to one auth account
- Email used for account recovery (future feature)

### Security
- Passwords hashed by Supabase (bcrypt)
- JWT tokens stored in browser storage
- Sessions auto-refresh with Supabase
- RLS policies protect user data

### User Experience
- Real-time username validation with visual feedback
- Clear error messages for each failure scenario
- Auto-transitions between sign-up and sign-in
- Instant logout (no UI lag)
- Demo accounts always available for testing
