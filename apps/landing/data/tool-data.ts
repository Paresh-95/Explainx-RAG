// data/tool-data.ts
import { Tool } from "../types/tools";

export const tools: Tool[] = [
  
  {
    id: "ai-quiz-maker",
    name: "AI Quiz Maker",
    description: "Free tool: Upload your text and instantly generate a quiz. Perfect for teachers, students, and content creators who want to quickly create engaging quizzes from any material.",
    platform: "General",
    category: "education",
    component: "QuizMakerClient",
    image: "/images/tool-images/discovery-tool-preview.jpg",
    ctaText: "Generate Free Quiz",
    features: [
      "Upload text or documents to auto-generate quizzes",
      "Multiple question types: MCQ, True/False, Short Answer",
      "Download or share quizzes instantly",
      "No signup required for basic use",
      "AI-powered question generation",
      "Supports PDF, DOCX, and plain text",
      "Customizable difficulty levels",
      "Export to PDF or Google Forms"
    ],
    keyFeatures: [
      {
        title: "Instant Quiz Generation",
        description: "Turn any text into a quiz in seconds using advanced AI algorithms.",
        icon: "bolt"
      },
      {
        title: "Multiple Formats",
        description: "Supports MCQ, True/False, and Short Answer questions.",
        icon: "list"
      },
      {
        title: "Easy Export",
        description: "Download quizzes as PDF or export to Google Forms.",
        icon: "export"
      },
      {
        title: "No Signup Needed",
        description: "Use the tool for free without creating an account.",
        icon: "user"
      }
    ],
    useCase: [
      {
        title: "For Teachers",
        description: "Quickly create quizzes for classroom or online learning.",
        examples: [
          "Upload lesson notes to generate quizzes",
          "Create practice tests for students",
          "Save time on manual question writing"
        ]
      },
      {
        title: "For Students",
        description: "Test your knowledge by generating quizzes from study material.",
        examples: [
          "Upload textbook chapters for self-assessment",
          "Prepare for exams with custom quizzes",
          "Share quizzes with study groups"
        ]
      }
    ],
    targetAudience: [
      "Teachers",
      "Students",
      "Tutors",
      "Content Creators",
      "Corporate Trainers",
      "Lifelong Learners"
    ],
    benefits: [
      "Saves time on quiz creation",
      "Engages learners with interactive content",
      "No technical skills required",
      "Free to use for basic features",
      "Instant sharing and export options"
    ],
    faq: [
      {
        question: "How does the AI generate quiz questions?",
        answer: "The AI analyzes your uploaded text and creates relevant questions using natural language processing."
      },
      {
        question: "What file formats are supported?",
        answer: "You can upload PDF, DOCX, or plain text files."
      },
      {
        question: "Is the tool really free?",
        answer: "Yes, basic quiz generation is completely free. Advanced features may require a subscription in the future."
      },
      {
        question: "Can I export the quiz?",
        answer: "Yes, you can download quizzes as PDF or export to Google Forms."
      }
    ],
    pricing: {
      free: [
        "Unlimited basic quiz generation",
        "Download as PDF",
        "No signup required"
      ],
      pro: [
        "Advanced export options",
        "Question editing",
        "Analytics and reporting",
        "Priority support"
      ],
      price: "$9/month (coming soon)"
    }
  },
  {
    id: "ai-grading-tool",
    name: "AI Grading Tool",
    description: "Automatically grade assignments, quizzes, and exams with AI. Instantly generate feedback, scores, and analytics for teachers and students.",
    platform: "General",
    category: "education",
    component: "GradingToolClient",
    image: "/images/tool-images/discovery-tool-preview.jpg",
    ctaText: "Grade Now",
    features: [
      "AI-powered grading for assignments, quizzes, and exams",
      "Supports multiple question types: MCQ, short answer, essays",
      "Instant feedback and scoring",
      "Detailed analytics and reports",
      "Customizable grading rubrics",
      "Bulk grading for classes",
      "Download results as PDF or CSV",
      "No signup required for basic use"
    ],
    keyFeatures: [
      {
        title: "Instant Grading",
        description: "Grade hundreds of responses in seconds using advanced AI algorithms.",
        icon: "bolt"
      },
      {
        title: "Multiple Formats",
        description: "Supports MCQ, short answer, and essay questions.",
        icon: "list"
      },
      {
        title: "Detailed Feedback",
        description: "Provide students with actionable feedback and explanations.",
        icon: "message"
      },
      {
        title: "Easy Export",
        description: "Download grades and reports as PDF or CSV.",
        icon: "export"
      }
    ],
    useCase: [
      {
        title: "For Teachers",
        description: "Save hours on grading and provide better feedback to students.",
        examples: [
          "Grade class assignments in bulk",
          "Generate feedback for each student",
          "Analyze class performance with reports"
        ]
      },
      {
        title: "For Students",
        description: "Get instant feedback on practice quizzes and assignments.",
        examples: [
          "Submit practice essays for instant grading",
          "Understand strengths and areas for improvement",
          "Track progress over time"
        ]
      }
    ],
    targetAudience: [
      "Teachers",
      "Students",
      "Tutors",
      "School Administrators",
      "EdTech Companies"
    ],
    benefits: [
      "Saves hours of manual grading",
      "Consistent and unbiased scoring",
      "Actionable feedback for students",
      "Free for basic use",
      "Instant export options"
    ],
    faq: [
      {
        question: "How does the AI grade assignments?",
        answer: "The AI analyzes student responses and applies grading rubrics to generate scores and feedback."
      },
      {
        question: "What question types are supported?",
        answer: "You can grade MCQ, short answer, and essay questions."
      },
      {
        question: "Is the tool free?",
        answer: "Yes, basic grading is free. Advanced features may require a subscription in the future."
      },
      {
        question: "Can I export the grades?",
        answer: "Yes, you can download grades and reports as PDF or CSV."
      }
    ],
    pricing: {
      free: [
        "Unlimited basic grading",
        "Download as PDF or CSV",
        "No signup required"
      ],
      pro: [
        "Custom grading rubrics",
        "Bulk analytics",
        "Priority support"
      ],
      price: "$9/month (coming soon)"
    }
  },
  {
    id: "ai-report-card-generator",
    name: "AI Report Card Generator",
    description: "Generate professional report cards in seconds. Upload student data and let AI create detailed, customizable report cards for schools, tutors, and training programs.",
    platform: "General",
    category: "education",
    component: "ReportCardGeneratorClient",
    image: "/images/tool-images/discovery-tool-preview.jpg",
    ctaText: "Generate Report Card",
    features: [
      "Upload student data (CSV, Excel)",
      "AI-generated comments and grades",
      "Customizable templates",
      "Bulk report card creation",
      "Download as PDF or print",
      "Supports multiple grading systems",
      "Add school logo and branding",
      "No signup required for basic use"
    ],
    keyFeatures: [
      {
        title: "Bulk Generation",
        description: "Create report cards for an entire class in one upload.",
        icon: "layers"
      },
      {
        title: "AI-Powered Comments",
        description: "Automatically generate personalized comments for each student.",
        icon: "message"
      },
      {
        title: "Custom Templates",
        description: "Choose from multiple templates or design your own.",
        icon: "template"
      },
      {
        title: "Easy Export",
        description: "Download report cards as PDF or print directly.",
        icon: "export"
      }
    ],
    useCase: [
      {
        title: "For Schools",
        description: "Streamline report card generation for teachers and administrators.",
        examples: [
          "Upload class data for instant report cards",
          "Customize templates for different grades",
          "Save time on manual comment writing"
        ]
      },
      {
        title: "For Tutors",
        description: "Provide professional progress reports for private students.",
        examples: [
          "Generate monthly progress cards",
          "Personalize feedback for each student",
          "Export and share with parents"
        ]
      }
    ],
    targetAudience: [
      "School Administrators",
      "Teachers",
      "Tutors",
      "Training Centers",
      "Parents",
      "EdTech Companies"
    ],
    benefits: [
      "Saves hours of manual work",
      "Consistent, professional formatting",
      "Personalized feedback with AI",
      "Free for basic use",
      "Instant export and print options"
    ],
    faq: [
      {
        question: "How does the AI generate comments?",
        answer: "The AI analyzes student data and generates relevant, personalized comments for each report card."
      },
      {
        question: "What file formats are supported for upload?",
        answer: "You can upload CSV or Excel files with student data."
      },
      {
        question: "Can I customize the report card template?",
        answer: "Yes, you can choose from built-in templates or design your own."
      },
      {
        question: "Is the tool free?",
        answer: "Basic report card generation is free. Advanced features may require a subscription."
      }
    ],
    pricing: {
      free: [
        "Unlimited basic report card generation",
        "Download as PDF",
        "No signup required"
      ],
      pro: [
        "Custom templates",
        "Bulk export options",
        "Advanced analytics",
        "Priority support"
      ],
      price: "$12/month (coming soon)"
    }
  },
  {
    id: "curriculum-planner",
    name: "AI Curriculum Planner",
    description: "Create comprehensive curriculum plans in minutes. Generate detailed lesson plans, unit breakdowns, and teaching strategies for any subject and grade level using AI-powered curriculum design.",
    platform: "General",
    category: "education",
    component: "CurriculumPlannerClient",
    image: "/images/tool-images/discovery-tool-preview.jpg",
    ctaText: "Generate Curriculum",
    features: [
      "AI-powered curriculum generation",
      "Customizable subject and grade level",
      "Detailed learning objectives",
      "Unit breakdown with timelines",
      "Teaching strategies and activities",
      "Assessment methods included",
      "Download as PDF",
      "No signup required for basic use"
    ],
    keyFeatures: [
      {
        title: "Comprehensive Planning",
        description: "Generate complete curriculum plans with units, activities, and assessments.",
        icon: "calendar"
      },
      {
        title: "AI-Powered Design",
        description: "Create engaging, standards-aligned curriculum using advanced AI.",
        icon: "brain"
      },
      {
        title: "Flexible Duration",
        description: "Plan for any timeframe - weeks, months, or semesters.",
        icon: "clock"
      },
      {
        title: "Easy Export",
        description: "Download curriculum plans as professional PDF documents.",
        icon: "export"
      }
    ],
    useCase: [
      {
        title: "For Teachers",
        description: "Save time on curriculum planning and focus on teaching.",
        examples: [
          "Generate lesson plans for new subjects",
          "Create unit breakdowns with activities",
          "Plan assessment strategies",
          "Design differentiated instruction"
        ]
      },
      {
        title: "For Schools",
        description: "Standardize curriculum development across departments.",
        examples: [
          "Create consistent curriculum frameworks",
          "Align with educational standards",
          "Develop new course offerings",
          "Train new teachers with ready-made plans"
        ]
      }
    ],
    targetAudience: [
      "Teachers",
      "Curriculum Developers",
      "School Administrators",
      "Educational Consultants",
      "Homeschool Parents",
      "Training Organizations"
    ],
    benefits: [
      "Saves weeks of curriculum planning",
      "Standards-aligned content",
      "Engaging teaching strategies",
      "Free for basic use",
      "Professional PDF export"
    ],
    faq: [
      {
        question: "How does the AI create curriculum plans?",
        answer: "The AI analyzes your subject, grade level, and learning objectives to generate comprehensive curriculum plans with units, activities, and assessments."
      },
      {
        question: "Can I customize the curriculum duration?",
        answer: "Yes, you can specify any duration from weeks to semesters, and the AI will adjust the pacing accordingly."
      },
      {
        question: "Are the curriculum plans standards-aligned?",
        answer: "Yes, the AI generates curriculum that aligns with educational best practices and standards."
      },
      {
        question: "Is the tool free?",
        answer: "Basic curriculum planning is free. Advanced features may require a subscription in the future."
      }
    ],
    pricing: {
      free: [
        "Unlimited basic curriculum generation",
        "Download as PDF",
        "No signup required"
      ],
      pro: [
        "Advanced customization options",
        "Standards alignment tools",
        "Collaborative planning features",
        "Priority support"
      ],
      price: "$15/month (coming soon)"
    }
  },
  {
    id: "course-curriculum-generator",
    name: "AI Course Curriculum Generator",
    description: "Generate detailed course curriculum plans in minutes. Create module breakdowns, activities, assessments, and pacing for any course using AI-powered curriculum design.",
    platform: "General",
    category: "education",
    component: "CourseCurriculumGeneratorClient",
    image: "/images/tool-images/discovery-tool-preview.jpg",
    ctaText: "Generate Course Curriculum",
    features: [
      "AI-powered course curriculum generation",
      "Customizable course title and audience",
      "Detailed learning outcomes and prerequisites",
      "Module/unit breakdown with timelines",
      "Teaching strategies and activities",
      "Assessment methods included",
      "Download as PDF",
      "No signup required for basic use"
    ],
    keyFeatures: [
      {
        title: "Comprehensive Course Planning",
        description: "Generate complete course curriculum plans with modules, activities, and assessments.",
        icon: "calendar"
      },
      {
        title: "AI-Powered Design",
        description: "Create engaging, standards-aligned course curriculum using advanced AI.",
        icon: "brain"
      },
      {
        title: "Flexible Duration",
        description: "Plan for any timeframe - weeks, months, or semesters.",
        icon: "clock"
      },
      {
        title: "Easy Export",
        description: "Download course curriculum plans as professional PDF documents.",
        icon: "export"
      }
    ],
    useCase: [
      {
        title: "For Instructors",
        description: "Save time on course curriculum planning and focus on teaching.",
        examples: [
          "Generate module breakdowns for new courses",
          "Create activities and assessments for each module",
          "Plan differentiated instruction"
        ]
      },
      {
        title: "For Institutions",
        description: "Standardize course curriculum development across departments.",
        examples: [
          "Create consistent course frameworks",
          "Align with educational standards",
          "Develop new course offerings",
          "Train new instructors with ready-made plans"
        ]
      }
    ],
    targetAudience: [
      "Instructors",
      "Course Designers",
      "School Administrators",
      "Educational Consultants",
      "Online Course Creators",
      "Training Organizations"
    ],
    benefits: [
      "Saves weeks of course planning",
      "Standards-aligned content",
      "Engaging teaching strategies",
      "Free for basic use",
      "Professional PDF export"
    ],
    faq: [
      {
        question: "How does the AI create course curriculum plans?",
        answer: "The AI analyzes your course title, audience, prerequisites, and learning outcomes to generate comprehensive course curriculum plans with modules, activities, and assessments."
      },
      {
        question: "Can I customize the course duration?",
        answer: "Yes, you can specify any duration from weeks to semesters, and the AI will adjust the pacing accordingly."
      },
      {
        question: "Are the course curriculum plans standards-aligned?",
        answer: "Yes, the AI generates curriculum that aligns with educational best practices and standards."
      },
      {
        question: "Is the tool free?",
        answer: "Basic course curriculum planning is free. Advanced features may require a subscription in the future."
      }
    ],
    pricing: {
      free: [
        "Unlimited basic course curriculum generation",
        "Download as PDF",
        "No signup required"
      ],
      pro: [
        "Advanced customization options",
        "Standards alignment tools",
        "Collaborative planning features",
        "Priority support"
      ],
      price: "$15/month (coming soon)"
    }
  },
  {
    id: "essay-generator",
    name: "AI Essay Generator",
    description: "Generate well-structured essays instantly. Create academic, professional, or creative essays on any topic with customizable length, style, and type using AI-powered writing assistance.",
    platform: "General",
    category: "writing",
    component: "EssayGeneratorClient",
    image: "/images/tool-images/discovery-tool-preview.jpg",
    ctaText: "Generate Essay",
    features: [
      "AI-powered essay generation",
      "Multiple essay types (Argumentative, Expository, Narrative, etc.)",
      "Customizable length and writing style",
      "Academic and professional standards",
      "Download as PDF",
      "No signup required for basic use",
      "Well-structured content with proper formatting",
      "Engaging introductions and conclusions"
    ],
    keyFeatures: [
      {
        title: "Multiple Essay Types",
        description: "Generate argumentative, expository, narrative, and other essay types.",
        icon: "document"
      },
      {
        title: "Customizable Length",
        description: "Choose from short to long essays based on your requirements.",
        icon: "ruler"
      },
      {
        title: "Writing Styles",
        description: "Academic, professional, casual, and creative writing styles.",
        icon: "pen"
      },
      {
        title: "Instant Generation",
        description: "Get complete, well-structured essays in seconds.",
        icon: "bolt"
      }
    ],
    useCase: [
      {
        title: "For Students",
        description: "Generate essays for assignments, research papers, and academic projects.",
        examples: [
          "Create argumentative essays for class",
          "Generate expository essays for research",
          "Write narrative essays for creative writing",
          "Develop thesis statements and outlines"
        ]
      },
      {
        title: "For Professionals",
        description: "Create professional essays for reports, proposals, and presentations.",
        examples: [
          "Write business proposals",
          "Generate technical documentation",
          "Create marketing content",
          "Develop thought leadership pieces"
        ]
      }
    ],
    targetAudience: [
      "Students",
      "Teachers",
      "Writers",
      "Professionals",
      "Content Creators",
      "Researchers"
    ],
    benefits: [
      "Saves hours of writing time",
      "Professional-quality content",
      "Multiple essay types and styles",
      "Free for basic use",
      "Instant PDF export"
    ],
    faq: [
      {
        question: "How does the AI generate essays?",
        answer: "The AI analyzes your topic, type, length, and style requirements to create well-structured essays with proper introductions, body paragraphs, and conclusions."
      },
      {
        question: "What essay types are supported?",
        answer: "We support argumentative, expository, narrative, descriptive, persuasive, and analytical essays."
      },
      {
        question: "Can I customize the essay length?",
        answer: "Yes, you can choose from various length options from short (250-500 words) to long (1500+ words)."
      },
      {
        question: "Is the tool free?",
        answer: "Basic essay generation is free. Advanced features may require a subscription in the future."
      }
    ],
    pricing: {
      free: [
        "Unlimited basic essay generation",
        "Download as PDF",
        "No signup required"
      ],
      pro: [
        "Advanced customization options",
        "Multiple export formats",
        "Essay editing tools",
        "Priority support"
      ],
      price: "$8/month (coming soon)"
    }
  },
  {
    id: "review-generator",
    name: "AI Review Generator",
    description: "Create authentic product and service reviews instantly. Generate detailed, helpful reviews for any product or service with customizable ratings, tones, and categories.",
    platform: "General",
    category: "writing",
    component: "ReviewGeneratorClient",
    image: "/images/tool-images/discovery-tool-preview.jpg",
    ctaText: "Generate Review",
    features: [
      "AI-powered review generation",
      "Multiple product categories",
      "Customizable ratings and tones",
      "Authentic and detailed reviews",
      "Download as PDF",
      "No signup required for basic use",
      "Professional and casual review styles",
      "Helpful consumer insights"
    ],
    keyFeatures: [
      {
        title: "Multiple Categories",
        description: "Generate reviews for electronics, food, entertainment, fashion, and more.",
        icon: "tag"
      },
      {
        title: "Customizable Ratings",
        description: "Create reviews with any rating from 1/5 to 5/5 stars.",
        icon: "star"
      },
      {
        title: "Various Tones",
        description: "Professional, casual, enthusiastic, critical, and balanced review tones.",
        icon: "message"
      },
      {
        title: "Authentic Content",
        description: "Generate realistic, helpful reviews that provide genuine value.",
        icon: "heart"
      }
    ],
    useCase: [
      {
        title: "For Consumers",
        description: "Create helpful reviews for products and services you've used.",
        examples: [
          "Write detailed product reviews",
          "Share restaurant experiences",
          "Review entertainment content",
          "Provide service feedback"
        ]
      },
      {
        title: "For Businesses",
        description: "Generate sample reviews for marketing and training purposes.",
        examples: [
          "Create example reviews for training",
          "Generate marketing testimonials",
          "Develop review guidelines",
          "Analyze review patterns"
        ]
      }
    ],
    targetAudience: [
      "Consumers",
      "Reviewers",
      "Businesses",
      "Marketers",
      "Content Creators",
      "E-commerce Managers"
    ],
    benefits: [
      "Saves time on review writing",
      "Authentic and detailed content",
      "Multiple categories and tones",
      "Free for basic use",
      "Professional PDF export"
    ],
    faq: [
      {
        question: "How does the AI generate reviews?",
        answer: "The AI creates authentic reviews based on the product/service, category, rating, and tone you specify, providing detailed insights and recommendations."
      },
      {
        question: "What categories are supported?",
        answer: "We support electronics, food & dining, entertainment, fashion, travel, health & beauty, books, software, services, and more."
      },
      {
        question: "Can I customize the review tone?",
        answer: "Yes, you can choose from professional, casual, enthusiastic, critical, balanced, and humorous tones."
      },
      {
        question: "Is the tool free?",
        answer: "Basic review generation is free. Advanced features may require a subscription in the future."
      }
    ],
    pricing: {
      free: [
        "Unlimited basic review generation",
        "Download as PDF",
        "No signup required"
      ],
      pro: [
        "Advanced customization options",
        "Bulk review generation",
        "Review analytics",
        "Priority support"
      ],
      price: "$6/month (coming soon)"
    }
  },
  {
    id: "comment-generator",
    name: "AI Comment Generator",
    description: "Generate engaging social media comments instantly. Create authentic, platform-appropriate comments for any content with customizable tones and lengths.",
    platform: "General",
    category: "social",
    component: "CommentGeneratorClient",
    image: "/images/tool-images/discovery-tool-preview.jpg",
    ctaText: "Generate Comment",
    features: [
      "AI-powered comment generation",
      "Multiple social media platforms",
      "Customizable tones and lengths",
      "Platform-appropriate formatting",
      "Download as PDF",
      "No signup required for basic use",
      "Engaging and authentic comments",
      "Emoji and style optimization"
    ],
    keyFeatures: [
      {
        title: "Multi-Platform Support",
        description: "Generate comments for Instagram, Facebook, Twitter, LinkedIn, YouTube, and more.",
        icon: "share"
      },
      {
        title: "Customizable Tones",
        description: "Supportive, enthusiastic, professional, casual, humorous, and other tones.",
        icon: "smile"
      },
      {
        title: "Length Options",
        description: "Short, medium, and long comments to match your needs.",
        icon: "ruler"
      },
      {
        title: "Platform Optimization",
        description: "Comments optimized for each platform's style and formatting.",
        icon: "smartphone"
      }
    ],
    useCase: [
      {
        title: "For Social Media Users",
        description: "Create engaging comments for posts, videos, and articles across platforms.",
        examples: [
          "Comment on Instagram posts",
          "Engage with YouTube videos",
          "Participate in LinkedIn discussions",
          "Respond to Twitter threads"
        ]
      },
      {
        title: "For Content Creators",
        description: "Generate example comments and engagement strategies for your content.",
        examples: [
          "Create engagement examples",
          "Develop comment strategies",
          "Train community managers",
          "Analyze comment patterns"
        ]
      }
    ],
    targetAudience: [
      "Social Media Users",
      "Content Creators",
      "Community Managers",
      "Marketers",
      "Influencers",
      "Business Owners"
    ],
    benefits: [
      "Saves time on comment writing",
      "Platform-appropriate content",
      "Multiple tones and lengths",
      "Free for basic use",
      "Instant PDF export"
    ],
    faq: [
      {
        question: "How does the AI generate comments?",
        answer: "The AI analyzes the content and creates appropriate comments based on the platform, tone, and length you specify."
      },
      {
        question: "What platforms are supported?",
        answer: "We support Instagram, Facebook, Twitter, LinkedIn, YouTube, TikTok, Reddit, blogs, forums, and more."
      },
      {
        question: "Can I customize the comment tone?",
        answer: "Yes, you can choose from supportive, enthusiastic, professional, casual, humorous, constructive, questioning, and appreciative tones."
      },
      {
        question: "Is the tool free?",
        answer: "Basic comment generation is free. Advanced features may require a subscription in the future."
      }
    ],
    pricing: {
      free: [
        "Unlimited basic comment generation",
        "Download as PDF",
        "No signup required"
      ],
      pro: [
        "Advanced customization options",
        "Bulk comment generation",
        "Comment analytics",
        "Priority support"
      ],
      price: "$5/month (coming soon)"
    }
  },
  {
    id: "pdf-flashcard-generator",
    name: "PDF to Flashcard Generator",
    description: "Convert any PDF into interactive flashcards instantly. Upload your study material and generate engaging flashcards with AI-powered question generation, flip animations, and downloadable formats. Free users get 5 flashcards, login for unlimited access.",
    platform: "General",
    category: "education",
    component: "PdfFlashcardGeneratorClient",
    image: "/images/tool-images/discovery-tool-preview.jpg",
    ctaText: "Generate Flashcards",
    features: [
      "Upload PDF documents to auto-generate flashcards",
      "Interactive flip animations and navigation",
      "AI-powered question and answer generation",
      "Download flashcards as PDF or printable format",
      "5 flashcards free, unlimited with login",
      "Customizable flashcard count and difficulty",
      "Supports multiple subjects and topics",
      "Export to Anki or other flashcard apps"
    ],
    keyFeatures: [
      {
        title: "Instant Flashcard Generation",
        description: "Turn any PDF into interactive flashcards in seconds using advanced AI algorithms.",
        icon: "bolt"
      },
      {
        title: "Interactive Learning",
        description: "Flip cards, navigate through sets, and track your progress with beautiful animations.",
        icon: "rotate-ccw"
      },
      {
        title: "Multiple Export Formats",
        description: "Download as PDF, printable cards, or export to popular flashcard apps.",
        icon: "download"
      },
      {
        title: "No Signup Needed",
        description: "Use the tool for free without creating an account.",
        icon: "user"
      }
    ],
    useCase: [
      {
        title: "For Students",
        description: "Convert textbooks, notes, and study materials into interactive flashcards.",
        examples: [
          "Upload textbook chapters for exam prep",
          "Convert lecture notes into flashcards",
          "Create study sets for different subjects",
          "Review material with spaced repetition"
        ]
      },
      {
        title: "For Teachers",
        description: "Generate flashcards for classroom activities and homework assignments.",
        examples: [
          "Create flashcards from lesson materials",
          "Generate review sets for students",
          "Prepare interactive classroom activities",
          "Share flashcards with students"
        ]
      }
    ],
    targetAudience: [
      "Students",
      "Teachers",
      "Tutors",
      "Language Learners",
      "Medical Students",
      "Lifelong Learners"
    ],
    benefits: [
      "Saves time on flashcard creation",
      "Interactive and engaging learning experience",
      "No technical skills required",
      "Free to use for basic features",
      "Multiple export and sharing options"
    ],
    faq: [
      {
        question: "How does the AI generate flashcards from PDFs?",
        answer: "The AI analyzes your uploaded PDF content and creates relevant questions and answers using natural language processing."
      },
      {
        question: "What file formats are supported?",
        answer: "Currently we support PDF files. More formats like DOCX and TXT will be added soon."
      },
      {
        question: "How many flashcards can I generate?",
        answer: "Free users can generate up to 5 flashcards. Login or sign up to access unlimited flashcards."
      },
      {
        question: "Can I export the flashcards?",
        answer: "Yes, you can download flashcards as PDF or export to popular flashcard apps like Anki."
      }
    ],
    pricing: {
      free: [
        "Unlimited basic flashcard generation",
        "Download as PDF",
        "No signup required"
      ],
      pro: [
        "Advanced customization options",
        "Export to Anki and other apps",
        "Flashcard analytics and progress tracking",
        "Priority support"
      ],
      price: "$7/month (coming soon)"
    }
  },
  {
    id: "summary-quiz-generator",
    name: "Summary to Quiz Generator",
    description: "Paste your summary or notes and instantly generate a quiz. Perfect for students and teachers who want to test understanding of summarized material.",
    platform: "General",
    category: "education",
    component: "SummaryQuizGeneratorClient",
    image: "/images/tool-images/discovery-tool-preview.jpg",
    ctaText: "Generate Quiz from Summary",
    features: [
      "Paste summary or notes to auto-generate quizzes",
      "Multiple question types: MCQ, True/False",
      "Download or share quizzes instantly",
      "No signup required for basic use",
      "AI-powered question generation",
      "Customizable number of questions and options",
      "Export to PDF or Google Forms"
    ],
    keyFeatures: [
      {
        title: "Instant Quiz Generation",
        description: "Turn any summary into a quiz in seconds using advanced AI algorithms.",
        icon: "bolt"
      },
      {
        title: "Multiple Formats",
        description: "Supports MCQ and True/False questions.",
        icon: "list"
      },
      {
        title: "Easy Export",
        description: "Download quizzes as PDF or export to Google Forms.",
        icon: "export"
      },
      {
        title: "No Signup Needed",
        description: "Use the tool for free without creating an account.",
        icon: "user"
      }
    ],
    useCase: [
      {
        title: "For Students",
        description: "Test your understanding of summarized material.",
        examples: [
          "Paste summary notes to generate quizzes",
          "Prepare for exams with custom quizzes",
          "Share quizzes with study groups"
        ]
      },
      {
        title: "For Teachers",
        description: "Quickly create quizzes from lesson summaries.",
        examples: [
          "Paste lesson summaries to generate quizzes",
          "Create practice tests for students",
          "Save time on manual question writing"
        ]
      }
    ],
    targetAudience: [
      "Students",
      "Teachers",
      "Tutors",
      "Content Creators",
      "Corporate Trainers",
      "Lifelong Learners"
    ],
    benefits: [
      "Saves time on quiz creation",
      "Engages learners with interactive content",
      "No technical skills required",
      "Free to use for basic features",
      "Instant sharing and export options"
    ],
    faq: [
      {
        question: "How does the AI generate quiz questions?",
        answer: "The AI analyzes your summary and creates relevant questions using natural language processing."
      },
      {
        question: "What question types are supported?",
        answer: "You can generate MCQ and True/False questions."
      },
      {
        question: "Is the tool really free?",
        answer: "Yes, basic quiz generation is completely free. Advanced features may require a subscription in the future."
      },
      {
        question: "Can I export the quiz?",
        answer: "Yes, you can download quizzes as PDF or export to Google Forms."
      }
    ],
    pricing: {
      free: [
        "Unlimited basic quiz generation",
        "Download as PDF",
        "No signup required"
      ],
      pro: [
        "Advanced export options",
        "Question editing",
        "Analytics and reporting",
        "Priority support"
      ],
      price: "$9/month (coming soon)"
    }
  },
  {
    id: "comparison-tool",
    name: "AI Comparison Tool",
    description: "Compare any two things side by side with an AI-generated table. Instantly see similarities and differences in a clear, attractive format.",
    platform: "General",
    category: "productivity",
    component: "ComparisonToolClient",
    image: "/images/tool-images/discovery-tool-preview.jpg",
    ctaText: "Compare Now",
    features: [
      "Compare any two things instantly",
      "AI-generated side-by-side table",
      "Clear, organized comparison points",
      "Attractive, modern design",
      "No signup required for basic use",
      "Download or share comparisons",
      "Supports products, concepts, companies, and more"
    ],
    keyFeatures: [
      {
        title: "Instant Comparison",
        description: "Get a detailed, side-by-side comparison in seconds.",
        icon: "columns"
      },
      {
        title: "Flexible Input",
        description: "Compare products, companies, concepts, or anything you want.",
        icon: "edit"
      },
      {
        title: "Beautiful Output",
        description: "Modern, easy-to-read comparison tables.",
        icon: "layout"
      },
      {
        title: "No Signup Needed",
        description: "Use the tool for free without creating an account.",
        icon: "user"
      }
    ],
    useCase: [
      {
        title: "For Shoppers",
        description: "Compare products before buying.",
        examples: [
          "Compare iPhone vs Samsung Galaxy",
          "Laptop A vs Laptop B"
        ]
      },
      {
        title: "For Students & Professionals",
        description: "Compare concepts, frameworks, or companies for research or presentations.",
        examples: [
          "React vs Angular",
          "Company X vs Company Y"
        ]
      }
    ],
    targetAudience: [
      "Shoppers",
      "Students",
      "Professionals",
      "Researchers",
      "Marketers",
      "Anyone"
    ],
    benefits: [
      "Saves time on research",
      "Clear, unbiased comparisons",
      "No technical skills required",
      "Free to use for basic features",
      "Instant sharing and export options"
    ],
    faq: [
      {
        question: "How does the AI generate comparisons?",
        answer: "The AI analyzes both inputs and creates a clear, point-by-point comparison table."
      },
      {
        question: "What can I compare?",
        answer: "Anything! Products, companies, concepts, frameworks, and more."
      },
      {
        question: "Is the tool free?",
        answer: "Yes, basic comparisons are free. Advanced features may require a subscription in the future."
      },
      {
        question: "Can I export the comparison?",
        answer: "Yes, you can download or share the comparison table."
      }
    ],
    pricing: {
      free: [
        "Unlimited basic comparisons",
        "Download as PDF",
        "No signup required"
      ],
      pro: [
        "Advanced export options",
        "Bulk comparison",
        "Analytics and reporting",
        "Priority support"
      ],
      price: "$5/month (coming soon)"
    }
  },
  {
    id: "exam-preparation-generator",
    name: "Exam Preparation Generator",
    description: "Upload a PDF to instantly generate study notes and a customizable exam paper. Choose question types (MCQ, Short Answer, True/False), set total marks, write answers, self-mark, and download your question paper.",
    platform: "General",
    category: "education",
    component: "ExamPreparationGeneratorClient",
    image: "/images/tool-images/discovery-tool-preview.jpg",
    ctaText: "Generate Exam & Notes",
    features: [
      "Upload PDF documents to auto-generate notes and exam papers",
      "Choose question types: MCQ, Short Answer, True/False",
      "Set total marks for the exam",
      "Write answers and self-mark after submission",
      "Download question paper as PDF",
      "Interactive and customizable exam creation",
      "AI-powered summarization and question generation",
      "No signup required for basic use"
    ],
    keyFeatures: [
      {
        title: "Instant Notes & Exam Generation",
        description: "Turn any PDF into summarized notes and a full exam paper in seconds using advanced AI algorithms.",
        icon: "bolt"
      },
      {
        title: "Customizable Exams",
        description: "Choose question types and set total marks for your exam.",
        icon: "edit"
      },
      {
        title: "Self-Assessment",
        description: "Write answers, assign your own marks, and track your progress.",
        icon: "check-circle"
      },
      {
        title: "Easy Export",
        description: "Download your question paper as a PDF for offline practice.",
        icon: "download"
      }
    ],
    useCase: [
      {
        title: "For Students",
        description: "Prepare for exams by generating practice papers and notes from your study material.",
        examples: [
          "Upload textbook chapters for instant notes and exams",
          "Practice with AI-generated questions",
          "Self-mark your answers for effective revision"
        ]
      },
      {
        title: "For Teachers",
        description: "Create exam papers and study notes for classroom or homework assignments.",
        examples: [
          "Generate question papers from lesson materials",
          "Share notes and practice exams with students",
          "Customize exams for different subjects and difficulty levels"
        ]
      }
    ],
    targetAudience: [
      "Students",
      "Teachers",
      "Tutors",
      "Exam Aspirants",
      "Lifelong Learners"
    ],
    benefits: [
      "Saves time on exam and note creation",
      "Customizable and interactive practice",
      "No technical skills required",
      "Free to use for basic features",
      "Instant export and sharing options"
    ],
    faq: [
      {
        question: "How does the AI generate notes and exam questions?",
        answer: "The AI analyzes your uploaded PDF content and creates summarized notes and relevant exam questions using natural language processing."
      },
      {
        question: "What question types are supported?",
        answer: "You can generate MCQ, Short Answer, and True/False questions."
      },
      {
        question: "Can I set the total marks for the exam?",
        answer: "Yes, you can specify the total marks and the AI will distribute them across the questions."
      },
      {
        question: "Can I download the generated exam paper?",
        answer: "Yes, you can download the question paper as a PDF."
      }
    ],
    pricing: {
      free: [
        "Unlimited basic exam and note generation",
        "Download as PDF",
        "No signup required"
      ],
      pro: [
        "Advanced customization options",
        "Bulk exam generation",
        "Analytics and progress tracking",
        "Priority support"
      ],
      price: "$10/month (coming soon)"
    }
  }
];

export const getToolById = (id: string): Tool | undefined => {
  return tools.find(tool => tool.id === id);
};