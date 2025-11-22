"use server";

import { db } from "@/lib/db";
import { analysisRequests } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export type AnalysisResult = {
  competitors: Array<{
    name: string;
    website: string;
    description: string;
    reason: string;
    links: string[];
    screenshots: Array<{
      url: string;
      imageUrl: string;
    }>;
  }>;
  generatedAt: string;
};

export type AnalysisData = {
  id: string;
  domain: string;
  status: "pending" | "completed" | "failed";
  result: AnalysisResult | null;
  createdAt: Date;
};

export async function getAnalysisByDomain(domain: string): Promise<AnalysisData | null> {
  try {
    const results = await db
      .select()
      .from(analysisRequests)
      .where(eq(analysisRequests.domain, domain))
      .orderBy(desc(analysisRequests.createdAt))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const analysis = results[0];
    let parsedResult: AnalysisResult | null = null;

    if (analysis.result) {
      try {
        parsedResult = JSON.parse(analysis.result);
      } catch (e) {
        console.error("Failed to parse analysis result JSON", e);
      }
    }

    return {
      id: analysis.id,
      domain: analysis.domain,
      status: analysis.status as "pending" | "completed" | "failed",
      result: parsedResult,
      createdAt: analysis.createdAt,
    };
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return null;
  }
}

