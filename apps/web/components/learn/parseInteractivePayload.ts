export function parseInteractivePayload(text: string): { type: string, data: any } | null {
  try {
    const arr = JSON.parse(text);
    if (Array.isArray(arr) && arr.length > 0) {
      if (arr[0].type === 'quiz' || (arr[0].question && arr[0].options)) {
        // Quiz
        const quizData = arr.filter((q: any) => q.question && q.options);
        return { type: 'quiz', data: quizData };
      }
      if (arr[0].type === 'flashcards' || (arr[0].question && arr[0].answer && !arr[0].options)) {
        // Flashcards
        const cards = arr.filter((c: any) => c.question && c.answer && !c.options);
        return { type: 'flashcards', data: cards };
      }
      if (arr[0].type === 'mindmap' || (arr[0].central_topic && arr[0].branches)) {
        // Mindmap
        const mindmap = arr.find((c: any) => c.central_topic && c.branches);
        return { type: 'mindmap', data: mindmap };
      }
      if (arr[0].type === 'timeline' || (arr[0].year && arr[0].event)) {
        // Timeline
        const timeline = arr.filter((c: any) => c.year && c.event);
        return { type: 'timeline', data: timeline };
      }
    }
  } catch (e) { /* not JSON */ }
  return null;
} 