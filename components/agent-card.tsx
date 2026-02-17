import { Agent } from "@/data/agents"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface AgentCardProps {
  agent: Agent
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="hover:shadow-xl hover:shadow-primary/10 hover:border-neutral-700 transition-all">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{agent.emoji}</span>
          <div>
            <CardTitle className="text-2xl">{agent.name}</CardTitle>
            <p className="text-sm text-neutral-400">{agent.role}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-300 mb-4">{agent.personality}</p>
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-sm text-white">Tech Stack:</h4>
          <div className="flex flex-wrap gap-2">
            {agent.techStack.map(tech => (
              <span 
                key={tech} 
                className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-neutral-800 p-3 rounded font-mono text-xs text-neutral-300">
          {agent.exampleOutput}
        </div>
      </CardContent>
    </Card>
  )
}
