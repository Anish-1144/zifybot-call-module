# Frontend-Backend Connection Setup

## Environment Variables

The frontend uses environment variables to connect to the backend API.

### Setup

1. **Create `.env.local` file** in the `zifybot.frontend` directory (already created):

   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

2. **Update the URL** if your backend runs on a different port or host:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://your-backend-url:port
   ```

### Important Notes

- The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser
- After changing `.env.local`, restart your Next.js development server
- The `.env.local` file is gitignored and won't be committed to version control

## API Configuration

All API calls are centralized in `lib/api.ts`:

- Base URL is read from `NEXT_PUBLIC_API_BASE_URL`
- Automatically adds Authorization header if token exists
- Includes credentials for cookie-based authentication
- Handles network errors gracefully

## Backend CORS Configuration

The backend (`zifybot.backend/src/app.ts`) is configured to accept requests from:

- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:3002`

If your frontend runs on a different port, update the CORS configuration in the backend.

## Troubleshooting

### "Failed to fetch" Error

1. **Check if backend is running:**

   ```bash
   cd zifybot.backend
   npm run dev
   ```

2. **Verify backend URL:**

   - Check `.env.local` in frontend matches your backend URL
   - Default: `http://localhost:8000`

3. **Check CORS configuration:**

   - Ensure your frontend URL is in the backend's CORS allowed origins
   - Default frontend runs on `http://localhost:3000`

4. **Restart both servers:**

   - Stop both frontend and backend
   - Start backend first, then frontend

5. **Check browser console:**
   - Open browser DevTools (F12)
   - Check Network tab for failed requests
   - Look for CORS errors or connection refused errors

## Testing Connection

Test the backend health endpoint:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{
  "status": "success",
  "message": "Server is running"
}
```

