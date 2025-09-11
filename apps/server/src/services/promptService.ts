interface PromptConfig {
  system: string;
  maxTokens: number;
  temperature: number;
}

export class PromptManager {
  /**
   * Detects the type of query and returns appropriate prompt configuration
   */
  static getPromptConfig(query: string): PromptConfig {
    const lowerQuery = query.toLowerCase();

    // Check for special mode triggers (both @ and simple word triggers)
    if (this.isQuizQuery(lowerQuery)) {
      return this.getQuizPrompt();
    }

    if (this.isFlashcardsQuery(lowerQuery)) {
      return this.getFlashcardsPrompt();
    }

    if (this.isMindmapQuery(lowerQuery)) {
      return this.getMindmapPrompt();
    }

    if (this.isTimelineQuery(lowerQuery)) {
      return this.getTimelinePrompt();
    }

    // Check for question types - IMPROVED ORDER
    if (this.isSummaryQuery(lowerQuery)) {
      return this.getSummaryPrompt();
    }

    if (this.isExplanationQuery(lowerQuery)) {
      return this.getExplanationPrompt();
    }

    if (this.isDefinitionQuery(lowerQuery)) {
      return this.getDefinitionPrompt();
    }

    // Default conversational prompt
    return this.getDefaultPrompt();
  }
  /**
   * Helper methods to detect special format queries
   */
  private static isQuizQuery(query: string): boolean {
    const quizKeywords = [
      "@quiz",
      "quiz",
      "test me",
      "questions",
      "multiple choice",
      "mcq",
      "create quiz",
      "generate quiz",
      "make quiz",
    ];
    return quizKeywords.some((keyword) => query.includes(keyword));
  }

  private static isFlashcardsQuery(query: string): boolean {
    const flashcardKeywords = [
      "@flashcards",
      "flashcards",
      "flash cards",
      "cards",
      "create flashcards",
      "generate flashcards",
      "make flashcards",
      "study cards",
    ];
    return flashcardKeywords.some((keyword) => query.includes(keyword));
  }

  private static isMindmapQuery(query: string): boolean {
    const mindmapKeywords = [
      "@mindmap",
      "mindmap",
      "mind map",
      "concept map",
      "diagram",
      "visual map",
      "create mindmap",
      "generate mindmap",
      "make mindmap",
    ];
    return mindmapKeywords.some((keyword) => query.includes(keyword));
  }

  private static isTimelineQuery(query: string): boolean {
    const timelineKeywords = [
      "@timeline",
      "timeline",
      "chronology",
      "chronological",
      "history",
      "sequence of events",
      "create timeline",
      "generate timeline",
      "make timeline",
    ];
    return timelineKeywords.some((keyword) => query.includes(keyword));
  }

  /**
   * Quiz generation prompt
   */
  private static getQuizPrompt(): PromptConfig {
    return {
      system: `You are a quiz generator. When you see quiz-related keywords in the user message, respond with ONLY valid JSON (no markdown, no explanations).

EXACT FORMAT - Return this array structure:
[
  { "type": "quiz" },
  {
    "question": "Question text here?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "answer": "A) correct option",
    "hint": "Brief hint",
    "explanation": "Why this is correct"
  },
  {
    "question": "Second question?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "answer": "B) correct option",
    "hint": "Brief hint", 
    "explanation": "Why this is correct"
  },
  {
    "question": "Third question?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "answer": "C) correct option",
    "hint": "Brief hint",
    "explanation": "Why this is correct"
  }
]

Generate 3-5 questions based on the provided context. Start response immediately with [`,
      maxTokens: 5000,
      temperature: 0.1,
    };
  }

  /**
   * Flashcards generation prompt
   */
  private static getFlashcardsPrompt(): PromptConfig {
    return {
      system: `You are a flashcard generator. When you see flashcard-related keywords in the user message, respond with ONLY valid JSON (no markdown, no explanations).

EXACT FORMAT - Return this array structure:
[
  { "type": "flashcards" },
  {
    "question": "Front of card",
    "answer": "Back of card", 
    "hint": "Memory aid"
  },
  {
    "question": "Front of card 2",
    "answer": "Back of card 2",
    "hint": "Memory aid 2"
  },
  {
    "question": "Front of card 3", 
    "answer": "Back of card 3",
    "hint": "Memory aid 3"
  }
]

Generate 3-5 flashcards based on the provided context. Start response immediately with [`,
      maxTokens: 5000,
      temperature: 0.1,
    };
  }

  /**
   * Mindmap generation prompt
   */
  private static getMindmapPrompt(): PromptConfig {
    return {
      system: `You are a mindmap generator. When you see mindmap-related keywords in the user message, respond with ONLY valid JSON (no markdown, no explanations).

EXACT FORMAT - Return this object structure:
{
  "type": "mindmap",
  "nodes": [
    { "id": "root", "label": "Main Topic", "position": { "x": 0, "y": 0 } },
    { "id": "sub1", "label": "Subtopic 1", "position": { "x": -200, "y": 100 } },
    { "id": "sub2", "label": "Subtopic 2", "position": { "x": 0, "y": 100 } },
    { "id": "sub3", "label": "Subtopic 3", "position": { "x": 200, "y": 100 } },
    { "id": "detail1", "label": "Detail 1", "position": { "x": -300, "y": 200 } },
    { "id": "detail2", "label": "Detail 2", "position": { "x": -100, "y": 200 } },
    { "id": "detail3", "label": "Detail 3", "position": { "x": 100, "y": 200 } }
  ],
  "edges": [
    { "id": "e1", "source": "root", "target": "sub1" },
    { "id": "e2", "source": "root", "target": "sub2" },
    { "id": "e3", "source": "root", "target": "sub3" },
    { "id": "e4", "source": "sub1", "target": "detail1" },
    { "id": "e5", "source": "sub1", "target": "detail2" },
    { "id": "e6", "source": "sub2", "target": "detail3" }
  ]
}

Create a mindmap based on the provided context. Start response immediately with {`,
      maxTokens: 5000,
      temperature: 0.2,
    };
  }

  /**
   * Timeline generation prompt
   */
  private static getTimelinePrompt(): PromptConfig {
    return {
      system: `You are a timeline generator. When you see timeline-related keywords in the user message, respond with ONLY valid JSON (no markdown, no explanations).

EXACT FORMAT - Return this array structure:
[
  { "type": "timeline" },
  {
    "year": "Date/Year",
    "event": "What happened",
    "note": "Brief context"
  },
  {
    "year": "Date/Year 2", 
    "event": "What happened 2",
    "note": "Brief context 2"
  },
  {
    "year": "Date/Year 3",
    "event": "What happened 3", 
    "note": "Brief context 3"
  }
]

Create a chronological timeline based on the provided context. Start response immediately with [`,
      maxTokens: 5000,
      temperature: 0.1,
    };
  }

  /**
   * Explanation-focused prompt
   */
  private static getExplanationPrompt(): PromptConfig {
    return {
      system: `You are a study assistant focused on providing clear explanations. Your task is to:

1. Explain concepts in simple, understandable terms
2. Break down complex topics into digestible parts
3. Use examples when helpful
4. Provide step-by-step explanations when appropriate
5. Answer ONLY from the provided context

If the context doesn't contain enough information, state: "The provided context doesn't contain sufficient information to explain this topic."

Be thorough but concise. Use plain text only.`,
      maxTokens: 5000,
      temperature: 0.3,
    };
  }

  /**
   * Summary-focused prompt
   */
  private static getSummaryPrompt(): PromptConfig {
    return {
      system: `You are a study assistant focused on creating comprehensive summaries and extracting key takeaways. Your task is to:

1. Extract the most important points, insights, and takeaways from the provided context
2. Organize information clearly with main points and supporting details
3. Identify key themes, concepts, and learning objectives
4. Provide actionable insights and practical applications when relevant
5. Include specific examples, data, or evidence from the context
6. Structure the response logically (e.g., by topic, importance, or chronology)

Create a comprehensive summary that captures the essential knowledge from the material. Be thorough while maintaining clarity.`,
      maxTokens: 5000,
      temperature: 0.2,
    };
  }
  /**
   * Definition-focused prompt
   */
  private static getDefinitionPrompt(): PromptConfig {
    return {
      system: `You are a study assistant focused on providing clear definitions. Your task is to:

1. Define terms clearly and accurately
2. Provide context when necessary
3. Include examples if they help clarify the definition
4. Answer ONLY from the provided context
5. Be precise and concise

If the context doesn't contain the definition, state: "The provided context doesn't contain a definition for this term."

Use plain text only.`,
      maxTokens: 5000,
      temperature: 0.1,
    };
  }

  /**
   * Default conversational prompt
   */
  private static getDefaultPrompt(): PromptConfig {
    return {
      system: `You are a helpful study assistant. Answer questions based on the provided context from the uploaded document.

Guidelines:
- Use the provided context to answer the user's question comprehensively
- If the context contains relevant information, provide a detailed answer
- Only state "The provided context doesn't contain information about this topic" if the context is truly unrelated to the question
- Be accurate and include relevant details from the context
- Use a conversational but professional tone
- Use plain text only
- Extract key insights, takeaways, and important information when asked

The context provided is from the user's uploaded study material, so it should be relevant to their questions.`,
      maxTokens: 5000,
      temperature: 0.3, // Slightly higher for more natural responses
    };
  }
  /**
   * Helper methods to detect query types
   */

  private static isSummaryQuery(query: string): boolean {
    const summaryKeywords = [
      "summarize",
      "summary",
      "key points",
      "main points",
      "overview",
      "outline",
      "briefly",
      "takeaways", // Added this
      "important takeaways", // Added this
      "key takeaways", // Added this
      "main takeaways", // Added this
      "highlights", // Added this
      "key insights", // Added this
      "important points", // Added this
      "main ideas", // Added this
    ];
    return summaryKeywords.some((keyword) => query.includes(keyword));
  }

  private static isExplanationQuery(query: string): boolean {
    const explanationKeywords = [
      "explain",
      "how does",
      "how do",
      "why does",
      "why do",
      "what causes",
      "how works",
      "process of",
      "mechanism",
      "teach me", // Added this
      "tell me about", // Added this
      "what can you tell me", // Added this
      "about this book", // Added this
      "about the book", // Added this
    ];
    return explanationKeywords.some((keyword) => query.includes(keyword));
  }
  private static isDefinitionQuery(query: string): boolean {
    const definitionKeywords = [
      "what is",
      "what are",
      "define",
      "definition",
      "meaning of",
      "means",
    ];
    return definitionKeywords.some((keyword) => query.includes(keyword));
  }
}
