import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type FileObject = {
  Key?: string;
  LastModified?: Date;
  ETag?: string;
  Size?: number;
  StorageClass?: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const R2_ACCOUNT_ID = getRequiredEnv("R2_ACCOUNT_ID");
const R2_ACCESS_KEY_ID = getRequiredEnv("R2_ACCESS_KEY_ID");
const R2_SECRET_ACCESS_KEY = getRequiredEnv("R2_SECRET_ACCESS_KEY");
const R2_BUCKET = getRequiredEnv("R2_BUCKET");

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a file to Cloudflare R2
 * @param objectName - object key/path in R2 (e.g., userId/files/document.pdf)
 * @param fileBuffer - file content as Buffer
 * @param metadata - optional metadata
 * @returns object name if successful
 */
export async function uploadToMinIO(
  objectName: string,
  fileBuffer: Buffer,
  metadata?: Record<string, string>
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: objectName,
    Body: fileBuffer,
    ContentType: "application/octet-stream",
    Metadata: metadata,
  });

  try {
    await S3.send(command);
    return objectName;
  } catch (error) {
    console.error("R2 upload error:", error);
    throw new Error(`Failed to upload file to R2: ${error}`);
  }
}

/**
 * Download a file from Cloudflare R2
 * @param objectName - object key/path in R2
 * @returns file content as Buffer
 */
export async function downloadFromMinIO(objectName: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: objectName,
  });

  try {
    const response = await S3.send(command);
    const chunks: Uint8Array[] = [];

    if (!response.Body) {
      throw new Error("No file content received");
    }

    // @ts-expect-error - response.Body is a ReadableStream in AWS SDK v3
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error("R2 download error:", error);
    throw new Error(`Failed to download file from R2: ${error}`);
  }
}

/**
 * List all objects in a prefix path
 * @param prefix - object prefix/path (e.g., userId/)
 * @returns array of object metadata
 */
export async function listFromMinIO(prefix: string): Promise<FileObject[]> {
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET,
    Prefix: prefix,
  });

  try {
    const response = await S3.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error("R2 list error:", error);
    throw new Error(`Failed to list files from R2: ${error}`);
  }
}

/**
 * Delete a file from Cloudflare R2
 * @param objectName - object key/path in R2
 */
export async function deleteFromMinIO(objectName: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: objectName,
  });

  try {
    await S3.send(command);
  } catch (error) {
    console.error("R2 delete error:", error);
    throw new Error(`Failed to delete file from R2: ${error}`);
  }
}

/**
 * Generate a presigned URL for a file (temporary access)
 * @param objectName - object key/path in R2
 * @param expirySeconds - expiry time in seconds (default 24 hours)
 * @returns presigned URL
 */
export async function getPresignedURL(
  objectName: string,
  expirySeconds = 86_400
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: objectName,
  });

  try {
    const signedUrl = await getSignedUrl(S3, command, {
      expiresIn: expirySeconds,
    });
    return signedUrl;
  } catch (error) {
    console.error("R2 presigned URL error:", error);
    throw new Error(`Failed to generate presigned URL: ${error}`);
  }
}
