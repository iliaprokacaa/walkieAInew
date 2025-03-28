"use client"

import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { useEffect, useState } from "react"
import { Menu, X, Eye, Sparkles } from "lucide-react"
import { PricingSectionDemo } from "@/components/blocks/pricing-section"
import { Footerdemo } from "@/components/ui/footer-section"
import { Typewriter } from "@/components/ui/typewriter"
import { OpenAI, Claude, DeepSeek, Grok } from '@lobehub/icons'
import React from "react"
import dynamic from 'next/dynamic'
import { useRouter } from "next/navigation"

// Custom Gemini icon with dynamic ID to prevent conflicts
const GeminiIcon = ({ size, id }: { size: number, id: string }) => {
  const containerSize = size === 48 ? "w-12 h-12" : "w-8 h-8";
  return (
    <div className={`${containerSize} flex items-center justify-center`}>
      <svg width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <path d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z" fill={`url(#gemini_${id})`}/>
        <defs>
          <radialGradient id={`gemini_${id}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)">
            <stop offset=".067" stopColor="#9168C0"/>
            <stop offset=".343" stopColor="#5684D1"/>
            <stop offset=".672" stopColor="#1BA1E3"/>
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

// Navigation items
const navItems = [
  { id: "providers", label: "Providers" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "faq", label: "FAQ" },
]

// AI Provider data
const aiProviders = [
  {
    name: "OpenAI",
    icon: <OpenAI size={48} />,
    tooltipIcon: <OpenAI size={32} />,
    models: [
      { name: "GPT-4o mini", tokens: "128K", features: ["vision"] },
      { name: "GPT-4o", tokens: "128K", features: ["vision"] },
      { name: "GPT-4", tokens: "128K", features: [] },
      { name: "o1-mini", tokens: "128K", features: ["vision", "deep_thinking"] }
    ]
  },
  {
    name: "Anthropic",
    icon: <Claude.Color size={48} />,
    tooltipIcon: <Claude.Color size={32} />,
    models: [
      { name: "Claude 3.7 Sonnet", tokens: "200K", features: ["vision"] },
      { name: "Claude 3.5 Sonnet", tokens: "200K", features: ["vision"] },
      { name: "Claude 3.5 Haiku", tokens: "200K", features: ["vision"] },
      { name: "Claude 3 Opus", tokens: "200K", features: ["vision"] }
    ]
  },
  {
    name: "Google",
    icon: <GeminiIcon size={48} id="main" />,
    tooltipIcon: <GeminiIcon size={32} id="tooltip" />,
    models: [
      { name: "Gemini 2.0 Flash", tokens: "1M", features: ["vision"] },
      { name: "Gemini 1.5 Pro", tokens: "2M", features: ["vision"] }
    ]
  },
  {
    name: "DeepSeek",
    icon: <DeepSeek.Color size={48} />,
    tooltipIcon: <DeepSeek.Color size={32} />,
    models: [
      { name: "DeepSeek V3", tokens: "64K", features: ["vision"] },
      { name: "DeepSeek R1", tokens: "64K", features: ["deep_thinking"] }
    ]
  },
  {
    name: "Grok",
    icon: <Grok size={48} />,
    tooltipIcon: <Grok size={32} />,
    models: [
      { name: "Grok 2", tokens: "128K", features: [] }
    ]
  }
];

// Feature icons component without tooltips
const FeatureIcon = ({ feature }: { feature: string }) => {
  return (
    <div className="relative">
            {feature === 'vision' && (
        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            )}
            {feature === 'deep_thinking' && (
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            )}
            {feature === 'image_generation' && (
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16V8.00002C21 6.34317 19.6569 5.00002 18 5.00002H6C4.34315 5.00002 3 6.34317 3 8.00002V16C3 17.6569 4.34315 19 6 19H18C19.6569 19 21 17.6569 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 16L7 12C7.928 11.105 9.07199 11.105 10 12L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 14L15 13C15.928 12.105 17.072 12.105 18 13L21 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 10C8.55228 10 9 9.55228 9 9C9 8.44772 8.55228 8 8 8C7.44772 8 7 8.44772 7 9C7 9.55228 7.44772 10 8 10Z" fill="currentColor"/>
              </svg>
            )}
          </div>
  );
};

// Simplified token display without any tooltip
const TokenDisplay = ({ amount }: { amount: string }) => (
  <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-[9px] bg-blue-500/20 dark:bg-cyan-800/60 hover:bg-blue-500/30 dark:hover:bg-cyan-700/70 transition-colors">
    <span className="text-xs font-medium text-blue-700 dark:text-cyan-100">{amount}</span>
  </div>
);

// Remove hover-tooltips from context length display
const HoverTokenDisplay = ({ amount }: { amount: string }) => (
  <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-[9px] bg-blue-500/20 dark:bg-cyan-800/60 hover:bg-blue-500/30 dark:hover:bg-cyan-700/70 transition-colors">
    <span className="text-xs font-medium text-blue-700 dark:text-cyan-100">{amount}</span>
          </div>
  );

// Create a client-only component for the providers wheel
const ProvidersWheel = dynamic(() => Promise.resolve(function ProvidersWheel() {
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const handleProviderHover = (providerName: string) => {
      setActiveProvider(providerName);
  };

  const handleProviderLeave = () => {
    setActiveProvider(null);
  };

  const activeProviderData = aiProviders.find(p => p.name === activeProvider);

  return (
    <div className="relative mx-auto">
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 lg:gap-12">
        {aiProviders.map((provider) => (
          <div 
            key={provider.name}
            className="relative group"
            onMouseEnter={() => handleProviderHover(provider.name)}
            onMouseLeave={handleProviderLeave}
          >
            {/* Mobile tooltip */}
            {activeProvider === provider.name && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 max-w-[220px] w-auto z-10 md:hidden">
                <div className="py-1.5 px-2 bg-[#020817] border border-cyan-800/30 rounded-xl shadow-xl overflow-hidden max-h-none mx-auto text-center transition-all duration-200">
                  <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="flex-shrink-0">
                        {provider.name === "Google" ? (
                        <GeminiIcon size={24} id={`mobile_${provider.name}`} />
                        ) : (
                          React.cloneElement(provider.tooltipIcon as React.ReactElement, { size: 24 })
                        )}
                      </div>
                    <h3 className="text-sm font-semibold text-cyan-100 [text-shadow:_0_1px_0_rgb(0_0_0_/_100%)]">
                        {provider.name}
                      </h3>
                    </div>
                  <div className="space-y-2 flex flex-col items-center">
                      {provider.models.map((model, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="text-xs text-cyan-200/90 font-medium whitespace-nowrap mb-0.5 text-center">
                            {model.name}
                          </div>
                        <div className="flex justify-center items-center gap-2">
                          <div className="mb-1">
                            <TokenDisplay amount={model.tokens} />
                          </div>
                            {model.features.length > 0 && (
                            <div className="flex gap-1.5">
                                {model.features.map((feature: string, j: number) => (
                                  <FeatureIcon key={j} feature={feature} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
                <div className="w-3 h-3 bg-[#020817] border-r border-b border-cyan-800/30 absolute left-1/2 -bottom-1.5 -ml-1.5 transform rotate-45 md:hidden"></div>
              </div>
            )}
            
            {/* Desktop tooltip */}
            {activeProvider === provider.name && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 hidden md:block">
                <div className="py-3 px-2 bg-[#020817] border border-cyan-800/30 rounded-xl shadow-xl overflow-hidden w-[210px] mx-auto text-center transition-all duration-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="flex-shrink-0">
                        {provider.name === "Google" ? (
                        <GeminiIcon size={32} id={`desktop_${provider.name}`} />
                        ) : (
                          React.cloneElement(provider.tooltipIcon as React.ReactElement, { size: 32 })
                        )}
                      </div>
                    <h3 className="text-base font-semibold text-cyan-100">
                        {provider.name}
                      </h3>
                    </div>
                  <div className="divide-y divide-cyan-900/20 w-full">
                      {provider.models.map((model, i) => (
                      <div key={i} className="flex flex-col items-center py-1 first:pt-0 last:pb-0">
                        <div className="text-xs text-cyan-200/90 font-medium whitespace-nowrap text-center">
                            {model.name}
                          </div>
                        <div className="mb-[2px]">
                          <HoverTokenDisplay amount={model.tokens} />
                        </div>
                        <div className="flex gap-1 justify-center">
                                {model.features.map((feature: string, j: number) => (
                                  <FeatureIcon key={j} feature={feature} />
                                ))}
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
                <div className="w-4 h-4 bg-[#020817] border-r border-b border-cyan-800/30 absolute left-1/2 -bottom-2 -ml-2 transform rotate-45"></div>
              </div>
            )}
            
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-white/10 flex items-center justify-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                {provider.icon}
              </div>
            </div>
            <div className="text-center mt-2 text-xs sm:text-sm text-cyan-300/90">
              {provider.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}), { ssr: false });

const ArrowIcon = () => (
  <svg 
    className="w-5 h-5 ml-2" 
    viewBox="0 0 330 330" 
    fill="currentColor"
  >
    <path d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001 c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213 C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606 C255,161.018,253.42,157.202,250.606,154.389z" />
  </svg>
)

interface FAQItem {
  question: string;
  answer: string;
}

export default function Home() {
  const { user, isLoading } = useAuth()
  const [activeSection, setActiveSection] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  
  const titles = [
    "Top AI Models",
    "All Models in One Place",
    "The most intelligent AI Models"
  ]

  const faqItems: FAQItem[] = [
    {
      question: "What AI models are available?",
      answer: "We offer access to various AI models from leading providers like Google (Gemini 2.0 Flash, Gemini 1.5 Pro), and more. Each subscription tier provides access to different model sets, with higher tiers offering more advanced models."
    },
    {
      question: "What types of documents can I process?",
      answer: "You can upload and analyze a wide range of document formats including PDF, Word (DOCX), TXT, and more. Our AI models can summarize content, extract key information, and answer questions about your documents with advanced understanding."
    },
    {
      question: "How does image scanning work?",
      answer: "Simply upload an image, and our AI will analyze its content. It can identify objects, read text, describe scenes, and answer questions about what's in the image. This is perfect for extracting information from screenshots, diagrams, photos, and more."
    },
    {
      question: "Can I switch between different AI models?",
      answer: "Yes! You can freely switch between available AI models in your subscription tier. Plus and Ultimate users get access to more advanced models and early access to new releases."
    },
    {
      question: "What kind of support do you offer?",
      answer: "Free users get community support, Starter users get email support, and Plus/Ultimate users get priority support with faster response times. Ultimate users enjoy 24/7 priority support for immediate assistance."
    }
  ]

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => {
        const element = document.getElementById(item.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          return {
            id: item.id,
            distance: Math.abs(rect.top)
          }
        }
        return { id: item.id, distance: Infinity }
      })

      const closest = sections.reduce((prev, curr) => 
        curr.distance < prev.distance ? curr : prev
      )

      setActiveSection(closest.id)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-b from-[#011118] via-[#061b2c] to-black overflow-x-hidden">
      {/* Navigation */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[98%] sm:w-full max-w-3xl px-2 sm:px-4">
        <nav className="mx-auto rounded-full bg-black/50 border border-white/10">
          <div className="px-3 sm:px-5 md:px-8">
            <div className="flex items-center justify-between h-11 md:h-14">
              <div className="text-base md:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 pl-1">
                Walkie AI
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`text-[15px] font-medium transition-colors ${
                      activeSection === item.id
                        ? "text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center gap-2">
                {!isLoading && (
                  <>
                    {!user ? (
                      <div className="flex items-center gap-2">
                        <Link href="/login">
                          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white transition-colors text-xs md:text-[15px] font-medium h-8 md:h-9">
                            Log in
                          </Button>
                        </Link>
                        {!isLoading && (
                          <Link href="/register">
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 md:px-6 h-8 md:h-9 rounded-full text-xs md:text-[15px] transition-all duration-200">
                              Get Started
                            </Button>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <Button
                          onClick={() => router.push('/chat')}
                          className="px-6 py-3 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
                        >
                          Start for Free
                        </Button>
                      </div>
                    )}
                  </>
                )}
                
                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden ml-1 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5 text-gray-300" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-300" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu with CSS transition instead of AnimatePresence */}
          {isMobileMenuOpen && (
          <div className="absolute top-12 sm:top-14 right-2 sm:right-4 w-44 sm:w-48 rounded-xl bg-black/95 border border-white/10 shadow-lg overflow-hidden md:hidden transition-all duration-200 opacity-100 translate-y-0">
              <div className="py-0">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                    scrollToSection(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors ${
                    activeSection === item.id ? 'text-cyan-400' : 'text-cyan-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
          </div>
          )}
      </div>

      {/* Hero Section */}
      <div className="min-h-[70vh] relative w-full flex flex-col items-center justify-center overflow-hidden pt-16">
        <div className="text-center max-w-3xl mx-auto px-4">
          <div className="flex gap-6 py-12 lg:py-20 items-center justify-center flex-col">
            <div className="flex gap-4 flex-col">
              <div className="w-full h-full md:text-4xl lg:text-5xl sm:text-3xl text-2xl flex flex-row items-start justify-start font-normal">
                <style jsx global>{`
                  @keyframes smoothBounce {
                    0%, 100% {
                      transform: translateY(0);
                    }
                    50% {
                      transform: translateY(-10px);
                    }
                  }
                  .smooth-bounce {
                    animation: smoothBounce 2s ease-in-out infinite;
                  }
                  
                  @keyframes tilt {
                    0%, 50%, 100% {
                      transform: rotate(0deg);
                    }
                    25% {
                      transform: rotate(0.5deg);
                    }
                    75% {
                      transform: rotate(-0.5deg);
                    }
                  }
                  .animate-tilt {
                    animation: tilt 10s infinite linear;
                  }
                `}</style>
                <p className="whitespace-pre-wrap text-center w-full">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-cyan-500 to-blue-600 block mb-4">Walkie AI Offers</span>
                  <span className="inline-block">
                    <Typewriter
                      text={[
                        "All AI models in one place",
                        "Most intelligent assistants",
                        "Everything you need"
                      ]}
                      speed={70}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
                      waitTime={1500}
                      deleteSpeed={40}
                      cursorChar={"|"}
                    />
                </span>
                </p>
              </div>

              <p className="text-lg md:text-xl leading-relaxed tracking-tight text-cyan-300/80 max-w-2xl text-center mx-auto">
                Use your favorite AI models all in one place, for a cheaper and fixed price.
              </p>
              
              <div className="flex flex-col gap-4 items-center justify-center mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 smooth-bounce">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
                      <path d="M13 3H8.2C7.0799 3 6.51984 3 6.09202 3.21799C5.71569 3.40973 5.40973 3.71569 5.21799 4.09202C5 4.51984 5 5.0799 5 6.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.0799 21 8.2 21H12M13 3L19 9M13 3V7.4C13 7.96005 13 8.24008 13.109 8.45399C13.2049 8.64215 13.3578 8.79513 13.546 8.89101C13.7599 9 14.0399 9 14.6 9H19M19 9V11M9 17H11M9 13H13M9 9H10M19.2686 19.2686L21 21M20 17.5C20 18.8807 18.8807 20 17.5 20C16.1193 20 15 18.8807 15 17.5C15 16.1193 16.1193 15 17.5 15C18.8807 15 20 16.1193 20 17.5Z" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-base md:text-lg text-cyan-200/90">Upload & Summarize 10+ Document types!</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 md:w-8 md:h-8 smooth-bounce">
                    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400" stroke="currentColor" fill="none" strokeWidth="2">
                      <circle cx="34.52" cy="11.43" r="5.82"></circle>
                      <circle cx="53.63" cy="31.6" r="5.82"></circle>
                      <circle cx="34.52" cy="50.57" r="5.82"></circle>
                      <circle cx="15.16" cy="42.03" r="5.82"></circle>
                      <circle cx="15.16" cy="19.27" r="5.82"></circle>
                      <circle cx="34.51" cy="29.27" r="4.7"></circle>
                      <line x1="20.17" y1="16.3" x2="28.9" y2="12.93"></line>
                      <line x1="38.6" y1="15.59" x2="49.48" y2="27.52"></line>
                      <line x1="50.07" y1="36.2" x2="38.67" y2="46.49"></line>
                      <line x1="18.36" y1="24.13" x2="30.91" y2="46.01"></line>
                      <line x1="20.31" y1="44.74" x2="28.7" y2="48.63"></line>
                      <line x1="17.34" y1="36.63" x2="31.37" y2="16.32"></line>
                      <line x1="20.52" y1="21.55" x2="30.34" y2="27.1"></line>
                      <line x1="39.22" y1="29.8" x2="47.81" y2="30.45"></line>
                      <line x1="34.51" y1="33.98" x2="34.52" y2="44.74"></line>
                    </svg>
                  </div>
                  <p className="text-base md:text-lg text-cyan-200/90">10+ Advanced Models</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 md:w-7 md:h-7 smooth-bounce">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
                      <path 
                        fill="currentColor" 
                        d="M0 26.016q0 2.496 1.76 4.224t4.256 1.76h20q2.464 0 4.224-1.76t1.76-4.224v-20q0-2.496-1.76-4.256t-4.224-1.76h-20q-2.496 0-4.256 1.76t-1.76 4.256v20zM4 26.016v-20q0-0.832 0.576-1.408t1.44-0.608h20q0.8 0 1.408 0.608t0.576 1.408v20q0 0.832-0.576 1.408t-1.408 0.576h-20q-0.832 0-1.44-0.576t-0.576-1.408zM6.016 24q0 0.832 0.576 1.44t1.408 0.576h16q0.832 0 1.408-0.576t0.608-1.44v-0.928q-0.224-0.448-1.12-2.688t-1.6-3.584-1.28-2.112q-0.544-0.576-1.12-0.608t-1.152 0.384-1.152 1.12-1.184 1.568-1.152 1.696-1.152 1.6-1.088 1.184-1.088 0.448q-0.576 0-1.664-1.44-0.16-0.192-0.48-0.608-1.12-1.504-1.6-1.824-0.768-0.512-1.184 0.352-0.224 0.512-0.928 2.24t-1.056 2.56v0.64zM6.016 9.024q0 1.248 0.864 2.112t2.112 0.864 2.144-0.864 0.864-2.112-0.864-2.144-2.144-0.864-2.112 0.864-0.864 2.144z"
                      />
                    </svg>
                  </div>
                  <p className="text-base md:text-lg text-cyan-200/90">Let AI decode your images with human-like understanding</p>
                </div>
              </div>
            </div>

            {!isLoading && (
              <div className="flex flex-row gap-4 mt-6">
                {!user ? (
                  <Link href="/register">
                    <Button
                      className="px-12 py-6 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl"
                    >
                      Get Started
                    </Button>
                  </Link>
                ) : (
                  <Link href="/chat">
                    <Button
                      className="px-8 py-6 text-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl"
                    >
                      Go to Chat
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Providers Section */}
      <section id="providers" className="py-20 px-4 border-t border-white/10 w-full">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-cyan-500 mb-4">
              Available AI Providers
            </h2>
            <p className="text-cyan-400 max-w-2xl mx-auto">
              Access the most advanced AI models from leading providers, all in one place.
              Upload documents and images for instant analysis.
            </p>
          </div>
          
          {/* Info Box */}
          <div className="bg-cyan-950/40 p-4 rounded-lg flex flex-col gap-3 border border-cyan-800/30 max-w-md mx-auto mb-8">
            <div className="flex items-center gap-3">
              <div className="px-2 py-0.5 rounded-[4px] bg-cyan-800/60">
                <span className="text-sm text-cyan-100">1K</span>
              </div>
              <span className="text-sm sm:text-base text-cyan-100">= Max context length</span>
            </div>
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-3 text-sm text-cyan-100">
                <Eye className="w-5 h-5 text-blue-400" />
                <span>Can read and analyze images</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-cyan-100">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Supports deep thinking</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-cyan-100">
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
          
          <ProvidersWheel />
        </div>
      </section>

      {/* Subscriptions Section */}
      <section id="subscriptions" className="py-20 px-4 border-t border-white/10 w-full transition-all duration-300">
        <PricingSectionDemo />
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 border-t border-white/10 w-full transition-all duration-300">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-cyan-500 mb-4">Common Questions</h2>
            <p className="text-cyan-200/90">Everything you need to know about Walkie AI</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item: FAQItem, index: number) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-cyan-400 hover:text-cyan-300 text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-cyan-200/90">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
            </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <div className="py-16 px-4 border-t border-white/10 w-full transition-all duration-300">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-cyan-500 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-cyan-400 mb-4 max-w-2xl mx-auto">
            Join thousands of users who are already experiencing the future of AI.
            Get 10 free credits daily when you sign up today with free subscription.
          </p>
          <p className="text-cyan-300 mb-8 max-w-2xl mx-auto">
            Upload documents and images for instant analysis. Summarize PDFs, scan photos, and get answers from your files with advanced AI models, all in one place.
          </p>
          {!isLoading && (
            <div className="flex gap-4 justify-center">
              {!user ? (
                <Link href="/register">
                  <Button
                    className="px-8 py-6 text-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl"
                  >
                    Register and get 10 messages for free daily
                  </Button>
                </Link>
              ) : (
                <Link href="/chat">
                  <Button
                    className="px-8 py-6 text-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl"
                  >
                    Go to Chat
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="transition-all duration-300">
        <Footerdemo />
      </footer>
    </div>
  )
}

