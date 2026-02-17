import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Unimpossible",
  description: "From WiFi consultancy to AI delivery. David Riches built AIMY to solve his own bottleneck.",
};

export default function AboutPage() {
  return (
    <div className="py-20 px-6 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white">From WiFi to AI</h1>
        
        <div className="prose prose-invert prose-lg max-w-none space-y-6 text-neutral-300">
          <p>
            I founded Unimpossible in 2016 as a WiFi consultancy for hospitality venues. 
            For 7 years, I deployed network infrastructure to 50+ venues across the UK.
          </p>

          <p>
            In 2023, I started building with LLMs. What began as internal tools for my own use 
            became products: the LLM Gateway, Venue Validator, and eventually AIMY — an autonomous 
            AI team that ships code.
          </p>

          <p>
            In 2026, AIMY evolved from a side project into the core of how I work. 13 specialized 
            agents now handle the entire development lifecycle: from specs to production. 
            What used to take a 3-person team now runs autonomously, 24/7.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-4 text-white">Why It Matters</h2>
          
          <p>
            AI isn&apos;t just hype for me — it&apos;s the tool that let me scale beyond my own time. 
            I&apos;m not an academic. I&apos;m a builder. And now I help other companies do the same.
          </p>

          <p>
            As a fractional AI CTO, I work with 3 UK SaaS companies. I help them integrate AI 
            without the buzzwords. Strategic decisions backed by real-world delivery experience.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-4 text-white">Credibility Markers</h2>
          
          <ul className="space-y-2 text-neutral-300">
            <li>8+ years in hospitality tech</li>
            <li>50+ venues deployed (WiFi/network infrastructure)</li>
            <li>3 active fractional AI CTO clients</li>
            <li>AIMY pipeline: 500+ autonomous deployments</li>
            <li>GitHub: 20+ public repos, 1.2k commits in 2025-2026</li>
            <li>Open-source contributor (OpenClaw, Aider integrations)</li>
          </ul>

          <h2 className="text-3xl font-bold mt-12 mb-4 text-white">Let&apos;s Work Together</h2>
          
          <p>
            If you&apos;re looking for someone who&apos;s actually built and shipped AI systems — not just 
            advised on them — let&apos;s talk.
          </p>
        </div>

        <div className="mt-12">
          <Button size="lg" href="/contact">
            Book a Free Consultation
          </Button>
        </div>
      </div>
    </div>
  );
}
