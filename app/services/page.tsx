import { services } from "@/data/services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | Unimpossible",
  description: "AI project delivery, fractional AI CTO, AI integration, and hospitality AI solutions.",
};

export default function ServicesPage() {
  return (
    <div className="py-20 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">Our Services</h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            We build AI systems that work. Pick your path.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-xl hover:shadow-primary/10 hover:border-neutral-700 transition-all">
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription className="text-base">{service.tagline}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-400 mb-6">{service.description}</p>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-2 text-white">Deliverables:</h4>
                  <ul className="space-y-1 text-sm text-neutral-400">
                    {service.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-neutral-400">
                    <strong className="text-neutral-200">Timeline:</strong> {service.timeline}
                  </p>
                  <p className="text-sm text-neutral-400">
                    <strong className="text-neutral-200">Pricing:</strong> {service.pricing}
                  </p>
                </div>

                <Link href={`/services/${service.slug}`}>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-neutral-800 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Not sure which service you need?</h2>
          <p className="text-xl mb-8 text-neutral-300">Let&apos;s talk. We&apos;ll figure it out together.</p>
          <Button size="lg" variant="secondary" href="/contact">
            Book a Free Consultation
          </Button>
        </div>
      </div>
    </div>
  );
}
