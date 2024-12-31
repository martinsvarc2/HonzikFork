import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');        
    const memberId = searchParams.get('memberId');
    
    console.log('API GET Request received:', {
      url: request.url,
      teamId,
      memberId
    });

  if (memberId) {
      console.log('Executing single user query with:', { memberId, teamId });
      const { rows } = await sql`
        SELECT * FROM user_credits 
        WHERE member_id = ${memberId} 
        AND team_id = ${teamId}
      `;
      console.log('Single user query result:', rows);

      // Then continue with your original logic
      return NextResponse.json({ credits: rows[0]?.credits || 0 });
    }

    // Otherwise get all team members
    const { rows } = await sql`
      SELECT 
        uc.*,
        CASE 
          WHEN uc.last_monthly_credit_date IS NULL 
          OR uc.last_monthly_credit_date < DATE_TRUNC('month', CURRENT_TIMESTAMP)
          THEN true
          ELSE false
        END as needs_monthly_credits
      FROM user_credits uc
      WHERE team_id = ${teamId}
      ORDER BY user_name ASC;
    `;
    return NextResponse.json({ users: rows });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { action } = data;

    switch (action) {
      case 'ADD_CREDITS':
        return handleAddCredits(data);
      case 'REMOVE_CREDITS':
        return handleRemoveCredits(data, request);
      case 'ADD_DIRECT_CREDITS': 
        return handleAddDirectCredits(data);
      case 'UPDATE_MONTHLY_CREDITS':
        return handleUpdateMonthlyCredits(data);
      case 'REMOVE_USER':
        return handleRemoveUser(data);
      case 'CREATE_USER':
        return handleCreateUser(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

async function handleAddCredits(data: any) {
  const { fromMemberId, toMemberId, teamId, amount } = data;
  
  try {
    // Check if sender has enough credits
    const { rows: [sender] } = await sql`
      SELECT credits FROM user_credits 
      WHERE member_id = ${fromMemberId} AND team_id = ${teamId}
    `;
    
    if (!sender || sender.credits < amount) {
      return NextResponse.json({ 
        error: 'Insufficient credits' 
      }, { status: 400 });
    }

    // Send webhook notification first - if this fails, nothing else will happen
    const webhookResponse = await fetch('https://aiemployee.app.n8n.cloud/webhook/ad038ab1-b1da-4822-ae6d-7f9bc8ad721a', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        giver: fromMemberId,
        receiver: toMemberId,
        amount: amount
      })
    });

    if (!webhookResponse.ok) {
      throw new Error('Webhook notification failed');
    }

    // If webhook succeeded, proceed with the transfer
    // Remove credits from sender
    await sql`
      UPDATE user_credits 
      SET 
        credits = credits - ${amount},
        updated_at = CURRENT_TIMESTAMP
      WHERE member_id = ${fromMemberId} AND team_id = ${teamId}
    `;

    // Add credits to receiver
    await sql`
      UPDATE user_credits 
      SET 
        credits = credits + ${amount},
        updated_at = CURRENT_TIMESTAMP
      WHERE member_id = ${toMemberId} AND team_id = ${teamId}
    `;

    // Record the transaction
    await sql`
      INSERT INTO credit_transactions (
        from_member_id, 
        to_member_id, 
        team_id, 
        amount, 
        transaction_type
      ) VALUES (
        ${fromMemberId}, 
        ${toMemberId}, 
        ${teamId}, 
        ${amount}, 
        'MANUAL'
      )
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Transaction error:', error);
    // If any error occurs, the transaction will automatically rollback
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Operation failed' 
    }, { status: 500 });
  }
}

async function handleAddDirectCredits(data: any) {
  const { memberId, teamId, amount } = data;
  
  try {
    // Add credits directly to user
    await sql`
      UPDATE user_credits 
      SET 
        credits = credits + ${amount},
        updated_at = CURRENT_TIMESTAMP
      WHERE member_id = ${memberId} AND team_id = ${teamId}
    `;

    // Record the transaction
    await sql`
      INSERT INTO credit_transactions (
        from_member_id, 
        to_member_id, 
        team_id, 
        amount, 
        transaction_type
      ) VALUES (
        ${memberId}, 
        ${memberId}, 
        ${teamId}, 
        ${amount}, 
        'DIRECT_ADD'
      )
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

async function handleRemoveCredits(data: any, request: Request) {
  const { memberId, teamId, amount } = data;

  try {
    // Get the current user (receiver) from the referer URL
    const referer = request.headers.get('referer');
    if (!referer) {
      throw new Error('Could not determine current user');
    }
    
    const refererUrl = new URL(referer);
    const currentUserId = refererUrl.searchParams.get('memberId');
    
    if (!currentUserId) {
      throw new Error('Could not determine current user ID');
    }

    console.log('Referer URL:', referer);  // For debugging
    console.log('Current User ID:', currentUserId);  // For debugging

    // Rest of your code remains the same
    const { rows: [user] } = await sql`
      SELECT credits FROM user_credits 
      WHERE member_id = ${memberId} AND team_id = ${teamId}
    `;

    if (!user || user.credits < amount) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    // Send webhook notification first
    const webhookResponse = await fetch('https://aiemployee.app.n8n.cloud/webhook/ad038ab1-b1da-4822-ae6d-7f9bc8ad721a', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        giver: memberId,
        receiver: currentUserId,
        amount: amount
      })
    });

    if (!webhookResponse.ok) {
      throw new Error('Webhook notification failed');
    }

    // Remove credits from user
    await sql`
      UPDATE user_credits
      SET 
        credits = credits - ${amount},
        updated_at = CURRENT_TIMESTAMP
      WHERE member_id = ${memberId} AND team_id = ${teamId}
    `;

    // Add credits back to the current user
    await sql`
      UPDATE user_credits
      SET 
        credits = credits + ${amount},
        updated_at = CURRENT_TIMESTAMP
      WHERE member_id = ${currentUserId} AND team_id = ${teamId}
    `;

    // Record transaction
    await sql`
      INSERT INTO credit_transactions (
        from_member_id, 
        to_member_id, 
        team_id, 
        amount, 
        transaction_type
      ) VALUES (
        ${memberId}, 
        ${currentUserId}, 
        ${teamId}, 
        ${amount}, 
        'REMOVE'
      )
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Transaction error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Operation failed' 
    }, { status: 500 });
  }
}

async function handleUpdateMonthlyCredits(data: any) {
  const { managerId, memberId, teamId, amount } = data;
  const numAmount = parseInt(amount);
  
  try {
    // If amount is 0, we're canceling the automation
    if (numAmount === 0) {
      await sql`
        UPDATE user_credits 
        SET 
          monthly_credits = 0,
          monthly_credit_manager_id = NULL,
          last_monthly_credit_date = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE member_id = ${memberId} AND team_id = ${teamId}
      `;

      await sql`
        INSERT INTO credit_transactions (
          from_member_id, 
          to_member_id, 
          team_id, 
          amount, 
          transaction_type
        ) VALUES (
          ${managerId}, 
          ${memberId}, 
          ${teamId}, 
          0, 
          'MONTHLY_CANCEL'
        )
      `;

      return NextResponse.json({ success: true });
    }

    // Check if manager has enough credits
    const { rows: [manager] } = await sql`
      SELECT credits FROM user_credits 
      WHERE member_id = ${managerId} AND team_id = ${teamId}
    `;
    
    if (!manager || manager.credits < numAmount) {
      return NextResponse.json({ 
        error: 'Insufficient credits for monthly automation setup' 
      }, { status: 400 });
    }

    // Update the monthly credits setup and do initial transfer
    await sql`
      UPDATE user_credits 
      SET 
        monthly_credits = ${numAmount},
        monthly_credit_manager_id = ${managerId},
        credits = credits + ${numAmount},
        last_monthly_credit_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE member_id = ${memberId} AND team_id = ${teamId}
    `;

    // Subtract initial credits from manager
    await sql`
      UPDATE user_credits 
      SET 
        credits = credits - ${numAmount},
        updated_at = CURRENT_TIMESTAMP
      WHERE member_id = ${managerId} AND team_id = ${teamId}
    `;

    // Record the transaction
    await sql`
      INSERT INTO credit_transactions (
        from_member_id, 
        to_member_id, 
        team_id, 
        amount, 
        transaction_type
      ) VALUES (
        ${managerId}, 
        ${memberId}, 
        ${teamId}, 
        ${numAmount}, 
        'MONTHLY_SETUP'
      )
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

async function handleRemoveUser(data: any) {
  const { memberId, teamId } = data;

  try {
    // First delete related transactions
    await sql`
      DELETE FROM credit_transactions
      WHERE (from_member_id = ${memberId} OR to_member_id = ${memberId})
      AND team_id = ${teamId}
    `;

    // Then delete user
    await sql`
      DELETE FROM user_credits
      WHERE member_id = ${memberId} AND team_id = ${teamId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

async function handleCreateUser(data: any) {
  const { memberId, teamId, userName, userPictureUrl = '', initialCredits = 0 } = data;
  
  try {
    // Check if user already exists
    const { rows: existingUsers } = await sql`
      SELECT * FROM user_credits 
      WHERE member_id = ${memberId} 
      AND team_id = ${teamId}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json({ 
        error: 'User already exists' 
      }, { status: 400 });
    }

    // Create new user
    const { rows } = await sql`
      INSERT INTO user_credits (
        member_id,
        team_id,
        user_name,
        user_picture_url,
        credits,
        monthly_credits,
        created_at,
        updated_at
      ) VALUES (
        ${memberId},
        ${teamId},
        ${userName},
        ${userPictureUrl},
        ${initialCredits},
        0,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      user: rows[0] 
    });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}