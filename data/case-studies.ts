export interface CaseStudy {
  id: string
  title: string
  challenge: string
  solution: string
  techStack: string[]
  results: {
    [key: string]: string
  }
  githubUrl?: string
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'aimy-pipeline',
    title: 'AIMY Autonomous Pipeline',
    challenge: 'Manual development bottleneck — 1-2 features/week with traditional human team',
    solution: '13-agent autonomous team handling complete development lifecycle: specs → code → review → deploy',
    techStack: ['Next.js', 'PostgreSQL', 'Ollama', 'pgvector', 'Aider', 'GitHub Actions'],
    results: {
      throughput: '8-12 tasks/day',
      uptime: '99.2%',
      costSaving: '£180k/year vs. 3-person team'
    },
    githubUrl: 'https://github.com/dr12hes/aimy'
  },
  {
    id: 'llm-gateway',
    title: 'LLM Gateway (Candengo)',
    challenge: 'Multi-model routing complexity for SaaS applications with cost and reliability concerns',
    solution: 'Universal API gateway with intelligent cost optimization, automatic failover, and prompt caching',
    techStack: ['Node.js', 'Redis', 'PostgreSQL', 'OpenRouter', 'Anthropic', 'OpenAI'],
    results: {
      costReduction: '40% cost reduction',
      uptime: '99.9% uptime',
      latency: '<200ms average latency'
    }
  },
  {
    id: 'venue-validator',
    title: 'Venue Validator (Candengo)',
    challenge: 'Manual venue data validation for hospitality clients — slow, error-prone, inconsistent',
    solution: 'AI-powered validation with geocoding, duplicate detection, and automated data enrichment',
    techStack: ['Python', 'FastAPI', 'PostgreSQL', 'pgvector', 'Google Maps API'],
    results: {
      automation: '95% automation rate',
      speed: '10x faster than manual process',
      accuracy: '99.3% accuracy on venue matching'
    }
  }
]
