import { Agent } from "@/data/agents"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface AgentCardProps {
  agent: Agent
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{agent.emoji}</span>
          <div>
            <CardTitle className="text-2xl">{agent.name}</CardTitle>
            <p className="text-sm text-neutral-700">{agent.role}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-700 mb-4">{agent.personality}</p>
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-sm">Tech Stack:</h4>
          <div className="flex flex-wrap gap-2">
            {agent.techStack.map(tech => (
              <span 
                key={tech} 
                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-neutral-100 p-3 rounded font-mono text-xs text-neutral-700">
          {agent.exampleOutput}
        </div>
      </CardContent>
    </Card>
  )
}
