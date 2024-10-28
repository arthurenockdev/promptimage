import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function PrivacyNotice() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container px-4 py-6 lg:px-6">
        <Button variant="ghost" asChild>
          <Link href="/" className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </header>
      <main className="container px-4 py-6 lg:px-6">
        <article className="prose prose-gray dark:prose-invert mx-auto">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">Privacy Notice</h1>
          <p className="text-muted-foreground mb-6"><em>Effective Date: October 27, 2024</em></p>
          
          <p>PromptImage ("we," "our," or "us") values your privacy. This notice explains how we collect, use, and protect your information when you use our services.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p><strong>User Inputs:</strong> We collect text prompts and any content you upload to generate images. This content is processed by our AI and not stored unless required for service improvement.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <ul>
            <li><strong>Image Generation:</strong> We use your inputs solely to generate images based on your prompts.</li>
            <li><strong>Legal Compliance:</strong> We may retain or disclose information if required by law.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Sharing Your Information</h2>
          <p>We do not sell or share your personal information with third parties. Information is only shared with trusted partners if necessary to operate the service or comply with legal obligations.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
          <p>We use industry-standard security measures to protect your data. However, no method of transmission over the internet is entirely secure, and we cannot guarantee absolute security.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights</h2>
          <p><strong>Access and Correction:</strong> You can access or correct your information by contacting us.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Changes to this Privacy Notice</h2>
          <p>We may update this Privacy Notice from time to time. We encourage you to review it periodically. Changes take effect upon posting on our website.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Us</h2>
          <p>If you have any questions or concerns about this Privacy Notice, please contact us at <a href="mailto:promptimage@gmail.com" className="text-primary hover:underline">promptimage@gmail.com</a>.</p>
        </article>
      </main>
    </div>
  )
}