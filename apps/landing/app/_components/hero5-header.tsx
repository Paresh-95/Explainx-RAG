'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown, ArrowRight, ChevronsUp, Calendar, Clock, Mail, User, Star } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import React, { useState } from 'react'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { cn } from '@repo/ui/lib/utils'
import { ModeToggle } from './mode-toggle'

// Popup Dialog Component using shadcn/ui
const PopupDialog = ({
    isOpen,
    onClose,
    onEmailSubmit
}: {
    isOpen: boolean;
    onClose: () => void;
    onEmailSubmit: (email: string, name: string) => Promise<void>;
}) => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !name) return;

        setIsSubmitting(true);
        try {
            await onEmailSubmit(email, name);
            // Save to localStorage to prevent showing again
            localStorage.setItem("popupShown", "true");
            // Close dialog after successful submission
            onClose();
        } catch (error) {
            console.error("Failed to submit email and name:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg border-0 shadow-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <DialogHeader className="text-center space-y-6 pb-2">
                    {/* Illustration/Icon */}
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <div className="relative">
                            <Star className="w-10 h-10 text-white" fill="currentColor" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                <span className="text-xs">✨</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            Get Exclusive Prompt Library!
                        </DialogTitle>
                        <DialogDescription className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                            Join thousands of developers and get access to our curated collection of AI prompts,
                            templates, and tutorials. Perfect for your Next.js and LLM projects!
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-11 py-3 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                        <Input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-11 py-3 text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting || !email || !name}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Getting your prompts...
                            </div>
                        ) : (
                            "Get Free Prompt Library"
                        )}
                    </Button>
                </form>

                {/* Benefits/Features */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>100+ curated AI prompts for developers</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Next.js & LLM integration templates</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Weekly updates with new prompts</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        No spam, unsubscribe anytime. We respect your privacy.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Define the navigation type
type DropdownItem = {
    name: string;
    href: string;
    description?: string;
    target?: string;
    badge?: string;
};

type NavigationItem = {
    name: string;
    href: string;
    hasDropdown: boolean;
    dropdownItems?: DropdownItem[];
};

const navigation: NavigationItem[] = [
    {
        name: "Services",
        href: "/#services",
        hasDropdown: false,
        dropdownItems: [
            {
                name: "Custom AI Agent Development",
                href: "/#services",
                description: "Build powerful AI agents tailored to your business needs"
            },
            {
                name: "AI Agent Training",
                href: "/#services",
                description: "Empower your team with cutting-edge AI development skills"
            },
            {
                name: "Generative AI Training",
                href: "/#services",
                description: "Master the fundamentals of modern generative AI",
                badge: "Popular"
            },
            {
                name: "Frontend Development",
                href: "/#services",
                description: "Create beautiful, intuitive interfaces for AI applications"
            },
            {
                name: "AI Consulting",
                href: "/#services",
                description: "Strategic guidance for successful AI implementation"
            }
        ]
    },
    {
        name: "Pricing",
        href: "/#pricing",
        hasDropdown: false
    },
    {
        name: "Tools",
        href: "/tools",
        hasDropdown: true,
        dropdownItems: [
            {
                name: "AI Agent Finder",
                href: "/tools/ai-agent-finder",
                description: "Discover AI agents by use case and industry",
                badge: "Free"
            },
            {
                name: "All Tools",
                href: "/tools",
                description: "Explore our complete toolkit"
            }
        ]
    },
    {
        name: "Resources",
        href: "/resources",
        hasDropdown: true,
        dropdownItems: [
            { name: "Blog", href: "/blog", description: "Latest insights and tutorials" },
            { name: "Help Center", href: "/contact", description: "Get support when you need it" },
            { name: "Documentation", href: "/#faqs", target: "_blank", description: "Comprehensive guides and API docs" },
        ]
    }
];

// Animation variants
const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

const dropdownVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: -10,
        transition: {
            duration: 0.2
        }
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

const mobileMenuVariants = {
    hidden: {
        opacity: 0,
        height: 0,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    visible: {
        opacity: 1,
        height: "auto",
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
        }
    })
};


interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}


export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [scrolled, setScrolled] = React.useState(false)
    const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null)
    const [bannerVisible, setBannerVisible] = React.useState(true)
    const [timeLeft, setTimeLeft] = React.useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const [showPopup, setShowPopup] = React.useState(false)
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)


    const { scrollYProgress } = useScroll()

    React.useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (latest) => {
            setScrolled(latest > 0.02)
        })
        return () => unsubscribe()
    }, [scrollYProgress])

    const handleMouseEnter = (name: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        setActiveDropdown(name)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null)
        }, 200)
    }

    const handleDropdownMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }

    // Facebook Pixel tracking function
    const trackWorkshopEvent = (eventName: string) => {
        if (typeof window !== 'undefined' && window.fbq) {
            let eventData: Record<string, any> = {
                content_name: 'AI Prompt Library'
            };

            if (eventName === 'WorkshopBannerClosed' || eventName === 'Lead') {
                eventData = {
                    content_name: 'Prompt Engineering Workshop',
                    event_date: 'June 24, 2025',
                    event_time: '11:30 AM IST'
                };
            } else if (eventName === 'AccessNowClicked') {
                eventData = {
                    content_name: 'Access Now Button',
                    button_location: 'header_banner',
                    content_category: 'prompt_library'
                };
            }

            window.fbq('track', eventName, eventData);
            console.log('Facebook Pixel event tracked:', eventName, eventData);
        } else {
            console.warn('Facebook Pixel not available');
        }
    };


    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])


    const handleWorkshopJoinClick = () => {
        trackWorkshopEvent('Lead');
    };

    const handleBannerClose = () => {
        trackWorkshopEvent('WorkshopBannerClosed');
        setBannerVisible(false);
    };

    const handleAccessNowClick = () => {
        setShowPopup(true);
        trackWorkshopEvent('AccessNowClicked');
    };

    // Add this useEffect after your other useEffects
    React.useEffect(() => {
        // Target date: July 15, 2025, 11:30 AM IST (IST is UTC+5:30)
        const targetDate = new Date('2025-07-15T11:30:00+05:30');

        const updateTimer = () => {
            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();

            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                const seconds = Math.floor((diff / 1000) % 60);
                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        updateTimer(); // Initial call
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.header
            className="relative z-50"
            variants={navVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.nav
                data-state={menuState ? 'active' : ''}
                className={cn(
                    'fixed top-0 w-full transition-all duration-500 ease-out z-40',
                    scrolled
                        ? 'bg-white/80 border-b border-gray-200/50 shadow-sm backdrop-blur-xl dark:bg-[#21172a] dark:border-gray-800/50'
                        : 'bg-transparent'
                )}
                style={{
                    backgroundColor: scrolled
                        ? ''
                        : 'transparent'
                }}
                transition={{ duration: 0.3 }}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-18">

                        {/* Logo */}
                        <div className="flex items-center">
                            <Link
                                href="/"
                                className="flex items-center space-x-2 group">
                                <div className="flex items-center space-x-1">
                                    <div className="relative">
                                        {/* Logo image for light and dark mode */}
                                        <span className="block dark:hidden">
                                            <img
                                                src="/assets/logo-light.png"
                                                alt="ExplainX Logo"
                                                className="w-10 h-10"
                                                width={40}
                                                height={40}
                                            />
                                        </span>
                                        <span className="hidden dark:block">
                                            <img
                                                src="/assets/logo-dark.png"
                                                alt="ExplainX Logo"
                                                className="w-10 h-10"
                                                width={40}
                                                height={40}
                                            />
                                        </span>
                                        {/* Optionally keep the ChevronsUp icon for legacy/transition */}
                                        {/* <ChevronsUp className="w-8 h-8 text-blue-600 dark:text-blue-400 transform rotate-45" /> */}
                                    </div>
                                    <span className="text-xl font-semibold font-cal bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                        ExplainX
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex lg:items-center lg:space-x-2">
                            {navigation.map((item, index) => (
                                <div
                                    key={index}
                                    className="relative group"
                                    onMouseEnter={() => item.hasDropdown && handleMouseEnter(item.name)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                                                "text-gray-700 hover:text-gray-900 hover:bg-gray-100/80",
                                                "dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/80"
                                            )}
                                        >
                                            <span>{item.name}</span>
                                            {item.hasDropdown && (
                                                <motion.div
                                                    animate={{ rotate: activeDropdown === item.name ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <ChevronDown className="ml-1 w-4 h-4" />
                                                </motion.div>
                                            )}
                                        </Link>
                                    </motion.div>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {item.hasDropdown && item.dropdownItems && activeDropdown === item.name && (
                                            <motion.div
                                                className={cn(
                                                    "absolute top-full left-0 mt-2 w-80 rounded-xl shadow-xl border overflow-hidden z-30",
                                                    "bg-white border-gray-200 dark:bg-[#171717] dark:border-gray-800"
                                                )}
                                                variants={dropdownVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="hidden"
                                                onMouseEnter={handleDropdownMouseEnter}
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                <div className="p-2">
                                                    {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                                                        <motion.div
                                                            key={dropdownIndex}
                                                            custom={dropdownIndex}
                                                            variants={itemVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            whileHover={{ x: 4 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                        >
                                                            <Link
                                                                href={dropdownItem.href}
                                                                target={dropdownItem.target}
                                                                className={cn(
                                                                    "group flex items-start p-3 rounded-lg transition-all duration-150",
                                                                    "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                                )}
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center">
                                                                        <span className={cn(
                                                                            "font-medium transition-colors duration-150",
                                                                            "text-gray-900 group-hover:text-blue-600",
                                                                            "dark:text-gray-100 dark:group-hover:text-blue-400"
                                                                        )}>
                                                                            {dropdownItem.name}
                                                                        </span>
                                                                        {dropdownItem.badge && (
                                                                            <motion.span
                                                                                className={cn(
                                                                                    "ml-2 px-2 py-0.5 text-xs font-medium rounded-full",
                                                                                    dropdownItem.badge === "Popular" && "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
                                                                                    dropdownItem.badge === "Free" && "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                                                                )}
                                                                                whileHover={{ scale: 1.1 }}
                                                                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                                            >
                                                                                {dropdownItem.badge}
                                                                            </motion.span>
                                                                        )}
                                                                    </div>
                                                                    {dropdownItem.description && (
                                                                        <p className={cn(
                                                                            "mt-1 text-sm transition-colors duration-150",
                                                                            "text-gray-500 group-hover:text-gray-600",
                                                                            "dark:text-gray-400 dark:group-hover:text-gray-300"
                                                                        )}>
                                                                            {dropdownItem.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <motion.div
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    whileHover={{ opacity: 1, x: 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <ArrowRight className={cn(
                                                                        "w-4 h-4 transition-colors duration-150",
                                                                        "text-gray-400 group-hover:text-blue-600",
                                                                        "dark:text-gray-500 dark:group-hover:text-blue-400"
                                                                    )} />
                                                                </motion.div>
                                                            </Link>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        {/* Desktop CTA & Theme Toggle */}
                        <div className="hidden lg:flex lg:items-center lg:space-x-3">
                            <ModeToggle />
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "transition-colors duration-200",
                                        "text-gray-700 hover:text-gray-900 hover:bg-gray-100/80",
                                        "dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/10"
                                    )}
                                    asChild
                                >
                                    <Link href="https://explainx.ai/waitlist">Sign in</Link>
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    size="sm"
                                    className={cn(
                                        "rounded-xl px-5 text-base bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-500 dark:to-pink-400 text-white shadow-lg shadow-purple-500/25 dark:shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/35 dark:hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] border border-purple-500/20 dark:border-purple-400/20"
                                    )}
                                    asChild
                                >
                                    <Link href="https://explainx.ai/waitlist" className="flex items-center ">
                                        Get Started
                                        <motion.div
                                            animate={{ x: [0, 3, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <ArrowRight className="ml-1 w-4 h-4" />
                                        </motion.div>
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="lg:hidden flex items-center space-x-2">
                            <ModeToggle />
                            <motion.button
                                onClick={() => setMenuState(!menuState)}
                                className={cn(
                                    "p-2 rounded-lg transition-colors duration-200",
                                    "text-gray-700 hover:text-gray-900 hover:bg-gray-100/80",
                                    "dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/80"
                                )}
                                aria-label={menuState ? 'Close menu' : 'Open menu'}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <motion.div
                                    animate={{ rotate: menuState ? 90 : 0, opacity: menuState ? 0 : 1 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ position: menuState ? 'absolute' : 'relative' }}
                                >
                                    <Menu className="w-6 h-6" />
                                </motion.div>
                                <motion.div
                                    animate={{ rotate: menuState ? 0 : -90, opacity: menuState ? 1 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ position: menuState ? 'relative' : 'absolute' }}
                                >
                                    <X className="w-6 h-6" />
                                </motion.div>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {menuState && (
                        <motion.div
                            className="lg:hidden overflow-hidden"
                            variants={mobileMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <div className={cn(
                                "border-t shadow-lg",
                                "bg-white/95 backdrop-blur-xl border-gray-200/50",
                                "dark:bg-[#171717]/95 dark:border-gray-800/50"
                            )}>
                                <div className="px-4 py-6 space-y-6">
                                    {/* Mobile Navigation Links */}
                                    <div className="space-y-4">
                                        {navigation.map((item, index) => (
                                            <motion.div
                                                key={index}
                                                custom={index}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                            >
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "block px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200",
                                                        "text-gray-700 hover:text-blue-600 hover:bg-gray-100/80",
                                                        "dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800/80"
                                                    )}
                                                    onClick={() => !item.hasDropdown && setMenuState(false)}
                                                >
                                                    {item.name}
                                                </Link>

                                                {/* Mobile Dropdown Items */}
                                                {item.hasDropdown && item.dropdownItems && (
                                                    <motion.div
                                                        className="ml-4 mt-2 space-y-2"
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        transition={{ delay: 0.1 * index }}
                                                    >
                                                        {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                                                            <motion.div
                                                                key={dropdownIndex}
                                                                whileHover={{ x: 4 }}
                                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                            >
                                                                <Link
                                                                    href={dropdownItem.href}
                                                                    target={dropdownItem.target}
                                                                    className={cn(
                                                                        "block px-3 py-2 text-sm rounded-lg border-l-2 transition-all duration-200",
                                                                        "text-gray-600 hover:text-blue-600 hover:bg-gray-100/80 border-gray-200 hover:border-blue-300",
                                                                        "dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800/80 dark:border-gray-700 dark:hover:border-blue-500"
                                                                    )}
                                                                    onClick={() => setMenuState(false)}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <span>{dropdownItem.name}</span>
                                                                        {dropdownItem.badge && (
                                                                            <span className={cn(
                                                                                "ml-2 px-2 py-0.5 text-xs font-medium rounded-full",
                                                                                dropdownItem.badge === "Popular" && "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
                                                                                dropdownItem.badge === "Free" && "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                                                            )}>
                                                                                {dropdownItem.badge}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </Link>
                                                            </motion.div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Mobile CTA Buttons */}
                                    <motion.div
                                        className={cn(
                                            "pt-4 border-t space-y-3",
                                            "border-gray-200 dark:border-gray-800"
                                        )}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full justify-center"
                                            asChild
                                        >
                                            <Link href="/login">Sign in</Link>
                                        </Button>
                                        <Button
                                            className={cn(
                                                "w-full justify-center text-white",
                                                "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                                                "dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700"
                                            )}
                                            asChild
                                        >
                                            <Link href="/contact" className="flex items-center">
                                                Get Started
                                                <ArrowRight className="ml-2 w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {bannerVisible && (
                <div className="fixed top-[65px] left-0 right-0 z-[19] bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white shadow-lg">
                    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
                        <div className="block sm:hidden py-2">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium">Unlock the power of AI with 100 expertly crafted prompts, absolutely free! Perfect for creators, developers, and innovators.</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        size="sm"
                                        onClick={handleAccessNowClick}
                                        className="h-7 px-2 py-0 bg-white text-purple-600 hover:bg-purple-50 font-medium text-xs rounded-md shadow-sm"
                                    >
                                        Access Now
                                    </Button>
                                    <button
                                        onClick={handleBannerClose}
                                        className="p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                                        aria-label="Close banner"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center justify-between py-3 sm:py-2">
                            <div className="flex flex-row items-center space-x-4 flex-1 min-w-0">
                                <span className="text-sm font-medium">Unlock the power of AI with 100 expertly crafted prompts, absolutely free! Perfect for creators, developers, and innovators.</span>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0">
                                <Button
                                    size="sm"
                                    onClick={handleAccessNowClick}
                                    className="h-8 px-3 py-1 bg-white text-purple-600 hover:bg-purple-50 font-medium text-xs rounded-md shadow-sm"
                                >
                                    Access Now
                                </Button>
                                <button
                                    onClick={handleBannerClose}
                                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                    aria-label="Close banner"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    </div>
                </div>
            )}

            {/* Popup Dialog */}
            <PopupDialog
                isOpen={showPopup}
                onClose={() => setShowPopup(false)}
                onEmailSubmit={async (email, name) => {
                    // Track event
                    trackWorkshopEvent('PromptLibrarySignup');

                    try {
                        // Replace with your actual email collection API
                        const response = await fetch('/api/free-resource', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email,
                                name,
                                source: 'header-popup',
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to submit email and name');
                        }
                    } catch (error) {
                        console.error('Error submitting email and name:', error);
                        throw error;
                    }
                }}
            />
        </motion.header>
    )
}