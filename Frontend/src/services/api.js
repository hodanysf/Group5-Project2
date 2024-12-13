import { API_BASE_URL } from "../config";

export const api = {
  getTheftsOverTime: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/thefts-over-time`);
      if (!response.ok) {
        throw new Error("Failed to fetch graph data");
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch graph:", error);
      throw error;
    }
  },

  getReturnRate: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/return-rate`);
      if (!response.ok) {
        throw new Error("Failed to fetch return rate data");
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch return rate:", error);
      throw error;
    }
  },

  getSeasonalAnalysis: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seasonal-analysis`);
      if (!response.ok) {
        throw new Error("Failed to fetch seasonal analysis data");
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch seasonal analysis:", error);
      throw error;
    }
  },

  getTimeAnalysis: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/time-analysis`);
      if (!response.ok) {
        throw new Error("Failed to fetch time analysis data");
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch time analysis:", error);
      throw error;
    }
  },

  getValueAnalysis: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/value-analysis`);
      if (!response.ok) {
        throw new Error("Failed to fetch value analysis data");
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch value analysis:", error);
      throw error;
    }
  },

  getModelMetrics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/model-metrics`);
      if (!response.ok) {
        throw new Error("Failed to fetch model metrics data");
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch model metrics:", error);
      throw error;
    }
  },
};
