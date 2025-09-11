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
  comment: {
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
interface CommentPDFProps {
  content: string;
  platform: string;
  tone: string;
  length: string;
  comment: string;
}
const CommentPDF = ({ content, platform, tone, length, comment }: CommentPDFProps) => (
  <Document>
    <Page size="A4" style={pdfStyles.page} wrap>
      <Text style={pdfStyles.title}>Generated Comment</Text>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Content:</Text>
        <Text style={pdfStyles.value}>{content}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Platform:</Text>
        <Text style={pdfStyles.value}>{platform}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Tone:</Text>
        <Text style={pdfStyles.value}>{tone}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Length:</Text>
        <Text style={pdfStyles.value}>{length}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.label}>Comment:</Text>
        <Text style={pdfStyles.comment}>{comment}</Text>
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

const SAMPLE_CONTENT = 'Just finished reading "The Great Gatsby" - what an amazing classic!';
const SAMPLE_PLATFORM = 'Instagram';
const SAMPLE_TONE = 'Enthusiastic';
const SAMPLE_LENGTH = 'Short';

export default function CommentGeneratorClient() {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('');
  const [tone, setTone] = useState('');
  const [length, setLength] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setComment('');
    setShowResult(false);
    try {
      const res = await fetch('/api/tools/comment-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platform, tone, length }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate comment');
      if (!data.comment) {
        throw new Error('Comment generation failed. Please try again.');
      }
      setComment(data.comment);
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
    setComment('');
    setError(null);
  };

  const handleFillSample = () => {
    setContent(SAMPLE_CONTENT);
    setPlatform(SAMPLE_PLATFORM);
    setTone(SAMPLE_TONE);
    setLength(SAMPLE_LENGTH);
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
              <label className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100" htmlFor="content">Content to Comment On</label>
              <textarea
                id="content"
                className="border border-input dark:border-zinc-700 rounded-lg p-3 h-32 resize-vertical bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition w-full"
                placeholder="Paste the post, article, or content you want to comment on..."
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100" htmlFor="platform">Platform</label>
                <select
                  id="platform"
                  className="border border-input dark:border-zinc-700 rounded-lg p-3 bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition w-full"
                  value={platform}
                  onChange={e => setPlatform(e.target.value)}
                  required
                >
                  <option value="">Select platform</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Twitter">Twitter</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="YouTube">YouTube</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Reddit">Reddit</option>
                  <option value="Blog">Blog</option>
                  <option value="Forum">Forum</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100" htmlFor="tone">Comment Tone</label>
                <select
                  id="tone"
                  className="border border-input dark:border-zinc-700 rounded-lg p-3 bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition w-full"
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  required
                >
                  <option value="">Select tone</option>
                  <option value="Supportive">Supportive</option>
                  <option value="Enthusiastic">Enthusiastic</option>
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Humorous">Humorous</option>
                  <option value="Constructive">Constructive</option>
                  <option value="Questioning">Questioning</option>
                  <option value="Appreciative">Appreciative</option>
                </select>
              </div>
              <div>
                <label className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100" htmlFor="length">Comment Length</label>
                <select
                  id="length"
                  className="border border-input dark:border-zinc-700 rounded-lg p-3 bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition w-full"
                  value={length}
                  onChange={e => setLength(e.target.value)}
                  required
                >
                  <option value="">Select length</option>
                  <option value="Short">Short (1-2 sentences)</option>
                  <option value="Medium">Medium (2-3 sentences)</option>
                  <option value="Long">Long (3+ sentences)</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition self-end"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Comment'}
            </button>
            {error && <div className="text-red-500 mt-2 font-semibold">{error}</div>}
          </form>
        ) : (
          <div className="w-full flex flex-col gap-6 animate-slide-in mt-4">
            <div className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow p-6 border border-gray-200 dark:border-zinc-700 min-h-[300px] flex flex-col relative">
              <div className="absolute top-4 right-4 z-10">
                <PDFDownloadLink
                  document={<CommentPDF content={content} platform={platform} tone={tone} length={length} comment={comment} />}
                  fileName="generated-comment.pdf"
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
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Generated Comment</h2>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Platform: </span>
                <span className="text-lg text-indigo-700 dark:text-indigo-400">{platform}</span>
              </div>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Tone: </span>
                <span className="text-lg text-indigo-700 dark:text-indigo-400">{tone}</span>
              </div>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Length: </span>
                <span className="text-lg text-indigo-700 dark:text-indigo-400">{length}</span>
              </div>
              <div className="mb-4">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Comment:</span>
                <div className="mt-2 text-base text-gray-800 dark:text-gray-200 whitespace-pre-line">{comment}</div>
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