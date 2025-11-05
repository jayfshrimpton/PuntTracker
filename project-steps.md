Horse Racing Bet Tracker - Complete Build Guide for Cursor AI
Project Overview
A web application for tracking horse racing bets with user authentication, comprehensive statistics, and data visualizations. Built with Next.js, Supabase, and modern React components.

Technology Stack

Framework: Next.js 14 (App Router)
Database: Supabase (PostgreSQL)
Authentication: Supabase Auth
Styling: Tailwind CSS
Charts: Recharts
UI Components: shadcn/ui
Deployment: Vercel (free tier)


Project Checklist
Phase 1: Project Setup ✓

 Create Supabase account and project
 Initialize Next.js project in Cursor
 Install dependencies
 Configure environment variables
 Set up Supabase client

Phase 2: Database Schema ✓

 Create users table (handled by Supabase Auth)
 Create bets table with all required fields
 Set up Row Level Security (RLS) policies
 Test database connection

Phase 3: Authentication ✓

 Create login page
 Create signup page
 Implement Supabase Auth
 Add protected routes
 Create logout functionality

Phase 4: Core Features ✓

 Build bet entry form
 Create bet list view (spreadsheet-style)
 Implement CRUD operations (Create, Read, Update, Delete)
 Add form validation

Phase 5: Statistics & Calculations ✓

 Calculate monthly stats
 Calculate all-time stats
 Implement POT%, ROI%, strike rate
 Add turnover and P&L calculations
 Calculate streaks and averages

Phase 6: Dashboard & Visualizations ✓

 Create dashboard layout
 Add key metrics cards
 Build profit/loss line chart
 Add monthly comparison bar chart
 Create strike rate by bet type chart
 Add bet distribution pie chart

Phase 7: Polish & Mobile ✓

 Make fully responsive
 Add loading states
 Implement error handling
 Add date filtering
 Test on mobile devices

Phase 8: Deployment ✓

 Deploy to Vercel
 Test production build
 Share with initial users


Step-by-Step Instructions for Cursor AI
STEP 1: Create Supabase Project (Manual Setup)
Do this first before opening Cursor:

Go to supabase.com
Sign up for a free account
Click "New Project"
Fill in:

Name: "horse-bet-tracker"
Database Password: (create a strong password - save it!)
Region: Choose closest to you


Wait 2-3 minutes for project to be created
Once ready, go to Settings → API
Copy and save these two values:

Project URL (looks like: https://xxxxx.supabase.co)
anon public key (long string starting with eyJ...)




STEP 2: Initialize Project in Cursor
Open Cursor and use Composer (Cmd+I or Ctrl+I):
Create a new Next.js 14 project with TypeScript, Tailwind CSS, and App Router.
Name it "horse-bet-tracker".
Use the following structure:
- app directory for routes
- components directory for React components
- lib directory for utilities
- Install these additional dependencies:
  - @supabase/supabase-js
  - @supabase/auth-helpers-nextjs
  - recharts
  - date-fns
  - lucide-react (for icons)
After project is created, create a .env.local file:
Create a .env.local file with these environment variables:
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
Replace with your actual Supabase URL and key from Step 1.

STEP 3: Set Up Supabase Client
In Cursor Composer:
Create a Supabase client utility file at lib/supabase.ts that:
1. Imports @supabase/supabase-js
2. Creates and exports a Supabase client using the environment variables
3. Also create a server-side client for use in server components

STEP 4: Create Database Schema
Go back to Supabase Dashboard:

Click SQL Editor in left sidebar
Click New Query
Copy and paste this SQL:

sql-- Create bets table
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

Click Run to execute the SQL
You should see "Success. No rows returned"


STEP 5: Build Authentication Pages
In Cursor Composer:
Create a complete authentication system:

1. Create app/login/page.tsx with:
   - Email and password form
   - Sign in with Supabase Auth
   - Link to signup page
   - Error handling
   - Redirect to dashboard on success

2. Create app/signup/page.tsx with:
   - Email and password signup form
   - Password confirmation
   - Sign up with Supabase Auth
   - Link to login page
   - Success message and redirect

3. Create a middleware.ts file in the root that:
   - Protects routes requiring authentication
   - Redirects unauthenticated users to /login
   - Allows access to /login and /signup without auth

4. Use Tailwind CSS for modern, clean styling
5. Make forms fully responsive for mobile

STEP 6: Create Dashboard Layout
In Cursor Composer:
Create the main dashboard layout at app/dashboard/layout.tsx with:
1. Top navigation bar with:
   - App title "Horse Bet Tracker"
   - User email display
   - Logout button
2. Side navigation for desktop (hamburger menu for mobile) with links to:
   - Dashboard (/)
   - Enter Bets (/dashboard/bets)
3. Main content area for child pages
4. Responsive design - sidebar collapses to hamburger on mobile
5. Use lucide-react for icons

STEP 7: Build Bet Entry Form
In Cursor Composer:
Create app/dashboard/bets/page.tsx with:

1. A form at the top for entering new bets with fields:
   - Race Name (text input)
   - Horse Name (text input)
   - Bet Type (dropdown: Win, Place, Lay)
   - Price/Odds (number input, e.g., 5.50)
   - Stake (number input in dollars)
   - Finishing Position (number input, optional until race completes)
   - Date (date picker, defaults to today)
   - For LAY bets, show additional help text explaining liability

2. Auto-calculate Profit/Loss when finishing position is entered:
   - WIN: If position = 1, profit = stake * (price - 1), else loss = -stake
   - PLACE: If position ≤ 3, profit = stake * ((price-1)/4), else loss = -stake
   - LAY: If position = 1, loss = stake * (price - 1), else profit = stake

3. Submit button that saves to Supabase

4. Below the form, display all bets in a table/spreadsheet view with columns:
   - Date
   - Race
   - Horse
   - Type
   - Odds
   - Stake
   - Position
   - P&L
   - Actions (Edit, Delete buttons)

5. Make table sortable by date (newest first by default)
6. Add pagination if more than 50 bets
7. Make table responsive - scroll horizontally on mobile if needed
8. Add inline editing capability
9. Show monthly totals above the table

Include proper error handling and loading states.

STEP 8: Create Statistics Calculation Module
In Cursor Composer:
Create lib/stats.ts with functions to calculate:

1. calculateMonthlyStats(bets) - returns object with:
   - totalStake (turnover)
   - totalProfit (sum of all P&L)
   - totalBets (count)
   - winningBets (count where P&L > 0)
   - losingBets (count where P&L < 0)
   - strikeRate (winningBets / totalBets * 100)
   - pot (totalProfit / totalStake * 100)
   - roi (totalProfit / totalStake * 100)
   - averageOdds
   - averageStake
   - bestWin (largest single profit)
   - worstLoss (largest single loss)
   - currentStreak (current winning/losing streak)
   - longestWinStreak
   - longestLoseStreak

2. groupBetsByMonth(bets) - groups bets by month/year

3. calculateStatsByBetType(bets) - breaks down stats by Win/Place/Lay

4. getProfitLossTimeSeries(bets) - returns data for line chart
   - Cumulative P&L over time

5. Handle edge cases (no bets, division by zero, etc.)

Include TypeScript types for all functions.

STEP 9: Build Dashboard Home Page
In Cursor Composer:
Create app/dashboard/page.tsx as the main dashboard with:

1. Header showing current month and year
2. Date range selector (All Time, This Month, Last Month, Custom Range)

3. Top section - Key Metrics Cards (4 cards in a row, stack on mobile):
   - Total Profit/Loss (with color: green if positive, red if negative)
   - Strike Rate %
   - POT (Profit on Turnover) %
   - Total Turnover

4. Second row - Additional Metrics Cards:
   - Total Bets
   - Average Odds
   - Current Streak
   - Best Win

5. Visualizations section with:
   
   A. Profit/Loss Over Time (Line Chart)
   - X-axis: Date
   - Y-axis: Cumulative P&L
   - Show trend line
   - Color area under line (green for profit, red for loss)
   
   B. Monthly Comparison (Bar Chart)
   - Last 6 months
   - Show profit for each month
   - Color bars (green/red)
   
   C. Strike Rate by Bet Type (Bar Chart)
   - Win, Place, Lay
   - Show percentage for each
   
   D. Bet Distribution (Pie Chart)
   - Breakdown of Win/Place/Lay bets by count
   
   E. ROI Trend (Line Chart)
   - Monthly ROI percentage over time

6. Use Recharts for all visualizations
7. Make all charts responsive
8. Show "No data available" message if no bets exist
9. Add loading skeletons while data is being fetched
10. Fetch bet data from Supabase on page load

Style everything with Tailwind CSS, use a clean modern design.

STEP 10: Implement Data Fetching
In Cursor Composer:
Create API functions in lib/api.ts for:

1. fetchUserBets(userId, dateRange?) - gets all bets for user
2. createBet(betData) - inserts new bet
3. updateBet(betId, betData) - updates existing bet
4. deleteBet(betId) - deletes bet

Handle errors properly and return typed results.

Then update the dashboard and bets pages to:
- Use React hooks (useState, useEffect) to fetch data
- Show loading states
- Display errors to users
- Refresh data after mutations (create/update/delete)

STEP 11: Add Mobile Responsiveness
In Cursor Composer:
Review all pages and components to ensure:
1. Navigation collapses to hamburger menu on mobile
2. Stats cards stack vertically on small screens
3. Charts resize properly on mobile
4. Bet entry form is easy to use on mobile (large touch targets)
5. Table scrolls horizontally if needed
6. Use Tailwind breakpoints (sm:, md:, lg:) throughout
7. Test with Chrome DevTools mobile view

Make any necessary adjustments for better mobile UX.

STEP 12: Polish & Error Handling
In Cursor Composer:
Add final touches:
1. Add toast notifications for success/error messages (you can use a simple toast library or create custom)
2. Add confirmation dialog before deleting bets
3. Improve form validation with helpful error messages
4. Add empty states with helpful messages
5. Ensure all buttons have hover states
6. Add loading spinners where appropriate
7. Check for any console errors and fix
8. Test all CRUD operations thoroughly

STEP 13: Deploy to Vercel
Manual steps:

Push your code to GitHub:

Create a new repository on GitHub
In Cursor terminal:



     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin your-repo-url
     git push -u origin main

Go to vercel.com
Sign up/login (you can use GitHub)
Click "New Project"
Import your GitHub repository
Configure:

Framework Preset: Next.js (auto-detected)
Add Environment Variables:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY




Click "Deploy"
Wait 2-3 minutes
Your app is live! You'll get a URL like your-app.vercel.app


Testing Checklist
After deployment, test these flows:

 Sign up new account
 Login with account
 Add a new bet
 Edit a bet
 Delete a bet
 View dashboard stats
 Check charts render correctly
 Test on mobile device
 Logout and login again
 Create second test account to verify data isolation