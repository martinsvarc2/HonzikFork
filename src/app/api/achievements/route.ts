import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { ACHIEVEMENTS } from '@/lib/achievement-data';

interface ChartDataPoint {
  day: string;
  date: string;
  you: number;
}

// Date helpers
function getNextSunday(date: Date = new Date()) {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  const dayOfWeek = newDate.getDay();
  const daysUntilNextSunday = 7 - dayOfWeek;
  newDate.setDate(newDate.getDate() + daysUntilNextSunday);
  return newDate;
}

function getDayKey(date: Date) {
  return date.toISOString().split('T')[0];
}

function calculateWeeklyTotal(daily_points: Record<string, number>, weekly_reset_at: string) {
  const resetDate = new Date(weekly_reset_at);
  const nextSunday = getNextSunday(resetDate);
  
  return Object.entries(daily_points || {}).reduce((total, [date, points]) => {
    const pointDate = new Date(date);
    if (pointDate >= resetDate && pointDate < nextSunday) {
      return total + (points || 0);
    }
    return total;
  }, 0);
}

export async function POST(request: Request) {
  try {
    const { memberId, userName, userPicture, teamId, points } = await request.json();
    
    if (!memberId || !userName) {
      return NextResponse.json({ error: 'Member ID and username required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = getDayKey(today);

    // Get existing user data
    const { rows: [existingUser] } = await pool.sql`
      SELECT * FROM user_achievements 
      WHERE member_id = ${memberId};
    `;

    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getDayKey(yesterday);
    const todayStr = getDayKey(today);

    const current_streak = existingUser?.last_session_date === todayStr ? 
      (existingUser.current_streak || 1) : 
      (existingUser?.last_session_date === yesterdayStr ? (existingUser.current_streak || 0) + 1 : 1);
    
    const longest_streak = Math.max(current_streak, existingUser?.longest_streak || 0);

    // Update points and sessions
    const current_daily_points = {
      ...existingUser?.daily_points,
      [todayKey]: (parseFloat(existingUser?.daily_points?.[todayKey] || '0') + parseFloat(points))
    };

    const total_sessions = (existingUser?.total_sessions || 0) + 1;
    const sessions_today = existingUser?.last_session_date === todayStr ? 
      (existingUser?.sessions_today || 0) + 1 : 1;
    const sessions_this_week = (existingUser?.sessions_this_week || 0) + 1;

    // Handle badges
    let unlocked_badges = Array.isArray(existingUser?.unlocked_badges) 
      ? [...existingUser.unlocked_badges] 
      : [];

    if (current_streak >= 5) unlocked_badges = addBadge(unlocked_badges, 'streak_5');
    if (current_streak >= 10) unlocked_badges = addBadge(unlocked_badges, 'streak_10');
    if (current_streak >= 30) unlocked_badges = addBadge(unlocked_badges, 'streak_30');
    if (current_streak >= 90) unlocked_badges = addBadge(unlocked_badges, 'streak_90');
    if (current_streak >= 180) unlocked_badges = addBadge(unlocked_badges, 'streak_180');
    if (current_streak >= 365) unlocked_badges = addBadge(unlocked_badges, 'streak_365');

    if (total_sessions >= 10) unlocked_badges = addBadge(unlocked_badges, 'calls_10');
    if (total_sessions >= 25) unlocked_badges = addBadge(unlocked_badges, 'calls_25');
    if (total_sessions >= 50) unlocked_badges = addBadge(unlocked_badges, 'calls_50');
    if (total_sessions >= 100) unlocked_badges = addBadge(unlocked_badges, 'calls_100');

   const weekly_reset_at = getNextSunday().toISOString();

    // Update user data
    const { rows: [updated] } = await pool.sql`
      INSERT INTO user_achievements (
        member_id, user_name, user_picture, team_id,
        current_streak, longest_streak, total_sessions,
        sessions_today, sessions_this_week,
        last_session_date, unlocked_badges,
        weekly_reset_at, daily_points
      ) VALUES (
        ${memberId}, ${userName}, ${userPicture}, ${teamId},
        ${current_streak}, ${longest_streak}, ${total_sessions},
        ${sessions_today}, ${sessions_this_week},
        ${todayStr}, ${JSON.stringify(unlocked_badges)},
        ${weekly_reset_at}, ${JSON.stringify(current_daily_points)}
      )
      ON CONFLICT (member_id) DO UPDATE SET
        user_name = EXCLUDED.user_name,
        user_picture = COALESCE(${userPicture}, user_achievements.user_picture),
        team_id = EXCLUDED.team_id,
        current_streak = EXCLUDED.current_streak,
        longest_streak = EXCLUDED.longest_streak,
        total_sessions = user_achievements.total_sessions + 1,
        sessions_today = EXCLUDED.sessions_today,
        sessions_this_week = EXCLUDED.sessions_this_week,
        last_session_date = EXCLUDED.last_session_date,
        unlocked_badges = EXCLUDED.unlocked_badges,
        daily_points = EXCLUDED.daily_points,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const weeklyTotal = calculateWeeklyTotal(current_daily_points, weekly_reset_at);

    return NextResponse.json({
      ...updated,
      weeklyTotal
    });

  } catch (error) {
    console.error('Error updating achievements:', error);
    return NextResponse.json({ error: 'Failed to update achievements' }, { status: 500 });
  }
}

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

    // Get user data
    const { rows: [userData] } = await pool.sql`
      SELECT * FROM user_achievements WHERE member_id = ${memberId};
    `;

    if (!userData) {
  return NextResponse.json({
    streakAchievements: ACHIEVEMENTS.streak.map(badge => ({
      ...badge,
      unlocked: false
    })),
    callAchievements: ACHIEVEMENTS.calls.map(badge => ({
      ...badge,
      unlocked: false
    })),
    activityAchievements: ACHIEVEMENTS.activity.map(badge => ({
      ...badge,
      unlocked: false
    })),
    leagueAchievements: ACHIEVEMENTS.league.map(badge => ({
      ...badge,
      unlocked: false
    })),
    userData: {
      member_id: memberId,
      current_streak: 0,
      longest_streak: 0,
      total_sessions: 0,
      sessions_today: 0,
      sessions_this_week: 0,
      last_session_date: null,
      unlocked_badges: [],
      weekly_reset_at: getNextSunday().toISOString(),
      daily_points: {},
      weeklyTotal: 0
    },
    weeklyRankings: [],
    teamRankings: [],
    chartData: []
  });
}

    // Calculate chart data
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = getNextSunday(weekStart);

    // Get daily points and sort chronologically
const dailyPoints = Object.entries(userData.daily_points || {})
  .filter(([date]) => {
    const pointDate = new Date(date);
    return pointDate >= weekStart && pointDate < weekEnd;
  })
  .map(([date, points]) => ({
    date,
    points: Number(points) || 0
  }))
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

// Use actual daily points instead of running total
const chartData = dailyPoints.reduce((acc, { date, points }, index) => {
  const cumulativePoints = dailyPoints
    .slice(0, index + 1)
    .reduce((sum, dp) => sum + dp.points, 0);

  acc.push({
    day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
    date,
    you: cumulativePoints
  });

  return acc;
}, [] as Array<{day: string; date: string; you: number}>);

    // Map achievements
    const achievementsData = {
      streakAchievements: ACHIEVEMENTS.streak.map(badge => ({
        ...badge,
        unlocked: userData.unlocked_badges?.includes(`streak_${badge.target}`) || false
      })),
      callAchievements: ACHIEVEMENTS.calls.map(badge => ({
        ...badge,
        unlocked: userData.unlocked_badges?.includes(`calls_${badge.target}`) || false
      })),
      activityAchievements: ACHIEVEMENTS.activity.map(badge => ({
        ...badge,
        unlocked: userData.unlocked_badges?.includes(badge.id) || false
      })),
      leagueAchievements: ACHIEVEMENTS.league.map(badge => ({
        ...badge,
        unlocked: userData.unlocked_badges?.includes(badge.id) || false
      }))
    };

    // Get weekly rankings
    const { rows: weeklyRankings } = await pool.sql`
  WITH weekly_totals AS (
    SELECT 
      ua.member_id, 
      ua.user_name, 
      ua.user_picture, 
      ua.unlocked_badges,
      (
        SELECT COALESCE(SUM(value::numeric), 0)
        FROM jsonb_each_text(ua.daily_points)
        WHERE key::date >= ${weekStart.toISOString()}::date
          AND key::date <= CURRENT_DATE
      ) as points
    FROM user_achievements ua
    WHERE weekly_reset_at = ${getNextSunday().toISOString()}
  )
  SELECT 
    member_id, 
    user_name, 
    user_picture, 
    points, 
    unlocked_badges,
    RANK() OVER (ORDER BY points DESC NULLS LAST) as rank
  FROM weekly_totals
  WHERE points > 0
  ORDER BY points DESC 
  LIMIT 10;
`;

    // Get team rankings if team exists
const { rows: teamRankings } = await pool.sql`
  WITH team_totals AS (
    SELECT 
      ua.member_id, 
      ua.user_name, 
      ua.user_picture, 
      ua.unlocked_badges,
      (
        SELECT COALESCE(SUM(value::numeric), 0)
        FROM jsonb_each_text(ua.daily_points)
        WHERE key::date >= ${weekStart.toISOString()}::date
          AND key::date <= CURRENT_DATE
      ) as points
    FROM user_achievements ua
    WHERE ua.team_id = ${userData?.team_id}
    AND ua.weekly_reset_at = ${getNextSunday().toISOString()}
  )
  SELECT 
    member_id, 
    user_name, 
    user_picture, 
    points, 
    unlocked_badges,
    RANK() OVER (ORDER BY points DESC NULLS LAST) as rank
  FROM team_totals
  WHERE points > 0
  ORDER BY points DESC 
  LIMIT 10;
`;

    return NextResponse.json({
      ...achievementsData,
      userData: {
        ...userData,
        weeklyTotal: calculateWeeklyTotal(userData.daily_points, userData.weekly_reset_at)
      },
      weeklyRankings,
      teamRankings,
      chartData
    });

  } catch (error) {
    console.error('Error getting achievements:', error);
    return NextResponse.json({ error: 'Failed to get achievements' }, { status: 500 });
  }
}

function addBadge(badges: string[], newBadge: string): string[] {
  return badges.includes(newBadge) ? badges : [...badges, newBadge];
}

export type { ChartDataPoint };