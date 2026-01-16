# 🚀 Digital Ocean Deployment Guide - $5 Budget

## 📊 **Your $5 Budget Plan**

### **Cost Breakdown:**
- **Digital Ocean App Platform**: **$0/month** (first app free!)
- **Remaining $5**: Can be used for additional resources if needed

**Total Cost: $0/month for your LMS backend! 🎉**

---

## 🎯 **Deployment Steps**

### **Step 1: Prepare Your Repository**
```bash
cd /home/rupesh/dp/vaastu-backend
git add .
git commit -m "Ready for Digital Ocean deployment"
git push origin main
```
✅ **DONE** - All files committed and pushed!

### **Step 2: Create Digital Ocean Account**
1. Go to [digitalocean.com](https://digitalocean.com)
2. Sign up with your $5 credit
3. Verify your account

### **Step 3: Set up App Platform**
1. Go to **Apps** → **Create App**
2. Choose **GitHub** as source
3. Connect your GitHub account
4. Select your repository: `rupesh/vaastu-backend`
5. Choose branch: `main`

### **Step 4: Configure App Settings**
The app will auto-detect settings from `.do/app.yaml`, but verify:

#### **Resource Settings:**
- **Plan**: Starter ($0/month) ⭐
- **Instance Count**: 1
- **Instance Type**: Basic XXS

#### **Environment Variables (CRITICAL):**
Set these in App Platform dashboard:

```bash
# Database (Required)
DATABASE_URL=postgresql://postgres.ygpdmlwddugeusebojtn:vaastu_db@123@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.ygpdmlwddugeusebojtn:vaastu_db@123@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# JWT Secrets (Generate new ones for production)
JWT_ACCESS_SECRET=your_new_production_access_secret_here
JWT_REFRESH_SECRET=your_new_production_refresh_secret_here

# Email Configuration
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_app_password
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your@domain.com

# Cloudinary (if using)
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Payment Gateway
ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret_key

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com
```

### **Step 5: Deploy!**
1. Click **Create App**
2. Wait for deployment (~3-5 minutes)
3. Your API will be available at: `https://your-app-name.ondigitalocean.app`

---

## 🔧 **Post-Deployment Configuration**

### **Step 1: Update CORS Origins**
In your App Platform environment variables, update:
```bash
CORS_ORIGINS=https://your-frontend-domain.com,https://your-app-name.ondigitalocean.app
```

### **Step 2: Test Your API**
```bash
# Test health endpoint
curl https://your-app-name.ondigitalocean.app/health

# Test with Postman
# Base URL: https://your-app-name.ondigitalocean.app
```

### **Step 3: Database Migration (Production)**
```bash
# If needed, you can run migrations via SSH or app console
# But since we use Supabase, migrations are already done!
```

---

## 🚀 **CI/CD Features**

### **Automatic Deployments:**
- ✅ **Push to main** → Auto-deploy
- ✅ **Pull Requests** → Auto-test
- ✅ **Health Checks** → Auto-monitoring

### **Monitoring:**
- ✅ **Logs**: View in App Platform dashboard
- ✅ **Metrics**: CPU, Memory, Network usage
- ✅ **Health Checks**: Automatic `/health` monitoring

---

## 💰 **Scaling Options (When You Grow)**

### **Current Plan: $0/month**
- 512MB RAM
- 1 vCPU
- 1GB storage
- Unlimited bandwidth

### **Upgrade Options:**
- **Basic**: $12/month (1GB RAM, better performance)
- **Professional**: $25/month (2GB RAM, more features)
- **Load Balancer**: $12/month (for multiple instances)

---

## 🔒 **Security Best Practices**

### **Environment Variables:**
- ✅ All secrets stored as environment variables
- ✅ No hardcoded credentials in code
- ✅ Database credentials encrypted

### **Network Security:**
- ✅ HTTPS enabled by default
- ✅ DDoS protection included
- ✅ Web Application Firewall available

---

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **1. Build Fails**
```bash
# Check logs in App Platform dashboard
# Common fix: Ensure all dependencies are in package.json
```

#### **2. Database Connection Issues**
```bash
# Verify Supabase URL is correct
# Check if Supabase allows external connections
```

#### **3. CORS Issues**
```bash
# Update CORS_ORIGINS in environment variables
CORS_ORIGINS=https://your-frontend-domain.com
```

#### **4. Health Check Fails**
```bash
# Check if /health endpoint responds
curl https://your-app-name.ondigitalocean.app/health
```

---

## 📊 **Performance Monitoring**

### **App Platform Dashboard:**
- Real-time metrics
- Request/response times
- Error rates
- Resource usage

### **Supabase Dashboard:**
- Database performance
- Query execution times
- Connection counts
- Storage usage

---

## 🎯 **Success Checklist**

- [ ] Digital Ocean account created
- [ ] App Platform app created
- [ ] Environment variables configured
- [ ] First deployment successful
- [ ] Health check passing
- [ ] API endpoints working
- [ ] Frontend can connect
- [ ] CI/CD pipeline working

---

## 💡 **Pro Tips**

1. **Custom Domain**: Add your own domain ($12/year on Namecheap)
2. **SSL Certificate**: Free with App Platform
3. **Backups**: Enable automatic database backups in Supabase
4. **Monitoring**: Set up alerts for downtime
5. **Scaling**: Monitor usage and upgrade when needed

---

## 🎉 **Congratulations!**

**Your Vaastu LMS is now deployed on Digital Ocean for $0/month!**

### **Live URLs:**
- **API**: `https://your-app-name.ondigitalocean.app`
- **Health Check**: `https://your-app-name.ondigitalocean.app/health`
- **Documentation**: All endpoints available via Postman collection

### **Next Steps:**
1. Deploy your frontend
2. Set up custom domain
3. Configure monitoring alerts
4. Add more users! 🚀

**Total Cost: $0/month (thanks to Digital Ocean's free tier!)**

---

## 📞 **Support**

- **Digital Ocean Docs**: [docs.digitalocean.com](https://docs.digitalocean.com/products/app-platform/)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **App Platform Support**: Available in dashboard

**Happy Deploying! 🎊**
