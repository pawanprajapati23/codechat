# 🚀 CodeChat Love - Complete Deployment Guide

## 📋 Table of Contents
1. [Backend Deployment (Render)](#backend-deployment-render)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Connecting Frontend & Backend](#connecting-frontend--backend)
4. [Testing the Deployment](#testing-the-deployment)
5. [Environment Variables](#environment-variables)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Backend Deployment (Render)

### **Step 1: Prepare Backend Code**

1. Make sure your backend code is ready:
```bash
cd codechat/backend
```

2. Create a GitHub repository (if not already):
```bash
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/codechat-backend.git
git push -u origin main
```

### **Step 2: Deploy to Render**

1. **Go to [Render.com](https://render.com)** and sign up/login

2. **Click "New +"** → **"Web Service"**

3. **Connect GitHub Repository**
   - Select your `codechat-backend` repository
   - Click "Connect"

4. **Configure Service:**
   - **Name**: `codechat-love-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `backend` if monorepo)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Add Environment Variables:**
   ```
   NODE_ENV = production
   PORT = 10000
   FRONTEND_URL = https://your-app.vercel.app
   ```
   (We'll update FRONTEND_URL after deploying frontend)

6. **Click "Create Web Service"**

7. **Wait for deployment** (2-3 minutes)

8. **Copy your backend URL:**
   ```
   https://codechat-love-backend.onrender.com
   ```

### **Step 3: Test Backend**

Open in browser:
```
https://codechat-love-backend.onrender.com/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-03-31T...",
  "uptime": 123,
  "rooms": 0,
  "activeUsers": 0
}
```

---

## 🌐 Frontend Deployment (Vercel)

### **Step 1: Prepare Frontend**

1. Update environment variable:
```bash
cd codechat/frontend
```

2. Create/update `.env.production`:
```env
VITE_BACKEND_URL=https://codechat-love-backend.onrender.com
```

3. Build to test:
```bash
npm run build
```

4. Commit changes:
```bash
git add .
git commit -m "Ready for deployment"
git push
```

### **Step 2: Deploy to Vercel**

**Option A: Using Vercel CLI (Recommended)**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
cd codechat/frontend
vercel
```

4. Follow prompts:
   - Set up and deploy? **Y**
   - Which scope? (Select your account)
   - Link to existing project? **N**
   - What's your project's name? **codechat-love**
   - In which directory? **./**
   - Override settings? **N**

5. Deploy to production:
```bash
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)

2. Click **"Add New Project"**

3. **Import Git Repository**
   - Connect your GitHub account
   - Select `codechat-frontend` repository

4. **Configure Project:**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or `frontend` if monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   
5. **Add Environment Variables:**
   ```
   VITE_BACKEND_URL = https://codechat-love-backend.onrender.com
   ```

6. Click **"Deploy"**

7. Wait for deployment (1-2 minutes)

8. **Copy your frontend URL:**
   ```
   https://codechat-love.vercel.app
   ```

---

## 🔗 Connecting Frontend & Backend

### **Step 1: Update Backend Environment**

1. Go to **Render Dashboard** → Your service

2. Go to **Environment** tab

3. Update **FRONTEND_URL**:
   ```
   FRONTEND_URL = https://codechat-love.vercel.app
   ```

4. Click **"Save Changes"**

5. Service will **auto-redeploy** (30 seconds)

### **Step 2: Test Connection**

1. Open your frontend URL:
   ```
   https://codechat-love.vercel.app
   ```

2. **Create a Room:**
   - Enter your name
   - Click "Create New Room"
   - You should see room code

3. **Test in Another Tab:**
   - Open same URL in new tab/window
   - Enter different name
   - Enter the room code
   - Click "Join Room"

4. **Send Messages:**
   - Type and send messages
   - Messages should appear in both tabs instantly
   - Try reactions, emojis, images

✅ **If everything works, CONGRATULATIONS!** 🎉

---

## 🔐 Environment Variables

### **Backend (.env)**
```env
# Required
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://codechat-love.vercel.app

# Optional (for future features)
MONGODB_URI=mongodb://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
```

### **Frontend (.env.production)**
```env
# Required
VITE_BACKEND_URL=https://codechat-love-backend.onrender.com
```

---

## ✅ Testing the Deployment

### **1. Health Check**
```bash
curl https://codechat-love-backend.onrender.com/health
```

### **2. Frontend Loading**
- Open: https://codechat-love.vercel.app
- Should see join screen
- Floating hearts animation
- No errors in console

### **3. Room Creation**
- Enter name → "Create New Room"
- Should get 6-character room code
- Should enter chat room

### **4. Real-time Messaging**
- Open 2+ tabs/devices
- Join same room
- Send messages
- All clients should receive instantly

### **5. Features Test**
- ✅ Messages appear in real-time
- ✅ Typing indicators work
- ✅ Reactions work
- ✅ Online counter updates
- ✅ Join/leave notifications
- ✅ Image upload works
- ✅ Emoji picker works
- ✅ Sound notifications
- ✅ Browser notifications

---

## 🐛 Troubleshooting

### **Problem: Frontend can't connect to backend**

**Solution:**
1. Check backend is running:
   ```
   https://your-backend.onrender.com/health
   ```

2. Check CORS settings in backend:
   ```javascript
   // backend/src/server.js
   cors: {
     origin: process.env.FRONTEND_URL,
     credentials: true
   }
   ```

3. Check frontend .env:
   ```
   VITE_BACKEND_URL=https://your-backend.onrender.com
   ```

4. Rebuild frontend:
   ```bash
   npm run build
   vercel --prod
   ```

### **Problem: WebSocket connection fails**

**Solution:**
1. Render free tier sleeps after 15 min inactivity
2. First request might take 30-60 seconds to wake up
3. Use WebSocket + polling as fallback (already configured)

### **Problem: Messages not appearing**

**Solution:**
1. Check browser console for errors
2. Check Network tab for WebSocket connection
3. Verify environment variables are correct
4. Check backend logs on Render dashboard

### **Problem: CORS errors**

**Solution:**
1. Update `FRONTEND_URL` in Render
2. Include protocol: `https://` not just domain
3. No trailing slash
4. Save and redeploy

### **Problem: Build fails on Vercel**

**Solution:**
1. Check `package.json` scripts
2. Ensure all dependencies installed
3. Check build command: `npm run build`
4. Ensure `dist` folder is output directory

---

## 📊 Monitoring

### **Backend Monitoring (Render)**
1. Go to Render Dashboard
2. Click your service
3. Check:
   - **Logs** tab for errors
   - **Metrics** tab for performance
   - **Events** tab for deployments

### **Frontend Monitoring (Vercel)**
1. Go to Vercel Dashboard
2. Click your project
3. Check:
   - **Deployments** tab
   - **Analytics** tab
   - **Logs** in each deployment

---

## 🔄 Updating Your App

### **Backend Updates**
```bash
cd codechat/backend
git add .
git commit -m "Update backend"
git push
# Render auto-deploys on push
```

### **Frontend Updates**
```bash
cd codechat/frontend
git add .
git commit -m "Update frontend"
git push
# Vercel auto-deploys on push
```

Or manual:
```bash
vercel --prod
```

---

## 💰 Cost Breakdown

### **Free Tier (Good for Testing)**
- **Render**: 750 hours/month free
- **Vercel**: 100GB bandwidth free
- **Total**: $0/month

### **Limitations**
- Render free tier sleeps after 15 min inactivity
- First request takes ~30s to wake up
- Shared resources

### **Upgrade Options**
- **Render Starter**: $7/month (always on, more resources)
- **Vercel Pro**: $20/month (more bandwidth, better support)

---

## 🎯 Quick Deployment Checklist

### **Backend (Render)**
- [ ] Code pushed to GitHub
- [ ] Create Web Service on Render
- [ ] Set environment variables
- [ ] Wait for deployment
- [ ] Test `/health` endpoint
- [ ] Copy backend URL

### **Frontend (Vercel)**
- [ ] Update `.env.production` with backend URL
- [ ] Build locally to test: `npm run build`
- [ ] Deploy to Vercel
- [ ] Set environment variables
- [ ] Wait for deployment
- [ ] Copy frontend URL

### **Connect**
- [ ] Update backend `FRONTEND_URL` with frontend URL
- [ ] Test connection
- [ ] Create room and test features

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ Backend health endpoint responds  
✅ Frontend loads without errors  
✅ Can create a room  
✅ Can join a room  
✅ Messages appear in real-time across multiple tabs  
✅ Reactions work  
✅ Typing indicators work  
✅ Online counter updates  
✅ Join/leave notifications appear  
✅ Media upload works  

---

## 📞 Support & Resources

### **Render Documentation**
- https://render.com/docs

### **Vercel Documentation**
- https://vercel.com/docs

### **Socket.IO Documentation**
- https://socket.io/docs/

### **Common Issues**
1. Check environment variables spelling
2. Ensure HTTPS (not HTTP) for production
3. Check browser console for errors
4. Verify WebSocket connection in Network tab

---

## 🚀 Advanced: Custom Domain

### **Add Custom Domain to Vercel**
1. Go to Project Settings → Domains
2. Add your domain (e.g., `chat.yourdomain.com`)
3. Update DNS records as instructed
4. Update backend `FRONTEND_URL` to custom domain

### **Add Custom Domain to Render**
1. Upgrade to paid plan
2. Go to Settings → Custom Domain
3. Add domain and configure DNS

---

## 🎊 Congratulations!

Tumhara **CodeChat Love** ab **LIVE** hai! 🔥

- ✅ Backend on Render
- ✅ Frontend on Vercel
- ✅ Fully connected
- ✅ Real-time messaging
- ✅ Production ready

**Share kar aur enjoy kar! 💕**

---

Made with ❤️ for amazing developers like you!
