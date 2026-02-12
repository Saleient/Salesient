/** biome-ignore-all lint/performance/noImgElement: <explanation> */
"use client";

import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Folder,
  Image,
  Loader2,
  MoreVertical,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";

const getFileCategory = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
    return "Image";
  }
  if (["pdf"].includes(extension)) {
    return "PDF Document";
  }
  if (["docx", "doc"].includes(extension)) {
    return "Word Document";
  }
  if (["xlsx", "xls", "csv"].includes(extension)) {
    return "Spreadsheet";
  }
  if (["pptx", "ppt"].includes(extension)) {
    return "Presentation";
  }
  if (["txt", "md"].includes(extension)) {
    return "Text Document";
  }

  return "Document";
};
type ProjectUI = {
  id: string;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};
type FileUI = {
  id: string;
  projectId: string;
  name: string;
  size: number;
  type: string;
  integrationName?: string;
  integrationLogo?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export default function DocumentsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectUI[]>([]);
  const [rootFiles, setRootFiles] = useState<FileUI[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingDownloadId, setLoadingDownloadId] = useState<string | null>(
    null
  );
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null
  );
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState<
    string | null
  >(null);
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<string | null>(
    null
  );
  const [moveFileId, setMoveFileId] = useState<string | null>(null);
  const [selectedMoveTarget, setSelectedMoveTarget] = useState<string | null>(
    null
  );
  const [movingFileId, setMovingFileId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<
    Array<{
      file: File;
      status: "pending" | "uploading" | "success" | "error";
      progress?: number;
      error?: string;
    }>
  >([]);

  const fileFilters: Record<string, (file: FileUI) => boolean> = {
    all: () => true,
    integration: (file) => !!file.integrationName,
    uploaded: (file) => !file.integrationName,
    image: (file) => file.type.includes("image"),
    document: (file) =>
      ["pdf", "docx", "doc", "txt", "md"].some((ext) =>
        file.name.toLowerCase().includes(ext)
      ),
    spreadsheet: (file) =>
      ["xlsx", "xls", "csv"].some((ext) =>
        file.name.toLowerCase().includes(ext)
      ),
  };

  useEffect(() => {
    // fetch initial data from our API
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/documents/init");
        if (!res.ok) {
          throw new Error("Failed to load documents");
        }
        const data = await res.json();
        if (!mounted) {
          return;
        }
        setProjects(
          (data.projects || []).map((p: any) => ({
            ...p,
          }))
        );
        setRootFiles(
          (data.rootFiles || []).map((f: any) => ({
            id: f.id,
            projectId: f.folderId || "",
            name: f.fileName,
            size: f.size || 0,
            type: f.fileType || "",
            integrationName: f.integrationName,
            integrationLogo: f.integrationLogo,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
          }))
        );
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleProjectClick = (projectId: string) => {
    router.push(`/dashboard/documents/${projectId}`);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/documents/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newProjectName.trim() }),
        });
        if (!res.ok) {
          throw new Error("Failed to create project");
        }
        const project = await res.json();
        setProjects((prev) => [...prev, project]);
        setNewProjectName("");
        setIsDialogOpen(false);
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleUploadRootFile = async (files: File | File[]) => {
    const fileArray = Array.isArray(files) ? files : [files];

    setUploadQueue(
      fileArray.map((file) => ({
        file,
        status: "pending" as const,
      }))
    );
    setUploadDialogOpen(true);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      setUploadQueue((prev) =>
        prev.map((item, idx) =>
          idx === i ? { ...item, status: "uploading" } : item
        )
      );

      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        const uploaded = await res.json();

        setUploadQueue((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "success" } : item
          )
        );

        setRootFiles((prev) => [
          ...prev,
          {
            id: uploaded.id || `temp-${Date.now()}`,
            projectId: uploaded.folderId || "",
            name: uploaded.fileName || file.name,
            size: uploaded.size || file.size,
            type: uploaded.fileType || file.type,
            createdAt: uploaded.createdAt || new Date().toISOString(),
            updatedAt: uploaded.updatedAt || new Date().toISOString(),
          },
        ]);
      } catch (e) {
        console.error(e);
        setUploadQueue((prev) =>
          prev.map((item, idx) =>
            idx === i
              ? { ...item, status: "error", error: "Upload failed" }
              : item
          )
        );
      }
    }
  };

  const handleDeleteProject = async (
    e: React.MouseEvent,
    projectId: string
  ) => {
    e.stopPropagation();
    setConfirmDeleteProject(projectId);
  };

  const confirmProjectDeletion = async () => {
    if (!confirmDeleteProject) {
      return;
    }
    setDeletingProjectId(confirmDeleteProject);
    try {
      const res = await fetch(
        `/api/documents/projects/${confirmDeleteProject}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        throw new Error("Failed to delete project");
      }
      setProjects((prev) => prev.filter((p) => p.id !== confirmDeleteProject));
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingProjectId(null);
      setConfirmDeleteProject(null);
    }
  };

  const _handleDeleteRootFile = async (fileId: string) => {
    setConfirmDeleteFile(fileId);
  };

  const confirmFileDeletion = async () => {
    if (!confirmDeleteFile) {
      return;
    }
    setDeletingFileId(confirmDeleteFile);
    try {
      const res = await fetch(`/api/documents/files/${confirmDeleteFile}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete file");
      }
      setRootFiles((prev) => prev.filter((f) => f.id !== confirmDeleteFile));
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingFileId(null);
      setConfirmDeleteFile(null);
    }
  };

  const handleDownloadFile = async (
    e: React.MouseEvent,
    fileId: string,
    fileName: string
  ) => {
    e.stopPropagation();
    setLoadingDownloadId(fileId);
    try {
      const res = await fetch(`/api/documents/files/${fileId}/download`);
      if (!res.ok) {
        throw new Error("Failed to get download URL");
      }
      const data = await res.json();
      const url = data.url;
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDownloadId(null);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("image")) {
      return Image;
    }
    if (type.includes("spreadsheet") || type.includes("csv")) {
      return FileSpreadsheet;
    }
    return FileText;
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col space-y-4 overflow-hidden rounded-2xl bg-background p-4 md:h-[calc(100vh-4rem)] md:space-y-6 md:p-6">
      <div className="flex items-center justify-between pt-6 md:pt-10">
        <div className="flex items-center gap-2 md:gap-0">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="font-semibold text-2xl md:text-3xl">Documents</h1>
            <p className="hidden text-muted-foreground text-xs sm:block md:text-sm">
              Organize your files in projects or upload to root directory.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FileUpload
            accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md,.jpg,.jpeg,.png,.webp,.gif"
            loading={false}
            multiple
            onUpload={handleUploadRootFile}
          />
          <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={isPending} variant="default">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Project</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateProject();
                    }
                  }}
                  placeholder="Project name"
                  value={newProjectName}
                />
              </div>
              <DialogFooter>
                <Button
                  disabled={isPending || !newProjectName.trim()}
                  onClick={handleCreateProject}
                >
                  {isPending ? (
                    <>
                      <LoadingSpinner className="mr-2" size="sm" />
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <section className="pt-4 md:pt-6">
        <h2 className="mb-3 font-medium text-base md:mb-4 md:text-lg">
          Projects
        </h2>
        {projects.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Folder className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>No projects yet. Create your first project to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                className="flex cursor-pointer flex-row items-center justify-between p-3 transition-colors hover:bg-accent md:p-4"
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="flex min-w-0 items-center gap-2 md:gap-3">
                  <Folder className="h-5 w-5 shrink-0 fill-teal-700 text-teal-700 md:h-6 md:w-6" />
                  <span className="truncate font-medium text-sm md:text-base">
                    {project.name}
                  </span>
                </div>
                <button
                  className="shrink-0 rounded p-1 transition-colors hover:bg-red-100"
                  disabled={deletingProjectId === project.id}
                  onClick={(e) => handleDeleteProject(e, project.id)}
                  title="Delete project"
                  type="button"
                >
                  {deletingProjectId === project.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-600" />
                  )}
                </button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="flex-1 overflow-y-auto pt-4 md:pt-6">
        <div className="mb-3 flex items-center justify-between md:mb-4">
          <h2 className="font-medium text-base md:text-lg">Root Files</h2>
          <Select onValueChange={setFilterType} value={filterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Files</SelectItem>
              <SelectItem value="integration">Integration Files</SelectItem>
              <SelectItem value="uploaded">Uploaded Files</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {rootFiles
            .filter((file) => fileFilters[filterType]?.(file) ?? true)
            .map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <Card
                  className="group flex flex-col transition-colors hover:bg-accent"
                  key={file.id}
                >
                  <CardContent className="flex flex-col gap-2 p-3 md:p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {file.integrationLogo ? (
                          // biome-ignore lint/correctness/useImageSize: <explanation>
                          <img
                            alt={`${file.integrationName} logo`}
                            className="h-4 w-4 shrink-0 rounded"
                            src={file.integrationLogo}
                          />
                        ) : (
                          <FileIcon className="h-4 w-4 text-primary md:h-5 md:w-5" />
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            aria-label={`Actions for ${file.name}`}
                            className="rounded p-1 opacity-0 transition-colors hover:bg-accent group-hover:opacity-100"
                            type="button"
                          >
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            disabled={loadingDownloadId === file.id}
                            onClick={(e) =>
                              handleDownloadFile(e as any, file.id, file.name)
                            }
                          >
                            {loadingDownloadId === file.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            <span className="truncate">Download</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={movingFileId === file.id}
                            onClick={() => {
                              setMoveFileId(file.id);
                              setSelectedMoveTarget(null);
                            }}
                          >
                            {movingFileId === file.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Folder className="h-4 w-4" />
                            )}
                            <span className="truncate">Move</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            data-variant="destructive"
                            disabled={deletingFileId === file.id}
                            onClick={() => setConfirmDeleteFile(file.id)}
                          >
                            {deletingFileId === file.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="truncate">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="truncate font-medium text-xs md:text-sm">
                      {file.name}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {getFileCategory(file.name)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </section>

      {/* Confirmation Dialogs */}
      <Dialog
        onOpenChange={() => setConfirmDeleteProject(null)}
        open={!!confirmDeleteProject}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Are you sure you want to delete this project? This will also delete
            all files in the project.
          </p>
          <DialogFooter>
            <Button
              onClick={() => setConfirmDeleteProject(null)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={!!deletingProjectId}
              onClick={confirmProjectDeletion}
              variant="destructive"
            >
              {deletingProjectId ? (
                <>
                  <LoadingSpinner className="mr-2" size="sm" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={() => setConfirmDeleteFile(null)}
        open={!!confirmDeleteFile}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Are you sure you want to delete this file?
          </p>
          <DialogFooter>
            <Button
              onClick={() => setConfirmDeleteFile(null)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={!!deletingFileId}
              onClick={confirmFileDeletion}
              variant="destructive"
            >
              {deletingFileId ? (
                <>
                  <LoadingSpinner className="mr-2" size="sm" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Progress Dialog */}
      <Dialog
        onOpenChange={(open) => {
          if (
            !open &&
            uploadQueue.some((item) => item.status === "uploading")
          ) {
            return;
          }
          setUploadDialogOpen(open);
          if (!open) {
            setUploadQueue([]);
          }
        }}
        open={uploadDialogOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Uploading Files</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 space-y-2 overflow-y-auto py-2">
            {uploadQueue.map((item, idx) => (
              <div
                className="flex items-center gap-3 rounded-lg border p-3"
                key={idx}
              >
                <div className="shrink-0">
                  {item.status === "pending" && (
                    <div className="h-5 w-5 rounded-full border-2 border-muted" />
                  )}
                  {item.status === "uploading" && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {item.status === "success" && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {item.status === "error" && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">
                    {item.file.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {item.status === "pending" && "Waiting..."}
                    {item.status === "uploading" && "Uploading..."}
                    {item.status === "success" && "Completed"}
                    {item.status === "error" && (item.error || "Failed")}
                  </p>
                </div>
                <div className="shrink-0 text-muted-foreground text-xs">
                  {(item.file.size / 1024).toFixed(1)} KB
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-muted-foreground text-sm">
              {uploadQueue.filter((item) => item.status === "success").length}{" "}
              of {uploadQueue.length} completed
            </p>
            <Button
              disabled={uploadQueue.some((item) => item.status === "uploading")}
              onClick={() => {
                setUploadDialogOpen(false);
                setUploadQueue([]);
              }}
              variant={
                uploadQueue.every((item) => item.status === "success")
                  ? "default"
                  : "outline"
              }
            >
              {uploadQueue.some((item) => item.status === "uploading")
                ? "Uploading..."
                : "Close"}
            </Button>
          </div>
          {uploadQueue.some((item) => item.status === "uploading") && (
            <p className="text-center text-muted-foreground text-xs">
              ⚠️ Closing now will cancel remaining uploads
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Move File Dialog */}
      <Dialog onOpenChange={() => setMoveFileId(null)} open={!!moveFileId}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move File</DialogTitle>
          </DialogHeader>
          <p className="mb-2 text-muted-foreground text-sm">
            Select a destination project or move to Root.
          </p>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            <button
              className={`w-full rounded px-2 py-1 text-left text-xs transition-colors md:text-sm ${selectedMoveTarget === null ? "bg-accent" : "hover:bg-accent"}`}
              onClick={() => setSelectedMoveTarget(null)}
              type="button"
            >
              Root Directory
            </button>
            {projects.map((p) => (
              <button
                className={`w-full rounded px-2 py-1 text-left text-xs transition-colors md:text-sm ${selectedMoveTarget === p.id ? "bg-accent" : "hover:bg-accent"}`}
                key={p.id}
                onClick={() => setSelectedMoveTarget(p.id)}
                type="button"
              >
                {p.name}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setMoveFileId(null)} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={movingFileId === moveFileId}
              onClick={async () => {
                if (!moveFileId) {
                  return;
                }
                setMovingFileId(moveFileId);
                try {
                  const res = await fetch(
                    `/api/documents/files/${moveFileId}/move`,
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ folderId: selectedMoveTarget }),
                    }
                  );
                  if (!res.ok) {
                    throw new Error("Move failed");
                  }
                  setRootFiles((prev) =>
                    prev.filter((f) => f.id !== moveFileId)
                  );
                } catch (_e) {
                  // silently fail
                } finally {
                  setMovingFileId(null);
                  setMoveFileId(null);
                }
              }}
            >
              {movingFileId === moveFileId ? (
                <>
                  <LoadingSpinner className="mr-2" size="sm" />
                  Moving...
                </>
              ) : (
                "Move"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
