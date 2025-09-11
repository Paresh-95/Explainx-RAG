export interface FAQItem {
    question: string;
    answer: string;
    category?: string;
}

export const corporateFaqData: FAQItem[] = [
    {
        question: "How does the Organization Intelligence Platform work?",
        answer: "Our platform transforms your organization's scattered data, documents, and knowledge into a unified intelligence system. It uses AI to analyze, connect, and surface insights from across all departments, creating a comprehensive view of your organization's capabilities and performance.",
        category: "Basics"
    },
    {
        question: "What can the platform do for our organization?",
        answer: "It can provide real-time insights across all departments, automate knowledge discovery, generate strategic intelligence reports, identify performance patterns, and enable data-driven decision making at every level. It's like having a dedicated intelligence team working 24/7.",
        category: "Capabilities"
    },
    {
        question: "How does the AI knowledge intelligence work?",
        answer: "Leadership and employees can ask strategic questions about operations, market trends, or organizational performance, and the AI provides comprehensive answers with data visualizations and actionable insights. It helps reduce information silos and ensures consistent strategic understanding.",
        category: "Features"
    },
    {
        question: "Can it create strategic reports and business intelligence?",
        answer: "Yes, the platform automatically generates customized intelligence reports based on your organizational data. It supports various visualization types and can provide insights that meet specific industry requirements and business objectives.",
        category: "Intelligence"
    },
    {
        question: "What analytics and business intelligence capabilities are available?",
        answer: "You get comprehensive insights into organizational performance, market opportunities, operational efficiency, risk assessment, and predictive analytics. This empowers leadership and managers to make strategic decisions based on real-time intelligence.",
        category: "Analytics"
    },
    {
        question: "What types of data and systems are supported?",
        answer: "The platform integrates with CRMs, ERPs, databases, cloud storage, business intelligence tools, and can process various data formats including documents, spreadsheets, and real-time data feeds from popular enterprise systems.",
        category: "Integration"
    },
    {
        question: "How does this compare to traditional business intelligence?",
        answer: "Our platform provides real-time intelligence synthesis, natural language querying, automated insight generation, and cross-departmental correlation analysis. Unlike traditional BI tools, it democratizes access to intelligence across all organizational levels.",
        category: "Benefits"
    },
    {
        question: "What security measures protect our organizational intelligence?",
        answer: "We implement enterprise-grade security with SOC2 Type II compliance, end-to-end encryption, role-based access controls, and data residency options. Your sensitive organizational intelligence and strategic data remain secure and confidential.",
        category: "Security"
    },
    {
        question: "Can we track ROI and organizational intelligence effectiveness?",
        answer: "Yes, the platform provides detailed ROI metrics including decision speed improvement, strategic accuracy rates, operational efficiency gains, and risk mitigation indicators. You can measure the direct impact on business performance and strategic outcomes.",
        category: "ROI"
    },
    {
        question: "What implementation support do you provide?",
        answer: "We offer comprehensive onboarding including data migration, system integration, employee training, and ongoing support. Our customer success team ensures smooth adoption across your organization.",
        category: "Implementation"
    },
    {
        question: "Is there a pilot program available?",
        answer: "Yes, we offer a 30-day pilot program where you can test the platform with a subset of your team and content. This allows you to evaluate effectiveness before full organizational deployment.",
        category: "Getting Started"
    },
    {
        question: "How quickly can we deploy across our organization?",
        answer: "Deployment typically takes 2-4 weeks depending on organization size and integration requirements. We provide dedicated support to ensure minimal disruption to existing training programs.",
        category: "Deployment"
    },
    {
        question: "Can the platform integrate with our existing HR systems?",
        answer: "Yes, we offer APIs and pre-built integrations with popular HRIS, LMS, and collaboration tools. This ensures seamless workflow integration and centralized employee data management.",
        category: "Integration"
    },
    {
        question: "Is the platform suitable for compliance training?",
        answer: "Absolutely. The platform is designed to handle regulatory compliance training with audit trails, completion tracking, automated reminders, and certification management for industries like healthcare, finance, and manufacturing.",
        category: "Compliance"
    },
    {
        question: "What industries and company sizes do you serve?",
        answer: "We serve organizations from 100 to 10,000+ employees across various industries including technology, healthcare, financial services, manufacturing, and professional services. The platform scales to meet diverse organizational needs.",
        category: "Scalability"
    },
    {
        question: "How does your platform support SOC 2 and ISO 27001 compliance?",
        answer: "Our platform is SOC 2 Type II and ISO 27001 certified. We maintain comprehensive audit logs, implement strong access controls, encrypt all data, and provide detailed compliance reports. Our infrastructure undergoes regular third-party security audits to ensure ongoing compliance.",
        category: "Compliance"
    },
    {
        question: "Can we restrict data residency to specific regions?",
        answer: "Yes, we offer data residency controls that allow you to specify where your organization's data is stored and processed. This helps meet regulatory requirements like GDPR, local data protection laws, and government mandates for data sovereignty.",
        category: "Data Governance"
    },
    {
        question: "What security certifications and standards do you follow?",
        answer: "We maintain SOC 2 Type II certification, ISO 27001 compliance, and GDPR readiness. Our platform also supports HIPAA requirements for healthcare organizations and follows NIST cybersecurity frameworks for government and enterprise clients.",
        category: "Security"
    },
    {
        question: "How do you handle incident response and security monitoring?",
        answer: "We provide 24/7 security monitoring with automated threat detection and incident response protocols. All security events are logged and analyzed in real-time, with immediate alerts for any suspicious activity. We maintain a <5 minute incident response time SLA.",
        category: "Security Operations"
    },
    {
        question: "Do you provide audit logs and compliance reporting?",
        answer: "Yes, we maintain comprehensive audit logs of all user activities, data access, and system events. These logs are immutable and can be exported for compliance audits. We also provide automated compliance reports for SOC 2, ISO 27001, GDPR, and other regulatory frameworks.",
        category: "Audit & Reporting"
    }
];

export default corporateFaqData;
