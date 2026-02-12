"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFolder,
  deleteFile,
  deleteFolder,
  getDownloadURL,
  listFiles,
  listFolders,
  uploadFile,
} from "@/queries/files";

export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectFile = {
  id: string;
  projectId: string;
  name: string;
  size: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

export function useProjects() {
  return useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: async () => {
      const folders = await listFolders();
      return folders.map((f) => ({
        id: f.id,
        name: f.name,
        description: undefined,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRootFiles() {
  return useQuery<ProjectFile[], Error>({
    queryKey: ["rootFiles"],
    queryFn: async () => {
      const files = await listFiles(); // no folderId = root files
      return files.map((f) => ({
        id: f.id,
        projectId: "",
        name: f.fileName,
        size: 0, // Size not tracked in schema
        type: f.fileType,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProject(projectId: string) {
  return useQuery<Project | null, Error>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const folders = await listFolders();
      const folder = folders.find((f) => f.id === projectId);
      if (!folder) {
        return null;
      }
      return {
        id: folder.id,
        name: folder.name,
        description: undefined,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      };
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProjectFiles(projectId: string) {
  return useQuery<ProjectFile[], Error>({
    queryKey: ["projectFiles", projectId],
    queryFn: async () => {
      const files = await listFiles(projectId);
      return files.map((f) => ({
        id: f.id,
        projectId: f.folderId || "",
        name: f.fileName,
        size: 0,
        type: f.fileType,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      }));
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: string | { name: string; description?: string }
    ) => {
      const name = typeof input === "string" ? input : input.name;
      return await createFolder(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUploadRootFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      return await uploadFile(file); // No folderId = root
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
    },
  });
}

export function useUploadProjectFile(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => await uploadFile(file, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectFiles", projectId] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => await deleteFolder(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteRootFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: string) => await deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
    },
  });
}

export function useDeleteProjectFile(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: string) => await deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectFiles", projectId] });
    },
  });
}

/**
 * Hook to get download URL for a file
 */
export function useGetDownloadURL() {
  return useMutation({
    mutationFn: async (fileId: string) => await getDownloadURL(fileId),
  });
}
