import { useState, useRef, useEffect } from "react";
import {
  Mic,
  Circle,
  StopCircle,
  Play,
  Pause,
  Type,
  Copy,
  Download,
  Monitor,
  Settings,
  Radio,
  Activity,
  BarChart3,
  Upload,
  CheckCircle,
  FileText,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@repo/ui/hooks/use-toast";

interface TabAudioRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
  onTranscriptComplete?: (transcript: string) => void;
  className?: string;
  docid?: string;
  space?: string;
  recordingUrl?: string;
}

type UploadStatus = "idle" | "uploading" | "completed" | "failed";

interface UploadState {
  status: UploadStatus;
  progress: number;
  fileUrl?: string;
  audioUrl?: string;
  studyMaterialId?: string;
  error?: string;
}

interface TranscriptionState {
  isTranscribing: boolean;
  transcript: string;
  partialTranscript: string;
  confidence: number | null;
  sessionId: string | null;
  error: string | null;
}

export default function TabAudioRecorder({
  onRecordingComplete,
  onTranscriptComplete,
  className,
  docid,
  space,
  recordingUrl,
}: TabAudioRecorderProps) {
  const [recordingStatus, setRecordingStatus] = useState<
    "inactive" | "preparing" | "recording"
  >("inactive");
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [permission, setPermission] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(true);
  const currentTranscriptRef = useRef<string>("");

  // Transcription state
  const [transcription, setTranscription] = useState<TranscriptionState>({
    isTranscribing: false,
    transcript: "",
    partialTranscript: "",
    confidence: null,
    sessionId: null,
    error: null,
  });

  // Add transcription token state
  const [transcriptionToken, setTranscriptionToken] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const visualizerRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<
    MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null
  >(null);

  // Tab transcription refs
  const transcriptionSocket = useRef<WebSocket | null>(null);
  const transcriptionAudioContext = useRef<AudioContext | null>(null);
  const transcriptionScriptProcessor = useRef<ScriptProcessorNode | null>(null);

  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });

  const { toast } = useToast();

  // Get transcription token function - defined before useEffects that use it
  const getTranscriptionToken = async (): Promise<string | null> => {
    try {
      setTranscription((prev) => ({ ...prev, error: null }));
      console.log("🔑 Fetching temporary token...");

      const response = await fetch("/api/token");
      const data = await response.json();

      if (data.error) {
        console.error("❌ Error fetching token:", data.error);
        setTranscription((prev) => ({
          ...prev,
          error: `Token error: ${data.error}`,
        }));
        return null;
      }

      // Store the token in state for later use
      setTranscriptionToken(data.token);
      console.log("✅ Temporary token obtained successfully");
      return data.token;
    } catch (err) {
      console.error("❌ Failed to fetch token:", err);
      setTranscription((prev) => ({
        ...prev,
        error: "Failed to fetch authentication token",
      }));
      return null;
    }
  };

  // Check display capture permission on component mount
  useEffect(() => {
    // Check if getDisplayMedia is supported
    if (navigator.mediaDevices) {
      setPermission(true);
    }
  }, []);

  // Get transcription token on component mount
  useEffect(() => {
    getTranscriptionToken();
  }, []);

  useEffect(() => {
    currentTranscriptRef.current = transcription.transcript;
  }, [transcription.transcript]);

  // If recordingUrl is provided, set audio player to use it
  useEffect(() => {
    if (recordingUrl && !audio) {
      if (recordingUrl.startsWith('blob:')) {
        setAudio(recordingUrl);
      } else {
        fetch(recordingUrl)
          .then(res => res.blob())
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            setAudio(blobUrl);
          })
          .catch(err => {
            console.error('Failed to fetch recordingUrl as blob:', err);
            setAudio(recordingUrl);
          });
      }
    }
  }, [recordingUrl, audio]);

  const router = useRouter();

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      cleanupTranscription();
    };
  }, []);

  const cleanupAudio = (): void => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.error("Error closing audio context:", e);
      }
    }

    sourceRef.current = null;
    analyserRef.current = null;
    audioContextRef.current = null;
  };

  const cleanupTranscription = (): void => {
    if (transcriptionScriptProcessor.current) {
      transcriptionScriptProcessor.current.disconnect();
      transcriptionScriptProcessor.current = null;
    }

    if (transcriptionAudioContext.current) {
      transcriptionAudioContext.current.close();
      transcriptionAudioContext.current = null;
    }

    if (transcriptionSocket.current) {
      transcriptionSocket.current.send(
        JSON.stringify({ terminate_session: true }),
      );
      transcriptionSocket.current.close();
      transcriptionSocket.current = null;
    }

    setTranscription((prev) => ({
      ...prev,
      isTranscribing: false,
      sessionId: null,
    }));
  };

  const stopVisualization = (): void => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Get tab capture permission
  const getTabCapturePermission = async (): Promise<MediaStream | null> => {
    try {
      console.log("🎬 Starting tab capture...");

      const streamData = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000, // Higher sample rate for better quality
          channelCount: 2,   // Stereo audio
        },
      });

      const audioTracks = streamData.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error(
          'No audio tracks detected. Please ensure you check "Share tab audio" and select a tab that is currently playing audio.',
        );
      }

      // Log audio track details for debugging
      audioTracks.forEach((track, index) => {
        console.log(`Audio track ${index}:`, {
          enabled: track.enabled,
          kind: track.kind,
          label: track.label,
          readyState: track.readyState,
          settings: track.getSettings(),
        });
      });

      console.log("✅ Got tab stream:", {
        videoTracks: streamData.getVideoTracks().length,
        audioTracks: audioTracks.length,
      });

      setPermission(true);
      setStream(streamData);
      return streamData;
    } catch (err: any) {
      console.error("Error accessing tab capture:", err.message);

      let errorMessage = "Failed to start tab capture";
      if (err instanceof Error) {
        switch (err.name) {
          case "NotAllowedError":
            errorMessage = "Permission denied. Please allow screen capture and ensure 'Share tab audio' is checked.";
            break;
          case "NotSupportedError":
            errorMessage = "Screen capture not supported.";
            break;
          case "NotFoundError":
            errorMessage = "No audio source found. Make sure the tab is playing audio and 'Share tab audio' is enabled.";
            break;
          default:
            errorMessage = err.message;
        }
      }

      setTranscription((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      setPermission(false);
      return null;
    }
  };

  // Start transcription using AssemblyAI v2
  const startTranscription = async (
    audioStream: MediaStream,
  ): Promise<void> => {
    try {
      // Use the pre-fetched token instead of fetching it again
      const token = transcriptionToken;
      if (!token) {
        console.error("No transcription token available");
        setTranscription((prev) => ({
          ...prev,
          error: "No transcription token available",
        }));
        return;
      }

      // Connect to AssemblyAI v2 with secure token
      console.log("🔌 Connecting to AssemblyAI v2 with secure token...");
      transcriptionSocket.current = new WebSocket(
        `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`,
      );

      transcriptionSocket.current.onopen = async () => {
        console.log("✅ WebSocket v2 connection established");
        setTranscription((prev) => ({
          ...prev,
          isTranscribing: true,
          error: null,
        }));

        // Now that transcription is ready, start the actual recording
        setRecordingStatus("recording");
        startMediaRecorder(audioStream);
        
        toast({
          title: "Tab Recording Started",
          description: "Recording tab audio with live transcription active.",
        });

        // Create audio processing pipeline
        transcriptionAudioContext.current = new AudioContext({ sampleRate: 16000 });
        const source = transcriptionAudioContext.current.createMediaStreamSource(
          audioStream,
        );
        transcriptionScriptProcessor.current = transcriptionAudioContext.current.createScriptProcessor(
          4096,
          1,
          1,
        );

        source.connect(transcriptionScriptProcessor.current);
        transcriptionScriptProcessor.current.connect(transcriptionAudioContext.current.destination);

        transcriptionScriptProcessor.current.onaudioprocess = (event) => {
          if (!transcriptionSocket.current || transcriptionSocket.current.readyState !== WebSocket.OPEN)
            return;

          const inputData = event.inputBuffer.getChannelData(0);
          const output = new Int16Array(inputData.length);

          // Convert Float32 PCM to Int16 PCM
          for (let i = 0; i < inputData.length; i++) {
            output[i] = Math.min(1, inputData[i]!) * 0x7fff;
          }

          transcriptionSocket.current.send(output.buffer);
        };

        console.log("🎙️ Audio processing started");
      };

      transcriptionSocket.current.onmessage = (event) => {
        try {
          const res = JSON.parse(event.data);
          console.log("📨 Received message:", res);

          // Handle v2 API message types
          if (res.message_type === "SessionBegins") {
            console.log("🎯 AssemblyAI v2 session started:", res.session_id);
            setTranscription((prev) => ({
              ...prev,
              sessionId: res.session_id,
            }));
          }

          if (res.message_type === "PartialTranscript") {
            console.log("📝 Partial:", res.text);
            setTranscription((prev) => ({
              ...prev,
              partialTranscript: res.text || "",
              confidence: res.confidence || null,
            }));
          }

          if (res.message_type === "FinalTranscript") {
            console.log("✅ Final:", res.text);
            if (res.text) {
              setTranscription((prev) => {
                const newTranscript = prev.transcript + (prev.transcript ? " " : "") + res.text;
                return {
                  ...prev,
                  transcript: newTranscript,
                  partialTranscript: "",
                  confidence: res.confidence || null,
                };
              });
            }
          }

          // Handle errors
          if (res.error) {
            console.error("❌ AssemblyAI v2 error:", res.error);
            setTranscription((prev) => ({
              ...prev,
              error: `AssemblyAI error: ${res.error}`,
            }));
          }
        } catch (parseError) {
          console.error("❌ Failed to parse message:", parseError, event.data);
        }
      };

      transcriptionSocket.current.onerror = (event) => {
        console.error("❌ WebSocket error:", event);
        setTranscription((prev) => ({
          ...prev,
          error: "WebSocket connection error",
        }));
      };

      transcriptionSocket.current.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);

        if (event.code === 4008) {
          setTranscription((prev) => ({
            ...prev,
            error: "Session expired. Please start a new session.",
          }));
        } else if (event.code === 4001) {
          setTranscription((prev) => ({
            ...prev,
            error: "Authentication failed. Please check your API key.",
          }));
        } else if (event.code !== 1000) {
          setTranscription((prev) => ({
            ...prev,
            error: `Connection closed unexpectedly: ${event.reason || "Unknown reason"}`,
          }));
        }

        setTranscription((prev) => ({
          ...prev,
          isTranscribing: false,
          sessionId: null,
        }));
        transcriptionSocket.current = null;
      };
    } catch (err) {
      console.error("❌ Transcription setup error:", err);
      setTranscription((prev) => ({
        ...prev,
        error: "Failed to start transcription",
      }));
    }
  };

  const visualizeWaveform = (): void => {
    const canvas = visualizerRef.current;
    if (!canvas || !analyserRef.current) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let smoothedVolume = 0;

    const draw = (): void => {
      if (!analyserRef.current || !canvas || !canvasCtx) return;

      animationFrameRef.current = requestAnimationFrame(draw);

      analyserRef.current.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = Math.abs(dataArray[i]! / 128.0 - 1.0);
        sum += normalized;
      }
      const instantVolume = sum / bufferLength;

      smoothedVolume = smoothedVolume * 0.9 + instantVolume * 0.1;

      const amplification =
        smoothedVolume < 0.01
          ? 5.0
          : smoothedVolume < 0.05
            ? 3.0
            : smoothedVolume < 0.1
              ? 2.0
              : 1.5;

      canvasCtx.fillStyle = "#161616";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "#666";
      canvasCtx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        let rawValue = dataArray[i]! / 128.0 - 1.0;

        if (smoothedVolume < 0.005) {
          rawValue += (Math.random() * 2 - 1) * 0.05;
        }

        const amplifiedValue = rawValue * amplification;
        const y = ((1 + amplifiedValue) * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.stroke();
    };

    draw();
  };

  const setupAudioVisualization = (audioElement: HTMLAudioElement): void => {
    try {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }

      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }

      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current =
        audioContextRef.current.createMediaElementSource(audioElement);

      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      analyserRef.current.fftSize = 128;

      visualizeWaveform();
    } catch (err) {
      console.error("Error setting up audio visualization:", err);
    }
  };

  const togglePlayback = (): void => {
    if (!audioRef.current || !audio) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopVisualization();

      if (playbackIntervalRef.current)
        clearInterval(playbackIntervalRef.current);
    } else {
      const resumePlayback = () => {
        if (
          !audioContextRef.current ||
          audioContextRef.current.state === "closed"
        ) {
          setupAudioVisualization(audioRef.current!);
        } else if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume().then(() => {
            setupAudioVisualization(audioRef.current!);
          });
        } else {
          visualizeWaveform();
        }

        if (audioRef.current!.ended) {
          audioRef.current!.currentTime = 0;
        }

        setPlaybackTime(Math.floor(audioRef.current!.currentTime));

        audioRef
          .current!.play()
          .then(() => {
            setIsPlaying(true);

            playbackIntervalRef.current = setInterval(() => {
              if (audioRef.current) {
                setPlaybackTime(Math.floor(audioRef.current.currentTime));
              }
            }, 500);
          })
          .catch((err) => console.error("Error playing audio:", err));
      };

      if (audioRef.current.readyState === 0) {
        audioRef.current.oncanplaythrough = resumePlayback;
        audioRef.current.load();
      } else {
        resumePlayback();
      }
    }
  };

  const startRecording = async (): Promise<void> => {
    cleanupAudio();
    cleanupTranscription();
    toast({
      title: "Preparing Tab Recording...",
      description: "Setting up live transcription service...",
    });

    let currentStream = stream;
    if (!currentStream) {
      currentStream = await getTabCapturePermission();
      if (!currentStream) return;
    }

    setStream(currentStream);
    setRecordingStatus("preparing");
    setAudio(null);
    setElapsedTime(0);

    // Reset transcription
    setTranscription({
      isTranscribing: false,
      transcript: "",
      partialTranscript: "",
      confidence: null,
      sessionId: null,
      error: null,
    });

    // Start transcription
    await startTranscription(currentStream);

    // Create new audio context for visualization
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    sourceRef.current =
      audioContextRef.current.createMediaStreamSource(currentStream);

    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;
    visualizeWaveform();
  };

  // Separate function to start the actual MediaRecorder
  const startMediaRecorder = (audioStream: MediaStream): void => {
    // *** KEY FIX: Extract only audio tracks for recording ***
    const audioTracks = audioStream.getAudioTracks();
    if (audioTracks.length === 0) {
      toast({
        title: "No Audio Track",
        description: "No audio track found in the tab capture. Make sure to check 'Share tab audio'.",
        variant: "destructive",
      });
      return;
    }

    // Create a new MediaStream with only audio tracks
    const audioOnlyStream = new MediaStream(audioTracks);

    // Use audio-only stream for MediaRecorder
    const media = new MediaRecorder(audioOnlyStream, {
      mimeType: "audio/webm;codecs=opus" // Explicitly specify audio codec
    });
    mediaRecorder.current = media;

    timerInterval.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    let localAudioChunks: Blob[] = [];
    media.ondataavailable = (event) => {
      if (event.data.size > 0) {
        localAudioChunks.push(event.data);
      }
    };

    media.onstop = async () => {
      // Create audio blob with proper MIME type
      const audioBlob = new Blob(localAudioChunks, {
        type: "audio/webm"
      });

      // Verify the blob has content
      console.log("Audio blob size:", audioBlob.size);
      if (audioBlob.size === 0) {
        toast({
          title: "Recording Error",
          description: "No audio data was captured. Please ensure tab audio is enabled.",
          variant: "destructive",
        });
        return;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      setAudio(audioUrl);

      // Create timestamp for consistent file naming
      const timestamp = Date.now();
      const audioFile = new File([audioBlob], `tab-recording-${timestamp}.webm`, {
        type: "audio/webm",
      });

      try {
        toast({
          title: "Uploading...",
          description: "Your tab audio and transcript are being uploaded.",
        });
        setUploadState({ status: "uploading", progress: 0 });

        // Upload audio file (0-80% of progress)
        console.log("📤 Uploading tab audio file...");
        const audioResult = await uploadFileToS3(audioFile);
        console.log("✅ Tab audio uploaded:", audioResult.fileUrl);

        let transcriptResult = null;

        // WAIT a moment for final transcripts to arrive
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Get CURRENT transcript state using ref
        const currentTranscript = currentTranscriptRef.current.trim();
        console.log("📝 Final transcript check (from ref):", currentTranscript);
        console.log("📝 Transcript length:", currentTranscript.length);

        // Upload transcript if available (80-100% of progress)
        if (currentTranscript) {
          console.log("📝 Uploading transcript...");
          setUploadState((prev) => ({ ...prev, progress: 80 }));

          transcriptResult = await uploadTranscriptToS3(
            currentTranscript,
            timestamp.toString(),
          );
          console.log("✅ Transcript uploaded:", transcriptResult.fileUrl);

          setUploadState((prev) => ({ ...prev, progress: 95 }));
        } else {
          console.log("⚠️ No transcript available for upload");
        }

        // Correct URL assignment
        setUploadState({
          status: "completed",
          progress: 100,
          fileUrl: transcriptResult?.fileUrl, // transcript URL
          audioUrl: audioResult.fileUrl, // audio URL
        });
        toast({
          title: "Upload Complete",
          description: "Your tab recording and transcript have been uploaded.",
        });

        // POST to /api/study-material/record if no recordingUrl prop
        if (!recordingUrl && audioResult.fileUrl) {
          try {
            const payload = {
              recordingUrl: audioResult.fileUrl,
              fileUrl: transcriptResult?.fileUrl,
              docId: docid,
              spaceSlug: space,
              title: `Tab-Recording-${timestamp}`,
              description: "Tab audio recording uploaded via recorder",
              fileName: `tab-recording-${timestamp}.webm`,
              fileSize: audioBlob.size,
              mimeType: "audio/webm",
            };

            if (docid) {
              const res = await fetch("/api/study-material/record", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              if (res.ok) {
                setTimeout(() => {
                  if (typeof window !== "undefined") {
                    window.location.href = `/learn/content/${docid}`;
                  }
                }, 3000);
              }
            }
          } catch (err) {
            console.error("Failed to POST study material record:", err);
          }
        }

        console.log("🎉 Upload completed successfully!", {
          audio: audioResult.fileUrl,
          transcript: transcriptResult?.fileUrl || "No transcript available",
        });
      } catch (err) {
        console.error("❌ Upload failed:", err);
        setUploadState({
          status: "failed",
          progress: 0,
          error: err instanceof Error ? err.message : "Upload failed",
        });
        toast({
          title: "Upload Failed",
          description: err instanceof Error ? err.message : "Upload failed.",
          variant: "destructive",
        });
      }

      if (onRecordingComplete) {
        onRecordingComplete(audioBlob);
      }

      // Call transcript completion callback using ref
      if (onTranscriptComplete && currentTranscriptRef.current) {
        onTranscriptComplete(currentTranscriptRef.current);
      }

      if (sourceRef.current) sourceRef.current.disconnect();
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }

      sourceRef.current = null;
      analyserRef.current = null;
      audioContextRef.current = null;
    };

    // Handle tab sharing ending
    audioStream.getVideoTracks().forEach((track) => {
      track.onended = () => {
        console.log("📺 Tab sharing ended");
        stopRecording();
      };
    });

    media.start();
  };

  const stopRecording = (): void => {
    if (recordingStatus === "preparing") {
      // Cancel preparation
      setRecordingStatus("inactive");
      cleanupAudio();
      cleanupTranscription();
      toast({
        title: "Recording Cancelled",
        description: "Tab recording preparation was cancelled.",
      });
    } else if (mediaRecorder.current && recordingStatus === "recording") {
      console.log(
        "🛑 Stopping tab recording, current transcript:",
        transcription.transcript,
      );

      setRecordingStatus("inactive");
      mediaRecorder.current.stop();

      if (timerInterval.current) clearInterval(timerInterval.current);
      stopVisualization();

      if (sourceRef.current) sourceRef.current.disconnect();

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Delay transcription cleanup to allow final transcripts to be captured
      setTimeout(() => {
        console.log("🧹 Cleaning up transcription after delay");
        cleanupTranscription();
      }, 3000);
    }
  };

  const toggleRecording = (): void => {
    if (recordingStatus === "inactive") {
      startRecording();
    } else if (recordingStatus === "preparing" || recordingStatus === "recording") {
      stopRecording();
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const uploadTranscriptToS3 = async (
    transcript: string,
    timestamp: string,
  ): Promise<{ fileUrl: string }> => {
    try {
      const transcriptContent = `Tab Audio Recording Transcript
Generated: ${new Date().toLocaleString()}
Recording Duration: ${formatTime(elapsedTime)}
Session ID: ${transcription.sessionId || "N/A"}
Confidence: ${transcription.confidence ? (transcription.confidence * 100).toFixed(1) + "%" : "N/A"}

TRANSCRIPT:
${transcript}`;

      const transcriptBlob = new Blob([transcriptContent], {
        type: "text/plain",
      });
      const transcriptFile = new File(
        [transcriptBlob],
        `tab-transcript-${timestamp}.txt`,
        { type: "text/plain" },
      );

      const transcriptResult = await uploadFileToS3(transcriptFile);
      return transcriptResult;
    } catch (error) {
      console.error("Transcript upload failed:", error);
      throw error;
    }
  };

  const uploadFileToS3 = async (file: File): Promise<{ fileUrl: string }> => {
    try {
      const presignedResponse = await fetch("/api/upload-presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          title: file.name,
          description: "",
          isTemporary: true,
        }),
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const { presignedUrl, fileUrl } = await presignedResponse.json();

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            const adjustedProgress = file.type.startsWith("audio/")
              ? progress * 0.8
              : progress;
            setUploadState((prev) => ({ ...prev, progress: adjustedProgress }));
          }
        });

        xhr.addEventListener("load", async () => {
          if (xhr.status === 200) {
            resolve({ fileUrl });
          } else {
            const error = new Error("Upload failed");
            reject(error);
          }
        });

        xhr.addEventListener("error", () => {
          const error = new Error("Network error during upload");
          reject(error);
        });

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (error) {
      throw error;
    }
  };

  // Transcript actions
  const handleCopyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(transcription.transcript);
      toast({
        title: "Copied",
        description: "Transcript copied to clipboard.",
      });
    } catch (err) {
      console.error("Failed to copy transcript:", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy transcript.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadTranscript = () => {
    const content = `Tab Audio Recording Transcript
Generated: ${new Date().toLocaleString()}
Session ID: ${transcription.sessionId || "N/A"}
Recording Duration: ${formatTime(elapsedTime)}
Confidence: ${transcription.confidence ? (transcription.confidence * 100).toFixed(1) + "%" : "N/A"}

${transcription.transcript}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tab-transcript-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Transcript Downloaded",
      description: "The transcript file has been downloaded.",
    });
  };

  const clearTranscript = () => {
    setTranscription((prev) => ({
      ...prev,
      transcript: "",
      partialTranscript: "",
      confidence: null,
      error: null,
    }));
  };

  return (
    <div
      className={`bg-white dark:bg-[#161616] rounded-xl p-6 w-full max-w-4xl mx-auto shadow-lg ${className || ""}`}
    >
      {/* Instructions Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          How to record tab audio:
        </h3>
        <ol className="text-blue-700 dark:text-blue-200 text-sm list-decimal list-inside space-y-1">
          <li>Click "Start Tab Recording" below</li>
          <li>Select the browser tab you want to record</li>
          <li>
            <strong>Important:</strong> Check "Share tab audio" in the dialog
          </li>
          <li>Click "Share" to begin recording with live transcription</li>
          <li>Click "Stop" when finished to save and upload</li>
        </ol>
      </div>

      {/* Main Recording Controls */}
      <div className="flex items-center space-x-4 mb-4">
        {recordingStatus === "recording" ? (
          <Button
            onClick={toggleRecording}
            variant="destructive"
            className="min-w-[180px] h-11 rounded-full bg-[#b02a2a] hover:bg-[#992424] flex items-center justify-center gap-2 text-white"
          >
            <StopCircle className="h-4 w-4" />
            <span>Stop Recording</span>
          </Button>
        ) : recordingStatus === "preparing" ? (
          <Button
            onClick={toggleRecording}
            variant="destructive"
            className="min-w-[180px] h-11 rounded-full bg-[#666] hover:bg-[#555] flex items-center justify-center gap-2 text-white"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span>Cancel</span>
          </Button>
        ) : audio ? (
          <Button
            onClick={togglePlayback}
            variant="destructive"
            className="min-w-[180px] h-11 rounded-full bg-[#b02a2a] hover:bg-[#992424] flex items-center justify-center gap-2 text-white"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>Play</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={toggleRecording}
            variant="destructive"
            className="min-w-[180px] h-11 rounded-full bg-[#b02a2a] hover:bg-[#992424] flex items-center justify-center gap-2 text-white"
          >
            <Monitor className="h-4 w-4" />
            <span>Start Tab Recording</span>
          </Button>
        )}

        <div className="flex-1 h-10 flex items-center bg-gray-100 dark:bg-[#181818] rounded-md overflow-hidden relative border border-gray-200 dark:border-gray-700">
          <canvas
            ref={visualizerRef}
            className={`w-full h-full absolute top-0 left-0 z-10 ${!recordingStatus && !isPlaying ? "opacity-0" : "opacity-100"}`}
          />

          {audio && (
            <audio
              ref={audioRef}
              src={audio}
              className="hidden"
              onEnded={() => {
                setIsPlaying(false);
                stopVisualization();
                if (playbackIntervalRef.current)
                  clearInterval(playbackIntervalRef.current);
                setPlaybackTime(0);
              }}
            />
          )}

          <div className="w-full h-full flex items-center justify-center z-0">
            <div className="w-[80%] h-[2px] bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </div>

        <span className="font-mono text-gray-900 dark:text-white text-xl w-16 text-right tabular-nums">
          {formatTime(isPlaying ? playbackTime : elapsedTime)}
        </span>

        <Button
          onClick={() => setShowTranscript(!showTranscript)}
          variant="ghost"
          className="text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 h-11 w-11 rounded-full"
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
        {recordingStatus === "preparing" && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            <Settings className="h-3 w-3 animate-spin" />
            <span>Preparing</span>
          </div>
        )}

        {recordingStatus === "recording" && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Radio className="h-3 w-3" />
            <span>Recording</span>
          </div>
        )}

        {transcription.isTranscribing && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
            <Activity className="h-3 w-3" />
            <span>Transcribing</span>
          </div>
        )}



        {uploadState.status === "uploading" && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Upload className="h-3 w-3 animate-pulse" />
            <span>Processing</span>
          </div>
        )}
      </div>

      {/* Transcription Display */}
      {showTranscript && (
        <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              Live Transcription
            </h3>

            {transcription.transcript && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCopyTranscript}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 p-1 h-8 w-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  onClick={handleDownloadTranscript}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 p-1 h-8 w-8"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  onClick={clearTranscript}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 text-xs px-2 h-8"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          <div className="min-h-[120px] max-h-[300px] overflow-y-auto bg-white dark:bg-[#0f0f0f] rounded-md p-3 text-sm">
            {transcription.transcript && (
              <span className="text-gray-900 dark:text-white font-medium">
                {transcription.transcript}
              </span>
            )}
            {transcription.partialTranscript && (
              <span className="text-blue-700 dark:text-blue-400 italic opacity-70">
                {transcription.partialTranscript}
              </span>
            )}
            {!transcription.transcript && !transcription.partialTranscript && (
              <span className="text-gray-500">
                {recordingStatus === "preparing"
                  ? "Setting up live transcription service..."
                  : recordingStatus === "recording"
                    ? "Start playing audio in the selected tab and transcription will appear here in real-time..."
                    : "Click 'Start Tab Recording' to begin live transcription of tab audio..."}
              </span>
            )}
          </div>

          {/* Transcription Error Display */}
          {transcription.error && (
            <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md">
              <p className="text-red-700 dark:text-red-400 text-xs">
                <strong>Transcription Error:</strong> {transcription.error}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {uploadState.status === "uploading" && uploadState.progress > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span>
              {uploadState.progress < 80
                ? "Uploading tab audio..."
                : uploadState.progress < 95
                  ? "Uploading transcript..."
                  : "Finalizing upload..."}
            </span>
            <span>{uploadState.progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Status Messages */}
      {uploadState.status === "completed" && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm mb-2">
            <CheckCircle className="h-4 w-4" />
            <span>Tab recording upload completed successfully! We will now process your recording and add it to your study material.</span>
          </div>
        </div>
      )}

      {uploadState.status === "failed" && uploadState.error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
            <XCircle className="h-4 w-4" />
            <span>Upload failed: {uploadState.error}</span>
          </div>
        </div>
      )}
    </div>
  );
}