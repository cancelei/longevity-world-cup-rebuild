"use client";

import { motion } from "framer-motion";
import { Sparkles, Building2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  year: number;
}

export function HeroSection({ year }: HeroSectionProps) {
  const router = useRouter();

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="w-3 h-3 mr-1" />
            {year} Season Active
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
            <span className="text-gradient">Longevity</span>
            <br />
            <span className="text-[var(--foreground)]">World Cup</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--foreground-secondary)] max-w-3xl mx-auto mb-4">
            The world&apos;s first competition for biological age reversal.
          </p>

          <p className="text-base md:text-lg text-[var(--foreground-muted)] max-w-2xl mx-auto mb-8">
            Clinics prove their protocols work. Companies gamify wellness. Biohackers benchmark against the best.
            <span className="block mt-2 font-semibold text-[var(--foreground-secondary)]">
              Your results. Verified. Ranked. Rewarded.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" onClick={() => router.push("/leagues/new")}>
              Start Your Clinic&apos;s Team
              <Building2 className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="xl" onClick={() => router.push("/leagues")}>
              See Who&apos;s Winning
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
