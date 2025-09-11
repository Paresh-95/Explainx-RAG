'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Link, Font } from '@react-pdf/renderer';

function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center border border-gray-200 dark:border-zinc-700">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Login or Sign Up Required</h2>
        <p className="mb-6 text-center text-gray-700 dark:text-gray-300">To generate more than 20 questions, please login or sign up.</p>
        <div className="flex gap-4 w-full justify-center">
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition w-1/2"
            onClick={() => window.location.href = '/login'}
          >
            Login
          </button>
          <button
            className="bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-zinc-700 transition w-1/2"
            onClick={() => window.location.href = '/signup'}
          >
            Sign Up
          </button>
        </div>
        <button
          className="mt-6 text-sm text-gray-500 dark:text-gray-400 hover:underline"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

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
  question: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  option: {
    marginLeft: 16,
    marginBottom: 4,
    fontSize: 13,
  },
  correct: {
    color: '#15803d', // green-700
    fontWeight: 'bold',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginVertical: 12,
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
interface QuizItem {
  question: string;
  options: string[];
  answerIndex: number;
}
interface QuizPDFProps {
  quiz: QuizItem[];
}
const QuizPDF: React.FC<QuizPDFProps> = ({ quiz }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page} wrap>
      <Text style={pdfStyles.title}>AI Generated Quiz</Text>
      {quiz.map((q: QuizItem, idx: number) => (
        <View key={idx} wrap={false}>
          <Text style={pdfStyles.question}>{`${idx + 1}. ${q.question}`}</Text>
          {q.options.map((opt: string, oidx: number) => (
            <Text
              key={oidx}
              style={
                oidx === q.answerIndex
                  ? [pdfStyles.option, pdfStyles.correct]
                  : pdfStyles.option
              }
            >
              {`${String.fromCharCode(65 + oidx)}. ${opt}`}
              {oidx === q.answerIndex ? ' (Correct)' : ''}
            </Text>
          ))}
          <View style={pdfStyles.separator} />
        </View>
      ))}
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

export default function QuizMakerClient() {
  const [inputText, setInputText] = useState('');
  const [quiz, setQuiz] = useState<any[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Quiz settings state
  const [numQuestions, setNumQuestions] = useState(3);
  const [numOptions, setNumOptions] = useState(4);
  const [difficulty, setDifficulty] = useState('Medium');
  // Remove language state
  // const [language, setLanguage] = useState('English');
  const [questionType, setQuestionType] = useState('MCQ');
  const [showModal, setShowModal] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Reset answers when quiz changes
  React.useEffect(() => {
    setUserAnswers(Array(quiz.length).fill(-1));
    setSubmitted(false);
  }, [quiz]);

  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 20) {
      setShowModal(true);
      setNumQuestions(20);
    } else {
      setNumQuestions(value);
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQuiz([]);
    try {
      const res = await fetch('/api/tools/ai-quize-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          numQuestions,
          numOptions,
          difficulty,
          // language, // remove from request
          questionType,
        }),
      });
      const data = await res.json();
      console.log('Quiz API response:', data);
      if (!res.ok) throw new Error(data.error || 'Failed to generate quiz');
      if (!Array.isArray(data.quiz) || data.quiz.length === 0 || !data.quiz[0].question) {
        throw new Error('Quiz generation failed. Please try again with a different description.');
      }
      setQuiz(data.quiz);
      setShowQuiz(true);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setShowQuiz(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (qIdx: number, oIdx: number) => {
    if (submitted) return;
    const updated = [...userAnswers];
    updated[qIdx] = oIdx;
    setUserAnswers(updated);
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
  };

  // Add a function to go back to edit mode
  const handleBackToEdit = () => {
    setShowQuiz(false);
    setQuiz([]);
    setUserAnswers([]);
    setSubmitted(false);
    setError(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-500 pt-24 md:pt-28 pb-12">
      <LoginModal open={showModal} onClose={() => setShowModal(false)} />
      <div className="w-full max-w-5xl px-4 py-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 flex flex-col items-center animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold heading text-center mb-6 text-gray-900 dark:text-gray-100">AI Quiz Maker</h1>
        {/* Settings Panel */}
        {!showQuiz && (
          <form className="w-full bg-gray-50 dark:bg-zinc-800 rounded-xl shadow p-6 flex flex-col gap-4 border border-gray-200 dark:border-zinc-700 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-gray-900 dark:text-gray-100">Number of Questions</label>
                <input type="number" min={1} max={20} value={numQuestions} onChange={handleNumQuestionsChange} className="border border-input dark:border-zinc-700 rounded-lg p-2 w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
              </div>
              <div>
                <label className="font-medium text-gray-900 dark:text-gray-100">Options per Question</label>
                <input type="number" min={2} max={6} value={numOptions} onChange={e => setNumOptions(Number(e.target.value))} className="border border-input dark:border-zinc-700 rounded-lg p-2 w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
              </div>
              <div>
                <label className="font-medium text-gray-900 dark:text-gray-100">Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="border border-input dark:border-zinc-700 rounded-lg p-2 w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition">
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div>
                <label className="font-medium text-gray-900 dark:text-gray-100">Question Type</label>
                <select value={questionType} onChange={e => setQuestionType(e.target.value)} className="border border-input dark:border-zinc-700 rounded-lg p-2 w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition">
                  <option value="MCQ">Multiple Choice</option>
                  <option value="TrueFalse">True/False</option>
                </select>
              </div>
            </div>
          </form>
        )}
        {/* Single input view before quiz generation */}
        {!showQuiz ? (
          <form
            onSubmit={handleGenerateQuiz}
            className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col gap-4 border border-gray-200 dark:border-zinc-700"
          >
            <label htmlFor="quiz-text" className="font-semibold mb-2 text-lg text-gray-900 dark:text-gray-100">
              Paste your text or description
            </label>
            <textarea
              id="quiz-text"
              className="border border-input dark:border-zinc-700 rounded-lg p-3 h-40 resize-vertical bg-background dark:bg-zinc-800 text-foreground dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none transition"
              placeholder="Paste your study material, article, or notes here..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Quiz'}
            </button>
            {error && <div className="text-red-500 mt-2 font-semibold">{error}</div>}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2"><code></code> </p>
          </form>
        ) : (
          // Split view after quiz generation
          <div className="w-full flex flex-col md:flex-row gap-6 animate-slide-in mt-4">
            {/* Only one main panel for quiz and preview */}
            <div className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow p-6 border border-gray-200 dark:border-zinc-700 min-h-[400px] flex flex-col relative">
              {/* Provided Text Preview at the top */}
              <div className="mb-6">
                <label className="block font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">Provided Text Preview</label>
                <div className="w-full min-h-[80px] rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 p-4 text-base shadow-sm whitespace-pre-line">
                  {inputText}
                </div>
              </div>
              {/* Download PDF button - upper right corner, full button */}
              <div className="absolute top-4 right-4 z-10">
                <PDFDownloadLink
                  document={<QuizPDF quiz={quiz} />}
                  fileName="quiz.pdf"
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
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Generated Quiz</h2>
              {loading ? (
                <div className="text-gray-400 dark:text-gray-500 flex items-center justify-center h-full min-h-[200px]">Generating quiz...</div>
              ) : quiz.length > 0 ? (
                <ol className="space-y-6 flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
                  {quiz.map((q, idx) => (
                    <li key={idx}>
                      <div className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                        {idx + 1}. {q.question}
                      </div>
                      <div className="flex flex-col gap-2">
                        {q.options.map((opt: string, oidx: number) => {
                          let optionColor = '';
                          if (submitted) {
                            if (oidx === q.answerIndex) {
                              optionColor = 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 font-semibold';
                            } else if (userAnswers[idx] === oidx && oidx !== q.answerIndex) {
                              optionColor = 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 font-semibold';
                            } else {
                              optionColor = 'bg-transparent';
                            }
                          }
                          return (
                            <label
                              key={oidx}
                              className={`flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 transition ${optionColor}`}
                            >
                              <input
                                type="radio"
                                name={`q${idx}`}
                                className="rounded-full border-gray-400 accent-indigo-600"
                                checked={userAnswers[idx] === oidx}
                                onChange={() => handleOptionChange(idx, oidx)}
                                disabled={submitted}
                              />
                              <span className="text-gray-900 dark:text-gray-100">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="text-gray-400 dark:text-gray-500 flex items-center justify-center h-full min-h-[200px]">No quiz generated yet.</div>
              )}
              {/* Submit button below quiz */}
              <button
                className="mt-8 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition self-end disabled:opacity-60"
                onClick={handleSubmitQuiz}
                disabled={loading || submitted || userAnswers.some(a => a === -1)}
              >
                {submitted ? 'Submitted' : 'Submit'}
              </button>
              <button
                onClick={handleBackToEdit}
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