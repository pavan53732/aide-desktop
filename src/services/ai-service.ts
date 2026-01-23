import { AIProviderConfig, useProviderStore } from "@/stores/provider-store";
import { invoke } from "@tauri-apps/api/core";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export type TokenCallback = (token: string) => void;

const PARSE_REGEX = /^data: (.*)$/;

/**
 * AI Service
 * 
 * Handles communication with various AI providers (OpenAI, Anthropic, Local, CLI Agents).
 * Implements economic safety checks, trust boundary validation, and supply chain verification
 * by delegating sensitive operations to the Rust backend.
 */
export const AIService = {
  /**
   * Streams a chat completion from the selected provider.
   * 
   * @param provider - Configuration for the AI provider
   * @param messages - Array of chat messages
   * @param modelId - ID of the model to use
   * @param onToken - Callback function for each received token
   * @param signal - Optional AbortSignal to cancel the request
   */
  async streamChat(
    provider: AIProviderConfig,
    messages: Message[],
    modelId: string,
    onToken: TokenCallback,
    signal?: AbortSignal
  ): Promise<void> {
    // --- L2: Economic Budget Check (BACKEND ENFORCED) ---
    // Verifies that the request stays within monthly and session budget limits.
    const budgetOk = await invoke<boolean>("check_budget", {
        providerId: provider.id,
        monthlyCap: provider.config?.monthlyCap || 50.0,
        sessionId: "current-session",
        sessionCap: provider.config?.sessionCap || 5.0
    }).catch(e => { throw new Error(e); });

    if (!budgetOk) throw new Error("Economic Safety Block: Budget exceeded.");

    // --- N1-N2: Trust Boundary Validation (BACKEND ENFORCED) ---
    // Ensures the endpoint is valid and categorized correctly (local vs cloud).
    const endpointToValidate = provider.chatEndpoint || `${provider.endpoint}/chat/completions`;
    await invoke("validate_endpoint", {
        urlStr: endpointToValidate,
        providerType: provider.type === "local" || provider.endpoint?.includes("localhost") ? "local" : "cloud"
    }).catch(e => { throw new Error(e); });

    // --- Q1: Supply Chain Verification (BACKEND ENFORCED) ---
    // For CLI agents, verifies the version of the executable being run.
    if (provider.type === "cli_agent" && provider.config?.command) {
        await invoke("verify_cli_version", {
            agentName: provider.config.command,
            minVersion: "0.1" // Example: force at least v0.1
        }).catch(e => { throw new Error(e); });
    }

    // Handle CLI Agent execution separately
    if (provider.type === "cli_agent") {
        try {
            const response = await invoke<string>("run_cli_agent", {
                agentCommand: provider.config?.command,
                args: provider.config?.args?.split(" ").filter((a: string) => a.trim().length > 0) || [],
                workingDir: provider.config?.workingDirectory || ".",
                envVars: provider.config?.env || {},
                input: messages[messages.length - 1].content
            });
            await invoke("report_success", { providerId: provider.id });
            onToken(response);
            return;
        } catch (e: any) {
            await invoke("report_failure", { providerId: provider.id });
            throw new Error(`CLI Agent execution failed: ${e}`);
        }
    }

    let sessionId: string | undefined;

    try {
      // L1-2-E/F/G: Mandatory Execution Coupling (DISPATCH)
      // The backend resolves authority (model/endpoint) and dispatches in one scope.
      // This prevents "Man-in-the-Middle" or "Confused Deputy" attacks at the frontend level.
      const result = await invoke<string>("dispatch_chat_request", { 
          provider_id: provider.id, 
          messages: messages
      });

      const [sessPart, respPart] = result.split("|RESPONSE:");
      sessionId = sessPart.replace("SESSION_ID:", "");
      const responseBody = JSON.parse(respPart);
      
      const fullText = responseBody.choices?.[0]?.message?.content || "";
      onToken(fullText);

      // Report success to update economic ledger
      await invoke("report_success", { providerId: provider.id });
    } catch (error: any) {
      if (error.name !== "AbortError") {
          // Report failure to audit log
          await invoke("report_failure", { providerId: provider.id });
          throw error;
      }
    }
  },

  async getEmbedding(provider: AIProviderConfig, text: string, modelId: string = "text-embedding-3-small"): Promise<number[]> {
    if (!provider.endpoint) throw new Error("Invalid provider configuration");
    const baseUrl = provider.endpoint.replace(/\/$/, "");
    let embeddingUrl = baseUrl.includes("/v1") ? `${baseUrl.split("/v1")[0]}/v1/embeddings` : (baseUrl.includes("ollama") ? `${baseUrl}/api/embeddings` : `${baseUrl}/embeddings`);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (provider.authType === "bearer" && provider.apiKey) headers["Authorization"] = `Bearer ${provider.apiKey}`;
    else if (provider.authType === "x-api-key" && provider.apiKey) headers["x-api-key"] = provider.apiKey;
    const response = await fetch(embeddingUrl, { method: "POST", headers, body: JSON.stringify({ model: modelId, input: text }) });
    if (!response.ok) throw new Error(`Embedding API Error ${response.status}: ${await response.text()}`);
    const json = await response.json();
    return json.data?.[0]?.embedding || json.embedding || (()=>{throw new Error("Invalid format")})();
  },

  async fetchModels(provider: AIProviderConfig): Promise<any[]> {
    // Get the API key from keychain
    const apiKey = await useProviderStore.getState().getApiKey(provider.id);
    
    if (!provider.endpoint) throw new Error("Invalid provider configuration");
    
    // If there are fallback models and no models endpoint, return fallback models
    if (provider.modelsEndpoint === null && provider.fallbackModels) {
      console.log("Using fallback models for provider:", provider.name);
      return provider.fallbackModels.map(id => ({ id, name: id })); // Return in the expected format
    }

    const url = provider.modelsEndpoint || `${provider.endpoint.replace(/\/$/, "")}/models`;
    const headers: Record<string, string> = {};
    
    if (provider.authType === "bearer" && apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else if (provider.authType === "x-api-key" && apiKey) {
      headers["x-api-key"] = apiKey;
    } else if (provider.authType === "custom" && provider.customAuthHeader && apiKey) {
      headers[provider.customAuthHeader] = apiKey;
    }

    try {
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`API Error ${response.status}: ${await response.text()}`);
      
      const data = await response.json();
      const models = Array.isArray(data.data) ? data.data : data;
      
      // If models are returned successfully, we don't use fallbacks
      return models;
    } catch (error) {
      // If fetching models fails, check if we have fallback models to use
      if (provider.fallbackModels) {
        console.log("Using fallback models due to fetch error:", error);
        return provider.fallbackModels.map(id => ({ id, name: id })); // Return in the expected format
      } else {
        throw error; // Re-throw if no fallbacks available
      }
    }
  }
};
