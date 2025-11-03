import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { PaperAnalysis } from "@/lib/types/analysis";
import { analysisApi } from "@/lib/api/analysis";

export type AnalysisState = {
  analysis: PaperAnalysis | null;
  isLoading: boolean;
  isLoadingInDepth: boolean;
  error: string | null;
};

export function usePaperAnalysis(paperId: string) {
  const { getToken } = useAuth();
  const [state, setState] = useState<AnalysisState>({
    analysis: null,
    isLoading: false,
    isLoadingInDepth: false,
    error: null,
  });

  /**
   * Analyze paper (generates At-a-Glance analysis)
   */
  const analyze = useCallback(
    async (forceRefresh: boolean = false) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const token = await getToken();
        const analysis = await analysisApi.analyzePaper(paperId, forceRefresh, token);
        setState((prev) => ({
          ...prev,
          analysis,
          isLoading: false,
        }));
        return analysis;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to analyze paper";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [paperId, getToken]
  );

  /**
   * Load In-Depth Analysis (lazy-loaded on demand)
   */
  const loadInDepth = useCallback(async () => {
    if (!state.analysis) {
      throw new Error("Analysis not loaded");
    }

    if (state.analysis.in_depth) {
      // Already loaded
      return state.analysis;
    }

    setState((prev) => ({ ...prev, isLoadingInDepth: true, error: null }));
    try {
      const token = await getToken();
      const updatedAnalysis = await analysisApi.computeInDepth(paperId, token);
      setState((prev) => ({
        ...prev,
        analysis: updatedAnalysis,
        isLoadingInDepth: false,
      }));
      return updatedAnalysis;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load in-depth analysis";
      setState((prev) => ({
        ...prev,
        isLoadingInDepth: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [paperId, state.analysis, getToken]);

  /**
   * Initialize analysis on mount
   */
  useEffect(() => {
    const initializeAnalysis = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const token = await getToken();
        // Try to get cached analysis first
        const cached = await analysisApi.getPaperAnalysis(paperId, token);
        if (cached) {
          setState((prev) => ({
            ...prev,
            analysis: cached,
            isLoading: false,
          }));
        } else {
          // If not cached, generate new analysis
          const analysis = await analysisApi.analyzePaper(paperId, false, token);
          setState((prev) => ({
            ...prev,
            analysis,
            isLoading: false,
          }));
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to initialize analysis";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    };

    initializeAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperId]); // Only depend on paperId, not analyze or getToken

  return {
    ...state,
    analyze,
    loadInDepth,
  };
}
