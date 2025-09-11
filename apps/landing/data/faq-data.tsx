export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export const faqData: FAQItem[] = [
  {
    question: "What is the AI Tutor?",
    answer: "The AI Tutor is a personalized learning assistant that transforms your study materials into summaries, flashcards, quizzes, and interactive chat experiences. It helps you understand concepts faster and retain information longer.",
    category: "Basics"
  },
  {
    question: "What can the AI Tutor do?",
    answer: "It can summarize long texts, generate flashcards, create quizzes, explain complex topics via chat, and even talk with you in voice mode. It’s like having a 24/7 smart tutor built for your learning style.",
    category: "Capabilities"
  },
  {
    question: "How does the interactive chat work?",
    answer: "You can ask the AI Tutor questions about your uploaded content, and it will answer with references to the material. It helps you dive deeper into topics, clarify doubts, and reinforce learning through conversation.",
    category: "Features"
  },
  {
    question: "Can it create quizzes from my notes or textbooks?",
    answer: "Yes, the AI Tutor analyzes your content and automatically generates custom quizzes to test your knowledge. It supports multiple choice, true/false, and short answer formats.",
    category: "Quizzes"
  },
  {
    question: "Does it support voice-based learning?",
    answer: "Absolutely! You can switch to voice mode to talk with the AI Tutor like a real teacher. It helps with revision, verbal explanations, and auditory learning for better engagement.",
    category: "Features"
  },
  {
    question: "What formats of study materials are supported?",
    answer: "You can upload PDFs, text documents, slide decks, or just paste raw text. The AI Tutor will convert them into interactive learning content.",
    category: "Integration"
  },
  {
    question: "Is this better than traditional tutoring?",
    answer: "It’s designed to complement human tutoring by offering instant explanations, unlimited practice, and learning personalization. You learn at your own pace, anytime, anywhere.",
    category: "Comparison"
  },
  {
    question: "How is my data used and protected?",
    answer: "Your study content and chat data are stored securely and are never shared with third parties. Everything is encrypted, and you can delete your data anytime.",
    category: "Security"
  },
  {
    question: "Can I track my learning progress?",
    answer: "Yes, the platform tracks your quiz scores, notes accessed, and topics studied. You’ll get insights into your strengths, weak areas, and improvement over time.",
    category: "Monitoring"
  },
  {
    question: "Do I need any technical skills to use it?",
    answer: "Not at all! The interface is designed for students of all levels. Just upload your content and start learning—no setup, coding, or complex steps required.",
    category: "Getting Started"
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, you can try the AI Tutor for free for 14 days with full access to all features including quizzes, flashcards, and voice chat.",
    category: "Getting Started"
  },
  {
    question: "How can I start using the AI Tutor?",
    answer: "Just sign up on our website, upload your materials, and the AI Tutor will begin turning them into interactive learning tools instantly.",
    category: "Getting Started"
  },
  {
    question: "Can I customize how the AI Tutor teaches me?",
    answer: "Yes, you can choose your preferred learning style—whether it's text-based, flashcard-heavy, voice-interactive, or quiz-driven. The tutor adapts accordingly.",
    category: "Customization"
  },
  {
    question: "Is it suitable for exam prep?",
    answer: "Definitely. It helps break down topics, test your understanding with quizzes, and review key points efficiently—perfect for revision and exam readiness.",
    category: "Use Cases"
  },
  {
    question: "What subjects does it support?",
    answer: "The AI Tutor works for most subjects including science, math, history, business, literature, and more—anything you can provide materials for.",
    category: "Capabilities"
  }
];

export default faqData;