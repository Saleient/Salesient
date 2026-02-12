"use client";

import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Image,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { LoadingGrid, LoadingSpinner } from "@/components/ui/loading-spinner";
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
  createdAt: string | Date;
  updatedAt: string | Date;
};

export default function ProjectDocuments() {
  const params = useParams();
  const router = useRouter();
  const projectId = String(params?.slug ?? "");
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<string | null>(
    null
  );
  const [moveFileId, setMoveFileId] = useState<string | null>(null);
  const [movingFileId, setMovingFileId] = useState<string | null>(null);
  const [selectedMoveTarget, setSelectedMoveTarget] = useState<string | null>(
    null
  );
  const [allProjects, setAllProjects] = useState<ProjectUI[]>([]);

  // State management
  const [project, setProject] = useState<ProjectUI | null>(null);
  const [files, setFiles] = useState<FileUI[]>([]);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [isFilesLoading, setIsFilesLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingDownloadId, setLoadingDownloadId] = useState<string | null>(
    null
  );
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    // Fetch project details and files
    let mounted = true;

    (async () => {
      try {
        // Fetch project details
        setIsProjectLoading(true);
        const projectRes = await fetch(`/api/documents/projects/${projectId}`);
        if (!projectRes.ok) {
          if (projectRes.status === 404) {
            throw new Error("Project not found");
          }
          throw new Error("Failed to load project");
        }
        const projectData = await projectRes.json();
        if (mounted) {
          setProject(projectData);
          setProjectError(null);
        }
      } catch (error) {
        if (mounted) {
          setProjectError(
            error instanceof Error ? error.message : "Failed to load project"
          );
        }
      } finally {
        if (mounted) {
          setIsProjectLoading(false);
        }
      }

      try {
        // Fetch project files
        setIsFilesLoading(true);
        const filesRes = await fetch(
          `/api/documents/projects/${projectId}/files`
        );
        if (!filesRes.ok) {
          throw new Error("Failed to load files");
        }
        const filesData = await filesRes.json();
        if (mounted) {
          setFiles(
            (filesData || []).map((f: any) => ({
              id: f.id,
              projectId: f.folderId || projectId,
              name: f.fileName,
              size: f.size || 0,
              type: f.fileType || "",
              createdAt: f.createdAt,
              updatedAt: f.updatedAt,
            }))
          );
          setFilesError(null);
        }
      } catch (error) {
        if (mounted) {
          setFilesError(
            error instanceof Error ? error.message : "Failed to load files"
          );
        }
      } finally {
        if (mounted) {
          setIsFilesLoading(false);
        }
      }
      try {
        // Fetch all projects for move targets
        const projRes = await fetch("/api/documents/projects");
        if (projRes.ok) {
          const projData = await projRes.json();
          if (mounted) {
            setAllProjects(projData);
          }
        }
      } catch {
        // silent
      }
    })();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  const handleUploadFile = async (files: File | File[]) => {
    const fileArray = Array.isArray(files) ? files : [files];
    setLoadingUpload(true);

    try {
      for (const file of fileArray) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folderId", projectId);

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        const uploaded = await res.json();
        setFiles((prev) => [
          ...prev,
          {
            id: uploaded.id || `temp-${Date.now()}`,
            projectId: uploaded.folderId || projectId,
            name: uploaded.fileName || file.name,
            size: uploaded.size || file.size,
            type: uploaded.fileType || file.type,
            createdAt: uploaded.createdAt || new Date().toISOString(),
            updatedAt: uploaded.updatedAt || new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
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
      setFiles((prev) => prev.filter((f) => f.id !== confirmDeleteFile));
    } catch (error) {
      console.error("Delete error:", error);
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
    } catch (error) {
      console.error("Download error:", error);
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

  if (projectError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="mb-2 font-semibold text-xl">Error loading project</h2>
          <p className="text-sm">Failed to load project details</p>
          <Button
            className="mt-4"
            onClick={() => router.push("/dashboard/documents")}
            variant="outline"
          >
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-[1440px] flex-col space-y-4 overflow-hidden rounded-2xl bg-background p-4 md:space-y-6 md:p-6">
      <div className="flex items-center justify-between pt-6 md:pt-10">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <SidebarTrigger className="shrink-0 md:hidden" />
            <Button
              className="shrink-0 p-2"
              onClick={() => router.push("/dashboard/documents")}
              size="sm"
              type="button"
              variant="ghost"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {isProjectLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <h1 className="truncate font-semibold text-xl md:text-3xl">
                {project?.name || "Project"}
              </h1>
            )}
          </div>
          <p className="ml-8 hidden text-muted-foreground text-xs sm:block md:ml-10 md:text-sm">
            Project files and documents
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <FileUpload
            accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md,.jpg,.jpeg,.png,.webp,.gif"
            loading={loadingUpload}
            onUpload={handleUploadFile}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {(() => {
          if (isFilesLoading) {
            return <LoadingGrid count={6} />;
          }
          if (filesError) {
            return (
              <div className="text-red-600 text-sm">
                Failed to load project files
              </div>
            );
          }
          if (files.length === 0) {
            return (
              <div className="py-12 text-center text-muted-foreground">
                <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>
                  No files in this project yet. Upload files to get started.
                </p>
              </div>
            );
          }
          return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
              {files.map((file) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <Card
                    className="group flex flex-col transition-colors hover:bg-accent"
                    key={file.id}
                  >
                    <CardContent className="flex flex-col gap-2 p-3 md:p-4">
                      <div className="flex items-start justify-between">
                        <FileIcon className="h-4 w-4 text-primary md:h-5 md:w-5" />
                        <div className="flex gap-1">
                          <button
                            className="rounded p-1 opacity-0 transition-colors hover:bg-blue-100 group-hover:opacity-100"
                            disabled={loadingDownloadId === file.id}
                            onClick={(e) =>
                              handleDownloadFile(e, file.id, file.name)
                            }
                            title="Download"
                            type="button"
                          >
                            {loadingDownloadId === file.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Download className="h-4 w-4 text-blue-600" />
                            )}
                          </button>
                          <button
                            className="rounded p-1 transition-colors hover:bg-red-100"
                            disabled={deletingFileId === file.id}
                            onClick={() => handleDeleteFile(file.id)}
                            title="Delete"
                            type="button"
                          >
                            {deletingFileId === file.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600" />
                            )}
                          </button>
                          <button
                            className="rounded p-1 transition-colors hover:bg-accent"
                            disabled={movingFileId === file.id}
                            onClick={() => {
                              setMoveFileId(file.id);
                              setSelectedMoveTarget(projectId); // default current project
                            }}
                            title="Move"
                            type="button"
                          >
                            {movingFileId === file.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <span className="font-medium text-xs">Move</span>
                            )}
                          </button>
                        </div>
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
          );
        })()}
      </div>

      {/* Confirmation Dialog */}
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
      {/* Move File Dialog */}
      <Dialog onOpenChange={() => setMoveFileId(null)} open={!!moveFileId}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move File</DialogTitle>
          </DialogHeader>
          <p className="mb-2 text-muted-foreground text-sm">
            Select destination project or Root.
          </p>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            <button
              className={`w-full rounded px-2 py-1 text-left text-xs transition-colors md:text-sm ${selectedMoveTarget === null ? "bg-accent" : "hover:bg-accent"}`}
              onClick={() => setSelectedMoveTarget(null)}
              type="button"
            >
              Root Directory
            </button>
            {allProjects.map((p) => (
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
                  // Remove from current list if destination differs
                  if (selectedMoveTarget !== projectId) {
                    setFiles((prev) => prev.filter((f) => f.id !== moveFileId));
                  }
                } catch {
                  // silent
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
