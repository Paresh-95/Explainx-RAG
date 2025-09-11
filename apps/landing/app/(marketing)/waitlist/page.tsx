// app/waitlist/page.tsx
import { Metadata } from 'next';
import WaitlistForm from './_components/waitlist-form';

export const metadata: Metadata = {
  title: 'ExplainX: AI Learning Platform for the Next Generation',
  description: 'Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.',
  keywords: [
    'ai agents waitlist',
    'custom ai development',
    'langchain platform',
    'crewai solutions',
    'business automation',
    'ai agents for seo',
    'ai agents for marketing',
    'enterprise ai solutions',
    'free ai agents access',
    'ai automation platform',
    'early access ai agents'
  ].join(', '),
  openGraph: {
    title: 'ExplainX: AI Learning Platform for the Next Generation',
    description: 'Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.',
    type: 'website',
    url: 'https://explainx.ai/waitlist',
    siteName: 'ExplainX',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ExplainX AI Platform Waitlist'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExplainX: AI Learning Platform for the Next Generation',
    description: 'Master AI with hands-on projects, intelligent tutors, and interactive content. Learn how to build with LangChain, CrewAI, and other cutting-edge tools. Empower your career with real-world AI skills and personalized learning paths.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
};

export default function WaitlistPage() {
  return (
    <main className="overflow-hidden">
      <div
        aria-hidden
        className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
        <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(147,51,234,0.08)_0,rgba(147,51,234,0.02)_50%,rgba(147,51,234,0)_80%)]" />
        <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(147,51,234,0.06)_0,rgba(147,51,234,0.02)_80%,transparent_100%)] [translate:5%_-50%]" />
        <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(147,51,234,0.04)_0,rgba(147,51,234,0.02)_80%,transparent_100%)]" />
      </div>
      
      <section className="relative bg-white dark:bg-[#1F1328]">
        <div className="absolute top-0 z-[0] h-screen w-screen bg-white dark:bg-purple-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="relative pt-24 md:pt-36">
          <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
          
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
              <div className="max-w-2xl mx-auto text-center mb-12">
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-cal font-bold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">
                  Join Our Platform Waitlist
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Be first to access our revolutionary AI community development platform
                </p>
              </div>
              
              <WaitlistForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}