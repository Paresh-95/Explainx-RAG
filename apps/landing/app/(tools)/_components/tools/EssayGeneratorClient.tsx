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
  essay: {
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
interface EssayPDFProps {
  topic: string;
  essayType: string;
  length: string;
  style: string;
  essay: string;
}
const EssayPDF = ({ topic, essayType, length, style, essay }: EssayPDFProps) => (
  <Document>
    <Page size="A4" style={pdfStyles.page} wrap>
      <Text style={pdfStyles.title}>Generated Essay</Text>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Topic:</Text>
        <Text style={pdfStyles.value}>{topic}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Type:</Text>
        <Text style={pdfStyles.value}>{essayType}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Length:</Text>
        <Text style={pdfStyles.value}>{length}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Style:</Text>
        <Text style={pdfStyles.value}>{style}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Essay:</Text>
        <Text style={pdfStyles.essay}>{essay}</Text>
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

const SAMPLE_TOPIC = 'The Impact of Social Media on Modern Communication';
const SAMPLE_ESSAY_TYPE = 'Argumentative';
const SAMPLE_LENGTH = '500-750 words';
const SAMPLE_STYLE = 'Academic';

export default function EssayGeneratorClient() {
  const [topic, setTopic] = useState('');
  const [essayType, setEssayType] = useState('');
  const [length, setLength] = useState('');
  const [style, setStyle] = useState('');
  const [essay, setEssay] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEssay('');
    setShowResult(false);
    try {
      const res = await fetch('/api/tools/essay-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, essayType, length, style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate essay');
      if (!data.essay) {
        throw new Error('Essay generation failed. Please try again.');
      }
      setEssay(data.essay);
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
    setEssay('');
    setError(null);
  };

  const handleFillSample = () => {
    setTopic(SAMPLE_TOPIC);
    setEssayType(SAMPLE_ESSAY_TYPE);
    setLength(SAMPLE_LENGTH);
    setStyle(SAMPLE_STYLE);
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
            onSubmit={handleGenerate}
            className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col gap-6 border border-gray-200 dark:border-zinc-700"
          >
            <div>
              <label className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100" htmlFor="topic">Essay Topic</label>
              <input
                id="topic"
                type="text"
                className="border border-input dark:border-zinc-700 rounded-lg p-3 bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition w-full"
                placeholder="e.g., The Impact of Social Media on Modern Communication"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100" htmlFor="essayType">Essay Type</label>
                <select
                  id="essayType"
                  className="border border-input dark:border-zinc-700 rounded-lg p-3 bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition w-full"
                  value={essayType}
                  onChange={e => setEssayType(e.target.value)}
                  required
                >
                  <option value="">Select type</option>
                  <option value="Argumentative">Argumentative</option>
                  <option value="Expository">Expository</option>
                  <option value="Narrative">Narrative</option>
                  <option value="Descriptive">Descriptive</option>
                  <option value="Persuasive">Persuasive</option>
                  <option value="Analytical">Analytical</option>
                </select>
              </div>
              <div>
                <label className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100" htmlFor="length">Length</label>
                <select
                  id="length"
                  className="border border-input dark:border-zinc-700 rounded-lg p-3 bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition w-full"
                  value={length}
                  onChange={e => setLength(e.target.value)}
                  required
                >
                  <option value="">Select length</option>
                  <option value="250-500 words">250-500 words</option>
                  <option value="500-750 words">500-750 words</option>
                  <option value="750-1000 words">750-1000 words</option>
                  <option value="1000-1500 words">1000-1500 words</option>
                  <option value="1500+ words">1500+ words</option>
                </select>
              </div>
              <div>
                <label className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100" htmlFor="style">Writing Style</label>
                <select
                  id="style"
                  className="border border-input dark:border-zinc-700 rounded-lg p-3 bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition w-full"
                  value={style}
                  onChange={e => setStyle(e.target.value)}
                  required
                >
                  <option value="">Select style</option>
                  <option value="Academic">Academic</option>
                  <option value="Casual">Casual</option>
                  <option value="Professional">Professional</option>
                  <option value="Creative">Creative</option>
                  <option value="Formal">Formal</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition self-end"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Essay'}
            </button>
            {error && <div className="text-red-500 mt-2 font-semibold">{error}</div>}
          </form>
        ) : (
          <div className="w-full flex flex-col gap-6 animate-slide-in mt-4">
            <div className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow p-6 border border-gray-200 dark:border-zinc-700 min-h-[300px] flex flex-col relative">
              <div className="absolute top-4 right-4 z-10">
                <PDFDownloadLink
                  document={<EssayPDF topic={topic} essayType={essayType} length={length} style={style} essay={essay} />}
                  fileName="generated-essay.pdf"
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
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Generated Essay</h2>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Topic: </span>
                <span className="text-lg text-indigo-700 dark:text-indigo-400">{topic}</span>
              </div>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Type: </span>
                <span className="text-lg text-indigo-700 dark:text-indigo-400">{essayType}</span>
              </div>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Length: </span>
                <span className="text-lg text-indigo-700 dark:text-indigo-400">{length}</span>
              </div>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Style: </span>
                <span className="text-lg text-indigo-700 dark:text-indigo-400">{style}</span>
              </div>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Essay:</span>
                <div className="mt-2 text-base text-gray-800 dark:text-gray-200 whitespace-pre-line">{essay}</div>
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