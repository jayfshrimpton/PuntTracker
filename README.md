# Punter's Journal

A web application for tracking horse racing bets with user authentication, comprehensive statistics, and data visualizations. Built with Next.js, Supabase, and modern React components.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Fill in:
   - Name: "horse-bet-tracker"
   - Database Password: (create a strong password - save it!)
   - Region: Choose closest to you
5. Wait 2-3 minutes for project to be created
6. Once ready, go to **Settings → API**
7. Copy and save these two values:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public key** (long string starting with eyJ...)

### Step 2: Configure Environment Variables

1. Create a `.env.local` file in the root directory
2. Add the following:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. Replace with your actual Supabase URL and key from Step 1

### Step 3: Set Up Database Schema

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL from `database-schema.sql` (see below)
5. **Also run the feedback schema**: Copy and paste the SQL from `feedback-schema.sql` to create the feedback table

```sql
-- Create bets table
CREATE TABLE bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  race_name TEXT NOT NULL,
  horse_name TEXT NOT NULL,
  bet_type TEXT NOT NULL, -- 'win', 'place', 'lay'
  price DECIMAL(10,2) NOT NULL, -- odds
  stake DECIMAL(10,2) NOT NULL,
  finishing_position INTEGER,
  profit_loss DECIMAL(10,2),
  bet_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX bets_user_id_idx ON bets(user_id);
CREATE INDEX bets_bet_date_idx ON bets(bet_date);

-- Enable Row Level Security
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own bets
CREATE POLICY "Users can view own bets" ON bets
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy: Users can insert their own bets
CREATE POLICY "Users can insert own bets" ON bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own bets
CREATE POLICY "Users can update own bets" ON bets
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy: Users can delete their own bets
CREATE POLICY "Users can delete own bets" ON bets
  FOR DELETE USING (auth.uid() = user_id);
```

5. Click **Run** to execute the SQL
6. You should see "Success. No rows returned"
7. Create a new query and run the SQL from `feedback-schema.sql` to set up the feedback system

### Step 4: Install Dependencies and Run

```bash
npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Features

✅ **Authentication**: Sign up, login, and logout functionality with Supabase Auth
✅ **Bet Management**: Add, edit, and delete bets with auto-calculation of profit/loss
✅ **Statistics Dashboard**: Comprehensive statistics including:
   - Total Profit/Loss
   - Strike Rate
   - POT (Profit on Turnover)
   - Total Turnover
   - Average Odds
   - Current Streak
   - Best Win / Worst Loss
✅ **Visualizations**:
   - Profit/Loss Over Time (Area Chart)
   - Monthly Comparison (Bar Chart)
   - Strike Rate by Bet Type (Bar Chart)
   - Bet Distribution (Pie Chart)
   - ROI Trend (Line Chart)
✅ **Mobile Responsive**: Fully responsive design that works on all devices
✅ **Toast Notifications**: User-friendly success/error notifications
✅ **Feedback System**: Submit feedback, bug reports, and feature requests
✅ **Admin Dashboard**: View and manage all user feedback submissions

## Project Structure

```
├── app/
│   ├── dashboard/          # Dashboard pages (protected)
│   │   ├── layout.tsx       # Dashboard layout with navigation
│   │   ├── page.tsx         # Main dashboard with stats and charts
│   │   └── bets/
│   │       └── page.tsx     # Bet entry form and list
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   └── layout.tsx            # Root layout
├── components/
│   ├── DashboardNav.tsx     # Navigation component
│   ├── Toast.tsx            # Toast notification component
│   ├── ToastProvider.tsx    # Toast provider
│   ├── FeedbackButton.tsx   # Floating feedback button
│   └── FeedbackModal.tsx    # Feedback form modal
├── lib/
│   ├── api.ts               # API functions for Supabase operations
│   ├── stats.ts             # Statistics calculation functions
│   ├── toast.ts             # Toast notification utilities
│   └── supabase/            # Supabase client setup
│       ├── client.ts        # Browser client
│       ├── server.ts        # Server client
│       └── middleware.ts    # Middleware client
├── feedback-schema.sql      # Database schema for feedback table
└── middleware.ts            # Next.js middleware for auth protection
```

## Bet Types

- **Win**: Betting on a horse to win (finish 1st)
- **Place**: Betting on a horse to place (finish 1st, 2nd, or 3rd)
- **Lay**: Betting against a horse (you win if it doesn't finish 1st)

## Calculation Formulas

- **WIN**: If position = 1, profit = stake × (price - 1), else loss = -stake
- **PLACE**: If position ≤ 3, profit = stake × ((price-1)/4), else loss = -stake
- **LAY**: If position = 1, loss = stake × (price - 1), else profit = stake

## Feedback System

The app includes a comprehensive feedback system:

- **User Feedback**: Users can submit feedback via:
  - The Feedback page in the navigation (`/dashboard/feedback`)
  - The floating feedback button (bottom right corner on all pages)
  
- **Feedback Types**: Bug Report, Feature Request, or General Feedback

- **Admin Access**: To access the admin feedback view (`/dashboard/admin/feedback`):
  1. Open `app/dashboard/admin/feedback/page.tsx`
  2. Update the `ADMIN_EMAIL` constant with your email address
  3. Only users with matching email can access the admin view

- **Database Setup**: Make sure to run `feedback-schema.sql` in Supabase SQL Editor after setting up the main schema

## Next Steps

1. Complete the Supabase setup (Steps 1-3 above, including feedback schema)
2. Update the admin email in `app/dashboard/admin/feedback/page.tsx`
3. Test the application locally
4. When ready, deploy to Vercel following the instructions in `project-steps.md`

## Deployment

See `project-steps.md` Step 13 for detailed deployment instructions to Vercel.

## License

MIT
