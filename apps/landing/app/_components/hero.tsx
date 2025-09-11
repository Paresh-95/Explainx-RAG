"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Paperclip, Sparkles, FileText, MessageCircle, Brain } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { motion, type Variants } from 'framer-motion';
import { AnimatedGroup } from './animated-group';
import { TextEffect } from './text-effect';

// Animation variants
const transitionVariants = {
    container: {},
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: "spring" as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
};

const staggerContainerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const fadeInUpVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        filter: 'blur(4px)',
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            type: 'spring',
            bounce: 0.3,
            duration: 0.8,
        },
    },
};

const HeroSection = () => {
    return (
        <div className="relative py-20 md:py-32 bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-950 dark:to-gray-900 overflow-hidden">
            {/* Animated Background Gradients */}
            <motion.div
                className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 dark:from-blue-800/20 dark:to-purple-800/20 rounded-full blur-3xl"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 dark:from-purple-800/20 dark:to-pink-800/20 rounded-full blur-3xl"
                animate={{
                    x: [0, -100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5,
                }}
            />

            <motion.div
                className="flex gap-[10rem] rotate-[-20deg] absolute top-[-50rem] right-[-50rem] z-[0] blur-[4rem] skew-[-40deg] opacity-30 dark:opacity-50"
                animate={{
                    x: [0, -15, 0],
                    y: [0, 15, 0],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                }}
            >
                <div className="w-[10rem] h-[20rem] bg-gradient-to-b from-purple-400 to-purple-600 dark:from-white dark:to-purple-300"></div>
                <div className="w-[10rem] h-[20rem] bg-gradient-to-b from-purple-400 to-purple-600 dark:from-white dark:to-purple-300"></div>
                <div className="w-[10rem] h-[20rem] bg-gradient-to-b from-purple-400 to-purple-600 dark:from-white dark:to-purple-300"></div>
            </motion.div>

            <motion.div
                className="flex gap-[10rem] rotate-[-20deg] absolute top-[-60rem] right-[-60rem] z-[0] blur-[4rem] skew-[-40deg] opacity-30 dark:opacity-50"
                animate={{
                    x: [0, 10, 0],
                    y: [0, -20, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
            >
                <div className="w-[10rem] h-[30rem] bg-gradient-to-b from-indigo-400 to-indigo-600 dark:from-white dark:to-indigo-300"></div>
                <div className="w-[10rem] h-[30rem] bg-gradient-to-b from-indigo-400 to-indigo-600 dark:from-white dark:to-indigo-300"></div>
                <div className="w-[10rem] h-[30rem] bg-gradient-to-b from-indigo-400 to-indigo-600 dark:from-white dark:to-indigo-300"></div>
            </motion.div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 text-center relative pt-24 md:pt-36">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Announcement Badge */}
                    <AnimatedGroup variants={transitionVariants}>
                        <Link
                            href="#features"
                            className="hover:bg-slate-100 dark:hover:bg-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm group mx-auto flex w-fit items-center gap-4 rounded-full border border-slate-200 dark:border-gray-600 p-1 pl-4 shadow-lg transition-all duration-300"
                        >
                            <span className="text-sm flex items-center gap-2 text-slate-700 dark:text-gray-200">

                                Introducing Smart Document Analysis
                            </span>
                            <span className="block h-4 w-0.5 border-l bg-slate-300 dark:bg-gray-500"></span>
                            <div className="bg-slate-50 dark:bg-[#171717] group-hover:bg-slate-100 dark:group-hover:bg-gray-800 size-6 overflow-hidden rounded-full duration-500">
                                <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                    <span className="flex size-6">
                                        <ArrowRight className="m-auto size-3 text-slate-600 dark:text-gray-300" />
                                    </span>
                                    <span className="flex size-6">
                                        <ArrowRight className="m-auto size-3 text-slate-600 dark:text-gray-300" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </AnimatedGroup>

                    {/* Main Headline */}
                    <TextEffect
                        as="h1"
                        className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                        delay={0.3}
                    >
                        Chat with Your Documents Like Never Before
                    </TextEffect>

                    {/* Subtitle */}
                    <TextEffect
                        as="p"
                        className="text-lg md:text-xl text-slate-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
                        delay={0.6}
                    >
                        Transform your study sessions with AI-powered document conversations. Upload PDFs, ask questions, and get instant insights from your course materials.
                    </TextEffect>

                    {/* Search/Chat Interface */}
                    <AnimatedGroup variants={transitionVariants} >
                        <div className="relative max-w-2xl mx-auto w-full">
                            <motion.div
                                className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-3 flex items-center border border-slate-200 dark:border-gray-600 shadow-xl"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <motion.button
                                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Paperclip className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                                </motion.button>
                                <motion.button
                                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"
                                    whileHover={{ scale: 1.1, rotate: 180 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                                </motion.button>
                                <input
                                    type="text"
                                    placeholder="Ask anything about your documents..."
                                    className="bg-transparent flex-1 outline-none text-slate-700 dark:text-gray-300 pl-4 placeholder-slate-400 dark:placeholder-gray-500"
                                />
                                <motion.button
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Ask AI
                                </motion.button>
                            </motion.div>
                        </div>
                    </AnimatedGroup>

                    {/* Action Buttons */}
                    <AnimatedGroup
                        variants={{
                            item: {
                                hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    filter: 'blur(0px)',
                                    transition: { type: 'spring', bounce: 0.3, duration: 0.8 }
                                }
                            }
                        }}
                    
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                asChild
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full text-base font-medium shadow-lg border-0"
                            >
                                <Link href="/signup" className="flex items-center">
                                    Start Learning for Free
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-gray-800 bg-white/80 dark:bg-transparent backdrop-blur-sm px-8 py-3 rounded-full text-base font-medium shadow-lg"
                            >
                                <Link href="/demo">
                                    Watch Demo
                                </Link>
                            </Button>
                        </motion.div>
                    </AnimatedGroup>

                    {/* Feature Pills */}
                    <AnimatedGroup
                        variants={{
                            item: {
                                hidden: { opacity: 0, scale: 0.8, y: 20 },
                                visible: {
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                    transition: { type: 'spring', bounce: 0.4, duration: 0.6 }
                                }
                            }
                        }}
                      
                        className="flex flex-wrap justify-center gap-3 mt-8 max-w-3xl mx-auto"
                    >
                        <motion.button
                            className="bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-slate-200 dark:border-gray-600 flex items-center gap-2 transition-all shadow-md text-slate-700 dark:text-gray-200"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                            Analyze Research Papers
                        </motion.button>

                        <motion.button
                            className="bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-slate-200 dark:border-gray-600 flex items-center gap-2 transition-all shadow-md text-slate-700 dark:text-gray-200"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <MessageCircle className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                            Ask Study Questions
                        </motion.button>

                        <motion.button
                            className="bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-slate-200 dark:border-gray-600 flex items-center gap-2 transition-all shadow-md text-slate-700 dark:text-gray-200"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Brain className="w-4 h-4 text-green-500 dark:text-green-400" />
                            Generate Summaries
                        </motion.button>

                        <motion.button
                            className="bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-slate-200 dark:border-gray-600 transition-all shadow-md text-slate-700 dark:text-gray-200"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Create Flashcards
                        </motion.button>

                        <motion.button
                            className="bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-slate-200 dark:border-gray-600 transition-all shadow-md text-slate-700 dark:text-gray-200"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Exam Preparation
                        </motion.button>
                    </AnimatedGroup>

                    {/* Stats or Social Proof */}
                    <AnimatedGroup
                        variants={{
                            item: {
                                hidden: { opacity: 0, y: 20 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.6 }
                                }
                            }
                        }}
                        // Removed invalid 'delay' prop (not supported by AnimatedGroup)
                        className="flex items-center justify-center gap-8 text-sm text-slate-500 dark:text-gray-400 mt-12 pb-20"
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700 dark:text-white">50K+</span>
                            <span>Students</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-400 dark:bg-gray-600 rounded-full"></div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700 dark:text-white">1M+</span>
                            <span>Documents Analyzed</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-400 dark:bg-gray-600 rounded-full"></div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700 dark:text-white">98%</span>
                            <span>Accuracy Rate</span>
                        </div>
                    </AnimatedGroup>
                </div>
            </main>
        </div>
    );
};

export { HeroSection };