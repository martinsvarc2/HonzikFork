import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Validate request body
    const body = await req.json();
    const { memberId, characterName, teamId } = body;

    // Check for required fields
    if (!memberId || !characterName) {
      return NextResponse.json(
        { error: 'Missing required fields: memberId and characterName are required' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Call your database endpoint to reset metrics
    const resetResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/reset_character_metrics`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          member_id: memberId,
          character_name: characterName,
          team_id: teamId || null // Handle optional teamId
        })
      }
    );

    // Check for specific error status codes
    if (resetResponse.status === 404) {
      return NextResponse.json(
        { error: 'Character metrics not found' },
        { status: 404 }
      );
    }

    if (!resetResponse.ok) {
      const errorData = await resetResponse.text();
      console.error('Reset metrics failed:', errorData);
      throw new Error(`Failed to reset character metrics: ${errorData}`);
    }

    const data = await resetResponse.json();

    return NextResponse.json({
      success: true,
      data,
      message: 'Character metrics reset successfully'
    });

  } catch (error) {
    console.error('Error in reset-challenge:', error);
    
    // Determine if it's a known error type
    const errorMessage = error instanceof Error ? error.message : 'Failed to reset challenge';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false
      },
      { status: 500 }
    );
  }
}