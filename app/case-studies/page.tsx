import { caseStudies } from "@/data/case-studies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Case Studies | Unimpossible',
  description: 'Real projects. Real results. See how we've built AI systems that work.',
};

export default function CaseStudiesPage() {
  return (
    <div className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Case Studies</h1>
          <p className="text-xl text-neutral-700">
            Real projects. Real results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study) => (
            <Card key={study.id} className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>{study.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Challenge:</h4>
                  <p className="text-sm text-neutral-700">{study.challenge}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Solution:</h4>
                  <p className="text-sm text-neutral-700">{study.solution}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Tech Stack:</h4>
                  <div className="flex flex-wrap gap-2">
                    {study.techStack.slice(0, 4).map(tech => (
                      <span 
                        key={tech} 
                        className="bg-secondary/10 text-secondary px-2 py-1 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-success/5 border-l-4 border-success p-3 rounded mb-4">
                  <h4 className="font-semibold text-sm mb-2">Results:</h4>
                  <ul className="space-y-1 text-xs text-neutral-700">
                    {Object.entries(study.results).map(([key, value]) => (
                      <li key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-semibold text-success">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {study.githubUrl && (
                  <a 
                    href={study.githubUrl} 
                    className="text-primary hover:underline text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on GitHub →
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
