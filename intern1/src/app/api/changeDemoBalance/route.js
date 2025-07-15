import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Replace with your database URL
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { demoBalance, username, userId, gameCategory } = body;

    if (demoBalance) {
      // Check for missing parameters
      if (!demoBalance || !username || !userId) {
        console.error('Missing Params');
        return NextResponse.json({ error: 'Some parameters are missing' }, { status: 400 });
      }

      // Ensure demoBalance is a valid number
      const parsedDemoBalance = parseFloat(demoBalance);
      if (isNaN(parsedDemoBalance)) {
        return NextResponse.json({ error: 'Invalid demoBalance value' }, { status: 400 });
      }

      // Use upsert behavior with a transaction (to simulate Prisma's upsert)
      const query = `
        INSERT INTO partialdemobalance (player, demobalance, authorid)
        VALUES ($1, $2, $3)
        ON CONFLICT (player) DO UPDATE
        SET demobalance = $2
        RETURNING starttime
      `;

      const result = await pool.query(query, [username, parsedDemoBalance, userId]);

      return NextResponse.json({
        msg: 'Demo balance updated',
        demoBalance: parsedDemoBalance,
        startTime: result.rows[0].starttime,
      }, { status: 201 });
    } else {
      // Handle case where demoBalance is not provided
      const findQuery = `
        SELECT * FROM partialdemobalance WHERE player = $1
      `;
      const findResult = await pool.query(findQuery, [username]);

      if (findResult.rows.length > 0) {
        const updateQuery = `
          UPDATE partialdemobalance
          SET category = NULL, starttime = $1
          WHERE id = $2
          RETURNING starttime
        `;
        const updateResult = await pool.query(updateQuery, [new Date(), findResult.rows[0].id]);

        return NextResponse.json({ startTime: updateResult.rows[0].starttime });
      } else {
        const insertQuery = `
          INSERT INTO partialdemobalance (category, authorid, player, demobalance, starttime)
          VALUES (NULL, $1, $2, 10000, $3)
          RETURNING starttime
        `;
        const insertResult = await pool.query(insertQuery, [userId, username, new Date()]);

        return NextResponse.json({ startTime: insertResult.rows[0].starttime });
      }
    }
  } catch (error) {
    console.error('Error in backend:', error.message);
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}
 