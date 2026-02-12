import { tool } from "ai";
import { z } from "zod";

/**
 * Integration configurations for file downloads
 * Maps integration names to their download actions and parameter schemas
 */
const INTEGRATION_CONFIGS = {
  onedrive: {
    downloadAction: "ONEDRIVE_DOWNLOAD_FILE",
    requiredParams: ["fileId"],
    description: "Microsoft OneDrive file download",
  },
  googledrive: {
    downloadAction: "GOOGLEDRIVE_DOWNLOAD_FILE",
    requiredParams: ["fileId"],
    description: "Google Drive file download",
  },
  dropbox: {
    downloadAction: "DROPBOX_DOWNLOAD_FILE",
    requiredParams: ["path"],
    description: "Dropbox file download",
  },
  box: {
    downloadAction: "BOX_DOWNLOAD_FILE",
    requiredParams: ["fileId"],
    description: "Box file download",
  },
  s3: {
    downloadAction: "S3_DOWNLOAD_FILE",
    requiredParams: ["bucket", "key"],
    description: "AWS S3 file download",
  },
  sharepoint: {
    downloadAction: "SHAREPOINT_DOWNLOAD_FILE",
    requiredParams: ["siteId", "driveId", "itemId"],
    description: "SharePoint file download",
  },
  notion: {
    downloadAction: "NOTION_EXPORT_PAGE",
    requiredParams: ["pageId"],
    description: "Notion page export",
  },
} as const;

type IntegrationName = keyof typeof INTEGRATION_CONFIGS;

/**
 * Smart File Reader Helper
 *
 * Provides guidance on processing files from cloud integrations.
 * This is a helper tool that instructs the AI on the two-step process:
 * 1. Call the integration's download action (via MCP)
 * 2. Pass the response to ComposioFileProcessor
 */
export function createSmartFileReader(userId: string) {
  return tool({
    description: `Guide for reading and indexing files from cloud storage integrations (OneDrive, Google Drive, Dropbox, etc.).

This tool provides the correct workflow for processing files:
1. First call the integration's download action (e.g., ONEDRIVE_DOWNLOAD_FILE via MCP tools)
2. Then call COMPOSIO_FILE_PROCESSOR with the download response to process and index the file

Returns the action name and parameters needed for the download step.

Supported integrations: OneDrive, Google Drive, Dropbox, Box, S3, SharePoint, Notion`,

    inputSchema: z.object({
      integration: z
        .enum([
          "onedrive",
          "googledrive",
          "dropbox",
          "box",
          "s3",
          "sharepoint",
          "notion",
        ])
        .describe("The cloud storage integration where the file is located"),

      fileId: z
        .string()
        .optional()
        .describe(
          "File ID for OneDrive, Google Drive, Box (required for these integrations)"
        ),

      filePath: z
        .string()
        .optional()
        .describe("File path for Dropbox (required for Dropbox)"),

      fileName: z
        .string()
        .describe(
          "Name of the file including extension (e.g., 'report.pdf', 'data.xlsx')"
        ),

      entityId: z
        .string()
        .describe(
          "Composio entity ID (connected account ID) for the integration"
        ),

      folderId: z
        .string()
        .optional()
        .describe("Optional folder ID to organize the file in the database"),

      // S3-specific parameters
      bucket: z
        .string()
        .optional()
        .describe("S3 bucket name (required for S3 integration)"),

      key: z
        .string()
        .optional()
        .describe("S3 object key/path (required for S3 integration)"),

      // SharePoint-specific parameters
      siteId: z
        .string()
        .optional()
        .describe("SharePoint site ID (required for SharePoint)"),

      driveId: z
        .string()
        .optional()
        .describe("SharePoint drive ID (required for SharePoint)"),

      itemId: z
        .string()
        .optional()
        .describe("SharePoint item ID (required for SharePoint)"),

      // Notion-specific parameters
      pageId: z
        .string()
        .optional()
        .describe("Notion page ID (required for Notion)"),
    }),

    execute: (params) => {
      const { integration, fileName, folderId } = params;

      try {
        // Get integration configuration
        const config = INTEGRATION_CONFIGS[integration as IntegrationName];
        if (!config) {
          throw new Error(`Unsupported integration: ${integration}`);
        }

        // Build action parameters based on integration type
        const actionParams = buildActionParams(integration, params);

        // Check for missing required parameters and provide guidance
        const missingParams = getMissingParams(integration, actionParams);
        if (missingParams.length > 0) {
          return {
            success: false,
            error: `Missing required parameters for ${integration}: ${missingParams.join(", ")}`,
            guidance: {
              message:
                "Before calling SMART_FILE_READER, you need to obtain the missing parameters using the appropriate list/search action.",
              steps: getParameterGuidance(integration, missingParams, fileName),
            },
            hint: getIntegrationHint(integration),
          };
        }

        // Validate required parameters (should not fail now)
        validateParams(integration, actionParams);

        // Return instructions for the AI to follow
        return {
          success: true,
          workflow: "two-step",
          step: 1,
          message: `To process ${fileName} from ${integration}, follow these steps:`,
          instructions: [
            {
              step: 1,
              action: config.downloadAction,
              description: `Call the ${config.downloadAction} action using MCP tools`,
              params: actionParams,
              hint: getIntegrationHint(integration),
            },
            {
              step: 2,
              action: "COMPOSIO_FILE_PROCESSOR",
              description:
                "Pass the download response to COMPOSIO_FILE_PROCESSOR to index the file",
              params: {
                downloadResponse: "<result from step 1>",
                integrationName: integration,
                fileName,
                userId,
                folderId: folderId || undefined,
              },
            },
          ],
          nextAction: config.downloadAction,
          nextActionParams: actionParams,
          quickStart: `First, call ${config.downloadAction} with params: ${JSON.stringify(actionParams)}`,
        };
      } catch (error) {
        console.error("Smart file reader error:", error);

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to prepare file reading workflow",
          hint: getIntegrationHint(integration),
        };
      }
    },
  });
}

/**
 * Build action parameters based on integration type
 */
function buildActionParams(
  integration: string,
  params: Record<string, unknown>
): Record<string, unknown> {
  switch (integration) {
    case "onedrive":
    case "googledrive":
    case "box":
      return { fileId: params.fileId };

    case "dropbox":
      return { path: params.filePath };

    case "s3":
      return {
        bucket: params.bucket,
        key: params.key,
      };

    case "sharepoint":
      return {
        siteId: params.siteId,
        driveId: params.driveId,
        itemId: params.itemId,
      };

    case "notion":
      return {
        pageId: params.pageId,
        exportFormat: "pdf", // Export Notion pages as PDF
      };

    default:
      throw new Error(`Unknown integration: ${integration}`);
  }
}

/**
 * Validate required parameters for each integration
 */
function validateParams(
  integration: string,
  actionParams: Record<string, unknown>
): void {
  const config = INTEGRATION_CONFIGS[integration as IntegrationName];

  for (const param of config.requiredParams) {
    if (!actionParams[param]) {
      throw new Error(
        `Missing required parameter '${param}' for ${integration} integration. ${getIntegrationHint(integration)}`
      );
    }
  }
}

/**
 * Provide helpful hints for each integration
 */
function getIntegrationHint(integration: string): string {
  const hints: Record<string, string> = {
    onedrive: "For OneDrive, provide the fileId from the file's metadata.",
    googledrive:
      "For Google Drive, provide the fileId from the file's metadata or URL.",
    dropbox:
      "For Dropbox, provide the full file path (e.g., '/Documents/report.pdf').",
    box: "For Box, provide the fileId from the file's metadata.",
    s3: "For S3, provide both bucket name and object key.",
    sharepoint:
      "For SharePoint, provide siteId, driveId, and itemId from the file's metadata.",
    notion:
      "For Notion, provide the pageId. The page will be exported as a PDF.",
  };

  return (
    hints[integration] ||
    "Check the integration documentation for required parameters."
  );
}

/**
 * Get list of missing required parameters
 */
function getMissingParams(
  integration: string,
  actionParams: Record<string, unknown>
): string[] {
  const config = INTEGRATION_CONFIGS[integration as IntegrationName];
  return config.requiredParams.filter((param) => !actionParams[param]);
}

/**
 * Provide guidance on how to obtain missing parameters
 */
function getParameterGuidance(
  integration: string,
  missingParams: string[],
  fileName?: string
): Array<{
  step: number;
  action: string;
  description: string;
  params?: Record<string, unknown>;
  example?: string;
}> {
  const guidance: Record<
    string,
    (
      missing: string[],
      fileNameParam?: string
    ) => Array<{
      step: number;
      action: string;
      description: string;
      params?: Record<string, unknown>;
      example?: string;
    }>
  > = {
    onedrive: (missing) => {
      if (missing.includes("fileId")) {
        return [
          {
            step: 1,
            action: "ONEDRIVE_LIST_FILES",
            description: `Search for the file "${fileName || "target file"}" to get its fileId`,
            params: {
              query: fileName || "search for the file",
              limit: 10,
            },
            example: `Call ONEDRIVE_LIST_FILES with query: "${fileName || "example.pdf"}"`,
          },
        ];
      }
      return [];
    },
    googledrive: (missing) => {
      if (missing.includes("fileId")) {
        return [
          {
            step: 1,
            action: "GOOGLEDRIVE_LIST_FILES",
            description: `Search for the file "${fileName || "target file"}" to get its fileId`,
            params: {
              query: `name='${fileName || "target file"}'`,
              pageSize: 10,
            },
            example: `Call GOOGLEDRIVE_LIST_FILES with query: "name='${fileName || "example.pdf"}'"`,
          },
        ];
      }
      return [];
    },
    dropbox: (missing) => {
      if (missing.includes("path")) {
        return [
          {
            step: 1,
            action: "DROPBOX_LIST_FOLDER",
            description: `List files in the target folder to find the full path for "${fileName || "target file"}"`,
            params: {
              path: "", // Root folder
            },
            example:
              'Call DROPBOX_LIST_FOLDER with path: "" (empty string for root)',
          },
        ];
      }
      return [];
    },
    box: (missing) => {
      if (missing.includes("fileId")) {
        return [
          {
            step: 1,
            action: "BOX_LIST_ITEMS",
            description: `Search for the file "${fileName || "target file"}" to get its fileId`,
            params: {
              folderId: "0", // Root folder
              limit: 100,
            },
            example: 'Call BOX_LIST_ITEMS with folderId: "0"',
          },
        ];
      }
      return [];
    },
    sharepoint: (
      missing: string[],
      _fileNameParam?: string
    ): Array<{
      step: number;
      action: string;
      description: string;
      params?: Record<string, unknown>;
      example?: string;
    }> => {
      const steps: Array<{
        step: number;
        action: string;
        description: string;
        params?: Record<string, unknown>;
        example?: string;
      }> = [];
      if (missing.includes("siteId")) {
        steps.push({
          step: steps.length + 1,
          action: "SHAREPOINT_LIST_SITES",
          description:
            "Get available SharePoint sites to find the correct siteId",
          params: {},
          example: "Call SHAREPOINT_LIST_SITES with no parameters",
        });
      }
      if (missing.includes("driveId") || missing.includes("itemId")) {
        steps.push({
          step: steps.length + 1,
          action: "SHAREPOINT_LIST_DRIVES",
          description: "List drives in the site to get driveId",
          params: {
            siteId: "<siteId from previous step>",
          },
          example:
            "Call SHAREPOINT_LIST_DRIVES with siteId from SHAREPOINT_LIST_SITES",
        });
        steps.push({
          step: steps.length + 2,
          action: "SHAREPOINT_LIST_ITEMS",
          description: `List items in the drive to find "${fileName || "target file"}" and get itemId`,
          params: {
            siteId: "<siteId>",
            driveId: "<driveId from previous step>",
          },
          example: "Call SHAREPOINT_LIST_ITEMS with siteId and driveId",
        });
      }
      return steps;
    },
    notion: (missing) => {
      if (missing.includes("pageId")) {
        return [
          {
            step: 1,
            action: "NOTION_LIST_PAGES",
            description: `Search for the Notion page "${fileName || "target page"}" to get its pageId`,
            params: {
              filter: {
                property: "title",
                title: {
                  contains: fileName || "target page",
                },
              },
            },
            example: `Call NOTION_LIST_PAGES with filter containing "${fileName || "example page"}"`,
          },
        ];
      }
      return [];
    },
  };

  const guidanceFn = guidance[integration];
  return guidanceFn ? guidanceFn(missingParams, fileName) : [];
}
