'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

// PDF styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 13,
    fontFamily: 'Helvetica',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 15,
  },
  value: {
    marginBottom: 8,
    fontSize: 13,
  },
  curriculum: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#888',
  },
});

// PDF Document component
interface CurriculumPDFProps {
  subject: string;
  gradeLevel: string;
  learningObjectives: string;
  duration: string;
  curriculum: string;
}
const CurriculumPDF = ({ subject, gradeLevel, learningObjectives, duration, curriculum }: CurriculumPDFProps) => (
  <Document>
    <Page size="A4" style={pdfStyles.page} wrap>
      <Text style={pdfStyles.title}>Curriculum Plan</Text>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Subject:</Text>
        <Text style={pdfStyles.value}>{subject}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Grade Level:</Text>
        <Text style={pdfStyles.value}>{gradeLevel}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Learning Objectives:</Text>
        <Text style={pdfStyles.value}>{learningObjectives}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Duration:</Text>
        <Text style={pdfStyles.value}>{duration}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Curriculum Plan:</Text>
        <Text style={pdfStyles.curriculum}>{curriculum}</Text>
      </View>
      <Text
        style={pdfStyles.footer}
        render={() => (
          <Link src="https://explainx.ai">Powered by ExplainX</Link>
        )}
        fixed
      />
    </Page>
  </Document>
);

const SAMPLE_SUBJECT = 'Mathematics';
const SAMPLE_GRADE_LEVEL = 'Grade 5';
const SAMPLE_LEARNING_OBJECTIVES = 'Students will understand basic fractions, decimals, and percentages. They will be able to solve word problems involving these concepts and apply them to real-world situations.';
const SAMPLE_DURATION = '6 weeks';

export default function CurriculumPlannerClient() {
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [duration, setDuration] = useState('');
  const [curriculum, setCurriculum] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCurriculum('');
    setShowResult(false);
    try {
      const res = await fetch('/api/tools/curriculum-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, gradeLevel, learningObjectives, duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate curriculum plan');
      if (!data.curriculum) {
        throw new Error('Curriculum planning failed. Please try again.');
      }
      setCurriculum(data.curriculum);
      setShowResult(true);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setShowResult(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowResult(false);
    setCurriculum('');
    setError(null);
  };

  const handleFillSample = () => {
    setSubject(SAMPLE_SUBJECT);
    setGradeLevel(SAMPLE_GRADE_LEVEL);
    setLearningObjectives(SAMPLE_LEARNING_OBJECTIVES);
    setDuration(SAMPLE_DURATION);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-500 pt-24 md:pt-28 pb-12">
      <div className="w-full max-w-4xl px-4 py-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 flex flex-col items-center animate-fade-in">
        {/* Try it now section */}
        <div className="w-full flex flex-col items-center mb-6">
          <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
            <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Try it now.</span>
            <span className="text-2xl md:text-3xl font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 rounded-md ml-2">It takes 10s</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg text-gray-900 dark:text-gray-100">Use your own data or</span>
            <button
              type="button"
              className="ml-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition text-base"
              onClick={handleFillSample}
            >
              Fill in with sample
            </button>
          </div>
        </div>
        {!showResult ? (
          <form
            onSubmit={handlePlan}
            className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col gap-6 border border-gray-200 dark:border-zinc-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100" htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  type="text"
                  className="border border-input dark:border-zinc-700 rounded-lg p-3 bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition w-full"
                  placeholder="e.g., Mathematics, Science, English..."
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100" htmlFor="gradeLevel">Grade Level</label>
                <input
                  id="gradeLevel"
                  type="text"
                  className="border border-input dark:border-zinc-700 rounded-lg p-3 bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition w-full"
                  placeholder="e.g., Grade 5, High School, College..."
                  value={gradeLevel}
                  onChange={e => setGradeLevel(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100" htmlFor="learningObjectives">Learning Objectives</label>
              <textarea
                id="learningObjectives"
                className="border border-input dark:border-zinc-700 rounded-lg p-3 h-32 resize-vertical bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition w-full"
                placeholder="Describe what students should learn and be able to do by the end of this curriculum..."
                value={learningObjectives}
                onChange={e => setLearningObjectives(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100" htmlFor="duration">Duration</label>
              <input
                id="duration"
                type="text"
                className="border border-input dark:border-zinc-700 rounded-lg p-3 bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition w-full"
                placeholder="e.g., 6 weeks, 1 semester, 3 months..."
                value={duration}
                onChange={e => setDuration(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition self-end"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Curriculum'}
            </button>
            {error && <div className="text-red-500 mt-2 font-semibold">{error}</div>}
          </form>
        ) : (
          <div className="w-full flex flex-col gap-6 animate-slide-in mt-4">
            <div className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow p-6 border border-gray-200 dark:border-zinc-700 min-h-[300px] flex flex-col relative">
              <div className="absolute top-4 right-4 z-10">
                <PDFDownloadLink
                  document={<CurriculumPDF subject={subject} gradeLevel={gradeLevel} learningObjectives={learningObjectives} duration={duration} curriculum={curriculum} />}
                  fileName="curriculum-plan.pdf"
                  style={{ textDecoration: 'none' }}
                >
                  {({ loading }) => (
                    <button
                      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold text-base shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-500 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
                      title="Download as PDF"
                    >
                      <Download className="w-5 h-5" />
                      {loading ? 'Preparing PDF...' : 'Download PDF'}
                    </button>
                  )}
                </PDFDownloadLink>
              </div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Curriculum Plan</h2>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Subject: </span>
                <span className="text-lg text-indigo-700 dark:text-indigo-400">{subject}</span>
              </div>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Grade Level: </span>
                <span className="text-lg text-indigo-700 dark:text-indigo-400">{gradeLevel}</span>
              </div>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Duration: </span>
                <span className="text-lg text-indigo-700 dark:text-indigo-400">{duration}</span>
              </div>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Curriculum Plan:</span>
                <div className="mt-2 text-base text-gray-800 dark:text-gray-200 whitespace-pre-line">{curriculum}</div>
              </div>
              <button
                onClick={handleBack}
                className="w-full mt-4 bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 py-2 rounded-xl font-semibold shadow hover:bg-gray-300 dark:hover:bg-zinc-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Back & Edit
              </button>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.7s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </main>
  );
} 