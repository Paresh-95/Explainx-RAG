// app/api/token/route.ts
import axios from "axios";

export async function GET() {
  try {
    const response = await axios.post(
      "https://api.assemblyai.com/v2/realtime/token", // v2 endpoint for tokens
      { expires_in: 3600 }, // 1 hour expiration
      {
        headers: {
          authorization: process.env.ASSEMBLYAI_API_KEY,
          "content-type": "application/json",
        },
      },
    );
    return Response.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error(
      "Error fetching AssemblyAI token:",
      error.response?.data || error.message,
    );
    const { response } = error;
    return Response.json(response?.data || { error: "Failed to fetch token" }, {
      status: response?.status || 500,
    });
  }
}
