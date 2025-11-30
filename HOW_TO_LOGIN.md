# 🔐 How to Login and Access Dashboard

**Project by: Ashish Kumar**

## Step-by-Step Guide

### Step 1: Open the Application
1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Go to: **http://localhost:3000**
3. You should see the Smart Learning Path Generator homepage

### Step 2: Register a New Account (First Time)

If you don't have an account yet:

1. Click the **"Register"** button (top right or on the homepage)
2. Fill in the registration form:
   - **Name**: Your full name
   - **Email**: Your email address (e.g., test@example.com)
   - **Password**: Choose a password (at least 6 characters)
   - **Confirm Password**: Enter the same password
   - **Learning Style**: Choose your preference:
     - Visual Learner
     - Auditory Learner
     - Kinesthetic Learner
     - Reading/Writing Learner
   - **Role**: Select your role:
     - Student (default)
     - Instructor
     - Parent
3. Click **"Register"** button
4. You'll be automatically logged in and redirected to the Dashboard!

### Step 3: Login (If You Already Have an Account)

1. Click the **"Login"** button (top right or on the homepage)
2. Enter your credentials:
   - **Email**: The email you used to register
   - **Password**: Your password
3. Click **"Login"** button
4. You'll be redirected to the Dashboard!

### Step 4: Access the Dashboard

After logging in, you'll automatically see the **Dashboard** which shows:

- **Statistics Cards**:
  - Number of Learning Paths
  - Completed Quizzes
  - Average Score
  - Total Time Studied

- **Progress Chart**: Visual representation of your learning progress

- **Your Learning Paths**: All your created learning paths with progress bars

- **Create New Path Button**: To create a new learning path

---

## 🎯 Quick Test Account

If you want to quickly test, you can register with:
- **Email**: `test@example.com`
- **Password**: `test123`
- **Name**: `Test User`
- **Learning Style**: Any
- **Role**: Student

---

## 🔍 Troubleshooting

### Can't See the Login Page?
- Make sure the application is running
- Check that you're going to: http://localhost:3000
- Try refreshing the page (F5 or Ctrl+R)

### Login Not Working?
- Make sure the backend server is running on port 5000
- Check browser console for errors (F12 → Console tab)
- Verify you're using the correct email and password
- Try registering a new account if login fails

### Dashboard Not Loading?
- Make sure you're logged in
- Check that the backend API is responding
- Look for errors in the browser console (F12)
- Try refreshing the page

### "Access Denied" or "Unauthorized" Error?
- Your session might have expired
- Try logging out and logging back in
- Clear browser cache and cookies
- Check that JWT token is being stored (F12 → Application → Local Storage)

---

## 📱 Alternative: OAuth Login (Optional)

You can also login using:
- **Google Account**: Click "🔵 Google" button on login page
- **GitHub Account**: Click "🐙 GitHub" button on login page

*Note: OAuth requires additional setup (see README.md for details)*

---

## 🎓 After Login - What to Do Next?

1. **Create a Learning Path**:
   - Click "+ Create New Path" on Dashboard
   - Enter Subject (e.g., "Mathematics")
   - Enter Topic (e.g., "Algebra")
   - Choose Difficulty
   - Click "Create Learning Path"

2. **View Your Learning Path**:
   - Click "Continue Learning" on any learning path card
   - See the modules and content
   - Mark modules as complete

3. **Take a Quiz**:
   - Go to a learning path
   - Click "+ Create Quiz"
   - Generate and take the quiz
   - See your results!

4. **Track Progress**:
   - View analytics on the Dashboard
   - See your learning statistics
   - Monitor your improvement

---

## 💡 Tips

- **Bookmark** http://localhost:3000 for easy access
- The app remembers your login (stored in browser)
- You can logout using the "Logout" button in the top right
- All your data is stored locally in SQLite database

---

**Happy Learning! 🚀**

