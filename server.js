import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());


app.use(express.static("public"));

app.post("/tts", async (req, res) => {
  const { text, voiceId, speechRate } = req.body;

  // Fetch TTS from Eleven Labs API
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVEN_API_KEY
      },
      body: JSON.stringify({
        text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          speed: speechRate ?? 1.0
        }
      })
    }
  );

  const audioBuffer = await response.arrayBuffer();
  res.set("Content-Type", "audio/mpeg");
  res.send(Buffer.from(audioBuffer));
});

app.listen(3000, () =>
  console.log("Server running at http://localhost:3000")
);
