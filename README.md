# ResearchCollab

ResearchCollab is a platform that connects researchers for collaboration on projects, sharing ideas, and building a community of innovators.

## Taking Your App to Production

Ready to deploy ResearchCollab to production? Follow these steps:

### 1. Environmental Setup

Create a `.env.local` file at the root of your project with all required variables:

```bash
cp .env.example .env.local
```

Replace all placeholder values with your actual production credentials.

### 2. Production Database Setup

1. **Create a Supabase Production Project**:
   - Log in to the [Supabase Dashboard](https://app.supabase.io/)
   - Create a new project for production
   - After creation, go to Project Settings > API to find your URL and anon key

2. **Apply Database Schema**:
   - Use the provided schema.sql to set up your database:
   ```bash
   npx supabase db push
   ```

3. **Configure Row-Level Security**:
   - Verify all tables have proper RLS policies
   - Test policies to ensure they work as expected

### 3. Configure Authentication

1. **Email/Password Auth**:
   - Configure SMTP settings in Supabase Auth settings
   - Customize email templates for sign-up, password reset, etc.

2. **OAuth Providers** (Optional):
   - Set up Google, GitHub, or other OAuth providers
   - Add redirect URLs to your Supabase project

### 4. Frontend Deployment

Use our deployment script to build and deploy to Vercel:

```bash
# For staging deployment
./scripts/deploy.sh

# For production deployment
./scripts/deploy.sh production
```

Or deploy manually with Vercel:

```bash
vercel --prod
```

### 5. Set Up CI/CD

We've provided a GitHub Actions workflow in `.github/workflows/deploy.yml`. To use it:

1. Set up the following secrets in your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `SUPABASE_PROJECT_ID`: Your Supabase project ID
   - `SUPABASE_DB_PASSWORD`: Database password
   - `SUPABASE_ACCESS_TOKEN`: Supabase access token

2. Push to the main branch, and the workflow will handle testing, building, and deployment

### 6. Post-Deployment Verification

After deployment, verify:

1. Authentication flows work (sign-up, login, password reset)
2. Real-time features function correctly (chat, notifications)
3. All pages load and are responsive
4. Storage operations work (avatar uploads, file sharing)

### 7. Going Live

Before announcing your site to the public:

1. Complete the [Production Checklist](./PROD_CHECKLIST.md)
2. Set up monitoring and error tracking
3. Configure backups for your database
4. Test thoroughly with real users

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

This is a monorepo using [Turborepo](https://turbo.build/repo):

- `apps/web`: Next.js web application
- `packages/db`: Database utilities and types
- `packages/api`: API methods and business logic
- `packages/ui`: Reusable UI components

## License

[MIT](LICENSE)
