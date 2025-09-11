"use client";

import { buttonVariants } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { Switch } from "@repo/ui/components/ui/switch";
import { cn } from "@repo/ui/lib/utils";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { Check, Star, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  gridOptions?: {
    angle?: number
    cellSize?: number
    opacity?: number
    lightLineColor?: string
    darkLineColor?: string
  }
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.3,
  lightLineColor = "gray",
  darkLineColor = "gray",
}) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
        `opacity-[var(--opacity)]`,
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black" />
    </div>
  )
}

const AnimatedPrice = ({ value, isMonthly }: { value: number; isMonthly: boolean }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const formatted = useTransform(rounded, (latest) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(latest)
  );

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.8, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{formatted}</motion.span>;
};

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
  gridOptions,
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const switchRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });
  const toggleInView = useInView(toggleRef, { once: true, margin: "-100px" });
  const cardsInView = useInView(cardsRef, { once: true, margin: "-100px" });

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
    }
  };

  return (
    <div className="relative bg-white dark:bg-[#1F1328]">
      <div className="absolute top-0 z-[0] h-screen w-screen bg-white dark:bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <section className="relative max-w-full mx-auto z-1">

        <div className="max-w-screen-xl z-10 mx-auto px-4 py-28 gap-12 md:px-8">
          {/* Header Section */}
          <div ref={headerRef} className="space-y-5 max-w-3xl leading-0 lg:leading-5 mx-auto text-center mb-16">
            <motion.h1 
              className="text-sm text-gray-600 dark:text-gray-400 group font-geist mx-auto px-5 py-2 bg-gradient-to-tr from-zinc-300/30 via-gray-400/30 to-transparent dark:from-zinc-300/5 dark:via-gray-400/5 border-[2px] border-black/10 dark:border-white/5 rounded-3xl w-fit"
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              {title}
              <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
            </motion.h1>
            <motion.h2 
              className="text-4xl font-cal tracking-tighter font-geist bg-clip-text text-transparent mx-auto md:text-6xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]"
              initial={{ opacity: 0, y: 30 }}
              animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Choose the plan that works for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200">
                you
              </span>
            </motion.h2>
            <motion.p 
              className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {description}
            </motion.p>
          </div>

          {/* Toggle Section */}
          <motion.div 
            ref={toggleRef}
            className="flex justify-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={toggleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <label className="relative inline-flex items-center cursor-pointer">
              <Label>
                <Switch
                  ref={switchRef as any}
                  checked={!isMonthly}
                  onCheckedChange={handleToggle}
                  className="relative"
                />
              </Label>
            </label>
            <span className="ml-2 font-semibold text-gray-700 dark:text-gray-300">
              Annual billing <span className="text-purple-600 dark:text-purple-400">(Save 20%)</span>
            </span>
          </motion.div>

          {/* Pricing Cards */}
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => {
              const cardRef = useRef<HTMLDivElement>(null);
              const cardInView = useInView(cardRef, { once: true, margin: "-50px" });

              return (
                <motion.div
                  ref={cardRef}
                  key={index}
                  initial={{ y: 50, opacity: 0, scale: 0.95 }}
                  animate={cardInView ? { y: 0, opacity: 1, scale: 1 } : { y: 50, opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100,
                    damping: 30,
                    delay: index * 0.2,
                  }}
                  className={cn(
                    "relative rounded-2xl p-8 text-center flex flex-col justify-center",
                    "bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm",
                    "border-[2px] border-gray-200/50 dark:border-white/5 shadow-lg shadow-gray-200/50 dark:shadow-black/20",
                    plan.isPopular 
                      ? "border-purple-300 dark:border-purple-400/30 shadow-lg shadow-purple-200/50 dark:shadow-purple-500/10" 
                      : "hover:border-purple-200 dark:hover:border-purple-400/20 hover:shadow-xl hover:shadow-purple-100/50 dark:hover:shadow-purple-500/5 transition-all duration-300",
                    !plan.isPopular && "mt-5",
                    index === 0 || index === 2
                      ? "z-0 transform translate-x-0 translate-y-0 -translate-z-[50px] rotate-y-[10deg]"
                      : "z-10",
                    index === 0 && "origin-right",
                    index === 2 && "origin-left"
                  )}
                >
                  {plan.isPopular && (
                    <motion.div 
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-orange-300 py-1 px-4 rounded-full flex items-center shadow-lg"
                      initial={{ opacity: 0, y: -20, scale: 0.8 }}
                      animate={cardInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -20, scale: 0.8 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <Star className="text-white h-4 w-4 fill-current" />
                      <span className="text-white ml-1 font-geist font-semibold text-sm">
                        Popular
                      </span>
                    </motion.div>
                  )}
                  
                  <div className="flex-1 flex flex-col">
                    <motion.p 
                      className="text-lg font-geist font-semibold text-gray-800 dark:text-gray-200 mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={cardInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      {plan.name}
                    </motion.p>
                    
                    <motion.div 
                      className="mb-6 flex items-center justify-center gap-x-2"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={cardInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <span className="text-5xl font-geist font-bold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
                        <AnimatedPrice 
                          value={isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)}
                          isMonthly={isMonthly}
                        />
                      </span>
                      {plan.period !== "Next 3 months" && (
                        <span className="text-sm font-geist font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-400">
                          / {plan.period}
                        </span>
                      )}
                    </motion.div>

                    <motion.p 
                      className="text-xs leading-5 text-gray-500 dark:text-gray-400 mb-8"
                      initial={{ opacity: 0 }}
                      animate={cardInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      {isMonthly ? "billed monthly" : "billed annually"}
                    </motion.p>

                    <motion.ul 
                      className="mb-8 gap-3 flex flex-col"
                      initial={{ opacity: 0, y: 20 }}
                      animate={cardInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      {plan.features.map((feature, idx) => (
                        <motion.li 
                          key={idx} 
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={cardInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                          transition={{ delay: 0.5 + idx * 0.1, duration: 0.3 }}
                        >
                          <Check className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                          <span className="text-left text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                        </motion.li>
                      ))}
                    </motion.ul>

                    <motion.div 
                      className="mt-auto"
                      initial={{ opacity: 0, y: 20 }}
                      animate={cardInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <Link
                        href={plan.href}
                        className={cn(
                          "inline-flex w-full justify-center items-center rounded-xl px-6 py-4 font-geist font-semibold text-base transition-all duration-300",
                          "bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-500 dark:to-pink-400",
                          "text-white shadow-lg shadow-purple-500/25 dark:shadow-purple-500/20",
                          "hover:shadow-xl hover:shadow-purple-500/35 dark:hover:shadow-purple-500/30",
                          "hover:scale-[1.02] active:scale-[0.98]",
                          "border border-purple-500/20 dark:border-purple-400/20",
                          plan.isPopular 
                            ? "ring-2 ring-purple-300 dark:ring-purple-400/30 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
                            : ""
                        )}
                      >
                        {plan.buttonText}
                      </Link>
                    </motion.div>
                    
                    <motion.p 
                      className="mt-6 text-xs leading-5 text-gray-500 dark:text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={cardInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      {plan.description}
                    </motion.p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
