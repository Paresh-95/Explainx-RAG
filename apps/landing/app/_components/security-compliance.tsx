"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Lock,
    FileCheck,
    Eye,
    Users,
    AlertTriangle,
    Database,
    CheckCircle,
    Globe,
    Clock,
    Activity,
    Key
} from 'lucide-react';

const SecurityCompliance = () => {
    const certifications = [
        {
            name: "SOC 2 Type II",
            description: "Independently audited security controls",
            icon: Shield,
            status: "Certified"
        },
        {
            name: "ISO 27001",
            description: "International security management standard",
            icon: FileCheck,
            status: "Certified"
        },
        {
            name: "GDPR Compliant",
            description: "EU data protection regulation compliance",
            icon: Lock,
            status: "Compliant"
        },
        {
            name: "HIPAA Ready",
            description: "Healthcare data protection standards",
            icon: Database,
            status: "Ready"
        }
    ];

    const securityFeatures = [
        {
            title: "End-to-End Encryption",
            description: "All data encrypted in transit and at rest using AES-256",
            icon: Lock,
            color: "from-blue-600 to-cyan-500"
        },
        {
            title: "Role-Based Access Control",
            description: "Granular permissions for teams, departments, and external partners",
            icon: Users,
            color: "from-purple-600 to-pink-500"
        },
        {
            title: "Audit Logs & Monitoring",
            description: "Comprehensive activity tracking and real-time threat detection",
            icon: Eye,
            color: "from-green-600 to-teal-500"
        },
        {
            title: "Data Residency Control",
            description: "Choose specific regions for data storage and processing",
            icon: Globe,
            color: "from-orange-600 to-red-500"
        },
        {
            title: "Incident Response",
            description: "Automated alerts and rapid response protocols for security events",
            icon: AlertTriangle,
            color: "from-red-600 to-pink-500"
        },
        {
            title: "Zero Trust Architecture",
            description: "Never trust, always verify security model implementation",
            icon: Key,
            color: "from-indigo-600 to-purple-500"
        }
    ];

    const stats = [
        { value: "99.9%", label: "Uptime SLA", icon: Activity },
        { value: "24/7", label: "Security Monitoring", icon: Clock },
        { value: "256-bit", label: "Encryption Standard", icon: Lock },
        { value: "<5min", label: "Incident Response", icon: AlertTriangle }
    ];

    return (
        <section className="relative py-24 bg-white dark:bg-[#1F1328] overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-indigo-900/10" />
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl -translate-x-32 -translate-y-32" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl translate-x-32 translate-y-32" />

            <div className="relative max-w-7xl mx-auto px-6">
                {/* Header */}
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
                        className="inline-flex items-center gap-2 bg-gradient-to-tr from-zinc-300/20 via-blue-400/20 to-transparent border-[2px] border-blue-200/50 dark:border-blue-400/20 rounded-3xl px-5 py-2 mb-6 font-geist text-sm text-blue-600 dark:text-blue-400 group mx-auto w-fit"
                    >
                        <Shield className="w-4 h-4" />
                        <span className="font-medium">Intelligence Security</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-4xl font-cal tracking-tighter font-geist bg-clip-text text-transparent mx-auto md:text-6xl bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] mb-6"
                    >
                        Enterprise-Grade{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                            Intelligence Protection
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-300 font-geist"
                    >
                        Protect your organization's most valuable asset - its intelligence. Our platform ensures your data, insights, and business intelligence remain secure with military-grade encryption and compliance standards.
                    </motion.p>
                </motion.div>

                {/* Certifications */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                >
                    {certifications.map((cert, index) => (
                        <motion.div
                            key={cert.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <cert.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 font-geist">{cert.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-geist">{cert.description}</p>
                            <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                                <CheckCircle className="w-3 h-3" />
                                {cert.status}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Security Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
                >
                    {securityFeatures.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 font-geist">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 font-geist leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-600/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-indigo-600/20 border border-blue-200/30 dark:border-blue-400/20 rounded-3xl p-8"
                >
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-geist">Security Performance</h3>
                        <p className="text-gray-600 dark:text-gray-300 font-geist">Our commitment to enterprise-grade security and reliability</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 font-geist">{stat.value}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300 font-geist">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-center mt-12"
                >
                    <div className="inline-flex items-center gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl px-6 py-4 shadow-lg">
                        <Shield className="w-6 h-6 text-green-600" />
                        <span className="text-gray-900 dark:text-white font-medium font-geist">
                            Trusted by 500+ Enterprise Customers Worldwide
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SecurityCompliance;
