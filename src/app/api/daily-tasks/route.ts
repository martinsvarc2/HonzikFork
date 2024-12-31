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
      SELECT task_1, task_2, task_3
      FROM daily_tasks 
      WHERE member_id = ${memberId}
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({
        task_1: 'Complete a roleplay scenario from each category',
        task_2: 'Review the Call Records section and listen to your recordings',
        task_3: 'Design your vision board'
      });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error getting daily tasks:', error);
    return NextResponse.json({ error: 'Failed to get daily tasks' }, { status: 500 });
  }
}

// POST endpoint
export async function POST(request: Request) {
  try {
    const { memberId, tasks } = await request.json();
    
    if (!memberId || !tasks || !tasks.task_1 || !tasks.task_2 || !tasks.task_3) {
      return NextResponse.json({ error: 'Member ID and all three tasks required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    const { rows } = await pool.sql`
      INSERT INTO daily_tasks (member_id, task_1, task_2, task_3)
      VALUES (${memberId}, ${tasks.task_1}, ${tasks.task_2}, ${tasks.task_3})
      ON CONFLICT (member_id) 
      DO UPDATE SET 
        task_1 = ${tasks.task_1},
        task_2 = ${tasks.task_2},
        task_3 = ${tasks.task_3},
        created_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating daily tasks:', error);
    return NextResponse.json({ error: 'Failed to update daily tasks' }, { status: 500 });
  }
}