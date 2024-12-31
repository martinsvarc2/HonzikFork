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

    const { rows } = await pool.sql`
      SELECT improvement_1, improvement_2, improvement_3
      FROM improvements 
      WHERE member_id = ${memberId}
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({
        improvement_1: 'Investor should ask clearer questions on final terms and conditions',
        improvement_2: 'Clarify lease terms better with detailed explanations',
        improvement_3: 'Set a specific follow-up plan to keep hold times low and maintain engagement'
      });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error getting improvements:', error);
    return NextResponse.json({ error: 'Failed to get improvements' }, { status: 500 });
  }
}

// POST endpoint
export async function POST(request: Request) {
  try {
    const { memberId, improvements } = await request.json();
    
    if (!memberId || !improvements || !improvements.improvement_1 || !improvements.improvement_2 || !improvements.improvement_3) {
      return NextResponse.json({ error: 'Member ID and all three improvements required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    const { rows } = await pool.sql`
      INSERT INTO improvements (member_id, improvement_1, improvement_2, improvement_3)
      VALUES (${memberId}, ${improvements.improvement_1}, ${improvements.improvement_2}, ${improvements.improvement_3})
      ON CONFLICT (member_id) 
      DO UPDATE SET 
        improvement_1 = ${improvements.improvement_1},
        improvement_2 = ${improvements.improvement_2},
        improvement_3 = ${improvements.improvement_3},
        created_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating improvements:', error);
    return NextResponse.json({ error: 'Failed to update improvements' }, { status: 500 });
  }
}