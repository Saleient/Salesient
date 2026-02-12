import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { serverEnv } from "@/env";

export const getComposio = () => {
  const apiKey = serverEnv.COMPOSIO_API_KEY;
  if (!apiKey) {
    throw new Error("COMPOSIO_API_KEY environment variable is not set");
  }

  return new Composio({
    apiKey,
  });
};

export const getComposioWithVercel = () => {
  const apiKey = serverEnv.COMPOSIO_API_KEY;
  if (!apiKey) {
    throw new Error("COMPOSIO_API_KEY environment variable is not set");
  }

  return new Composio({
    apiKey,
    provider: new VercelProvider(),
  });
};
