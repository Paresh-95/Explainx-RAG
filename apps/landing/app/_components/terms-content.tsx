import React from 'react';

const TermsOfService: React.FC = () => {
    return (
        <div className="flex justify-center items-center p-4">
            <div className="max-w-6xl p-6 rounded-lg">
                <h1 className="text-xl font-semibold text-center mb-4">Terms of Service</h1>
                <p className="text-sm text-gray-600 mb-4">Last updated: June 25, 2025.</p>

                <p>Subject to these Terms of Service (this "Agreement"), ExplainX.ai ("ExplainX", "we", "us", and/or "our") provides access to our AI-powered learning and content creation platform (collectively, the "Services"). By using or accessing the Services, you acknowledge that you have read, understand, and agree to be bound by this Agreement.</p>

                <p className="mt-4">If you are entering into this Agreement on behalf of a company, business, or other legal entity, you represent that you have the authority to bind such entity to this Agreement, in which case the term "you" shall refer to such entity.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">1. Platform Description</h2>
                <p>ExplainX.ai is an AI-powered educational platform that enables:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Upload and analysis of learning content (videos, PDFs, audio, text documents)</li>
                    <li>AI-powered tutoring and interactive learning experiences</li>
                    <li>Creation and management of learning spaces by instructors and users</li>
                    <li>Monetization of educational content through paid learning spaces</li>
                    <li>Collaborative learning environments with students, instructors, and moderators</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">2. User Accounts and Responsibilities</h2>
                <h3 className="font-medium mb-2">2.1 Account Creation</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Users must provide accurate and complete registration information</li>
                    <li>Users are responsible for maintaining account security and confidentiality</li>
                    <li>Users must be at least 13 years old to create an account</li>
                    <li>One person or entity may maintain only one account</li>
                </ul>

                <h3 className="font-medium mb-2">2.2 User Conduct</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Users must comply with all applicable laws and regulations</li>
                    <li>Users are prohibited from uploading illegal, harmful, or infringing content</li>
                    <li>Users must respect intellectual property rights of others</li>
                    <li>Users are responsible for all content they post in learning spaces</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">3. Learning Spaces and Content</h2>
                <h3 className="font-medium mb-2">3.1 Space Creation and Management</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>Private Spaces:</strong> Students can create private learning spaces for personal use at no charge</li>
                    <li><strong>Public Spaces:</strong> When students publish their spaces, they become space owners with monetization rights</li>
                    <li><strong>Instructor Spaces:</strong> Instructors can create learning spaces and set access permissions (free, paid, or invitation-only)</li>
                    <li><strong>Access Control:</strong> Space owners determine who can join and what permissions members have</li>
                </ul>

                <h3 className="font-medium mb-2">3.2 Content Responsibility</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>User Ownership:</strong> All content posted by students, instructors, moderators, or space owners remains their property and responsibility</li>
                    <li><strong>Platform Limitation:</strong> ExplainX is not responsible for user-generated content within learning spaces</li>
                    <li><strong>Content Standards:</strong> All content must comply with our community guidelines and applicable laws</li>
                    <li><strong>Moderation Rights:</strong> We reserve the right to remove content that violates our terms or policies</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">4. Revenue Sharing and Payments</h2>
                <h3 className="font-medium mb-2">4.1 Instructor Revenue Model</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>Revenue Share:</strong> Instructors are entitled to 90% of all revenue generated from their learning spaces</li>
                    <li><strong>Platform Fee:</strong> ExplainX retains 10% of all transactions as a platform fee</li>
                    <li><strong>Payment Settlement:</strong> Revenue is settled and paid to instructors within 3 months of transaction</li>
                    <li><strong>Payment Processing:</strong> All payments are processed through secure third-party payment providers</li>
                </ul>

                <h3 className="font-medium mb-2">4.2 Student Payments and Refunds</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>Flexible Refunds:</strong> Students can request refunds at any time if they are not satisfied with a learning space</li>
                    <li><strong>Refund Processing:</strong> Refunds are processed according to our refund policy and applicable payment provider terms</li>
                    <li><strong>Instructor Impact:</strong> Refunds may affect instructor revenue calculations and settlements</li>
                </ul>

                <h3 className="font-medium mb-2">4.3 Platform Fees</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>Universal Fee:</strong> 10% platform fee applies to all paid transactions on the platform</li>
                    <li><strong>Space Publishing:</strong> When students publish their private spaces for monetization, standard revenue sharing applies</li>
                    <li><strong>Fee Transparency:</strong> All fees are clearly disclosed before any transaction</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">5. Email Sharing and Communications</h2>
                <h3 className="font-medium mb-2">5.1 Instructor Recommendations</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>Direct Recommendations:</strong> When students join learning spaces based on instructor recommendations, we may share student email addresses with the respective instructor</li>
                    <li><strong>Educational Purpose:</strong> Email sharing is intended to facilitate instructor-student communication and enhance the educational experience</li>
                    <li><strong>Instructor Responsibility:</strong> Instructors must use shared email addresses responsibly and in compliance with applicable privacy laws</li>
                </ul>

                <h3 className="font-medium mb-2">5.2 Platform Recommendations</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>Privacy Protection:</strong> When students join spaces through our platform recommendations, we do not share email addresses with instructors</li>
                    <li><strong>Opt-in Communication:</strong> Students may choose to share their contact information with instructors voluntarily</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">6. Intellectual Property</h2>
                <h3 className="font-medium mb-2">6.1 User Content Rights</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Users retain ownership of their original content uploaded to the platform</li>
                    <li>Users grant ExplainX a license to host, process, and display content for platform functionality</li>
                    <li>Users are responsible for ensuring they have rights to upload and share content</li>
                </ul>

                <h3 className="font-medium mb-2">6.2 Platform Rights</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>ExplainX owns all platform technology, AI algorithms, and infrastructure</li>
                    <li>Users may not reverse engineer, copy, or reproduce platform technology</li>
                    <li>Platform improvements and features remain ExplainX intellectual property</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">7. AI and Data Processing</h2>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Our AI systems analyze uploaded content to provide personalized learning experiences</li>
                    <li>AI-generated content (quizzes, flashcards, summaries) is provided to enhance learning</li>
                    <li>Users acknowledge that AI processing may not be 100% accurate and should verify important information</li>
                    <li>AI improvements may be based on aggregated, anonymized usage patterns</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">8. Platform Evolution and Updates</h2>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>Early Stage Platform:</strong> ExplainX.ai is in early development and features are continuously evolving</li>
                    <li><strong>Regular Updates:</strong> We will update these terms as the platform develops and new features are added</li>
                    <li><strong>User Notification:</strong> Significant changes to terms will be communicated to users with reasonable notice</li>
                    <li><strong>Continued Use:</strong> Continued use of the platform after updates constitutes acceptance of revised terms</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">9. Termination</h2>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Users may terminate their accounts at any time</li>
                    <li>ExplainX may suspend or terminate accounts for violations of these terms</li>
                    <li>Upon termination, users retain rights to their original content but lose access to platform features</li>
                    <li>Outstanding payments and refunds will be processed according to our policies</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">10. Disclaimers and Limitations</h2>
                <p className="mb-4">THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. EXPLAINX DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
                <p className="mb-4">EXPLAINX SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM PLATFORM USE.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">11. Governing Law</h2>
                <p className="mb-4">These Terms shall be governed by the laws of India. Any disputes shall be resolved in the competent courts of Mumbai, India.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">12. Contact Information</h2>
                <p className="mb-4">For questions about these Terms of Service, contact us at <a href="mailto:support@explainx.ai" className="text-blue-600 hover:text-blue-800 underline">support@explainx.ai</a>.</p>

                <p className="mt-4 text-sm text-gray-600">By using ExplainX.ai, you acknowledge that you have read these Terms of Service, understand them, and agree to be bound by them.</p>
            </div>
        </div>
    );
};

export default TermsOfService;