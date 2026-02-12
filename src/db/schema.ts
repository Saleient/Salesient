import { generateId } from "ai";
import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  real,
  text,
  timestamp,
  vector,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const chat = pgTable("chat", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull().default("New Chat"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  attachments: json("attachments").notNull().default([]),
});

export const message = pgTable("message", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId()),
  chatId: text("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant' | 'tool'
  content: text("content"), // Text content for user/assistant messages
  parts: json("parts").notNull(), // Array of message parts (text, tool-call, tool-result)
  attachments: json("attachments").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  totalTokens: integer("total_tokens"),
  completionTime: real("completion_time"),
  // Sequence number for proper ordering
  sequence: integer("sequence").notNull(),
});

// Modified subscription table for Dodo payment
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  modifiedAt: timestamp("modified_at"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  recurringInterval: text("recurring_interval").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  canceledAt: timestamp("canceled_at"),
  startedAt: timestamp("started_at").notNull(),
  endsAt: timestamp("ends_at"),
  endedAt: timestamp("ended_at"),
  customerId: text("customer_id").notNull(),
  productId: text("product_id").notNull(),
  discountId: text("discount_id"),
  checkoutId: text("checkout_id").notNull(),
  customerCancellationReason: text("customer_cancellation_reason"),
  customerCancellationComment: text("customer_cancellation_comment"),
  metadata: text("metadata"), // JSON string
  customFieldData: text("custom_field_data"), // JSON string
  userId: text("user_id").references(() => user.id),
});

// Message usage tracking table (unchanged)
export const messageUsage = pgTable("message_usage", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  messageCount: integer("message_count").notNull().default(0),
  date: timestamp("date").notNull().defaultNow(),
  resetAt: timestamp("reset_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const fileUpload = pgTable("file_upload", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  folderId: text("folder_id").references(() => folder.id, {
    onDelete: "cascade",
  }),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  filePath: text("file_path").notNull(),
  integrationName: text("integration_name"),
  integrationLogo: text("integration_logo"),
  imageBase64: text("image_base64"),
  extractedText: text("extracted_text"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const documentChunk = pgTable(
  "document_chunk",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    fileId: text("file_id")
      .notNull()
      .references(() => fileUpload.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 768 }).notNull(),
    metadata: json("metadata").default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("document_chunk_user_id_idx").on(table.userId),
    fileIdIdx: index("document_chunk_file_id_idx").on(table.fileId),
  })
);

export const folder = pgTable("folder", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  systemPreferences: json("system_preferences").default({
    customSystemPrompt: "",
  }),
  prompts: json("prompts").notNull().default([]).$type<
    Array<{
      title: string;
      prompt: string;
      category?: string;
    }>
  >(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  metadata: json("metadata").default({
    fileCount: 0,
    folderCount: 0,
    chatCount: 0,
    hasIntegrations: false,
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = InferSelectModel<typeof user>;
export type Session = InferSelectModel<typeof session>;
export type Account = InferSelectModel<typeof account>;
export type Verification = InferSelectModel<typeof verification>;
export type Chat = InferSelectModel<typeof chat>;
export type Message = InferSelectModel<typeof message>;
export type Subscription = InferSelectModel<typeof subscription>;
export type MessageUsage = InferSelectModel<typeof messageUsage>;
export type FileUpload = InferSelectModel<typeof fileUpload>;
export type DocumentChunk = InferSelectModel<typeof documentChunk>;
export type Folder = InferSelectModel<typeof folder>;
export type UserPreferences = InferSelectModel<typeof userPreferences>;
