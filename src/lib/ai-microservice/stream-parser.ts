import { AIMicroserviceStreamError } from "./errors";
import type {
  StreamEvent,
  StreamTextEvent,
  StreamReasoningEvent,
  StreamToolCallStartEvent,
  StreamToolCallResultEvent,
} from "./types";

/**
 * Parse a single line from the AI microservice streaming response.
 *
 * The protocol is:
 *   0:{"content":"…"}               – text delta
 *   2:{"content":"…"}               – reasoning delta
 *   9:{"toolCallId":"…","toolName":"…","args":{}} – tool call start
 *   a:{"toolCallId":"…","result":{}}              – tool call result
 *
 * Returns `null` for empty lines or heartbeats.
 */
export function parseStreamLine(line: string): StreamEvent | null {
  const trimmed = line.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const colonIndex = trimmed.indexOf(":");
  if (colonIndex < 1) {
    return null;
  }

  const prefix = trimmed.slice(0, colonIndex);
  const jsonStr = trimmed.slice(colonIndex + 1);

  try {
    // Parse the JSON value (could be string or object)
    const data = JSON.parse(jsonStr);

    switch (prefix) {
      case "0": {
        // Handle both string format and object format
        const content =
          typeof data === "string" ? data : (data.content as string);
        if (typeof content !== "string") {
          return null;
        }
        return {
          prefix: "0",
          content,
        } satisfies StreamTextEvent;
      }
      case "2": {
        // Handle both string format and object format
        const content =
          typeof data === "string" ? data : (data.content as string);
        if (typeof content !== "string") {
          return null;
        }
        return {
          prefix: "2",
          content,
        } satisfies StreamReasoningEvent;
      }
      case "9": {
        // Tool call start - object format only
        if (typeof data !== "object" || !data.toolCallId || !data.toolName) {
          return null;
        }
        return {
          prefix: "9",
          toolCallId: data.toolCallId as string,
          toolName: data.toolName as string,
          args: (data.args as Record<string, unknown>) ?? {},
        } satisfies StreamToolCallStartEvent;
      }
      case "a": {
        // Tool call result - object format only
        if (typeof data !== "object" || !data.toolCallId) {
          return null;
        }
        return {
          prefix: "a",
          toolCallId: data.toolCallId as string,
          result: (data.result as Record<string, unknown>) ?? {},
        } satisfies StreamToolCallResultEvent;
      }
      default: {
        // Unknown prefix — skip gracefully
        return null;
      }
    }
  } catch {
    // Malformed JSON — skip line
    return null;
  }
}

/**
 * Callbacks for consuming a parsed chat stream.
 */
export interface ChatStreamHandler {
  onTextDelta?: (content: string) => void | Promise<void>;
  onReasoningDelta?: (content: string) => void | Promise<void>;
  onToolCallStart?: (
    toolCallId: string,
    toolName: string,
    args: Record<string, unknown>
  ) => void | Promise<void>;
  onToolCallResult?: (
    toolCallId: string,
    result: Record<string, unknown>
  ) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
  onDone?: () => void | Promise<void>;
}

/**
 * Consume a `ReadableStream` (from `chatStream()`) and dispatch parsed events
 * to the provided handler callbacks.
 *
 * Usage:
 * ```ts
 * const stream = await client.chatStream(request);
 * await consumeChatStream(stream, {
 *   onTextDelta: (text) => process.stdout.write(text),
 *   onToolCallStart: (id, name, args) => console.log("tool:", name),
 * });
 * ```
 */
export async function consumeChatStream(
  stream: ReadableStream,
  handler: ChatStreamHandler
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    let done = false;
    while (!done) {
      const result = await reader.read();
      done = result.done;

      if (result.value) {
        buffer += decoder.decode(result.value, { stream: true });

        const lines = buffer.split("\n");
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const event = parseStreamLine(line);
          if (!event) {
            continue;
          }

          switch (event.prefix) {
            case "0": {
              await handler.onTextDelta?.(event.content);
              break;
            }
            case "2": {
              await handler.onReasoningDelta?.(event.content);
              break;
            }
            case "9": {
              await handler.onToolCallStart?.(
                event.toolCallId,
                event.toolName,
                event.args
              );
              break;
            }
            case "a": {
              await handler.onToolCallResult?.(event.toolCallId, event.result);
              break;
            }
          }
        }
      }
    }

    // Flush any remaining buffer content
    if (buffer.trim().length > 0) {
      const event = parseStreamLine(buffer);
      if (event) {
        switch (event.prefix) {
          case "0": {
            await handler.onTextDelta?.(event.content);
            break;
          }
          case "2": {
            await handler.onReasoningDelta?.(event.content);
            break;
          }
          case "9": {
            await handler.onToolCallStart?.(
              event.toolCallId,
              event.toolName,
              event.args
            );
            break;
          }
          case "a": {
            await handler.onToolCallResult?.(event.toolCallId, event.result);
            break;
          }
        }
      }
    }

    await handler.onDone?.();
  } catch (error) {
    const wrappedError =
      error instanceof Error
        ? new AIMicroserviceStreamError(error.message, error)
        : new AIMicroserviceStreamError("Unknown stream error");
    await handler.onError?.(wrappedError);
    throw wrappedError;
  } finally {
    reader.releaseLock();
  }
}

/**
 * Convert the microservice `ReadableStream` into a Web-standard
 * `ReadableStream<string>` that yields text deltas only.
 *
 * Useful when you just need to pipe text back to the frontend via a
 * Next.js streaming Response.
 */
export function createTextDeltaStream(
  sourceStream: ReadableStream
): ReadableStream<string> {
  const reader = sourceStream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream<string>({
    async pull(controller) {
      const { done, value } = await reader.read();

      if (done) {
        // Flush remaining
        if (buffer.trim().length > 0) {
          const event = parseStreamLine(buffer);
          if (event?.prefix === "0" && event.content) {
            controller.enqueue(event.content);
          }
        }
        controller.close();
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const event = parseStreamLine(line);
        if (event?.prefix === "0" && event.content) {
          controller.enqueue(event.content);
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}
