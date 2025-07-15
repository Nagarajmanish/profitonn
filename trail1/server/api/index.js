// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
// import fetch from "node-fetch"; // For Node < 18. If on 18+, use global fetch
// // import handleFindMatch from "./yourMatchFile.js"; // If you're importing it

// const app = express();
// const PORT = 5000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Dummy function (replace with your actual handleFindMatch)
// const handleFindMatch = async ({ amount, username, userId }) => {
//   console.log("Triggered handleFindMatch manually:", amount, username, userId);
//   // your matching logic goes here...
// };

// // ✅ Manual match trigger endpoint
// app.post("/api/manual-match", async (req, res) => {
//   try {
//     const { amount, username, userId } = req.body;
//     await handleFindMatch({ amount, username, userId });
//     res.status(200).send("Match handled successfully");
//   } catch (err) {
//     console.error("Manual trigger error:", err);
//     res.status(500).send("Error triggering match");
//   }
// });

// // ✅ Proxy endpoint
// app.get("/proxy", async (req, res) => {
//   const targetUrl = req.query.url;

//   if (!targetUrl) {
//     return res.status(400).send("URL parameter is required");
//   }

//   try {
//     const response = await fetch(targetUrl);
//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching data from target URL" });
//   }
// });

// // ✅ Binance exchange info
// app.get("/api/v3/exchangeInfo", async (req, res) => {
//   try {
//     const response = await fetch("https://api.binance.com/api/v3/exchangeInfo");
//     if (!response.ok) {
//       throw new Error(`Binance API returned status ${response.status}`);
//     }
//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching exchange info:", error.message);
//     res.status(500).send("Error fetching exchange info");
//   }
// });

// // ✅ Start server
// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });




// Invoke-RestMethod -Uri "http://localhost:3000/api/manual-match" `
//   -Method POST `
//   -ContentType "application/json" `
//   -Body '{ "amount": "100", "username": "test_user", "userId": "user_123" }'


import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

// Use CORS middleware
const allowedOrigins = ['https://profitonn.com', 'https://www.profitonn.com', 'http://localhost:3000'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    }
}));

// Proxy endpoint
app.get("/proxy", async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send("URL parameter is required");
    }

    try {
        // Forward the request to the target URL
        const response = await fetch(targetUrl);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Error fetching data from target URL" });
    }
});

// Binance endpoint
app.get('/api/v3/exchangeInfo', async (req, res) => {
    try {
        const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
        if (!response.ok) {
            throw new Error(`Binance API returned status ${response.status}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching exchange info:', error.message);
        res.status(500).send('Error fetching exchange info');
    }
});

app.listen(PORT, () => {
    console.log(`CORS Proxy Server running at http://localhost:${PORT}`);
});