import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';

const getDbClient = async () => {
  const client = createClient();
  await client.connect();
  return client;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  
  if (!teamId) {
    return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
  }
  
  try {
    const client = await getDbClient();
    // This query already returns all fields including call_extend_allowed
    const { rows } = await client.query(
      'SELECT * FROM performance_goals WHERE team_id = $1 ORDER BY created_at DESC LIMIT 1',
      [teamId]
    );
    await client.end();
    return NextResponse.json(rows[0] || null);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to load performance goals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      teamId, 
      memberId,
      overall_performance_goal, 
      number_of_calls_average,
      call_length,
      call_extend_allowed  // Added this field
    } = body;
    
    if ((!teamId && !memberId) || overall_performance_goal === undefined || 
        number_of_calls_average === undefined || call_length === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await getDbClient();
    
    if (teamId) {
      await client.query(
        'DELETE FROM performance_goals WHERE team_id = $1',
        [teamId]
      );
    }

    // Updated query to include call_extend_allowed
    const { rows } = await client.query(
      `INSERT INTO performance_goals 
       (team_id, member_id, overall_performance_goal, number_of_calls_average, call_length, call_extend_allowed)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [teamId || null, memberId || null, overall_performance_goal, number_of_calls_average, call_length, call_extend_allowed]
    );
    
    await client.end();
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to save performance goals' }, { status: 500 });
  }
}