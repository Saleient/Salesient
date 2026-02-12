import { Upload } from "lucide-react";
import type React from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

export type FileUploadProps = {
  onUpload?: (files: File | File[]) => Promise<void>;
  onFilesSelected?: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

export function FileUpload({
  onUpload,
  onFilesSelected,
  accept = "*",
  multiple = false,
  disabled = false,
  loading = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (onFilesSelected) {
        onFilesSelected(e.target.files);
      } else if (onUpload) {
        try {
          const filesArray = Array.from(e.target.files);
          await onUpload(multiple ? filesArray : filesArray[0]);
        } catch (error) {
          console.error("Upload error:", error);
        }
      }
      // Reset input to allow uploading the same file again
      e.target.value = "";
    }
  };

  return (
    <>
      <input
        accept={accept}
        className="hidden"
        multiple={multiple}
        onChange={handleChange}
        ref={inputRef}
        type="file"
      />
      <Button
        disabled={disabled || loading}
        onClick={handleClick}
        size="sm"
        variant="outline"
      >
        <Upload className="mr-2 h-4 w-4" />
        {loading ? "Uploading..." : "Upload File"}
      </Button>
    </>
  );
}
