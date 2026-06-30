# DevMemory

A developer knowledge hub for snippets, commands, prompts, notes, files, images, and links.

## Getting Started

### Prerequisites

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (e.g. Neon) |
| `AUTH_SECRET` | Random secret for NextAuth — generate with `npx auth secret` |
| `AUTH_GITHUB_ID` | GitHub OAuth App client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App client secret |
| `RESEND_API_KEY` | [Resend](https://resend.com) API key for transactional email |
| `EMAIL_VERIFICATION_ENABLED` | Set to `"false"` to skip email verification (default: on) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (used for rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key ID |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret access key |
| `R2_BUCKET_NAME` | R2 bucket name for file/image uploads |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID_MONTHLY` | Stripe Price ID for the monthly Pro plan |
| `STRIPE_PRICE_ID_YEARLY` | Stripe Price ID for the yearly Pro plan |
| `OPENAI_API_KEY` | OpenAI API key (used for AI features) |

### Database

Run migrations and seed system item types:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### Dev Server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


