import { PaperAnalysis } from "@/lib/types/analysis";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders(token?: string | null): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const analysisApi = {
  /**
   * Analyze a paper and generate At-a-Glance analysis
   */
  async analyzePaper(
    paperId: string,
    forceRefresh: boolean = false,
    token?: string | null
  ): Promise<PaperAnalysis> {
    const headers = getAuthHeaders(token);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/analysis/${paperId}/analyze?force_refresh=${forceRefresh}`,
      {
        method: "POST",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to analyze paper: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  },

  /**
   * Retrieve cached analysis for a paper
   */
  async getPaperAnalysis(
    paperId: string,
    token?: string | null
  ): Promise<PaperAnalysis | null> {
    try {
      const headers = getAuthHeaders(token);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/analysis/${paperId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to retrieve analysis: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      console.error("Error retrieving analysis:", error);
      return null;
    }
  },

  /**
   * Compute In-Depth Analysis (comprehensive section-by-section breakdown)
   */
  async computeInDepth(
    paperId: string,
    token?: string | null
  ): Promise<PaperAnalysis> {
    const headers = getAuthHeaders(token);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/analysis/${paperId}/in-depth`,
      {
        method: "POST",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to compute in-depth analysis: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  },
};
