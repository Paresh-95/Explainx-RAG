"use client";

import React, { useState } from 'react';
import { motion, type Variants, useInView } from 'framer-motion';
import {
    FileText,
    MessageCircle,
    Brain,
    CreditCard,
    HelpCircle,
    GraduationCap,
    Youtube,
    Globe,
    Mic,
    BookOpen,
    Zap,
    Users,
    ArrowUpRight,
    Play,
    Pause,
    Volume2,
    Download,
    Share,
    Star,
    CheckCircle,
    TrendingUp,
    ChevronRight,
    Building2,
    Shield,
    BarChart3,
    Clock
} from 'lucide-react';

const BentoGrid = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(65);

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 40,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 0.8,
            },
        },
    };

    // Chat Interface Component
    const ChatInterface = () => {
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, margin: "-100px" });

        const messages = [
            { type: 'user', text: 'What are our Q3 performance metrics across departments?', time: '2:34 PM' },
            { type: 'ai', text: 'Based on your organization\'s data, Q3 performance metrics show Sales up 12%, Marketing ROI improved 18%, and Operations efficiency increased 15%. Would you like me to generate detailed insights for specific departments?', time: '2:34 PM' },
            { type: 'user', text: 'Create an intelligence brief for the leadership team', time: '2:35 PM' }
        ];

        return (
            <div ref={ref} className="h-full flex flex-col">
                <div className="flex-1 space-y-3 overflow-hidden">
                    {messages.map((message, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                            transition={{ delay: i * 0.3, duration: 0.5 }}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] p-3 rounded-2xl font-geist ${message.type === 'user'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                                : 'bg-gradient-to-tr from-zinc-300/20 via-gray-400/20 to-transparent border border-black/5 dark:border-white/5 text-gray-900 dark:text-white'
                                }`}>
                                <p className="text-sm">{message.text}</p>
                                <span className="text-xs opacity-70 mt-1 block">{message.time}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
                <motion.div
                    className="flex items-center gap-2 p-3 bg-gradient-to-tr from-zinc-300/20 via-gray-400/20 to-transparent border border-black/5 dark:border-white/5 rounded-xl font-geist"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">AI is typing...</span>
                </motion.div>
            </div>
        );
    };

    // Document Analysis Component
    const DocumentAnalysis = () => {
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, margin: "-100px" });

        return (
            <div ref={ref} className="h-full flex flex-col">
                <motion.div
                    className="flex items-center gap-3 mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-10 h-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="font-geist">
                        <h4 className="font-semibold text-sm">Quarterly_Report.pdf</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">2.8 MB • 45 pages</p>
                    </div>
                </motion.div>

                <div className="space-y-3 flex-1">
                    <motion.div
                        className="p-3 bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent border border-purple-300/20 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <h5 className="text-sm font-medium text-purple-700 dark:text-purple-300 font-geist">Key Insights</h5>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Found 18 strategic metrics</p>
                    </motion.div>

                    <motion.div
                        className="p-3 bg-gradient-to-tr from-zinc-300/20 via-green-400/30 to-transparent border border-green-300/20 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <h5 className="text-sm font-medium text-green-700 dark:text-green-300 font-geist">Training Ready</h5>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">8 modules generated</p>
                    </motion.div>
                </div>

                <motion.div
                    className="mt-4 grid grid-cols-3 gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                >
                    {['Assessment', 'Training', 'Summary'].map((item, i) => (
                        <motion.button
                            key={item}
                            className="p-2 bg-gradient-to-tr from-zinc-300/20 via-gray-400/20 to-transparent border border-black/5 dark:border-white/5 rounded-lg text-xs font-medium font-geist hover:from-zinc-300/30 hover:via-purple-400/40 hover:to-transparent transition-all"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                            transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            {item}
                        </motion.button>
                    ))}
                </motion.div>
            </div>
        );
    };

    // Audio Player Component
    const AudioPlayer = () => {
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, margin: "-100px" });

        return (
            <div ref={ref} className="h-full flex flex-col justify-between">
                <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, y: -20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-geist">
                        <h4 className="font-semibold text-sm">Q4 Analytics Report</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Learning Metrics</p>
                    </div>
                </motion.div>

                <div className="space-y-4">
                    <motion.div
                        className="grid grid-cols-2 gap-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <div className="p-3 bg-gradient-to-tr from-zinc-300/20 via-blue-400/30 to-transparent border border-blue-300/20 rounded-lg text-center">
                            <div className="text-lg font-bold text-blue-700 dark:text-blue-300 font-geist">94%</div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">Completion Rate</div>
                        </div>
                        <div className="p-3 bg-gradient-to-tr from-zinc-300/20 via-green-400/30 to-transparent border border-green-300/20 rounded-lg text-center">
                            <div className="text-lg font-bold text-green-700 dark:text-green-300 font-geist">87%</div>
                            <div className="text-xs text-green-600 dark:text-green-400">Satisfaction</div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="p-3 bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent border border-purple-300/20 rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium font-geist">Monthly Progress</span>
                            <span className="text-xs text-purple-600 dark:text-purple-400">+12%</span>
                        </div>
                        <div className="w-full bg-gray-300/30 dark:bg-gray-700/30 rounded-full h-2">
                            <motion.div
                                className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full"
                                initial={{ width: "0%" }}
                                animate={isInView ? { width: "78%" } : { width: "0%" }}
                                transition={{ duration: 1, delay: 0.8 }}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        className="flex gap-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ delay: 1, duration: 0.5 }}
                    >
                        <span className="text-xs bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent border border-purple-300/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-geist">
                            Real-time
                        </span>
                        <span className="text-xs bg-gradient-to-tr from-zinc-300/20 via-green-400/30 to-transparent border border-green-300/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-geist">
                            Automated
                        </span>
                    </motion.div>
                </div>
            </div>
        );
    };

    // Flashcard Component
    const FlashcardDemo = () => {
        const [flipped, setFlipped] = useState(false);
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, margin: "-100px" });

        return (
            <div ref={ref} className="h-full flex flex-col">
                <motion.div
                    className="flex items-center justify-between mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium font-geist">Training Module 3/12</span>
                    </div>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className={`w-3 h-3 ${i <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    className="flex-1 cursor-pointer perspective-1000"
                    onClick={() => setFlipped(!flipped)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <motion.div
                        className="w-full h-full relative preserve-3d"
                        animate={{ rotateY: flipped ? 180 : 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl p-4 flex items-center justify-center text-white">
                            <div className="text-center font-geist">
                                <h3 className="text-lg font-bold mb-2">What are our key performance indicators this quarter?</h3>
                                <p className="text-sm opacity-80">Click to reveal analysis</p>
                            </div>
                        </div>
                        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-4 flex items-center justify-center text-white transform rotateY-180">
                            <div className="text-center font-geist">
                                <h3 className="text-lg font-bold mb-2">Intelligence Summary</h3>
                                <p className="text-sm">Revenue up 15%, satisfaction at 94%, efficiency improved 12%. Strategic insights ready for review.</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="flex gap-2 mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <motion.button
                        className="flex-1 py-2 bg-gradient-to-tr from-zinc-300/20 via-red-400/30 to-transparent border border-red-300/20 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium font-geist"
                        whileTap={{ scale: 0.95 }}
                    >
                        Need Review
                    </motion.button>
                    <motion.button
                        className="flex-1 py-2 bg-gradient-to-tr from-zinc-300/20 via-green-400/30 to-transparent border border-green-300/20 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium font-geist"
                        whileTap={{ scale: 0.95 }}
                    >
                        Understood
                    </motion.button>
                </motion.div>
            </div>
        );
    };

    // Progress Stats Component
    const ProgressStats = () => {
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, margin: "-100px" });

        return (
            <div ref={ref} className="h-full">
                <motion.div
                    className="flex items-center gap-2 mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                >
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold font-geist">Team Performance</h3>
                </motion.div>

                <div className="space-y-4">
                    {[
                        { subject: 'Compliance Training', progress: 85, color: 'from-purple-600 to-pink-500' },
                        { subject: 'Leadership Development', progress: 72, color: 'from-green-500 to-teal-500' },
                        { subject: 'Technical Skills', progress: 94, color: 'from-blue-500 to-indigo-500' }
                    ].map((item, i) => (
                        <motion.div
                            key={item.subject}
                            initial={{ opacity: 0, x: -20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                            transition={{ delay: 0.2 + i * 0.2, duration: 0.5 }}
                        >
                            <div className="flex justify-between text-sm mb-2 font-geist">
                                <span>{item.subject}</span>
                                <span className="font-medium">{item.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-300/30 dark:bg-gray-700/30 rounded-full h-2">
                                <motion.div
                                    className={`bg-gradient-to-r ${item.color} h-2 rounded-full`}
                                    initial={{ width: "0%" }}
                                    animate={isInView ? { width: `${item.progress}%` } : { width: "0%" }}
                                    transition={{ duration: 1, delay: 0.4 + i * 0.2 }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className="mt-6 grid grid-cols-2 gap-4 font-geist"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">247</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Training Hours</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-pink-500">1,256</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Employees Trained</div>
                    </div>
                </motion.div>
            </div>
        );
    };

    // YouTube Learning Component
    const YouTubeLearning = () => {
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, margin: "-100px" });

        return (
            <div ref={ref} className="h-full">
                <motion.div
                    className="relative mb-4 rounded-xl overflow-hidden bg-black"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                        <motion.div
                            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Play className="w-6 h-6 text-white ml-1" />
                        </motion.div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <h4 className="text-white font-medium text-sm font-geist">Corporate Training Webinar</h4>
                        <p className="text-white/80 text-xs">Leadership Development Series</p>
                    </div>
                </motion.div>

                <div className="space-y-2">
                    {[
                        { text: 'Content analyzed', color: 'purple' },
                        { text: 'Modules created', color: 'green' },
                        { text: 'Assessment ready', color: 'pink' }
                    ].map((item, i) => (
                        <motion.div
                            key={item.text}
                            className={`flex items-center gap-2 p-2 bg-gradient-to-tr from-zinc-300/20 via-${item.color}-400/30 to-transparent border border-${item.color}-300/20 rounded-lg`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                            transition={{ delay: 0.3 + i * 0.2, duration: 0.5 }}
                        >
                            <CheckCircle className={`w-4 h-4 text-${item.color}-600`} />
                            <span className="text-sm font-geist">{item.text}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    };

    const StudySpaces = () => {
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, margin: "-100px" });

        return (
            <div ref={ref} className="h-full">
                <motion.div
                    className="flex items-center gap-2 mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                >
                    <Globe className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold font-geist">Department Workspaces</h3>
                </motion.div>

                <div className="space-y-3">
                    {[
                        { title: 'HR & Compliance', docs: '24 docs', colors: ['bg-purple-500', 'bg-green-500', 'bg-pink-500'], time: '2 hours ago' },
                        { title: 'Engineering', docs: '18 docs', colors: ['bg-blue-500', 'bg-cyan-500'], time: '1 day ago' },
                        { title: 'Sales & Marketing', docs: '32 docs', colors: ['bg-pink-500', 'bg-red-500', 'bg-orange-500', 'bg-purple-500'], time: '3 hours ago' }
                    ].map((space, i) => (
                        <motion.div
                            key={space.title}
                            className="p-3 bg-gradient-to-tr from-zinc-300/20 via-gray-400/20 to-transparent border border-black/5 dark:border-white/5 rounded-xl hover:from-zinc-300/30 hover:via-purple-400/40 hover:to-transparent transition-all"
                            initial={{ opacity: 0, y: 10 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                            transition={{ delay: 0.2 + i * 0.2, duration: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm font-geist">{space.title}</h4>
                                <span className="text-xs bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent border border-purple-300/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-geist">
                                    {space.docs}
                                </span>
                            </div>
                            <div className="flex gap-1 mb-2">
                                {space.colors.map((color, j) => (
                                    <div key={j} className={`w-1.5 h-1.5 ${color} rounded-full`}></div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Last updated {space.time}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.button
                    className="w-full mt-4 p-2 border-2 border-dashed border-gray-400/30 dark:border-gray-600/30 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-geist"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    + Create New Department
                </motion.button>
            </div>
        );
    };

    // AI Exam Creator Component
    const AIExamCreator = () => {
        const [examProgress, setExamProgress] = useState(0);
        const [isGenerating, setIsGenerating] = useState(false);
        const ref = React.useRef(null);
        const isInView = useInView(ref, { once: true, margin: "-100px" });

        const startGeneration = () => {
            setIsGenerating(true);
            const interval = setInterval(() => {
                setExamProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setIsGenerating(false);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 200);
        };

        return (
            <div ref={ref} className="h-full">
                <motion.div
                    className="flex items-center gap-2 mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                >
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold font-geist">Compliance Testing</h3>
                </motion.div>

                <div className="space-y-4">
                    <motion.div
                        className="p-3 bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent border border-purple-300/20 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <h4 className="font-medium text-sm mb-2 font-geist">Next Assessment</h4>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Data Security Compliance</span>
                            <span className="text-xs bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent border border-purple-300/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-geist">
                                20 questions
                            </span>
                        </div>
                    </motion.div>

                    {isGenerating ? (
                        <motion.div
                            className="space-y-3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex justify-between text-sm font-geist">
                                <span>Generating assessment...</span>
                                <span className="font-medium">{examProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-300/30 dark:bg-gray-700/30 rounded-full h-2">
                                <motion.div
                                    className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${examProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </motion.div>
                    ) : examProgress === 100 ? (
                        <motion.div
                            className="p-3 bg-gradient-to-tr from-zinc-300/20 via-green-400/30 to-transparent border border-green-300/20 rounded-xl"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700 dark:text-green-300 font-geist">Assessment Ready!</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs font-geist">
                                <div className="text-center">
                                    <div className="font-bold text-green-600">12</div>
                                    <div className="text-gray-600 dark:text-gray-400">MCQ</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-purple-600">5</div>
                                    <div className="text-gray-600 dark:text-gray-400">T/F</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-pink-500">3</div>
                                    <div className="text-gray-600 dark:text-gray-400">Scenario</div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <span className="relative inline-block overflow-hidden rounded-xl p-[1.5px] w-full">
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                <motion.button
                                    onClick={startGeneration}
                                    className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-white dark:bg-gray-950 text-sm font-medium backdrop-blur-3xl"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="inline-flex rounded-xl text-center group items-center w-full justify-center bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent text-gray-900 dark:text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/30 hover:via-purple-400/40 hover:to-transparent transition-all py-3 px-6 font-geist">
                                        Generate Compliance Assessment
                                    </div>
                                </motion.button>
                            </span>
                        </motion.div>
                    )}

                    <motion.div
                        className="grid grid-cols-2 gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        <div className="p-2 bg-gradient-to-tr from-zinc-300/20 via-gray-400/20 to-transparent border border-black/5 dark:border-white/5 rounded-lg text-center">
                            <div className="text-sm font-bold text-purple-600 font-geist">98%</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Pass Rate</div>
                        </div>
                        <div className="p-2 bg-gradient-to-tr from-zinc-300/20 via-gray-400/20 to-transparent border border-black/5 dark:border-white/5 rounded-lg text-center">
                            <div className="text-sm font-bold text-pink-500 font-geist">156</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Employees</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    };

    const bentoItems = [
        {
            id: 1,
            title: "Enterprise AI Chat",
            description: "Deploy AI assistants for employee knowledge queries",
            component: <ChatInterface />,
            className: "md:col-span-2 md:row-span-2"
        },
        {
            id: 2,
            title: "Document Intelligence",
            description: "Transform company documents into searchable knowledge",
            component: <DocumentAnalysis />,
            className: "md:col-span-1 md:row-span-2"
        },
        {
            id: 3,
            title: "Training Modules",
            description: "AI-generated training content from your materials",
            component: <FlashcardDemo />,
            className: "md:col-span-1 md:row-span-1"
        },
        {
            id: 4,
            title: "Learning Analytics",
            description: "Track employee progress and skill development",
            component: <AudioPlayer />,
            className: "md:col-span-1 md:row-span-1"
        },
        {
            id: 5,
            title: "Content Integration",
            description: "Seamlessly integrate with existing training materials",
            component: <YouTubeLearning />,
            className: "md:col-span-1 md:row-span-1"
        },
        {
            id: 6,
            title: "Performance Metrics",
            description: "Real-time insights into team learning outcomes",
            component: <ProgressStats />,
            className: "md:col-span-1 md:row-span-1"
        },
        {
            id: 7,
            title: "Compliance Testing",
            description: "Automated assessments for regulatory requirements",
            component: <AIExamCreator />,
            className: "md:col-span-1 md:row-span-1"
        },
        {
            id: 8,
            title: "Department Workspaces",
            description: "Organized learning environments by team or function",
            component: <StudySpaces />,
            className: "md:col-span-1 md:row-span-1"
        }
    ];

    return (
        <section className="relative w-full mx-auto py-28 bg-white dark:bg-[#21112E]">
            {/* Background Effects */}

            <div className="container z-10 mx-auto px-4 gap-12 md:px-8 relative">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="inline-flex items-center gap-2 bg-gradient-to-tr from-zinc-300/20 via-gray-400/20 to-transparent border-[2px] border-black/5 dark:border-white/5 rounded-3xl px-5 py-2 mb-6 font-geist text-sm text-gray-600 dark:text-gray-400 group mx-auto w-fit"
                    >
                        <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium">
                            Intelligence Solutions
                        </span>
                        <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-4xl font-cal tracking-tighter font-geist bg-clip-text text-transparent mx-auto md:text-6xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] mb-6"
                    >
                        Transform Your{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200">
                            Organization
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 font-geist"
                    >
                        Harness your organization's collective intelligence with AI-powered insights that connect data, knowledge, and decision-makers for smarter business outcomes.
                    </motion.p>
                </motion.div>

                {/* Bento Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]"
                >
                    {bentoItems.map((item) => (
                        <motion.div
                            key={item.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className={`
                                ${item.className} group relative overflow-hidden
                                bg-gradient-to-tr from-zinc-300/20 via-gray-400/20 to-transparent
                                border-[2px] border-black/5 dark:border-white/5
                                rounded-2xl lg:rounded-3xl p-6 lg:p-8
                                hover:from-zinc-300/30 hover:via-purple-400/40 hover:to-transparent
                                transition-all duration-500
                                backdrop-blur-3xl
                            `}
                        >
                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col">
                                {/* Header */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white font-geist">
                                            {item.title}
                                        </h3>
                                        <motion.div
                                            className="w-8 h-8 bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent border border-purple-300/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            whileHover={{ scale: 1.1, rotate: 45 }}
                                        >
                                            <ArrowUpRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        </motion.div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 font-geist">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Interactive Component */}
                                <div className="flex-1">
                                    {item.component}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default BentoGrid;