# Deployment Guide - Vercel

## Prerequisites

- GitHub account
- Vercel account ([vercel.com](https://vercel.com))
- Code pushed to GitHub repository

## Step 1: Push to GitHub

If you haven't already:

```bash
# Create a new repository on GitHub
# Then push your code:

git remote add origin https://github.com/YOUR_USERNAME/statnativ-accounts.git
git push -u origin main
```

## Step 2: Set Up Vercel Postgres

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on "Storage" in the top navigation
3. Click "Create Database"
4. Select "Postgres"
5. Choose a name (e.g., "statnativ-db")
6. Select a region (choose closest to your users)
7. Click "Create"
8. Copy the connection string (you'll need this)

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. Add Environment Variables:

```env
DATABASE_URL=<paste-your-vercel-postgres-connection-string>
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
DEFAULT_HOURLY_RATE=45
DEFAULT_CONVERSION_RATE=90
RESOURCES=Amit,Abhilash
```

6. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

## Step 4: Connect Database to Project

1. In your Vercel project dashboard
2. Go to "Settings" → "Environment Variables"
3. If not added during deployment, add `DATABASE_URL`
4. Go to "Storage" tab
5. Click "Connect Store"
6. Select your Postgres database
7. This will automatically add the connection string to your environment variables

## Step 5: Push Database Schema

After deployment:

```bash
# Pull environment variables
vercel env pull

# Push schema to production database
npm run db:push
```

Or use Vercel CLI in production:

```bash
# Connect to production
vercel env pull .env.production

# Push schema
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-) npm run db:push
```

## Step 6: Verify Deployment

1. Visit your deployment URL (e.g., `https://statnativ-accounts.vercel.app`)
2. Check that all pages load correctly
3. Verify database connection works

## Automatic Deployments

Once connected:
- Every push to `main` branch → Production deployment
- Every push to other branches → Preview deployment
- Pull requests → Automatic preview deployments

## Environment Variables Reference

### Required Variables

```env
# Database (Required)
DATABASE_URL="postgresql://..."

# Authentication (Required)
NEXTAUTH_URL="https://your-project.vercel.app"
NEXTAUTH_SECRET="<random-32-char-string>"
```

### Optional Variables

```env
# App Configuration (has defaults)
DEFAULT_HOURLY_RATE=45
DEFAULT_CONVERSION_RATE=90
RESOURCES="Amit,Abhilash"
```

## Custom Domain (Optional)

1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `NEXTAUTH_URL` to your custom domain

## Monitoring and Logs

### View Deployment Logs

1. Go to your project in Vercel
2. Click on a deployment
3. View "Build Logs" and "Function Logs"

### View Runtime Logs

```bash
vercel logs <deployment-url>
```

### Monitor Performance

- Go to "Analytics" tab in your Vercel project
- View page load times, visitor stats, etc.

## Database Management in Production

### View Production Database

```bash
# Pull production env vars
vercel env pull

# Open Drizzle Studio
npm run db:studio
```

This will connect to your production database (be careful with changes!)

### Backup Database

Vercel Postgres includes automatic backups, but you can also:

```bash
# Export data (requires psql)
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

## Troubleshooting

### Build Failures

1. Check build logs in Vercel dashboard
2. Verify all dependencies are in `package.json`
3. Test build locally: `npm run build`

### Database Connection Issues

1. Verify `DATABASE_URL` is set correctly
2. Check database is in the same region as your Vercel project (for best performance)
3. Verify schema is pushed: `npm run db:push`

### Environment Variables Not Working

1. Redeploy after adding/changing environment variables
2. Remember: Environment variables are not available in build time (only server runtime)
3. Use `NEXT_PUBLIC_` prefix for client-side variables (if needed)

### 502/504 Errors

- Check function timeout settings
- Verify database queries are optimized
- Check Vercel status page

## Cost Estimation

### Vercel Pricing

- **Hobby Plan** (Free):
  - 100 GB bandwidth
  - Unlimited requests
  - Automatic HTTPS
  - Good for development/testing

- **Pro Plan** ($20/month):
  - 1 TB bandwidth
  - Team collaboration
  - Better performance
  - Required for production

### Database Pricing

- **Vercel Postgres**:
  - Free tier: 256 MB storage, 60 compute hours/month
  - Pro: Starting at $20/month for 512 MB

For 2 users with moderate usage, the free tier should be sufficient initially.

## Security Best Practices

1. **Never commit `.env.local`** to git (already in `.gitignore`)
2. **Use strong secrets** for `NEXTAUTH_SECRET`
3. **Enable HTTPS only** (Vercel does this automatically)
4. **Regular database backups**
5. **Monitor access logs**

## Scaling Considerations

As your usage grows:

1. **Database**: Upgrade Vercel Postgres plan
2. **Edge Functions**: Already distributed globally by Vercel
3. **CDN**: Static assets automatically cached
4. **Monitoring**: Set up Vercel Analytics

## Rollback Deployment

If something goes wrong:

1. Go to Vercel dashboard
2. Select "Deployments"
3. Find a previous working deployment
4. Click "..." → "Promote to Production"

Or using CLI:

```bash
vercel rollback
```

## CI/CD Integration

The setup is already configured for CI/CD:

- ✅ Automatic builds on push
- ✅ Preview deployments for PRs
- ✅ Type checking during build
- ✅ Linting during build

## Next Steps After Deployment

1. Set up monitoring/alerts
2. Configure custom domain
3. Set up regular database backups
4. Add team members (Pro plan)
5. Configure CORS if needed for external APIs

---

**Status**: Ready to deploy! 🚀

**Estimated Deploy Time**: 5-10 minutes

**Zero-Downtime**: Yes (automatic)
