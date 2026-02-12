import { File, Paperclip } from "lucide-react";
import { useEffect, useState } from "react";
import { type ChatFile, getChatFiles } from "@/queries/chat";

type ChatFileManagerProps = {
  chatId: string;
};

export default function ChatFileManager({ chatId }: ChatFileManagerProps) {
  const [chatFiles, setChatFiles] = useState<ChatFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (chatId) {
      setIsLoading(true);
      getChatFiles(chatId)
        .then(setChatFiles)
        .catch((error) => {
          console.error("Failed to load chat files:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setChatFiles([]);
    }
  }, [chatId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 text-muted-foreground text-sm">
        <Paperclip className="h-4 w-4" />
        Loading attached files...
      </div>
    );
  }

  return (
    <div className="border-border/50 border-b p-3">
      {chatFiles.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {chatFiles.map((file: ChatFile) => (
            <div
              className="flex items-center gap-2 rounded-md border border-border/50 bg-background/50 px-2 py-1 text-xs"
              key={file.fileId}
            >
              <File className="h-3 w-3 text-green-400" />
              <span className="max-w-32 truncate">{file.fileName}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-sm">
          No attached files.
        </div>
      )}
    </div>
  );
}
