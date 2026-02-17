import { Button } from "./ui/button"

export function Hero() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center text-white" style={{background: "linear-gradient(135deg, #0a0a0a 0%, #0d1a2e 50%, #0a0a0a 100%)"}}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-sm font-medium">
          AI-Powered Development Agency
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          We build{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI systems
          </span>{" "}
          that work.
        </h1>
        <p className="text-xl text-neutral-300 mb-8">
          Autonomous agents. Real code. Delivered by people who&apos;ve shipped.
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
