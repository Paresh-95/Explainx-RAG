// app/exam/[examid]/page.tsx

import ExamClient from "../../../../../components/exam/exam";

type Params = Promise<{ examid: string }>;

interface ExamPageProps {
   params: Params 
}

export default async function ExamPage({ params }: ExamPageProps) {
  const { examid } = await params;

  return <ExamClient spaceId={examid} />;
}

