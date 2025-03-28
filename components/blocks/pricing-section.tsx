import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { CheckIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { Shield, Brain, Sparkles } from "lucide-react"

export const PAYMENT_FREQUENCIES = ["monthly", "yearly"] as const
export type PaymentFrequency = typeof PAYMENT_FREQUENCIES[number]

interface Tier {
  id: "free" | "starter" | "plus" | "ultimate";
  name: string;
  price: {
    monthly: number | "Free";
    yearly: number | "Free";
  };
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  highlighted?: boolean;
}

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    price: {
      monthly: "Free",
      yearly: "Free",
    },
    description: "For casual users",
    features: [
      "20 credits per day",
      "Basic AI models access",
      "Basic support",
    ],
    cta: "Get started",
  },
  {
    id: "starter",
    name: "Starter",
    price: {
      monthly: 7.99,
      yearly: 47.94,
    },
    description: "For individual AI enthusiasts",
    features: [
      "50 credits per day",
      "Advanced AI models access",
      "Email support",
    ],
    cta: "Get started",
  },
  {
    id: "plus",
    name: "Plus",
    price: {
      monthly: 19.99,
      yearly: 119.94,
    },
    description: "For power users",
    features: [
      "200 credits per day",
      "Advanced AI models access",
      "Priority support",
    ],
    cta: "Get started",
    popular: true,
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: {
      monthly: 49.99,
      yearly: 299.94,
    },
    description: "For professionals",
    features: [
      "600 credits per day",
      "Advanced AI models access",
      "24/7 priority support",
    ],
    cta: "Get started",
    highlighted: true,
  },
]

interface PricingSectionProps {
  title?: string;
  subtitle?: string;
}

export function PricingSection({
  title = "Choose Your Subscription",
  subtitle = "Select the perfect subscription for your AI needs",
}: PricingSectionProps) {
  const [frequency, setFrequency] = useState<PaymentFrequency>("monthly")

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-cyan-500 to-blue-600 sm:text-4xl">{title}</h2>
        <p className="mt-4 text-lg leading-6 text-cyan-400">{subtitle}</p>
        
        {/* Billing Toggle */}
        <div className="mt-8 flex justify-center items-center gap-4">
          <span className={cn("text-sm font-medium", frequency === "monthly" ? "text-white" : "text-gray-400")}>
            Monthly
          </span>
          <Switch
            checked={frequency === "yearly"}
            onCheckedChange={(checked) => setFrequency(checked ? "yearly" : "monthly")}
            className="bg-cyan-900/50 data-[state=checked]:bg-cyan-700"
          />
          <span className={cn("text-sm font-medium", frequency === "yearly" ? "text-white" : "text-gray-400")}>
            Yearly
            <span className="ml-2 inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-2 py-1 text-xs font-medium text-cyan-400">
              Save 50%
            </span>
          </span>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={cn(
              "relative rounded-2xl bg-gradient-to-b from-black to-cyan-950/20 border transition-all duration-300",
              {
                "border-cyan-500 shadow-lg shadow-cyan-500/20": tier.popular || tier.highlighted,
                "border-white/10 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10": !tier.popular && !tier.highlighted
              }
            )}
          >
            {tier.popular && (
              <div className="absolute -top-5 inset-x-0 flex justify-center">
                <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold">
                  Most Popular
                </div>
              </div>
            )}
            <div className="p-8">
              <h3 className="text-xl font-semibold leading-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">{tier.name}</h3>
              <p className="mt-2 text-sm text-cyan-400">{tier.description}</p>
              <p className="mt-8 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold text-white">
                  {typeof tier.price[frequency] === "number"
                    ? `$${tier.price[frequency]}`
                    : tier.price[frequency]}
                </span>
                {typeof tier.price[frequency] === "number" && (
                  <span className="text-sm font-medium text-gray-400">
                    /{frequency === "monthly" ? "mo" : "yr"}
                  </span>
                )}
              </p>
              {frequency === "yearly" && typeof tier.price[frequency] === "number" && (
                <p className="mt-1 text-sm text-cyan-500">
                  Save 50% with annual billing
                </p>
              )}
              <Link href="/register">
                <Button
                  className={cn(
                    "mt-8 w-full transition-all duration-300",
                    tier.highlighted
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                      : tier.popular
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                      : "bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-500/20"
                  )}
                >
                  {tier.cta}
                </Button>
              </Link>
            </div>
            <div className="px-8 pt-6 pb-8">
              <h4 className="text-sm font-medium text-cyan-400">What's included</h4>
              <ul className="mt-6 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex space-x-3">
                    <CheckIcon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        tier.highlighted || tier.popular ? "text-cyan-400" : "text-cyan-500/50"
                      )}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PricingSectionDemo() {
  return (
    <div className="relative flex justify-center items-center w-full mt-20 scale-90">
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:35px_35px] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>
      <PricingSection
        title="Simple Pricing"
        subtitle="Choose the best subscription for your needs"
      />
    </div>
  )
} 