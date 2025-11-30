# Quick Setup Instructions

**Project by: Ashish Kumar**

## ⚠️ PowerShell Execution Policy Issue

If you see an error about execution policy, follow these steps:

### Option 1: Enable Scripts (Recommended)
Open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Option 2: Use Command Prompt (CMD)
Open Command Prompt (cmd.exe) instead of PowerShell and run the commands below.

### Option 3: Run Commands Manually
Open a new terminal (CMD or PowerShell after fixing policy) and run:

---

## 🚀 Installation Steps

### Step 1: Install Dependencies

Open a terminal in the project root and run:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Go back to root
cd ..
```

**OR** use the convenience script (if execution policy allows):
```bash
npm run install-all
```

### Step 2: Database Setup

The project is configured to use **SQLite by default** (no setup needed!). 

The `.env` file in `server/` already has `USE_SQLITE=true` set.

**If you want to use PostgreSQL instead:**
1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create a database: `createdb learning_path_db`
3. Edit `server/.env` and change `USE_SQLITE=true` to `USE_SQLITE=false`
4. Update database credentials in `server/.env`

### Step 3: Run the Application

From the project root, run:

```bash
npm run dev
```

This will start both:
- **Backend server** on http://localhost:5000
- **Frontend app** on http://localhost:3000

### Step 4: Open in Browser

Open your browser and go to: **http://localhost:3000**

---

## 🎯 First Steps

1. **Register a new account** or **Login**
2. **Create a learning path** from the dashboard
3. **Take a quiz** to test your knowledge
4. **View your progress** in the analytics dashboard

---

## 🔧 Troubleshooting

### "npm is not recognized"
- Make sure Node.js is installed: https://nodejs.org/
- Restart your terminal after installing Node.js

### "Port 5000 already in use"
- Change `PORT=5000` to `PORT=5001` in `server/.env`
- Update `REACT_APP_API_URL` in `client/.env` to match

### "Port 3000 already in use"
- React will automatically try the next available port
- Or set `PORT=3001` in `client/.env`

### Database errors
- Make sure `USE_SQLITE=true` in `server/.env` for easy setup
- For PostgreSQL, ensure the service is running

### AI features not working
- The app works without OpenAI API key
- AI features will use fallback content
- To enable AI: Get a key from https://platform.openai.com/api-keys
- Add it to `server/.env` as `OPENAI_API_KEY=your_key_here`

---

## 📝 Notes

- **SQLite** is used by default (no installation needed!)
- **OAuth** (Google/GitHub login) is optional
- **OpenAI API** is optional (app works without it)
- All features work locally without external services

---

**Happy coding! 🎉**

