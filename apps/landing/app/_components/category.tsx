"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Heart,
    ShoppingCart,
    Shield,
    GraduationCap,
    Factory,
    Tv,
    Cpu,
    ChevronRight
} from 'lucide-react';

const CategorySection = () => {
    const categories = [
        {
            title: "Financial Services",
            description: "Transform your institution with data-driven insights",
            icon: Building2,
            color: "from-blue-600 to-indigo-600"
        },
        {
            title: "Healthcare",
            description: "Improve patient outcomes with powerful healthcare analytics",
            icon: Heart,
            color: "from-red-500 to-pink-500"
        },
        {
            title: "Retail",
            description: "Free your data to transform your retail business",
            icon: ShoppingCart,
            color: "from-green-500 to-emerald-500"
        },
        {
            title: "Government",
            description: "Modern analytics for government.",
            icon: Shield,
            color: "from-purple-600 to-violet-600"
        },
        {
            title: "Education",
            description: "Turn education data into better outcomes for students and staff",
            icon: GraduationCap,
            color: "from-orange-500 to-amber-500"
        },
        {
            title: "Manufacturing",
            description: "Turn manufacturing data into better outcomes for operations and supply chains",
            icon: Factory,
            color: "from-gray-600 to-slate-600"
        },
        {
            title: "Media & Entertainment",
            description: "Turn audience data into better outcomes for content and engagement",
            icon: Tv,
            color: "from-pink-500 to-rose-500"
        },
        {
            title: "Technology",
            description: "Turn product and customer data into better outcomes for growth and innovation",
            icon: Cpu,
            color: "from-cyan-500 to-teal-500"
        }
    ];

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
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

    return (
        <section className="relative py-24 bg-white dark:bg-[#1F1328] overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-indigo-50/30 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-indigo-900/10" />
            <div className="absolute top-0 left-0 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl -translate-x-32 -translate-y-32" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl translate-x-32 translate-y-32" />

            <div className="relative max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl font-cal tracking-tighter font-geist bg-clip-text text-transparent mx-auto md:text-6xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] mb-6"
                    >
                        Built to meet you{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200">
                            where you are
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-300 font-geist"
                    >
                        Our tools are designed with flexibility and versatility at their core, adapting to your unique roles, industries, and needs.
                    </motion.p>
                </motion.div>

                {/* Categories Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.title}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                        >
                            <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <category.icon className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-bold text-gray-900 dark:text-white font-geist group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                                    {category.title}
                                </h3>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 font-geist leading-relaxed">
                                {category.description}
                            </p>

                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Call to Action */}

            </div>
        </section>
    );
};

export default CategorySection;
