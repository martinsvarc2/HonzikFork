import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

interface CommentData {
  topicId: number;
  parentCommentId?: number;
  content: string;
  author: string;
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',  // Added x-api-key
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({
        error: 'Missing memberId parameter',
        topics: [],
        comments: []
      });
    }

    // Get topics with comment counts and like status
    const { rows: topics } = await sql`
  SELECT 
    t.*,
    EXISTS(
      SELECT 1 
      FROM topic_likes 
      WHERE topic_id = t.id AND user_id = ${memberId}
    ) as is_liked
  FROM support_topics t
  ORDER BY t.created_at DESC;
`;

    // Get comments with nested replies
    const { rows: comments } = await sql`
      WITH RECURSIVE comment_tree AS (
        SELECT 
          c.*,
          COALESCE(
            EXISTS(
              SELECT 1 
              FROM comment_likes 
              WHERE comment_id = c.id AND user_id = ${memberId}
            ),
            false
          ) as is_liked,
          0 as level,
          ARRAY[c.id] as path
        FROM support_comments c
        WHERE parent_comment_id IS NULL
        
        UNION ALL
        
        SELECT 
          c.*,
          COALESCE(
            EXISTS(
              SELECT 1 
              FROM comment_likes 
              WHERE comment_id = c.id AND user_id = ${memberId}
            ),
            false
          ) as is_liked,
          ct.level + 1,
          ct.path || c.id
        FROM support_comments c
        JOIN comment_tree ct ON c.parent_comment_id = ct.id
        WHERE NOT c.id = ANY(ct.path)
      )
      SELECT * FROM comment_tree
      ORDER BY path;
    `;

    return NextResponse.json({
      topics,
      comments
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch data',
      details: error?.message || 'Unknown error',
      topics: [],
      comments: []
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({
        error: 'Missing memberId parameter'
      }, { status: 400 });
    }

    const data = await request.json();
    const { type } = data;

    if (type === 'topic') {
 // Get the API key from the request headers
 const apiKey = request.headers.get('x-api-key');
 
 if (apiKey === process.env.MAKE_API_KEY) {
   const { title, content, author, avatar_url, avatar_color, created_at } = data;
   
   try {
     // Add bg- prefix if not present
     const formattedAvatarColor = avatar_color.startsWith('bg-') ? avatar_color : `bg-${avatar_color}`;
     
     const { rows } = await sql`
       INSERT INTO support_topics (
         title,
         content,
         author,
         avatar_url,
         avatar_color,
         created_at,
         created_by,
         likes,
         comment_count,
         status
       ) VALUES (
         ${title},
         ${content},
         ${author},
         ${avatar_url},
         ${formattedAvatarColor},
         ${created_at},
         ${memberId},
         0,
         0,
         'Pending'
       ) RETURNING *;
     `;

     return NextResponse.json({
       message: 'Topic created successfully',
       topic: rows[0]
     }, { status: 201 });
   } catch (error: any) {
     console.error('Database Error:', error);
     return NextResponse.json({
       error: 'Failed to create topic in database',
       details: error?.message || 'Unknown error'
     }, { status: 500 });
   }
 } else {
   // No API key or doesn't match - means it's from the UI - send to webhook
   const { title, content } = data;
   try {
     const webhookResponse = await fetch('https://aiemployee.app.n8n.cloud/webhook/c64f5a75-5e68-4445-b471-971fd42297a9', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         title,
         content,
         memberId,
         created_at: new Date().toISOString()
       })
     });

     if (!webhookResponse.ok) {
       throw new Error('Failed to send to webhook');
     }

     return NextResponse.json({
       message: 'Topic submitted successfully for review',
       status: 'pending'
     }, { status: 200 });
   } catch (error: any) {
     console.error('Error sending topic to webhook:', error);
     return NextResponse.json({
       error: 'Failed to submit topic',
       details: error?.message || 'Unknown error'
     }, { status: 500 });
   }
 }
}

if (type === 'comment') {
  try {
    const comment = {
      topic_id: data.topicId,
      parent_comment_id: data.parentCommentId,
      content: data.content,
      author: data.author
    };
    
    const { rows } = await sql`
      WITH new_comment AS (
        INSERT INTO support_comments (
          topic_id,
          parent_comment_id,
          content,
          author,
          created_by,
          created_at,
          likes
        ) VALUES (
          ${comment.topic_id},
          ${comment.parent_comment_id || null},
          ${comment.content},
          ${comment.author},
          ${memberId},
          CURRENT_TIMESTAMP,
          0
        ) RETURNING *
      )
      SELECT 
        nc.*,
        0 as level,
        ARRAY[nc.id] as path,
        false as is_liked
      FROM new_comment nc;
    `;

    await sql`
      UPDATE support_topics 
      SET comment_count = comment_count + 1 
      WHERE id = ${comment.topic_id}
    `;

    return NextResponse.json({
      message: 'Comment added successfully',
      comment: rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

    return NextResponse.json({
      error: 'Invalid type specified'
    }, { status: 400 });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({
      error: 'Failed to create record',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({
        error: 'Missing memberId parameter'
      }, { status: 400 });
    }

    const data = await request.json();
    const { type, id, action } = data;

    if (type === 'topic' && action === 'like') {
  try {
    // Try to insert like
    const { rowCount: inserted } = await sql`
      INSERT INTO topic_likes (topic_id, user_id, created_at)
      VALUES (${id}, ${memberId}, CURRENT_TIMESTAMP)
      ON CONFLICT (topic_id, user_id) DO NOTHING
      RETURNING topic_id;
    `;

    if (inserted === 0) {
      // Like exists, remove it
      await sql`
        DELETE FROM topic_likes
        WHERE topic_id = ${id} AND user_id = ${memberId}
      `;
    }

    // Update topic likes count and get updated topic
    const { rows } = await sql`
      UPDATE support_topics t
      SET likes = (
        SELECT COUNT(*) 
        FROM topic_likes 
        WHERE topic_id = t.id
      )
      WHERE id = ${id}
      RETURNING *;
    `;

    return NextResponse.json({
      message: 'Topic like toggled successfully',
      topic: rows[0]
    });

  } catch (error) {
    console.error('Like toggle error:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
    
if (type === 'comment' && action === 'like') {
      try {
        const { rowCount: inserted } = await sql`
          INSERT INTO comment_likes (comment_id, user_id, created_at)
          VALUES (${id}, ${memberId}, CURRENT_TIMESTAMP)
          ON CONFLICT (comment_id, user_id) DO NOTHING
          RETURNING comment_id;
        `;

        if (inserted === 0) {
          await sql`
            DELETE FROM comment_likes
            WHERE comment_id = ${id} AND user_id = ${memberId}
          `;
        }

        const { rows } = await sql`
          UPDATE support_comments c
          SET likes = (
            SELECT COUNT(*) 
            FROM comment_likes 
            WHERE comment_id = c.id
          )
          WHERE id = ${id}
          RETURNING *;
        `;

        return NextResponse.json({
          message: 'Comment like toggled successfully',
          comment: rows[0]
        });
      } catch (error) {
        console.error('Comment like error:', error);
        return NextResponse.json({ error: 'Failed to toggle comment like' }, { status: 500 });
      }
    }

    return NextResponse.json({
      error: 'Invalid type or action specified'
    }, { status: 400 });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({
      error: 'Failed to update record',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}