import { Footerdemo } from "@/components/ui/footer-section"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container relative mx-auto px-6 py-12">
        <div className="prose prose-invert mx-auto">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be bound by the terms
            and provision of this agreement.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials
            (information or software) on Walkie AI's website for personal,
            non-commercial transitory viewing only.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">3. Disclaimer</h2>
          <p>
            The materials on Walkie AI's website are provided on an 'as is' basis.
            Walkie AI makes no warranties, expressed or implied, and hereby disclaims
            and negates all other warranties including, without limitation, implied
            warranties or conditions of merchantability, fitness for a particular
            purpose, or non-infringement of intellectual property or other violation
            of rights.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">4. Limitations</h2>
          <p>
            In no event shall Walkie AI or its suppliers be liable for any damages
            (including, without limitation, damages for loss of data or profit, or due
            to business interruption) arising out of the use or inability to use the
            materials on Walkie AI's website.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">5. Accuracy of materials</h2>
          <p>
            The materials appearing on Walkie AI's website could include technical,
            typographical, or photographic errors. Walkie AI does not warrant that
            any of the materials on its website are accurate, complete or current.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">6. Links</h2>
          <p>
            Walkie AI has not reviewed all of the sites linked to its website and
            is not responsible for the contents of any such linked site. The inclusion
            of any link does not imply endorsement by Walkie AI of the site.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">7. Modifications</h2>
          <p>
            Walkie AI may revise these terms of service for its website at any time
            without notice. By using this website you are agreeing to be bound by the
            then current version of these terms of service.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4">8. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance
            with the laws and you irrevocably submit to the exclusive jurisdiction
            of the courts in that location.
          </p>
        </div>
      </div>
      <Footerdemo />
    </div>
  )
} 