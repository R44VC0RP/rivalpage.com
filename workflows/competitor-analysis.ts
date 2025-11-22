import OpenAI from "openai";
import { db } from "@/lib/db";
import { analysisRequests, screenshots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { takeScreenshot } from "@/lib/cloudflare-browser";
import { uploadImageToR2 } from "@/lib/r2";
import { sendAnalysisCompleteEmail } from "@/lib/email";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Competitor {
  name: string;
  website: string;
  description: string;
  reason: string;
}

interface CompetitorWithLinks extends Competitor {
  links: string[];
}

interface ScreenshotMap {
  [url: string]: string; // url -> imageUrl
}

interface AnalysisInput {
  analysisId: string;
  domain: string;
  name: string;
  email: string;
}

/**
 * Main workflow function
 */
export async function competitorAnalysisWorkflow(input: AnalysisInput) {
  "use workflow";

  console.log(`========================================`);
  console.log(`[Workflow] Starting competitor analysis`);
  console.log(`[Workflow] Analysis ID: ${input.analysisId}`);
  console.log(`[Workflow] Domain: ${input.domain}`);
  console.log(`[Workflow] User: ${input.name} (${input.email})`);
  console.log(`========================================`);
  const workflowStartTime = Date.now();

  try {
    // Step 1: Find competitors using OpenAI with web search
    const competitors = await findCompetitorsStep(input.domain);

    // Step 2: Map links for each competitor using Firecrawl
    const competitorsWithLinks = await mapLinksStep(competitors);

    // Step 3: Process screenshots for all links
    const screenshotMap = await processScreenshotsStep(competitorsWithLinks);

    // Step 4: Finalize the analysis
    await finalizeAnalysisStep(
      input.analysisId,
      competitorsWithLinks,
      screenshotMap,
      input.email,
      input.name,
      input.domain
    );

    const totalDuration = Date.now() - workflowStartTime;
    console.log(`========================================`);
    console.log(
      `[Workflow] ✓ Completed successfully in ${(totalDuration / 1000).toFixed(
        2
      )}s`
    );
    console.log(`========================================`);

    return { success: true };
  } catch (error) {
    const totalDuration = Date.now() - workflowStartTime;
    console.error(`========================================`);
    console.error(
      `[Workflow] ✗ Failed after ${(totalDuration / 1000).toFixed(2)}s`
    );
    console.error(`[Workflow] Error:`, error);
    console.error(`========================================`);

    // Mark analysis as failed in a separate step
    await markAnalysisFailedStep(input.analysisId);
    throw error;
  }
}

/**
 * Step 1: Find competitors using OpenAI with web search and structured outputs
 */
async function findCompetitorsStep(domain: string): Promise<Competitor[]> {
  "use step";

  let markdownSummary = "";
  const url = "https://api.firecrawl.dev/v2/scrape";

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: domain,
      onlyMainContent: false,
      maxAge: 172800000,
      parsers: ["pdf"],
      formats: ["markdown"],
    }),
  };
  try {
    const scrapeResponse = await fetch(url, options);
    const scrapeData = await scrapeResponse.json();
    markdownSummary = scrapeData.data.markdown;
  } catch (error) {
    console.error(`[Step 1] Failed to scrape website: ${domain}`, error);
    markdownSummary = "No markdown summary available";
  }

  console.log(`[Step 1] Finding competitors for domain: ${domain}`);
  const startTime = Date.now();

  const response = await openai.responses.create({
    model: "gpt-5",
    tools: [{ type: "web_search" }],
    input: `
    Look at ${domain} and find out what they do.

    Here is a markdown summary of the website:

    ${markdownSummary}
    
    Then try to find 4 of their closest competitors to ${domain}. For each competitor, provide:
1. The company name
2. Their website URL (must be a valid URL starting with http:// or https://)
3. A brief description of what they do
4. How they compete with ${domain}`,
    text: {
      format: {
        type: "json_schema",
        name: "competitors_list",
        strict: true,
        schema: {
          type: "object",
          properties: {
            competitors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The company name",
                  },
                  website: {
                    type: "string",
                    description:
                      "The company website URL (must start with http:// or https://)",
                  },
                  description: {
                    type: "string",
                    description: "A brief description of what they do",
                  },
                  reason: {
                    type: "string",
                    description: "How they compete with the target domain",
                  },
                },
                required: ["name", "website", "description", "reason"],
                additionalProperties: false,
              },
            },
          },
          required: ["competitors"],
          additionalProperties: false,
        },
      },
    },
  });

  // Parse the structured output from response.output_text
  console.log(`[Step 1] Response status:`, response.status);
  console.log(`[Step 1] Output text:`, response.output_text);
  
  let competitors: Competitor[] = [];

  if (response.status === "completed" && response.output_text) {
    try {
      const parsed = JSON.parse(response.output_text);
      competitors = parsed.competitors || [];
    } catch (error) {
      console.error(`[Step 1] Failed to parse output_text:`, error);
    }
  }

  const duration = Date.now() - startTime;
  console.log(
    `[Step 1] Found ${competitors.length} competitors in ${duration}ms`
  );
  competitors.forEach((comp, idx) => {
    console.log(`  ${idx + 1}. ${comp.name} (${comp.website})`);
  });

  return competitors;
}

/**
 * Step 2: Map links for each competitor using Firecrawl
 */
async function mapLinksStep(
  competitors: Competitor[]
): Promise<CompetitorWithLinks[]> {
  "use step";

  console.log(`[Step 2] Mapping links for ${competitors.length} competitors`);
  const startTime = Date.now();
  const competitorsWithLinks: CompetitorWithLinks[] = [];

  for (let i = 0; i < competitors.length; i++) {
    const competitor = competitors[i];
    console.log(
      `[Step 2] Processing ${i + 1}/${competitors.length}: ${
        competitor.name
      } (${competitor.website})`
    );

    try {
      const links = await getCompetitorLinks(competitor.website);
      const limitedLinks = links.slice(0, 4);
      competitorsWithLinks.push({
        ...competitor,
        links: limitedLinks,
      });
      console.log(
        `[Step 2]   ✓ Found ${links.length} links, using first ${limitedLinks.length}`
      );
    } catch (error) {
      console.error(
        `[Step 2]   ✗ Failed to map links for ${competitor.website}:`,
        error
      );
      // Continue with empty links if mapping fails
      competitorsWithLinks.push({
        ...competitor,
        links: [],
      });
    }
  }

  const duration = Date.now() - startTime;
  const totalLinks = competitorsWithLinks.reduce(
    (sum, c) => sum + c.links.length,
    0
  );
  console.log(
    `[Step 2] Completed in ${duration}ms. Total links: ${totalLinks}`
  );

  return competitorsWithLinks;
}

/**
 * Helper function to get links from Firecrawl
 */
async function getCompetitorLinks(domain: string): Promise<string[]> {
  const url = "https://api.firecrawl.dev/v2/map";
  const apiKey = process.env.FIRECRAWL_API_KEY;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: domain,
      limit: 5000,
      includeSubdomains: false,
      sitemap: "include",
    }),
  });

  if (!response.ok) {
    throw new Error(`Firecrawl API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.success && data.links) {
    const allLinks = data.links.map((link: { url: string }) => link.url);

    // Filter out .xml files and sort by length (shortest to longest)
    return allLinks
      .filter((link: string) => !link.includes(".xml"))
      .sort((a: string, b: string) => a.length - b.length);
  }

  return [];
}

/**
 * Step 3: Process screenshots for all links with rate limiting
 */
async function processScreenshotsStep(
  competitorsWithLinks: CompetitorWithLinks[]
): Promise<ScreenshotMap> {
  "use step";

  console.log(`[Step 3] Processing screenshots for competitors`);
  const startTime = Date.now();
  const screenshotMap: ScreenshotMap = {};

  // Collect all unique URLs
  const allUrls = new Set<string>();
  for (const competitor of competitorsWithLinks) {
    for (const link of competitor.links) {
      allUrls.add(link);
    }
  }

  console.log(`[Step 3] Total unique URLs to screenshot: ${allUrls.size}`);

  // Process URLs with rate limiting (delay between requests)
  let successCount = 0;
  let cachedCount = 0;
  let failedCount = 0;
  let index = 0;
  const urlArray = Array.from(allUrls);

  for (const url of urlArray) {
    index++;
    try {
      console.log(`[Step 3] [${index}/${urlArray.length}] Processing: ${url}`);
      const result = await getOrCreateScreenshot(url);

      if (result.cached) {
        cachedCount++;
        console.log(`[Step 3]   ✓ Cached screenshot retrieved`);
      } else {
        successCount++;
        console.log(`[Step 3]   ✓ New screenshot created`);
        // Add delay after creating new screenshot to avoid rate limits
        if (index < urlArray.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      screenshotMap[url] = result.imageUrl;
    } catch (error) {
      failedCount++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[Step 3]   ✗ Failed: ${errorMsg}`);
      // Continue even if screenshot fails
      screenshotMap[url] = "";
    }
  }

  const duration = Date.now() - startTime;
  console.log(`[Step 3] Completed in ${duration}ms`);
  console.log(
    `[Step 3] Summary: ${successCount} new, ${cachedCount} cached, ${failedCount} failed`
  );

  return screenshotMap;
}

/**
 * Helper function to get or create a screenshot
 * Uses optimistic insertion with conflict handling to prevent race conditions
 */
async function getOrCreateScreenshot(
  url: string
): Promise<{ imageUrl: string; cached: boolean }> {
  // First, try to get existing screenshot
  const existing = await db
    .select()
    .from(screenshots)
    .where(eq(screenshots.url, url))
    .limit(1);

  if (existing.length > 0) {
    return { imageUrl: existing[0].imageUrl, cached: true };
  }

  // Take new screenshot (this is expensive, so we do it before insertion)
  const imageBuffer = await takeScreenshot(url);

  // Generate a unique key for R2
  const urlHash = Buffer.from(url)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "");
  const key = `screenshots/${urlHash.substring(0, 50)}-${Date.now()}.png`;

  // Upload to R2
  const imageUrl = await uploadImageToR2(imageBuffer, key, "image/png");

  // Use upsert to handle race conditions - if another process already inserted,
  // we'll just ignore the conflict and use the existing record
  try {
    await db
      .insert(screenshots)
      .values({
        url,
        imageUrl,
        createdAt: new Date(),
      })
      .onConflictDoNothing();
  } catch (error) {
    // If insert fails for any reason, still try to return the existing record
    console.warn(
      `Failed to insert screenshot for ${url}, fetching existing:`,
      error
    );
  }

  // Fetch the final record (either the one we just inserted or the one that won the race)
  const final = await db
    .select()
    .from(screenshots)
    .where(eq(screenshots.url, url))
    .limit(1);

  if (final.length > 0) {
    return { imageUrl: final[0].imageUrl, cached: false };
  }

  // Fallback: return the imageUrl we just uploaded
  // This shouldn't happen but provides a safety net
  return { imageUrl, cached: false };
}

/**
 * Step 4: Finalize the analysis
 */
async function finalizeAnalysisStep(
  analysisId: string,
  competitorsWithLinks: CompetitorWithLinks[],
  screenshotMap: ScreenshotMap,
  email: string,
  name: string,
  domain: string
): Promise<void> {
  "use step";

  console.log(`[Step 4] Finalizing analysis for ${name} (${email})`);
  const startTime = Date.now();

  // Prepare the final result
  const result = {
    competitors: competitorsWithLinks.map((competitor) => ({
      ...competitor,
      screenshots: competitor.links
        .map((link) => ({
          url: link,
          imageUrl: screenshotMap[link] || "",
        }))
        .filter((s) => s.imageUrl), // Only include successful screenshots
    })),
    generatedAt: new Date().toISOString(),
  };

  // Count statistics
  const totalScreenshots = Object.values(screenshotMap).filter(
    (url) => url
  ).length;
  const totalAttempted = Object.keys(screenshotMap).length;
  const successRate =
    totalAttempted > 0
      ? ((totalScreenshots / totalAttempted) * 100).toFixed(1)
      : "0";

  console.log(`[Step 4] Analysis statistics:`);
  console.log(`[Step 4]   - Competitors: ${competitorsWithLinks.length}`);
  console.log(`[Step 4]   - Total URLs: ${totalAttempted}`);
  console.log(`[Step 4]   - Successful screenshots: ${totalScreenshots}`);
  console.log(`[Step 4]   - Success rate: ${successRate}%`);

  // Update the analysis request with results
  await db
    .update(analysisRequests)
    .set({
      status: "completed",
      result: JSON.stringify(result),
      updatedAt: new Date(),
    })
    .where(eq(analysisRequests.id, analysisId));

  const duration = Date.now() - startTime;
  console.log(`[Step 4] ✓ Analysis saved to database in ${duration}ms`);

  // Send email notification
  console.log(`[Step 4] Sending email notification to ${email}...`);
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const analysisUrl = `${baseUrl}/analysis/${encodeURIComponent(domain)}`;
    
    const emailResult = await sendAnalysisCompleteEmail({
      to: email,
      firstName: name.split(' ')[0], // Use first name only
      domain,
      competitorCount: competitorsWithLinks.length,
      analysisUrl,
    });

    if (emailResult.success) {
      console.log(`[Step 4] ✓ Email sent successfully to ${email}`);
    } else {
      console.error(`[Step 4] ✗ Failed to send email: ${emailResult.error}`);
    }
  } catch (error) {
    console.error(`[Step 4] ✗ Error sending email:`, error);
    // Don't fail the entire workflow if email fails
  }
}

/**
 * Helper step to mark analysis as failed
 */
async function markAnalysisFailedStep(analysisId: string): Promise<void> {
  "use step";

  await db
    .update(analysisRequests)
    .set({
      status: "failed",
      updatedAt: new Date(),
    })
    .where(eq(analysisRequests.id, analysisId));
}
