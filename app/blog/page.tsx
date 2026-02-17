import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Unimpossible",
  description: "Thoughts on AI, development, and building systems that work.",
};

export default function BlogPage() {
  return (
    <div className="py-20 px-6 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">Blog</h1>
          <p className="text-xl text-neutral-400">
            Thoughts on AI, development, and building systems that work.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <p className="text-lg text-neutral-400">
            Blog coming soon. In the meantime, connect with David on{" "}
            <a 
              href="https://linkedin.com/in/davidriches" 
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
