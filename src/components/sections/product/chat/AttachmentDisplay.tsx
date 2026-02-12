"use client";
import { File, Folder, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectFileItem } from "./SearchPanel";

type AttachmentDisplayProps = {
  attachments: ProjectFileItem[];
  onRemove: (id: string) => void;
};

export default function AttachmentDisplay({
  attachments,
  onRemove,
}: AttachmentDisplayProps) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-[#1A1A1B] p-3">
      <div className="mb-2 w-full text-muted-foreground text-xs">
        Attached ({attachments.length}):
      </div>
      {attachments.map((attachment) => (
        <div
          className="group flex items-center gap-2 rounded-lg border border-white/10 bg-[#2B2B2E] px-3 py-2"
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
          <Button
            className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => onRemove(attachment.id)}
            size="icon"
            variant="ghost"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
