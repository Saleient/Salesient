"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  File,
  Folder,
  FolderPlus,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ProjectFileItem = {
  id: string;
  name: string;
  type: "project" | "file";
  projectId?: string | null;
  path?: string;
  integrationName?: string | null;
  integrationLogo?: string | null;
};

type SearchPanelProps = {
  selectedAttachments: ProjectFileItem[];
  onAttachmentToggle: (item: ProjectFileItem) => void;
};

export default function SearchPanel({
  selectedAttachments,
  onAttachmentToggle,
}: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "project" | "file" | "integration"
  >("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch projects using React Query
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        return await response.json();
      } catch (error) {
        console.error("Failed to load projects:", error);
        return [];
      }
    },
  });

  // Fetch root files using React Query
  const { data: rootFiles = [], isLoading: filesLoading } = useQuery({
    queryKey: ["rootFiles"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/files");
        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }
        return await response.json();
      } catch (error) {
        console.error("Failed to load files:", error);
        return [];
      }
    },
  });

  const items = useMemo(() => {
    const allItems: ProjectFileItem[] = [];

    // Add projects
    projects.forEach((project: any) => {
      allItems.push({
        id: project.id,
        name: project.name,
        type: "project",
        path: `/${project.name}`,
      });
    });

    // Add root files
    rootFiles.forEach((file: any) => {
      allItems.push({
        id: file.id,
        name: file.fileName || file.name,
        type: "file",
        projectId: null,
        path: file.fileName || file.name,
        integrationName: file.integrationName,
        integrationLogo: file.integrationLogo,
      });
    });

    // Filter based on search query
    if (!searchQuery.trim()) {
      // Apply filter when no search query
      return filter === "all"
        ? allItems
        : allItems.filter((item) => {
            if (filter === "project") {
              return item.type === "project";
            }
            if (filter === "file") {
              return item.type === "file";
            }
            if (filter === "integration") {
              return item.type === "file" && item.integrationName;
            }
            return true;
          });
    }

    const query = searchQuery.toLowerCase();
    return allItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.path?.toLowerCase().includes(query);
      if (!matchesSearch) {
        return false;
      }
      if (filter === "all") {
        return true;
      }
      if (filter === "project") {
        return item.type === "project";
      }
      if (filter === "file") {
        return item.type === "file";
      }
      if (filter === "integration") {
        return item.type === "file" && item.integrationName;
      }
      return true;
    });
  }, [projects, rootFiles, searchQuery, filter]);

  const isLoading = projectsLoading || filesLoading;

  const isSelected = (item: ProjectFileItem) =>
    selectedAttachments.some((attachment) => attachment.id === item.id);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      // Note: folderId is null for root files in chat context

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const _responseData = await response.json();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Invalidate and refetch the files query
      await queryClient.invalidateQueries({ queryKey: ["rootFiles"] });

      // Show success message
      setUploadSuccess(true);
      toast.success("File uploaded successfully", {
        description: `${file.name} has been uploaded.`,
      });

      // Reset success state after 2 seconds
      setTimeout(() => setUploadSuccess(false), 2000);
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload file. Please try again.";
      toast.error("Upload failed", {
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateProject = () => {
    router.push("/projects/new");
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          className="h-6 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects and files..."
          value={searchQuery}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 md:flex-row md:justify-between">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-1">
          {["all", "project", "file", "integration"].map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f as any)}
              size="sm"
              variant={filter === f ? "default" : "outline"}
            >
              {f === "integration"
                ? "Integrations"
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
        {/* Action Buttons */}
        <div className="mt-2 flex gap-2 md:mt-0">
          <Button
            className="flex items-center gap-2 border-white/10 bg-[#2B2B2E] hover:bg-white/5"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="outline"
          >
            {uploadSuccess ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading
              ? "Uploading..."
              : uploadSuccess
                ? "Uploaded!"
                : "Upload File"}
          </Button>
          <Button
            className="flex items-center gap-2 border-white/10 bg-[#2B2B2E] hover:bg-white/5"
            onClick={handleCreateProject}
            size="sm"
            variant="outline"
          >
            <FolderPlus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        accept="*/*"
        className="hidden"
        onChange={handleFileUpload}
        ref={fileInputRef}
        type="file"
      />

      {/* Files and Projects List */}
      <div className="max-h-80 space-y-2 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/60 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-px">
        {isLoading ? (
          <div className="py-4 text-center text-muted-foreground text-sm">
            Loading projects and files...
          </div>
        ) : items.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground text-sm">
            {searchQuery
              ? "No results found"
              : "No projects or files available"}
          </div>
        ) : (
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: -10 }}
                key={item.id}
                transition={{ duration: 0.2 }}
              >
                <Button
                  className={`h-auto w-full justify-start gap-2 rounded-lg p-3 ${
                    isSelected(item)
                      ? "border border-teal-600/50 bg-teal-800/20"
                      : "border border-white/10 hover:bg-white/5"
                  }`}
                  onClick={() => onAttachmentToggle(item)}
                  variant="ghost"
                >
                  {item.type === "project" ? (
                    <Folder className="h-4 w-4 shrink-0 text-blue-400" />
                  ) : item.integrationLogo ? (
                    <img
                      src={item.integrationLogo}
                      alt={`${item.integrationName} logo`}
                      className="h-4 w-4 shrink-0 rounded"
                    />
                  ) : (
                    <File className="h-4 w-4 shrink-0 text-green-400" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col items-start">
                    <span className="w-full truncate font-medium text-sm">
                      {item.name}
                    </span>
                    <span className="w-full truncate text-muted-foreground text-xs">
                      {item.path ||
                        (item.type === "project" ? "Project" : "File")}
                    </span>
                  </div>
                  {isSelected(item) ? (
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-lg bg-teal-600">
                      <div className="h-2 w-2 rounded-lg bg-white" />
                    </div>
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
