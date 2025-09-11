import React from 'react';

const EULA: React.FC = () => {
    return (
        <div className="flex justify-center items-center p-4">
            <div className="max-w-6xl p-6 rounded-lg">
                <h1 className="text-xl font-semibold text-center mb-4">End User License Agreement (EULA)</h1>
                <p className="text-sm text-gray-600 mb-4">Last updated: June 25, 2025.</p>

                <p className="mb-4">This End User License Agreement ("EULA") is a legal agreement between you and ExplainX.ai ("ExplainX", "we", "us", or "our") for the use of the ExplainX.ai AI-powered learning platform, software applications, and related services (collectively, the "Software").</p>

                <p className="mb-4">By accessing, downloading, installing, or using the Software, you agree to be bound by the terms of this EULA. If you do not agree to the terms of this EULA, do not access, download, install, or use the Software.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">1. License Grant</h2>
                <p className="mb-2">Subject to the terms of this EULA, ExplainX grants you a limited, non-exclusive, non-transferable, revocable license to:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Access and use the ExplainX.ai platform for educational and learning purposes</li>
                    <li>Upload, analyze, and interact with your learning content using our AI tools</li>
                    <li>Create, manage, and participate in learning spaces</li>
                    <li>Use AI-powered features including tutoring, quiz generation, and content analysis</li>
                    <li>Monetize your educational content through the platform's revenue-sharing model</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">2. License Restrictions</h2>
                <p className="mb-2">You may not:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Copy, modify, distribute, sell, or lease any part of the Software or platform technology</li>
                    <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code</li>
                    <li>Remove, alter, or obscure any proprietary notices or branding</li>
                    <li>Use the Software for any unlawful purpose or in violation of applicable laws</li>
                    <li>Attempt to gain unauthorized access to our systems, servers, or networks</li>
                    <li>Use the Software to infringe upon intellectual property rights of others</li>
                    <li>Create competing platforms or services using our technology</li>
                    <li>Use automated systems to scrape or extract data from the platform</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">3. Ownership and Intellectual Property</h2>
                <h3 className="font-medium mb-2">3.1 Platform Ownership</h3>
                <p className="mb-2">The Software and all related technology, including AI algorithms, user interfaces, and platform infrastructure, are the exclusive property of ExplainX and its licensors. ExplainX reserves all rights not expressly granted to you under this EULA.</p>

                <h3 className="font-medium mb-2">3.2 User Content Rights</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>You retain ownership of all original content you upload to the platform</li>
                    <li>You grant ExplainX a license to process, analyze, and display your content for platform functionality</li>
                    <li>AI-generated content based on your materials (quizzes, summaries, flashcards) is provided for your use</li>
                    <li>You are responsible for ensuring you have rights to upload and share any content</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">4. Learning Spaces and Content Management</h2>
                <h3 className="font-medium mb-2">4.1 Space Creation and Ownership</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>Private Learning Spaces:</strong> You may create private spaces for personal learning at no additional cost</li>
                    <li><strong>Published Spaces:</strong> When you publish a private space, you become the space owner with full management rights</li>
                    <li><strong>Instructor Spaces:</strong> Instructors can create and monetize learning spaces according to platform terms</li>
                    <li><strong>Content Responsibility:</strong> All content posted in learning spaces is the sole responsibility of the respective user</li>
                </ul>

                <h3 className="font-medium mb-2">4.2 Revenue Sharing for Space Owners</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>Revenue Entitlement:</strong> Space owners are entitled to 90% of revenue generated from their paid learning spaces</li>
                    <li><strong>Platform Fee:</strong> ExplainX retains 10% of all transactions as a platform service fee</li>
                    <li><strong>Payment Timeline:</strong> Revenue settlements are processed within 3 months of transaction</li>
                    <li><strong>Refund Impact:</strong> Student refunds may affect revenue calculations and settlements</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">5. AI-Powered Features and Data Processing</h2>
                <h3 className="font-medium mb-2">5.1 AI Functionality</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>AI tutors provide personalized learning assistance based on your uploaded content</li>
                    <li>Automated generation of quizzes, flashcards, and study materials from your content</li>
                    <li>Intelligent content analysis and learning progress tracking</li>
                    <li>Personalized recommendations for learning paths and resources</li>
                </ul>

                <h3 className="font-medium mb-2">5.2 Data Processing and Privacy</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Your learning content is processed by AI systems to provide educational features</li>
                    <li>Platform usage data helps improve AI algorithms and user experience</li>
                    <li>Personal information is handled according to our Privacy Policy</li>
                    <li>You acknowledge that AI analysis may not be 100% accurate and should verify important information</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">6. User Communications and Email Sharing</h2>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>Instructor Recommendations:</strong> When joining spaces through instructor recommendations, your email may be shared with the instructor</li>
                    <li><strong>Platform Recommendations:</strong> Email addresses are not shared when joining spaces through platform recommendations</li>
                    <li><strong>Communication Tools:</strong> The platform provides various communication features for educational interactions</li>
                    <li><strong>Privacy Controls:</strong> You can manage your communication preferences through account settings</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">7. Content Responsibility and Platform Limitations</h2>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>User Responsibility:</strong> All content posted by students, instructors, moderators, or space owners is their sole responsibility</li>
                    <li><strong>Platform Disclaimer:</strong> ExplainX is not responsible for user-generated content within learning spaces</li>
                    <li><strong>Content Standards:</strong> All content must comply with community guidelines and applicable laws</li>
                    <li><strong>Moderation Rights:</strong> We reserve the right to remove content that violates our policies</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">8. Platform Evolution and Updates</h2>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>Early Stage Development:</strong> ExplainX.ai is continuously evolving with new features and improvements</li>
                    <li><strong>Software Updates:</strong> We may provide updates, patches, and new versions of the Software</li>
                    <li><strong>Terms Updates:</strong> This EULA may be updated as the platform evolves and new features are added</li>
                    <li><strong>Continued Access:</strong> Updates are provided to enhance functionality and user experience</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">9. Student Refund Policy</h2>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>Flexible Refunds:</strong> Students can request refunds at any time if they are not satisfied with a learning space</li>
                    <li><strong>Refund Processing:</strong> Refund requests are processed according to our refund policy</li>
                    <li><strong>Impact on Revenue:</strong> Refunds may affect instructor revenue calculations and payment settlements</li>
                    <li><strong>Good Faith Usage:</strong> Refund policy is designed to ensure student satisfaction while protecting content creators</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">10. Third-Party Integrations</h2>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>The Software may integrate with third-party services for payment processing, cloud storage, and analytics</li>
                    <li>Third-party services are governed by their respective terms and privacy policies</li>
                    <li>ExplainX is not responsible for third-party service availability or functionality</li>
                    <li>Integration features may change based on third-party service updates</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">11. Account Management and Access</h2>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>Account sharing is prohibited unless explicitly permitted by platform features</li>
                    <li>You must notify us immediately of any unauthorized use of your account</li>
                    <li>Account suspension or termination may occur for violations of this EULA</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">12. Termination</h2>
                <p className="mb-2">This EULA is effective until terminated. Termination may occur when:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>You choose to discontinue use of the Software and delete your account</li>
                    <li>ExplainX terminates your access for violations of this EULA or platform policies</li>
                    <li>The platform is discontinued (with reasonable notice to users)</li>
                </ul>
                <p className="mb-4">Upon termination, you must cease all use of the Software, but you retain rights to your original content. Outstanding payments and revenue sharing will be processed according to our policies.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">13. Age Restrictions</h2>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Users must be at least 13 years old to use the Software</li>
                    <li>Users between 13-18 years old should have parental consent</li>
                    <li>We do not knowingly collect personal information from children under 13</li>
                    <li>Educational institutions may use the platform for student learning with appropriate permissions</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">14. Export and Compliance</h2>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>The Software may be subject to export laws and regulations</li>
                    <li>You agree to comply with all applicable laws regarding your use of the Software</li>
                    <li>You are responsible for ensuring compliance with local laws in your jurisdiction</li>
                    <li>Educational content must comply with applicable educational standards and regulations</li>
                </ul>

                <h2 className="text-lg font-semibold mb-2 mt-4">15. Disclaimer of Warranties</h2>
                <p className="mb-4">THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. EXPLAINX DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
                <p className="mb-4">EXPLAINX DOES NOT WARRANT THAT THE SOFTWARE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. AI-GENERATED CONTENT MAY CONTAIN INACCURACIES AND SHOULD BE VERIFIED BY USERS.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">16. Limitation of Liability</h2>
                <p className="mb-4">IN NO EVENT SHALL EXPLAINX BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SOFTWARE.</p>
                <p className="mb-4">EXPLAINX'S TOTAL LIABILITY TO YOU FOR ANY CLAIMS RELATING TO THE SOFTWARE SHALL NOT EXCEED THE AMOUNT YOU HAVE PAID TO EXPLAINX IN THE TWELVE MONTHS PRECEDING THE CLAIM.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">17. Indemnification</h2>
                <p className="mb-4">You agree to indemnify and hold harmless ExplainX from any claims, damages, or expenses arising from your use of the Software, your content, your violation of this EULA, or your violation of any rights of another party.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">18. Governing Law and Jurisdiction</h2>
                <p className="mb-4">This EULA shall be governed by and construed in accordance with the laws of India, without regard to its conflict of laws principles. Any disputes arising under this EULA shall be resolved in the competent courts of Mumbai, India.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">19. Changes to this EULA</h2>
                <p className="mb-4">ExplainX reserves the right to modify this EULA at any time as the platform evolves. We will notify users of material changes by updating the "Last Updated" date and providing notice through the platform. Your continued use of the Software after any modifications constitutes acceptance of the revised EULA.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">20. Contact Information</h2>
                <p className="mb-4">If you have any questions about this EULA, please contact us at <a href="mailto:support@explainx.ai" className="text-blue-600 hover:text-blue-800 underline">support@explainx.ai</a>.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">21. Severability</h2>
                <p className="mb-4">If any provision of this EULA is found to be unenforceable or invalid, the remaining provisions shall continue to be valid and enforceable to the fullest extent permitted by law.</p>

                <h2 className="text-lg font-semibold mb-2 mt-4">22. Entire Agreement</h2>
                <p className="mb-4">This EULA constitutes the entire agreement between you and ExplainX regarding the Software and supersedes all prior agreements and understandings, whether written or oral, relating to the subject matter hereof.</p>

                <p className="mt-6 text-sm text-gray-600">By accessing or using the ExplainX.ai Software, you acknowledge that you have read this EULA, understand it, and agree to be bound by its terms and conditions.</p>
            </div>
        </div>
    );
};

export default EULA;