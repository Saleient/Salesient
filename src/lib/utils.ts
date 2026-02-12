import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get integration logo URL from integration name
export function getIntegrationLogo(integrationName: string): string {
  // Map integration names to their logo URLs
  const logoMap: Record<string, string> = {
    gmail: "https://logos.composio.dev/api/gmail",
    github: "https://logos.composio.dev/api/github",
    googlecalendar: "https://logos.composio.dev/api/googlecalendar",
    notion: "https://logos.composio.dev/api/notion",
    googlesheets: "https://logos.composio.dev/api/googlesheets",
    slack: "https://logos.composio.dev/api/slack",
    supabase: "https://logos.composio.dev/api/supabase",
    outlook: "https://logos.composio.dev/api/outlook",
    perplexityai:
      "https://cdn.jsdelivr.net/gh/SalesOrbit/open-logos@master//perplexity.jpeg",
    twitter: "https://logos.composio.dev/api/twitter",
    googledrive: "https://logos.composio.dev/api/googledrive",
    googledocs: "https://logos.composio.dev/api/googledocs",
    hubspot: "https://logos.composio.dev/api/hubspot",
    linear: "https://logos.composio.dev/api/linear",
    airtable: "https://logos.composio.dev/api/airtable",
    serpapi: "https://logos.composio.dev/api/serpapi",
    jira: "https://logos.composio.dev/api/jira",
    firecrawl: "https://logos.composio.dev/api/firecrawl",
    tavily: "https://logos.composio.dev/api/tavily",
    youtube: "https://logos.composio.dev/api/youtube",
    slackbot: "https://logos.composio.dev/api/slackbot",
    canvas: "https://logos.composio.dev/api/canvas",
    bitbucket: "https://logos.composio.dev/api/bitbucket",
    googletasks: "https://logos.composio.dev/api/googletasks",
    discord: "https://logos.composio.dev/api/discord",
    figma: "https://logos.composio.dev/api/figma",
    reddit: "https://logos.composio.dev/api/reddit",
    cal: "https://logos.composio.dev/api/cal",
    wrike: "https://logos.composio.dev/api/wrike",
    exa: "https://logos.composio.dev/api/exa",
    sentry: "https://logos.composio.dev/api/sentry",
    snowflake: "https://logos.composio.dev/api/snowflake",
    elevenlabs: "https://logos.composio.dev/api/elevenlabs",
    microsoft_teams: "https://logos.composio.dev/api/microsoft_teams",
    asana: "https://logos.composio.dev/api/asana",
    peopledatalabs: "https://logos.composio.dev/api/peopledatalabs",
    shopify: "https://logos.composio.dev/api/shopify",
    linkedin: "https://logos.composio.dev/api/linkedin",
    google_maps: "https://logos.composio.dev/api/google_maps",
    one_drive: "https://logos.composio.dev/api/one_drive",
    docusign: "https://logos.composio.dev/api/docusign",
    discordbot: "https://logos.composio.dev/api/discordbot",
    salesforce: "https://logos.composio.dev/api/salesforce",
    calendly: "https://logos.composio.dev/api/calendly",
    trello: "https://logos.composio.dev/api/trello",
    apollo: "https://logos.composio.dev/api/apollo",
    semrush: "https://logos.composio.dev/api/semrush",
    mem0: "https://cdn.jsdelivr.net/gh/SalesOrbit/open-logos@master//mem0.png",
    neon: "https://logos.composio.dev/api/neon",
    posthog: "https://logos.composio.dev/api/posthog",
    clickup: "https://logos.composio.dev/api/clickup",
    brevo: "https://logos.composio.dev/api/brevo",
    stripe: "https://logos.composio.dev/api/stripe",
    klaviyo: "https://logos.composio.dev/api/klaviyo",
    browserbase_tool: "https://www.browserbase.com/logo.png",
    mailchimp: "https://logos.composio.dev/api/mailchimp",
    attio: "https://logos.composio.dev/api/attio",
    googlemeet: "https://logos.composio.dev/api/googlemeet",
    zoho: "https://logos.composio.dev/api/zoho",
    fireflies: "https://logos.composio.dev/api/fireflies",
    dropbox: "https://logos.composio.dev/api/dropbox",
    shortcut: "https://logos.composio.dev/api/shortcut",
    confluence: "https://logos.composio.dev/api/confluence",
    freshdesk: "https://logos.composio.dev/api/freshdesk",
    borneo:
      "https://cdn.jsdelivr.net/gh/SalesOrbit/open-logos@master/borneo.jpeg",
    mixpanel: "https://logos.composio.dev/api/mixpanel",
    coda: "https://logos.composio.dev/api/coda",
    acculynx: "https://logos.composio.dev/api/acculynx",
    ahrefs: "https://logos.composio.dev/api/ahrefs",
    affinity: "https://logos.composio.dev/api/affinity",
    amplitude: "https://logos.composio.dev/api/amplitude",
    heygen: "https://logos.composio.dev/api/heygen",
    agencyzoom: "https://logos.composio.dev/api/agencyzoom",
    googlebigquery: "https://logos.composio.dev/api/googlebigquery",
    microsoft_clarity: "https://logos.composio.dev/api/microsoft_clarity",
    coinbase: "https://logos.composio.dev/api/coinbase",
    monday: "https://logos.composio.dev/api/monday",
    semanticscholar: "https://logos.composio.dev/api/semanticscholar",
    sendgrid: "https://logos.composio.dev/api/sendgrid",
    junglescout: "https://logos.composio.dev/api/junglescout",
    pipedrive:
      "https://cdn.jsdelivr.net/gh/SalesOrbit/open-logos@master/pipedrive.svg",
    bamboohr:
      "https://cdn.jsdelivr.net/gh/SalesOrbit/open-logos@master//bamboohr.svg",
    whatsapp:
      "https://cdn.jsdelivr.net/gh/SalesOrbit/open-logos@master/whatsapp-logo.png",
    dynamics365: "https://logos.composio.dev/api/dynamics365",
    zendesk:
      "https://cdn.jsdelivr.net/gh/SalesOrbit/open-logos@master/zendesk.svg",
    googlephotos:
      "https://cdn.jsdelivr.net/gh/SalesOrbit/open-logos@master/Google_Photos.png",
  };

  // Normalize integration name (remove spaces, convert to lowercase)
  const normalizedName = integrationName
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "");

  return logoMap[normalizedName] || "https://logos.composio.dev/api/default";
}

// Convert logo URL to base64
export async function getIntegrationLogoBase64(
  integrationName: string
): Promise<string | null> {
  try {
    const logoUrl = getIntegrationLogo(integrationName);
    const response = await fetch(logoUrl);
    if (!response.ok) {
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Failed to fetch integration logo:", error);
    return null;
  }
}
