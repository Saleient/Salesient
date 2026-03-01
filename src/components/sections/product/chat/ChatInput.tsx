"use client";
import { ArrowUp, Loader2, Paperclip } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AttachmentDisplay from "./AttachmentDisplay";
import SearchPanel, { type ProjectFileItem } from "./SearchPanel";

type ChatInputProps = {
  handleSend: (e: React.FormEvent, attachmentItems?: ProjectFileItem[]) => void;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
};

export type ChatInputHandle = {
  clearAttachments: () => void;
};

const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  function ChatInput({ handleSend, input, setInput, isLoading }, ref) {
    const [showTools, setShowTools] = useState(false);
    const [attachments, setAttachments] = useState<ProjectFileItem[]>([]);
    const toolsRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          toolsRef.current &&
          !toolsRef.current.contains(event.target as Node)
        ) {
          setShowTools(false);
        }
      }
      if (showTools) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showTools]);

    // Auto-resize textarea
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        const newHeight = Math.min(textarea.scrollHeight, 200); // Max height of 200px
        textarea.style.height = `${newHeight}px`;
      }
    }, []);

    const handleAttachmentToggle = (item: ProjectFileItem) => {
      setAttachments((prev) => {
        const isSelected = prev.some((attachment) => attachment.id === item.id);
        if (isSelected) {
          return prev.filter((attachment) => attachment.id !== item.id);
        }
        return [...prev, item];
      });
    };

    const handleRemoveAttachment = (id: string) => {
      setAttachments((prev) =>
        prev.filter((attachment) => attachment.id !== id)
      );
    };

    const handleFormSubmit = (e: React.FormEvent) => {
      if (!isLoading) {
        handleSend(e, attachments);
        setShowTools(false);
      }
    };

    // Expose clearAttachments method to parent
    useImperativeHandle(ref, () => ({
      clearAttachments: () => {
        setAttachments([]);
      },
    }));

    return (
      <div className="relative mx-auto flex w-full max-w-3xl flex-col md:max-w-4xl">
        {/* Attachments Panel */}
        <AnimatePresence>
          {showTools && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full mb-2 w-full max-w-xl space-y-4 rounded-xl border border-border/40 bg-[#161715] p-4 shadow-xl"
              exit={{ opacity: 0, y: 10 }}
              initial={{ opacity: 0, y: 10 }}
              ref={toolsRef}
              transition={{ duration: 0.2 }}
            >
              <SearchPanel
                onAttachmentToggle={handleAttachmentToggle}
                selectedAttachments={attachments}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Section */}
        <div className="mx-auto w-full p-3 sm:p-4">
          <div className="rounded-xl bg-linear-to-b from-foreground/15 to-foreground/8 p-px transition-colors dark:from-foreground/25 dark:to-foreground/15">
            <form
              className="rounded-xl bg-[#161715] p-2 shadow-md backdrop-blur-sm"
              onSubmit={handleFormSubmit}
            >
              <div className="flex flex-col">
                {/* Attachments Display */}
                {attachments.length > 0 && (
                  <div className="px-3 pt-3">
                    <AttachmentDisplay
                      attachments={attachments}
                      onRemove={handleRemoveAttachment}
                    />
                  </div>
                )}

                <Textarea
                  className="min-h-15! w-full resize-none overflow-y-scroll border-none! bg-[#161715]! px-3 py-3 text-base! text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 dark:text-foreground dark:placeholder:text-muted-foreground [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/30 dark:[&::-webkit-scrollbar-thumb]:bg-foreground/40 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-px"
                  disabled={isLoading}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                      e.preventDefault();
                      handleFormSubmit(e);
                    }
                  }}
                  placeholder="Lets Convert Your Leads!"
                  ref={textareaRef}
                  rows={1}
                  value={input}
                />
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Button
                      className="flex h-8 items-center gap-2 rounded-full border-0 px-3 transition-colors hover:bg-accent/80 dark:hover:bg-accent/80"
                      disabled={isLoading}
                      onClick={() => setShowTools((prev) => !prev)}
                      type="button"
                      variant="outline"
                    >
                      <Paperclip className="size-4" />
                      <span className="text-sm">Attachments</span>
                    </Button>
                  </div>
                  <Button
                    className="h-8 w-8 rounded-full bg-teal-700 text-white shadow-sm transition-all hover:bg-teal-600 hover:shadow-md disabled:opacity-40 dark:text-background"
                    disabled={!input.trim() || isLoading}
                    type="submit"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
);

export default ChatInput;
