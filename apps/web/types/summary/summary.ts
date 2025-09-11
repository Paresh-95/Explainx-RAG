export interface SectionSummary {
    title: string;
    summary: string;
    keyPoints: string[];
}

export interface Summary {
    title: string;
    mainSummary: string;
    keyPoints: string[];
    importantConcepts: string[];
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedReadingTime: number;
    sections?: SectionSummary[];
}

export interface SummaryProgress {
    studyMaterialId: string;
    userId: string;
    activeSection: 'main' | number;
    lastViewed: string;
    summaryVersion: string;
    readingProgress: number;
}



export interface SummaryUIProps {
    studyMaterialId: string;
    userId: string;
}