import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Upload an image buffer to R2 and return the public URL
 * @param buffer - The image buffer to upload
 * @param key - The key/path to store the image at
 * @param contentType - The content type of the image
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToR2(
  buffer: Buffer,
  key: string,
  contentType: string = "image/png"
): Promise<string> {
  const bucketName = process.env.R2_BUCKET_NAME || "";
  const publicDomain = process.env.R2_PUBLIC_DOMAIN || "";

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return the public URL
  return `https://${publicDomain}/${key}`;
}

