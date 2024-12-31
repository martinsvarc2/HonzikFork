import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

interface RankingUser {
  member_id: string;
  user_name: string;
  user_picture: string;
  points: number;
  unlocked_badges: string[];
  rank: number;
}

interface UserData extends RankingUser {
  team_id?: string;
  total_points: number;
  weekly_reset_at: string;
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

    // Get user's data and team_id
    const { rows: [userData] } = await pool.sql`
      SELECT * FROM user_achievements WHERE member_id = ${memberId};
    `;

    // Weekly rankings
    const { rows: weeklyRankings } = await pool.sql`
      SELECT 
        member_id, 
        user_name, 
        user_picture, 
        points,
        unlocked_badges,
        DENSE_RANK() OVER (ORDER BY points DESC) as rank
      FROM user_achievements 
      WHERE weekly_reset_at = ${userData?.weekly_reset_at}
      ORDER BY points DESC 
      LIMIT 10;
    ` as { rows: RankingUser[] };

    // All-time rankings
    const { rows: allTimeRankings } = await pool.sql`
      SELECT 
        member_id, 
        user_name, 
        user_picture, 
        total_points as points,
        unlocked_badges,
        DENSE_RANK() OVER (ORDER BY total_points DESC) as rank
      FROM user_achievements 
      ORDER BY total_points DESC 
      LIMIT 10;
    ` as { rows: RankingUser[] };

    // Team rankings (if team_id exists)
    let teamRankings: RankingUser[] = [];
    if (userData?.team_id) {
      const { rows } = await pool.sql`
        SELECT 
          member_id, 
          user_name, 
          user_picture, 
          total_points as points,
          unlocked_badges,
          DENSE_RANK() OVER (ORDER BY total_points DESC) as rank
        FROM user_achievements 
        WHERE team_id = ${userData.team_id}
        ORDER BY total_points DESC 
        LIMIT 10;
      ` as { rows: RankingUser[] };
      teamRankings = rows;
    }

    // Convert to const function expression
    const getUserRank = async (category: 'weekly' | 'allTime' | 'team'): Promise<number> => {
      if (!userData) return 0;

      let query;
      if (category === 'weekly') {
        query = await pool.sql`
          SELECT count(*) + 1 as rank
          FROM user_achievements
          WHERE points > ${userData.points}
          AND weekly_reset_at = ${userData.weekly_reset_at};
        `;
      } else if (category === 'allTime') {
        query = await pool.sql`
          SELECT count(*) + 1 as rank
          FROM user_achievements
          WHERE total_points > ${userData.total_points};
        `;
      } else {
        query = await pool.sql`
          SELECT count(*) + 1 as rank
          FROM user_achievements
          WHERE total_points > ${userData.total_points}
          AND team_id = ${userData.team_id};
        `;
      }
      return query.rows[0].rank;
    };

    // Add user to rankings if not present
    if (!weeklyRankings.find(r => r.member_id === memberId)) {
      const rank = await getUserRank('weekly');
      weeklyRankings.push({
        ...userData,
        rank,
        points: userData.points
      } as RankingUser);
    }

    if (!allTimeRankings.find(r => r.member_id === memberId)) {
      const rank = await getUserRank('allTime');
      allTimeRankings.push({
        ...userData,
        rank,
        points: userData.total_points
      } as RankingUser);
    }

    if (userData?.team_id && !teamRankings.find(r => r.member_id === memberId)) {
      const rank = await getUserRank('team');
      teamRankings.push({
        ...userData,
        rank,
        points: userData.total_points
      } as RankingUser);
    }

    return NextResponse.json({
      weeklyRankings,
      allTimeRankings,
      teamRankings,
      userData
    });

  } catch (error) {
    console.error('Error fetching league data:', error);
    return NextResponse.json({ error: 'Failed to fetch league data' }, { status: 500 });
  }
}