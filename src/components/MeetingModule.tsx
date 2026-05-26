import React, { useState, useEffect, useRef } from "react";
import { DiarizationBlock } from "../types";
import { 
  Play, 
  Pause, 
  Square, 
  Mic2, 
  Volume2, 
  Layers, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  ClipboardCheck, 
  Check, 
  RefreshCw 
} from "lucide-react";

interface MeetingModuleProps {
  diarizationList: DiarizationBlock[];
  onAddSyncItem: (title: string, description: string, source: "Meeting Copilot", type: "Calendar Event" | "Task Item" | "Document Archive") => void;
}

export default function MeetingModule({
  diarizationList,
  onAddSyncItem
}: MeetingModuleProps) {
  // States
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [diarizationFeed, setDiarizationFeed] = useState<DiarizationBlock[]>(diarizationList);
  const [minutesMarkdown, setMinutesMarkdown] = useState<string>("");
  const [isGeneratingMins, setIsGeneratingMins] = useState(false);
  const [hasNewMinutes, setHasNewMinutes] = useState(false);

  // Audio waveform animation points
  const [waveHeights, setWaveHeights] = useState<number[]>([12, 24, 8, 40, 16, 28, 10, 32, 14, 20]);

  // Timers and references
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const waveRef = useRef<NodeJS.Timeout | null>(null);
  const diarizationTriggerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio wave rendering interval
  useEffect(() => {
    if (isRecording && !isPaused) {
      waveRef.current = setInterval(() => {
        setWaveHeights(prev => prev.map(() => Math.floor(Math.random() * 45) + 5));
      }, 150);
    } else {
      if (waveRef.current) clearInterval(waveRef.current);
    }
    return () => {
      if (waveRef.current) clearInterval(waveRef.current);
    };
  }, [isRecording, isPaused]);

  // Elapsed recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Handle Recording triggers
  const handleStartRecord = () => {
    setIsRecording(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    // Erase temporary drafts but load base stream
    setDiarizationFeed(diarizationList.slice(0, 2));

    // Simulate conversational appending over time to make it interactive!
    diarizationTriggerRef.current = setTimeout(() => {
      appendMockDiarization("Speaker A", "Additionally, let's coordinate index staging deployment slot. I think June 15th works perfectly for everyone.");
    }, 5000);

    const secondaryTrigger = setTimeout(() => {
      appendMockDiarization("Speaker B", "Agreed. I will confirm timing on standard calendar slots immediately.");
    }, 11000);

    return () => {
      clearTimeout(secondaryTrigger);
    };
  };

  const appendMockDiarization = (speaker: "User" | "Speaker A" | "Speaker B", text: string) => {
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const block: DiarizationBlock = {
      id: `live-d-${Date.now()}`,
      speaker,
      timestamp: formattedTime,
      text
    };
    setDiarizationFeed(prev => [...prev, block]);
  };

  const handlePauseRecord = () => {
    setIsPaused(!isPaused);
  };

  const handleStopRecord = async () => {
    if (diarizationTriggerRef.current) clearTimeout(diarizationTriggerRef.current);
    setIsRecording(false);
    setIsPaused(false);
    setIsGeneratingMins(true);

    // Call the server API endpoint to compile final meeting minutes!
    try {
      const response = await fetch("/api/meeting-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: diarizationFeed
        })
      });

      if (!response.ok) {
        throw new Error("Minutes generation failed");
      }

      const data = await response.json();
      setMinutesMarkdown(data.markdown);
      setHasNewMinutes(true);
    } catch (err) {
      console.error("Failed to generate meeting minutes:", err);
      // Fallback
      setMinutesMarkdown(`# Executive Summary (핵심 요약)
- Meeting successfully concluded with live speaker telemetry.
- Targeted solutions was proposed to deploy immediate indexes.

# Decisions Made (결정된 사항)
- Finalize composite index deployment before Friday.

# Auto-Extracted Action Items (조치 사항 및 할 일)
- **@User** - Sync latest diary with Drive and Tasks.`);
      setHasNewMinutes(true);
    } finally {
      setIsGeneratingMins(false);
    }
  };

  // Trigger Sync items inside dashboard log
  const handleSyncToWorkspace = (type: "Calendar Event" | "Task Item" | "Document Archive") => {
    if (type === "Calendar Event") {
      onAddSyncItem(
        "Database Index Tuning Deployment Slot",
        "Scheduled index maintenance Slot from Meeting Copilot: June 15th, 6:00 PM KST.",
        "Meeting Copilot",
        "Calendar Event"
      );
    } else if (type === "Task Item") {
      onAddSyncItem(
        "Implement server indexing queries",
        "Finalize composite indices with Dev A by Friday from meeting minutes.",
        "Meeting Copilot",
        "Task Item"
      );
    } else {
      onAddSyncItem(
        "Synced Meeting Minutes (회의록)",
        "Formatted markdown notes archived securely to drive.",
        "Meeting Copilot",
        "Document Archive"
      );
    }
  };

  // Seconds formatter helper
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper to parse double language Markdown into gorgeous custom UI Blocks
  const parseMarkdownSections = (markdownText: string) => {
    if (!markdownText) return { execSummary: "", decisions: [], actions: [] };

    const sections = markdownText.split(/(?=#\s+|##\s+)/);
    let execSummary = "No active executive summary compiled.";
    let decisions: string[] = [];
    let actions: string[] = [];

    sections.forEach(sec => {
      const trimmed = sec.trim();
      if (trimmed.toLowerCase().includes("executive") || trimmed.includes("핵심 요약")) {
        execSummary = trimmed.replace(/^(#|##).*\n/, "").trim();
      } else if (trimmed.toLowerCase().includes("decision") || trimmed.includes("결정된 사항")) {
        const lines = trimmed.split("\n").filter(l => l.trim().startsWith("-") || l.trim().startsWith("*"));
        decisions = lines.map(l => l.replace(/^[-*]\s+/, "").trim());
      } else if (trimmed.toLowerCase().includes("action") || trimmed.includes("조치 사항") || trimmed.includes("할 일")) {
        const lines = trimmed.split("\n").filter(l => l.trim().startsWith("-") || l.trim().startsWith("*"));
        actions = lines.map(l => l.replace(/^[-*]\s+/, "").trim());
      }
    });

    return { execSummary, decisions, actions };
  };

  const formattedMins = parseMarkdownSections(minutesMarkdown || (minutesMarkdown === "" ? "" : ""));

  return (
    <div className="space-y-6">
      {/* Module Cover Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-violet-50 p-2.5 rounded-2xl text-violet-600">
            <Mic2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Meeting Mode & Call Copilot</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Record physical or VoIP meetings, stream live diarized conversations, and synthesize Bilingual structured minutes securely.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout: Recorder Panel & Diarization Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1 Column: Recorder Station */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-sm tracking-wide">Recording Station</h3>
          
          {/* Main Visual Clock */}
          <div className="bg-slate-900 rounded-2xl p-6 text-center text-white space-y-4 shadow-inner relative overflow-hidden">
            <div className="absolute top-3 left-3 bg-slate-800/80 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-widest text-indigo-300">
              Recorder Core
            </div>

            <div className="pt-2">
              <span className="text-4xl font-mono tracking-widest font-semibold block">
                {formatTime(elapsedSeconds)}
              </span>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mt-1.5 flex items-center justify-center gap-1">
                {isRecording ? (
                  isPaused ? (
                    <span className="text-amber-400">Recording Paused</span>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                      <span className="text-rose-400">Capturing VoIP Feed</span>
                    </>
                  )
                ) : (
                  "Ready to record"
                )}
              </span>
            </div>

            {/* Audio Waveforms Simulation */}
            <div className="flex items-center justify-center gap-1.5 h-14 bg-slate-950/40 rounded-xl px-4">
              {waveHeights.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${isRecording && !isPaused ? h : 4}px` }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isRecording && !isPaused ? "bg-indigo-400" : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Interactive Button Panel */}
          <div className="space-y-3">
            <div className="flex gap-2.5">
              {/* START/RECORD BUTTON */}
              {!isRecording ? (
                <button
                  onClick={handleStartRecord}
                  className="flex-1 cursor-pointer bg-slate-900 text-white rounded-xl py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  Record Meeting
                </button>
              ) : (
                <>
                  {/* PAUSE BUTTON */}
                  <button
                    onClick={handlePauseRecord}
                    className="flex-1 cursor-pointer bg-slate-100 text-slate-800 border border-slate-200 rounded-xl py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                  >
                    <Pause className="w-3.5 h-3.5 text-amber-500" />
                    {isPaused ? "Resume" : "Pause"}
                  </button>

                  {/* STOP BUTTON */}
                  <button
                    onClick={handleStopRecord}
                    className="flex-1 cursor-pointer bg-rose-600 text-white rounded-xl py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-rose-700 transition-all shadow-sm"
                  >
                    <Square className="w-3.5 h-3.5 text-white fill-white" />
                    Stop & Craft
                  </button>
                </>
              )}
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-snug">
              Stop recording at any point to compile dual-language summarized Minutes utilizing standard Gemini 3.5-Flash processing.
            </p>
          </div>

          {/* Mic Ingestion indicators */}
          <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                Active VoIP Channel
              </span>
              <span className="font-semibold text-slate-700">Skype/Slack Link</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mic2 className="w-3.5 h-3.5 text-slate-400" />
                Microphone Ingest
              </span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Authorized
              </span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Diarization Section */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide">Live Speaker Diarization Stream</h3>
              <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full font-semibold">
                Multispeaker Aware
              </span>
            </div>

            {/* Conversational timeline diarization */}
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 flex-1">
              {diarizationFeed.map((segment) => {
                const isUser = segment.speaker === "User";
                const isSpeakerA = segment.speaker === "Speaker A";
                return (
                  <div 
                    key={segment.id}
                    className={`p-4 rounded-2xl border text-sm leading-relaxed transition-all ${
                      isUser 
                        ? "border-indigo-100 bg-indigo-50/20 mr-12" 
                        : isSpeakerA 
                        ? "border-emerald-100 bg-emerald-50/10 ml-8"
                        : "border-slate-100 bg-slate-50/50 ml-8"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[11px] font-bold ${
                        isUser ? "text-indigo-700" : isSpeakerA ? "text-emerald-700" : "text-amber-700"
                      }`}>
                        {segment.speaker} {isUser && "(You)"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{segment.timestamp}</span>
                    </div>
                    <p className="text-slate-800 font-sans">{segment.text}</p>
                  </div>
                );
              })}

              {isRecording && !isPaused && (
                <div className="p-4 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/10 mr-12 animate-pulse space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-indigo-200 rounded w-16"></div>
                    <div className="h-3 bg-indigo-100 rounded w-10"></div>
                  </div>
                  <div className="h-3.5 bg-indigo-200 rounded w-5/6"></div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Structured Minutes Bottom Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-500" />
            <span className="font-bold text-slate-800 text-base">Meeting Minutes (회의록)</span>
          </div>
          
          {isRecording ? (
            <span className="text-xs text-rose-500 font-medium animate-pulse">
              Minutes compiling live... Stop recorder to finalize document.
            </span>
          ) : isGeneratingMins ? (
            <span className="text-xs text-indigo-600 font-medium flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Gemini Synthesizing Minutes...
            </span>
          ) : hasNewMinutes ? (
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Draft Created
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              No minutes loaded. Complete a recording to trigger AI summary tags.
            </span>
          )}
        </div>

        {/* Minutes Presentation Grid */}
        {minutesMarkdown || hasNewMinutes ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Executive Summary Section */}
            <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-widest text-[#4f46e5] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Executive Summary
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed font-sans font-medium">
                {formattedMins.execSummary}
              </p>
            </div>

            {/* Decisions Made */}
            <div className="p-5 rounded-2xl bg-indigo-50/10 border border-indigo-100/50 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-widest text-indigo-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Decisions Made
              </h4>
              {formattedMins.decisions.length > 0 ? (
                <ul className="space-y-2">
                  {formattedMins.decisions.map((dec, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-1.5 leading-snug">
                      <span className="text-indigo-400 font-bold mt-1 inline-block shrink-0">•</span>
                      <span>{dec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">Processing decisions made...</p>
              )}
            </div>

            {/* Auto Extracted Actions */}
            <div className="p-5 rounded-2xl bg-violet-50/10 border border-violet-100/50 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-widest text-violet-700 flex items-center gap-1">
                <ClipboardCheck className="w-3.5 h-3.5" />
                Auto-Extracted Action Items
              </h4>
              <div className="space-y-3">
                {formattedMins.actions.length > 0 ? (
                  <ul className="space-y-2">
                    {formattedMins.actions.map((act, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-1.5 leading-snug">
                        <span className="text-violet-400 font-bold mt-1 inline-block shrink-0">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">Extracting task vectors...</p>
                )}

                {/* Workspace Synchronization Action Buttons */}
                <div className="border-t border-slate-100/80 pt-3.5 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSyncToWorkspace("Calendar Event")}
                    className="cursor-pointer text-[10px] bg-slate-950 text-white px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-all shadow-xs"
                  >
                    <Calendar className="w-3 h-3 text-indigo-300" />
                    Approve Sync Calendar
                  </button>
                  <button
                    onClick={() => handleSyncToWorkspace("Task Item")}
                    className="cursor-pointer text-[10px] bg-white border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-all shadow-xs"
                  >
                    <ClipboardCheck className="w-3 h-3 text-emerald-500" />
                    Add Tasks
                  </button>
                  <button
                    onClick={() => handleSyncToWorkspace("Document Archive")}
                    className="cursor-pointer text-[10px] bg-white border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-all shadow-xs"
                  >
                    <ChevronRight className="w-3" />
                    Archive Drive as Markdown
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="py-12 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">Recorded meeting minutes markdown will render here.</p>
            <p className="text-xs text-slate-400 mt-1">Activate the recording station to populate live blocks.</p>
          </div>
        )}
      </div>
    </div>
  );
}
