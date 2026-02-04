import { createAzure } from '@ai-sdk/azure'
import { createAnthropic } from '@ai-sdk/anthropic'

// AI Provider Configuration
// Supports Azure OpenAI, Azure AI Services (with Anthropic), and Anthropic directly

export type AIProvider = 'azure' | 'anthropic' | 'azure-anthropic'

// Azure OpenAI Configuration (standard Azure OpenAI)
const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME || '',
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
})

// Anthropic Claude Configuration (direct Anthropic API)
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Azure AI Services with Anthropic models
const azureAnthropic = createAnthropic({
  baseURL: process.env.AZURE_AI_ENDPOINT || '',
  apiKey: process.env.AZURE_AI_API_KEY || '',
  headers: {
    'api-key': process.env.AZURE_AI_API_KEY || '',
  },
})

// Model configurations
export const models = {
  azure: {
    // Azure OpenAI deployment names (you configure these in Azure portal)
    gpt4: azure(process.env.AZURE_OPENAI_DEPLOYMENT_GPT4 || 'gpt-4'),
    gpt4Turbo: azure(process.env.AZURE_OPENAI_DEPLOYMENT_GPT4_TURBO || 'gpt-4-turbo'),
    gpt35Turbo: azure(process.env.AZURE_OPENAI_DEPLOYMENT_GPT35 || 'gpt-35-turbo'),
  },
  anthropic: {
    claude4Opus: anthropic('claude-sonnet-4-20250514'),
    claude35Sonnet: anthropic('claude-3-5-sonnet-20241022'),
    claude3Haiku: anthropic('claude-3-haiku-20240307'),
  },
  azureAnthropic: {
    // Azure AI Services with Anthropic - uses deployment name from env
    claudeOpus: azureAnthropic(process.env.AZURE_AI_DEPLOYMENT_NAME || 'claude-opus-4-5'),
  },
}

// Default model selection based on environment
export function getDefaultModel() {
  const provider = (process.env.AI_PROVIDER as AIProvider) || 'azure-anthropic'
  
  if (provider === 'azure') {
    return models.azure.gpt4
  }
  
  if (provider === 'azure-anthropic') {
    return models.azureAnthropic.claudeOpus
  }
  
  return models.anthropic.claude35Sonnet
}

// Get model by provider and name
export function getModel(provider: AIProvider, modelName?: string) {
  if (provider === 'azure') {
    switch (modelName) {
      case 'gpt-4':
        return models.azure.gpt4
      case 'gpt-4-turbo':
        return models.azure.gpt4Turbo
      case 'gpt-35-turbo':
        return models.azure.gpt35Turbo
      default:
        return models.azure.gpt4
    }
  }
  
  if (provider === 'azure-anthropic') {
    return models.azureAnthropic.claudeOpus
  }
  
  // Anthropic
  switch (modelName) {
    case 'claude-4-opus':
      return models.anthropic.claude4Opus
    case 'claude-3-5-sonnet':
      return models.anthropic.claude35Sonnet
    case 'claude-3-haiku':
      return models.anthropic.claude3Haiku
    default:
      return models.anthropic.claude35Sonnet
  }
}

// Check if AI is configured
export function isAIConfigured(): boolean {
  const provider = (process.env.AI_PROVIDER as AIProvider) || 'azure-anthropic'
  
  if (provider === 'azure') {
    return !!(
      process.env.AZURE_OPENAI_RESOURCE_NAME &&
      process.env.AZURE_OPENAI_API_KEY
    )
  }
  
  if (provider === 'azure-anthropic') {
    return !!(
      process.env.AZURE_AI_ENDPOINT &&
      process.env.AZURE_AI_API_KEY
    )
  }
  
  return !!process.env.ANTHROPIC_API_KEY
}
