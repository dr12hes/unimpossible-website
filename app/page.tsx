import { Hero } from "@/components/hero";
import { AgentCard } from "@/components/agent-card";
import { agents } from "@/data/agents";
import { services } from "@/data/services";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Hero />

      {/* Services Overview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">What We Do</h2>
            <p className="text-xl text-neutral-700">AI delivery that actually delivers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div key={service.id} className="text-center">
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-neutral-700 mb-4">{service.tagline}</p>
                <Link href={`/services/${service.slug}`} className="text-primary hover:underline">
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Preview */}
      <section className="py-20 px-6 bg-neutral-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Meet Our AI Team</h2>
            <p className="text-xl text-neutral-700 mb-8">
              13 specialized agents. Always online. Never tired.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {agents.slice(0, 6).map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
          <div className="text-center">
            <Button size="lg" href="/team">
              View All 13 Agents
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to Ship?</h2>
          <p className="text-xl mb-8">
            Let's talk about your project. Free consultation, no sales pitch.
          </p>
          <Button size="lg" variant="secondary" href="/contact">
            Book Your Free Consultation
          </Button>
        </div>
      </section>
    </>
  );
}
