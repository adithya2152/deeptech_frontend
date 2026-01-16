// src/lib/deeptechAi.ts

// Make sure this matches your deployed Python URL or localhost
const AI_SERVICE_URL = import.meta.env.VITE_AI_URL || "http://localhost:8000";

export interface AiAnalysisResponse {
  status: string;
  score: number;
  tier: string;
  autofill: {
    name?: string;
    summary?: string;
    years_experience?: number;
    all_skills?: string[];
    // Add other fields if needed
  };
}

export async function analyzeExistingProfile(token: string, portfolioUrl?: string, githubUser?: string): Promise<AiAnalysisResponse> {
  const response = await fetch(`${AI_SERVICE_URL}/analyze-existing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // Python needs the token to find the user in DB
    },
    body: JSON.stringify({
      portfolio_url: portfolioUrl || null,
      github_username: githubUser || null
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI Service Error (${response.status}): ${errorText}`);
  }

  return response.json();
}