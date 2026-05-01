"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { VisualPanel } from "@/features/visuals/VisualPanel";
import type { ChatResponse, SpeechToTextResponse } from "@/types/api";
import type { ConceptId, Message, TutorVisual, UnderstandingSignal } from "@/types/session";

interface ChatMessage extends Message {
  id: string;
}

type InputMode = "text" | "voice";
type RecordingState = "idle" | "recording" | "processing";

const SESSION_ID = "vidya-browser-session";

function createMessage(role: Message["role"], content: string): ChatMessage {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    role,
    content
  };
}

function getSupportedMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type));
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function inferConceptId(message: string, currentConceptId: ConceptId): ConceptId {
  const normalized = message.toLowerCase();

  if (/\b(acceleration|accelerate|deceleration|tez|slow|direction change)\b/.test(normalized)) {
    return "acceleration";
  }

  if (/\b(speed|velocity|velosity|vlosity|fast|slow|direction|speedometer)\b/.test(normalized)) {
    return "speed-velocity";
  }

  if (/\b(distance|displacement|path|shortest|position|shift)\b/.test(normalized)) {
    return "distance-displacement";
  }

  return currentConceptId;
}

export function TutorExperience() {
  const [conceptId, setConceptId] = useState<ConceptId>("speed-velocity");
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage("assistant", "Hi, main Vidya hoon. Jo bhi topic stuck hai, type karo ya mic se bolo.")
  ]);
  const [textInput, setTextInput] = useState("");
  const [understandingSignal, setUnderstandingSignal] = useState<UnderstandingSignal | undefined>();
  const [isSending, setIsSending] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latestFollowUp, setLatestFollowUp] = useState("Kis topic mein help chahiye: concept, homework question, ya revision?");
  const [latestVisual, setLatestVisual] = useState<TutorVisual | null>(null);
  const [latestVisualAssistantText, setLatestVisualAssistantText] = useState("");
  const [isVisualPanelOpen, setIsVisualPanelOpen] = useState(false);
  const [lastInputMode, setLastInputMode] = useState<InputMode>("text");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, isSending, recordingState]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      stopStream(mediaStreamRef.current);
      if (audioRef.current?.src.startsWith("blob:")) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  async function speakReply(text: string) {
    if (audioRef.current?.src.startsWith("blob:")) {
      URL.revokeObjectURL(audioRef.current.src);
    }

    try {
      const response = await fetch(`/api/tts?text=${encodeURIComponent(text)}`, { cache: "no-store" });
      const audioBlob = await response.blob();

      if (response.ok && audioBlob.size > 0) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        await audio.play();
        return;
      }
    } catch {
      // Browser speech below keeps voice output available without provider keys.
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      utterance.rate = 0.96;
      window.speechSynthesis.speak(utterance);
    }
  }

  async function sendTutorMessage(content: string, inputMode: InputMode) {
    const trimmed = content.trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessage = createMessage("user", trimmed);
    const nextMessages = [...messages, userMessage];
    const resolvedConceptId = inferConceptId(trimmed, conceptId);

    if (resolvedConceptId !== conceptId) {
      setConceptId(resolvedConceptId);
    }

    setMessages(nextMessages);
    setTextInput("");
    setIsSending(true);
    setErrorMessage(null);
    setLastInputMode(inputMode);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId: SESSION_ID,
          conceptId: resolvedConceptId,
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent
          })),
          inputMode,
          understandingSignal
        })
      });
      const data = (await response.json()) as ChatResponse | { error: string };

      if (!response.ok || "error" in data) {
        setErrorMessage("error" in data ? data.error : "Tutor reply failed.");
        return;
      }

      setLatestFollowUp(data.tutorTurn.followUpQuestion);
      setLatestVisual(data.tutorTurn.visual);
      setLatestVisualAssistantText(data.tutorTurn.assistantText);
      setIsVisualPanelOpen(data.tutorTurn.visual.kind !== "none" && Boolean(data.tutorTurn.visual.url));
      setMessages((current) => [...current, createMessage("assistant", data.tutorTurn.assistantText)]);
      await speakReply(data.tutorTurn.spokenText);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not reach Vidya.");
    } finally {
      setIsSending(false);
    }
  }

  async function submitText() {
    await sendTutorMessage(textInput, "text");
  }

  async function transcribeAndSend(blob: Blob) {
    setRecordingState("processing");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("audio", new File([blob], "vidya-voice.webm", { type: blob.type || "audio/webm" }));

      const response = await fetch("/api/stt", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as SpeechToTextResponse | { error: string };

      if (!response.ok || "error" in data) {
        setErrorMessage("error" in data ? data.error : "Could not transcribe audio.");
        return;
      }

      await sendTutorMessage(data.transcript, "voice");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Voice input failed.");
    } finally {
      setRecordingState("idle");
    }
  }

  async function startRecording() {
    if (recordingState !== "idle" || isSending) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        stopStream(stream);
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        void transcribeAndSend(blob);
      };

      recorder.start();
      setRecordingState("recording");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Microphone is not available.");
      setRecordingState("idle");
      stopStream(mediaStreamRef.current);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  const statusText =
    recordingState === "recording"
      ? "Listening"
      : recordingState === "processing"
        ? "Transcribing"
        : isSending
          ? "Thinking"
          : lastInputMode === "voice"
            ? "Voice ready"
            : "Chat ready";

  return (
    <AuroraBackground
      className="min-h-svh overflow-hidden bg-[#070a0f] text-white dark:bg-[#070a0f]"
      showRadialGradient={false}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(91,141,239,0.18),transparent_32%),linear-gradient(180deg,rgba(7,10,15,0.34),rgba(7,10,15,0.92)_70%)]" />

      <section className="relative z-10 mx-auto flex min-h-svh w-full max-w-7xl flex-col px-4 py-4 sm:px-5">
        <header className="flex shrink-0 items-center justify-between gap-3 py-2">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-sm font-semibold">
              V
            </div>
            <div>
              <p className="text-sm font-semibold">Vidya AI</p>
              <p className="text-xs text-white/45">{statusText}</p>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white/55">
            Buddy tutor
          </div>
        </header>

        <div
          className={[
            "my-4 grid min-h-0 flex-1 gap-4",
            isVisualPanelOpen && latestVisual?.kind !== "none"
              ? "lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]"
              : "lg:grid-cols-1"
          ].join(" ")}
        >
          <main className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0b1018]/86 shadow-2xl backdrop-blur-2xl">
            <div className="border-b border-white/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/35">Voice and chat</p>
              <p className="mt-2 text-sm leading-6 text-white/58">{latestFollowUp}</p>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={[
                    "max-w-[88%] rounded-lg border px-4 py-3 text-sm leading-6",
                    message.role === "user"
                      ? "ml-auto border-emerald-300/20 bg-emerald-300/[0.1] text-white"
                      : "border-white/10 bg-white/[0.05] text-white/80"
                  ].join(" ")}
                >
                  <span className="mb-1 block text-xs font-semibold text-white/35">
                    {message.role === "user" ? "You" : "Vidya"}
                  </span>
                  {message.content}
                </motion.div>
              ))}
              {isSending || recordingState === "processing" ? (
                <div className="max-w-[88%] rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/48">
                  {recordingState === "processing" ? "Converting voice..." : "Vidya is thinking..."}
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            {errorMessage ? (
              <div className="mx-3 rounded-lg border border-amber-300/30 bg-amber-400/15 px-4 py-3 text-sm text-amber-100">
                {errorMessage}
              </div>
            ) : null}

            <div className="border-t border-white/10 bg-[#0b1018]/95 p-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {[
                  ["understood", "Got it"],
                  ["still-confused", "Still confused"],
                  ["curious", "Go deeper"]
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setUnderstandingSignal(value as UnderstandingSignal)}
                    className={[
                      "rounded-lg border px-3 py-2 text-xs font-semibold transition",
                      understandingSignal === value
                        ? "border-white bg-white text-slate-950"
                        : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void submitText();
                }}
              >
                <button
                  type="button"
                  onClick={recordingState === "recording" ? stopRecording : () => void startRecording()}
                  disabled={recordingState === "processing" || isSending}
                  className={[
                    "grid size-12 shrink-0 place-items-center rounded-lg border text-sm font-semibold transition",
                    recordingState === "recording"
                      ? "border-red-300/40 bg-red-400/20 text-red-100"
                      : "border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
                  ].join(" ")}
                  aria-label={recordingState === "recording" ? "Stop recording" : "Start recording"}
                >
                  {recordingState === "recording" ? "Stop" : "Mic"}
                </button>
                <input
                  value={textInput}
                  onChange={(event) => setTextInput(event.target.value)}
                  placeholder="Type your doubt..."
                  className="min-h-12 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25"
                />
                <button
                  type="submit"
                  disabled={isSending || recordingState !== "idle" || !textInput.trim()}
                  className="rounded-lg bg-white px-5 text-sm font-semibold text-slate-950 disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </main>

          <VisualPanel
            assistantText={latestVisualAssistantText}
            isOpen={isVisualPanelOpen}
            onClose={() => setIsVisualPanelOpen(false)}
            visual={latestVisual}
          />
        </div>
      </section>
    </AuroraBackground>
  );
}
