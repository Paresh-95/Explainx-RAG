// types/speech-recognition.ts

// Extend the Window interface to include Speech Recognition APIs
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
  interface MediaDevices {
    getDisplayMedia(
      constraints?: DisplayMediaStreamConstraints,
    ): Promise<MediaStream>;
  }
}

// Define the SpeechRecognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;

  // Event handlers
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null;
  onnomatch:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

  // Methods
  abort(): void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

type SpeechRecognitionErrorCode =
  | "no-speech"
  | "aborted"
  | "audio-capture"
  | "network"
  | "not-allowed"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported";

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

// Export types for use in other files
export type {
  SpeechRecognition,
  SpeechRecognitionConstructor,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionErrorCode,
  SpeechRecognitionResult,
  SpeechRecognitionAlternative,
};

interface DisplayMediaStreamConstraints {
  video?: boolean | MediaTrackConstraints;
  audio?:
    | boolean
    | {
        echoCancellation?: boolean;
        noiseSuppression?: boolean;
        sampleRate?: number;
        channelCount?: number;
        sampleSize?: number;
      };
}

// Tab recording specific types
export interface TabRecordingOptions {
  audioOnly?: boolean;
  sampleRate?: number;
  channelCount?: number;
  bitRate?: number;
}

export interface TabRecordingState {
  isRecording: boolean;
  stream: MediaStream | null;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  error: string | null;
}

export interface UseTabRecordingReturn {
  isRecording: boolean;
  isSupported: boolean;
  error: string | null;
  audioBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  downloadRecording: () => void;
  getAudioStream: () => MediaStream | null;
}

// Audio processing types
export interface AudioProcessingOptions {
  enableRealTimeTranscription?: boolean;
  language?: string;
  chunkDuration?: number; // in milliseconds
}
