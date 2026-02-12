"use client";

import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

type SearchSource = {
  url: string;
  title: string;
  description: string;
  image?: string;
  favicon?: string;
  author?: string;
  publishedDate?: string;
};

type SearchSourcesProps = {
  sources: SearchSource[];
  query?: string;
};

export function SearchSources({ sources, query }: SearchSourcesProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="my-4 space-y-3">
      {query && (
        <div className="font-medium text-muted-foreground text-sm">
          Search results for: &quot;{query}&quot;
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source, index) => (
          <Card
            className="group relative overflow-hidden transition-all hover:shadow-md"
            key={`${source.url}-${index}`}
          >
            <a
              className="block"
              href={source.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {/* Image Preview */}
              {source.image && (
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  <img
                    alt={source.title}
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={source.image}
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Title with favicon */}
                <div className="mb-2 flex items-start gap-2">
                  {source.favicon && (
                    <img
                      alt=""
                      className="mt-1 shrink-0 h-4 w-4 rounded-sm"
                      height={16}
                      width={16}
                      loading="lazy"
                      src={source.favicon}
                    />
                  )}
                  <h3 className="line-clamp-2 font-semibold text-foreground text-sm leading-tight group-hover:text-primary">
                    {source.title}
                  </h3>
                  <ExternalLink className="ml-auto mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                {/* Description */}
                {source.description && (
                  <p className="mb-2 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
                    {source.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  {source.author && (
                    <span className="truncate">{source.author}</span>
                  )}
                  {source.author && source.publishedDate && <span>•</span>}
                  {source.publishedDate && (
                    <span className="truncate">
                      {new Date(source.publishedDate).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  )}
                </div>

                {/* URL preview */}
                <div className="mt-2 truncate text-muted-foreground/70 text-xs">
                  {new URL(source.url).hostname}
                </div>
              </div>
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
