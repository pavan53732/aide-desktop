/**
 * Provider Icon Mapping System
 * Maps provider types to their visual icons as specified in PROVIDERS.md
 */

export function getProviderIcon(type: string): string {
  const iconMap: Record<string, string> = {
    // OpenAI-compatible providers
    'openai_compatible': '▣',
    'openai': '▣',
    'openrouter': '▣',
    'groq': '▣',
    
    // Native providers
    'anthropic': '🧠',
    'google': '◇',
    'mistral': '◆',
    'cohere': '⬡',
    
    // Local providers
    'local': '⚛️',
    
    // CLI agents
    'cli_agent': '🛠️',
    
    // Cloud providers
    'bedrock': '☁️',
    'vertex': '◇',
    'replicate': '🔄',
    'huggingface': '🤗',
    'ai21': '🔷',
    'writer': '✍️',
    'reka': '🎯',
    'inflection': '💫',
    'blackbox': '⬛',
    'opencode': '</>',
  };

  return iconMap[type] || '▣';
}

export function getCLIAgentIcon(command: string): string {
  const cliIcons: Record<string, string> = {
    'aider': '🛠️',
    'gh': '💼',
    'gpt-engineer': '🏗️',
    'goose': '🪿',
    'opencode': '</>',
    'blackbox': '⬛',
    'claude-code': '🧠',
    'gemini': '◇',
    'crush': '⚡',
    'codex': '📝',
    'warp': '🌊',
    'droid': '🤖',
  };

  return cliIcons[command] || '🛠️';
}

export function getProviderTypeLabel(type: string): string {
  if (type === 'cli_agent') return 'CLI Agent';
  if (type === 'local') return 'Local';
  return 'Cloud';
}

export function getProviderTypeBadgeVariant(type: string): 'default' | 'secondary' | 'outline' {
  if (type === 'cli_agent') return 'secondary';
  if (type === 'local') return 'outline';
  return 'default';
}
