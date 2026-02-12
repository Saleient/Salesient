import FirecrawlApp from "@mendable/firecrawl-js";
import { tool } from "ai";
import { z } from "zod";
import { serverEnv } from "@/env";

export const Firecrawl = tool({
  description:
    "Retrieve the full content from a URL using Firecrawl. Returns text, title, summary, images, and more.",
  inputSchema: z.object({
    url: z.string().describe("The URL to retrieve the information from."),
    include_summary: z
      .boolean()
      .describe(
        "Whether to include a summary of the content. Default is true."
      ),
  }),
  execute: async ({ url }: { url: string; include_summary?: boolean }) => {
    try {
      const firecrawl = new FirecrawlApp({
        apiKey: serverEnv.FIRECRAWL_API_KEY,
      });
      console.log(`Retrieving content from ${url} with Firecrawl`);

      const start = Date.now();

      const scrapeResponse = await firecrawl.scrape(url, {
        formats: ["markdown"],
      });
      console.log("Firecrawl scrape response:", scrapeResponse);

      if (!scrapeResponse) {
        throw new Error(`Firecrawl failed to scrape: ${url}`);
      }

      console.log(`Firecrawl successfully scraped ${url}`);

      return {
        base_url: url,
        results: [
          {
            url,
            content: scrapeResponse.markdown || scrapeResponse.html || "",
            title:
              scrapeResponse.metadata?.title ||
              url.split("/").pop() ||
              "Retrieved Content",
            description:
              scrapeResponse.metadata?.description ||
              `Content retrieved from ${url}`,
            author: scrapeResponse.metadata?.author || undefined,
            publishedDate: scrapeResponse.metadata?.publishedDate || undefined,
            image:
              scrapeResponse.metadata?.image ||
              scrapeResponse.metadata?.ogImage ||
              undefined,
            favicon: `https://www.google.com/s2/favicons?domain=${
              new URL(url).hostname
            }&sz=128`,
            language: scrapeResponse.metadata?.language || "en",
          },
        ],
        response_time: (Date.now() - start) / 1000,
        source: "firecrawl",
      };
    } catch (error) {
      console.error("Firecrawl error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to retrieve content",
        results: [],
      };
    }
  },
});
