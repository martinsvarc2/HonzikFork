import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');
    const characterName = searchParams.get('characterName');

    if (!memberId || !characterName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Call your database to check if the challenge was completed
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/check_completion_status`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          member_id: memberId,
          character_name: characterName
        })
      }
    );

    const data = await response.json();
    return NextResponse.json({ isCompleted: Boolean(data.is_completed) });
  } catch (error) {
    console.error('Error checking challenge completion:', error);
    return NextResponse.json(
      { error: 'Failed to check challenge completion' },
      { status: 500 }
    );
  }
}