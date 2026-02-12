import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isValidFileTypeWithMime, processFile } from "@/lib/file-processing";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type - only allow PDF and TXT
    const validTypes = ["application/pdf", "text/plain"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and TXT files are allowed" },
        { status: 400 }
      );
    }

    // Validate file type using the utility
    if (!isValidFileTypeWithMime(file.name, file.type)) {
      return NextResponse.json(
        { error: "Invalid file type or extension mismatch" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process file using the existing utility
    const processedDoc = await processFile(buffer, file.name, file.type);

    let extractedText = processedDoc.text.trim();

    // Handle structured OCR response (Mistral OCR returns JSON with markdown)
    if (extractedText.startsWith("{") && extractedText.includes("pages")) {
      try {
        const ocrResult = JSON.parse(extractedText);

        // Extract markdown from pages
        if (ocrResult.pages && Array.isArray(ocrResult.pages)) {
          const markdownPages = ocrResult.pages
            .map((page: { markdown?: string }) => page.markdown)
            .filter(Boolean);

          if (markdownPages.length > 0) {
            extractedText = markdownPages.join("\n\n---\n\n");
          }
        }
      } catch (parseError) {
        // If JSON parsing fails, use the text as-is
        console.warn("Could not parse OCR JSON structure:", parseError);
      }
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "No text could be extracted from the file" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      extractedText: extractedText.trim(),
      fileName: file.name,
      fileType: processedDoc.metadata.fileType,
      metadata: processedDoc.metadata,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      {
        error: "Failed to process file",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
