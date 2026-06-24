# Database migrations

These are one-off SQL scripts to run manually against the Supabase database
(Dashboard -> SQL Editor). The canonical full schema lives in
[`../database-schema.sql`](../database-schema.sql); each file here is a focused
slice for incremental changes.

| File | Status | Notes |
| --- | --- | --- |
| `0001_bank_transactions.sql` | NOT APPLIED | PUN-71 Bank History. Until applied, the app shows a "Database update required" banner on the dashboard/settings bankroll sections instead of the bank history feature. |
| `0002_security_performance.sql` | NOT APPLIED | Quota bypass fix (usage_tracking RLS), atomic `increment_usage` RPC, profile `stripe_customer_id` protection, performance indexes. |

## How to apply

1. Open the Supabase dashboard for the project.
2. Go to SQL Editor.
3. Paste the contents of the migration file and click Run.
4. Update the Status column above to `APPLIED`.

Scripts are written to be safe to run more than once (`IF NOT EXISTS`,
`DROP POLICY IF EXISTS`, etc.).
