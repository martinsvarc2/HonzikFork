import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { memberId, characterName } = await req.json();

    if (!memberId || !characterName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/mark_challenge_complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          member_id: memberId,
          character_name: characterName,
          completed_at: new Date().toISOString()
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark challenge as complete');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking challenge complete:', error);
    return NextResponse.json(
      { error: 'Failed to mark challenge as complete' },
      { status: 500 }
    );
  }
}