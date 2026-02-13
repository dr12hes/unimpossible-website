export interface Service {
  id: string
  title: string
  slug: string
  tagline: string
  description: string
  deliverables: string[]
  timeline: string
  pricing: string
}

export const services: Service[] = [
  {
    id: 'ai-project-delivery',
    title: 'AI Project Delivery',
    slug: 'ai-project-delivery',
    tagline: 'We don't just advise — we ship',
    description: 'From spec to production, our autonomous team handles the full lifecycle. You get working code, not PowerPoints.',
    deliverables: [
      'Working code in production',
      'Comprehensive test coverage',
      'Technical documentation',
      'Deployment pipeline',
      'Post-launch support'
    ],
    timeline: '2-4 weeks for MVP, ongoing iteration',
    pricing: 'Project-based (£5k-£25k) or monthly retainer (£2k-£8k)'
  },
  {
    id: 'fractional-ai-cto',
    title: 'Fractional AI CTO',
    slug: 'fractional-ai-cto',
    tagline: 'Part-time CTO expertise without the full-time salary',
    description: 'Strategic guidance + hands-on delivery. Get executive-level AI leadership on your timeline.',
    deliverables: [
      'Architecture reviews',
      'Team upskilling',
      'Vendor selection',
      'AI strategy roadmap',
      'Technical due diligence'
    ],
    timeline: '1-3 days/week availability',
    pricing: '£1,500/day or £4k-£10k/month retainer'
  },
  {
    id: 'ai-integration',
    title: 'AI Integration',
    slug: 'ai-integration',
    tagline: 'Plug AI into your existing systems',
    description: 'No rip-and-replace, just smart enhancements. We integrate AI where it adds real value.',
    deliverables: [
      'Customer support automation',
      'Content generation pipelines',
      'Data enrichment',
      'Predictive analytics',
      'Process automation'
    ],
    timeline: '1-2 weeks for proof-of-concept, 4-6 weeks for production',
    pricing: '£3k-£15k per integration'
  },
  {
    id: 'hospitality-ai',
    title: 'Hospitality AI',
    slug: 'hospitality-ai',
    tagline: 'We know hospitality. WiFi → AI is our journey',
    description: 'Your venue data is safe with us. GDPR-compliant, UK-hosted, built by people who understand hospitality tech.',
    deliverables: [
      'Guest data enrichment',
      'Review analysis',
      'Booking optimization',
      'Staff scheduling',
      'Revenue forecasting'
    ],
    timeline: 'Custom timelines based on venue count',
    pricing: 'Custom quotes based on venue count and data volume'
  }
]
