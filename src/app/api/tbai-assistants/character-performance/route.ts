import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://app.trainedbyai.com',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

interface PerformanceMetrics {
  overall_performance: number;
  engagement: number;
  objection_handling: number;
  information_gathering: number;
  program_explanation: number;
  closing_skills: number;
  overall_effectiveness: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const characterName = searchParams.get('characterName');

    console.log('Received request with params:', { memberId, characterName });

    if (!memberId) {
      console.error('Missing required parameters');
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    console.log('Executing query with params:', { memberId, characterName });

    // Default values for performance metrics
    const defaultSettings = {
      past_calls_count: 3,
      overall_performance_goal: 50
    };

    // Get metrics based on past X calls
    const { rows } = await pool.sql`
      WITH recent_calls AS (
        SELECT *
        FROM character_interactions
        WHERE member_id = ${memberId}
          AND character_name = ${characterName}
        ORDER BY session_date DESC
        LIMIT ${defaultSettings.past_calls_count}
      )
      SELECT 
        ROUND(AVG(overall_performance)) as overall_performance,
        ROUND(AVG(engagement)) as engagement,
        ROUND(AVG(objection_handling)) as objection_handling,
        ROUND(AVG(information_gathering)) as information_gathering,
        ROUND(AVG(program_explanation)) as program_explanation,
        ROUND(AVG(closing_skills)) as closing_skills,
        ROUND(AVG(overall_effectiveness)) as overall_effectiveness,
        COUNT(*) as total_calls
      FROM recent_calls;
    `;

    return NextResponse.json(rows[0], { headers: corsHeaders() });
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get performance metrics' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      memberId,
      characterName,
      metrics
    }: {
      memberId: string;
      characterName: string;
      metrics: PerformanceMetrics;
    } = body;

    if (!memberId || !characterName || !metrics) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    // Insert new interaction
    await pool.sql`
      INSERT INTO character_interactions (
        member_id,
        character_name,
        overall_performance,
        engagement,
        objection_handling,
        information_gathering,
        program_explanation,
        closing_skills,
        overall_effectiveness
      ) VALUES (
        ${memberId},
        ${characterName},
        ${metrics.overall_performance},
        ${metrics.engagement},
        ${metrics.objection_handling},
        ${metrics.information_gathering},
        ${metrics.program_explanation},
        ${metrics.closing_skills},
        ${metrics.overall_effectiveness}
      )
    `;

    const pastCallsCount = 10; // Using default value since team settings are removed

    // Return updated metrics
    const { rows } = await pool.sql`
      WITH recent_calls AS (
        SELECT *
        FROM character_interactions
        WHERE member_id = ${memberId}
          AND character_name = ${characterName}
        ORDER BY session_date DESC
        LIMIT ${pastCallsCount}
      )
      SELECT 
        ROUND(AVG(overall_performance)) as overall_performance,
        ROUND(AVG(engagement)) as engagement,
        ROUND(AVG(objection_handling)) as objection_handling,
        ROUND(AVG(information_gathering)) as information_gathering,
        ROUND(AVG(program_explanation)) as program_explanation,
        ROUND(AVG(closing_skills)) as closing_skills,
        ROUND(AVG(overall_effectiveness)) as overall_effectiveness,
        COUNT(*) as total_calls
      FROM recent_calls;
    `;

    return NextResponse.json(rows[0], { headers: corsHeaders() });
  } catch (error) {
    console.error('Error recording interaction:', error);
    return NextResponse.json(
      { error: 'Failed to record interaction' },
      { status: 500, headers: corsHeaders() }
    );
  }
}