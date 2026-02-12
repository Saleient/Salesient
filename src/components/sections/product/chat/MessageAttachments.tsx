"use client";
import { File, Folder } from "lucide-react";
import type { Attachment } from "@/queries/chat";

type MessageAttachmentsProps = {
  attachments: Attachment[];
};

export default function MessageAttachments({
  attachments,
}: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-wrap gap-2 rounded-lg border border-white/10 bg-[#1A1A1B] p-3">
      <div className="mb-2 w-full text-muted-foreground text-xs">
        Attached to this message:
      </div>
      {attachments.map((attachment) => (
        <div
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#2B2B2E] px-3 py-2"
          key={attachment.id}
        >
          {attachment.type === "project" ? (
            <Folder className="h-4 w-4 text-blue-400" />
          ) : (
            <File className="h-4 w-4 text-green-400" />
          )}
          <span className="max-w-32 truncate font-medium text-sm">
            {attachment.name}
          </span>
          <span className="text-muted-foreground text-xs">
            {attachment.type}
          </span>
        </div>
      ))}
    </div>
  );
}
