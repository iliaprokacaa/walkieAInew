"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authApi } from "@/lib/api"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"

interface VerifyEmailResponse {
  success: boolean
  message?: string
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [isVerifying, setIsVerifying] = useState(true)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setIsVerifying(false)
        toast.error("Invalid verification link")
        return
      }

      try {
        const response = await authApi.verifyEmail(token) as VerifyEmailResponse
        if (response.success) {
          setIsVerified(true)
          toast.success("Email verified successfully")
        } else {
          toast.error(response.message || "Failed to verify email")
        }
      } catch (error) {
        console.error("Verification error:", error)
        toast.error("Failed to verify email")
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center w-full bg-[#0a1929]">
      <Card className="w-full max-w-md z-20 bg-black/40 backdrop-blur-md border-neutral-800">
        <CardHeader>
          <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-600">
            Email Verification
          </CardTitle>
          <CardDescription className="text-center text-cyan-400">
            {isVerifying 
              ? "Verifying your email address..." 
              : isVerified 
                ? "Your email has been verified successfully" 
                : "Failed to verify your email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          {isVerifying ? (
            <div className="flex items-center space-x-2 text-cyan-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Please wait...</span>
            </div>
          ) : isVerified ? (
            <div className="text-center space-y-4">
              <div className="text-cyan-400">
                Your email has been verified successfully. You can now log in to your account.
              </div>
              <Button 
                asChild
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-cyan-400">
                The verification link is invalid or has expired. Please request a new verification email.
              </div>
              <Button 
                asChild
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                <Link href="/login">Return to Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full text-cyan-400">
            Need help?{" "}
            <Link href="/contact" className="text-cyan-400 hover:text-cyan-300 hover:underline">
              Contact Support
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

