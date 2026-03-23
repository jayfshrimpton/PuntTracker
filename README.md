# Punter's Journal

Next.js app for tracking horse-racing bets with Supabase auth, stats, charts, subscriptions, admin tools, and email (Resend).

## Stack

Next.js 14 (App Router), Supabase (Postgres + Auth), Tailwind, Recharts, Stripe, Resend.

## Local setup

1. **Supabase** — Create a project at [supabase.com](https://supabase.com). In **Settings → API**, copy the project URL and anon key.

2. **Environment** — Add `.env.local` in the repo root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (required for build; use test keys until launch)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Payments off until you intentionally enable them
ENABLE_PAYMENTS=false
NEXT_PUBLIC_ENABLE_PAYMENTS=false

# Email & cron (optional locally)
RESEND_API_KEY=
FROM_EMAIL=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=

# Optional: AI insights
GEMINI_API_KEY=
```

3. **Database** — In Supabase **SQL Editor**, run the full script in [`database-schema.sql`](./database-schema.sql) once. It defines profiles, bets, feedback, subscriptions, user_subscriptions, user_insights, bet_templates, admin_audit_log, usage_tracking, RLS policies, and the `handle_new_user` trigger.

4. **Run**

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production (Vercel)

1. Connect the repo and deploy.
2. Set the same variables in **Vercel → Settings → Environment Variables** for Production (and Preview if needed). Use your real `NEXT_PUBLIC_APP_URL` (e.g. `https://yourdomain.com`).
3. **Stripe webhook** — Point Stripe to `https://your-domain/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET` from the webhook signing secret.
4. **Crons** — [`vercel.json`](./vercel.json) schedules:
   - `/api/cron/monthly-summary` — monthly
   - `/api/cron/send-verification-reminder` — daily  
   Cron routes expect `CRON_SECRET` (and email vars if you use Resend).
5. **Email** — Verify your domain in [Resend](https://resend.com). `FROM_EMAIL` must use that domain. `SUPABASE_SERVICE_ROLE_KEY` is required for server/cron jobs that read all users (never expose it to the client).
6. **Enable payments** — When ready: set `ENABLE_PAYMENTS` and `NEXT_PUBLIC_ENABLE_PAYMENTS` to `true`, switch to live Stripe keys, update webhook secret, redeploy.

## Supabase Auth URLs

In **Authentication → URL configuration**, set **Site URL** to your production URL and add redirect URLs for `/auth/callback`, password reset, and local dev (`http://localhost:3000/...`) as needed.

## Features (summary)

- Auth, bet CRUD, dashboard stats and charts  
- Feedback, onboarding, bankroll/goals, units, custom venues/bookies  
- Stripe subscriptions (when enabled), admin portal (service role + admin session)  
- Automated email via Resend where configured  

## License

MIT
