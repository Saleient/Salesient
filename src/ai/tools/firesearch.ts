import FirecrawlApp from "@mendable/firecrawl-js";
import { tool } from "ai";
import { z } from "zod";
import { serverEnv } from "@/env";

export const Firesearch = tool({
  description:
    "Search the web for information using Firecrawl. Returns a list of search results with titles, descriptions, URLs, and images. Use this when the user asks to search for something on the web or needs current information.",
  inputSchema: z.object({
    query: z.string().describe("The search query to look up on the web."),
    limit: z
      .number()
      .optional()
      .default(5)
      .describe("Maximum number of search results to return. Default is 5."),
  }),
  execute: async ({ query, limit = 5 }: { query: string; limit?: number }) => {
    try {
      const firecrawl = new FirecrawlApp({
        apiKey: serverEnv.FIRECRAWL_API_KEY,
      });
      console.log(`Searching the web for: ${query}`);

      const start = Date.now();

      const searchResponse = await firecrawl.search(query, { limit });

      console.log(
        "Firecrawl raw search response keys:",
        Object.keys(searchResponse || {}).join(", ")
      );
      console.log("Firecrawl search response:", searchResponse);

      // Firecrawl search can return categorized arrays under keys like: web, news, reddit, youtube, github, arxiv, tweets
      const CATEGORY_KEYS = [
        "web",
        "news",
        "reddit",
        "youtube",
        "github",
        "arxiv",
        "tweets",
      ];

      const aggregated: any[] = CATEGORY_KEYS.flatMap((k) => {
        const bucket = (searchResponse as any)?.[k];
        return Array.isArray(bucket) ? bucket : [];
      });

      // Some versions may return a top-level array or a 'data' property; include those fallbacks too.
      if (Array.isArray(searchResponse)) {
        aggregated.push(...searchResponse);
      } else if (Array.isArray((searchResponse as any)?.data)) {
        aggregated.push(...(searchResponse as any).data);
      }

      // De-duplicate by URL
      const deduped = aggregated.filter(
        (item, idx, arr) =>
          item?.url && arr.findIndex((o: any) => o.url === item.url) === idx
      );

      if (deduped.length === 0) {
        return {
          query,
          results: [],
          response_time: (Date.now() - start) / 1000,
          source: "firesearch",
          message: `No results found for: ${query}`,
        };
      }

      const sliced = deduped.slice(0, limit);
      console.log(
        `Firecrawl aggregated ${deduped.length} results; returning ${sliced.length}`
      );

      const results = sliced.map((item: any) => {
        const url: string = item.url;
        let favicon: string | undefined;
        try {
          favicon = url
            ? `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`
            : undefined;
        } catch {
          favicon = undefined;
        }
        return {
          url,
          title:
            item.title ||
            (url ? url.split("/").pop() : "Untitled") ||
            "Untitled",
          description: item.description || "",
          content: item.content || "",
          image: item.image || item.ogImage || item.thumbnail || undefined,
          favicon,
          author: item.author || undefined,
          publishedDate: item.publishedDate || undefined,
          language: item.language || "en",
          position: item.position || undefined,
        };
      });

      return {
        query,
        results,
        response_time: (Date.now() - start) / 1000,
        source: "firesearch",
        total_results: results.length,
      };
    } catch (error) {
      console.error("Firesearch error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to search the web",
        results: [],
        query,
      };
    }
  },
});
