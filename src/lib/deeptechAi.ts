// src/lib/deeptechAi.ts

// ✅ Call Node.js backend instead of FastAPI
const AI_SERVICE_URL = import.meta.env.VITE_API_URL + '/ai';

export interface AiAnalysisResponse {
  status: string;
  score: number;
  tier: string;
  autofill: {
    name?: string;
    summary?: string;
    years_experience?: number;
    all_skills?: string[];
  };
}

export async function analyzeExistingProfile(
  token: string,
  portfolioUrl?: string,
  githubUser?: string
): Promise<AiAnalysisResponse> {

  const response = await fetch(`${AI_SERVICE_URL}/analyze-existing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Node.js will forward this to FastAPI
    },
    body: JSON.stringify({
      portfolio_url: portfolioUrl || null,
      github_username: githubUser || null,
    }),
  });

  // ✅ Handle rate limit from backend
  if (response.status === 429) {
    const data = await response.json();
    throw new Error(data.message || "Daily AI limit reached");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI Service Error (${response.status}): ${errorText}`);
  }

  return response.json();
}