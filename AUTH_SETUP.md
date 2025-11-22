# Better Auth Setup Guide

This project uses **Better Auth** with **Neon Postgres** and **Drizzle ORM** for authentication.

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# Database - Get this from your Neon.tech dashboard
DATABASE_URL=your-neon-postgres-connection-string

# Better Auth - Generate secret with: openssl rand -base64 32
BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
BETTER_AUTH_URL=http://localhost:3000

# App URL (for production, update this)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OAuth Providers (optional - only needed if using social login)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Setup Steps

### 1. Create a Neon Database

1. Go to [Neon.tech](https://neon.tech) and create a new project
2. Copy your connection string
3. Add it to your `.env.local` file as `DATABASE_URL`

### 2. Generate Auth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Add the output to your `.env.local` file as `BETTER_AUTH_SECRET`

### 3. Push Database Schema

Run the following command to create the required tables in your database:

```bash
npm run db:push
```

Or use the Better Auth CLI:

```bash
npm run auth:migrate
```

### 4. (Optional) Configure OAuth Providers

If you want to enable social login:

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
4. Add your Client ID and Client Secret to `.env.local`

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set Authorized redirect URI to: `http://localhost:3000/api/auth/callback/google`
6. Add your Client ID and Client Secret to `.env.local`

## Usage

### Client-Side

```typescript
import { signIn, signOut, signUp, useSession } from "@/lib/auth-client";

// In your component
function MyComponent() {
  const { data: session } = useSession();

  const handleSignUp = async () => {
    await signUp.email({
      email: "user@example.com",
      password: "password",
      name: "John Doe",
    });
  };

  const handleSignIn = async () => {
    await signIn.email({
      email: "user@example.com",
      password: "password",
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div>
      {session ? (
        <div>
          <p>Welcome, {session.user?.name}</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <button onClick={handleSignIn}>Sign In</button>
          <button onClick={handleSignUp}>Sign Up</button>
        </div>
      )}
    </div>
  );
}
```

### Server-Side

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  return session;
}
```

## Database Management Scripts

- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Apply migrations
- `npm run db:push` - Push schema changes directly to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run auth:migrate` - Create Better Auth tables using CLI

## File Structure

```
lib/
├── auth.ts              # Better Auth instance
├── auth-client.ts       # Client-side auth helpers
└── db/
    ├── index.ts         # Database connection
    └── schema.ts        # Drizzle schema
app/
└── api/
    └── auth/
        └── [...all]/
            └── route.ts # Auth API handler
```

## Documentation

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Neon Postgres Docs](https://neon.tech/docs)

