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
  grade: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 12,
  },
  feedback: {
    fontSize: 13,
    marginBottom: 12,
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
interface GradingPDFProps {
  instructions: string;
  answer: string;
  grade: string;
  feedback: string;
}
const GradingPDF = ({ instructions, answer, grade, feedback }: GradingPDFProps) => (
  <Document>
    <Page size="A4" style={pdfStyles.page} wrap>
      <Text style={pdfStyles.title}>AI Grading Report</Text>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Assignment Instructions:</Text>
        <Text style={pdfStyles.value}>{instructions}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Student Answer:</Text>
        <Text style={pdfStyles.value}>{answer}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Grade:</Text>
        <Text style={pdfStyles.grade}>{grade}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Feedback:</Text>
        <Text style={pdfStyles.feedback}>{feedback}</Text>
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

const SAMPLE_INSTRUCTIONS =
  'Write a short essay on the importance of environmental conservation. Your answer should include at least two reasons why it is important and suggest one way individuals can help.';
const SAMPLE_ANSWER =
  'Environmental conservation is crucial because it helps preserve natural resources for future generations and maintains biodiversity. Without conservation, we risk losing valuable species and depleting resources like clean water and air. One way individuals can help is by reducing plastic use and recycling more.';

export default function GradingToolClient() {
  const [instructions, setInstructions] = useState('');
  const [answer, setAnswer] = useState('');
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGrade('');
    setFeedback('');
    setShowResult(false);
    try {
      const res = await fetch('/api/tools/ai-grading-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructions, answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to grade answer');
      if (!data.grade || !data.feedback) {
        throw new Error('Grading failed. Please try again.');
      }
      setGrade(data.grade);
      setFeedback(data.feedback);
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
    setGrade('');
    setFeedback('');
    setError(null);
  };

  const handleFillSample = () => {
    setInstructions(SAMPLE_INSTRUCTIONS);
    setAnswer(SAMPLE_ANSWER);
  };

  // File import logic
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAnswer(ev.target?.result as string);
      };
      reader.onerror = () => setImportError('Failed to read file.');
      reader.readAsText(file);
    } else if (ext === 'pdf' || ext === 'docx') {
      setImportError('PDF/DOCX import coming soon! For now, please use TXT files.');
      // TODO: Add PDF/DOCX extraction logic here (e.g., using pdfjs or mammoth)
    } else {
      setImportError('Unsupported file type. Please upload a TXT file.');
    }
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
            onSubmit={handleGrade}
            className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col gap-6 border border-gray-200 dark:border-zinc-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100" htmlFor="instructions">Assignment instructions</label>
                <textarea
                  id="instructions"
                  className="border border-input dark:border-zinc-700 rounded-lg p-3 h-40 resize-vertical bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition w-full"
                  placeholder="Enter the assignment instructions here..."
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100" htmlFor="answer">Student Answer</label>
                <textarea
                  id="answer"
                  className="border border-input dark:border-zinc-700 rounded-lg p-3 h-40 resize-vertical bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition w-full"
                  placeholder="Enter the student answer here..."
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  required
                />
                <div className="mt-2 flex items-center gap-2">
                  <label htmlFor="file-upload" className="text-blue-700 cursor-pointer underline text-sm font-medium">Import essay (can be handwritten)</label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".txt,.pdf,.docx"
                    className="hidden"
                    onChange={handleFileImport}
                  />
                  {importError && <span className="text-red-500 text-xs ml-2">{importError}</span>}
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition self-end"
              disabled={loading}
            >
              {loading ? 'Grading...' : 'Grade'}
            </button>
            {error && <div className="text-red-500 mt-2 font-semibold">{error}</div>}
          </form>
        ) : (
          <div className="w-full flex flex-col gap-6 animate-slide-in mt-4">
            <div className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow p-6 border border-gray-200 dark:border-zinc-700 min-h-[300px] flex flex-col relative">
              <div className="absolute top-4 right-4 z-10">
                <PDFDownloadLink
                  document={<GradingPDF instructions={instructions} answer={answer} grade={grade} feedback={feedback} />}
                  fileName="grading-report.pdf"
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
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Grading Result</h2>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Grade: </span>
                <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{grade}</span>
              </div>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Feedback:</span>
                <div className="mt-2 text-base text-gray-800 dark:text-gray-200 whitespace-pre-line">{feedback}</div>
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