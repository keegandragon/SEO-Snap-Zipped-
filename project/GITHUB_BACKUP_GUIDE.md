# How to Backup Your SEO Snap Project to GitHub

## Step 1: Create a GitHub Account
1. Go to https://github.com
2. Click "Sign up" if you don't have an account
3. Follow the registration process

## Step 2: Create a New Repository
1. Once logged in, click the "+" icon in the top right
2. Select "New repository"
3. Name it something like `seo-snap` or `product-description-generator`
4. Make it **Public** (required for free Netlify hosting)
5. **DO NOT** initialize with README, .gitignore, or license (we'll add our own)
6. Click "Create repository"

## Step 3: Download Your Project Files
Since you're in Bolt, you'll need to download your project files:

### Method 1: Download Individual Files (Recommended)
1. In Bolt, go to each important file
2. Copy the content
3. Create the same file structure locally on your computer

### Method 2: Use Git Commands (If Available)
If Bolt supports it, you can use git commands directly.

## Step 4: Set Up Git Locally
Open terminal/command prompt on your computer and run:

```bash
# Navigate to your project folder
cd path/to/your/seo-snap-project

# Initialize git repository
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit - SEO Snap project"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 5: Essential Files to Include

Make sure you have these key files:

### Root Files
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - Tailwind CSS config
- `tsconfig.json` - TypeScript configuration
- `index.html` - Main HTML file
- `.gitignore` - Git ignore file
- `README.md` - Project documentation

### Source Files (`src/` folder)
- `main.tsx` - React entry point
- `App.tsx` - Main app component
- `index.css` - Global styles
- All component files in `src/components/`
- All page files in `src/pages/`
- All service files in `src/services/`
- Type definitions in `src/types/`

### Supabase Files (`supabase/` folder)
- All Edge Functions in `supabase/functions/`
- All migrations in `supabase/migrations/`

### Important: Create .gitignore
Create a `.gitignore` file with this content:

```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# Bolt specific
.bolt/
```

## Step 6: Create README.md
Create a `README.md` file to document your project:

```markdown
# SEO Snap - AI-Powered Product Description Generator

Transform your product photos into compelling, SEO-optimized descriptions with the power of AI.

## Features
- AI-powered product description generation
- SEO optimization with tags and metadata
- Multiple subscription plans (Free, Starter, Pro)
- Image upload and processing
- Email sharing functionality
- CSV export (Pro feature)

## Tech Stack
- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (Database, Auth, Storage, Edge Functions)
- Stripe (Payments)
- Google Gemini AI (Description generation)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see .env.example)
4. Run development server: `npm run dev`

## Environment Variables
Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment
This project is configured for deployment on Netlify with Supabase backend.
```

## Step 7: Connect to Netlify
After pushing to GitHub:

1. Go back to the Netlify claim link you had
2. Connect with GitHub
3. Authorize Netlify to access your repositories
4. Select your new repository
5. Complete the claiming process

## Alternative: Deploy Fresh from GitHub
If claiming doesn't work:

1. Go to https://netlify.com
2. Sign up/login with GitHub
3. Click "New site from Git"
4. Choose GitHub and authorize
5. Select your repository
6. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Add environment variables in Netlify dashboard

## Important Notes

- **Never commit `.env` files** - they contain sensitive keys
- **Make repository public** for free Netlify hosting
- **Set up environment variables** in Netlify dashboard after deployment
- **Test locally first** before pushing to GitHub

Your project will now be backed up on GitHub and you can properly manage deployments through Netlify!
```