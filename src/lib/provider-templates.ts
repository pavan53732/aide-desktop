import { AIProviderConfig } from "@/stores/provider-store";

// Partial config to pre-fill form
type ProviderTemplate = Omit<AIProviderConfig, "id" | "apiKey" | "selectedModel">;

export const PROVIDER_TEMPLATES: ProviderTemplate[] = [
  // 1. OpenAI
  {
      type: "openai",
      name: "OpenAI",
      endpoint: "https://api.openai.com/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  },
  // 2. Anthropic Claude
  {
      type: "anthropic",
      name: "Anthropic",
      endpoint: "https://api.anthropic.com/v1",
      authType: "x-api-key",
      modelsEndpoint: null,
      chatEndpoint: "/messages",
      fallbackModels: [
          "claude-3-5-sonnet-20240229-v1:0",
          "claude-3-opus-20240229-v1:0",
          "claude-3-sonnet-20240229-v1:0",
          "claude-3-haiku-20240307-v1:0"
      ]
  },
  // 3. Google Gemini
  {
      type: "google",
      name: "Google Gemini",
      endpoint: "https://generativelanguage.googleapis.com/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/models/{model}:generateContent"
  },
  // 4. Mistral AI
  {
      type: "mistral",
      name: "Mistral AI",
      endpoint: "https://api.mistral.ai/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  },
  // 5. Cohere
  {
      type: "cohere",
      name: "Cohere",
      endpoint: "https://api.cohere.ai/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat"
  },
  // 6. OpenAI Compatible (Generic)
  {
      type: "openai_compatible",
      name: "OpenAI Compatible",
      endpoint: "",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions",
      description: "Generic template for any OpenAI-compatible API"
  },
  // 7. OpenRouter
  {
      type: "openai_compatible",
      name: "OpenRouter",
      endpoint: "https://openrouter.ai/api/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions",
      config: {
          extraHeaders: {
              "HTTP-Referer": "https://aide-app.com",
              "X-Title": "AIDE Desktop Editor"
          }
      }
  },
  // 8. Local Ollama
  {
      type: "local",
      name: "Local Ollama",
      endpoint: "http://localhost:11434/api",
      authType: "none",
      modelsEndpoint: "/tags",
      chatEndpoint: "/chat"
  },
  // 9. Azure OpenAI
  {
      type: "openai_compatible",
      name: "Azure OpenAI",
      endpoint: "https://{resource}.openai.azure.com/openai/deployments/{deployment}",
      authType: "x-api-key", // Spec says api-key but implies header usage often
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  },
  // 10. Replicate
  {
      type: "replicate",
      name: "Replicate",
      endpoint: "https://api.replicate.com/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/predictions"
  },
  // 11. Groq
  {
      type: "groq",
      name: "Groq",
      endpoint: "https://api.groq.com/openai/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  },
  // 12. HuggingFace
  {
      type: "huggingface", 
      name: "HuggingFace",
      endpoint: "https://api-inference.huggingface.co",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/models/{model}"
  },
  // 13. Amazon Bedrock
  {
      type: "openai_compatible", // Store doesn't have bedrock
      name: "Amazon Bedrock",
      endpoint: "https://bedrock-runtime.{region}.amazonaws.com",
      authType: "aws",
      modelsEndpoint: null,
      chatEndpoint: "/model/{model}/invoke",
      fallbackModels: [
          "anthropic.claude-3-5-sonnet-20240229-v1:0",
          "anthropic.claude-3-opus-20240229-v1:0",
          "amazon.titan-text-express-v1"
      ]
  },
  // 14. Vertex AI
  {
      type: "google", // Store has google
      name: "Google Vertex AI",
      endpoint: "https://{region}-aiplatform.googleapis.com/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/projects/{project}/locations/{region}/publishers/google/models/{model}:predict"
  },
  // 15. AI21 Labs
  {
      type: "openai_compatible",
      name: "AI21 Labs",
      endpoint: "https://api.ai21.com/studio/v1",
      authType: "bearer",
      modelsEndpoint: null,
      chatEndpoint: "/{model}/complete",
      fallbackModels: ["j2-ultra", "j2-mid", "j2-light"]
  },
  // 16. Writer
  {
      type: "openai_compatible",
      name: "Writer",
      endpoint: "https://api.writer.com/v1",
      authType: "bearer",
      modelsEndpoint: null,
      chatEndpoint: "/completions",
      fallbackModels: ["palmyra-x", "palmyra-base"]
  },
  // 17. Reka AI
  {
      type: "openai_compatible",
      name: "Reka AI",
      endpoint: "https://api.reka.ai/v1",
      authType: "bearer",
      modelsEndpoint: null,
      chatEndpoint: "/chat",
      fallbackModels: ["reka-core", "reka-flash"]
  },
  // 18. Perplexity AI
  {
      type: "openai_compatible",
      name: "Perplexity AI",
      endpoint: "https://api.perplexity.ai",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  },
  // 19. xAI (Grok)
  {
      type: "openai_compatible",
      name: "xAI Grok",
      endpoint: "https://api.x.ai/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  },
  // 20. Inflection AI
  {
      type: "openai_compatible",
      name: "Inflection AI",
      endpoint: "https://api.inflection.ai/v1",
      authType: "bearer",
      modelsEndpoint: null,
      chatEndpoint: "/chat",
      fallbackModels: ["inflection-2.5"]
  },
  // 21. 01.AI
  {
      type: "openai_compatible",
      name: "01.AI",
      endpoint: "https://api.01.ai/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  },
  // 22. Together AI
  {
      type: "openai_compatible",
      name: "Together AI",
      endpoint: "https://api.together.xyz/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  },
  // 23. Anyscale
  {
      type: "openai_compatible",
      name: "Anyscale",
      endpoint: "https://api.endpoints.anyscale.com/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  },
  // 24. Fireworks AI
  {
      type: "openai_compatible",
      name: "Fireworks AI",
      endpoint: "https://api.fireworks.ai/inference/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  },
  // 25. DeepInfra
  {
      type: "openai_compatible",
      name: "DeepInfra",
      endpoint: "https://api.deepinfra.com/v1/openai",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  },
  // 26. Lepton AI
  {
      type: "openai_compatible",
      name: "Lepton AI",
      endpoint: "https://api.lepton.ai/api/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  },
  // 27. Monster API
  {
      type: "openai_compatible",
      name: "Monster API",
      endpoint: "https://api.monsterapi.ai/v1",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  },
  // 28. Novita AI
  {
      type: "openai_compatible",
      name: "Novita AI",
      endpoint: "https://api.novita.ai/v3/openai",
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  },
  // 29. Blackbox AI
  {
      type: "blackbox",
      name: "Blackbox AI",
      endpoint: "https://api.blackbox.ai/v1",
      authType: "bearer",
      modelsEndpoint: null,
      chatEndpoint: "/chat",
      fallbackModels: ["blackbox-code", "blackbox-chat"]
  },
  // 30. OpenCode Zen
  {
      type: "opencode",
      name: "OpenCode Zen",
      endpoint: "https://api.opencode.ai/v1",
      authType: "bearer",
      modelsEndpoint: null,
      chatEndpoint: "/completions",
      fallbackModels: ["opencode-instruct", "opencode-base"]
  },
  // 31. LM Studio
  {
      type: "local",
      name: "LM Studio",
      endpoint: "http://localhost:1234/v1",
      authType: "none",
      modelsEndpoint: "/models",
      chatEndpoint: "/chat/completions"
  }
];

export const CLI_TEMPLATES = [
    { name: "Aider AI", command: "aider", args: "" },
    { name: "GPT Engineer", command: "gpt-engineer", args: "" },
    { name: "Goose CLI", command: "goose", args: "" },
    { name: "GitHub Copilot", command: "gh", args: "copilot" },
    { name: "Claude Code", command: "claude-code", args: "" },
    { name: "Gemini CLI", command: "gemini", args: "" },
    { name: "OpenCode", command: "opencode", args: "" },
    { name: "Blackbox CLI", command: "blackbox", args: "" },
    { name: "Crush CLI", command: "crush", args: "" },
    { name: "Codex CLI", command: "codex", args: "" },
    { name: "Warp AI", command: "warp", args: "" },
    { name: "Droid", command: "droid", args: "" },
];
