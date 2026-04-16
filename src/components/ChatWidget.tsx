"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, X, MessageSquare, Loader2, Volume2, VolumeX, Video, VideoOff } from "lucide-react";

const MODEL = "models/gemini-3.1-flash-live-preview";
const DEFAULT_VERSION = "v1beta";

// --- AI CONFIGURATION ---
// Change these to update the AI's personality and voice automatically
const VOICE_NAME = "Zephyr";
const SYSTEM_INSTRUCTION = `At the start of the conversation, ask what language the user wants to use: English, Tagalog, or Bisaya.

You are a professional, loving, and thoughtful assisted living staff member here to help families and staff.
If you receive an image from the user's camera, identify the product shown and advise the user on its cost or details. Rely on world knowledge or use the search_knowledge_base / query_database tools if you need context for specific items.

DATABASE RULES:
- Use the query_database tool for any questions about patients, rooms, tasks, staff, facilities, or documents.
- Available tables: patients, daily_tasks, users, facilities, knowledge_base.
- Room numbers in the database are formatted like "101 A" (space, no dash). When someone asks about "101-A", search for "101" using the search parameter.
- For room searches, use: { table: "patients", search: { column: "room_number", term: "101" } }
- For name searches, use: { table: "patients", search: { column: "last_name", term: "dela cruz" } }
- For pending tasks, use: { table: "daily_tasks", filters: { status: "pending" } }
- For staff by role, use: { table: "users", filters: { role: "nurse" } }
- For facility info, use: { table: "facilities" }
- Always use search (partial match) when looking up rooms or names, not exact filters.

KNOWLEDGE BASE:
- Use search_knowledge_base for pricing, policies, and service documentation.
- Use query_database with table "knowledge_base" to list or search raw document content directly.`;
// -------------------------

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [messages, setMessages] = useState<{ role: "ai" | "user"; content: string }[]>([
        { role: "ai", content: "Hi! I'm your AssistedLiving Live Assistant. How can I help you today?" }
    ]);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("Idle");
    const [lastMsg, setLastMsg] = useState<string>("None");
    const [apiVersion, setApiVersion] = useState<string>(DEFAULT_VERSION);
    const [currentModel, setCurrentModel] = useState<string>(MODEL);

    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const videoStreamRef = useRef<MediaStream | null>(null);
    const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const captureAndSendFrameRef = useRef<() => void>(() => { });

    // Refs for non-stateful objects
    const socketRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const playbackQueueRef = useRef<Int16Array[]>([]);
    const isPlayingRef = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Toggle Chat
    const toggleChat = () => {
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            setError("GEMINI_API_KEY is not defined in your environment variables. Please restart your server.");
            setIsOpen(true);
            return;
        }
        if (!isOpen) {
            setIsOpen(true);
            connect();
        } else {
            disconnect();
            setIsOpen(false);
        }
    };

    // WebSocket Connection
    const connect = () => {
        if (socketRef.current) return;
        setError(null);
        setStatus("Connecting...");

        const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!key) {
            setError("API Key missing! Restart your server.");
            return;
        }

        const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.${apiVersion}.GenerativeService.BidiGenerateContent?key=${key}`;
        console.log("Connecting to:", url.split("?")[0] + "?key=REDACTED");

        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("Connected to WebSocket, sending configuration...");
            setStatus("Connected");

            // 1. Send the initial configuration
            const configMessage = {
                setup: {
                    model: currentModel,
                    generation_config: {
                        response_modalities: ["AUDIO"],
                        speech_config: {
                            voice_config: {
                                prebuilt_voice_config: {
                                    voice_name: VOICE_NAME
                                }
                            }
                        },
                    },
                    // Request transcription of both input and output audio
                    input_audio_transcription: {},
                    output_audio_transcription: {},
                    system_instruction: {
                        parts: [{ text: SYSTEM_INSTRUCTION }]
                    },
                    tools: [{
                        function_declarations: [
                            {
                                name: "search_knowledge_base",
                                description: "Searches the uploaded knowledge base documents for specific information about assisted living services, pricing, policies, or documentation.",
                                parameters: {
                                    type: "object",
                                    properties: {
                                        query: { type: "string", description: "The search query" }
                                    },
                                    required: ["query"]
                                }
                            },
                            {
                                name: "query_database",
                                description: `Query the live facility database. Available tables and their columns:
- patients: (id, first_name, last_name, room_number, date_of_birth, admission_date, medical_notes, facility_id, created_at)
- daily_tasks: (id, task_name, category, scheduled_time, task_date, status, notes, patient_id, completed_by, completed_at, facility_id, created_at). category values: hygiene, medication, feeding, vitals, other. status values: pending, completed, missed.
- users: staff members (id, first_name, last_name, role, facility_id, created_at). role values: admin, nurse, caregiver, doctor.
- facilities: (id, name, address, contact_number, created_at)
- knowledge_base: (id, content) — raw policy/pricing documents. Prefer search_knowledge_base for semantic search.
Use 'filters' for exact matches (e.g. { "status": "pending" }). Use 'search' for partial text matches (e.g. room numbers or names).
Room numbers are stored with spaces like '101 A' — always use search with a partial term like "101".`,
                                parameters: {
                                    type: "object",
                                    properties: {
                                        table: {
                                            type: "string",
                                            description: "Table to query: patients, daily_tasks, users, facilities, or knowledge_base"
                                        },
                                        filters: {
                                            type: "object",
                                            description: "Exact-match key-value pairs e.g. { \"status\": \"pending\" }"
                                        },
                                        search: {
                                            type: "object",
                                            description: "Partial text search e.g. { \"column\": \"room_number\", \"term\": \"101\" }",
                                            properties: {
                                                column: { type: "string" },
                                                term: { type: "string" }
                                            }
                                        }
                                    },
                                    required: ["table"]
                                }
                            }
                        ]
                    }]
                }
            };
            socket.send(JSON.stringify(configMessage));
        };

        socket.onmessage = async (event) => {
            let data = event.data;
            if (data instanceof Blob) {
                const text = await data.text();
                data = text;
            }

            let response;
            try {
                const dataStr = typeof data === 'string' ? data : 'Binary Data';
                setLastMsg(dataStr.substring(0, 100));

                if (typeof data !== 'string') return;
                response = JSON.parse(data);
                console.log("Decoded JSON:", response);
            } catch (e) {
                console.error("JSON parse error:", e);
                return;
            }

            // Exhaustive check for setup completion
            const isSetupComplete = !!(
                response.setupComplete ||
                response.setup_complete ||
                response.configComplete ||
                response.config_complete ||
                response.tool_call // Sometimes tool calls come first
            );
            if (isSetupComplete) {
                console.log("Setup complete, ready for audio.");
                setIsConnected(true);
                setStatus("Ready");
                return;
            }

            // Handle Audio/Content (Handle both casings)
            const serverContent = response.serverContent || response.server_content;
            const modelTurn = serverContent?.modelTurn || serverContent?.model_turn;

            if (modelTurn?.parts) {
                for (const part of modelTurn.parts) {
                    const inlineData = part.inlineData || part.inline_data;
                    if (inlineData) {
                        const rawData = atob(inlineData.data);
                        const buffer = new Int16Array(rawData.length / 2);
                        const view = new DataView(new ArrayBuffer(rawData.length));
                        for (let i = 0; i < rawData.length; i++) {
                            view.setUint8(i, rawData.charCodeAt(i));
                        }
                        for (let i = 0; i < buffer.length; i++) {
                            buffer[i] = view.getInt16(i * 2, true);
                        }
                        playbackQueueRef.current.push(buffer);
                        if (!isPlayingRef.current) processPlaybackQueue();
                    }
                    if (part.text) {
                        setMessages(prev => [...prev, { role: "ai", content: part.text }]);
                    }
                }
            }

            // Handle Interruption
            if (serverContent?.interrupted) {
                playbackQueueRef.current = [];
                isPlayingRef.current = false;
            }

            // --- TRANSCRIPTION HANDLERS ---
            // User speech transcription
            const inputTranscription = serverContent?.inputTranscription || serverContent?.input_transcription;
            if (inputTranscription?.text?.trim()) {
                setMessages(prev => {
                    // Replace the last user bubble if it's still building up, else append
                    const last = prev[prev.length - 1];
                    if (last?.role === "user") {
                        return [...prev.slice(0, -1), { role: "user", content: inputTranscription.text }];
                    }
                    return [...prev, { role: "user", content: inputTranscription.text }];
                });
            }

            // AI speech transcription
            const outputTranscription = serverContent?.outputTranscription || serverContent?.output_transcription;
            if (outputTranscription?.text?.trim()) {
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.role === "ai") {
                        return [...prev.slice(0, -1), { role: "ai", content: last.content + outputTranscription.text }];
                    }
                    return [...prev, { role: "ai", content: outputTranscription.text }];
                });
            }
            // --------------------------------

            // Handle Tool Calls
            const toolCall = response.toolCall || response.tool_call;
            const functionCalls = toolCall?.functionCalls || toolCall?.function_calls;

            if (functionCalls) {
                for (const call of functionCalls) {
                    if (call.name === "search_knowledge_base") {
                        const { query } = call.args;
                        try {
                            const searchRes = await fetch("/api/search", {
                                method: "POST",
                                body: JSON.stringify({ query })
                            });
                            const { context } = await searchRes.json();

                            socket.send(JSON.stringify({
                                toolResponse: {
                                    functionResponses: [{
                                        name: call.name,
                                        id: call.id,
                                        response: { content: context }
                                    }]
                                }
                            }));
                        } catch (err) {
                            console.error("Tool Call Error:", err);
                        }
                    }

                    if (call.name === "query_database") {
                        const { table, filters, search } = call.args;
                        try {
                            const queryRes = await fetch("/api/query", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ table, filters, search })
                            });
                            const { results, error } = await queryRes.json();

                            socket.send(JSON.stringify({
                                toolResponse: {
                                    functionResponses: [{
                                        name: call.name,
                                        id: call.id,
                                        response: { content: error ? `Error: ${error}` : JSON.stringify(results) }
                                    }]
                                }
                            }));
                        } catch (err) {
                            console.error("query_database Tool Error:", err);
                        }
                    }
                }
            }
        };

        socket.onerror = (e) => {
            console.error("WebSocket Error:", e);
            setError("Socket error. Check your API key or model availability.");
            setIsConnected(false);
            setStatus("Error");
        };

        socket.onclose = (e) => {
            console.log("WebSocket Closed:", e.code, e.reason);
            setIsConnected(false);
            setIsListening(false);
            setStatus("Disconnected");
            if (e.code !== 1000) {
                setError(`Connection lost (${e.code}). Reason: ${e.reason || "Unknown"}`);
            }
        };
    };

    const disconnect = () => {
        stopAudio();
        if (isVideoEnabled) {
            videoStreamRef.current?.getTracks().forEach(t => t.stop());
            videoStreamRef.current = null;
            setIsVideoEnabled(false);
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
                captureIntervalRef.current = null;
            }
        }
        socketRef.current?.close();
        socketRef.current = null;
        setIsConnected(false);
    };

    // Audio Playback Manager (24kHz)
    const processPlaybackQueue = async () => {
        if (playbackQueueRef.current.length === 0 || !audioContextRef.current) {
            isPlayingRef.current = false;
            return;
        }

        isPlayingRef.current = true;
        const pcmData = playbackQueueRef.current.shift()!;

        // Convert Int16 to Float32
        const floatData = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
            floatData[i] = pcmData[i] / 32768.0;
        }

        const buffer = audioContextRef.current.createBuffer(1, floatData.length, 24000);
        buffer.getChannelData(0).set(floatData);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => processPlaybackQueue();
        source.start();
    };

    // Start Microphone Capture (16kHz)
    const startAudio = async () => {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const source = audioContextRef.current.createMediaStreamSource(stream);
            const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

                const inputData = e.inputBuffer.getChannelData(0);
                // Convert Float32 to Int16
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
                }

                // Convert to Base64
                const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
                socketRef.current.send(JSON.stringify({
                    realtimeInput: {
                        audio: {
                            mimeType: "audio/pcm;rate=16000",
                            data: base64
                        }
                    }
                }));
            };

            source.connect(processor);
            processor.connect(audioContextRef.current.destination);
            setIsListening(true);
        } catch (err) {
            console.error("Mic error:", err);
            alert("Could not access microphone.");
        }
    };

    const stopAudio = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        processorRef.current?.disconnect();
        setIsListening(false);
    };

    captureAndSendFrameRef.current = () => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        const targetWidth = 640;
        const targetHeight = (video.videoHeight / video.videoWidth) * targetWidth;

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
        const base64Data = dataUrl.split(",")[1];

        if (base64Data) {
            socketRef.current.send(JSON.stringify({
                realtimeInput: {
                    video: {
                        mimeType: "image/jpeg",
                        data: base64Data
                    }
                }
            }));
        }
    };

    const toggleCamera = async () => {
        if (isVideoEnabled) {
            videoStreamRef.current?.getTracks().forEach(t => t.stop());
            videoStreamRef.current = null;
            setIsVideoEnabled(false);
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
                captureIntervalRef.current = null;
            }
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                videoStreamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsVideoEnabled(true);

                setTimeout(() => captureAndSendFrameRef.current(), 1000);
                captureIntervalRef.current = setInterval(() => captureAndSendFrameRef.current(), 3000);
            } catch (err) {
                console.error("Camera error:", err);
                alert("Could not access camera.");
            }
        }
    };

    useEffect(() => {
        return () => disconnect();
    }, []);

    // Auto-scroll transcription window to bottom whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden transition-all animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 text-white flex justify-between items-center rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-zinc-400"}`} />
                            <h3 className="font-semibold text-sm">AssistedLiving Live</h3>
                        </div>
                        <button onClick={toggleChat} className="hover:bg-black/10 p-1 rounded-full transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Visualizer Area */}
                    <div className="h-48 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-4 relative">
                        {error && (
                            <div className="absolute top-2 left-2 right-2 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] rounded border border-red-200 dark:border-red-800">
                                {error}
                            </div>
                        )}
                        <div className={`p-8 rounded-full border-4 transition-all duration-300 ${isListening ? "bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800" : "bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700"}`}>
                            <Mic className={`${isListening ? "text-teal-600 dark:text-teal-400 scale-125" : "text-zinc-400"} transition-transform`} size={40} />
                        </div>
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            {error ? "Error occurred" : status === "Connected, sending setup..." ? "Waiting for AI hand-shake..." : !isConnected ? "Connecting to Live AI..." : isListening ? "Listening... Speak naturally." : "Connected. Speak to ask anything."}
                        </p>
                        <div className="text-[10px] text-zinc-400 p-2 bg-black/5 rounded space-y-2 mt-2 opacity-50 hover:opacity-100 transition-opacity">
                            <div className="flex justify-between items-center">
                                <span>Status: {status}</span>
                                <span className="text-[8px] uppercase tracking-wider font-bold text-teal-600">{apiVersion}</span>
                            </div>
                            <div className="truncate">Last Msg: {lastMsg}</div>
                        </div>
                    </div>

                    {/* Transcription Window */}
                    <div className="flex-1 p-3 max-h-56 overflow-y-auto space-y-2 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"
                                }`}>
                                <span className={`text-[10px] font-semibold mb-0.5 ${msg.role === "user" ? "text-teal-600" : "text-zinc-400"
                                    }`}>
                                    {msg.role === "user" ? "You" : "Despina"}
                                </span>
                                <div className={`text-xs p-2 rounded-xl max-w-[85%] ${msg.role === "user"
                                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Controls */}
                    <div className="p-4 flex flex-col items-center gap-4 bg-zinc-50 dark:bg-zinc-950 text-sm">
                        <div className="flex justify-center gap-4 w-full">
                            {!isListening ? (
                                <button
                                    onClick={startAudio}
                                    disabled={!isConnected}
                                    className="px-6 py-2 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 disabled:bg-zinc-400 transition-all flex items-center gap-2 shadow-lg"
                                >
                                    <Mic size={18} /> Start Conversation
                                </button>
                            ) : (
                                <button
                                    onClick={toggleChat}
                                    className="px-6 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-200"
                                >
                                    <X size={18} /> End Conversation
                                </button>
                            )}

                            {isListening && (
                                <button
                                    onClick={toggleCamera}
                                    className={`px-4 py-2 text-white rounded-full font-medium transition-all flex items-center gap-2 shadow-lg ${isVideoEnabled ? "bg-red-500 hover:bg-red-600" : "bg-teal-600 hover:bg-teal-700"}`}
                                    title={isVideoEnabled ? "Turn off camera" : "Scan Product"}
                                >
                                    {isVideoEnabled ? <VideoOff size={18} /> : <Video size={18} />}
                                </button>
                            )}
                        </div>

                        {/* Video Feed Preview */}
                        <div className={`w-full overflow-hidden transition-all duration-300 ${isVideoEnabled ? "h-auto border border-zinc-200 dark:border-zinc-800 rounded-xl" : "h-0 opacity-0"}`}>
                            {isVideoEnabled && (
                                <div className="bg-black aspect-video relative">
                                    <video
                                        ref={(el) => {
                                            videoRef.current = el;
                                            if (el && videoStreamRef.current) {
                                                el.srcObject = videoStreamRef.current;
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> SCANNING
                                    </div>
                                </div>
                            )}
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="p-4 bg-gradient-to-br from-teal-600 to-emerald-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all outline-none animate-bounce"
                >
                    <Mic size={28} />
                </button>
            )}
        </div>
    );
}
