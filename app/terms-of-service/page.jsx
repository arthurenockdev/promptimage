import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-6"><em>Effective Date: October 27, 2024</em></p>
          
          <p>Welcome to PromptImage! By using our website, you agree to these Terms of Service. Please read them carefully.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using PromptImage, you agree to follow these terms. If you don't agree, please do not use our service.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
          <p>PromptImage allows you to generate images based on text prompts. We may update or change features without notice.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Responsibilities</h2>
          <p>Users agree not to use the service for illegal, offensive, or harmful purposes. You are responsible for any content you create and use.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Intellectual Property</h2>
          <p>All generated images belong to you, the user, for personal or commercial use. However, the software and underlying technology belong to PromptImage.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Pricing and Payments</h2>
          <p>PromptImage offers free and paid plans. Paid subscriptions renew automatically unless canceled. All payments are final; no refunds are available.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Privacy and Data Usage</h2>
          <p>We respect your privacy. Our AI processes your inputs (like text prompts) to generate images, but we do not store personal information unless required by law. For details, please see our <Link href="/privacy-notice" className="text-primary hover:underline">Privacy Policy</Link>.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
          <p>We provide the service "as is" and are not responsible for any unexpected results, damages, or losses related to the use of our service.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to Terms</h2>
          <p>We may update these terms occasionally. Changes take effect upon posting, and continued use of the service means you accept the new terms.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
          <p>If you have any questions, please contact us at <a href="mailto:promptimage@gmail.com" className="text-primary hover:underline">promptimage@gmail.com</a>.</p>

          <hr className="my-8" />

          <p className="text-xl font-semibold text-center">Thank you for using PromptImage!</p>
        </article>
      </main>
    </div>
  )
}