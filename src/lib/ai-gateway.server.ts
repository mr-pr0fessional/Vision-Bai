import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Provider for a local Ollama instance.
 * Ollama exposes an OpenAI-compatible API at http://localhost:11434/v1.
 * No real API key is required — "ollama" is used as a placeholder.
 * Override the base URL via the OLLAMA_BASE_URL environment variable
 * (useful when Ollama runs on a remote machine or different port).
 * Server-only.
 */
export function createOllamaProvider() {
  const baseURL =
    process.env["OLLAMA_BASE_URL"] ?? "http://localhost:11434/v1";
  return createOpenAICompatible({
    name: "ollama",
    baseURL,
    headers: {
      Authorization: "Bearer ollama",
    },
  });
}
