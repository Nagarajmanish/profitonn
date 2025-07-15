import { NextResponse } from "next/server";
import { Pool } from "pg";

// Create PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Replace with your database URL
});

// POST request to update a trade
export async function POST(request) {
  try {
    const body = await request.json();
    const { params } = body;
    const { userId, username, tradeId, profitOrLoss, closingPrice } = params;


    const sanitizedUserId = userId.replace(/-/g, "");
    const sanitizedTableName = `useralltrades_${sanitizedUserId}`;

    // Check for missing parameters
    if (
      !userId ||
      !username ||
      !tradeId ||
      profitOrLoss === undefined ||
      profitOrLoss === null
    ) {
      console.error("Missing Params");
      return NextResponse.json(
        { error: "Some parameters are missing" },
        { status: 400 }
      );
    }

    const profitLoss = parseFloat(profitOrLoss);

    if (isNaN(profitLoss)) {
      console.error("Invalid profitOrLoss value");
      return NextResponse.json(
        { error: "Invalid profitOrLoss value" },
        { status: 400 }
      );
    }


    // Update the trade with closing time and profitOrLoss using raw SQL
    const updateQuery = `
            UPDATE "${sanitizedTableName}" 
            SET "closingtime" = $1, "profitorloss" = $2, "closingprice" = $3 
            WHERE id = $4
            RETURNING *;
        `;
    const result = await pool.query(updateQuery, [
      new Date(),
      profitLoss,
      closingPrice,
      tradeId,
    ]);


    return NextResponse.json({ msg: "Trade Closed" }, { status: 200 });
  } catch (error) {
    console.error("Error processing pairing:", error);
    return NextResponse.json(
      { error: "Error processing pairing", details: error.message },
      { status: 500 }
    );
  }
}

// GET request to fetch and update a trade
export async function GET(request) {
  try {
    const body = await request.json();
    const { params } = body;
    const { userId, username, tradeId, profitOrLoss } = params;



    // Check for missing parameters
    if (
      !userId ||
      !username ||
      !tradeId ||
      profitOrLoss === undefined ||
      profitOrLoss === null
    ) {
      console.error("Missing Params");
      return NextResponse.json(
        { error: "Some parameters are missing" },
        { status: 400 }
      );
    }

    const profitLoss = parseFloat(profitOrLoss);

    // Check if profitOrLoss is a valid number
    if (isNaN(profitLoss)) {
      console.error("Invalid profitOrLoss value");
      return NextResponse.json(
        { error: "Invalid profitOrLoss value" },
        { status: 400 }
      );
    }

    // Update the trade with closing time and profitOrLoss using raw SQL
    const updateQuery = `
            UPDATE "userAllTrades" 
            SET "closingTime" = $1, "profitOrLoss" = $2 
            WHERE id = $3
            RETURNING *;
        `;
    const result = await pool.query(updateQuery, [
      new Date(),
      profitLoss,
      tradeId,
    ]);



    return NextResponse.json(
      { msg: "Trade Placed", trade: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing pairing:", error);
    return NextResponse.json(
      { error: "Error processing pairing", details: error.message },
      { status: 500 }
    );
  }
}
