// types/assemblyai.ts

export interface AssemblyAIConfig {
  apiKey: string;
  sampleRate?: number;
  encoding?: "pcm_s16le" | "pcm_mulaw";
  enableAutomaticPunctuation?: boolean;
  languageModel?: string;
}

export interface AssemblyAIMessage {
  message_type:
    | "SessionBegins"
    | "PartialTranscript"
    | "FinalTranscript"
    | "SessionTerminated";
  session_id?: string;
  text?: string;
  confidence?: number;
  audio_start?: number;
  audio_end?: number;
  words?: Array<{
    start: number;
    end: number;
    text: string;
    confidence: number;
  }>;
}

export interface UseAssemblyAIReturn {
  isConnected: boolean;
  isTranscribing: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  confidence: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  startTranscription: (stream: MediaStream) => Promise<void>;
  stopTranscription: () => void;
  resetTranscript: () => void;
}
