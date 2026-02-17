"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    industry: "Other",
    message: "",
    preferredTime: ""
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", company: "", industry: "Other", message: "", preferredTime: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="py-20 px-6 bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">Let&apos;s Talk</h1>
          <p className="text-xl text-neutral-400">
            Free consultation. No sales pitch. Just honest conversation about your project.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Book Your Free Consultation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-200">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-neutral-700 bg-neutral-800 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent placeholder-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-200">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-neutral-700 bg-neutral-800 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent placeholder-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-200">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full border border-neutral-700 bg-neutral-800 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent placeholder-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-200">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full border border-neutral-700 bg-neutral-800 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option>Hospitality</option>
                  <option>Retail</option>
                  <option>SaaS</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-200">Preferred Contact Time</label>
                <input
                  type="text"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  placeholder="e.g. Weekday mornings"
                  className="w-full border border-neutral-700 bg-neutral-800 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent placeholder-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-200">Message *</label>
                <textarea
                  required
                  minLength={50}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  placeholder="Tell us about your project... (minimum 50 characters)"
                  className="w-full border border-neutral-700 bg-neutral-800 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent placeholder-neutral-500"
                />
              </div>

              {status === "success" && (
                <div className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-3 rounded">
                  Thanks! We&apos;ll get back to you within 24 hours.
                </div>
              )}

              {status === "error" && (
                <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-400 px-4 py-3 rounded">
                  Something went wrong. Please try again or email david@candengo.com directly.
                </div>
              )}

              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
