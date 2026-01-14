# Quick Setup Instructions

## Issue Found
Your backend is configured to run on **port 5000**, but the frontend was trying to connect to port 8000.

## Solution

### Step 1: Create `.env.local` file

Create a file named `.env.local` in the `zifybot.frontend` directory with this content:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

**On Windows (PowerShell):**
```powershell
cd zifybot.frontend
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:5000" > .env.local
```

**On Windows (Command Prompt):**
```cmd
cd zifybot.frontend
echo NEXT_PUBLIC_API_BASE_URL=http://localhost:5000 > .env.local
```

**On Mac/Linux:**
```bash
cd zifybot.frontend
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:5000" > .env.local
```

### Step 2: Start the Backend Server

Make sure your backend is running:

```bash
cd zifybot.backend
npm run dev
```

You should see:
```
🚀 Server is running at port: 5000
```

### Step 3: Restart the Frontend Server

After creating `.env.local`, restart your frontend:

```bash
cd zifybot.frontend
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 4: Verify Connection

1. Open browser console (F12)
2. Go to Network tab
3. Try to login/register
4. Check if requests are going to `http://localhost:5000`

## Troubleshooting

### If backend is not running:
- Check if MongoDB is connected
- Verify all required environment variables are set in `zifybot.backend/.env`
- Check backend console for errors

### If still getting connection errors:
1. Verify backend is running: Open `http://localhost:5000/health` in browser
2. Should return: `{"status":"success","message":"Server is running"}`
3. If not, check backend logs for errors

### Port Conflicts:
- If port 5000 is in use, either:
  - Change backend PORT in `zifybot.backend/.env` to another port (e.g., 8000)
  - Update `NEXT_PUBLIC_API_BASE_URL` in frontend `.env.local` to match


