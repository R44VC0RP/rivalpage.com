import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { competitorAnalysisWorkflow } from "@/workflows/competitor-analysis";
import { db } from "@/lib/db";
import { analysisRequests } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const { domain, name, email } = await request.json();

    // Validate input
    if (!domain || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields: domain, name, email" },
        { status: 400 }
      );
    }

    // Create analysis request record
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    await db.insert(analysisRequests).values({
      id: analysisId,
      domain,
      name,
      email,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Start the workflow asynchronously
    // Note: workflow arguments must be passed as an array
    await start(competitorAnalysisWorkflow, [{
      analysisId,
      domain,
      name,
      email,
    }]);

    return NextResponse.json({
      success: true,
      message: "Competitor analysis workflow started",
      analysisId,
    });
  } catch (error) {
    console.error("Error starting analysis workflow:", error);
    return NextResponse.json(
      { error: "Failed to start analysis workflow" },
      { status: 500 }
    );
  }
}

