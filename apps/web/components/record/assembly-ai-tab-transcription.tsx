// components/SecureTabTranscription.tsx
"use client";

import { useRef, useState } from "react";

interface SecureTabTranscriptionProps {
  className?: string;
  onTranscriptChange?: (transcript: string) => void;
}

const SecureTabTranscription: React.FC<SecureTabTranscriptionProps> = ({
  className = "",
  onTranscriptChange,
}) => {
  const socket = useRef<WebSocket | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const scriptProcessor = useRef<ScriptProcessorNode | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

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

  const startCapture = async () => {
    try {
      setError(null);
      console.log("🎬 Starting tab capture...");

      // Get temporary token (secure approach)
      const token = await getToken();
      if (!token) return;

      // Capture tab audio
      console.log("📺 Requesting tab capture...");
      mediaStream.current = await navigator.mediaDevices.getDisplayMedia({
        video: true, // Include video for tab selection
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 16000,
        },
      });

      const audioTracks = mediaStream.current.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error(
          'No audio tracks detected. Please ensure you check "Share tab audio".',
        );
      }

      console.log("✅ Got tab stream:", {
        videoTracks: mediaStream.current.getVideoTracks().length,
        audioTracks: audioTracks.length,
      });

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
          setError("Authentication failed. Please check your API key.");
        } else if (event.code !== 1000) {
          setError(
            `Connection closed unexpectedly: ${event.reason || "Unknown reason"}`,
          );
        }

        setIsTranscribing(false);
        setSessionId(null);
        socket.current = null;
      };

      // Handle tab sharing ending
      mediaStream.current.getVideoTracks().forEach((track) => {
        track.onended = () => {
          console.log("📺 Tab sharing ended");
          stopCapture();
        };
      });
    } catch (err) {
      console.error("❌ Capture error:", err);

      let errorMessage = "Failed to start capture";
      if (err instanceof Error) {
        switch (err.name) {
          case "NotAllowedError":
            errorMessage = "Permission denied. Please allow screen capture.";
            break;
          case "NotSupportedError":
            errorMessage = "Screen capture not supported.";
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
    console.log("⏹️ Stopping capture...");
    setIsCapturing(false);
    setIsTranscribing(false);

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

  const forceEndpoint = () => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      console.log("🔄 Forcing endpoint...");
      socket.current.send(
        JSON.stringify({
          type: "ForceEndpoint",
        }),
      );
    }
  };

  const updateConfiguration = (config: any) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      console.log("⚙️ Updating configuration...", config);
      socket.current.send(
        JSON.stringify({
          type: "UpdateConfiguration",
          ...config,
        }),
      );
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
    const content = `AssemblyAI v3 Tab Transcription
Generated: ${new Date().toLocaleString()}
Session ID: ${sessionId || "N/A"}
Confidence: ${confidence ? (confidence * 100).toFixed(1) + "%" : "N/A"}

${transcript}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tab-transcript-v3-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg ${className}`}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          🎯 Secure Tab Transcription (v2)
        </h1>
        <p className="text-center text-gray-600 mb-6">
          High-accuracy real-time transcription with secure temporary tokens
        </p>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
          <ol className="text-blue-700 text-sm list-decimal list-inside space-y-1">
            <li>Click "Start Tab Transcription" below</li>
            <li>Select the browser tab you want to transcribe</li>
            <li>
              <strong>Important:</strong> Check "Share tab audio" in the dialog
            </li>
            <li>Click "Share" to begin ultra-fast AI transcription</li>
            <li>Get ultra-fast transcription with secure temporary tokens</li>
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
            {isCapturing ? "🔴 Transcribing..." : "🎯 Start Tab Transcription"}
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
            onClick={forceEndpoint}
            disabled={!isTranscribing}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              !isTranscribing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600 text-white"
            }`}
            type="button"
          >
            🔄 Force Endpoint
          </button>

          <button
            onClick={resetTranscript}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-colors"
            type="button"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Status */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                isCapturing
                  ? "bg-blue-100 text-blue-800 animate-pulse"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isCapturing ? "📺 Capturing Tab Audio" : "📺 Ready to Capture"}
            </span>

            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                isTranscribing
                  ? "bg-green-100 text-green-800 animate-pulse"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isTranscribing ? "🎯 v2 AI Transcribing..." : "🎯 v2 AI Ready"}
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
          </div>
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
              Ultra-fast AI transcription will appear here in real-time (~300ms
              latency)...
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

export default SecureTabTranscription;
// v3
// components/SecureTabTranscription.tsx
// "use client";

// import { useRef, useState } from "react";

// interface SecureTabTranscriptionProps {
//   className?: string;
//   onTranscriptChange?: (transcript: string) => void;
// }

// const SecureTabTranscription: React.FC<SecureTabTranscriptionProps> = ({
//   className = "",
//   onTranscriptChange,
// }) => {
//   const socket = useRef<WebSocket | null>(null);
//   const audioContext = useRef<AudioContext | null>(null);
//   const mediaStream = useRef<MediaStream | null>(null);
//   const scriptProcessor = useRef<ScriptProcessorNode | null>(null);

//   const [isCapturing, setIsCapturing] = useState(false);
//   const [isTranscribing, setIsTranscribing] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [partialTranscript, setPartialTranscript] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [confidence, setConfidence] = useState<number | null>(null);
//   const [sessionId, setSessionId] = useState<string | null>(null);

//   // Get temporary token from your API route (much more secure!)
//   const getToken = async (): Promise<string | null> => {
//     try {
//       setError(null);
//       console.log("🔑 Fetching temporary token...");

//       const response = await fetch("/api/token");
//       const data = await response.json();

//       if (data.error) {
//         console.error("❌ Error fetching token:", data.error);
//         setError(`Token error: ${data.error}`);
//         return null;
//       }

//       console.log("✅ Temporary token obtained successfully");
//       return data.token;
//     } catch (err) {
//       console.error("❌ Failed to fetch token:", err);
//       setError("Failed to fetch authentication token");
//       return null;
//     }
//   };

//   const startCapture = async () => {
//     try {
//       setError(null);
//       console.log("🎬 Starting tab capture...");

//       // Get temporary token (secure approach)
//       const token = await getToken();
//       if (!token) return;

//       // Capture tab audio
//       console.log("📺 Requesting tab capture...");
//       mediaStream.current = await navigator.mediaDevices.getDisplayMedia({
//         video: true, // Include video for tab selection
//         audio: {
//           echoCancellation: false,
//           noiseSuppression: false,
//           autoGainControl: false,
//           sampleRate: 16000,
//         },
//       });

//       const audioTracks = mediaStream.current.getAudioTracks();
//       if (audioTracks.length === 0) {
//         throw new Error(
//           'No audio tracks detected. Please ensure you check "Share tab audio".',
//         );
//       }

//       console.log("✅ Got tab stream:", {
//         videoTracks: mediaStream.current.getVideoTracks().length,
//         audioTracks: audioTracks.length,
//       });

//       setIsCapturing(true);

//       // Connect to AssemblyAI v3 with temporary token
//       console.log("🔌 Connecting to AssemblyAI v3...");
//       const wsUrl = new URL("wss://streaming.assemblyai.com/v3/ws");
//       wsUrl.searchParams.set("sample_rate", "16000");
//       wsUrl.searchParams.set("encoding", "pcm_s16le");
//       wsUrl.searchParams.set("format_turns", "true");
//       wsUrl.searchParams.set("end_of_turn_confidence_threshold", "0.7");
//       wsUrl.searchParams.set("min_end_of_turn_silence_when_confident", "300");
//       wsUrl.searchParams.set("max_turn_silence", "2400");
//       wsUrl.searchParams.set("token", token);

//       socket.current = new WebSocket(wsUrl.toString());

//       socket.current.onopen = async () => {
//         console.log("✅ WebSocket v3 connection established");
//         setIsTranscribing(true);

//         // Create audio processing pipeline
//         audioContext.current = new AudioContext({ sampleRate: 16000 });
//         const source = audioContext.current.createMediaStreamSource(
//           mediaStream.current!,
//         );
//         scriptProcessor.current = audioContext.current.createScriptProcessor(
//           4096,
//           1,
//           1,
//         );

//         source.connect(scriptProcessor.current);
//         scriptProcessor.current.connect(audioContext.current.destination);

//         scriptProcessor.current.onaudioprocess = (event) => {
//           if (!socket.current || socket.current.readyState !== WebSocket.OPEN)
//             return;

//           const inputData = event.inputBuffer.getChannelData(0);
//           const output = new Int16Array(inputData.length);

//           // Convert Float32 PCM to Int16 PCM
//           for (let i = 0; i < inputData.length; i++) {
//             output[i] = Math.min(1, inputData[i]) * 0x7fff;
//           }

//           // v3 API expects raw audio bytes
//           socket.current.send(output.buffer);
//         };

//         console.log("🎙️ Audio processing started");
//       };

//       socket.current.onmessage = (event) => {
//         try {
//           const res = JSON.parse(event.data);
//           console.log("📨 Received message:", res);

//           // Handle v3 API message types
//           if (res.type === "SessionBegins") {
//             console.log("🎯 AssemblyAI v3 session started:", res.session_id);
//             setSessionId(res.session_id);
//           }

//           if (res.type === "PartialTranscript") {
//             console.log("📝 Partial:", res.text);
//             setPartialTranscript(res.text || "");
//             setConfidence(res.confidence || null);
//           }

//           if (res.type === "FinalTranscript") {
//             console.log("✅ Final:", res.text);
//             setTranscript((prev) => {
//               const newTranscript = prev + " " + (res.text || "");
//               onTranscriptChange?.(newTranscript);
//               return newTranscript;
//             });
//             setPartialTranscript("");
//             setConfidence(res.confidence || null);
//           }

//           // Handle v3 turn-based formatting
//           if (res.type === "Turn") {
//             console.log("🔄 Turn:", res);

//             if (res.end_of_turn === false) {
//               // This is a partial/ongoing turn - show as partial
//               console.log("📝 Partial turn:", res.transcript);
//               setPartialTranscript(res.transcript || "");
//               setConfidence(res.end_of_turn_confidence || null);
//             } else if (
//               res.end_of_turn === true &&
//               res.turn_is_formatted === true
//             ) {
//               // This is a final formatted turn - add to main transcript
//               console.log("✅ Final formatted turn:", res.transcript);
//               if (res.transcript) {
//                 setTranscript((prev) => {
//                   const newTranscript =
//                     prev + (prev ? " " : "") + res.transcript;
//                   onTranscriptChange?.(newTranscript);
//                   return newTranscript;
//                 });
//                 setPartialTranscript("");
//                 setConfidence(res.end_of_turn_confidence || null);
//               }
//             }
//           }

//           if (res.type === "Termination") {
//             console.log("🔚 Session terminated by server:", res);
//             setIsTranscribing(false);
//           }

//           // Handle errors
//           if (res.error) {
//             console.error("❌ AssemblyAI v3 error:", res.error);
//             setError(`AssemblyAI error: ${res.error}`);
//           }
//         } catch (parseError) {
//           console.error("❌ Failed to parse message:", parseError, event.data);
//         }
//       };

//       socket.current.onerror = (event) => {
//         console.error("❌ WebSocket error:", event);
//         setError("WebSocket connection error");
//         stopCapture();
//       };

//       socket.current.onclose = (event) => {
//         console.log("🔌 WebSocket closed:", event.code, event.reason);

//         if (event.code === 4008) {
//           setError("Session expired. Please start a new session.");
//         } else if (event.code === 4001) {
//           setError("Authentication failed. Please check your API key.");
//         } else if (event.code !== 1000) {
//           setError(
//             `Connection closed unexpectedly: ${event.reason || "Unknown reason"}`,
//           );
//         }

//         setIsTranscribing(false);
//         setSessionId(null);
//         socket.current = null;
//       };

//       // Handle tab sharing ending
//       mediaStream.current.getVideoTracks().forEach((track) => {
//         track.onended = () => {
//           console.log("📺 Tab sharing ended");
//           stopCapture();
//         };
//       });
//     } catch (err) {
//       console.error("❌ Capture error:", err);

//       let errorMessage = "Failed to start capture";
//       if (err instanceof Error) {
//         switch (err.name) {
//           case "NotAllowedError":
//             errorMessage = "Permission denied. Please allow screen capture.";
//             break;
//           case "NotSupportedError":
//             errorMessage = "Screen capture not supported.";
//             break;
//           default:
//             errorMessage = err.message;
//         }
//       }

//       setError(errorMessage);
//       setIsCapturing(false);
//       setIsTranscribing(false);
//     }
//   };

//   const stopCapture = () => {
//     console.log("⏹️ Stopping capture...");
//     setIsCapturing(false);
//     setIsTranscribing(false);

//     if (scriptProcessor.current) {
//       scriptProcessor.current.disconnect();
//       scriptProcessor.current = null;
//     }

//     if (audioContext.current) {
//       audioContext.current.close();
//       audioContext.current = null;
//     }

//     if (mediaStream.current) {
//       mediaStream.current.getTracks().forEach((track) => track.stop());
//       mediaStream.current = null;
//     }

//     if (socket.current) {
//       console.log("🔚 Ending AssemblyAI v3 session...");
//       // Send termination message in v3 format
//       socket.current.send(
//         JSON.stringify({
//           type: "SessionTermination",
//         }),
//       );
//       socket.current.close();
//       socket.current = null;
//     }

//     setSessionId(null);
//   };

//   const forceEndpoint = () => {
//     if (socket.current && socket.current.readyState === WebSocket.OPEN) {
//       console.log("🔄 Forcing endpoint...");
//       socket.current.send(
//         JSON.stringify({
//           type: "ForceEndpoint",
//         }),
//       );
//     }
//   };

//   const updateConfiguration = (config: any) => {
//     if (socket.current && socket.current.readyState === WebSocket.OPEN) {
//       console.log("⚙️ Updating configuration...", config);
//       socket.current.send(
//         JSON.stringify({
//           type: "UpdateConfiguration",
//           ...config,
//         }),
//       );
//     }
//   };

//   const resetTranscript = () => {
//     setTranscript("");
//     setPartialTranscript("");
//     setConfidence(null);
//     setError(null);
//   };

//   const handleCopyTranscript = async () => {
//     try {
//       await navigator.clipboard.writeText(transcript);
//     } catch (err) {
//       console.error("Failed to copy transcript:", err);
//     }
//   };

//   const handleDownloadTranscript = () => {
//     const content = `AssemblyAI v3 Tab Transcription
// Generated: ${new Date().toLocaleString()}
// Session ID: ${sessionId || "N/A"}
// Confidence: ${confidence ? (confidence * 100).toFixed(1) + "%" : "N/A"}

// ${transcript}`;

//     const blob = new Blob([content], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `tab-transcript-v3-${new Date().toISOString().split("T")[0]}.txt`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div
//       className={`max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg ${className}`}
//     >
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
//           🎯 Secure Tab Transcription (v3)
//         </h1>
//         <p className="text-center text-gray-600 mb-6">
//           Ultra-fast real-time transcription with secure temporary tokens
//         </p>

//         {/* Instructions */}
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//           <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
//           <ol className="text-blue-700 text-sm list-decimal list-inside space-y-1">
//             <li>Click "Start Tab Transcription" below</li>
//             <li>Select the browser tab you want to transcribe</li>
//             <li>
//               <strong>Important:</strong> Check "Share tab audio" in the dialog
//             </li>
//             <li>Click "Share" to begin ultra-fast AI transcription</li>
//             <li>Get ultra-fast transcription with secure temporary tokens</li>
//           </ol>
//         </div>

//         {/* Controls */}
//         <div className="flex flex-wrap gap-3 justify-center mb-4">
//           <button
//             onClick={startCapture}
//             disabled={isCapturing}
//             className={`px-6 py-2 rounded-md font-medium transition-colors ${
//               isCapturing
//                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                 : "bg-green-500 hover:bg-green-600 text-white"
//             }`}
//             type="button"
//           >
//             {isCapturing ? "🔴 Transcribing..." : "🎯 Start Tab Transcription"}
//           </button>

//           <button
//             onClick={stopCapture}
//             disabled={!isCapturing}
//             className={`px-6 py-2 rounded-md font-medium transition-colors ${
//               !isCapturing
//                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                 : "bg-red-500 hover:bg-red-600 text-white"
//             }`}
//             type="button"
//           >
//             ⏹️ Stop
//           </button>

//           <button
//             onClick={forceEndpoint}
//             disabled={!isTranscribing}
//             className={`px-6 py-2 rounded-md font-medium transition-colors ${
//               !isTranscribing
//                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                 : "bg-yellow-500 hover:bg-yellow-600 text-white"
//             }`}
//             type="button"
//           >
//             🔄 Force Endpoint
//           </button>

//           <button
//             onClick={resetTranscript}
//             className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-colors"
//             type="button"
//           >
//             🗑️ Clear
//           </button>
//         </div>

//         {/* Status */}
//         <div className="text-center mb-4">
//           <div className="flex items-center justify-center gap-4 flex-wrap">
//             <span
//               className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
//                 isCapturing
//                   ? "bg-blue-100 text-blue-800 animate-pulse"
//                   : "bg-gray-100 text-gray-600"
//               }`}
//             >
//               {isCapturing ? "📺 Capturing Tab Audio" : "📺 Ready to Capture"}
//             </span>

//             <span
//               className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
//                 isTranscribing
//                   ? "bg-green-100 text-green-800 animate-pulse"
//                   : "bg-gray-100 text-gray-600"
//               }`}
//             >
//               {isTranscribing ? "🎯 v3 AI Transcribing..." : "🎯 v3 AI Ready"}
//             </span>

//             {sessionId && (
//               <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
//                 🆔 {sessionId.slice(0, 8)}...
//               </span>
//             )}

//             {confidence && (
//               <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
//                 📊 {(confidence * 100).toFixed(1)}% confidence
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
//             <p className="text-red-600 text-sm">
//               <strong>Error:</strong> {error}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Transcript Display */}
//       <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto mb-4">
//         <div className="text-gray-700 whitespace-pre-wrap">
//           {transcript && (
//             <span className="font-medium text-gray-900">{transcript}</span>
//           )}
//           {partialTranscript && (
//             <span className="text-blue-600 italic opacity-70">
//               {" "}
//               {partialTranscript}
//             </span>
//           )}
//           {!transcript && !partialTranscript && (
//             <span className="text-gray-400">
//               Ultra-fast AI transcription will appear here in real-time (~300ms
//               latency)...
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Action Buttons */}
//       {transcript && (
//         <div className="flex flex-wrap gap-3 justify-center">
//           <button
//             onClick={handleCopyTranscript}
//             className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
//             type="button"
//           >
//             📋 Copy Transcript
//           </button>

//           <button
//             onClick={handleDownloadTranscript}
//             className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm font-medium transition-colors"
//             type="button"
//           >
//             💾 Download with Metadata
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SecureTabTranscription;
