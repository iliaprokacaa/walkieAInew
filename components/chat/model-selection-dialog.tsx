"use client"

import { Bot, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSettingsStore, type AnthropicModel, type Provider } from "@/store/settings-store"
import { Badge } from "@/components/ui/badge"
import React from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { OpenAI, Gemini, Claude, DeepSeek, Grok } from '@lobehub/icons'
import { Eye, Sparkles } from 'lucide-react'
import { TooltipProvider } from "@/components/ui/tooltip"
import { Portal } from "@radix-ui/react-tooltip"
import { ImageGenerationIcon } from "../ui/icons/image-generation-icon"

interface ModelSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ProviderIcons = {
  openai: <OpenAI size={20} />,
  anthropic: <Claude.Color size={20} />,
  google: <Gemini.Color size={20} />,
  grok: <Grok size={20} />,
  deepseek: <DeepSeek.Color size={20} />
}

// Feature icons component without tooltips
const FeatureIcon = ({ feature }: { feature: string }) => {
  if (feature === 'vision') {
    return <Eye className="w-4 h-4 text-blue-400" />
  } else if (feature === 'deep_thinking') {
    return <Sparkles className="w-4 h-4 text-purple-400" />
  } else if (feature === 'image_generation') {
    return (
      <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none">
        <path d="M21 16V8.00002C21 6.34317 19.6569 5.00002 18 5.00002H6C4.34315 5.00002 3 6.34317 3 8.00002V16C3 17.6569 4.34315 19 6 19H18C19.6569 19 21 17.6569 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 16L7 12C7.928 11.105 9.07199 11.105 10 12L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 14L15 13C15.928 12.105 17.072 12.105 18 13L21 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 10C8.55228 10 9 9.55228 9 9C9 8.44772 8.55228 8 8 8C7.44772 8 7 8.44772 7 9C7 9.55228 7.44772 10 8 10Z" fill="currentColor"/>
      </svg>
    )
  }
  return null
}

interface ModelConfig {
  apiId: string
  displayName: string
  tokens: string
  features: string[]
}

const getModelsAnthropic = (): ModelConfig[] => [
  {
    apiId: "claude-3-5-sonnet-latest",
    displayName: "Claude 3.5 Sonnet",
    tokens: "200K",
    features: ["vision"]
  },
  {
    apiId: "claude-3-7-sonnet-latest",
    displayName: "Claude 3.7 Sonnet",
    tokens: "200K",
    features: ["vision"]
  },
  {
    apiId: "claude-3-5-haiku-latest",
    displayName: "Claude 3.5 Haiku",
    tokens: "200K",
    features: ["vision"]
  },
  {
    apiId: "claude-3-opus-latest",
    displayName: "Claude 3 Opus",
    tokens: "200K",
    features: ["vision"]
  }
]

const getModelsOpenAI = (): ModelConfig[] => [
  {
    apiId: "gpt-4o-mini",
    displayName: "GPT 4o Mini",
    tokens: "128K",
    features: ["vision"]
  },
  {
    apiId: "gpt-4o",
    displayName: "GPT 4o",
    tokens: "128K",
    features: ["vision"]
  },
  {
    apiId: "gpt-4",
    displayName: "GPT 4",
    tokens: "128K",
    features: []
  },
  {
    apiId: "o1",
    displayName: "OpenAI o1-mini",
    tokens: "128K",
    features: ["vision", "deep_thinking"]
  }
]

const getModelsGoogle = (): ModelConfig[] => [

  {
    apiId: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
    tokens: "1M",
    features: ["vision"]
  },
  {
    apiId: "gemini-1.5-flash",
    displayName: "Gemini 1.5 Pro",
    tokens: "2M",
    features: ["vision"]
  },
  {
    apiId: "gemini-2.0-flash-thinking-exp",
    displayName: "Gemini 2.0 Flash Thinking Experimental",
    tokens: "32K",
    features: ["deep_thinking"]
  }
]

const getModelsGrok = (): ModelConfig[] => [
  {
    apiId: "grok-2-latest",
    displayName: "Grok 2",
    tokens: "128K",
    features: []
  }
]

const getModelsDeepseek = (): ModelConfig[] => [
  {
    apiId: "deepseek-chat",
    displayName: "DeepSeek-V3",
    tokens: "64K",
    features: ["vision"]
  },
  {
    apiId: "deepseek-reasoner",
    displayName: "DeepSeek-R1",
    tokens: "64K",
    features: ["deep_thinking"]
  }
]

const getModelsByProvider = (provider: string): ModelConfig[] => {
  switch (provider) {
    case "anthropic":
      return getModelsAnthropic()
    case "openai":
      return getModelsOpenAI()
    case "google":
      return getModelsGoogle()
    case "grok":
      return getModelsGrok()
    case "deepseek":
      return getModelsDeepseek()
    default:
      return []
  }
}

// Helper function to check if model has deep thinking capability
const hasDeepThinking = (model: string) => {
  return model.includes("deepseek-reasoner") || model.includes("gemini-2.0-flash-thinking-exp") || model.includes("o1");
}

// Update TokenDisplay component to be simpler without the SVG
const TokenDisplay = ({ amount }: { amount: string }) => (
  <div className="px-2 py-0.5 rounded-[4px] bg-cyan-800/60">
    <span className="text-xs text-cyan-100">{amount}</span>
  </div>
)

export function ModelSelectionDialog({ open, onOpenChange }: ModelSelectionDialogProps) {
  const {
    provider,
    model,
    setProvider,
    setModel
  } = useSettingsStore()

  const handleProviderChange = (value: string) => {
    setProvider(value as Provider)
    setModel("") // Reset model when provider changes
  }

  const handleModelChange = (value: string) => {
    setModel(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[330px] sm:w-[400px] p-0 rounded-lg bg-gradient-to-b from-background to-background/80 border-cyan-500/20">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
            Select AI Model
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="bg-cyan-950/40 p-4 rounded-lg flex flex-col gap-3 border border-cyan-800/30">
            <div className="flex items-center gap-3">
              <div className="px-2 py-0.5 rounded-[4px] bg-cyan-800/60">
                <span className="text-sm text-cyan-100">1K</span>
              </div>
              <span className="text-sm text-cyan-100">= Max context length</span>
            </div>
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-100">
                <svg className="h-5 w-5 text-cyan-500" viewBox="0 0 24 24" fill="none">
                  <path d="M21 8C21 6.34315 17.866 5 14 5C10.134 5 7 6.34315 7 8M21 8V12C21 13.0195 19.8135 13.9202 18 14.4623C16.8662 14.8012 15.4872 15 14 15C12.5128 15 11.1338 14.8012 10 14.4623C8.18652 13.9202 7 13.0195 7 12V8M21 8C21 9.01946 19.8135 9.92016 18 10.4623C16.8662 10.8012 15.4872 11 14 11C12.5128 11 11.1338 10.8012 10 10.4623C8.18652 9.92016 7 9.01946 7 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                  <path d="M3 12.0001V16.0001C3 17.0196 4.18652 17.9203 6 18.4624C7.13383 18.8013 8.51275 19.0001 10 19.0001C11.4872 19.0001 12.8662 18.8013 14 18.4624C15.8135 17.9203 17 17.0196 17 16.0001V15.0001M3 12.0001C3 10.8034 4.63505 9.7703 7 9.28882M3 12.0001C3 13.0196 4.18652 13.9203 6 14.4624C7.13383 14.8013 8.51275 15.0001 10 15.0001C10.695 15.0001 11.3663 14.9567 12 14.8759" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                </svg>
                <span>1 Credit = 1 Message</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-100">
                <Eye className="w-5 h-5 text-blue-400" />
                <span>Can read and analyze images</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-100">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Supports deep thinking</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-100">
                <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none">
                  <path d="M21 16V8.00002C21 6.34317 19.6569 5.00002 18 5.00002H6C4.34315 5.00002 3 6.34317 3 8.00002V16C3 17.6569 4.34315 19 6 19H18C19.6569 19 21 17.6569 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 16L7 12C7.928 11.105 9.07199 11.105 10 12L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 14L15 13C15.928 12.105 17.072 12.105 18 13L21 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 10C8.55228 10 9 9.55228 9 9C9 8.44772 8.55228 8 8 8C7.44772 8 7 8.44772 7 9C7 9.55228 7.44772 10 8 10Z" fill="currentColor"/>
                </svg>
                <span>Supports image generation</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground">Provider</label>
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger className="w-full bg-background h-8 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Select Provider">
                  {provider === 'none' ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Select Provider</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {ProviderIcons[provider as keyof typeof ProviderIcons]}
                      <span>
                        {provider === 'openai' ? 'OpenAI' :
                         provider === 'deepseek' ? 'DeepSeek' :
                         provider === 'google' ? 'Google' :
                         provider === 'anthropic' ? 'Anthropic' :
                         provider === 'grok' ? 'Grok' :
                         'Select Provider'}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[40vh]">
                <SelectItem value="none">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Select Provider</span>
                  </div>
                </SelectItem>
                {Object.entries(ProviderIcons).map(([id, icon]) => (
                  <SelectItem key={id} value={id}>
                    <div className="flex items-center gap-2">
                      {icon}
                      <span>
                        {id === 'openai' ? 'OpenAI' :
                         id === 'deepseek' ? 'DeepSeek' :
                         id === 'google' ? 'Google' :
                         id === 'anthropic' ? 'Anthropic' :
                         'Grok'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {provider !== 'none' && (
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Model</label>
              <Select value={model} onValueChange={handleModelChange}>
                <SelectTrigger className="w-full bg-background h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent className="max-h-[40vh]">
                  {getModelsByProvider(provider).map((modelConfig) => (
                    <SelectItem key={modelConfig.apiId} value={modelConfig.apiId}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {provider === 'openai' ? <OpenAI.Avatar size={16} className="sm:w-5 sm:h-5" /> :
                           provider === 'anthropic' ? <Claude.Avatar size={16} className="sm:w-5 sm:h-5" /> :
                           provider === 'google' ? <Gemini.Avatar size={16} className="sm:w-5 sm:h-5" /> :
                           provider === 'grok' ? <Grok.Avatar size={16} className="sm:w-5 sm:h-5" /> :
                           provider === 'deepseek' ? <DeepSeek.Avatar size={16} className="sm:w-5 sm:h-5" /> : null}
                          <span className="truncate text-xs sm:text-sm">{modelConfig.displayName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <TokenDisplay amount={modelConfig.tokens} />
                          <div className="flex gap-1.5">
                            {modelConfig.features.map((feature, i) => (
                              <FeatureIcon key={i} feature={feature} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 