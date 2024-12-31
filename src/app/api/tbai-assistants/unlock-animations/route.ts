import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://app.trainedbyai.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// Check if animation has been shown and unlock status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const characterName = searchParams.get('characterName');

    if (!memberId || !characterName) {
      return NextResponse.json(
        { error: 'Member ID and character name are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    const { rows } = await pool.sql`
      SELECT 
        EXISTS (
          SELECT 1 
          FROM unlock_animations_shown 
          WHERE member_id = ${memberId} 
          AND character_name = ${characterName}
        ) as shown,
        EXISTS (
          SELECT 1 
          FROM unlock_animations_shown 
          WHERE member_id = ${memberId} 
          AND character_name = ${characterName}
          AND unlocked = true
        ) as unlocked;
    `;

    return NextResponse.json({ 
      shown: rows[0].shown,
      unlocked: rows[0].unlocked
    }, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error checking animation status:', error);
    return NextResponse.json(
      { error: 'Failed to check animation status' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// Record that animation has been shown and character is unlocked
export async function POST(request: Request) {
  try {
    const { memberId, characterName } = await request.json();

    if (!memberId || !characterName) {
      return NextResponse.json(
        { error: 'Member ID and character name are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    await pool.sql`
      INSERT INTO unlock_animations_shown (member_id, character_name, unlocked)
      VALUES (${memberId}, ${characterName}, true)
      ON CONFLICT (member_id, character_name) 
      DO UPDATE SET unlocked = true;
    `;

    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error recording animation shown:', error);
    return NextResponse.json(
      { error: 'Failed to record animation shown' },
      { status: 500, headers: corsHeaders() }
    );
  }
}