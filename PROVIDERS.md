# AIDE - AI Provider Configuration Reference

> Constitution Status: Ratified  
> Stability Tier: Core  
> Last Amended: 2026-01-25  
> Governing Document: SPECIFICATIONS.md

---

## ⚠️ IMPORTANT: Read This First

> **This section is MANDATORY reading for all developers, AI agents, AI assistants, and anyone working with this codebase.**

### Core Principles

| #   | Principle                                    | Description                                                                                                                  |
| --- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Models are NEVER hardcoded**               | All AI models are fetched dynamically from provider APIs at runtime. |
| 2   | **User selects the model**                   | After selecting a provider, the app fetches available models and user picks one. The `selectedModel` field starts as `null`. |
| 3   | **Priority order matters**                   | `openai_compatible` providers first (cost-efficient), `openai` direct last (expensive fallback).                             |
| 4   | **Fallback models are last resort**          | The `fallbackModels` field is ONLY used when a provider's `/models` endpoint is unavailable or fails.                       |
| 5   | **CLI agents ≠ HTTP providers**              | CLI agents (Aider, Copilot CLI) run local commands. HTTP providers call remote APIs. Different validation logic applies.     |
| 6   | **API keys are NEVER stored in plaintext**   | All API keys must be encrypted using the OS-native secure key store:
- Windows: Credential Manager
- macOS: Keychain
- Linux: Secret Service / KWallet       |
| 7   | **Provider templates define endpoints only** | The JSON templates in this doc define API endpoints and auth methods, NOT available models.                                  |
| 8   | **No Telemetry (Exception)**                 | OpenRouter requires `extraHeaders` for rankings. This is the only allowed exception to the "No Telemetry" rule.              |

### User Flow (Must Understand)

```
1. User adds a provider (e.g., OpenRouter)
         ↓
2. User enters API key (stored encrypted in OS keychain)
         ↓
3. App calls provider's /models endpoint
         ↓
4. App displays available models in dropdown
         ↓
5. User selects a model
         ↓
6. App saves: { "selectedModel": "user-selected-model" }
         ↓
7. User can now chat with that provider/model
```

### Do's and Don'ts

| ✅ DO                                            | ❌ DON'T                                       |
| ------------------------------------------------ | ---------------------------------------------- |
| Fetch models dynamically from `/models` endpoint | Hardcode model names like `"gpt-4"` in code    |
| Use `selectedModel: null` as default             | Use `defaultModel: "gpt-4-turbo"`              |
| Check if `selectedModel` exists before API call  | Assume a model is always selected              |
| Use `fallbackModels` only when API fails        | Use `fallbackModels` as primary source        |
| Store API keys in OS keychain                    | Store API keys in config files or localStorage |
| Validate CLI agents by checking binary exists    | Try to `fetch()` CLI agent endpoints           |

### Quick Reference: Provider Types

| Type                | Example Providers             | Models Endpoint      | Auth          |
| ------------------- | ----------------------------- | -------------------- | ------------- |
| `openai_compatible` | OpenRouter, Groq, Together AI | `/models`            | Bearer        |
| `openai`            | OpenAI (direct)               | `/models`            | Bearer        |
| `anthropic`         | Anthropic Claude              | None (fallback)      | x-api-key     |
| `google`            | Google Gemini                 | `/models`            | Bearer        |
| `mistral`           | Mistral AI                    | `/models`            | Bearer        |
| `cohere`            | Cohere                        | `/models`            | Bearer        |
| `bedrock`           | Amazon Bedrock                | None (fallback)      | AWS           |
| `vertex`            | Google Vertex AI              | `/models`            | Bearer        |
| `replicate`         | Replicate                     | `/models`            | Bearer        |
| `huggingface`       | HuggingFace Inference         | `/models`            | Bearer        |
| `ai21`              | AI21 Labs                     | None (fallback)      | Bearer        |
| `writer`            | Writer                        | None (fallback)      | Bearer        |
| `reka`              | Reka AI                       | None (fallback)      | Bearer        |
| `inflection`        | Inflection AI                 | None (fallback)      | Bearer        |
| `blackbox`          | Blackbox AI                   | None (fallback)      | Bearer        |
| `opencode`          | OpenCode Zen                  | None (fallback)      | Bearer        |
| `local`             | Ollama, LM Studio             | `/tags` or `/models` | None          |
| `cli_agent`         | Aider, Copilot CLI            | N/A (local binary)   | None          |

---

## Governance & Change Control

This document is governed by the **AIDE Constitution** defined in `SPECIFICATIONS.md`.

All changes to this file MUST:
1. Preserve the **dynamic model discovery rule** (no hardcoded models)
2. Preserve the **provider priority strategy**
3. Preserve the **CLI vs HTTP provider separation**
4. Preserve the **AIControlPlane as the single AI authority**
5. Update the `Last Amended` field in the header

Breaking changes to:
- Provider schema
- Capability flags
- Tauri command names
- Fallback strategy

Require a corresponding amendment in `SPECIFICATIONS.md`.

---

## Overview

This document defines the **constitutional provider schema and configuration law** for all AI providers supported by AIDE (AI Desktop Editor). Each provider includes endpoint details, authentication methods, and standardized configuration templates.

## Provider Quick Reference

> **Priority Strategy:**
>
> 1. `openai_compatible` (generic) - Any custom OpenAI-compatible endpoint
> 2. Pre-configured `openai_compatible` providers (OpenRouter, Groq, Together, etc.)
> 3. Native providers (Anthropic, Google, Mistral, etc.)
> 4. Local providers (Ollama, LM Studio)
> 5. CLI Agents (Aider, Copilot CLI, etc.)
> 6. `openai` (direct) - **Last resort fallback** (most expensive)

### Example Cloud Providers (HTTP)

| Priority | ID                  | Provider Name               | Type                | API Endpoint                                   | Auth      | Models Endpoint |
| -------- | ------------------- | --------------------------- | ------------------- | ---------------------------------------------- | --------- | --------------- |
| 1        | `openai_compatible` | OpenAI Compatible (Generic) | `openai_compatible` | User-defined                                   | Bearer    | `/models`       |
| 2        | `openrouter`        | OpenRouter                  | `openai_compatible` | `https://openrouter.ai/api/v1`                 | Bearer    | `/models`       |
| 3        | `groq`              | Groq                        | `openai_compatible` | `https://api.groq.com/openai/v1`               | Bearer    | `/models`       |
| 4        | `together`          | Together AI                 | `openai_compatible` | `https://api.together.xyz/v1`                  | Bearer    | `/models`       |
| 5        | `anthropic`         | Anthropic Claude            | `anthropic`         | `https://api.anthropic.com/v1`                 | x-api-key | None (fallback) |
| 6        | `google`            | Google Gemini               | `google`            | `https://generativelanguage.googleapis.com/v1` | Bearer    | `/models`       |
| 7        | `mistral`           | Mistral AI                  | `mistral`           | `https://api.mistral.ai/v1`                    | Bearer    | `/models`       |
| 8        | `cohere`            | Cohere                      | `cohere`            | `https://api.cohere.ai/v1`                     | Bearer    | `/models`       |
| ...      | ...                 | (other providers)           | ...                 | ...                                            | ...       | ...             |
| 99       | `openai`            | OpenAI (Direct Fallback)    | `openai`            | `https://api.openai.com/v1`                    | Bearer    | `/models`       |

> **Note:** Models are fetched dynamically from each provider's API. The "Models Endpoint" column shows where AIDE fetches available models. Providers marked "None (fallback)" use a static fallback list.

> **Note:** This table shows examples of cloud providers. The complete list of 31 HTTP provider templates (29 cloud + 2 local) + 13 CLI agents = 44 total AI connections is detailed in the [Provider Templates](#provider-templates-api-configuration-only) section below.

### CLI Agents (Local) - Priorities 51-62

| ID             | Agent Name         | Command        | Installation                             | Priority |
| -------------- | ------------------ | -------------- | ---------------------------------------- | -------- |
| `aider`        | Aider AI           | `aider`        | `pip install aider-chat`                 | 51       |
| `gpt-engineer` | GPT Engineer       | `gpt-engineer` | `pip install gpt-engineer`               | 52       |
| `goose`        | Goose CLI          | `goose`        | `pip install goose-ai`                   | 53       |
| `gh-copilot`   | GitHub Copilot CLI | `gh copilot`   | `gh extension install github/gh-copilot` | 54       |
| `claude-code`  | Claude Code        | `claude-code`  | `pip install claude-code`                | 55       |
| `gemini-cli`   | Gemini CLI         | `gemini`       | `pip install gemini-cli`                 | 56       |
| `opencode_cli` | OpenCode           | `opencode`     | `npm install -g opencode-cli`            | 57       |
| `blackbox_cli` | Blackbox CLI       | `blackbox`     | `npm install -g blackbox-cli`            | 58       |
| `crush`        | Crush CLI          | `crush`        | `cargo install crush-cli`                | 59       |
| `codex`        | Codex CLI          | `codex`        | `pip install codex-cli`                  | 60       |
| `warp`         | Warp AI            | Built-in       | Download Warp terminal                   | 61       |
| `droid`        | Droid              | `droid`        | `npm install -g droid-cli`               | 62       |
| `qwen_cli`     | Qwen CLI           | `qwen`         | `pip install qwen-cli`                   | 63       |
| `qwen_cli`     | Qwen CLI           | `qwen`         | `pip install qwen-cli`                   | 63       |

## Dynamic Model Discovery

AIDE supports dynamic model fetching. See [Implementation Strategy](#implementation-strategy-dynamic-model-discovery) for details.

## Provider Templates (API Configuration Only)

**ℹ️ These templates define API endpoints and authentication. Models are fetched dynamically at runtime.**

> **Note:** The `fallbackModels` field is ONLY used when the provider's `/models` endpoint is unavailable or doesn't exist.

### 1. OpenAI

```json
{
  "type": "openai",
  "config": {
    "name": "OpenAI",
    "endpoint": "https://api.openai.com/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions",
    "capabilities": {
      "chat": true,
      "embeddings": true,
      "streaming": true,
      "functionCalling": true,
      "vision": true,
      "codeGeneration": true,
      "largeContext": true,
      "multimodal": true
    }
  }
}
```

### 2. Anthropic Claude

```json
{
  "type": "anthropic",
  "config": {
    "name": "Anthropic",
    "endpoint": "https://api.anthropic.com/v1",
    "authType": "x-api-key",
    "modelsEndpoint": null,
    "chatEndpoint": "/messages",
    "capabilities": {
      "chat": true,
      "embeddings": false,
      "streaming": true,
      "functionCalling": true,
      "vision": true,
      "codeGeneration": true,
      "largeContext": true,
      "multimodal": true
    },
    "fallbackModels": [
      "claude-3-5-sonnet",
      "claude-3-opus",
      "claude-3-sonnet",
      "claude-3-haiku"
    ]
  }
}
```

### 3. Google Gemini

```json
{
  "type": "google",
  "config": {
    "name": "Google Gemini",
    "endpoint": "https://generativelanguage.googleapis.com/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/models/{model}:generateContent"
  }
}
```

### 4. Mistral AI

```json
{
  "type": "mistral",
  "config": {
    "name": "Mistral AI",
    "endpoint": "https://api.mistral.ai/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

### 5. Cohere

```json
{
  "type": "cohere",
  "config": {
    "name": "Cohere",
    "endpoint": "https://api.cohere.ai/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat"
  }
}
```

### 6. OpenAI Compatible (Generic)

```json
{
  "type": "openai_compatible",
  "config": {
    "name": "OpenAI Compatible",
    "endpoint": "{user_defined_endpoint}",
    "authType": "bearer",
    "description": "Generic template for any OpenAI-compatible API",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

### 7. OpenRouter

```json
{
  "type": "openai_compatible",
  "config": {
    "name": "OpenRouter",
    "endpoint": "https://openrouter.ai/api/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions",
    "capabilities": {
      "chat": true,
      "embeddings": false,
      "streaming": true,
      "functionCalling": true,
      "vision": true,
      "codeGeneration": true,
      "largeContext": true,
      "multimodal": true
    },
    "extraHeaders": {
      "HTTP-Referer": "https://aide-app.com",
      "X-Title": "AIDE Desktop Editor"
    }
  }
}
```

> **Note:** OpenRouter requires `extraHeaders` for rankings.

### 8. Local Ollama

```json
{
  "type": "local",
  "config": {
    "name": "Local Ollama",
    "endpoint": "http://localhost:11434/api",
    "authType": "none",
    "modelsEndpoint": "/tags",
    "chatEndpoint": "/chat",
    "capabilities": {
      "chat": true,
      "embeddings": true,
      "streaming": true,
      "functionCalling": false,
      "vision": false,
      "codeGeneration": true,
      "largeContext": false,
      "multimodal": false
    }
  }
}
```

### 9. Azure OpenAI

```json
{
  "type": "openai_compatible",
  "config": {
    "name": "Azure OpenAI",
    "endpoint": "https://{resource}.openai.azure.com/openai/deployments/{deployment}",
    "authType": "api-key",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

### 10. Replicate

```json
{
  "type": "replicate",
  "config": {
    "name": "Replicate",
    "endpoint": "https://api.replicate.com/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/predictions"
  }
}
```

### 11. Groq

```json
{
  "type": "openai_compatible",
  "config": {
    "name": "Groq",
    "endpoint": "https://api.groq.com/openai/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

### 12. HuggingFace

```json
{
  "type": "huggingface",
  "config": {
    "name": "HuggingFace",
    "endpoint": "https://api-inference.huggingface.co",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/models/{model}"
  }
}
```

### 13. Bedrock (Amazon)

```json
{
  "type": "bedrock",
  "config": {
    "name": "Amazon Bedrock",
    "endpoint": "https://bedrock-runtime.{region}.amazonaws.com",
    "authType": "aws",
    "modelsEndpoint": null,
    "chatEndpoint": "/model/{model}/invoke",
    "fallbackModels": [
      "anthropic.claude-3-5-sonnet-20240229-v1:0",
      "anthropic.claude-3-opus-20240229-v1:0",
      "amazon.titan-text-express-v1"
    ]
  }
}
```

### 14. Vertex AI (Google)

```json
{
  "type": "vertex",
  "config": {
    "name": "Google Vertex AI",
    "endpoint": "https://{region}-aiplatform.googleapis.com/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/projects/{project}/locations/{region}/publishers/google/models/{model}:streamGenerateContent"
  }
}
```

### 15. AI21 Labs

```json
{
  "type": "ai21",
  "config": {
    "name": "AI21 Labs",
    "endpoint": "https://api.ai21.com/studio/v1",
    "authType": "bearer",
    "modelsEndpoint": null,
    "chatEndpoint": "/{model}/complete",
    "fallbackModels": ["j2-ultra", "j2-mid", "j2-light"]
  }
}
```

### 16. Writer

```json
{
  "type": "writer",
  "config": {
    "name": "Writer",
    "endpoint": "https://api.writer.com/v1",
    "authType": "bearer",
    "modelsEndpoint": null,
    "chatEndpoint": "/completions",
    "fallbackModels": ["palmyra-x", "palmyra-base"]
  }
}
```

### 17. Reka AI

```json
{
  "type": "reka",
  "config": {
    "name": "Reka AI",
    "endpoint": "https://api.reka.ai/v1",
    "authType": "bearer",
    "modelsEndpoint": null,
    "chatEndpoint": "/chat",
    "fallbackModels": ["reka-core", "reka-flash"]
  }
}
```

### 18. Perplexity AI

```json
{
  "type": "openai_compatible",
  "config": {
    "name": "Perplexity AI",
    "endpoint": "https://api.perplexity.ai",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

### 19. xAI (Grok)

```json
{
  "type": "openai_compatible",
  "config": {
    "name": "xAI Grok",
    "endpoint": "https://api.x.ai/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

### 20. Inflection AI

```json
{
  "type": "inflection",
  "config": {
    "name": "Inflection AI",
    "endpoint": "https://api.inflection.ai/v1",
    "authType": "bearer",
    "modelsEndpoint": null,
    "chatEndpoint": "/chat",
    "fallbackModels": ["inflection-2.5"]
  }
}
```

### 21. 01.AI

```json
{
  "type": "openai_compatible",
  "config": {
    "name": "01.AI",
    "endpoint": "https://api.01.ai/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

### 22. Together AI

```json
{
  "type": "openai_compatible",
  "config": {
    "name": "Together AI",
    "endpoint": "https://api.together.xyz/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

### 23. Anyscale

```json
{
  "type": "openai_compatible",
  "config": {
    "name": "Anyscale",
    "endpoint": "https://api.endpoints.anyscale.com/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

### 24. Fireworks AI

```json
{
  "type": "openai_compatible",
  "config": {
    "name": "Fireworks AI",
    "endpoint": "https://api.fireworks.ai/inference/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

### 25. DeepInfra

```json
{
  "type": "openai_compatible",
  "config": {
    "name": "DeepInfra",
    "endpoint": "https://api.deepinfra.com/v1/openai",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

### 26. Lepton AI

```json
{
  "type": "openai_compatible",
  "config": {
    "name": "Lepton AI",
    "endpoint": "https://api.lepton.ai/api/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

### 27. Monster API

```json
{
  "type": "openai_compatible",
  "config": {
    "name": "Monster API",
    "endpoint": "https://api.monsterapi.ai/v1",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

### 28. Novita AI

```json
{
  "type": "openai_compatible",
  "config": {
    "name": "Novita AI",
    "endpoint": "https://api.novita.ai/v3/openai",
    "authType": "bearer",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

### 29. Blackbox AI (API)

```json
{
  "type": "blackbox_api",
  "config": {
    "name": "Blackbox AI",
    "endpoint": "https://api.blackbox.ai/v1",
    "authType": "bearer",
    "modelsEndpoint": null,
    "chatEndpoint": "/chat",
    "fallbackModels": ["blackbox-code", "blackbox-chat"]
  }
}
```

### 30. OpenCode Zen (API)

```json
{
  "type": "opencode_api",
  "config": {
    "name": "OpenCode Zen",
    "endpoint": "https://api.opencode.ai/v1",
    "authType": "bearer",
    "modelsEndpoint": null,
    "chatEndpoint": "/completions",
    "fallbackModels": ["opencode-instruct", "opencode-base"]
  }
}
```

### 31. LM Studio

```json
{
  "type": "local",
  "config": {
    "name": "LM Studio",
    "endpoint": "http://localhost:1234/v1",
    "authType": "none",
    "modelsEndpoint": "/models",
    "chatEndpoint": "/chat/completions"
  }
}
```

## Configuration Schema

### Provider Configuration (Discriminated Union)

```typescript
// Shared base configuration
interface BaseProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  apiKey: string; // Encrypted reference
  selectedModel: string | null; // User-selected at runtime
  // Remove capabilities from user config
// capabilities: ProviderCapabilities; // What this provider can do
}

// Provider capabilities
interface ProviderCapabilities {
  chat: boolean;              // Supports chat completions
  embeddings: boolean;        // Supports text embeddings
  streaming: boolean;         // Supports streaming responses
  functionCalling: boolean;   // Supports function/tool calling
  vision: boolean;           // Supports image understanding
  codeGeneration: boolean;   // Optimized for code generation
  largeContext: boolean;     // Supports large context windows (>32k tokens)
  multimodal: boolean;       // Supports multiple input types
}

// 1. HTTP/Cloud Providers (OpenAI, Anthropic, etc.)
interface CloudProviderConfig extends BaseProviderConfig {
  type:
    | "openai"
    | "anthropic"
    | "google"
    | "mistral"
    | "cohere"
    | "openai_compatible"
    | "bedrock"
    | "vertex"
    | "replicate"
    | "huggingface"
    | "ai21"
    | "writer"
    | "reka"
    | "inflection"
    | "blackbox_api"
    | "opencode_api"
    | "local";
  endpoint: string;
  config: {
    authType:
      | "bearer"
      | "x-api-key"
      | "api-key"
      | "aws"
      | "none";
    modelsEndpoint: string | null;
    chatEndpoint: string;
    headers?: Record<string, string>;
    temperature?: number;
    maxTokens?: number;
    region?: string; // AWS/Google
    deployment?: string; // Azure
    resource?: string; // Azure
  };
}

// 2. CLI Agent Providers (Aider, Goose, etc.)
interface CLIProviderConfig extends BaseProviderConfig {
  type: "cli_agent";
  command: string; // The binary to execute (e.g., "aider")
  workingDirectory?: string; // Where to run the command
  endpoint?: string; // Optional pseudo-url (e.g., "local://aider")
  config: {
    authType: "none"; // CLI tools handle their own auth or env vars
    environmentVars?: Record<string, string>;
    flags?: string[]; // Extra CLI flags (e.g., ["--no-auto-commits"])
  };
}

// Combined Type
export type AIProviderConfig = CloudProviderConfig | CLIProviderConfig;
```

### Application Configuration File (Complete Example)

```json
{
  "providers": [
    {
      "id": "custom-openai-compatible",
      "name": "Custom OpenAI Compatible",
      "type": "openai_compatible",
      "endpoint": "https://your-custom-endpoint.com/v1",
      "apiKey": "encrypted_key_000",
      "selectedModel": null,
      "enabled": true,
      "priority": 1,
      "config": {
        "authType": "bearer",
        "modelsEndpoint": "/models",
        "chatEndpoint": "/chat/completions"
      }
    },
    {
      "id": "openrouter-primary",
      "name": "OpenRouter",
      "type": "openai_compatible",
      "endpoint": "https://openrouter.ai/api/v1",
      "apiKey": "encrypted_key_001",
      "selectedModel": null,
      "enabled": true,
      "priority": 2,
      "config": {
        "authType": "bearer",
        "modelsEndpoint": "/models",
        "chatEndpoint": "/chat/completions",
        "headers": {
          "HTTP-Referer": "https://aide-app.com",
          "X-Title": "AIDE Desktop Editor"
        }
      }
    },
    {
      "id": "groq-fast",
      "name": "Groq Lightning",
      "type": "openai_compatible",
      "endpoint": "https://api.groq.com/openai/v1",
      "apiKey": "encrypted_key_002",
      "selectedModel": null,
      "enabled": true,
      "priority": 3,
      "config": {
        "authType": "bearer",
        "modelsEndpoint": "/models",
        "chatEndpoint": "/chat/completions"
      }
    },
    {
      "id": "together-ai",
      "name": "Together AI",
      "type": "openai_compatible",
      "endpoint": "https://api.together.xyz/v1",
      "apiKey": "encrypted_key_003",
      "selectedModel": null,
      "enabled": true,
      "priority": 4,
      "config": {
        "authType": "bearer",
        "modelsEndpoint": "/models",
        "chatEndpoint": "/chat/completions"
      }
    },
    {
      "id": "anthropic-claude",
      "name": "Anthropic Claude",
      "type": "anthropic",
      "endpoint": "https://api.anthropic.com/v1",
      "apiKey": "encrypted_key_004",
      "selectedModel": null,
      "enabled": true,
      "priority": 5,
      "config": {
        "authType": "x-api-key",
        "modelsEndpoint": null,
        "chatEndpoint": "/messages"
      }
    },
    {
      "id": "google-gemini",
      "name": "Google Gemini",
      "type": "google",
      "endpoint": "https://generativelanguage.googleapis.com/v1",
      "apiKey": "encrypted_key_005",
      "selectedModel": null,
      "enabled": true,
      "priority": 6,
      "config": {
        "authType": "bearer",
        "modelsEndpoint": "/models",
        "chatEndpoint": "/models/{model}:generateContent"
      }
    },
    {
      "id": "mistral-ai",
      "name": "Mistral AI",
      "type": "mistral",
      "endpoint": "https://api.mistral.ai/v1",
      "apiKey": "encrypted_key_006",
      "selectedModel": null,
      "enabled": true,
      "priority": 7,
      "config": {
        "authType": "bearer",
        "modelsEndpoint": "/models",
        "chatEndpoint": "/chat/completions"
      }
    },
    {
      "id": "local-ollama",
      "name": "Local Ollama",
      "type": "local",
      "endpoint": "http://localhost:11434/api",
      "apiKey": "",
      "selectedModel": null,
      "enabled": true,
      "priority": 50,
      "config": {
        "authType": "none",
        "modelsEndpoint": "/tags",
        "chatEndpoint": "/chat"
      }
    },
    {
      "id": "aider-cli",
      "name": "Aider AI",
      "type": "cli_agent",
      "command": "aider",
      "workingDirectory": "workspace",
      "endpoint": "local://aider",
      "apiKey": "",
      "selectedModel": null,
      "enabled": true,
      "priority": 51,
      "config": {
        "authType": "none",
        "environmentVars": {
          "OPENAI_API_KEY": "from_keychain"
        }
      }
    },
    {
      "id": "copilot-cli",
      "name": "GitHub Copilot CLI",
      "type": "cli_agent",
      "command": "gh copilot",
      "endpoint": "local://gh-copilot",
      "apiKey": "",
      "selectedModel": null,
      "enabled": true,
      "priority": 52,
      "config": {
        "authType": "none"
      }
    },
    {
      "id": "openai-fallback",
      "name": "OpenAI (Direct Fallback)",
      "type": "openai",
      "endpoint": "https://api.openai.com/v1",
      "apiKey": "encrypted_key_099",
      "selectedModel": null,
      "enabled": true,
      "priority": 99,
      "config": {
        "authType": "bearer",
        "modelsEndpoint": "/models",
        "chatEndpoint": "/chat/completions"
      }
    }
  ],
  "fallbackOrder": [
    "custom-openai-compatible",
    "openrouter-primary",
    "groq-fast",
    "together-ai",
    "anthropic-claude",
    "google-gemini",
    "mistral-ai",
    "local-ollama",
    "openai-fallback"
  ],
  "rateLimiting": {
    "requestsPerMinute": 60,
    "retryAttempts": 3,
    "timeoutMs": 30000
  }
}
```

## Implementation Notes

### 1. Authentication Storage

- API keys must be encrypted using OS-native keychain
- Never log or display full API keys
- Implement key rotation reminders

### 2. Rate Limiting & Fallbacks

- Implement exponential backoff for rate-limited requests
- Automatic fallback to next priority provider on failure
- Track usage per provider for cost monitoring

### 3. Local Model Support

For local providers (LM Studio, Ollama, etc.):

```json
{
  "id": "local-llama",
  "name": "Local Llama",
  "type": "local",
  "endpoint": "http://localhost:11434/api",
  "apiKey": "",
  "selectedModel": null,
  "enabled": true,
  "priority": 50,
  "config": {
    "authType": "none",
    "modelsEndpoint": "/tags",
    "chatEndpoint": "/chat",
    "localOnly": true,
    "requiresNetwork": false
  }
}
```

### 4. Error Handling

- Provider-specific error code mapping
- User-friendly error messages
- Automatic health checks for enabled providers

## 5. UI/UX Integration Notes

- **Configuration Interface:** The settings and provider selection UI for these configurations are designed in [`UI_UX_SPECIFICATION.md`](./UI_UX_SPECIFICATION.md) (See Sections 4.1 & 5.3).
- **User Flow:** Adding a provider follows the UX flow: **Settings Page → Add Provider Form → Test Connection → Save**, as detailed in the UI/UX spec.
- **Visual Components:** Provider cards display connection status badges, model selectors, and provider type indicators as specified in the UI design system.
- **Icon System:** Each provider uses official logos or fallback icons from the `lucide-react` library as defined in UI_UX_SPECIFICATION.md Section 2.3.

## Quick Setup Commands

### Add a New Provider via CLI (Example)

```bash
# Add OpenAI provider (model will be selected after fetching from API)
aide providers add \
  --name "OpenAI GPT-4" \
  --type openai \
  --endpoint "https://api.openai.com/v1" \
  --priority 99

# Add local Ollama provider
aide providers add \
  --name "Local Ollama" \
  --type local \
  --endpoint "http://localhost:11434" \
  --priority 50 \
  --no-auth

# Note: Model selection happens in the UI after provider is added
```

## CLI Agents Integration

### Supported vs Detected CLI Agents

AIDE includes **13 supported CLI agents** in its configuration system. These agents can be used if installed:

| Status | Description |
|--------|-------------|
| **Supported** | Agent is defined in AIDE's configuration schema and can be used if installed on the system |
| **Detected** | Agent is installed and available on the user's system (verified via `check-cli-availability`) |
| **Active** | Agent is both detected and enabled by the user in settings |

**MVP Scope:** For MVP, CLI agents are **supported** (configuration exists) but auto-detection is optional. Users can manually configure CLI agents if installed.

### Auto-Detection System

```typescript
// lib/cli/detection.ts
export async function detectInstalledCLIAgents(): Promise<CLIAgentInfo[]> {
  const agents = [
    { id: "aider", command: "aider", checkArgs: ["--version"] },
    { id: "gpt-engineer", command: "gpt-engineer", checkArgs: ["--version"] },
    { id: "goose", command: "goose", checkArgs: ["--version"] },
    { id: "gh-copilot", command: "gh", checkArgs: ["copilot", "--version"] },
    { id: "qwen_cli", command: "qwen", checkArgs: ["--version"] },
    // ... other agents
  ];

  const installed = [];
  for (const agent of agents) {
    if (await isCommandAvailable(agent.command, agent.checkArgs)) {
      installed.push(await getAgentInfo(agent));
    }
  }
  return installed;
}

async function isCommandAvailable(
  command: string,
  args: string[],
): Promise<boolean> {
  try {
    const { ipcRenderer } = window.electron;
    await ipcRenderer.invoke('check-cli-availability', { command, args });
    return true;
  } catch {
    return false;
  }
}
```

### Detailed CLI Agent Specifications

#### 1. Aider AI

```json
{
  "id": "aider",
  "name": "Aider AI",
  "type": "cli_agent",
  "command": "aider",
  "description": "AI pair programming in your terminal",
  "capabilities": ["code-editing", "git-integration", "multi-file"],
  "installation": {
    "method": "pip",
    "command": "pip install aider-chat",
    "verify": "aider --version",
    "requirements": ["Python 3.8+", "Git"]
  },
  "usage": {
    "basic": "aider <files>",
    "with_model": "aider --model gpt-4 <files>",
    "auto_commit": "aider --auto-commits <files>"
  },
  "config": {
    "authType": "none",
    "workingDirectory": "workspace",
    "environmentVars": {
      "OPENAI_API_KEY": "required"
    }
  }
}
```

#### 2. GPT Engineer

```json
{
  "id": "gpt-engineer",
  "name": "GPT Engineer",
  "type": "cli_agent",
  "command": "gpt-engineer",
  "description": "Generate entire codebases from prompts",
  "capabilities": ["project-generation", "scaffolding", "architecture"],
  "installation": {
    "method": "pip",
    "command": "pip install gpt-engineer",
    "verify": "gpt-engineer --version",
    "requirements": ["Python 3.9+"]
  },
  "usage": {
    "basic": "gpt-engineer <project_path>",
    "with_model": "gpt-engineer --model gpt-4 <project_path>",
    "improve": "gpt-engineer --improve <project_path>"
  },
  "config": {
    "authType": "none",
    "environmentVars": {
      "OPENAI_API_KEY": "required"
    }
  }
}
```

#### 3. Goose CLI

```json
{
  "id": "goose",
  "name": "Goose CLI",
  "type": "cli_agent",
  "command": "goose",
  "description": "AI-powered development assistant",
  "capabilities": ["task-automation", "code-review", "debugging"],
  "installation": {
    "method": "pip",
    "command": "pip install goose-ai",
    "verify": "goose --version",
    "requirements": ["Python 3.8+"]
  },
  "usage": {
    "basic": "goose session start",
    "with_provider": "goose session start --provider openai",
    "run_task": "goose run \"<task_description>\""
  },
  "config": {
    "authType": "none",
    "environmentVars": {
      "OPENAI_API_KEY": "optional",
      "ANTHROPIC_API_KEY": "optional"
    }
  }
}
```

#### 4. GitHub Copilot CLI

```json
{
  "id": "gh-copilot",
  "name": "GitHub Copilot CLI",
  "type": "cli_agent",
  "command": "gh copilot",
  "description": "GitHub Copilot in your terminal",
  "capabilities": ["command-suggestions", "explanations", "shell-integration"],
  "installation": {
    "method": "gh-extension",
    "command": "gh extension install github/gh-copilot",
    "verify": "gh copilot --version",
    "requirements": ["GitHub CLI", "GitHub Copilot subscription"]
  },
  "usage": {
    "suggest": "gh copilot suggest \"<description>\"",
    "explain": "gh copilot explain \"<command>\"",
    "alias": "gh copilot alias"
  },
  "config": {
    "authType": "none",
    "requiresAuth": "github"
  }
}
```

#### 5. OpenCode CLI

```json
{
  "id": "opencode_cli",
  "name": "OpenCode",
  "type": "cli_agent",
  "command": "opencode",
  "description": "Code generation and editing tool",
  "capabilities": ["code-generation", "refactoring", "documentation"],
  "installation": {
    "method": "npm",
    "command": "npm install -g opencode-cli",
    "verify": "opencode --version",
    "requirements": ["Node.js 20+"]
  },
  "usage": {
    "generate": "opencode generate --prompt \"<description>\"",
    "refactor": "opencode refactor <file>",
    "document": "opencode document <file>"
  },
  "config": {
    "authType": "none"
  }
}
```

#### 6. Blackbox CLI

```json
{
  "id": "blackbox_cli",
  "name": "Blackbox CLI",
  "type": "cli_agent",
  "command": "blackbox",
  "description": "AI code completion and search",
  "capabilities": ["code-search", "completion", "snippet-generation"],
  "installation": {
    "method": "npm",
    "command": "npm install -g blackbox-cli",
    "verify": "blackbox --version",
    "requirements": ["Node.js 20+"]
  },
  "usage": {
    "search": "blackbox search \"<query>\"",
    "complete": "blackbox complete <file>",
    "generate": "blackbox generate --lang <language> \"<prompt>\""
  },
  "config": {
    "authType": "none"
  }
}
```

#### 7. Crush CLI

```json
{
  "id": "crush",
  "name": "Crush CLI",
  "type": "cli_agent",
  "command": "crush",
  "description": "Code analysis and optimization",
  "capabilities": ["performance-analysis", "optimization", "code-quality"],
  "installation": {
    "method": "cargo",
    "command": "cargo install crush-cli",
    "verify": "crush --version",
    "requirements": ["Rust toolchain"]
  },
  "usage": {
    "analyze": "crush analyze <file>",
    "optimize": "crush optimize <file>",
    "benchmark": "crush benchmark <file>"
  },
  "config": {
    "authType": "none"
  }
}
```

#### 8. Codex CLI

```json
{
  "id": "codex",
  "name": "Codex CLI",
  "type": "cli_agent",
  "command": "codex",
  "description": "GitHub Codex integration",
  "capabilities": ["code-completion", "translation", "explanation"],
  "installation": {
    "method": "pip",
    "command": "pip install codex-cli",
    "verify": "codex --version",
    "requirements": ["Python 3.7+"]
  },
  "usage": {
    "complete": "codex complete --file <file>",
    "translate": "codex translate --from <lang1> --to <lang2> <file>",
    "explain": "codex explain <code_snippet>"
  },
  "config": {
    "authType": "none",
    "environmentVars": {
      "OPENAI_API_KEY": "required"
    }
  }
}
```

#### 9. Gemini CLI

```json
{
  "id": "gemini-cli",
  "name": "Gemini CLI",
  "type": "cli_agent",
  "command": "gemini",
  "description": "Google Gemini command line interface",
  "capabilities": ["chat", "code-generation", "analysis"],
  "installation": {
    "method": "pip",
    "command": "pip install gemini-cli",
    "verify": "gemini --version",
    "requirements": ["Python 3.8+"]
  },
  "usage": {
    "chat": "gemini chat \"<message>\"",
    "code": "gemini code --lang <language> \"<prompt>\"",
    "analyze": "gemini analyze <file>"
  },
  "config": {
    "authType": "none",
    "environmentVars": {
      "GOOGLE_API_KEY": "required"
    }
  }
}
```

#### 10. Claude Code

```json
{
  "id": "claude-code",
  "name": "Claude Code",
  "type": "cli_agent",
  "command": "claude-code",
  "description": "Anthropic Claude for coding tasks",
  "capabilities": ["code-review", "refactoring", "documentation"],
  "installation": {
    "method": "npm",
    "command": "npm install -g @anthropic-ai/claude-code",
    "verify": "claude-code --version",
    "requirements": ["Node.js 20+"]
  },
  "usage": {
    "review": "claude-code review <file>",
    "refactor": "claude-code refactor <file>",
    "document": "claude-code document <file>"
  },
  "config": {
    "authType": "none",
    "environmentVars": {
      "ANTHROPIC_API_KEY": "required"
    }
  }
}
```

#### 11. Warp AI

```json
{
  "id": "warp",
  "name": "Warp AI",
  "type": "cli_agent",
  "command": "warp",
  "description": "AI-powered terminal with built-in assistance",
  "capabilities": [
    "command-suggestions",
    "error-explanation",
    "workflow-automation"
  ],
  "installation": {
    "method": "download",
    "command": "Download from https://warp.dev",
    "verify": "Built-in to Warp terminal",
    "requirements": ["Warp terminal"]
  },
  "usage": {
    "ai_command": "# (Ctrl+`) to open AI command search",
    "explain_error": "# AI automatically explains command errors",
    "workflow": "# Use Warp Workflows for automation"
  },
  "config": {
    "authType": "none",
    "builtin": true
  }
}
```

#### 12. Droid

```json
{
  "id": "droid",
  "name": "Droid",
  "type": "cli_agent",
  "command": "droid",
  "description": "Android development AI assistant",
  "capabilities": [
    "android-development",
    "gradle-optimization",
    "kotlin-assistance"
  ],
  "installation": {
    "method": "npm",
    "command": "npm install -g droid-cli",
    "verify": "droid --version",
    "requirements": ["Node.js 20+", "Android SDK"]
  },
  "usage": {
    "analyze": "droid analyze <android_project>",
    "optimize": "droid optimize <gradle_file>",
    "generate": "droid generate --component <type>"
  },
  "config": {
    "authType": "none",
    "environmentVars": {
      "ANDROID_HOME": "required"
    }
  }
}
```

#### 13. Qwen CLI

```json
{
  "id": "qwen_cli",
  "name": "Qwen CLI",
  "type": "cli_agent",
  "command": "qwen",
  "description": "Alibaba Cloud Qwen AI model command-line interface",
  "capabilities": [
    "chat",
    "code-generation",
    "text-analysis",
    "chinese-language"
  ],
  "installation": {
    "method": "pip",
    "command": "pip install qwen-cli",
    "verify": "qwen --version",
    "requirements": ["Python 3.8+"]
  },
  "usage": {
    "chat": "qwen chat \"<prompt>\"",
    "generate": "qwen generate --file <input>",
    "analyze": "qwen analyze <code_file>"
  },
  "config": {
    "authType": "api_key",
    "environmentVars": {
      "QWEN_API_KEY": "optional"
    }
  }
}
```

### CLI Agent Installation Guide

#### Prerequisites Check

```typescript
// Check system requirements before installation
export async function checkPrerequisites(
  agent: CLIAgentSpec,
): Promise<PrereqResult> {
  const results = [];

  for (const req of agent.installation.requirements) {
    const check = await checkRequirement(req);
    results.push({
      requirement: req,
      satisfied: check.satisfied,
      version: check.version,
    });
  }

  return {
    agent: agent.id,
    requirements: results,
    canInstall: results.every((r) => r.satisfied),
  };
}
```

#### Auto-Installation Support

```typescript
// Automatic installation for supported package managers
export async function installCLIAgent(agentId: string): Promise<InstallResult> {
  const agent = CLI_AGENTS[agentId];
  if (!agent) throw new Error(`Unknown agent: ${agentId}`);

  const prereqs = await checkPrerequisites(agent);
  if (!prereqs.canInstall) {
    return { success: false, error: "Prerequisites not met", prereqs };
  }

  try {
    await executeInstallCommand(agent.installation.command);
    const verified = await verifyInstallation(agent.installation.verify);
    return { success: verified, agent: agentId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Testing Provider Connections

```typescript
async function validateProvider(config: AIProviderConfig): Promise<boolean> {
  try {
    // 1. Handle CLI Agents via Electron IPC
    if (config.type === "cli_agent") {
      // Invokes Electron IPC to check if binary exists in PATH
      const { ipcRenderer } = window.electron;
      return await ipcRenderer.invoke('check-cli-availability', {
        command: (config as CLIProviderConfig).command,
      });
    }

    // 2. Handle HTTP Providers via Fetch
    // Use the modelsEndpoint from config (dynamic, not hardcoded)
    const modelsEndpoint = config.config.modelsEndpoint;

    if (!modelsEndpoint) {
      // Provider has no models endpoint - validate by checking API key exists
      return !!config.apiKey;
    }

    const response = await fetch(`${config.endpoint}${modelsEndpoint}`, {
      headers: getAuthHeaders(config),
    });

    return response.ok;
  } catch (error) {
    console.error(`Provider ${config.name} validation failed:`, error);
    return false;
  }
}

// Capability checking functions
export function checkProviderCapability(
  provider: AIProviderConfig,
  capability: keyof ProviderCapabilities
): boolean {
  return provider.capabilities?.[capability] ?? false;
}

export function requiresCapability(
  provider: AIProviderConfig,
  capability: keyof ProviderCapabilities,
  operation: string
): void {
  if (!checkProviderCapability(provider, capability)) {
    throw new Error(
      `Operation "${operation}" requires ${capability} capability, but provider "${provider.name}" does not support it.`
    );
  }
}

// Multi-AI Orchestrator with capability checking
export class AIControlPlane {
  constructor(private currentProvider: AIProviderConfig) {}
  
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    requiresCapability(this.currentProvider, 'chat', 'chat completion');
    // Implementation...
  }
  
  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    requiresCapability(this.currentProvider, 'embeddings', 'embedding generation');
    // Implementation...
  }
  
  supportsChat(): boolean {
    return checkProviderCapability(this.currentProvider, 'chat');
  }
  
  supportsEmbeddings(): boolean {
    return checkProviderCapability(this.currentProvider, 'embeddings');
  }
  
  supportsStreaming(): boolean {
    return checkProviderCapability(this.currentProvider, 'streaming');
  }
  
  getCurrentProvider(): AIProviderConfig {
    return this.currentProvider;
  }
  
  getCurrentModel(): string | null {
    return this.currentProvider.selectedModel;
  }
}
```

## Implementation Strategy: Dynamic Model Discovery

### Primary Method: Live API Fetching

**AIDE prioritizes real-time model discovery over static lists.**

```typescript
// lib/ai/model-discovery.ts
export async function discoverModels(
  provider: AIProviderConfig,
): Promise<ModelInfo[]> {
  // Use modelsEndpoint from provider config (not hardcoded mapping)
  const endpoint = provider.config.modelsEndpoint;

  if (!endpoint) {
    // Provider has no models endpoint - use fallback
    return getFallbackModels(provider.type);
  }

  try {
    const models = await fetchModelsFromAPI(provider, endpoint);
    if (models.length === 0) {
  throw new Error("Models endpoint returned empty list");
}
return models;
  } catch {
    return getFallbackModels(provider.type);
  }
}

// Fallback models for providers without /models endpoint
function getFallbackModels(providerType: string): ModelInfo[] {
  const fallbacks: Record<string, string[]> = {
    anthropic: [
      "claude-3-5-sonnet",
      "claude-3-opus",
      "claude-3-sonnet",
      "claude-3-haiku",
    ],
    bedrock: [
      "anthropic.claude-3-5-sonnet-20240229-v1:0",
      "anthropic.claude-3-opus-20240229-v1:0",
      "amazon.titan-text-express-v1",
    ],
    ai21: ["j2-ultra", "j2-mid", "j2-light"],
    writer: ["palmyra-x", "palmyra-base"],
    reka: ["reka-core", "reka-flash"],
    inflection: ["inflection-2.5"],
    blackbox: ["blackbox-code", "blackbox-chat"],
    opencode: ["opencode-instruct", "opencode-base"],
  };

  return (fallbacks[providerType] || []).map((id) => ({ id, name: id }));
}

interface ModelInfo {
  id: string;
  name: string;
  contextWindow?: number;
  maxTokens?: number;
  pricing?: { input: number; output: number };
}
```

### User Experience:

1. **Provider Selection** → AIDE immediately fetches live models
2. **Model Dropdown** → Shows current available models (not static list)
3. **Auto-Refresh** → Models update when provider releases new ones
4. **Fallback Grace** → Uses static list only if API unreachable

### Why This Approach?

- **Future-Proof**: Supports new models (GPT-5, Claude-4) instantly
- **Accurate**: Shows only currently available models
- **No App Updates**: New models work without AIDE updates

---

**Supported Providers**: 44 AI connections total
- 29 Cloud HTTP Providers
- 2 Local HTTP Providers (Ollama, LM Studio)
- 13 CLI Agents
