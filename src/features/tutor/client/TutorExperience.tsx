"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useChat,
  useConnectionState,
  useLocalParticipant,
  useVoiceAssistant
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { AuroraBackground } from "@/components/ui/aurora-background";

interface LiveKitSession {
  serverUrl: string;
  token: string;
  roomName: string;
  identity: string;
}

const ROOM_STORAGE_KEY = "vidya-livekit-room";

function formatAgentState(state: string, connected: boolean, micEnabled: boolean) {
  if (!connected) {
    return "connecting";
  }

  if (state === "connecting" || state === "initializing" || state === "pre-connect-buffering") {
    return "agent starting";
  }

  if (state === "failed") {
    return "agent unavailable";
  }

  if (state === "listening" && micEnabled) {
    return "listening";
  }

  if (state === "thinking") {
    return "thinking";
  }

  if (state === "speaking") {
    return "speaking";
  }

  if (!micEnabled) {
    return "mic muted";
  }

  return "ready";
}

function LiveVoiceSurface({ roomName, onLeave }: { roomName: string; onLeave: () => void }) {
  const connectionState = useConnectionState();
  const { localParticipant, isMicrophoneEnabled, lastMicrophoneError } = useLocalParticipant();
  const { state, agentTranscriptions } = useVoiceAssistant();
  const chatOptions = useMemo(() => ({ channelTopic: "vidya.text" }), []);
  const { chatMessages, send, isSending } = useChat(chatOptions);
  const [textInput, setTextInput] = useState("");
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const connected = connectionState === ConnectionState.Connected;
  const latestAgentText = useMemo(() => {
    const finalSegments = agentTranscriptions.filter((segment) => segment.final);
    const latest = finalSegments.at(-1) ?? agentTranscriptions.at(-1);
    return latest?.text?.trim();
  }, [agentTranscriptions]);
  const transcriptItems = useMemo(
    () =>
      agentTranscriptions
        .filter((segment) => segment.text?.trim())
        .slice(-8)
        .map((segment) => ({
          id: segment.id,
          text: segment.text.trim(),
          final: segment.final
        })),
    [agentTranscriptions]
  );
  const readableState = formatAgentState(state, connected, isMicrophoneEnabled);
  const agentReady = connected && !["connecting", "pre-connect-buffering", "failed"].includes(state);
  const canUseControls = connected && agentReady;

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ block: "end" });
  }, [transcriptItems.length, latestAgentText]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: "end" });
  }, [chatMessages.length]);

  async function toggleMic() {
    if (!canUseControls) {
      return;
    }

    await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  }

  async function sendTextMessage() {
    const message = textInput.trim();
    if (!message || isSending || !canUseControls) {
      return;
    }

    setTextInput("");
    await send(message);
  }

  return (
    <section className="relative z-10 flex h-svh min-h-0 w-full flex-col overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
      <header className="mx-auto flex w-full max-w-7xl shrink-0 items-center justify-between text-white/80">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-sm font-semibold">
            V
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Vidya AI</p>
            <p className="text-xs text-white/45">LiveKit realtime room</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLeave}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60"
        >
          Leave
        </button>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-5 overflow-y-auto py-4 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_420px] lg:overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex min-h-[520px] w-full flex-col items-center justify-center lg:min-h-0"
        >
          <div className="relative grid size-[260px] place-items-center sm:size-[340px]">
            <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute size-full rounded-full border border-white/10" />
            <div
              className={[
                "absolute size-[78%] rounded-full border transition",
                state === "listening" && isMicrophoneEnabled
                  ? "animate-[agent-pulse_1.4s_ease-in-out_infinite] border-emerald-300/35"
                  : state === "thinking"
                    ? "animate-[agent-pulse_1.9s_ease-in-out_infinite] border-blue-300/30"
                    : state === "speaking"
                      ? "animate-[agent-pulse_1.2s_ease-in-out_infinite] border-white/30"
                      : "border-white/10"
              ].join(" ")}
            />

            <button
              type="button"
              onClick={() => void toggleMic()}
              disabled={!canUseControls}
              className={[
                "relative grid size-[172px] place-items-center rounded-full border text-white shadow-[0_28px_90px_rgba(15,23,42,0.6)] transition sm:size-[220px]",
                isMicrophoneEnabled
                  ? "border-emerald-200/40 bg-emerald-500/20"
                  : "border-white/15 bg-white/[0.07] hover:bg-white/[0.1]"
              ].join(" ")}
              aria-label={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              <span className="absolute inset-4 rounded-full bg-white/[0.03]" />
              <span className="relative flex flex-col items-center gap-4">
                <span className="grid size-16 place-items-center rounded-full border border-white/15 bg-black/20 backdrop-blur-md">
                  <span className="h-8 w-5 rounded-full border-2 border-white/90 shadow-[0_12px_0_-8px_rgba(255,255,255,0.9)]" />
                </span>
                <span className="text-center text-lg font-semibold tracking-tight sm:text-xl">
                  {!agentReady ? "Starting..." : isMicrophoneEnabled ? "Mic on" : "Tap to talk"}
                </span>
              </span>
            </button>
          </div>

          <div className="mt-8 flex w-full max-w-3xl flex-col items-center rounded-[1.75rem] border border-white/10 bg-[#0b1018]/75 p-5 text-center text-white shadow-2xl backdrop-blur-2xl sm:p-7">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
              {readableState}
            </p>
            <p className="text-balance text-2xl font-medium leading-tight tracking-[-0.03em] text-white sm:text-3xl">
              {latestAgentText ?? "Vidya room mein aa rahi hai. Mic allow karo, phir normal tarah se baat karo."}
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/45">Room: {roomName}</p>

            {lastMicrophoneError ? (
              <div className="mt-4 rounded-2xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">
                Microphone error: {lastMicrophoneError.message}
              </div>
            ) : null}
          </div>
        </motion.div>

        <aside className="flex h-[min(700px,calc(100svh-7rem))] min-h-[520px] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b1018]/82 text-white shadow-2xl backdrop-blur-2xl lg:h-full lg:min-h-0">
          <div className="shrink-0 border-b border-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/35">Text and stream</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/55">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                <span className="block text-white/35">Room</span>
                <span className="block truncate">{roomName}</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                <span className="block text-white/35">Agent</span>
                <span className="block capitalize">{readableState}</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                <span className="block text-white/35">Mic</span>
                <span className="block">{isMicrophoneEnabled ? "on" : "off"}</span>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 [scrollbar-gutter:stable]">
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Streaming reply</p>
              <div className="space-y-2">
                {transcriptItems.length > 0 ? (
                  transcriptItems.map((item) => (
                    <div
                      key={item.id}
                      className={[
                        "rounded-2xl border px-3 py-2 text-sm leading-6",
                        item.final
                          ? "border-emerald-300/15 bg-emerald-300/[0.07] text-white/80"
                          : "border-white/10 bg-white/[0.04] text-white/55"
                      ].join(" ")}
                    >
                      {item.text}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white/45">
                    Waiting for Vidya transcript.
                  </div>
                )}
                <div ref={transcriptEndRef} />
              </div>
            </section>

            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Typed messages</p>
              <div className="space-y-2">
                {chatMessages.length > 0 ? (
                  chatMessages.slice(-30).map((message) => (
                    <div
                      key={`${message.timestamp}-${message.from?.identity ?? "local"}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm leading-6 text-white/70"
                    >
                      <span className="mb-1 block text-xs text-white/35">
                        {message.from?.isLocal ? "You" : message.from?.identity ?? "Participant"}
                      </span>
                      {message.message}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white/45">
                    No typed messages yet.
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </section>
          </div>

          <form
            className="shrink-0 border-t border-white/10 bg-[#0b1018]/95 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void sendTextMessage();
            }}
          >
            <div className="flex gap-2">
              <input
                value={textInput}
                onChange={(event) => setTextInput(event.target.value)}
                placeholder="Type a doubt..."
                className="min-h-11 min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25"
              />
              <button
                type="submit"
                disabled={!canUseControls || isSending || !textInput.trim()}
                className="rounded-2xl bg-white px-4 text-sm font-semibold text-slate-950 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </aside>
      </div>

      <footer className="mx-auto hidden w-full max-w-7xl shrink-0 py-1 text-center text-xs text-white/35 lg:block">
        Realtime audio is handled by LiveKit. Vidya adapts between buddy, coach, and tutor modes.
      </footer>
    </section>
  );
}

export function TutorExperience() {
  const [session, setSession] = useState<LiveKitSession | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preferredRoom, setPreferredRoom] = useState<string | null>(null);

  useEffect(() => {
    setPreferredRoom(window.localStorage.getItem(ROOM_STORAGE_KEY));
  }, []);

  async function startSession() {
    setIsStarting(true);
    setErrorMessage(null);

    try {
      const params = preferredRoom ? `?room=${encodeURIComponent(preferredRoom)}` : "";
      const response = await fetch(`/api/livekit/token${params}`, { cache: "no-store" });
      const data = (await response.json()) as LiveKitSession | { error: string };

      if (!response.ok || "error" in data) {
        setErrorMessage("error" in data ? data.error : "Could not start LiveKit session.");
        return;
      }

      window.localStorage.setItem(ROOM_STORAGE_KEY, data.roomName);
      setPreferredRoom(data.roomName);
      setSession(data);
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <AuroraBackground
      className="h-svh min-h-svh overflow-hidden bg-[#070a0f] text-slate-950 dark:bg-[#070a0f]"
      showRadialGradient={false}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(91,141,239,0.18),transparent_32%),linear-gradient(180deg,rgba(7,10,15,0.34),rgba(7,10,15,0.92)_70%)]" />

      {session ? (
        <LiveKitRoom
          serverUrl={session.serverUrl}
          token={session.token}
          connect
          audio={false}
          video={false}
          onError={(error) => setErrorMessage(error.message)}
          onDisconnected={() => setSession(null)}
          className="relative z-10 min-h-screen w-full"
        >
          <RoomAudioRenderer />
          <LiveVoiceSurface roomName={session.roomName} onLeave={() => setSession(null)} />
        </LiveKitRoom>
      ) : (
        <section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-5 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#0b1018]/75 p-7 shadow-2xl backdrop-blur-2xl"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Vidya AI Live</p>
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Talk naturally. Vidya adapts in realtime.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/55">
              This mode uses LiveKit rooms plus a backend Python agent worker. Chat casually, ask for study help, or
              switch into tutoring whenever you need it.
            </p>
            <button
              type="button"
              onClick={() => void startSession()}
              disabled={isStarting}
              className="mt-8 rounded-2xl bg-white px-6 py-3 font-semibold text-slate-950 shadow-lg disabled:opacity-60"
            >
              {isStarting ? "Starting..." : "Start live session"}
            </button>

            {errorMessage ? (
              <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-400/15 px-4 py-3 text-sm text-amber-100">
                {errorMessage}
              </div>
            ) : null}
          </motion.div>
        </section>
      )}
    </AuroraBackground>
  );
}
