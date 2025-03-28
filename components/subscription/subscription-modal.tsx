"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { toast } from "react-hot-toast"
import { ArrowLeft, Loader2, CheckIcon, Clipboard } from "lucide-react"
import { subscriptionApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type PaymentFrequency = "monthly" | "yearly"

const TIERS = [
  {
    id: 0,
    name: "Free",
    price: {
      monthly: 0,
      yearly: 0,
    },
    description: "Basic AI access",
    features: [
      "20 credits per day",
      "Basic AI models access",
      "Community support",
    ],
  },
  {
    id: 1,
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
  },
  {
    id: 2,
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
    popular: true,
  },
  {
    id: 3,
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
    highlighted: true,
  }
]

const cryptoOptions = [
  { value: "USDT", label: "Tether (USDT)", icon: "/crypto/usdt.svg" },
  { value: "ETH", label: "Ethereum (ETH)", icon: "/crypto/eth.svg" },
  { value: "BNB", label: "BNB Chain (BNB)", icon: "/crypto/bnb.svg" },
  { value: "LTC", label: "Litecoin (LTC)", icon: "/crypto/ltc.svg" },
  { value: "USDC", label: "USD Coin (USDC)", icon: "/crypto/usdc.svg" }
]

interface SubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PaymentDetails {
  orderid: string;
  amount: string;
  address: string;
  network: string;
  crypto: string;
  qr: string;
  subscription: string;
}

interface PaymentStatus {
  success: boolean;
  status: "Waiting" | "Paid" | "Processed";
  message: string;
}

type Step = 'subscription' | 'crypto' | 'payment';

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const router = useRouter()
  const { user, token, refreshUser } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<number | null>(null)
  const [selectedCrypto, setSelectedCrypto] = useState<string>("")
  const [currentStep, setCurrentStep] = useState<Step>('subscription')
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)
  const [frequency, setFrequency] = useState<PaymentFrequency>("monthly")

  const checkPaymentStatus = async () => {
    if (!paymentDetails?.orderid || !token || 
        paymentStatus?.status === "Paid" || paymentStatus?.status === "Processed") {
      return;
    }

    try {
      setIsCheckingPayment(true);
      const status = await subscriptionApi.checkPaymentStatus(paymentDetails.orderid, token);
      setPaymentStatus(status);

      if (status.status === "Paid" || status.status === "Processed") {
        toast.success(status.message);
        await refreshUser();
        router.refresh();
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handleSubscriptionSelect = (subscriptionId: number) => {
    setSelectedSubscription(subscriptionId)
    setCurrentStep('crypto')
  }

  const handleCryptoSelect = async () => {
    if (!token || !selectedSubscription || !selectedCrypto) {
      toast.error("Please select a cryptocurrency")
      return
    }

    setIsProcessing(true)
    try {
      const response = await subscriptionApi.buySubscription({
        subscriptionid: selectedSubscription,
        crypto: selectedCrypto,
        type: frequency
      }, token)

      if (response.success && response.details) {
        setPaymentDetails(response.details)
        setCurrentStep('payment')
        // Start checking payment status
        checkPaymentStatus()
        const intervalId = setInterval(checkPaymentStatus, 5000)
        return () => clearInterval(intervalId)
      } else {
        toast.error("Failed to get payment details")
      }
    } catch (error) {
      console.error("Error subscribing:", error)
      toast.error("Failed to process subscription")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setSelectedSubscription(null)
    setSelectedCrypto("")
    setCurrentStep('subscription')
    setPaymentDetails(null)
    onOpenChange(false)
  }

  const renderSubscriptionSelection = () => (
    <>
      <DialogHeader className="pb-2">
        <DialogTitle className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-cyan-500 to-blue-600 sm:text-2xl text-center">Choose Your Subscription</DialogTitle>
        <p className="mt-1 text-sm leading-5 text-cyan-400 text-center">Select the perfect subscription for your AI needs</p>
        
        <div className="mt-3 flex justify-center items-center gap-2">
          <span className={cn("text-xs font-medium", frequency === "monthly" ? "text-white" : "text-gray-400")}>
            Monthly
          </span>
          <Switch
            checked={frequency === "yearly"}
            onCheckedChange={(checked) => setFrequency(checked ? "yearly" : "monthly")}
            className="bg-cyan-900/50 data-[state=checked]:bg-cyan-700"
          />
          <span className={cn("text-xs font-medium", frequency === "yearly" ? "text-white" : "text-gray-400")}>
            Yearly
            <span className="ml-1 inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400">
              Save 50%
            </span>
          </span>
        </div>
      </DialogHeader>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => {
          const isCurrentSubscription = user?.subscriptionid === tier.id;
          return (
            <div
              key={tier.id}
              className={cn(
                "relative rounded-lg bg-gradient-to-b from-black to-cyan-950/20 border transition-all duration-300",
                {
                  "border-cyan-500 shadow-lg shadow-cyan-500/20": tier.popular || tier.highlighted,
                  "border-white/10 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10": !tier.popular && !tier.highlighted,
                  "opacity-50": isCurrentSubscription
                }
              )}
            >
              {tier.popular && (
                <div className="absolute -top-2 inset-x-0 flex justify-center">
                  <div className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-semibold">
                    Most Popular
                  </div>
                </div>
              )}
              {isCurrentSubscription && (
                <div className="absolute -top-2 inset-x-0 flex justify-center">
                  <div className="inline-block px-2 py-0.5 rounded-full bg-green-600 text-white text-[10px] font-semibold">
                    Current
                  </div>
                </div>
              )}
              <div className="p-3">
                <h3 className="text-base font-semibold leading-5 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">{tier.name}</h3>
                <p className="mt-0.5 text-xs text-cyan-400">{tier.description}</p>
                <p className="mt-2 flex items-baseline gap-x-1">
                  <span className="text-2xl font-bold text-white">
                    ${tier.price[frequency]}
                  </span>
                  <span className="text-xs font-medium text-gray-400">
                    /{frequency === "monthly" ? "mo" : "yr"}
                  </span>
                </p>
                {frequency === "yearly" && (
                  <p className="mt-0.5 text-[10px] text-cyan-500">
                    Save 50% with annual billing
                  </p>
                )}
                <Button
                  className={cn(
                    "mt-2 w-full h-8 text-xs transition-all duration-300",
                    tier.highlighted
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                      : tier.popular
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                      : "bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-500/20"
                  )}
                  onClick={() => handleSubscriptionSelect(tier.id)}
                  disabled={isProcessing || isCurrentSubscription}
                  style={{ display: tier.id === 0 ? 'none' : 'block' }}
                >
                  {isCurrentSubscription ? 'Current' : selectedSubscription === tier.id ? 'Selected' : 'Select'}
                </Button>
              </div>
              <div className="px-3 pb-3">
                <h4 className="text-xs font-medium text-cyan-400">What's included</h4>
                <ul className="mt-2 space-y-1.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckIcon
                        className={cn(
                          "h-3 w-3 flex-shrink-0 mt-0.5",
                          tier.highlighted || tier.popular ? "text-cyan-400" : "text-cyan-500/50"
                        )}
                        aria-hidden="true"
                      />
                      <span className="text-[11px] text-gray-300 leading-4">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </>
  )

  const renderCryptoSelection = () => (
    <>
      <DialogHeader className="pb-2">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2 h-8 w-8 hover:bg-cyan-950"
            onClick={() => setCurrentStep('subscription')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-base font-bold text-cyan-500">Select Payment Method</DialogTitle>
        </div>
      </DialogHeader>
      <div className="p-2">
        <div className="max-w-sm mx-auto">
          <div className="grid grid-cols-1 gap-2">
            {cryptoOptions.map((crypto) => (
              <button
                key={crypto.value}
                className={`flex items-center p-2 rounded-lg border ${
                  selectedCrypto === crypto.value 
                    ? 'border-cyan-500 bg-cyan-950/20' 
                    : 'border-white/10 hover:border-cyan-500/50'
                } transition-all`}
                onClick={() => setSelectedCrypto(crypto.value)}
              >
                <div className="w-5 h-5 mr-2 relative">
                  <img
                    src={crypto.icon}
                    alt={crypto.label}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="text-white text-sm">{crypto.label}</span>
              </button>
            ))}
          </div>
          <Button 
            className="w-full mt-3 h-9 bg-cyan-600 hover:bg-cyan-700 text-white text-sm"
            onClick={handleCryptoSelect}
            disabled={isProcessing || !selectedCrypto}
          >
            {isProcessing ? 'Processing...' : 'Continue to Payment'}
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] w-[calc(100%-1rem)] p-3 bg-black border border-white/10 overflow-y-auto max-h-[90vh] rounded-xl">
        {currentStep === 'subscription' && renderSubscriptionSelection()}
        {currentStep === 'crypto' && renderCryptoSelection()}
        {currentStep === 'payment' && paymentDetails && (
          <>
            <DialogHeader className="pb-2">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  className="mr-2 h-8 w-8 hover:bg-cyan-950"
                  onClick={() => setCurrentStep('crypto')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle className="text-base font-bold text-cyan-500">Complete Payment</DialogTitle>
              </div>
            </DialogHeader>
            <div className="p-2">
              <div className="max-w-sm mx-auto text-center">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-white mb-2">
                    {TIERS.find(tier => tier.id === selectedSubscription)?.name} {frequency === "yearly" ? "Yearly" : "Monthly"} Subscription
                  </h3>
                  
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 relative mr-2">
                      <img
                        src={cryptoOptions.find(c => c.value === paymentDetails?.crypto)?.icon || ''}
                        alt={paymentDetails?.crypto || ''}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-gray-400 text-xs mb-0.5">Amount to Pay:</div>
                      <div className="text-lg md:text-xl font-bold text-white">
                        {paymentDetails?.amount} <span className="text-cyan-500">{paymentDetails?.crypto}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg mb-4 mx-auto w-36 h-36 md:w-40 md:h-40">
                  <img
                    src={paymentDetails?.qr || ''}
                    alt="Payment QR Code"
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>

                <div className="bg-black/40 rounded-lg p-2.5 mb-3">
                  <div className="mb-2">
                    <div className="text-gray-400 text-xs mb-0.5">Network:</div>
                    <div className="text-base font-semibold text-white">{paymentDetails?.network}</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-xs mb-1.5">Send payment to this address:</div>
                    <div className="bg-black/40 p-2 rounded-lg flex items-center gap-2">
                      <p className="text-white break-all font-mono text-xs flex-1 select-all">{paymentDetails?.address}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-cyan-950/50 rounded-lg"
                        onClick={() => {
                          navigator.clipboard.writeText(paymentDetails?.address || '')
                          toast.success("Address copied!")
                        }}
                      >
                        <Clipboard className="h-3.5 w-3.5 text-gray-400 hover:text-white" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400">
                  <p className="mb-1.5">Order ID: <span className="text-white select-all">{paymentDetails?.orderid}</span></p>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    {isCheckingPayment && (
                      <Loader2 className="h-3 w-3 animate-spin text-cyan-500" />
                    )}
                    {paymentStatus?.status === "Waiting" && (
                      <p className="text-[10px]">Waiting for payment...</p>
                    )}
                    {paymentStatus?.status === "Paid" && (
                      <div className="flex items-center gap-1.5 text-green-500">
                        <CheckIcon className="h-3 w-3" />
                        <p className="text-[10px]">Payment successful! Your subscription is now active.</p>
                      </div>
                    )}
                    {paymentStatus?.status === "Processed" && (
                      <div className="flex items-center gap-1.5 text-green-500">
                        <CheckIcon className="h-3 w-3" />
                        <p className="text-[10px]">This payment was already processed.</p>
                      </div>
                    )}
                    {!paymentStatus?.status && (
                      <p className="text-[10px]">Checking payment status...</p>
                    )}
                  </div>
                  {(paymentStatus?.status === "Paid" || paymentStatus?.status === "Processed") && (
                    <div className="mt-4">
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                        onClick={() => {
                          handleClose();
                          router.refresh();
                        }}
                      >
                        Close and Return to Chat
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 