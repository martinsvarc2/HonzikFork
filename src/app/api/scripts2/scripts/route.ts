import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';

const getDbClient = async () => {
  const client = createClient();
  await client.connect();
  return client;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  const memberstackId = searchParams.get('memberstackId');
  const category = searchParams.get('category');
  
  if (!teamId) return NextResponse.json({ error: 'Team ID required' }, { status: 400 });

  try {
    const client = await getDbClient();
    let query = 'SELECT * FROM scripts WHERE team_id = $1';
    const params = [teamId];

    if (memberstackId) {
      query += ' AND memberstack_id = $' + (params.length + 1);
      params.push(memberstackId);
    }

    if (category) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }

    query += ' ORDER BY updated_at DESC';

    const { rows } = await client.query(query, params);
    await client.end();

    return NextResponse.json(rows.map(row => ({
      id: row.id,
      name: row.name,
      content: row.content,
      lastEdited: row.last_edited,
      isSelected: row.is_selected,
      isPrimary: row.is_primary,
      category: row.category
    })));
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to load scripts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teamId, memberstackId, name, content, category } = body;
    
    if (!teamId || !memberstackId || !content || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await getDbClient();

    // Check if there are any existing scripts in this category
    const { rows: existingScripts } = await client.query(
      'SELECT COUNT(*) as count FROM scripts WHERE team_id = $1 AND category = $2',
      [teamId, category]
    );

    // If this is the first script in the category, make it primary
    const isPrimary = existingScripts[0].count === '0';

    const { rows } = await client.query(
      `INSERT INTO scripts 
       (team_id, memberstack_id, name, content, category, last_edited, is_primary)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
       RETURNING *`,
      [teamId, memberstackId, name || 'Untitled Script', content, category, isPrimary]
    );
    
    await client.end();
    return NextResponse.json({
      id: rows[0].id,
      name: rows[0].name,
      content: rows[0].content,
      lastEdited: rows[0].last_edited,
      isSelected: rows[0].is_selected,
      isPrimary: rows[0].is_primary,
      category: rows[0].category
    });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to save script' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, teamId, memberstackId, name, content, isSelected, category, isPrimary } = body;

    if (!id || !teamId) {
      return NextResponse.json({ error: 'ID and Team ID required' }, { status: 400 });
    }

    const client = await getDbClient();

    // If making this script primary, first remove primary status from other scripts in the category
    if (isPrimary) {
      await client.query(
        `UPDATE scripts 
         SET is_primary = FALSE 
         WHERE team_id = $1 
         AND category = (SELECT category FROM scripts WHERE id = $2)
         AND id != $2`,
        [teamId, id]
      );
    }

    const updateFields = [];
    const values = [teamId, id];
    let paramCount = 3;

    const fieldsToUpdate: Record<string, any> = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (content !== undefined) fieldsToUpdate.content = content;
    if (isSelected !== undefined) fieldsToUpdate.is_selected = isSelected;
    if (memberstackId !== undefined) fieldsToUpdate.memberstack_id = memberstackId;
    if (category !== undefined) fieldsToUpdate.category = category;
    if (isPrimary !== undefined) fieldsToUpdate.is_primary = isPrimary;

    for (const [key, value] of Object.entries(fieldsToUpdate)) {
      updateFields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const query = `
      UPDATE scripts 
      SET ${updateFields.join(', ')}, last_edited = CURRENT_TIMESTAMP
      WHERE team_id = $1 AND id = $2
      RETURNING *
    `;

    const { rows } = await client.query(query, values);
    await client.end();

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: rows[0].id,
      name: rows[0].name,
      content: rows[0].content,
      lastEdited: rows[0].last_edited,
      isSelected: rows[0].is_selected,
      isPrimary: rows[0].is_primary,
      category: rows[0].category
    });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to update script' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const teamId = searchParams.get('teamId');
  
  if (!id || !teamId) {
    return NextResponse.json({ error: 'ID and Team ID required' }, { status: 400 });
  }

  try {
    const client = await getDbClient();

    // Check if this is a primary script
    const { rows: scriptRows } = await client.query(
      'SELECT category, is_primary FROM scripts WHERE id = $1 AND team_id = $2',
      [id, teamId]
    );

    if (scriptRows.length > 0 && scriptRows[0].is_primary) {
      // If deleting a primary script, make the most recent script in the same category primary
      await client.query(
        `UPDATE scripts 
         SET is_primary = TRUE 
         WHERE id = (
           SELECT id 
           FROM scripts 
           WHERE team_id = $1 
           AND category = $2 
           AND id != $3 
           ORDER BY last_edited DESC 
           LIMIT 1
         )`,
        [teamId, scriptRows[0].category, id]
      );
    }

    const { rows } = await client.query(
      'DELETE FROM scripts WHERE id = $1 AND team_id = $2 RETURNING id',
      [id, teamId]
    );

    await client.end();

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to delete script' }, { status: 500 });
  }
}