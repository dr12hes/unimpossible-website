import { Button } from "./ui/button"

export function Hero() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          We build AI systems that work.
        </h1>
        <p className="text-xl text-neutral-300 mb-8">
          Autonomous agents. Real code. Delivered by people who've shipped.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="primary" href="/contact">
            Book a Free Consultation
          </Button>
          <Button size="lg" variant="secondary" href="/team">
            Meet Our AI Team
          </Button>
        </div>
      </div>
    </section>
  )
}
