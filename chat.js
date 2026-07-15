// api/chat.js
// Deployed on Vercel, this becomes: https://<your-project>.vercel.app/api/chat
//
// What it does: receives the same request your frontend used to send
// straight to Google, adds the real GEMINI_API_KEY (read from Vercel's
// environment variables — never from this file, never from git), forwards
// it to Gemini, and hands the response back. The browser never sees the key.

// Vercel's default function timeout can be shorter than Gemini sometimes
// needs to think through a response. Without this, a slow reply gets
// killed mid-request and the frontend receives a non-JSON error page,
// which showed up as an intermittent "Connection error" in the chatbot.
export const config = {
  maxDuration: 30,
};

// Only requests from these origins are allowed to call this proxy.
// Add any other origin you test from (e.g. a Live Server port) to this list.
const ALLOWED_ORIGINS = [
  "https://muhammadhassanakram.me",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

const GEMINI_MODEL = "gemini-3-flash-preview";

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Browsers send a preflight OPTIONS request before the real POST — just
  // acknowledge it, no work to do.
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // This means the environment variable wasn't set in the Vercel
    // dashboard — the key genuinely never made it into this file.
    return res.status(500).json({ error: "Server is missing GEMINI_API_KEY" });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await geminiRes.json();
    // Pass Google's status code straight through, so the frontend's
    // existing 400/429/403 handling keeps working unchanged.
    return res.status(geminiRes.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: "Could not reach Gemini API" });
  }
}
