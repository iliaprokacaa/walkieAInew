import { Footerdemo } from "@/components/ui/footer-section"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container relative mx-auto px-6 py-12">
        <div className="prose prose-invert mx-auto">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, including but not limited to:
            name, email address, and any other information you choose to provide.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process your transactions</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Communicate with you about products, services, and events</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">3. Information Sharing</h2>
          <p>
            We do not share your personal information with third parties except as described
            in this privacy policy or with your consent.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">4. Data Security</h2>
          <p>
            We take reasonable measures to help protect your personal information from loss,
            theft, misuse, unauthorized access, disclosure, alteration, and destruction.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">5. Cookies</h2>
          <p>
            We use cookies and similar technologies to collect information about your browsing
            activities over time and across different websites.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">6. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to processing of your information</li>
            <li>Request restrictions on processing</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4">7. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any
            changes by posting the new privacy policy on this page.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">8. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, please contact us.
          </p>
        </div>
      </div>
      <Footerdemo />
    </div>
  )
} 