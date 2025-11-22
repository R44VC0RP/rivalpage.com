# Environment Variables Setup

This document describes all the environment variables needed for the competitor analysis workflow.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Database
```
DATABASE_URL=your_database_url_here
```
Your PostgreSQL database connection string.

### OpenAI API
```
OPENAI_API_KEY=your_openai_api_key_here
```
Get your API key from: https://platform.openai.com/api-keys

### Firecrawl API
```
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```
Get your API key from: https://firecrawl.dev

### Screenshot Service (ScreenshotOne - Recommended)
```
SCREENSHOTONE_ACCESS_KEY=your_screenshotone_access_key_here
SCREENSHOTONE_SECRET_KEY=your_screenshotone_secret_key_here
```
- Get your free API keys from: https://screenshotone.com
- Free tier: 100 screenshots/month
- Paid plans start at $9/mo for 1,000 screenshots
- Better rate limits and reliability than Cloudflare
- Uses official SDK: `screenshotone-api-sdk`

### Alternative: Cloudflare Browser Rendering
```
CLOUDFLARE_ACCOUNT_ID=475fe7a9850defb092143b6adbda5028
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
```
- Account ID is already set (can be changed if needed)
- Get API token from Cloudflare dashboard with Browser Rendering permissions
- Note: Has aggressive rate limits, use ScreenshotOne instead

### Cloudflare R2 Storage
```
R2_ACCOUNT_ID=your_r2_account_id_here
R2_ACCESS_KEY_ID=your_r2_access_key_id_here
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key_here
R2_BUCKET_NAME=your_r2_bucket_name_here
R2_PUBLIC_DOMAIN=your_r2_public_domain_here
```
- Create an R2 bucket in your Cloudflare account
- Generate R2 API tokens with read/write permissions
- Set up a public domain for your R2 bucket

### Inbound Email API
```
INBOUND_API_KEY=your_inbound_api_key_here
```
- Get your API key from: https://inbound.new
- Used to send completion emails to users
- Compatible with Resend API format

### App Configuration
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
- Set to your production URL in production (e.g., `https://rivalpage.com`)
- Used for generating analysis links in emails

## Database Migration

After setting up the environment variables, run the database migration:

```bash
npm run db:push
```

This will create the new tables:
- `analysis_requests` - Tracks analysis workflow status
- `screenshots` - Caches screenshot URLs

## Testing the Workflow

1. Start the development server:
```bash
npm run dev
```

2. Submit a competitor analysis request through the UI at `http://localhost:3000`

3. Monitor workflow execution:
```bash
npx workflow inspect runs --web
```

## Workflow Steps

The competitor analysis workflow consists of 4 steps:

1. **Find Competitors** - Uses OpenAI with web search to find 10 competitors
2. **Map Links** - Uses Firecrawl to map up to 10 links per competitor
3. **Process Screenshots** - Takes screenshots using Cloudflare Browser Rendering, uploads to R2
4. **Finalize** - Aggregates results and updates the database

Each step is automatically retried on failure (except fatal errors).

