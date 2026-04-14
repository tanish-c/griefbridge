# GriefBridge — Deployment Guide

## Local Development

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- MongoDB Atlas free account (M0 cluster)
- Git (for version control)

### 1. Backend Setup

```bash
cd griefbridge-server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env  # or use your editor
```

**Requirements for .env:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/griefbridge?retryWrites=true&w=majority
JWT_SECRET=your-min-64-character-secret-string-here-1234567890
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:5173
```

```bash
# Seed procedure corpus
npm run seed

# Start development server
npm run dev
```

**Should see:** `GriefBridge API server running on port 5000`

### 2. Frontend Setup

```bash
cd griefbridge-client

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Default already has: VITE_API_URL=http://localhost:5000
```

```bash
# Start development server
npm run dev
```

**Should see:** `VITE v5.0.0 ready in 123 ms → Local: http://localhost:5173/`

### 3. Test the Full Application

1. **Open browser:** http://localhost:5173
2. **Click "Start Your Case Free" or use /register**
3. **Create account:** 
   - Email: `test@example.com`
   - Password: Any 6+ char string
4. **Complete intake questionnaire** (13 questions)
5. **View D3.js dependency graph** on dashboard
6. **Click nodes** to open side panel with task details
7. **Mark complete** to unlock dependent tasks

## Production Deployment

### Option A: Vercel (Frontend) + Render (Backend)

#### Frontend on Vercel

1. **Push to GitHub**
   ```bash
   cd griefbridge-client
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/griefbridge.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import GitHub repository
   - Set root directory: `griefbridge-client`
   - Add environment variable:
     ```
     VITE_API_URL=https://griefbridge-api.render.com
     ```
   - Click Deploy
   - Site will be live in ~2-3 minutes

#### Backend on Render

1. **Push to GitHub**
   ```bash
   cd griefbridge-server
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/griefbridge-api.git
   git push -u origin main
   ```

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Click "New Web Service"
   - Connect GitHub account
   - Select your `griefbridge-server` repository
   - Fill in:
     - **Name:** `griefbridge-api`
     - **Root Directory:** `griefbridge-server`
     - **Build Command:** `npm install`
     - **Start Command:** `node src/app.js`
     - **Environment:** `Node`
   - Add environment variables:
     ```
     MONGODB_URI=<your-atlas-uri>
     JWT_SECRET=<your-64-char-secret>
     PORT=5000
     NODE_ENV=production
     BASE_URL=https://griefbridge-api.render.com
     CORS_ORIGIN=https://your-vercel-url.vercel.app
     ```
   - Click Deploy
   - Wait for build to complete (~3-5 minutes)
   - Note the URL: `https://griefbridge-api.render.com`

#### Database on MongoDB Atlas

1. **Go to** [atlas.mongodb.com](https://www.mongodb.com/cloud/atlas)

2. **Create Free Cluster**
   - Sign up / Log in
   - Click "Build a Database"
   - Select "M0 FREE" tier
   - Region: Choose closest to your location
   - Click "Create"

3. **Create Database User**
   - Wait ~3 minutes for cluster to initialize
   - Go to "Database Access"
   - Click "Add New Database User"
   - Set username and password
   - Role: "Atlas admin" (for demo)
   - Click "Create User"

4. **Whitelist IP Address**
   - Click "Network Access"
   - Click "Add IP Address"
   - For development: `127.0.0.1`
   - For production: Use specific IP or `0.0.0.0/0` (not recommended but for demo)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Databases"
   - Click "Connect" on your cluster
   - Select "Drivers"
   - Copy connection string
   - Add to `.env` as `MONGODB_URI`
   - Replace `<password>` with your database user password

### Testing After Deployment

1. **Frontend URL:** https://your-vercel-url.vercel.app
2. **API Health Check:** https://griefbridge-api.render.com/api/health
3. **Try registering a new account**
4. **Complete intake and verify graph renders**

## Troubleshooting Deployment

### Frontend shows "Cannot GET /"

**Cause:** Vite build not configured correctly  
**Solution:**
```bash
npm run build
# Check that dist/ folder has index.html
# Vercel should auto-detect SPA and configure correctly
```

### Backend returns 503 Service Unavailable

**Cause:** Database connection failed, or environment variables not set  
**Solution:**
1. Check `MONGODB_URI` in Render environment
2. Verify IP is whitelisted in Atlas
3. Check Render logs: Dashboard → Your service → Logs

### CORS errors in browser console

**Cause:** Frontend and backend have different URLs  
**Solution:**
1. Update `CORS_ORIGIN` in backend `.env` to match frontend URL
2. Redeploy backend
3. Clear browser cache (Ctrl+F5)

### Authentication not working

**Cause:** JWT_SECRET mismatch or httpOnly cookies blocked  
**Solution:**
1. Verify `JWT_SECRET` is same in dev and production
2. Check browser DevTools → Application → Cookies
3. Should see `token` cookie with httpOnly flag

### D3 graph not rendering

**Cause:** Frontend API call failed  
**Solution:**
1. Check Network tab in DevTools
2. Verify `GET /api/cases` returns 200
3. Check if case has procedures array
4. Try re-creating a new case

## Production Checklist

- [ ] MongoDB Atlas cluster created and whitelisted
- [ ] Backend deployed to Render with env vars set
- [ ] Frontend deployed to Vercel with VITE_API_URL set
- [ ] CORS_ORIGIN updated in backend to match frontend URL
- [ ] Tested registration on live URLs
- [ ] Tested intake questionnaire → graph rendering
- [ ] Tested document upload and retrieval
- [ ] API health check returns 200
- [ ] Notifications work (wait 60 seconds)
- [ ] All 6 node states visible in graph (create multiple tasks)

## Monitoring

### Render Logs
- Dashboard → Your service → Logs
- Search for errors, warnings

### MongoDB Atlas Monitoring
- Atlas Dashboard → Your cluster → Metrics
- Monitor CPU, memory, network usage

### Vercel Analytics
- Vercel Dashboard → Your project → Analytics
- Monitor real-time traffic and build status

## Scaling Considerations (Future)

- **Database:** Upgrade from M0 to M2+ if exceeding 512MB
- **Backend:** Render free tier = 750 hrs/month; upgrade to paid if needing 24/7
- **Frontend:** Vercel handles unlimited traffic with caching
- **Cache:** Add Redis for session storage if using horizontal scaling
- **CDN:** Vercel includes Cloudflare CDN by default

## Rollback

### If deployment breaks:

**Frontend:**
```bash
cd griefbridge-client
git revert HEAD
git push origin main
# Vercel auto-redeploys
```

**Backend:**
```bash
cd griefbridge-server
git revert HEAD
git push origin main
# Render auto-redeploys
```

## Custom Domain (Optional)

### Vercel
1. Vercel Dashboard → Your project → Settings → Domains
2. Add custom domain
3. Update DNS records at your registrar

### Render
1. Render Dashboard → Your service → Settings → Custom Domain
2. Add custom domain
3. Update DNS records at your registrar

## Performance Tips

1. **Enable browser caching:** Vercel does this automatically
2. **Minify assets:** `npm run build` handles this
3. **Use CDN:** Already included with Vercel
4. **Database indexes:** Already created in schema
5. **Rate limiting:** Already configured in Express

## Maintenance

### Monthly
- Check MongoDB storage usage
- Review error logs
- Update npm dependencies: `npm outdated`

### Weekly
- Monitor Render and Vercel dashboards
- Check API response times

### Daily (if high traffic)
- Monitor real-time logs
- Check error rates

## Support & Debugging

**For Vercel issues:** https://vercel.com/support  
**For Render issues:** https://render.com/docs  
**For MongoDB issues:** https://docs.mongodb.com/  

---

**Free Tier Limits:**
- Vercel: Unlimited deployments, 6000 mins build/month
- Render: 750 hours/month, auto-sleep after 15 mins inactivity
- MongoDB M0: 512MB storage, 0.5MB max document size

Total monthly cost: **$0** (free tier sufficient for demo evaluation)
