import HCaptcha from "@hcaptcha/react-hcaptcha"
import { HCAPTCHA_SITE_KEY } from "@/lib/env"

interface HCaptchaWrapperProps {
  onVerify: (token: string) => void
}

export function HCaptchaWrapper({ onVerify }: HCaptchaWrapperProps) {
  return (
    <div className="flex justify-center my-4">
      <HCaptcha sitekey={HCAPTCHA_SITE_KEY} onVerify={onVerify} />
    </div>
  )
}

