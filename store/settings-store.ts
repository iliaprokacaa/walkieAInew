import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Provider = 'openai' | 'google' | 'grok' | 'deepseek' | 'anthropic' | 'none'

// Model types for each provider
export type OpenAIModel = 'gpt-4' | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4o1'
export type GoogleModel = 'gemini-2.0-flash' | 'gemini-1.5-flash' | 'gemini-2.0-pro-exp-02-05'
export type GrokModel = 'grok-2-latest'
export type DeepseekModel = 'deepseek-chat'
export type AnthropicModel = 'claude-3-5-sonnet-20240620' | 'claude-3-7-sonnet-20250219' | 'claude-3-5-haiku-20240307' | 'claude-3-opus-20240229'

export type Model = OpenAIModel | GoogleModel | GrokModel | DeepseekModel | AnthropicModel

interface SettingsState {
  provider: Provider
  model: string
  setProvider: (provider: Provider) => void
  setModel: (model: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      provider: "none",
      model: "",
      setProvider: (provider) => set({ provider }),
      setModel: (model) => set({ model }),
    }),
    {
      name: 'settings',
    }
  )
)

export const modelOptions: Record<Provider, string[]> = {
  openai: ['gpt-4', 'gpt-4o', 'gpt-4o-mini', 'o1'],
  google: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-pro-exp-02-05'],
  grok: ['grok-2-latest'],
  deepseek: ['deepseek-chat'],
  anthropic: ['claude-3-5-sonnet-20240620', 'claude-3-7-sonnet-20250219', 'claude-3-5-haiku-20240307', 'claude-3-opus-20240229'],
  'none': []
}

