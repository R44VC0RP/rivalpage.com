import * as screenshotone from 'screenshotone-api-sdk';

/**
 * Take a screenshot of a URL using ScreenshotOne API SDK
 * More reliable and better rate limits than Cloudflare
 * @param url - The URL to screenshot
 * @returns Buffer containing the screenshot image
 */
export async function takeScreenshot(url: string): Promise<Buffer> {
  const accessKey = process.env.SCREENSHOTONE_ACCESS_KEY || "";
  const secretKey = process.env.SCREENSHOTONE_SECRET_KEY || "";

  // Create API client
  const client = new screenshotone.Client(accessKey, secretKey);

  // Set up options
  const options = screenshotone.TakeOptions
    .url(url)
    .format("png")
    .blockAds(true)
    .blockCookieBanners(true)
    .blockBannersByHeuristics(false)
    .blockTrackers(true)
    .delay(3) // Wait 3 seconds for page to load
    .timeout(60)
    .captureBeyondViewport(false)
    .responseType("by_format")
    .fullPage(false)
    .viewportWidth(1920)
    .viewportHeight(1080)
    .imageQuality(80);

  // Download the screenshot
  const blob = await client.take(options);
  const buffer = Buffer.from(await blob.arrayBuffer());

  return buffer;
}

/**
 * Alternative: Take a screenshot using Cloudflare Browser Rendering API
 * (Kept as fallback option)
 */
export async function takeScreenshotCloudflare(url: string): Promise<Buffer> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
  const apiToken = process.env.CLOUDFLARE_API_TOKEN || "";

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/screenshot`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: url,
      options: {
        fullPage: false,
        type: "png",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to take screenshot: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

