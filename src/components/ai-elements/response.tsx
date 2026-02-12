"use client";

import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "prose prose-neutral dark:prose-invert prose-lg max-w-none prose-p:pb-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      shikiTheme={["github-dark", "github-dark"]}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
