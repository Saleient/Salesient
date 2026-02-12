import JSZip from "jszip";
import mammoth from "mammoth";
import Papa from "papaparse";
import { read as xlsxRead, utils as xlsxUtils } from "xlsx";
import { aiMicroserviceClient } from "@/lib/ai-microservice";

/**
 * File Processing Pipeline for Document Management
 * Handles PDF, DOCX, PPTX, XLSX, CSV, TXT, MD
 */

// Constants for regex patterns to avoid performance issues
const SLIDE_REGEX = /ppt\/slides\/slide\d+\.xml/;
const JSON_REGEX = /\{[\s\S]*\}/;
const TEXT_TAG_REGEX = /<\/?a:t>/g;

// Type definitions
export type ProcessedDocument = {
  text: string;
  metadata: {
    fileType: string;
    processedAt: string;
    originalFormat: string;
    pageCount?: number;
    hasOCR?: boolean;
    csvMetadata?: CSVMetadata;
  };
};

export type CSVMetadata = {
  headers: string[];
  rowCount: number;
  columnMappings: Record<string, string>;
};

// MIME type mappings
const EXTENSION_MIME_MAP: Record<string, string[]> = {
  pdf: ["application/pdf"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  pptx: [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  xls: ["application/vnd.ms-excel"],
  csv: ["text/csv", "application/csv"],
  txt: ["text/plain"],
  md: ["text/markdown", "text/plain"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
  gif: ["image/gif"],
};

/**
 * Get user-friendly category for a file based on extension
 */
export function getFileCategory(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return "PDF Document";
    case "docx":
      return "Word Document";
    case "pptx":
      return "PowerPoint Presentation";
    case "xlsx":
    case "xls":
      return "Excel Spreadsheet";
    case "csv":
      return "CSV Data";
    case "txt":
      return "Plain Text";
    case "md":
      return "Markdown Document";
    case "jpg":
    case "jpeg":
      return "JPEG Image";
    case "png":
      return "PNG Image";
    case "webp":
      return "WEBP Image";
    case "gif":
      return "GIF Image";
    default:
      return "Unknown";
  }
}

/**
 * Main entry point for processing any file type
 */
export async function processFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ProcessedDocument> {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const canonical = resolveFileType(extension, mimeType);

  switch (canonical) {
    case "pdf":
      return await processPDF(buffer);
    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
    case "gif":
      return await processImage(buffer, extension || "image");
    case "docx":
      return await processDOCX(buffer);
    case "pptx":
      return await processPPTX(buffer);
    case "xlsx":
    case "xls":
      return await processExcel(buffer);
    case "csv":
      return await processCSV(buffer);
    case "txt":
    case "md":
      return processPlainText(buffer, canonical);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

/**
 * Process PDF via Mistral OCR API only
 */
async function processPDF(buffer: Buffer): Promise<ProcessedDocument> {
  try {
    console.log("Processing PDF with Gemini OCR...");
    const text = await performOcrWithGemini(buffer, "application/pdf");
    return {
      text,
      metadata: {
        fileType: "pdf",
        processedAt: new Date().toISOString(),
        originalFormat: "pdf",
        hasOCR: true,
      },
    };
  } catch (error) {
    console.error("PDF processing error:", error);
    throw new Error(
      `Failed to process PDF: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Process Image (JPG, PNG, WEBP, GIF) via Mistral OCR/vision
 */
async function processImage(
  buffer: Buffer,
  format: string
): Promise<ProcessedDocument> {
  try {
    console.log(`Processing image (${format}) with Gemini OCR...`);
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    const mimeType = mimeMap[format] || "image/jpeg";
    const text = await performOcrWithGemini(buffer, mimeType);
    return {
      text,
      metadata: {
        fileType: format,
        processedAt: new Date().toISOString(),
        originalFormat: format,
        hasOCR: true,
      },
    };
  } catch (error) {
    console.error("Image processing error:", error);
    throw new Error(
      `Failed to process image: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Process DOCX: Convert to text
 */
async function processDOCX(buffer: Buffer): Promise<ProcessedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();

    if (!text) {
      throw new Error("No text extracted from DOCX");
    }

    return {
      text,
      metadata: {
        fileType: "docx",
        processedAt: new Date().toISOString(),
        originalFormat: "docx",
      },
    };
  } catch (error) {
    console.error("DOCX processing error:", error);
    throw new Error(`Failed to process DOCX: ${error}`);
  }
}

/**
 * Process PPTX: Convert to PDF then process
 * Note: For serverless, we extract text directly from PPTX XML structure
 */
async function processPPTX(buffer: Buffer): Promise<ProcessedDocument> {
  try {
    // PPTX is a ZIP file containing XML
    // We'll use mammoth's underlying approach but for presentations
    // For a complete solution, you might want to use a dedicated PPTX parser
    // or convert to PDF server-side using a service

    // Simplified approach: Extract text from PPTX XML structure
    const zip = await JSZip.loadAsync(buffer);

    let extractedText = "";
    const slideFiles = Object.keys(zip.files).filter((name) =>
      SLIDE_REGEX.test(name)
    );

    for (const slideFile of slideFiles) {
      const content = await zip.files[slideFile].async("text");
      // Extract text between <a:t> tags
      const textMatches = content.match(/<a:t>([^<]+)<\/a:t>/g);
      if (textMatches) {
        const slideText = textMatches
          .map((match) => match.replace(TEXT_TAG_REGEX, ""))
          .join(" ");
        extractedText += `${slideText}\n\n`;
      }
    }

    if (!extractedText.trim()) {
      throw new Error("No text extracted from PPTX");
    }

    return {
      text: extractedText.trim(),
      metadata: {
        fileType: "pptx",
        processedAt: new Date().toISOString(),
        originalFormat: "pptx",
        pageCount: slideFiles.length,
      },
    };
  } catch (error) {
    console.error("PPTX processing error:", error);
    throw new Error(`Failed to process PPTX: ${error}`);
  }
}

/**
 * Process Excel: Convert to CSV first, then process
 */
async function processExcel(buffer: Buffer): Promise<ProcessedDocument> {
  try {
    const workbook = xlsxRead(buffer, { type: "buffer" });

    // Process all sheets
    let allText = "";

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const csvData = xlsxUtils.sheet_to_csv(worksheet);

      // Convert CSV to structured sentences
      const processed = await processCSVData(csvData);
      allText += `\n\n=== Sheet: ${sheetName} ===\n\n${processed.text}`;
    }

    return {
      text: allText.trim(),
      metadata: {
        fileType: "excel",
        processedAt: new Date().toISOString(),
        originalFormat: "xlsx",
      },
    };
  } catch (error) {
    console.error("Excel processing error:", error);
    throw new Error(`Failed to process Excel: ${error}`);
  }
}

/**
 * Process CSV: Parse and convert to natural language sentences
 */
async function processCSV(buffer: Buffer): Promise<ProcessedDocument> {
  try {
    const csvText = buffer.toString("utf-8");
    return await processCSVData(csvText);
  } catch (error) {
    console.error("CSV processing error:", error);
    throw new Error(`Failed to process CSV: ${error}`);
  }
}

/**
 * Process CSV data and convert to natural language
 */
async function processCSVData(csvText: string): Promise<ProcessedDocument> {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.warn("CSV parsing warnings:", parsed.errors);
  }

  const data = parsed.data as Record<string, string>[];
  const headers = parsed.meta.fields || [];

  if (headers.length === 0 || data.length === 0) {
    throw new Error("Empty or invalid CSV file");
  }

  // Generate metadata mapping using LLM
  const columnMappings = await generateColumnMappings(headers);

  // Convert each row to a natural language sentence
  const sentences: string[] = [];

  for (const row of data) {
    const sentence = await convertRowToSentence(row, columnMappings);
    if (sentence) {
      sentences.push(sentence);
    }
  }

  return {
    text: sentences.join("\n"),
    metadata: {
      fileType: "csv",
      processedAt: new Date().toISOString(),
      originalFormat: "csv",
      csvMetadata: {
        headers,
        rowCount: data.length,
        columnMappings,
      },
    },
  };
}

/**
 * Generate semantic column mappings using microservice
 */
async function generateColumnMappings(
  headers: string[]
): Promise<Record<string, string>> {
  try {
    return await aiMicroserviceClient.generateColumnMappings({
      headers,
    });
  } catch (error) {
    console.error("Failed to generate column mappings:", error);
    // Fallback to simple mapping
    return headers.reduce(
      (acc, header) => {
        acc[header] = header.toLowerCase().replace(/\s+/g, "_");
        return acc;
      },
      {} as Record<string, string>
    );
  }
}

/**
 * Convert a CSV row to a natural language sentence
 */
async function convertRowToSentence(
  row: Record<string, string>,
  mappings: Record<string, string>
): Promise<string | null> {
  try {
    // Build a structured representation
    const values: Record<string, string> = {};
    for (const [header, value] of Object.entries(row)) {
      if (value?.trim()) {
        const semanticKey = mappings[header] || header;
        values[semanticKey] = value.trim();
      }
    }

    if (Object.keys(values).length === 0) {
      return null;
    }

    // Generate natural sentence using microservice
    const sentence = await aiMicroserviceClient.convertRowToSentence({
      row: values,
      mappings,
    });

    return sentence.trim().replace(/^["']|["']$/g, "");
  } catch (error) {
    console.error("Failed to convert row to sentence:", error);
    // Fallback to simple concatenation
    return Object.entries(row)
      .filter(([_, value]) => value?.trim())
      .map(([_, value]) => value)
      .join(" ");
  }
}

/**
 * Process plain text files (TXT, MD)
 */
function processPlainText(
  buffer: Buffer,
  extension: string
): ProcessedDocument {
  const text = buffer.toString("utf-8").trim();

  if (!text) {
    throw new Error("Empty text file");
  }

  return {
    text,
    metadata: {
      fileType: extension,
      processedAt: new Date().toISOString(),
      originalFormat: extension,
    },
  };
}

/**
 * Perform OCR using microservice (supports PDF & images)
 */
async function performOcrWithGemini(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): Promise<string> {
  try {
    const base64 = buffer.toString("base64");

    const result = await aiMicroserviceClient.performOcr({
      fileData: base64,
      mimeType,
      fileName,
    });

    return result.text;
  } catch (error) {
    console.error("Microservice OCR error:", error);
    throw new Error(
      `Failed to perform OCR: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Validate file type before processing
 */
export function isValidFileType(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const validExtensions = [
    "pdf",
    "docx",
    "pptx",
    "xlsx",
    "xls",
    "csv",
    "txt",
    "md",
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
  ];
  return validExtensions.includes(extension || "");
}

/**
 * Resolve canonical extension using both filename extension and mimeType.
 * If extension is missing or mismatched but mimeType maps to a known type, prefer mime mapping.
 */
function resolveFileType(ext: string | undefined, mimeType: string): string {
  const lowerMime = (mimeType || "").toLowerCase();

  // Direct match: extension recognized and mime allowed for it
  if (ext && EXTENSION_MIME_MAP[ext]) {
    const allowed = EXTENSION_MIME_MAP[ext];
    if (!allowed.includes(lowerMime)) {
      // Try to find a different extension whose mime list includes the provided mime
      const inferred = Object.keys(EXTENSION_MIME_MAP).find((key) =>
        EXTENSION_MIME_MAP[key].includes(lowerMime)
      );
      if (inferred) {
        return inferred; // mimeType overrides suspicious extension
      }
      throw new Error(
        `MIME type '${lowerMime}' not valid for extension '.${ext}'. Allowed: ${allowed.join(
          ", "
        )}`
      );
    }
    return ext;
  }

  // Extension not recognized; attempt inference from mime
  const inferred = Object.keys(EXTENSION_MIME_MAP).find((key) =>
    EXTENSION_MIME_MAP[key].includes(lowerMime)
  );
  if (inferred) {
    return inferred;
  }

  throw new Error(
    `Unsupported file: extension='${ext ?? "<none>"}', mime='${lowerMime}'`
  );
}

/**
 * Validate extension + mime combination externally if needed
 */
export function isValidFileTypeWithMime(
  fileName: string,
  mimeType: string
): boolean {
  try {
    const ext = fileName.split(".").pop()?.toLowerCase();
    resolveFileType(ext, mimeType);
    return true;
  } catch {
    return false;
  }
}
