import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@repo/ui/components/ui/button";

export function CTA() {
  return (
    <section className="relative bg-white dark:bg-[#1F1328] overflow-hidden py-28 px-6 sm:px-10 lg:px-16">
      {/* Background radial gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_40%_40%_at_50%_0%,rgba(120,119,198,0.1),transparent)] dark:bg-[radial-gradient(ellipse_40%_40%_at_50%_0%,rgba(120,119,198,0.2),transparent)]" />

      <div className="max-w-5xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-sm font-medium tracking-wide uppercase text-gray-600 dark:text-gray-400 mb-3"
        >
          AI-Powered Workforce
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-geist font-bold bg-clip-text text-transparent bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]"
        >
          Deploy AI Agents to <br /> transform your business
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          Replace traditional employees with AI agents that work 24/7, scale instantly,
          and cost 80% less. Get started in minutes and only pay for what you use.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10"
        >
          <Button
            asChild
            size="lg"
            className="rounded-xl px-5 text-base bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-500 dark:to-pink-400 text-white shadow-lg shadow-purple-500/25 dark:shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/35 dark:hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] border border-purple-500/20 dark:border-purple-400/20">
            <Link href="https://explainx.ai/waitlist">
              <span className="text-nowrap">Start Building</span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
