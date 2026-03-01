"use client";
import type { UIMessage } from "ai";
import { ArrowUp, ClipboardCopy, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useStickToBottomContext } from "use-stick-to-bottom";
import { Action } from "@/components/ai-elements/actions";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { UserInputRequest } from "@/components/ai-elements/user-input-request";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type Message,
  type ToolCall,
  useStreamingChat,
} from "@/hooks/useStreamingChat"; // Custom hook
import { addMessageToChat, createNewChat } from "@/queries/chat";
import ChatInput, { type ChatInputHandle } from "./ChatInput";
import MessageAttachments from "./message-attachments";
import type { ProjectFileItem } from "./SearchPanel";
import { SearchSources } from "./SearchSources";

const promptsDict: Record<string, string[]> = {
  "Proposals & Pitches": [
    "Summarize the key value propositions in our Q2 proposal",
    "What pricing did we offer in the Acme Corp pitch?",
    "Compare the benefits section across all proposals",
  ],
  "Contracts & Legal": [
    "Draft a standard NDA for client onboarding",
    "Summarize key risks in our current contracts",
    "What clauses are missing in the vendor contract?",
  ],
  "Playbooks & Training": [
    "Generate onboarding steps for new sales reps",
    "Summarize the playbook for enterprise accounts",
    "List the best practices for closing deals",
  ],
};

type TextPart = { type: "text"; text: string };
type ToolInvocationPart = {
  type: "tool-invocation";
  toolInvocation: {
    toolCallId: string;
    toolName: string;
    args: unknown;
    state: string;
    result?: unknown;
  };
};
type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
};

function convertUIMessagesToMessages(uiMessages: UIMessage[]): Message[] {
  return uiMessages.map((m, _index) => {
    const parts = m.parts as (
      | TextPart
      | ToolInvocationPart
      | { type: string; text?: string }
    )[];

    const textParts = parts
      .filter((p): p is TextPart => p.type === "text")
      .map((p) => p.text)
      .join("");

    const reasoningParts = parts
      .filter((p) => p.type === "reasoning" && typeof p.text === "string")
      .map((p) => (p as { text: string }).text)
      .join("");

    // Handle both tool-invocation format and separate tool-call/tool-result formats
    const toolInvocationParts = parts.filter(
      (p): p is ToolInvocationPart => p.type === "tool-invocation"
    );

    const toolCallParts = parts.filter((p): p is any => p.type === "tool-call");

    const toolResultParts = parts.filter(
      (p): p is any => p.type === "tool-result"
    );

    // Process tool-invocation format
    const toolPartsFromInvocations = toolInvocationParts.map((p) => {
      const inv = p.toolInvocation;

      return {
        id: inv.toolCallId,
        name: inv.toolName,
        args: inv.args,
        state: inv.state === "result" ? "result" : "running",
        result: inv.result,
      } as ToolCall;
    });

    // Process separate tool-call and tool-result format
    const toolPartsFromSeparate: ToolCall[] = [];

    // First, collect all tool calls
    for (const callPart of toolCallParts) {
      // Find corresponding result
      const resultPart = toolResultParts.find(
        (r) => r.toolCallId === callPart.toolCallId
      );

      toolPartsFromSeparate.push({
        id: callPart.toolCallId,
        name: callPart.toolName,
        args: callPart.args,
        state: resultPart ? "result" : "running",
        result: resultPart?.output,
      } as ToolCall);
    }

    // Also check for standalone tool results (from separate messages)
    for (const resultPart of toolResultParts) {
      // Only add if not already processed with a call
      const alreadyProcessed = toolPartsFromSeparate.some(
        (tc) => tc.id === resultPart.toolCallId
      );

      if (!alreadyProcessed) {
        toolPartsFromSeparate.push({
          id: resultPart.toolCallId,
          name: resultPart.toolName,
          args: {},
          state: "result",
          result: resultPart.output,
        } as ToolCall);
      }
    }

    const toolParts = [...toolPartsFromInvocations, ...toolPartsFromSeparate];

    const convertedMessage = {
      id: m.id,
      role: m.role as "user" | "assistant" | "tool",
      content: textParts,
      // Hide tool calls in production environment
      toolCalls:
        process.env.NODE_ENV === "production"
          ? undefined
          : toolParts.length > 0
            ? toolParts
            : undefined,
      attachments: (m as { attachments?: unknown[] }).attachments,
      reasoning: reasoningParts || undefined,
    };

    return convertedMessage;
  });
}

type PersonalizedPrompt = {
  title: string;
  prompt: string;
  category?: string;
};

export default function ChatSection({
  chatId,
  initialMessages,
}: {
  chatId?: string;
  initialMessages?: UIMessage[];
}) {
  const router = useRouter();
  // Removed URL trigger mechanism; auto start now based solely on messages state.
  const [input, setInput] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(
    chatId || null
  );
  const autoTriggeredRef = useRef(false);
  const justCreatedChatRef = useRef(false);
  const justSentMessageRef = useRef(false);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const [personalizedPrompts, setPersonalizedPrompts] = useState<
    PersonalizedPrompt[]
  >([]);
  const [greeting, setGreeting] = useState("How can I assist you?");
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [thinkingText, setThinkingText] = useState("Thinking...");

  const thinkingSynonyms = [
    "Thinking...",
    "Processing...",
    "Analyzing...",
    "Generating...",
    "Working...",
  ];

  const {
    messages,
    setMessages,
    sendMessage,
    isLoading,
    streamingContent,
    streamingToolCalls,
    streamingReasoning,
    startFromExistingLastUserMessage,
  } = useStreamingChat({
    initialMessages: initialMessages
      ? convertUIMessagesToMessages(initialMessages)
      : [],
    api: "/api/chat",
  });

  const [_selectedCategory, _setSelectedCategory] = useState<
    keyof typeof promptsDict
  >(Object.keys(promptsDict)[0] as keyof typeof promptsDict);

  // Fetch personalized prompts on mount
  useEffect(() => {
    async function fetchPrompts() {
      try {
        const response = await fetch("/api/prompts");
        if (response.ok) {
          const data = await response.json();

          // Use default prompts if no personalized prompts exist
          const defaultPrompts: PersonalizedPrompt[] = Object.entries(
            promptsDict
          ).flatMap(([category, prompts]) =>
            prompts.map((prompt) => ({
              title: prompt,
              prompt,
              category,
            }))
          );

          if (data.prompts && data.prompts.length > 0) {
            setPersonalizedPrompts(data.prompts);
          } else {
            setPersonalizedPrompts(defaultPrompts);
          }

          if (data.greeting) {
            setGreeting(data.greeting);
          }
        } else {
          // Use default prompts on error
          const defaultPrompts: PersonalizedPrompt[] = Object.entries(
            promptsDict
          ).flatMap(([category, prompts]) =>
            prompts.map((prompt) => ({
              title: prompt,
              prompt,
              category,
            }))
          );
          setPersonalizedPrompts(defaultPrompts);
        }
      } catch (error) {
        console.error("Error fetching prompts:", error);
        // Use default prompts on error
        const defaultPrompts: PersonalizedPrompt[] = Object.entries(
          promptsDict
        ).flatMap(([category, prompts]) =>
          prompts.map((prompt) => ({
            title: prompt,
            prompt,
            category,
          }))
        );
        setPersonalizedPrompts(defaultPrompts);
      } finally {
        setIsLoadingPrompts(false);
      }
    }
    fetchPrompts();
  }, []);

  // Cycle through thinking synonyms
  useEffect(() => {
    const interval = setInterval(() => {
      setThinkingText((prev) => {
        const currentIndex = thinkingSynonyms.indexOf(prev);
        const nextIndex = (currentIndex + 1) % thinkingSynonyms.length;
        return thinkingSynonyms[nextIndex];
      });
    }, 1500); // Change every 1.5 seconds

    return () => clearInterval(interval);
  }, []);

  const copyMessage = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
        toast.error("Failed to copy");
      });
  };

  const handleSendMessage = async (
    text: string,
    attachmentItems: ProjectFileItem[] = []
  ) => {
    const value = text.trim();
    if (!value && attachmentItems.length === 0) {
      return;
    }

    // For now, don't process file attachments - just use metadata
    // TODO: Implement file blob fetching and conversion to data URLs
    const files: File[] = [];

    if (!activeChatId) {
      try {
        const newChat = await createNewChat();
        if (!newChat?.id) {
          toast.error("Failed to create chat");
          return;
        }
        // Do NOT set activeChatId or messages here.
        // This prevents the current component from triggering the AI response
        // before the navigation to the new page happens.
        // The new page will load the chat and trigger the response via its own useEffect.

        // Save user message to DB with metadata FIRST
        await addMessageToChat({
          chatId: newChat.id,
          role: "user",
          parts: [{ type: "text", text: value }],
          attachments: attachmentItems,
        });

        // Navigate to the new chat page.
        router.push(`/dashboard/chat/${newChat.id}`);

        // Clear attachments after successful send
        chatInputRef.current?.clearAttachments();
      } catch (err) {
        console.error("Error creating chat:", err);
        toast.error("Failed to create chat");
      }
      return;
    }

    // Existing chat
    try {
      // Save user message to DB with metadata FIRST
      await addMessageToChat({
        chatId: activeChatId,
        role: "user",
        parts: [{ type: "text", text: value }],
        attachments: attachmentItems,
      });

      // Send to API via hook with actual file blobs
      sendMessage(value, files, activeChatId);

      justSentMessageRef.current = true;

      // Clear attachments after successful send
      chatInputRef.current?.clearAttachments();
    } catch (err) {
      console.error("Error adding message:", err);
      toast.error("Failed to send message");
    }
  };

  useEffect(() => {
    // Auto trigger when there's exactly one user message and no assistant reply yet.
    if (autoTriggeredRef.current) {
      return;
    }
    if (justSentMessageRef.current) {
      justSentMessageRef.current = false;
      return;
    }
    if (!activeChatId) {
      return;
    }
    if (!messages || messages.length !== 1) {
      return;
    }
    const onlyMsg = messages[0];
    if (onlyMsg.role !== "user") {
      return;
    }

    // If chat was just created we already invoked sendMessage; skip duplicate streaming.
    if (justCreatedChatRef.current) {
      justCreatedChatRef.current = false;
      autoTriggeredRef.current = true;
      return;
    }

    // Trigger assistant response using existing user message without re-adding it.
    startFromExistingLastUserMessage(activeChatId);
    autoTriggeredRef.current = true;
  }, [activeChatId, messages, startFromExistingLastUserMessage]);

  return (
    <div className="relative flex h-screen flex-col overflow-clip rounded-2xl bg-[#161715] md:h-[97vh]">
      <div className="absolute top-0 z-10 flex w-full items-center justify-between border-border/40 border-b bg-[#161715]/80 px-4 py-3 backdrop-blur-xl sm:px-6 md:px-8 md:py-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
        </div>
        <Link href="/dashboard">
          <Button
            className="gap-2 rounded-lg font-medium text-sm shadow-sm transition-all hover:bg-secondary/80 hover:shadow-md dark:hover:bg-secondary/60"
            variant="secondary"
          >
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </Link>
      </div>

      <Conversation className="flex-1 overflow-hidden bg-[#161715] pt-16 md:pb-6 md:pt-18">
        <ConversationScrollButton className="-translate-x-1/2 sticky top-[85%] bottom-auto left-1/2 z-20 rounded-full bg-accent shadow-lg hover:bg-accent/90" />
        {messages.length === 0 && !input.trim() ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-start justify-center px-4 sm:px-6">
            <p className="mb-1 font-medium text-muted-foreground text-xs tracking-widest uppercase sm:text-sm">
              Salesient AI
            </p>
            <h1 className="mb-6 font-semibold text-2xl text-foreground tracking-tight sm:mb-8 sm:text-3xl md:text-4xl">
              {greeting}
            </h1>
            {!isLoadingPrompts && personalizedPrompts.length > 0 && (
              <div className="flex w-full flex-col gap-2 sm:gap-2.5">
                {personalizedPrompts.slice(0, 6).map((promptItem, idx) => (
                  <button
                    className="group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3 text-left text-foreground text-sm transition-all hover:border-border hover:bg-accent/60 hover:shadow-sm sm:px-5 sm:py-3.5 sm:text-base dark:bg-card/30 dark:hover:bg-accent/40"
                    key={`${promptItem.title}-${idx}`}
                    onClick={() => {
                      setInput(promptItem.prompt);
                    }}
                    type="button"
                  >
                    <span className="flex-1">{promptItem.title}</span>
                    <ArrowUp className="h-4 w-4 shrink-0 rotate-45 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
            {isLoadingPrompts && (
              <div className="flex w-full flex-col gap-2 sm:gap-2.5">
                {[1, 2, 3].map((i) => (
                  <Skeleton className="h-12 w-full rounded-xl" key={i} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <ChatMessages
            copyMessage={copyMessage}
            isLoading={isLoading}
            messages={messages}
            onSend={(text) => handleSendMessage(text)}
            streamingContent={streamingContent}
            // Hide streaming tool calls in production
            streamingReasoning={streamingReasoning}
            streamingToolCalls={
              process.env.NODE_ENV === "production" ? [] : streamingToolCalls
            }
            thinkingText={thinkingText}
          />
        )}
      </Conversation>

      <div className="relative">
        <ChatInput
          handleSend={(e, attachments) => {
            e.preventDefault();
            if (!input.trim() && (!attachments || attachments.length === 0)) {
              return;
            }
            handleSendMessage(input, attachments);
            setInput("");
          }}
          input={input}
          isLoading={isLoading}
          ref={chatInputRef}
          setInput={setInput}
        />
      </div>
    </div>
  );
}

function renderToolCall(
  toolCall: ToolCall,
  i: number,
  messageId: string,
  onSend: (text: string) => void
) {
  const isRunning = toolCall.state === "running";

  // Check for REQUEST_USER_INPUT tool
  if (toolCall.name === "REQUEST_USER_INPUT") {
    // Use input (arguments) to get fields
    const input = toolCall.args as unknown as {
      authConfigId?: string;
      fields?: Field[];
      logoUrl?: string;
      provider?: string;
    };
    if (input?.fields) {
      return (
        <UserInputRequest
          authConfigId={input.authConfigId}
          fields={input.fields}
          key={`${messageId}-tool-${i}`}
          logoUrl={input.logoUrl}
          onSubmit={(values) => {
            const text =
              `Here are the details for ${input.provider}:\n` +
              Object.entries(values)
                .map(([k, v]) => `${k}: ${v}`)
                .join("\n");
            onSend(text);
          }}
          provider={input.provider || ""}
        />
      );
    }
  }

  // Fallback for legacy user_input_request in result
  if (
    toolCall.state === "result" &&
    toolCall.result &&
    typeof toolCall.result === "object" &&
    (toolCall.result as unknown as { type?: string }).type ===
      "user_input_request"
  ) {
    const request = toolCall.result as unknown as {
      authConfigId?: string;
      fields?: Field[];
      logoUrl?: string;
      provider?: string;
    };
    return (
      <UserInputRequest
        authConfigId={request.authConfigId}
        fields={request.fields || []}
        key={`${messageId}-tool-${i}`}
        logoUrl={request.logoUrl}
        onSubmit={(values) => {
          const text =
            `Here are the details for ${request.provider}:\n` +
            Object.entries(values)
              .map(([k, v]) => `${k}: ${v}`)
              .join("\n");
          onSend(text);
        }}
        provider={request.provider || ""}
      />
    );
  }

  // Only show other tool UI in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <Tool className="my-2" defaultOpen={false} key={`${messageId}-tool-${i}`}>
      <ToolHeader
        state={
          toolCall.state === "running" ? "input-streaming" : "output-available"
        }
        title={isRunning ? <Shimmer>{toolCall.name}</Shimmer> : toolCall.name}
        type="tool-call"
      />
      <ToolContent>
        <ToolInput input={toolCall.args} />
        {toolCall.result && (
          <ToolOutput errorText={undefined} output={toolCall.result} />
        )}
      </ToolContent>
    </Tool>
  );
}

type ChatMessagesProps = {
  messages: Message[];
  isLoading: boolean;
  streamingContent: string;
  streamingToolCalls: ToolCall[];
  streamingReasoning: string;
  copyMessage: (text: string) => void;
  onSend: (text: string) => void;
  thinkingText: string;
};

function ChatMessages(props: ChatMessagesProps) {
  const {
    messages,
    isLoading,
    streamingContent,
    streamingToolCalls,
    streamingReasoning,
    copyMessage,
    onSend,
    thinkingText,
  } = props;
  const { scrollToBottom } = useStickToBottomContext();

  useEffect(() => {
    const lastMessage = messages.at(-1);
    if (lastMessage?.role === "user") {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Combine messages with streaming content
  const allMessages = [...messages];
  if (
    isLoading &&
    (streamingContent || streamingToolCalls.length > 0 || streamingReasoning)
  ) {
    allMessages.push({
      id: "streaming-message",
      role: "assistant",
      content: streamingContent,
      toolCalls: streamingToolCalls,
      reasoning: streamingReasoning || undefined,
    });
  } else if (
    isLoading &&
    allMessages.length > 0 &&
    allMessages.at(-1)?.role === "user"
  ) {
    // Show loading spinner if we are loading but no content yet
    allMessages.push({
      id: "loading-message",
      role: "assistant",
      content: "",
      toolCalls: [],
    });
  }

  return (
    <ConversationContent className="mx-auto max-w-3xl px-4 sm:px-6 md:max-w-4xl">
      {allMessages.map((message, index) => {
        // Determine if this is a tool-related message
        const isToolMessage =
          message.role === "tool" ||
          (message.toolCalls && message.toolCalls.length > 0);

        // Determine spacing based on message type and previous message
        const prevMessage = index > 0 ? allMessages[index - 1] : null;
        const prevIsToolMessage =
          prevMessage &&
          (prevMessage.role === "tool" ||
            (prevMessage.toolCalls && prevMessage.toolCalls.length > 0));

        // Use smaller spacing for tool messages, especially when consecutive
        let spacingClass = "mt-14"; // Default spacing
        if (isToolMessage && prevIsToolMessage) {
          spacingClass = "mt-4"; // Small spacing between consecutive tool messages
        } else if (isToolMessage || prevIsToolMessage) {
          spacingClass = "mt-6"; // Medium spacing when transitioning to/from tools
        }

        return (
          <div
            className={`flex text-base ${
              message.role === "user" ? "justify-end" : "justify-start"
            } ${index > 0 ? spacingClass : ""}`}
            key={message.id}
          >
            <div
              className={`group/msg relative flex flex-row ${
                message.role === "user"
                  ? "w-full justify-end md:max-w-[70%]"
                  : "w-full justify-start"
              }`}
            >
              <div
                className={`wrap-break-word max-w-full overflow-hidden rounded-2xl px-4 py-3 transition-all ${
                  message.role === "user"
                    ? "border border-border/70 bg-card shadow-sm dark:bg-muted/60"
                    : "bg-transparent text-foreground"
                }`}
              >
                {message.role === "user" ? (
                  <>
                    <MessageAttachments
                      attachments={message.attachments || []}
                    />
                    <div>{message.content}</div>
                  </>
                ) : (
                  <>
                    {/* Reasoning (Thinking) UI */}
                    {(message.reasoning ||
                      (message.id === "streaming-message" &&
                        streamingReasoning)) && (
                      <Reasoning
                        defaultOpen={false}
                        isStreaming={
                          message.id === "streaming-message" && isLoading
                        }
                      >
                        <ReasoningTrigger />
                        <ReasoningContent>
                          {message.id === "streaming-message"
                            ? streamingReasoning
                            : message.reasoning || ""}
                        </ReasoningContent>
                      </Reasoning>
                    )}

                    {/* Search Sources - Always show firesearch results */}
                    {message.toolCalls &&
                      message.toolCalls.length > 0 &&
                      message.toolCalls.some(
                        (tc) =>
                          tc.name === "firesearch" && tc.state === "result"
                      ) && (
                        <div className="mb-4">
                          {message.toolCalls
                            .filter(
                              (tc) =>
                                tc.name === "firesearch" &&
                                tc.state === "result"
                            )
                            .map((toolCall, i) => {
                              const result = toolCall.result as {
                                query?: string;
                                results?: Array<{
                                  url: string;
                                  title: string;
                                  description: string;
                                  image?: string;
                                  favicon?: string;
                                  author?: string;
                                  publishedDate?: string;
                                }>;
                              };

                              if (result.results && result.results.length > 0) {
                                return (
                                  <SearchSources
                                    key={`${message.id}-search-${i}`}
                                    query={result.query}
                                    sources={result.results}
                                  />
                                );
                              }
                              return null;
                            })}
                        </div>
                      )}

                    {/* Other Tool Calls - Only show in development */}
                    {process.env.NODE_ENV !== "production" &&
                      message.toolCalls &&
                      message.toolCalls.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {message.toolCalls
                            .filter((tc) => tc.name !== "firesearch")
                            .map((toolCall, i) =>
                              renderToolCall(toolCall, i, message.id, onSend)
                            )}
                        </div>
                      )}

                    {/* Text Content */}
                    {message.content && <Response>{message.content}</Response>}

                    {/* Loading Indicator if empty content and no tools */}
                    {message.id === "loading-message" &&
                      !message.content &&
                      (!message.toolCalls ||
                        message.toolCalls.length === 0) && (
                        <div className="flex min-w-60 flex-col gap-3">
                          <Shimmer className="font-medium text-sm">
                            {thinkingText}
                          </Shimmer>
                          <div className="space-y-2.5 pt-1">
                            <Skeleton className="h-3.5 w-[90%] rounded-md" />
                            <Skeleton className="h-3.5 w-[75%] rounded-md" />
                            <Skeleton className="h-3.5 w-[50%] rounded-md" />
                          </div>
                        </div>
                      )}
                  </>
                )}
              </div>
              {/* Only show copy button for completed messages with content, not during streaming or loading */}
              {message.id !== "streaming-message" &&
                message.id !== "loading-message" &&
                message.content &&
                message.content.trim() && (
                  <Action
                    className={`-bottom-8 absolute h-7 w-7 rounded-md p-0 opacity-0 transition-opacity group-hover/msg:opacity-100 ${
                      message.role === "user" ? "right-1" : "left-1"
                    }`}
                    onClick={() => copyMessage(message.content)}
                    tooltip="Copy to clipboard"
                  >
                    <ClipboardCopy className="h-3.5 w-3.5 text-muted-foreground" />
                  </Action>
                )}
            </div>
          </div>
        );
      })}
    </ConversationContent>
  );
}
