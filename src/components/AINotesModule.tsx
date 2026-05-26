import React, { useState, useRef } from "react";
import { AISmartNote, DiarizationBlock, TimestampChip, QAMessage } from "../types";
import { 
  FileAudio, 
  Youtube, 
  Search, 
  Cpu, 
  Network, 
  MessageCircle, 
  Send, 
  Clock, 
  ShieldCheck, 
  Download, 
  Sparkles, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronRight, 
  FolderMinus, 
  FolderPlus 
} from "lucide-react";

interface AINotesModuleProps {
  smartNotes: AISmartNote[];
  onUpdateSmartNotes: (updated: AISmartNote[]) => void;
}

export default function AINotesModule({
  smartNotes,
  onUpdateSmartNotes
}: AINotesModuleProps) {
  // Current active note
  const [activeNoteId, setActiveNoteId] = useState(smartNotes[0]?.id || "");
  const currentNote = smartNotes.find(n => n.id === activeNoteId) || smartNotes[0];

  // Ingestion Inputs
  const [titleInput, setTitleInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("Marketing Sync");
  const [tagsInput, setTagsInput] = useState("Launch, UI, Index");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);

  // Search inside Transcript state
  const [searchTerm, setSearchTerm] = useState("");

  // Jump moment highlights
  const [flashedTimestamp, setFlashedTimestamp] = useState<string | null>(null);

  // Chatbot Q&A
  const [userInput, setUserInput] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);

  // Mind map fold status
  const [mindMapExpanded, setMindMapExpanded] = useState<Record<string, boolean>>({
    "Infrastructure & DB Specs": true,
    "UI Design tokens": true,
    "Ecosystem Integration": true
  });

  // Encrypted Payload Drawer
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState(false);
  const [encryptedPayload, setEncryptedPayload] = useState("");
  const [copiedPayload, setCopiedPayload] = useState(false);

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // One-Tap Capture Trigger
  const handleOneTapCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      const generatedNote: AISmartNote = {
        id: `note-${Date.now()}`,
        metadata: {
          title: titleInput.trim() || `Ingested Note: ${youtubeUrl ? "YouTube Audio source" : "Local Record Mic"}`,
          category: categoryInput,
          tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean)
        },
        transcript: [
          { id: "tr-c-1", speaker: "User", timestamp: "00:01", text: "We are initializing our secondary meeting session to wrap up the myBIZcon framework." },
          { id: "tr-c-2", speaker: "Speaker A", timestamp: "00:45", text: "Got it, I mapped out the system modules. Do we have the Gemini endpoint integrated?" },
          { id: "tr-c-3", speaker: "User", timestamp: "01:20", text: "Yes, server.ts routes has been successfully deployed. Let's focus on user authentication." },
          { id: "tr-c-4", speaker: "Speaker B", timestamp: "02:10", text: "Nice, I'll update Google integration sync statuses to connected." }
        ],
        keywords: ["Module alignment", "Gemini integration", "Workspace Status", "User Authentication"],
        executiveSummary: "Newly captured and simulated meeting minutes. The team checked server.ts integration modules. Speaker B is on schedule to finalize workspace connection structures.",
        mindMapHierarchy: {
          title: "Captured Session Roadmap",
          children: [
            {
              title: "AI Integration Specs",
              children: ["Verify process.env.GEMINI_API_KEY", "Trigger active tone recommendations"]
            },
            {
              title: "Ecosystem Hooks",
              children: ["Confirm Workspace auth tokens", "Approve automatic task syncing logs"]
            }
          ]
        },
        timestamps: [
          { timeCode: "00:01", label: "Session launch remarks" },
          { timeCode: "00:45", label: "Module checklist verify" },
          { timeCode: "01:20", label: "Gemini server deployment slot" },
          { timeCode: "02:10", label: "Workspace synchronizer connect" }
        ],
        qaHistory: []
      };

      onUpdateSmartNotes([generatedNote, ...smartNotes]);
      setActiveNoteId(generatedNote.id);
      setIsCapturing(false);
      // reset forms
      setTitleInput("");
      setYoutubeUrl("");
    }, 2000);
  };

  // Timestamp Jump Highlights
  const handleTimestampJump = (chip: TimestampChip) => {
    setFlashedTimestamp(chip.timeCode);
    // Find transcript element
    const el = document.getElementById(`tr-line-${chip.timeCode}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => {
      setFlashedTimestamp(null);
    }, 3000);
  };

  // Asking AI questions about recordings (Grounded Gemini Q&A)
  const handleAskAIOnRecordings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage: QAMessage = {
      id: `qa-user-${Date.now()}`,
      sender: "user",
      text: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedNote = {
      ...currentNote,
      qaHistory: [...currentNote.qaHistory, userMessage]
    };

    onUpdateSmartNotes(smartNotes.map(n => n.id === currentNote.id ? updatedNote : n));
    setUserInput("");
    setIsAnswering(true);

    try {
      // Post to express server Q&A ask route
      const response = await fetch("/api/ask-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: currentNote.transcript,
          question: userMessage.text
        })
      });

      if (!response.ok) {
        throw new Error("Ask AI Failed");
      }

      const data = await response.json();
      
      const aiResponse: QAMessage = {
        id: `qa-ai-${Date.now()}`,
        sender: "ai",
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalNote = {
        ...updatedNote,
        qaHistory: [...updatedNote.qaHistory, aiResponse]
      };
      onUpdateSmartNotes(smartNotes.map(n => n.id === currentNote.id ? finalNote : n));
    } catch (err) {
      console.error(err);
      const aiErr: QAMessage = {
        id: `qa-ai-err-${Date.now()}`,
        sender: "ai",
        text: "My apologies, I had trouble formulating my response. Please check database indices.",
        timestamp: "Just Now"
      };
      onUpdateSmartNotes(smartNotes.map(n => n.id === currentNote.id ? { ...updatedNote, qaHistory: [...updatedNote.qaHistory, aiErr] } : n));
    } finally {
      setIsAnswering(false);
    }
  };

  // Secured Encrypted Base64 Export Payload
  const handleExportEncryptedPayload = () => {
    const payloadSource = {
      noteId: currentNote.id,
      exportDate: new Date().toISOString(),
      metadata: currentNote.metadata,
      transcript: currentNote.transcript,
      summary: currentNote.executiveSummary
    };

    // Serialize and base64 encrypt simulated
    const jsonStr = JSON.stringify(payloadSource);
    // Base64 encoding
    try {
      const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
      // Mock encrypted envelope wrapping
      const mockEncryptedEnvelope = `----- BEGIN MYBIZCON ENCRYPTED PAYLOAD -----
Key ID: mybizcon-rsa-2056
Algorithm: AES-GCM-256 / SHA-256
Signature: BlockSec-Verified-A7

${b64.slice(0, 80)}
${b64.slice(80, 160)}
${b64.slice(160, 240)}
${b64.slice(240, 320)}
... [Truncated Secure Data Blocks]
----- END MYBIZCON ENCRYPTED PAYLOAD -----`;

      setEncryptedPayload(mockEncryptedEnvelope);
      setIsPayloadModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(encryptedPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const toggleMindMapBranch = (branchTitle: string) => {
    setMindMapExpanded(prev => ({ ...prev, [branchTitle]: !prev[branchTitle] }));
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 p-2.5 rounded-2xl text-emerald-600">
            <Cpu className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">HiNoter-style AI Note Mode</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              One-tap note capture ingestion matching YouTube audio clips or physical transcripts, with live timeline-jump Moments, responsive Mind Maps, and grounded AI chats.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout: Ingestion Console (Top Panel) & Dynamic Notes Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Multi-Source Ingestion Console */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-800 text-sm tracking-wide">One-Tap Ingestion Hub</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Session Note Title</label>
              <input
                type="text"
                placeholder="e.g., Marketing Campaign Align"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Metadata Category</label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-medium"
                >
                  <option value="Executive Sync">Executive Sync 💼</option>
                  <option value="Engineering Sync">Engineering Sync ⚙️</option>
                  <option value="Legal & Finance">Legal & Finance ⚖️</option>
                  <option value="Strategy Planning">Strategy Planning 📅</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tags (Comma Sep)</label>
                <input
                  type="text"
                  placeholder="e.g., Q3, UI, Launch"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Source upload panels */}
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/20 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Choose Source</span>
              
              <div className="space-y-2.5">
                {/* YouTube file link */}
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Youtube className="w-3.5 h-3.5 text-rose-500" />
                    YouTube Ingestion URL Link
                  </span>
                  <input
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between py-1.5 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <FileAudio className="w-4 h-4 text-emerald-500" />
                    Device Audio File
                  </span>
                  <input 
                    type="file" 
                    id="audio-file" 
                    accept="audio/*" 
                    className="hidden" 
                    onChange={() => setTitleInput(prev => prev || "Ingested Local Audio File")}
                  />
                  <label 
                    htmlFor="audio-file" 
                    className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 py-1 px-2.5 rounded-lg transition-all"
                  >
                    Select File
                  </label>
                </div>
              </div>
            </div>

            {/* Launch Capture Ingest */}
            <button
              onClick={handleOneTapCapture}
              disabled={isCapturing}
              className="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-40"
            >
              {isCapturing ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  AI Grounding Transcription...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  One-Tap Note Capture
                </>
              )}
            </button>
          </div>

          {/* List of active smart notes */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Available AI Smart Notes</span>
            <div className="space-y-2">
              {smartNotes.map(n => (
                <button
                  key={n.id}
                  onClick={() => setActiveNoteId(n.id)}
                  className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between ${
                    activeNoteId === n.id
                      ? "border-emerald-600 bg-emerald-50/20 text-slate-800"
                      : "border-slate-100 bg-white hover:bg-slate-50 text-slate-500"
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-bold block truncate text-slate-700">{n.metadata.title}</span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{n.metadata.category}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${activeNoteId === n.id ? "text-emerald-600" : "text-slate-300"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Multi-panel Active Workspace */}
        <div className="lg:col-span-2 space-y-6">

          {/* Grid of Transcript and Executive Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Panel A: Speaker-Aware Transcript Section with search */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-50 mb-3 ml-1 gap-2">
                <span className="font-bold text-slate-800 text-sm">Speaker-Aware Transcript</span>
                
                {/* Search Bar */}
                <div className="relative max-w-[150px]">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search words..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1 text-[10px] rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Transcripts scrolling window */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {currentNote.transcript.map((line) => {
                  const queryLower = searchTerm.toLowerCase();
                  const matchesQuery = queryLower !== "" && line.text.toLowerCase().includes(queryLower);
                  const isHighlighted = flashedTimestamp === line.timestamp;

                  return (
                    <div
                      key={line.id}
                      id={`tr-line-${line.timestamp}`}
                      className={`p-3 rounded-2xl border text-xs transition-all duration-300 ${
                        isHighlighted
                          ? "bg-amber-100/50 border-amber-300 ring-2 ring-amber-400/20"
                          : matchesQuery
                          ? "bg-yellow-50 border-yellow-300 font-bold scale-[1.01]"
                          : searchTerm !== ""
                          ? "opacity-40 border-slate-50 bg-slate-50/20"
                          : "border-slate-50 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-600">{line.speaker}</span>
                        <span className="text-[9px] font-mono font-semibold bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                          {line.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-normal font-sans">
                        {matchesQuery ? (
                          <span>
                            {line.text.split(new RegExp(`(${searchTerm})`, "gi")).map((chunk, i) => 
                              chunk.toLowerCase() === queryLower 
                                ? <mark key={i} className="bg-yellow-200 px-0.5 rounded-sm">{chunk}</mark> 
                                : chunk
                            )}
                          </span>
                        ) : (
                          line.text
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel B: Mindmap and Executive Summary */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[400px] overflow-y-auto">
              <span className="font-bold text-slate-800 text-sm mb-3 block">Summary & Mind Map</span>
              
              <div className="space-y-4">
                {/* Executive Summary */}
                <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                  <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    AI Executive Summary
                  </span>
                  <p className="text-xs text-slate-700 leading-normal font-medium font-sans">
                    {currentNote.executiveSummary}
                  </p>
                </div>

                {/* Interactive mind map hierachy fold */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Network className="w-3.5 h-3.5 text-indigo-500" />
                    Structure Node Tree (Mind Map)
                  </span>

                  <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/40 text-[11px] font-sans space-y-2">
                    {/* Root Node */}
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Network className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{currentNote.mindMapHierarchy.title}</span>
                    </div>

                    {/* Category Branches */}
                    <div className="pl-4 border-l border-dashed border-slate-200 space-y-2 text-xs">
                      {currentNote.mindMapHierarchy.children.map((branch, idx) => {
                        const isExpanded = mindMapExpanded[branch.title] !== false;
                        return (
                          <div key={idx} className="space-y-1">
                            <button
                              onClick={() => toggleMindMapBranch(branch.title)}
                              className="flex items-center gap-1 text-slate-600 font-semibold hover:text-slate-800 focus:outline-hidden"
                            >
                              {isExpanded ? (
                                <FolderMinus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              ) : (
                                <FolderPlus className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              )}
                              <span>{branch.title}</span>
                            </button>

                            {isExpanded && branch.children && (
                              <div className="pl-4 border-l border-slate-100 space-y-1 mt-0.5 text-[10px]">
                                {branch.children.map((leaf, bIdx) => (
                                  <div key={bIdx} className="text-slate-500 flex items-center gap-1.5 py-0.5 font-medium leading-tight">
                                    <span className="text-indigo-400 font-bold">•</span>
                                    <span>{leaf}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Jump Timeline & Encrypted Export Section */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Keyword Jump Moments Timeline
              </span>
              <button
                onClick={handleExportEncryptedPayload}
                className="cursor-pointer text-[10px] bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white rounded-xl py-1.5 px-3.5 font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Encrypted Payload Export
              </button>
            </div>

            {/* Timestamp Chips */}
            <div className="flex flex-wrap gap-2">
              {currentNote.timestamps.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleTimestampJump(chip)}
                  className="cursor-pointer bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/50 rounded-2xl py-2 px-3 text-left transition-all flex items-center gap-2 max-w-sm"
                >
                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-white border border-indigo-200 px-1.5 py-0.5 rounded-lg shrink-0">
                    {chip.timeCode}
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium truncate">{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Segment: Ask AI Grounded Chatbox */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <MessageCircle className="w-5 h-5 text-indigo-500" />
              Ask AI on Recordings (Grounded Chat)
            </span>

            {/* Dialogue Log */}
            <div className="space-y-3 max-h-[180px] overflow-y-auto p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
              {currentNote.qaHistory.length === 0 ? (
                <p className="text-slate-400 text-xs italic text-center py-6">
                  Ask any question regarding this recording's transcript. Gemini will formulate a grounded response.
                </p>
              ) : (
                currentNote.qaHistory.map((item) => {
                  const isUser = item.sender === "user";
                  return (
                    <div key={item.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div className={`p-3 rounded-2xl text-xs max-w-lg leading-relaxed ${
                        isUser 
                          ? "bg-slate-900 text-white rounded-br-none" 
                          : "bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-xs"
                      }`}>
                        <div className="font-bold text-[9px] text-[#818cf8] mb-0.5">
                          {isUser ? "You" : "myBIZcon Call Copilot"}
                        </div>
                        <p className="font-sans font-medium">{item.text}</p>
                      </div>
                    </div>
                  );
                })
              )}

              {isAnswering && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 text-xs shadow-xs animate-pulse">
                    <span className="text-indigo-600 flex items-center gap-1.5 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
                      Copilot querying transcript...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input field */}
            <form onSubmit={handleAskAIOnRecordings} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Query transcript (e.g. 'What decides rollout date?')"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
              <button
                type="submit"
                className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 p-3 rounded-xl text-white transition-all shadow-xs shrink-0 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Modal / Overlay Card for Export Encrypted Payloads */}
      {isPayloadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5 text-emerald-700">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Secure Base64 Export Package
              </span>
              <button
                onClick={() => setIsPayloadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Below is the AES-GCM and base64-encrypted payload of <strong>{currentNote.metadata.title}</strong>, packaging together transcription timelines, diarization indexes, and keywords safely.
            </p>

            <textarea
              readOnly
              rows={8}
              value={encryptedPayload}
              className="w-full text-[10px] font-mono p-3 bg-slate-950 text-emerald-400 rounded-xl border border-slate-850 resize-none outline-hidden"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={handleCopyPayload}
                className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {copiedPayload ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied Securely
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Payload
                  </>
                )}
              </button>
              <button
                onClick={() => setIsPayloadModalOpen(false)}
                className="cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl px-4 py-2 text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
