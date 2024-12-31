import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';

interface CategoryScores {
  engagement: number;
  objection_handling: number;
  information_gathering: number;
  program_explanation: number;
  closing_skills: number;
  overall_effectiveness: number;
  overall_performance?: number;
  average_success: number;
}

interface CategoryFeedback {
  engagement: string;
  objection_handling: string;
  information_gathering: string;
  program_explanation: string;
  closing_skills: string;
  overall_effectiveness: string;
}

interface CallData {
  user_name: string;
  user_picture_url?: string;
  agent_name: string;
  agent_picture_url: string;
  call_recording_url: string;
  call_details: string;
  scores: CategoryScores;
  feedback?: CategoryFeedback;
  call_duration: number;
  power_moment?: string;
  call_notes?: string;
  level_up_1?: string;
  level_up_2?: string;
  level_up_3?: string; 
  call_transcript?: string;
  analysis?: CategoryAnalysis;
  strong_points_average_success?: string;
  areas_for_improvement_average_success?: string;
  engagement_strong_points?: string;
  engagement_areas_for_improvement?: string;
  objection_handling_strong_points?: string;
  objection_handling_areas_for_improvement?: string;
  information_gathering_strong_points?: string;
  information_gathering_areas_for_improvement?: string;
  program_explanation_strong_points?: string;
  program_explanation_areas_for_improvement?: string;
  closing_skills_strong_points?: string;
  closing_skills_areas_for_improvement?: string;
  overall_effectiveness_strong_points?: string;
  overall_effectiveness_areas_for_improvement?: string;
}

interface CategoryAnalysis {
  strong_points_average_success: string;
  areas_for_improvement_average_success: string;
  engagement_strong_points: string;
  engagement_areas_for_improvement: string;
  objection_handling_strong_points: string;
  objection_handling_areas_for_improvement: string;
  information_gathering_strong_points: string;
  information_gathering_areas_for_improvement: string;
  program_explanation_strong_points: string;
  program_explanation_areas_for_improvement: string;
  closing_skills_strong_points: string;
  closing_skills_areas_for_improvement: string;
  overall_effectiveness_strong_points: string;
  overall_effectiveness_areas_for_improvement: string;
}

export const GET = async (request: Request) => {
  const client = createClient();
  
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const latest = searchParams.get('latest');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    await client.connect();

    const query = latest 
      ? `
          SELECT *
          FROM call_logs 
          WHERE member_id = $1
          ORDER BY call_date DESC
          LIMIT 10
        `
      : `
          SELECT *
          FROM call_logs 
          WHERE member_id = $1
          ORDER BY call_date ASC
        `;

    const result = await client.query(query, [memberId]);
    const { rows } = result;

    const transformedRows = rows.map(row => ({
      id: row.id,
      call_number: row.call_number,
      user_name: row.user_name || '',
      user_picture_url: row.user_picture_url || '',
      agent_name: row.agent_name || '',
      agent_picture_url: row.agent_picture_url || '',
      call_date: row.call_date,
      call_recording_url: row.call_recording_url || '',
      call_details: row.call_details || '',
      call_duration: Number(row.call_duration) || 0,
      power_moment: row.power_moment || '',
      call_notes: row.call_notes || '',
      level_up_1: row.level_up_1 || '',
      level_up_2: row.level_up_2 || '',
      level_up_3: row.level_up_3 || '',
      call_transcript: row.call_transcript || '',
      strong_points_average_success: row.strong_points_average_success || '',
      areas_for_improvement_average_success: row.areas_for_improvement_average_success || '',
      engagement_strong_points: row.engagement_strong_points || '',
      engagement_areas_for_improvement: row.engagement_areas_for_improvement || '',
      objection_handling_strong_points: row.objection_handling_strong_points || '',
      objection_handling_areas_for_improvement: row.objection_handling_areas_for_improvement || '',
      information_gathering_strong_points: row.information_gathering_strong_points || '',
      information_gathering_areas_for_improvement: row.information_gathering_areas_for_improvement || '',
      program_explanation_strong_points: row.program_explanation_strong_points || '',
      program_explanation_areas_for_improvement: row.program_explanation_areas_for_improvement || '',
      closing_skills_strong_points: row.closing_skills_strong_points || '',
      closing_skills_areas_for_improvement: row.closing_skills_areas_for_improvement || '',
      overall_effectiveness_strong_points: row.overall_effectiveness_strong_points || '',
      overall_effectiveness_areas_for_improvement: row.overall_effectiveness_areas_for_improvement || '',
      scores: {
        engagement: Number(row.engagement_score) || 0,
        objection_handling: Number(row.objection_handling_score) || 0,
        information_gathering: Number(row.information_gathering_score) || 0,
        program_explanation: Number(row.program_explanation_score) || 0,
        closing_skills: Number(row.closing_skills_score) || 0,
        overall_effectiveness: Number(row.overall_effectiveness_score) || 0,
        overall_performance: Number(row.overall_performance) || 0,
        average_success: Number(row.average_success_score) || 0
      },
      feedback: {
        engagement: row.engagement_feedback || '',
        objection_handling: row.objection_handling_feedback || '',
        information_gathering: row.information_gathering_feedback || '',
        program_explanation: row.program_explanation_feedback || '',
        closing_skills: row.closing_skills_feedback || '',
        overall_effectiveness: row.overall_effectiveness_feedback || ''
      }
    }));

    return NextResponse.json(transformedRows);

  } catch (error: any) {
    console.error('Error getting call logs:', error);
    return NextResponse.json({ 
      error: 'Failed to get call logs',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  } finally {
    await client.end();
  }
}

export const POST = async (request: Request) => {
  const client = createClient();
  
  try {
    const { memberId, callData, updateLatestOnly }: { 
      memberId: string, 
      callData: CallData, 
      updateLatestOnly?: boolean 
    } = await request.json();
    
    if (!memberId || !callData) {
      return NextResponse.json({ error: 'Member ID and call data required' }, { status: 400 });
    }

    await client.connect();

    // If updateLatestOnly is true, only update analysis fields of the latest row
    if (updateLatestOnly) {
      // Get the latest row's ID
      const { rows: latestRow } = await client.query(
        `SELECT id 
         FROM call_logs 
         WHERE member_id = $1 
         ORDER BY call_date DESC 
         LIMIT 1`,
        [memberId]
      );

      if (latestRow.length === 0) {
        return NextResponse.json({ error: 'No existing call log found for this member' }, { status: 404 });
      }

      // Update only the analysis fields
      const { rows } = await client.query(
        `UPDATE call_logs
         SET 
          strong_points_average_success = COALESCE($1, strong_points_average_success),
          areas_for_improvement_average_success = COALESCE($2, areas_for_improvement_average_success),
          engagement_strong_points = COALESCE($3, engagement_strong_points),
          engagement_areas_for_improvement = COALESCE($4, engagement_areas_for_improvement),
          objection_handling_strong_points = COALESCE($5, objection_handling_strong_points),
          objection_handling_areas_for_improvement = COALESCE($6, objection_handling_areas_for_improvement),
          information_gathering_strong_points = COALESCE($7, information_gathering_strong_points),
          information_gathering_areas_for_improvement = COALESCE($8, information_gathering_areas_for_improvement),
          program_explanation_strong_points = COALESCE($9, program_explanation_strong_points),
          program_explanation_areas_for_improvement = COALESCE($10, program_explanation_areas_for_improvement),
          closing_skills_strong_points = COALESCE($11, closing_skills_strong_points),
          closing_skills_areas_for_improvement = COALESCE($12, closing_skills_areas_for_improvement),
          overall_effectiveness_strong_points = COALESCE($13, overall_effectiveness_strong_points),
          overall_effectiveness_areas_for_improvement = COALESCE($14, overall_effectiveness_areas_for_improvement)
         WHERE id = $15
         RETURNING *`,
        [
          callData.strong_points_average_success,
          callData.areas_for_improvement_average_success,
          callData.engagement_strong_points,
          callData.engagement_areas_for_improvement,
          callData.objection_handling_strong_points,
          callData.objection_handling_areas_for_improvement,
          callData.information_gathering_strong_points,
          callData.information_gathering_areas_for_improvement,
          callData.program_explanation_strong_points,
          callData.program_explanation_areas_for_improvement,
          callData.closing_skills_strong_points,
          callData.closing_skills_areas_for_improvement,
          callData.overall_effectiveness_strong_points,
          callData.overall_effectiveness_areas_for_improvement,
          latestRow[0].id
        ]
      );

      return NextResponse.json(rows[0]);
    }

    // If updateLatestOnly is false or undefined, create a new call log (existing functionality)
    const { rows: existingCalls } = await client.query(
      'SELECT COALESCE(MAX(call_number), 0) as max_call_number FROM call_logs WHERE member_id = $1',
      [memberId]
    );

    const nextCallNumber = parseInt(existingCalls[0].max_call_number) + 1;

    const { rows } = await client.query(
      `INSERT INTO call_logs (
        member_id,
        call_number,
        user_name,
        agent_name,
        agent_picture_url,
        user_picture_url,
        call_recording_url,
        call_details,
        call_duration,
        power_moment,
        call_notes,
        level_up_1,
        level_up_2,
        level_up_3,
        call_transcript,
        strong_points_average_success,
        areas_for_improvement_average_success,
        engagement_strong_points,
        engagement_areas_for_improvement,
        objection_handling_strong_points,
        objection_handling_areas_for_improvement,
        information_gathering_strong_points,
        information_gathering_areas_for_improvement,
        program_explanation_strong_points,
        program_explanation_areas_for_improvement,
        closing_skills_strong_points,
        closing_skills_areas_for_improvement,
        overall_effectiveness_strong_points,
        overall_effectiveness_areas_for_improvement,
        engagement_score,
        objection_handling_score,
        information_gathering_score,
        program_explanation_score,
        closing_skills_score,
        overall_effectiveness_score,
        overall_performance,
        average_success_score,
        engagement_feedback,
        objection_handling_feedback,
        information_gathering_feedback,
        program_explanation_feedback,
        closing_skills_feedback,
        overall_effectiveness_feedback
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43)
      RETURNING *`,
      [
        memberId,
        nextCallNumber,
        callData.user_name,
        callData.agent_name,
        callData.agent_picture_url,
        callData.user_picture_url,
        callData.call_recording_url,
        callData.call_details,
        callData.call_duration,
        callData.power_moment,
        callData.call_notes,
        callData.level_up_1,
        callData.level_up_2,
        callData.level_up_3,
        callData.call_transcript,
        callData.strong_points_average_success,
        callData.areas_for_improvement_average_success,
        callData.engagement_strong_points,
        callData.engagement_areas_for_improvement,
        callData.objection_handling_strong_points,
        callData.objection_handling_areas_for_improvement,
        callData.information_gathering_strong_points,
        callData.information_gathering_areas_for_improvement,
        callData.program_explanation_strong_points,
        callData.program_explanation_areas_for_improvement,
        callData.closing_skills_strong_points,
        callData.closing_skills_areas_for_improvement,
        callData.overall_effectiveness_strong_points,
        callData.overall_effectiveness_areas_for_improvement,
        callData.scores?.engagement,
        callData.scores?.objection_handling,
        callData.scores?.information_gathering,
        callData.scores?.program_explanation,
        callData.scores?.closing_skills,
        callData.scores?.overall_effectiveness,
        callData.scores?.overall_performance,
        callData.scores?.average_success,
        callData.feedback?.engagement,
        callData.feedback?.objection_handling,
        callData.feedback?.information_gathering,
        callData.feedback?.program_explanation,
        callData.feedback?.closing_skills,
        callData.feedback?.overall_effectiveness
      ]
    );

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Error handling call log:', error);
    return NextResponse.json({ 
      error: 'Failed to handle call log',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  } finally {
    await client.end();
  }
}

export const PUT = async (request: Request) => {
  const client = createClient();
  
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('id');
    const updateData = await request.json();

    if (!callId) {
      return NextResponse.json({ error: 'Call ID required' }, { status: 400 });
    }

    await client.connect();

    const { rows } = await client.query(
      `UPDATE call_logs
       SET 
        engagement_score = COALESCE($1, engagement_score),
        objection_handling_score = COALESCE($2, objection_handling_score),
        information_gathering_score = COALESCE($3, information_gathering_score),
        program_explanation_score = COALESCE($4, program_explanation_score),
        closing_skills_score = COALESCE($5, closing_skills_score),
        overall_effectiveness_score = COALESCE($6, overall_effectiveness_score),
        average_success_score = COALESCE($7, average_success_score),
        engagement_feedback = COALESCE($8, engagement_feedback),
        objection_handling_feedback = COALESCE($9, objection_handling_feedback),
        information_gathering_feedback = COALESCE($10, information_gathering_feedback),
        program_explanation_feedback = COALESCE($11, program_explanation_feedback),
        closing_skills_feedback = COALESCE($12, closing_skills_feedback),
        overall_effectiveness_feedback = COALESCE($13, overall_effectiveness_feedback),
        call_notes = COALESCE($14, call_notes),
        strong_points_average_success = COALESCE($15, strong_points_average_success),
        areas_for_improvement_average_success = COALESCE($16, areas_for_improvement_average_success),
        engagement_strong_points = COALESCE($17, engagement_strong_points),
        engagement_areas_for_improvement = COALESCE($18, engagement_areas_for_improvement),
        objection_handling_strong_points = COALESCE($19, objection_handling_strong_points),
        objection_handling_areas_for_improvement = COALESCE($20, objection_handling_areas_for_improvement),
        information_gathering_strong_points = COALESCE($21, information_gathering_strong_points),
        information_gathering_areas_for_improvement = COALESCE($22, information_gathering_areas_for_improvement),
        program_explanation_strong_points = COALESCE($23, program_explanation_strong_points),
        program_explanation_areas_for_improvement = COALESCE($24, program_explanation_areas_for_improvement),
        closing_skills_strong_points = COALESCE($25, closing_skills_strong_points),
        closing_skills_areas_for_improvement = COALESCE($26, closing_skills_areas_for_improvement),
        overall_effectiveness_strong_points = COALESCE($27, overall_effectiveness_strong_points),
        overall_effectiveness_areas_for_improvement = COALESCE($28, overall_effectiveness_areas_for_improvement)
       WHERE id = $29
       RETURNING *`,
      [
        updateData.scores?.engagement,
        updateData.scores?.objection_handling,
        updateData.scores?.information_gathering,
        updateData.scores?.program_explanation,
        updateData.scores?.closing_skills,
        updateData.scores?.overall_effectiveness,
        updateData.scores?.average_success,
        updateData.feedback?.engagement,
        updateData.feedback?.objection_handling,
        updateData.feedback?.information_gathering,
        updateData.feedback?.program_explanation,
        updateData.feedback?.closing_skills,
        updateData.feedback?.overall_effectiveness,
        updateData.call_notes,
        updateData.strong_points_average_success || null,
        updateData.areas_for_improvement_average_success || null,
        updateData.engagement_strong_points || null,
        updateData.engagement_areas_for_improvement || null,
        updateData.objection_handling_strong_points || null,
        updateData.objection_handling_areas_for_improvement || null,
        updateData.information_gathering_strong_points || null,
        updateData.information_gathering_areas_for_improvement || null,
        updateData.program_explanation_strong_points || null,
        updateData.program_explanation_areas_for_improvement || null,
        updateData.closing_skills_strong_points || null,
        updateData.closing_skills_areas_for_improvement || null,
        updateData.overall_effectiveness_strong_points || null,
        updateData.overall_effectiveness_areas_for_improvement || null,
        callId
      ]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Call log not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Error updating call log:', error);
    return NextResponse.json({ 
      error: 'Failed to update call log',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  } finally {
    await client.end();
  }
}

export const DELETE = async (request: Request) => {
  const client = createClient();
  
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('id');
    
    if (!callId) {
      return NextResponse.json({ error: 'Call ID required' }, { status: 400 });
    }

    await client.connect();

    const { rows } = await client.query(
      'DELETE FROM call_logs WHERE id = $1 RETURNING *',
      [callId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Call log not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting call log:', error);
    return NextResponse.json({ 
      error: 'Failed to delete call log',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  } finally {
    await client.end();
  }
}