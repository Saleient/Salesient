"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function NewChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  useEffect(() => {
    const createAndRedirect = async () => {
      try {
        if (!query) {
          // If no query, just create empty chat
          const response = await fetch("/api/chat/new", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: "" }),
          });

          if (!response.ok) {
            throw new Error("Failed to create chat");
          }

          const { chatId } = await response.json();
          router.push(`/dashboard/chat/${chatId}`);
          return;
        }

        // Create chat with initial query message
        const response = await fetch("/api/chat/new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error("Failed to create chat");
        }

        const { chatId } = await response.json();
        router.push(`/dashboard/chat/${chatId}`);
      } catch (error) {
        console.error("Error creating chat:", error);
        // Fallback: redirect to dashboard
        router.push("/dashboard");
      }
    };

    createAndRedirect();
  }, [query, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Creating new chat...</p>
      </div>
    </div>
  );
}

export default function NewChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <NewChatContent />
    </Suspense>
  );
}
