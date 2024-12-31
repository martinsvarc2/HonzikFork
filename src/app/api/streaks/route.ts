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

    // Get all practice dates for the member
    const { rows } = await pool.sql`
      SELECT practice_date
      FROM practice_streaks
      WHERE member_id = ${memberId}
      ORDER BY practice_date DESC;
    `;

    const dates = rows.map(row => new Date(row.practice_date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    while (dates.some(date => date.toDateString() === checkDate.toDateString())) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate consistency for current month
    const currentMonthDates = dates.filter(date => 
      date.getMonth() === today.getMonth() && 
      date.getFullYear() === today.getFullYear()
    );

    const daysElapsedInMonth = today.getDate(); // This gives us the current day of the month
    const practicedDaysCount = currentMonthDates.length;
    const consistency = Math.round((practicedDaysCount / daysElapsedInMonth) * 100);

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const diff = Math.floor(
          (sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diff === 1) {
          tempStreak++;
        } else if (diff !== 0) {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Return the streak data
    const streakData = {
      current: currentStreak,
      consistency: `${consistency}%`,
      longest: longestStreak,
      dates: dates
    };

    return NextResponse.json(streakData);
  } catch (error) {
    console.error('Error getting practice streaks:', error);
    return NextResponse.json({ error: 'Failed to get practice streaks' }, { status: 500 });
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

    // Format today's date as YYYY-MM-DD
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    // Add today's practice record
    await pool.sql`
      INSERT INTO practice_streaks (member_id, practice_date)
      VALUES (${memberId}, ${formattedDate})
      ON CONFLICT (member_id, practice_date) DO NOTHING;
    `;

    // Return updated streak data
    const { rows } = await pool.sql`
      SELECT practice_date
      FROM practice_streaks
      WHERE member_id = ${memberId}
      ORDER BY practice_date DESC;
    `;

    return NextResponse.json({
      message: 'Practice recorded successfully',
      todayDate: formattedDate,
      practiceCount: rows.length
    });
  } catch (error) {
    console.error('Error recording practice:', error);
    return NextResponse.json({ error: 'Failed to record practice' }, { status: 500 });
  }
}