import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET endpoint
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const yearStart = new Date(today.getFullYear(), 0, 1);

    // Format dates as ISO strings
    const todayStr = today.toISOString();
    const weekAgoStr = weekAgo.toISOString();
    const monthStartStr = monthStart.toISOString();
    const yearStartStr = yearStart.toISOString();

    // Get all counts in a single query
    const { rows } = await pool.sql`
      SELECT 
        COUNT(*) FILTER (WHERE session_date >= ${todayStr}::timestamp) as today_count,
        COUNT(*) FILTER (WHERE session_date >= ${weekAgoStr}::timestamp) as week_count,
        COUNT(*) FILTER (WHERE session_date >= ${monthStartStr}::timestamp) as month_count,
        COUNT(*) FILTER (WHERE session_date >= ${yearStartStr}::timestamp) as year_count
      FROM activity_sessions 
      WHERE member_id = ${memberId};
    `;

    const counts = rows[0];
    
    return NextResponse.json({
      today: parseInt(counts.today_count),
      week: parseInt(counts.week_count),
      month: parseInt(counts.month_count),
      year: parseInt(counts.year_count)
    });
  } catch (error) {
    console.error('Error getting activity sessions:', error);
    return NextResponse.json({ error: 'Failed to get activity sessions' }, { status: 500 });
  }
}

// POST endpoint
export async function POST(request: Request) {
  try {
    const { memberId } = await request.json();
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Add new session
    await pool.sql`
      INSERT INTO activity_sessions (member_id)
      VALUES (${memberId});
    `;

    // Get updated counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const yearStart = new Date(today.getFullYear(), 0, 1);

    // Format dates as ISO strings
    const todayStr = today.toISOString();
    const weekAgoStr = weekAgo.toISOString();
    const monthStartStr = monthStart.toISOString();
    const yearStartStr = yearStart.toISOString();

    const { rows } = await pool.sql`
      SELECT 
        COUNT(*) FILTER (WHERE session_date >= ${todayStr}::timestamp) as today_count,
        COUNT(*) FILTER (WHERE session_date >= ${weekAgoStr}::timestamp) as week_count,
        COUNT(*) FILTER (WHERE session_date >= ${monthStartStr}::timestamp) as month_count,
        COUNT(*) FILTER (WHERE session_date >= ${yearStartStr}::timestamp) as year_count
      FROM activity_sessions 
      WHERE member_id = ${memberId};
    `;

    const counts = rows[0];
    
    return NextResponse.json({
      today: parseInt(counts.today_count),
      week: parseInt(counts.week_count),
      month: parseInt(counts.month_count),
      year: parseInt(counts.year_count)
    });
  } catch (error) {
    console.error('Error recording activity session:', error);
    return NextResponse.json({ error: 'Failed to record activity session' }, { status: 500 });
  }
}