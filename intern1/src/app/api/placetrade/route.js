import { NextResponse } from "next/server";
import { Pool } from "pg";

// Create PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Replace with your database URL
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { params } = body || {};

    if (!params) {
      return NextResponse.json(
        { error: "Missing params object" },
        { status: 400 }
      );
    }

    const {
      id: userId,
      username,
      units,
      openingprice,
      margin,
      leverage,
      amount,
      buyOrSell,
      symbol,
      stopLossValue,
      takeProfitValue,
      pending,
      matchingTradeIds,
      gameId,
      sessionId,
      botId,
    } = params;

    // Sanitize user ID to remove any special characters
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_]/g,""); // Allow only alphanumeric characters and underscores
    const sanitizedTableName = `useralltrades_${sanitizedUserId}`;

    // Check for matching trades
    if (matchingTradeIds && matchingTradeIds.length > 0) {
      const query = `
        SELECT * FROM "${sanitizedTableName}" WHERE id = ANY($1)
      `;
      const result = await pool.query(query, [matchingTradeIds]);

      if (result.rows.length > 0) {
        const updateQuery = `
          UPDATE "${sanitizedTableName}"
          SET pending = null
          WHERE id = ANY($1)
        `;
        await pool.query(updateQuery, [matchingTradeIds]);

        return NextResponse.json(
          { msg: "Pending Trade Placed" },
          { status: 201 }
        );
      } else {
        return NextResponse.json(
          { error: "No matching trade found" },
          { status: 404 }
        );
      }
    }

    // Validate required fields
    if (!userId || !username || !openingprice || !buyOrSell || !symbol) {
      return NextResponse.json(
        { error: "Some essential parameters are missing" },
        { status: 400 }
      );
    }

    // Round the margin value
    const roundedMargin = parseFloat(margin).toFixed(4);
    let orderData = {
      symbol,
      openingprice,
      leverage,
      margin: parseFloat(roundedMargin),
      unitsorlots: units,
      buyorsell: buyOrSell,
      openingtime: new Date(),
    };

    if (stopLossValue) orderData.stoplossvalue = stopLossValue;
    if (takeProfitValue) orderData.takeprofitvalue = takeProfitValue;
    if (pending) orderData.pending = pending;
    if (gameId) orderData.gameid = gameId;
    if (sessionId) orderData.sessionid = sessionId;
    if (botId) orderData.botId = botId;
    // Insert new trade data into the table
    const insertQuery = `
      INSERT INTO "${sanitizedTableName}" (symbol, openingprice, leverage, margin, unitsorlots, buyorsell, openingtime, stoplossvalue, takeprofitvalue, pending, gameid, sessionid, botid)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;
    await pool.query(insertQuery, [
      orderData.symbol,
      orderData.openingprice,
      orderData.leverage,
      orderData.margin,
      orderData.unitsorlots,
      orderData.buyorsell,
      orderData.openingtime,
      orderData.stoplossvalue,
      orderData.takeprofitvalue,
      orderData.pending,
      orderData.gameid,
      orderData.sessionid,
      orderData.botId,
    ]);

    // Handle player trading style details
    const userRecordQuery = `
      SELECT * FROM playertradingstyledetails WHERE authorId = $1
    `;
    const userRecordResult = await pool.query(userRecordQuery, [userId]);

    if (userRecordResult.rows.length === 0) {
      const insertUserRecordQuery = `
        INSERT INTO playertradingstyledetails (authorId, symbol)
        VALUES ($1, $2)
      `;
      await pool.query(insertUserRecordQuery, [
        userId,
        JSON.stringify({ [symbol]: 1 }),
      ]);
    } else {
      let updatedsymbol = {};
      try {
        const rawSymbol = userRecordResult.rows[0].symbol || "{}";
        updatedsymbol = JSON.parse(rawSymbol.trim() || "{}");
      } catch (err) {
        console.error(
          "Invalid JSON in userRecord.symbol. Resetting to empty object."
        );
        updatedsymbol = {};
      }

      updatedsymbol[symbol] = (updatedsymbol[symbol] || 0) + 1;

      const updateUserRecordQuery = `
        UPDATE playertradingstyledetails
        SET symbol = $1
        WHERE id = $2
      `;
      await pool.query(updateUserRecordQuery, [
        JSON.stringify(updatedsymbol),
        userRecordResult.rows[0].id,
      ]);
    }

    return NextResponse.json(
      { msg: "Trade Placed", trade: orderData },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing pairing:", error.message);
    return NextResponse.json(
      { error: "Error processing pairing", details: error.message },
      { status: 500 }
    );
  }
}


export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    const username = searchParams.get("username");
    const sessionid = searchParams.get("sessionId");
    const gameid = searchParams.get("gameId");
    const botId = searchParams.get("botId");

    // Sanitize userId and build table name
    if (!userId || !username) {
      console.error("Missing required parameters");
      return NextResponse.json(
        { error: "Some parameters are missing" },
        { status: 401 }
      );
    }

    const sanitizedUserId = userId.replace(/-/g, "");
    const sanitizedTableName = `useralltrades_${sanitizedUserId}`;


    // Prepare dynamic SQL query
    let query = `SELECT * FROM ${sanitizedTableName} WHERE 1=1`;
    const values = [];

    // Add filters based on provided parameters
    if (gameid) {
      query += ` AND gameid = $${values.length + 1}`;
      values.push(gameid);
    }

    if (sessionid) {
      query += ` AND sessionid = $${values.length + 1}`;
      values.push(sessionid);
    } 

    if (botId) {
      query += ` AND botId = $${values.length + 1}`;
      values.push(botId);
    } 

    // Execute the query
    const result = await pool.query(query, values);



    // Return the trades list
    return NextResponse.json({ trades: result.rows }, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request", details: error.message },
      { status: 500 }
    );
  }
}
