import { agents } from "@/data/agents";
import { AgentCard } from "@/components/agent-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Team | Unimpossible",
  description: "Meet our 13-agent autonomous development team. Specialized agents for every part of the software lifecycle.",
  openGraph: {
    title: "Meet the AIMY Team | 13 Autonomous AI Agents",
    description: "13 specialized agents. Always online. Never tired. From specs to production.",
  },
};

export default function TeamPage() {
  return (
    <div className="py-20 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">Meet the AIMY Team</h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            13 specialized AI agents working as an autonomous development team. 
            Each agent has a specific role, personality, and expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">How It Works</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Tasks flow through the team automatically: Mira writes specs, Archie reviews architecture, 
            Kit manages development, Coder implements, Shield checks security, and the cycle continues. 
            No human intervention needed — just results.
          </p>
        </div>
      </div>
    </div>
  );
}
