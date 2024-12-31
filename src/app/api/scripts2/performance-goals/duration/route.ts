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
  const memberId = searchParams.get('memberId');

  // Handle cases where teamId is empty string or null
  const hasValidTeamId = teamId && teamId.trim().length > 0;
  
  if (!hasValidTeamId && !memberId) {
    return NextResponse.json({ call_length: 10 });
  }

  try {
    const client = await getDbClient();
    
    // Only try teamId if it's a non-empty string
    if (hasValidTeamId) {
      const { rows } = await client.query(
        'SELECT call_length FROM performance_goals WHERE team_id = $1 LIMIT 1',
        [teamId]
      );
      
      if (rows.length > 0) {
        await client.end();
        return NextResponse.json({ call_length: rows[0].call_length });
      }
    }
    
    // If we get here, either teamId was empty/invalid or no results were found
    // Try memberId if available
    if (memberId) {
      const { rows } = await client.query(
        'SELECT call_length FROM performance_goals WHERE member_id = $1 LIMIT 1',
        [memberId]
      );
      await client.end();
      return NextResponse.json({ 
        call_length: rows.length > 0 ? rows[0].call_length : 10 
      });
    }

    await client.end();
    return NextResponse.json({ call_length: 10 });

  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ call_length: 10 });
  }
}