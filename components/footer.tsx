import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="text-lg font-bold mb-4">Unimpossible</h3>
            <p className="text-neutral-400 text-sm">
              AI systems that work. Built by people who've shipped.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services/ai-project-delivery" className="text-neutral-400 hover:text-white">
                  AI Project Delivery
                </Link>
              </li>
              <li>
                <Link href="/services/fractional-ai-cto" className="text-neutral-400 hover:text-white">
                  Fractional AI CTO
                </Link>
              </li>
              <li>
                <Link href="/services/ai-integration" className="text-neutral-400 hover:text-white">
                  AI Integration
                </Link>
              </li>
              <li>
                <Link href="/services/hospitality-ai" className="text-neutral-400 hover:text-white">
                  Hospitality AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-neutral-400 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-neutral-400 hover:text-white">
                  Team
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="text-neutral-400 hover:text-white">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-neutral-400 hover:text-white">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/privacy" className="text-neutral-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-neutral-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-400">
          <p>&copy; {new Date().getFullYear()} Unimpossible Consultants Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
