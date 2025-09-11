'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// PDF styles for a cover-letter-like, attractive theme
const pdfStyles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Helvetica',
    backgroundColor: '#f8fafc',
    color: '#222',
    minHeight: '100%',
    fontSize: 11, // Main body font size
  },
  header: {
    textAlign: 'center',
    marginBottom: 16,
    paddingBottom: 6,
    borderBottom: '2px solid #6366f1',
  },
  schoolName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4338ca',
    marginBottom: 2,
  },
  schoolLocation: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  year: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  section: {
    marginTop: 14,
    marginBottom: 8,
    padding: 10,
    borderRadius: 7,
    backgroundColor: '#fff',
    boxShadow: '0 1px 4px #e0e7ef',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#0f172a',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 2,
  },
  label: {
    fontWeight: 'bold',
    color: '#0f172a',
    marginRight: 4,
    fontSize: 11,
  },
  value: {
    color: '#222',
    marginBottom: 2,
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  col: {
    flex: 1,
  },
  strengths: {
    color: '#15803d',
    fontWeight: 'bold',
    marginBottom: 3,
    fontSize: 12,
  },
  improvements: {
    color: '#ea580c',
    fontWeight: 'bold',
    marginBottom: 3,
    fontSize: 12,
  },
  recommendations: {
    color: '#2563eb',
    fontWeight: 'bold',
    marginBottom: 3,
    fontSize: 12,
  },
  comments: {
    color: '#0f172a',
    marginTop: 5,
    fontSize: 11,
    lineHeight: 1.5,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8,
  },
  signatureBox: {
    flex: 1,
    alignItems: 'center',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 6,
    fontSize: 10,
    color: '#64748b',
  },
  seal: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #cbd5e1',
    borderRadius: 50,
    width: 55,
    height: 55,
    alignSelf: 'center',
  },
  sealText: {
    color: '#94a3b8',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 16,
  },
});

interface ReportCardPDFProps {
  studentName: string;
  gradeLevel: string;
  subject: string;
  term: string;
  schoolName: string;
  schoolAddress: string;
  principalName: string;
  teacherName: string;
  report: string;
}

// PDF Document component (well-formatted, cover-letter style)
const ReportCardPDF = ({
  studentName,
  gradeLevel,
  subject,
  term,
  schoolName,
  schoolAddress,
  principalName,
  teacherName,
  report,
}: ReportCardPDFProps) => (
  <Document>
    <Page size="A4" style={pdfStyles.page} wrap>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.schoolName}>{schoolName || 'rcpit'}</Text>
        <Text style={pdfStyles.schoolLocation}>{schoolAddress || 'shirpur'}</Text>
        <Text style={pdfStyles.reportTitle}>Student Progress Report</Text>
        <Text style={pdfStyles.year}>Academic Year 2023-2024</Text>
      </View>
      <View style={pdfStyles.section}>
        <View style={pdfStyles.row}>
          <View style={pdfStyles.col}>
            <Text style={pdfStyles.sectionTitle}>Student Information</Text>
            <Text><Text style={pdfStyles.label}>Name:</Text> <Text style={pdfStyles.value}>{studentName}</Text></Text>
            <Text><Text style={pdfStyles.label}>Grade Level:</Text> <Text style={pdfStyles.value}>{gradeLevel}</Text></Text>
            <Text><Text style={pdfStyles.label}>Subject:</Text> <Text style={pdfStyles.value}>{subject}</Text></Text>
          </View>
          <View style={pdfStyles.col}>
            <Text style={pdfStyles.sectionTitle}>Report Details</Text>
            <Text><Text style={pdfStyles.label}>Term:</Text> <Text style={pdfStyles.value}>{term}</Text></Text>
          </View>
        </View>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Performance Summary</Text>
        <Text style={pdfStyles.value}>{report}</Text>
      </View>
      {/* You can further parse and style strengths, improvements, recommendations, comments if you have them as structured data */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.strengths}>Areas of Strength</Text>
        <Text style={pdfStyles.value}>See on-screen report for details.</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.improvements}>Areas for Improvement</Text>
        <Text style={pdfStyles.value}>See on-screen report for details.</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.recommendations}>Action Plan & Recommendations</Text>
        <Text style={pdfStyles.value}>See on-screen report for details.</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Teacher Comments</Text>
        <Text style={pdfStyles.comments}>{report}</Text>
      </View>
      <View style={pdfStyles.signatureRow}>
        <View style={pdfStyles.signatureBox}><Text>{teacherName || 'Teacher Name'}</Text><Text>\nTeacher's Signature</Text></View>
        <View style={pdfStyles.signatureBox}><Text>{principalName || 'Principal Name'}</Text><Text>\nPrincipal's Signature</Text></View>
        <View style={pdfStyles.signatureBox}><Text>Parent/Guardian</Text><Text>\nParent's Signature</Text></View>
      </View>
      <View style={pdfStyles.seal}><Text style={pdfStyles.sealText}>School Seal</Text></View>
    </Page>
  </Document>
);

export default function ReportCardGeneratorClient() {
  const [form, setForm] = useState({
    studentName: '',
    gradeLevel: '',
    subject: '',
    term: '',
    performanceData: '',
    schoolName: '',
    schoolAddress: '',
    principalName: '',
    teacherName: '',
  });
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReport('');
    try {
      const res = await fetch('/api/tools/ai-report-card-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate report card');
      setReport(data.report);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      studentName: '',
      gradeLevel: '',
      subject: '',
      term: '',
      performanceData: '',
      schoolName: '',
      schoolAddress: '',
      principalName: '',
      teacherName: '',
    });
    setReport('');
    setError(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-500 pt-24 md:pt-28 pb-12">
      <div className="w-full max-w-4xl px-4 py-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 flex flex-col items-center animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold heading text-center mb-6 text-gray-900 dark:text-gray-100">AI Report Card Generator</h1>
        <form onSubmit={handleSubmit} className="w-full bg-gray-50 dark:bg-zinc-800 rounded-xl shadow p-6 flex flex-col gap-4 border border-gray-200 dark:border-zinc-700 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-900 dark:text-gray-100">Student Name</label>
              <input type="text" name="studentName" value={form.studentName} onChange={handleChange} className="border border-input dark:border-zinc-700 rounded-lg p-2 w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Enter student name" required />
            </div>
            <div>
              <label className="font-medium text-gray-900 dark:text-gray-100">Grade Level</label>
              <select name="gradeLevel" value={form.gradeLevel} onChange={handleChange} className="border border-input dark:border-zinc-700 rounded-lg p-2 w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition" required>
                <option value="">Select grade level</option>
                <option>Kindergarten</option>
                <option>1st Grade</option>
                <option>2nd Grade</option>
                <option>3rd Grade</option>
                <option>4th Grade</option>
                <option>5th Grade</option>
                <option>6th Grade</option>
                <option>7th Grade</option>
                <option>8th Grade</option>
                <option>9th Grade</option>
                <option>10th Grade</option>
                <option>11th Grade</option>
                <option>12th Grade</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="font-medium text-gray-900 dark:text-gray-100">Subject</label>
              <select name="subject" value={form.subject} onChange={handleChange} className="border border-input dark:border-zinc-700 rounded-lg p-2 w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition" required>
                <option value="">Select subject</option>
                <option>Mathematics</option>
                <option>Science</option>
                <option>English</option>
                <option>History</option>
                <option>Geography</option>
                <option>Computer Science</option>
                <option>Art</option>
                <option>Physical Education</option>
                <option>Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="font-medium text-gray-900 dark:text-gray-100">Term</label>
              <select name="term" value={form.term} onChange={handleChange} className="border border-input dark:border-zinc-700 rounded-lg p-2 w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition" required>
                <option value="">Select term</option>
                <option>Term 1</option>
                <option>Term 2</option>
                <option>Term 3</option>
                <option>Semester 1</option>
                <option>Semester 2</option>
                <option>Annual</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Report Card Details</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <label className="font-medium text-gray-900 dark:text-gray-100">Performance Data</label>
              <textarea name="performanceData" value={form.performanceData} onChange={handleChange} className="border border-input dark:border-zinc-700 rounded-lg p-2 w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition min-h-[80px]" placeholder="Enter student performance data..." required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="font-medium text-gray-900 dark:text-gray-100">School Name</label>
                <input type="text" name="schoolName" value={form.schoolName} onChange={handleChange} className="border border-input dark:border-zinc-700 rounded-lg p-2 w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Enter school name" />
              </div>
              <div>
                <label className="font-medium text-gray-900 dark:text-gray-100">School Address</label>
                <input type="text" name="schoolAddress" value={form.schoolAddress} onChange={handleChange} className="border border-input dark:border-zinc-700 rounded-lg p-2 w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Enter school address" />
              </div>
              <div>
                <label className="font-medium text-gray-900 dark:text-gray-100">Principal's Name</label>
                <input type="text" name="principalName" value={form.principalName} onChange={handleChange} className="border border-input dark:border-zinc-700 rounded-lg p-2 w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Enter principal's name" />
              </div>
              <div>
                <label className="font-medium text-gray-900 dark:text-gray-100">Teacher's Name</label>
                <input type="text" name="teacherName" value={form.teacherName} onChange={handleChange} className="border border-input dark:border-zinc-700 rounded-lg p-2 w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Enter teacher's name" />
              </div>
            </div>
          </div>
          <button type="submit" className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition w-full" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report Card'}
          </button>
          {error && <div className="text-red-500 mt-2 font-semibold">{error}</div>}
        </form>
        {report && (
          <div className="flex justify-end mb-4 w-full">
            <PDFDownloadLink
              document={<ReportCardPDF {...form} report={report} />}
              fileName="report-card.pdf"
              style={{ textDecoration: 'none' }}
            >
              {({ loading }) => (
                <button
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold text-base shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-500 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  title="Download as PDF"
                >
                  <Download className="w-5 h-5" />
                  {loading ? 'Preparing PDF...' : 'Download Report Card'}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        )}
        {report && (
          <>
            {/* Demo data for strengths, improvements, recommendations if not available */}
            {(() => {
              // Example demo data
              const demoStrengths = [
                'Strong analytical skills and problem-solving.',
                'Consistent participation in class discussions.',
                'Ability to collaborate effectively with peers.'
              ];
              const demoImprovements = [
                'Needs to enhance time management skills.',
                'Could benefit from deeper engagement with reading assignments.',
                'Should work on articulating thoughts more clearly in written assignments.'
              ];
              const demoRecommendations = [
                'Create a weekly planner to organize assignments and study sessions.',
                'Engage with supplementary reading materials to deepen understanding.',
                'Practice writing skills by summarizing class notes.'
              ];
              // Render the report card UI
              return (
                <div className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow p-6 border border-gray-200 dark:border-zinc-700 mt-4 animate-slide-in">
                  {/* Header */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="text-3xl font-bold mb-1">rcpit</div>
                    <div className="text-lg text-gray-500 mb-2">shirpur</div>
                    <div className="w-24 h-1 bg-gray-200 mb-2" />
                    <div className="text-2xl font-semibold mb-1">Student Progress Report</div>
                    <div className="text-gray-600">Academic Year 2023-2024</div>
                  </div>
                  {/* Student/Report Details */}
                  <div className="bg-white rounded-xl border flex flex-col md:flex-row md:justify-between md:items-start p-6 mb-4 gap-6">
                    <div className="flex-1">
                      <div className="font-semibold text-black mb-2">Student Information</div>
                      <div className="mb-1 text-black"><span className="font-medium text-black">Name:</span> {form.studentName}</div>
                      <div className="mb-1 text-black"><span className="font-medium text-black">Grade Level:</span> {form.gradeLevel}</div>
                      <div className="mb-1 text-black"><span className="font-medium text-black">Subject:</span> {form.subject}</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-black mb-2">Report Details</div>
                      <div className="mb-1 text-black"><span className="font-medium text-black">Term:</span> {form.term}</div>
                      {/* Try to extract grade and percentage from report string if possible */}
                      {/* If your API returns a structured object, use that here */}
                    </div>
                  </div>
                  {/* Performance Summary */}
                  <div className="bg-gray-50 border rounded-xl p-6 mb-4">
                    <div className="font-bold text-lg mb-2">Performance Summary</div>
                    <div className="text-gray-700 whitespace-pre-line">{report}</div>
                  </div>
                  {/* Strengths & Improvements (if you can parse them from the report string) */}
                  {/* Example layout, you may need to parse or split the report string for these sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <div className="font-bold text-green-700 text-lg mb-2">Areas of Strength</div>
                      <ul className="list-disc list-inside space-y-2">
                        {demoStrengths.map((s, i) => <li key={i} className="text-gray-800">{s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                      <div className="font-bold text-orange-700 text-lg mb-2">Areas for Improvement</div>
                      <ul className="list-disc list-inside space-y-2">
                        {demoImprovements.map((s, i) => <li key={i} className="text-gray-800">{s}</li>)}
                      </ul>
                    </div>
                  </div>
                  {/* Recommendations */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
                    <div className="font-bold text-blue-700 text-lg mb-2">Action Plan & Recommendations</div>
                    <ul className="list-disc list-inside space-y-2">
                      {demoRecommendations.map((s, i) => <li key={i} className="text-gray-800">{s}</li>)}
                    </ul>
                  </div>
                  {/* Teacher Comments */}
                  <div className="bg-gray-50 border rounded-xl p-6 mb-4">
                    <div className="font-bold text-lg mb-2">Teacher Comments</div>
                    {/* Only show teacher comments if you have a separate field, otherwise leave blank or show a placeholder */}
                    <div className="text-gray-700 whitespace-pre-line">{form.teacherName ? `See comments from ${form.teacherName}.` : '—'}</div>
                  </div>
                  {/* Signature Section */}
                  <div className="w-full border-t pt-8 flex flex-col md:flex-row md:justify-between text-center text-gray-600 mt-8">
                    <div className="flex-1">
                      <div className="mb-2">{form.teacherName || 'Teacher Name'}</div>
                      <div className="font-medium">Teacher's Signature</div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">{form.principalName || 'Principal Name'}</div>
                      <div className="font-medium">Principal's Signature</div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">Parent/Guardian</div>
                      <div className="font-medium">Parent's Signature</div>
                    </div>
                  </div>
                  {/* School Seal */}
                  <div className="flex justify-center mt-8">
                    <div className="w-24 h-24 border-2 border-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-sm">School Seal</span>
                    </div>
                  </div>
                  {/* Back & Edit Button */}
                  <button
                    onClick={handleReset}
                    className="w-full mt-4 bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 py-2 rounded-xl font-semibold shadow hover:bg-gray-300 dark:hover:bg-zinc-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Back & Edit
                  </button>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </main>
  );
} 