import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { serverEnv } from "@/env";

const google = createGoogleGenerativeAI({
  apiKey: serverEnv.GOOGLE_API_KEY,
});
const mistralAI = createMistral({
  apiKey: serverEnv.MISTRAL_API_KEY,
});

export { google, mistralAI };
