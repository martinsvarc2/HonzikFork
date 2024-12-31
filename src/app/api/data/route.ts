import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        const client = createClient();
        await client.connect();

        const { rows } = await client.sql`
            SELECT 
                session_id,
                team_id,
                member_id,
                user_picture_url,
                assistant_picture_url,
                assistant_name,
                created_at
            FROM data 
            WHERE session_id = ${sessionId};
        `;

        await client.end();

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error('Data retrieval error:', error);
        return NextResponse.json({
            error: 'Failed to retrieve data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Received body:', body);

        // Only validate sessionId
        if (!body.sessionId) {
            return NextResponse.json({
                error: 'Session ID is required',
                receivedData: body
            }, { status: 400 });
        }

        const client = createClient();
        await client.connect();

        // Create dynamic query parts based on what's provided
        const fieldsToUpdate = [];
        const values = [body.sessionId];
        let valueIndex = 2;

        // Add optional fields if they exist
        if (body.teamId !== undefined) fieldsToUpdate.push(`team_id = $${valueIndex++}`);
        if (body.memberId !== undefined) fieldsToUpdate.push(`member_id = $${valueIndex++}`);
        if (body.userPictureUrl !== undefined) fieldsToUpdate.push(`user_picture_url = $${valueIndex++}`);
        if (body.assistantPictureUrl !== undefined) fieldsToUpdate.push(`assistant_picture_url = $${valueIndex++}`);
        if (body.assistantName !== undefined) fieldsToUpdate.push(`assistant_name = $${valueIndex++}`);

        // Add values in the same order
        if (body.teamId !== undefined) values.push(body.teamId);
        if (body.memberId !== undefined) values.push(body.memberId);
        if (body.userPictureUrl !== undefined) values.push(body.userPictureUrl);
        if (body.assistantPictureUrl !== undefined) values.push(body.assistantPictureUrl);
        if (body.assistantName !== undefined) values.push(body.assistantName);

        // Construct the query
        const updateQuery = `
            INSERT INTO data (session_id, team_id, member_id, user_picture_url, assistant_picture_url, assistant_name)
            VALUES ($1, 
                ${body.teamId !== undefined ? '$2' : 'NULL'}, 
                ${body.memberId !== undefined ? '$3' : 'NULL'}, 
                ${body.userPictureUrl !== undefined ? '$4' : 'NULL'}, 
                ${body.assistantPictureUrl !== undefined ? '$5' : 'NULL'}, 
                ${body.assistantName !== undefined ? '$6' : 'NULL'}
            )
            ON CONFLICT (session_id) 
            DO UPDATE SET
                ${fieldsToUpdate.length > 0 ? fieldsToUpdate.join(', ') + ',' : ''}
                updated_at = CURRENT_TIMESTAMP;
        `;

        await client.query(updateQuery, values);

        // Get the updated data
        const { rows: updatedData } = await client.sql`
            SELECT * FROM data WHERE session_id = ${body.sessionId};
        `;

        await client.end();

        return NextResponse.json({
            success: true,
            message: 'Data created/updated successfully',
            data: updatedData[0]
        });

    } catch (error) {
        console.error('Data creation error:', error);
        return NextResponse.json({
            error: 'Failed to create/update data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}