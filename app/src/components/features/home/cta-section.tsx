"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const router = useRouter();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-[var(--foreground)]">
            Ready to Prove Your Protocols Work?
          </h2>
          <p className="text-lg text-[var(--foreground-secondary)] mb-8">
            Create a league for your clinic, company, or community.
            Track collective biological age improvements and compete for the top spot.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" className="animate-pulse-glow" onClick={() => router.push("/leagues/new")}>
              Start Competing for Free
              <Building2 className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="xl" onClick={() => router.push("/leagues")}>
              Join Existing League
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
