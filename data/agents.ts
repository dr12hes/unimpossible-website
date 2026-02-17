export interface Agent {
  id: string
  name: string
  emoji: string
  avatar?: string
  role: string
  personality: string
  techStack: string[]
  exampleOutput: string
  status: 'active' | 'inactive'
}

export const agents: Agent[] = [
  {
    id: 'mira',
    name: 'Mira',
    emoji: '📋',
    avatar: '/avatars/mira.png',
    role: 'Product Manager',
    personality: 'Detail-oriented spec writer. Translates chaos into crystal-clear implementation plans.',
    techStack: ['GPT-4.1', 'PostgreSQL', 'Markdown'],
    exampleOutput: 'Technical specification with acceptance criteria, file lists, SQL migrations, test plans',
    status: 'active'
  },
  {
    id: 'archie',
    name: 'Archie',
    emoji: '🏛️',
    avatar: '/avatars/archie.png',
    role: 'Chief Technology Officer',
    personality: 'Architecture-first reviewer. Catches scaling issues before they become production fires.',
    techStack: ['Qwen3 Coder Next 80B', 'pgvector', 'PostgreSQL'],
    exampleOutput: 'CTO review with security audit, performance analysis, architecture feedback',
    status: 'active'
  },
  {
    id: 'kit',
    name: 'Kit',
    emoji: '🔍',
    avatar: '/avatars/kit.png',
    role: 'Development Manager',
    personality: 'Code quality guardian. Reviews every line before it hits production.',
    techStack: ['Qwen3 Coder Next 80B', 'Git', 'ESLint'],
    exampleOutput: 'Code review with feedback on style, performance, edge cases, and testing',
    status: 'active'
  },
  {
    id: 'shield',
    name: 'Shield',
    emoji: '🛡️',
    avatar: '/avatars/shield.png',
    role: 'Security Engineer',
    personality: 'Paranoid by design. Finds vulnerabilities nobody else thought to look for.',
    techStack: ['Qwen3 Coder Next 80B', 'OWASP', 'npm audit'],
    exampleOutput: 'Security report: SQL injection risks, auth bypass, XSS vectors, dependency CVEs',
    status: 'active'
  },
  {
    id: 'coder',
    name: 'Coder',
    emoji: '💻',
    avatar: '/avatars/coder.png',
    role: 'Full-Stack Developer',
    personality: 'Implementation specialist. Turns specs into working code, fast.',
    techStack: ['GPT-4.1-mini', 'Aider', 'Git', 'Node.js', 'React'],
    exampleOutput: 'Production-ready code with tests, commits, and PR description',
    status: 'active'
  },
  {
    id: 'pixel',
    name: 'Pixel',
    emoji: '🎨',
    avatar: '/avatars/pixel.png',
    role: 'UX Engineer',
    personality: 'Design systems perfectionist. Accessibility isn\'t optional.',
    techStack: ['Qwen3 Coder Next 80B', 'Tailwind', 'Radix UI', 'ARIA'],
    exampleOutput: 'UI code review: responsive design, accessibility, design system compliance',
    status: 'active'
  },
  {
    id: 'scout',
    name: 'Scout',
    emoji: '🔭',
    avatar: '/avatars/scout.png',
    role: 'Research Analyst',
    personality: 'Information hunter. Finds what you need, fast.',
    techStack: ['GLM 4.7 Flash', 'Brave Search', 'Web Scraping'],
    exampleOutput: 'Research summary with sources, competitive analysis, technical feasibility',
    status: 'active'
  },
  {
    id: 'docbot',
    name: 'DocBot',
    emoji: '📚',
    role: 'Technical Writer',
    personality: 'Documentation evangelist. If it\'s not documented, it doesn\'t exist.',
    techStack: ['GLM 4.7 Flash', 'Markdown', 'OpenAPI'],
    exampleOutput: 'API docs, README files, user guides, deployment instructions',
    status: 'active'
  },
  {
    id: 'hype',
    name: 'Hype',
    emoji: '📣',
    avatar: '/avatars/hype.png',
    role: 'Marketing Lead',
    personality: 'Story-first marketer. Makes technical stuff sound exciting (because it is).',
    techStack: ['GLM 4.7 Flash', 'Copywriting', 'SEO'],
    exampleOutput: 'Landing page copy, blog posts, social media content, email campaigns',
    status: 'active'
  },
  {
    id: 'penny',
    name: 'Penny',
    emoji: '💰',
    avatar: '/avatars/penny.png',
    role: 'Financial Analyst',
    personality: 'Numbers don\'t lie. Tracks every penny, optimizes every spend.',
    techStack: ['GLM 4.7 Flash', 'PostgreSQL', 'Spreadsheets'],
    exampleOutput: 'Cost analysis, budget forecasts, ROI calculations, spend optimization',
    status: 'active'
  },
  {
    id: 'rex',
    name: 'Rex',
    emoji: '⚙️',
    avatar: '/avatars/rex.png',
    role: 'COO Agent',
    personality: 'Operational efficiency machine. Auto-scales infrastructure based on real-time metrics.',
    techStack: ['GLM 4.7 Flash', 'PostgreSQL', 'System Metrics'],
    exampleOutput: 'Operational reports, auto-scaling decisions, resource optimization',
    status: 'active'
  },
  {
    id: 'sysop',
    name: 'SysOp',
    emoji: '🔧',
    avatar: '/avatars/vex.png',
    role: 'Infrastructure Monitor',
    personality: 'Always watching. Detects issues before they become incidents.',
    techStack: ['GLM 4.7 Flash', 'SSH', 'Docker', 'PostgreSQL'],
    exampleOutput: 'Health checks, alert reports, auto-recovery scripts, incident summaries',
    status: 'active'
  },
  {
    id: 'securityjudge',
    name: 'SecurityJudge',
    emoji: '⚖️',
    role: 'Security Auditor',
    personality: 'Zero-trust enforcer. Reviews Shield\'s work and catches what was missed.',
    techStack: ['GLM 4.7 Flash', 'Security Standards', 'Compliance'],
    exampleOutput: 'Final security verdict: approve/reject with risk assessment and remediation steps',
    status: 'active'
  }
]
