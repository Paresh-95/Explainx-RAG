// components/SecureMicTranscription.tsx
"use client";

import { useRef, useState } from "react";

interface SecureMicTranscriptionProps {
  className?: string;
  onTranscriptChange?: (transcript: string) => void;
  onAudioRecorded?: (audioUrl: string) => void;
}

const SecureMicTranscription: React.FC<SecureMicTranscriptionProps> = ({
  className = "",
  onTranscriptChange,
  onAudioRecorded,
}) => {
  const socket = useRef<WebSocket | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const scriptProcessor = useRef<ScriptProcessorNode | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [microphoneLevel, setMicrophoneLevel] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  // Get temporary token from your API route (much more secure!)
  const getToken = async (): Promise<string | null> => {
    try {
      setError(null);
      console.log("🔑 Fetching temporary token...");

      const response = await fetch("/api/token");
      const data = await response.json();

      if (data.error) {
        console.error("❌ Error fetching token:", data.error);
        setError(`Token error: ${data.error}`);
        return null;
      }

      console.log("✅ Temporary token obtained successfully");
      return data.token;
    } catch (err) {
      console.error("❌ Failed to fetch token:", err);
      setError("Failed to fetch authentication token");
      return null;
    }
  };

  // Upload audio to S3 using your existing route
  const uploadAudioToS3 = async (
    audioBlob: Blob,
    fileExtension: string,
    mimeType: string,
  ): Promise<string | null> => {
    try {
      setIsUploading(true);
      console.log(`📤 Uploading ${fileExtension.toUpperCase()} audio to S3...`);

      // Generate unique filename with correct extension
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `microphone-recording-${timestamp}.${fileExtension}`;

      // Get presigned URL from your existing route
      const presignedResponse = await fetch("/api/upload-presigned-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          fileSize: audioBlob.size,
          mimeType: mimeType,
          title: `Microphone Recording ${new Date().toLocaleString()}`,
          description: `Audio recording from microphone transcription (${fileExtension.toUpperCase()})`,
          isTemporary: true, // Use temporary folder
        }),
      });

      if (!presignedResponse.ok) {
        throw new Error("Failed to get presigned URL");
      }

      const { presignedUrl, fileUrl } = await presignedResponse.json();

      // Upload audio file to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: audioBlob,
        headers: {
          "Content-Type": mimeType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload audio to S3");
      }

      console.log(
        `✅ ${fileExtension.toUpperCase()} audio uploaded successfully:`,
        fileUrl,
      );
      return fileUrl;
    } catch (error) {
      console.error("❌ Audio upload failed:", error);
      setError("Failed to upload audio recording");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const startCapture = async () => {
    try {
      setError(null);
      setRecordedAudioUrl(null);
      setRecordingDuration(0);
      audioChunks.current = [];
      console.log("🎙️ Starting microphone capture...");

      // Get temporary token (secure approach)
      const token = await getToken();
      if (!token) return;

      // Capture microphone audio
      console.log("🎤 Requesting microphone access...");
      mediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true, // Enable for microphone (reduces feedback)
          noiseSuppression: true, // Enable for microphone (reduces background noise)
          autoGainControl: true, // Enable for microphone (normalizes volume)
          sampleRate: 16000,
          channelCount: 1,
        },
      });

      const audioTracks = mediaStream.current.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error(
          "No microphone detected. Please ensure your microphone is connected and accessible.",
        );
      }

      console.log("✅ Got microphone stream:", {
        audioTracks: audioTracks.length,
        settings: audioTracks[0]?.getSettings(),
      });

      // Start MediaRecorder for audio recording
      // Try WAV first, fallback to MP3, then WebM
      let mimeType = "audio/wav";
      let fileExtension = "wav";

      if (!MediaRecorder.isTypeSupported("audio/wav")) {
        if (MediaRecorder.isTypeSupported("audio/mpeg")) {
          mimeType = "audio/mpeg";
          fileExtension = "mp3";
          console.log("🎵 Using MP3 format (WAV not supported)");
        } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
          fileExtension = "webm";
          console.log("🎵 Using WebM format (WAV/MP3 not supported)");
        } else {
          console.log("🎵 Using default format");
          mimeType = "";
          fileExtension = "audio";
        }
      } else {
        console.log("🎵 Using WAV format");
      }

      mediaRecorder.current = new MediaRecorder(mediaStream.current, {
        mimeType: mimeType || undefined,
      });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        console.log("🎵 Processing recorded audio...");
        const audioBlob = new Blob(audioChunks.current, { type: mimeType });

        // Upload to S3 with correct file extension and MIME type
        const audioUrl = await uploadAudioToS3(
          audioBlob,
          fileExtension,
          mimeType,
        );
        if (audioUrl) {
          setRecordedAudioUrl(audioUrl);
          onAudioRecorded?.(audioUrl);
        }
      };

      mediaRecorder.current.start(1000); // Record in 1-second chunks
      console.log("🔴 Audio recording started");

      // Start recording timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      setIsCapturing(true);

      // Connect to AssemblyAI v2 with temporary token (more secure)
      console.log("🔌 Connecting to AssemblyAI v2 with secure token...");
      socket.current = new WebSocket(
        `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`,
      );

      socket.current.onopen = async () => {
        console.log("✅ WebSocket v2 connection established");
        setIsTranscribing(true);

        // Create audio processing pipeline
        audioContext.current = new AudioContext({ sampleRate: 16000 });
        const source = audioContext.current.createMediaStreamSource(
          mediaStream.current!,
        );

        // Create analyzer for visual feedback
        const analyzer = audioContext.current.createAnalyser();
        analyzer.fftSize = 256;
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        source.connect(analyzer);

        // Audio level monitoring for visual feedback
        const updateMicLevel = () => {
          if (analyzer && isCapturing) {
            analyzer.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            setMicrophoneLevel(Math.round((average / 255) * 100));
            requestAnimationFrame(updateMicLevel);
          }
        };
        updateMicLevel();

        scriptProcessor.current = audioContext.current.createScriptProcessor(
          4096,
          1,
          1,
        );

        source.connect(scriptProcessor.current);
        scriptProcessor.current.connect(audioContext.current.destination);

        scriptProcessor.current.onaudioprocess = (event) => {
          if (!socket.current || socket.current.readyState !== WebSocket.OPEN)
            return;

          const inputData = event.inputBuffer.getChannelData(0);
          const output = new Int16Array(inputData.length);

          // Convert Float32 PCM to Int16 PCM
          for (let i = 0; i < inputData.length; i++) {
            output[i] = Math.min(1, inputData[i]!) * 0x7fff;
          }

          socket.current.send(output.buffer);
        };

        console.log("🎙️ Audio processing started");
      };

      socket.current.onmessage = (event) => {
        try {
          const res = JSON.parse(event.data);
          console.log("📨 Received message:", res);

          // Handle v2 API message types
          if (res.message_type === "SessionBegins") {
            console.log("🎯 AssemblyAI v2 session started:", res.session_id);
            setSessionId(res.session_id);
          }

          if (res.message_type === "PartialTranscript") {
            console.log("📝 Partial:", res.text);
            setPartialTranscript(res.text || "");
            setConfidence(res.confidence || null);
          }

          if (res.message_type === "FinalTranscript") {
            console.log("✅ Final:", res.text);
            if (res.text) {
              setTranscript((prev) => {
                const newTranscript = prev + (prev ? " " : "") + res.text;
                onTranscriptChange?.(newTranscript);
                return newTranscript;
              });
              setPartialTranscript("");
              setConfidence(res.confidence || null);
            }
          }

          // Handle errors
          if (res.error) {
            console.error("❌ AssemblyAI v2 error:", res.error);
            setError(`AssemblyAI error: ${res.error}`);
          }
        } catch (parseError) {
          console.error("❌ Failed to parse message:", parseError, event.data);
        }
      };

      socket.current.onerror = (event) => {
        console.error("❌ WebSocket error:", event);
        setError("WebSocket connection error");
        stopCapture();
      };

      socket.current.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);

        if (event.code === 4008) {
          setError("Session expired. Please start a new session.");
        } else if (event.code === 4001) {
          setError("Authentication failed. Please check your token.");
        } else if (event.code !== 1000) {
          setError(
            `Connection closed unexpectedly: ${event.reason || "Unknown reason"}`,
          );
        }

        setIsTranscribing(false);
        setSessionId(null);
        socket.current = null;
      };

      // Handle microphone disconnection
      mediaStream.current.getAudioTracks().forEach((track) => {
        track.onended = () => {
          console.log("🎤 Microphone disconnected");
          stopCapture();
        };
      });
    } catch (err) {
      console.error("❌ Capture error:", err);

      let errorMessage = "Failed to start microphone capture";
      if (err instanceof Error) {
        switch (err.name) {
          case "NotAllowedError":
            errorMessage =
              "Microphone permission denied. Please allow microphone access.";
            break;
          case "NotFoundError":
            errorMessage = "No microphone found. Please connect a microphone.";
            break;
          case "NotSupportedError":
            errorMessage = "Microphone access not supported in this browser.";
            break;
          case "OverconstrainedError":
            errorMessage = "Microphone doesn't meet the required constraints.";
            break;
          default:
            errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setIsCapturing(false);
      setIsTranscribing(false);
    }
  };

  const stopCapture = () => {
    console.log("⏹️ Stopping microphone capture...");
    setIsCapturing(false);
    setIsTranscribing(false);
    setMicrophoneLevel(0);

    // Stop recording timer
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }

    // Stop MediaRecorder
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      console.log("🎵 Audio recording stopped");
    }

    if (scriptProcessor.current) {
      scriptProcessor.current.disconnect();
      scriptProcessor.current = null;
    }

    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }

    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
      mediaStream.current = null;
    }

    if (socket.current) {
      console.log("🔚 Ending AssemblyAI v2 session...");
      // Send termination message in v2 format
      socket.current.send(
        JSON.stringify({
          terminate_session: true,
        }),
      );
      socket.current.close();
      socket.current = null;
    }

    setSessionId(null);
  };

  const toggleMute = () => {
    if (mediaStream.current) {
      const audioTrack = mediaStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log(
          `🎤 Microphone ${audioTrack.enabled ? "unmuted" : "muted"}`,
        );
      }
    }
  };

  const resetTranscript = () => {
    setTranscript("");
    setPartialTranscript("");
    setConfidence(null);
    setError(null);
  };

  const handleCopyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
    } catch (err) {
      console.error("Failed to copy transcript:", err);
    }
  };

  const handleDownloadTranscript = () => {
    const content = `AssemblyAI Microphone Transcription
Generated: ${new Date().toLocaleString()}
Session ID: ${sessionId || "N/A"}
Recording Duration: ${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, "0")}
Audio URL: ${recordedAudioUrl || "Not available"}
Confidence: ${confidence ? (confidence * 100).toFixed(1) + "%" : "N/A"}

${transcript}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mic-transcript-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format recording duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isMuted = mediaStream.current?.getAudioTracks()[0]?.enabled === false;

  return (
    <div
      className={`max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg ${className}`}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          🎤 Secure Microphone Transcription
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Real-time speech-to-text transcription with audio recording
        </p>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
          <ol className="text-blue-700 text-sm list-decimal list-inside space-y-1">
            <li>Click "Start Microphone Transcription" below</li>
            <li>Allow microphone access when prompted</li>
            <li>Start speaking into your microphone</li>
            <li>Watch your speech appear as text in real-time</li>
            <li>Audio is automatically recorded and uploaded to S3</li>
            <li>Use mute/unmute to control audio input</li>
          </ol>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          <button
            onClick={startCapture}
            disabled={isCapturing}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isCapturing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
            type="button"
          >
            {isCapturing
              ? "🔴 Recording..."
              : "🎤 Start Microphone Transcription"}
          </button>

          <button
            onClick={stopCapture}
            disabled={!isCapturing}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              !isCapturing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
            type="button"
          >
            ⏹️ Stop
          </button>

          <button
            onClick={toggleMute}
            disabled={!isCapturing}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              !isCapturing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : isMuted
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            type="button"
          >
            {isMuted ? "🔇 Unmute" : "🔇 Mute"}
          </button>

          <button
            onClick={resetTranscript}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-colors"
            type="button"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Status and Audio Level */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-4 flex-wrap mb-3">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                isCapturing
                  ? "bg-blue-100 text-blue-800 animate-pulse"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isCapturing ? "🎤 Recording Audio" : "🎤 Ready to Record"}
            </span>

            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                isTranscribing
                  ? "bg-green-100 text-green-800 animate-pulse"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isTranscribing ? "🎯 AI Transcribing..." : "🎯 AI Ready"}
            </span>

            {sessionId && (
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                🆔 {sessionId.slice(0, 8)}...
              </span>
            )}

            {confidence && (
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                📊 {(confidence * 100).toFixed(1)}% confidence
              </span>
            )}

            {isCapturing && (
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                ⏱️ {formatDuration(recordingDuration)}
              </span>
            )}

            {isUploading && (
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 animate-pulse">
                📤 Uploading...
              </span>
            )}

            {isMuted && isCapturing && (
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                🔇 Muted
              </span>
            )}
          </div>

          {/* Audio Level Indicator */}
          {isCapturing && !isMuted && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Audio Level:</span>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    microphoneLevel > 60
                      ? "bg-red-500"
                      : microphoneLevel > 30
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${microphoneLevel}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-10">
                {microphoneLevel}%
              </span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}
      </div>

      {/* Audio Playback */}
      {recordedAudioUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-green-800">🎵 Recorded Audio</h3>
            <span className="text-sm text-green-600">
              Duration: {formatDuration(recordingDuration)}
            </span>
          </div>
          <audio
            controls
            className="w-full"
            src={recordedAudioUrl}
            preload="metadata"
          >
            Your browser does not support the audio element.
          </audio>
          <div className="mt-2 text-xs text-green-600">
            Audio is stored securely in S3 and available for playback
          </div>
        </div>
      )}

      {/* Transcript Display */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto mb-4">
        <div className="text-gray-700 whitespace-pre-wrap">
          {transcript && (
            <span className="font-medium text-gray-900">{transcript}</span>
          )}
          {partialTranscript && (
            <span className="text-blue-600 italic opacity-70">
              {" "}
              {partialTranscript}
            </span>
          )}
          {!transcript && !partialTranscript && (
            <span className="text-gray-400">
              Start speaking into your microphone and your speech will appear
              here in real-time...
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {transcript && (
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleCopyTranscript}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
            type="button"
          >
            📋 Copy Transcript
          </button>

          <button
            onClick={handleDownloadTranscript}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm font-medium transition-colors"
            type="button"
          >
            💾 Download with Metadata
          </button>
        </div>
      )}
    </div>
  );
};

export default SecureMicTranscription;
