"use client";

import {
  Copy,
  Download,
  FileText,
  Loader2,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";

type UserPreferences = {
  customSystemPrompt: string;
};

export default function AccountSettings() {
  const { data: session, isPending } = useSession();
  const [isUpdatingPrefs, setIsUpdatingPrefs] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Preferences form state
  const [preferences, setPreferences] = useState<UserPreferences>({
    customSystemPrompt: "",
  });

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/settings/preferences");
      console.log("Preferences API response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched preferences data:", data);
        console.log("Preferences object:", data.preferences);
        console.log(
          "Custom system prompt:",
          data.preferences?.customSystemPrompt
        );
        setPreferences(data.preferences);
      } else {
        console.error(
          "Failed to fetch preferences - bad response:",
          response.status
        );
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      // Load user preferences
      fetchPreferences();
    }
  }, [
    session, // Load user preferences
    fetchPreferences,
  ]);

  const handlePreferencesUpdate = async () => {
    setIsUpdatingPrefs(true);
    try {
      const response = await fetch("/api/settings/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success("Preferences updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update preferences");
      }
    } catch (_error) {
      toast.error("Failed to update preferences");
    } finally {
      setIsUpdatingPrefs(false);
    }
  };

  const handleExportChats = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/settings/export-chats");

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `chat-history-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Chat history exported successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to export chats");
      }
    } catch (_error) {
      toast.error("Failed to export chats");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm");
      return;
    }

    setIsDeletingAccount(true);
    try {
      const response = await fetch("/api/settings/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });

      if (response.ok) {
        toast.success("Account deleted successfully");
        // Redirect to login or home page
        window.location.href = "/login";
      } else {
        const error = await response.json();
        toast.error(error.message || error.error || "Failed to delete account");
      }
    } catch (_error) {
      toast.error("Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
      setDeleteConfirmation("");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    const validTypes = ["application/pdf", "text/plain"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only PDF and TXT files are allowed");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadedFile(file);
    setIsProcessingFile(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/settings/process-prompt-file", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newPrompt = data.extractedText;

        // Update state
        setPreferences((prev) => ({
          ...prev,
          customSystemPrompt: newPrompt,
        }));

        // Automatically save to database
        try {
          const saveResponse = await fetch("/api/settings/preferences", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customSystemPrompt: newPrompt,
            }),
          });

          if (saveResponse.ok) {
            toast.success("File processed and preferences saved successfully");
          } else {
            toast.success(
              "File processed successfully (save manually to persist)"
            );
          }
        } catch (saveError) {
          console.error("Error saving preferences:", saveError);
          toast.success(
            "File processed successfully (save manually to persist)"
          );
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to process file");
        setUploadedFile(null);
      }
    } catch (_error) {
      toast.error("Failed to process file");
      setUploadedFile(null);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  if (isPending || !session?.user) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1440px] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1440px] flex-col space-y-6 rounded-2xl bg-background p-6">
      {/* Header */}
      <div>
        <h1 className="font-semibold text-3xl">Account settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card - Left Side */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Image */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
                  {session.user.image ? (
                    <Image
                      alt={session.user.name || "User"}
                      className="object-cover"
                      fill
                      src={session.user.image}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-semibold text-2xl">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold">{session.user.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {session.user.email}
                  </p>
                </div>
              </div>

              {/* User ID */}
              <div>
                <Label className="text-muted-foreground text-xs">User ID</Label>
                <div className="mt-1 flex items-center justify-between rounded-md bg-muted px-3 py-2">
                  <span className="truncate font-mono text-sm">
                    {session.user.id}
                  </span>
                  <Copy
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => copyToClipboard(session.user.id)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferences and Actions - Right Side */}
        <div className="space-y-6 lg:col-span-2">
          {/* System Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customSystemPrompt">Custom System Prompt</Label>

                {/* File Upload Section */}
                <div className="mt-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Button
                      className="gap-2"
                      disabled={isProcessingFile}
                      onClick={() =>
                        document.getElementById("promptFileInput")?.click()
                      }
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {isProcessingFile ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload File (PDF/TXT)
                        </>
                      )}
                    </Button>
                    <input
                      accept=".pdf,.txt"
                      className="hidden"
                      id="promptFileInput"
                      onChange={handleFileUpload}
                      type="file"
                    />
                  </div>

                  {uploadedFile && (
                    <div className="mt-2 flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate text-sm">
                        {uploadedFile.name}
                      </span>
                      <Button
                        className="h-6 w-6 p-0"
                        onClick={removeUploadedFile}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <p className="mt-1 text-muted-foreground text-xs">
                    Upload a PDF or TXT file to extract text as your system
                    prompt
                  </p>
                </div>

                <Textarea
                  className="mt-2"
                  id="customSystemPrompt"
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      customSystemPrompt: e.target.value,
                    }))
                  }
                  placeholder="Enter your custom system prompt here..."
                  rows={8}
                  value={preferences.customSystemPrompt}
                />
                <p className="mt-1 text-muted-foreground text-sm">
                  This will be used as the default system prompt for new chats.
                </p>
              </div>

              <Button
                disabled={isUpdatingPrefs}
                onClick={handlePreferencesUpdate}
              >
                {isUpdatingPrefs && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save preferences
              </Button>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Export chat history</p>
                  <p className="text-muted-foreground text-sm">
                    Download all your chat conversations as a CSV file.
                  </p>
                </div>
                <Button
                  className="gap-2"
                  disabled={isExporting}
                  onClick={handleExportChats}
                  variant="outline"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">
                Danger zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete account</p>
                  <p className="text-muted-foreground text-sm">
                    Permanently delete your account and all data.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="gap-2" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>
                          This action cannot be undone. This will permanently
                          delete your account and remove all your data from our
                          servers.
                        </p>
                        <p>
                          Please type <strong>DELETE</strong> to confirm:
                        </p>
                        <Input
                          className="mt-2"
                          onChange={(e) =>
                            setDeleteConfirmation(e.target.value)
                          }
                          placeholder="Type DELETE to confirm"
                          value={deleteConfirmation}
                        />
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setDeleteConfirmation("")}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        disabled={
                          deleteConfirmation !== "DELETE" || isDeletingAccount
                        }
                        onClick={handleDeleteAccount}
                      >
                        {isDeletingAccount ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
