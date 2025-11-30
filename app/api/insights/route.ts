import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const { message: question } = await request.json(); // Map 'message' from frontend to 'question'

        if (!question) {
            return NextResponse.json(
                { error: 'Question is required' },
                { status: 400 }
            );
        }

        // Get user from session
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch user's bets
        const { data: bets, error: betsError } = await supabase
            .from('bets')
            .select('*')
            .eq('user_id', user.id)
            .order('bet_date', { ascending: false });

        if (betsError) {
            console.error('Error fetching bets:', betsError);
            return NextResponse.json(
                { error: 'Failed to fetch betting data' },
                { status: 500 }
            );
        }

        // Check if user has enough data
        if (!bets || bets.length < 5) { // Kept at 5 as per previous logic, user code said 10 but 5 is friendlier for testing
            return NextResponse.json({
                message: "I need at least 5 bets tracked to provide meaningful insights. Keep logging your bets and check back soon! 🐴",
                needsMoreData: true
            });
        }

        // Calculate basic stats for context
        const totalBets = bets.length;
        const totalStake = bets.reduce((sum, bet) => sum + (Number(bet.stake) || 0), 0);
        const totalPL = bets.reduce((sum, bet) => sum + (Number(bet.profit_loss) || 0), 0);
        const winners = bets.filter(bet => (Number(bet.profit_loss) || 0) > 0).length;
        const strikeRate = ((winners / totalBets) * 100).toFixed(1);
        const roi = totalStake > 0 ? ((totalPL / totalStake) * 100).toFixed(1) : '0.0';

        // Group by bet type
        const betTypeStats = bets.reduce((acc: any, bet) => {
            const type = bet.bet_type || 'unknown';
            if (!acc[type]) {
                acc[type] = { count: 0, stake: 0, pl: 0, winners: 0 };
            }
            acc[type].count += 1;
            acc[type].stake += Number(bet.stake) || 0;
            acc[type].pl += Number(bet.profit_loss) || 0;
            acc[type].winners += (Number(bet.profit_loss) || 0) > 0 ? 1 : 0;
            return acc;
        }, {});

        // Create context for Gemini
        const context = {
            totalBets,
            totalStake: totalStake.toFixed(2),
            totalPL: totalPL.toFixed(2),
            strikeRate,
            roi,
            betTypeStats,
            recentBets: bets.slice(0, 20).map(bet => ({
                type: bet.bet_type,
                odds: bet.price,
                stake: bet.stake,
                result: bet.profit_loss,
                date: bet.bet_date
            }))
        };

        // Create prompt for Gemini
        const prompt = `You are a professional Australian horse racing betting analyst. You're helping a punter improve their betting performance.

Here is their betting data:
- Total bets: ${totalBets}
- Strike rate: ${strikeRate}%
- ROI: ${roi}%
- Total P&L: $${totalPL.toFixed(2)}
- Total staked: $${totalStake.toFixed(2)}

Bet type breakdown:
${Object.entries(betTypeStats).map(([type, stats]: [string, any]) =>
            `${type}: ${stats.count} bets, ${((stats.winners / stats.count) * 100).toFixed(1)}% strike rate, $${stats.pl.toFixed(2)} P&L`
        ).join('\n')}

Recent Bets (Last 20):
${context.recentBets.map(bet =>
            `- ${bet.date}: ${bet.type} @ $${bet.odds} (Stake: $${bet.stake}, P&L: $${bet.result})`
        ).join('\n')}

User's question: "${question}"

Provide a clear, conversational answer based on their actual data. Use specific numbers and percentages. Give actionable recommendations where relevant. Keep it concise (2-3 paragraphs max). Use Aussie racing terminology where appropriate.

If you identify clear patterns or problems, highlight them. Be honest but encouraging.

IMPORTANT: You can optionally return a JSON object for visualization.
      If a chart or comparison would help, format your response as a JSON object with two fields:
      1. "message": Your text response (markdown supported).
      2. "chartData": An object with "type" and "props".
         - type: "comparison" | "trend" | "breakdown" | "recommendation"
         - props: matching the component props.
      
      If no chart is needed, just return the plain text response string (not JSON).

      CRITICAL: If you return JSON, do NOT include any text outside the JSON block. Return ONLY the JSON object. Do not wrap it in markdown code blocks like \`\`\`json ... \`\`\`. Just the raw JSON.
      
      Component Schemas:
      - breakdown: { data: [{ type: string, count: number, strikeRate: number, roi: number, profit: number }] }
      - comparison: { label: string, value1: { label: string, value: string, trend: 'up'|'down'|'neutral' }, value2: { label: string, value: string, trend: 'up'|'down'|'neutral' } }
      - recommendation: { type: 'keep'|'change'|'try', title: string, description: string }
      - trend: { title: string, data: [{ date: string, value: number }] }`;

        // Call Gemini API - Using gemini-1.5-flash as it's the most reliable current model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Try to parse as JSON, otherwise return as text
        try {
            // Clean up potential markdown code blocks
            const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
            const jsonResponse = JSON.parse(cleanText);
            return NextResponse.json(jsonResponse);
        } catch {
            return NextResponse.json({ message: text });
        }

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate insights' },
            { status: 500 }
        );
    }
}
