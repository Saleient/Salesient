import { nanoid } from "nanoid";
import { useCallback, useRef, useState } from "react";

export type ToolCall = {
  id: string;
  name: string;
  args: any;
  state: "running" | "result" | "error";
  result?: any;
};

export type Message = {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: ToolCall[];
  attachments?: any[];
  reasoning?: string; // Aggregated reasoning text (if model provides thinking parts)
};

type StreamingState = {
  messages: Message[];
  isLoading: boolean;
  streamingContent: string;
  streamingToolCalls: ToolCall[];
  streamingReasoning?: string;
};

function parseUIMessage(raw: any): Message {
  let content = "";
  let toolCalls: ToolCall[] = [];
  let reasoning = "";

  if (typeof raw.content === "string") {
    content = raw.content;
  }

  if (Array.isArray(raw.parts)) {
    content = raw.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");

    reasoning = raw.parts
      .filter((p: any) => p.type === "reasoning")
      .map((p: any) => p.text)
      .join("");

    const toolParts = raw.parts
      .filter((p: any) => p.type === "tool-invocation")
      .map((p: any) => {
        const inv = p.toolInvocation;
        return {
          id: inv.toolCallId,
          name: inv.toolName,
          args: inv.args,
          state: inv.state === "result" ? "result" : "running",
          result: inv.result,
        } as ToolCall;
      });
    toolCalls = [...toolCalls, ...toolParts];
  }

  if (Array.isArray(raw.toolInvocations)) {
    const tools = raw.toolInvocations.map((inv: any) => ({
      id: inv.toolCallId,
      name: inv.toolName,
      args: inv.args,
      state: inv.state === "result" ? "result" : "running",
      result: inv.result,
    }));
    toolCalls = [...toolCalls, ...tools];
  }

  return {
    id: raw.id,
    role: raw.role,
    content,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    attachments: raw.attachments,
    reasoning: reasoning || undefined,
  };
}

export function useStreamingChat({
  initialMessages = [],
  api = "/api/chat",
  onFinish,
}: {
  initialMessages?: Message[];
  api?: string;
  onFinish?: (message: Message) => void;
} = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingToolCalls, setStreamingToolCalls] = useState<ToolCall[]>([]);
  const [streamingReasoning, setStreamingReasoning] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, files: File[] = [], chatId?: string) => {
      if (isLoading) {
        return;
      }

      // Convert files to data URLs
      const fileAttachments = await Promise.all(
        files.map(async (file) => {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          return {
            type: "file" as const,
            filename: file.name,
            mediaType: file.type,
            url: dataUrl,
          };
        })
      );

      const userMessage: Message = {
        id: nanoid(),
        role: "user",
        content,
        attachments: fileAttachments,
      };

      // Optimistically add user message
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setStreamingContent("");
      setStreamingToolCalls([]);
      setStreamingReasoning("");

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            id: chatId,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Chat API error: ${response.status}`);
        }

        if (!response.body) {
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let currentContent = "";
        const currentToolCalls: ToolCall[] = [];
        let currentReasoning = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) {
              continue;
            }

            let textToParse = line;
            if (line.startsWith("data: ")) {
              textToParse = line.slice(6);
              if (textToParse.trim() === "[DONE]") {
                continue;
              }
            }

            // 1. Try parsing as JSON (createUIMessageStreamResponse format or SSE JSON)
            try {
              const json = JSON.parse(textToParse);

              // If it's an array, it's the full list of messages
              if (Array.isArray(json)) {
                const newMessages = json.map(parseUIMessage);
                setMessages(newMessages);

                // Update streaming state from the last message if it's assistant
                const lastMsg = newMessages.at(-1);
                if (lastMsg && lastMsg.role === "assistant") {
                  setStreamingContent("");
                  setStreamingToolCalls([]);
                }
                continue;
              }

              // Handle Open Rube style SSE events (text-delta, etc) - just in case
              if (json.type === "text-delta") {
                currentContent += json.delta || "";
                setStreamingContent(currentContent);
                continue;
              }
              if (
                json.type === "reasoning-delta" ||
                json.type === "reasoning"
              ) {
                const delta = json.delta || json.text || "";
                currentReasoning += delta;
                setStreamingReasoning(currentReasoning);
                continue;
              }
              if (json.type === "tool-input-start") {
                const existingIndex = currentToolCalls.findIndex(
                  (tc) => tc.id === json.toolCallId
                );
                if (existingIndex === -1) {
                  currentToolCalls.push({
                    id: json.toolCallId,
                    name: json.toolName,
                    args: {},
                    state: "running",
                  });
                }
                setStreamingToolCalls([...currentToolCalls]);
                continue;
              }
              if (json.type === "tool-input-available") {
                const existingIndex = currentToolCalls.findIndex(
                  (tc) => tc.id === json.toolCallId
                );
                if (existingIndex !== -1) {
                  currentToolCalls[existingIndex].args = json.input || {};
                  setStreamingToolCalls([...currentToolCalls]);
                }
                continue;
              }
              if (json.type === "tool-output-available") {
                const existingIndex = currentToolCalls.findIndex(
                  (tc) => tc.id === json.toolCallId
                );
                if (existingIndex !== -1) {
                  currentToolCalls[existingIndex].state = "result";
                  currentToolCalls[existingIndex].result = json.output;
                  setStreamingToolCalls([...currentToolCalls]);
                }
                continue;
              }
            } catch (_e) {
              // Not JSON, try Data Stream Protocol
            }

            // 2. Parse Data Stream Protocol (type:value)
            const colonIndex = line.indexOf(":");
            if (colonIndex !== -1) {
              const type = line.slice(0, colonIndex);
              const rawValue = line.slice(colonIndex + 1);

              try {
                // 0: Text delta
                if (type === "0") {
                  const text = JSON.parse(rawValue);
                  currentContent += text;
                  setStreamingContent(currentContent);
                } else if (type === "2") {
                  const reasoningDelta = JSON.parse(rawValue);
                  currentReasoning += reasoningDelta;
                  setStreamingReasoning(currentReasoning);
                }

                // 9: Tool call start/update
                else if (type === "9") {
                  const toolCallData = JSON.parse(rawValue);
                  const existingIndex = currentToolCalls.findIndex(
                    (tc) => tc.id === toolCallData.toolCallId
                  );

                  if (existingIndex === -1) {
                    currentToolCalls.push({
                      id: toolCallData.toolCallId,
                      name: toolCallData.toolName,
                      args: toolCallData.args,
                      state: "running",
                    });
                  } else {
                    currentToolCalls[existingIndex].args = toolCallData.args;
                  }
                  setStreamingToolCalls([...currentToolCalls]);
                }

                // a: Tool result
                else if (type === "a") {
                  const toolResultData = JSON.parse(rawValue);
                  const existingIndex = currentToolCalls.findIndex(
                    (tc) => tc.id === toolResultData.toolCallId
                  );
                  if (existingIndex !== -1) {
                    currentToolCalls[existingIndex].state = "result";
                    currentToolCalls[existingIndex].result =
                      toolResultData.result;
                    setStreamingToolCalls([...currentToolCalls]);
                  }
                }
              } catch (e) {
                console.error("Error parsing stream line:", line, e);
              }
            }
          }
        }

        // Finished (only needed if we were building manually)
        if (currentContent || currentToolCalls.length > 0 || currentReasoning) {
          const assistantMessage: Message = {
            id: nanoid(),
            role: "assistant",
            content: currentContent,
            // Hide tool calls in production
            toolCalls:
              process.env.NODE_ENV === "production"
                ? undefined
                : currentToolCalls.length > 0
                  ? currentToolCalls
                  : undefined,
            reasoning: currentReasoning || undefined,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          if (onFinish) {
            onFinish(assistantMessage);
          }
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Request aborted");
        } else {
          console.error("Error calling chat API:", error);
        }
      } finally {
        setIsLoading(false);
        setStreamingContent("");
        setStreamingToolCalls([]);
        setStreamingReasoning("");
        abortControllerRef.current = null;
      }
    },
    [messages, isLoading, api, onFinish]
  );

  // Trigger assistant response for an existing last user message without duplicating it.
  const startFromExistingLastUserMessage = useCallback(
    async (chatId?: string, _files: File[] = []) => {
      if (isLoading) {
        return;
      }
      if (messages.length !== 1) {
        return;
      }
      const last = messages[0];
      if (!last || last.role !== "user") {
        return;
      }

      setIsLoading(true);
      setStreamingContent("");
      setStreamingToolCalls([]);
      setStreamingReasoning("");
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, id: chatId }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Chat API error: ${response.status}`);
        }
        if (!response.body) {
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let currentContent = "";
        const currentToolCalls: ToolCall[] = [];
        let currentReasoning = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) {
              continue;
            }
            let textToParse = line;
            if (line.startsWith("data: ")) {
              textToParse = line.slice(6);
              if (textToParse.trim() === "[DONE]") {
                continue;
              }
            }
            try {
              const json = JSON.parse(textToParse);
              if (Array.isArray(json)) {
                const newMessages = json.map(parseUIMessage);
                setMessages(newMessages);
                const lastMsg = newMessages.at(-1);
                if (lastMsg && lastMsg.role === "assistant") {
                  setStreamingContent("");
                  setStreamingToolCalls([]);
                }
                continue;
              }
              if (json.type === "text-delta") {
                currentContent += json.delta || "";
                setStreamingContent(currentContent);
                continue;
              }
              if (
                json.type === "reasoning-delta" ||
                json.type === "reasoning"
              ) {
                const delta = json.delta || json.text || "";
                currentReasoning += delta;
                setStreamingReasoning(currentReasoning);
                continue;
              }
              if (json.type === "tool-input-start") {
                const existingIndex = currentToolCalls.findIndex(
                  (tc) => tc.id === json.toolCallId
                );
                if (existingIndex === -1) {
                  currentToolCalls.push({
                    id: json.toolCallId,
                    name: json.toolName,
                    args: {},
                    state: "running",
                  });
                }
                setStreamingToolCalls([...currentToolCalls]);
                continue;
              }
              if (json.type === "tool-input-available") {
                const existingIndex = currentToolCalls.findIndex(
                  (tc) => tc.id === json.toolCallId
                );
                if (existingIndex !== -1) {
                  currentToolCalls[existingIndex].args = json.input || {};
                  setStreamingToolCalls([...currentToolCalls]);
                }
                continue;
              }
              if (json.type === "tool-output-available") {
                const existingIndex = currentToolCalls.findIndex(
                  (tc) => tc.id === json.toolCallId
                );
                if (existingIndex !== -1) {
                  currentToolCalls[existingIndex].state = "result";
                  currentToolCalls[existingIndex].result = json.output;
                  setStreamingToolCalls([...currentToolCalls]);
                }
                continue;
              }
            } catch (_e) {
              // Not JSON; try Data Stream Protocol
            }

            const colonIndex = line.indexOf(":");
            if (colonIndex !== -1) {
              const type = line.slice(0, colonIndex);
              const rawValue = line.slice(colonIndex + 1);
              try {
                if (type === "0") {
                  const text = JSON.parse(rawValue);
                  currentContent += text;
                  setStreamingContent(currentContent);
                } else if (type === "9") {
                  // Only process tool calls in development
                  if (process.env.NODE_ENV !== "production") {
                    const toolCallData = JSON.parse(rawValue);
                    const existingIndex = currentToolCalls.findIndex(
                      (tc) => tc.id === toolCallData.toolCallId
                    );
                    if (existingIndex === -1) {
                      currentToolCalls.push({
                        id: toolCallData.toolCallId,
                        name: toolCallData.toolName,
                        args: toolCallData.args,
                        state: "running",
                      });
                    } else {
                      currentToolCalls[existingIndex].args = toolCallData.args;
                    }
                    setStreamingToolCalls([...currentToolCalls]);
                  }
                } else if (type === "a") {
                  // Only process tool results in development
                  if (process.env.NODE_ENV !== "production") {
                    const toolResultData = JSON.parse(rawValue);
                    const existingIndex = currentToolCalls.findIndex(
                      (tc) => tc.id === toolResultData.toolCallId
                    );
                    if (existingIndex !== -1) {
                      currentToolCalls[existingIndex].state = "result";
                      currentToolCalls[existingIndex].result =
                        toolResultData.result;
                      setStreamingToolCalls([...currentToolCalls]);
                    }
                  }
                } else if (type === "2") {
                  const reasoningDelta = JSON.parse(rawValue);
                  currentReasoning += reasoningDelta;
                  setStreamingReasoning(currentReasoning);
                }
              } catch (e) {
                console.error("Error parsing stream line:", line, e);
              }
            }
          }
        }

        if (currentContent || currentToolCalls.length > 0 || currentReasoning) {
          const assistantMessage: Message = {
            id: nanoid(),
            role: "assistant",
            content: currentContent,
            // Hide tool calls in production
            toolCalls:
              process.env.NODE_ENV === "production"
                ? undefined
                : currentToolCalls.length > 0
                  ? currentToolCalls
                  : undefined,
            reasoning: currentReasoning || undefined,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          if (onFinish) {
            onFinish(assistantMessage);
          }
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Request aborted");
        } else {
          console.error("Error calling chat API:", error);
        }
      } finally {
        setIsLoading(false);
        setStreamingContent("");
        setStreamingToolCalls([]);
        setStreamingReasoning("");
        abortControllerRef.current = null;
      }
    },
    [messages, isLoading, api, onFinish]
  );

  const setMessagesCallback = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
  }, []);

  const reload = useCallback(async () => {
    if (messages.length === 0) {
      return;
    }
    const lastMessage = messages.at(-1);
    if (lastMessage && lastMessage.role === "assistant") {
      const newMessages = messages.slice(0, -1);
      setMessages(newMessages);
      // TODO: Implement reload logic
    }
  }, [messages]);

  return {
    messages,
    setMessages: setMessagesCallback,
    input: "",
    handleInputChange: () => {},
    handleSubmit: () => {},
    isLoading,
    stop,
    reload,
    sendMessage,
    startFromExistingLastUserMessage,
    streamingContent,
    streamingToolCalls,
    streamingReasoning,
  };
}
