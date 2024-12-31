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
    const { rows } = await client.query(
      'SELECT * FROM performance_goals WHERE team_id = $1 ORDER BY created_at DESC LIMIT 1',
      [teamId]
    );
    await client.end();
    
    if (!rows.length) {
      return NextResponse.json({
        overall_performance_goal: 50,
        number_of_calls_average: 3,
        team_id: teamId,
        created_at: new Date().toISOString()
      });
    }
    
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to load performance goals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teamId, overall_performance_goal, number_of_calls_average } = body;
    
    if (!teamId || overall_performance_goal === undefined || number_of_calls_average === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const client = await getDbClient();
    
    // First, delete any existing goals for this team to maintain only the latest
    await client.query(
      'DELETE FROM performance_goals WHERE team_id = $1',
      [teamId]
    );
    
    // Then insert the new goals
    const { rows } = await client.query(
      `INSERT INTO performance_goals 
       (team_id, overall_performance_goal, number_of_calls_average)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [teamId, overall_performance_goal, number_of_calls_average]
    );
    
    await client.end();
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to save performance goals' }, { status: 500 });
  }
}