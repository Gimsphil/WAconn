import React, { useState } from "react";
import { ChatMessage } from "../types";
import { 
  MessageSquare, 
  Send, 
  Layers, 
  UserCheck, 
  Globe2, 
  Copy, 
  Check, 
  AlertCircle, 
  Users, 
  RotateCcw,
  PlusSquare
} from "lucide-react";

interface ChatTranslationModuleProps {
  messages: ChatMessage[];
  onUpdateMessages: (updated: ChatMessage[]) => void;
  onAddSyncItem: (title: string, description: string, source: "Chat Translation", type: "Calendar Event" | "Task Item" | "Document Archive") => void;
}

export default function ChatTranslationModule({
  messages,
  onUpdateMessages,
  onAddSyncItem
}: ChatTranslationModuleProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [newMessageChannel, setNewMessageChannel] = useState<"WhatsApp" | "KakaoTalk" | "Telegram" | "Slack">("Slack");
  const [newMessageSender, setNewMessageSender] = useState("");

  const handleToggleOverlay = (id: string, mode: "original" | "translation" | "both") => {
    const updated = messages.map(msg => {
      if (msg.id === id) {
        return { ...msg, activeOverlay: mode };
      }
      return msg;
    });
    onUpdateMessages(updated);
  };

  const handleTunePersona = async (id: string, persona: "BOSS" | "CLIENT" | "COWORKER" | "FAMILY") => {
    // Set loading state for this message
    const targetMsg = messages.find(m => m.id === id);
    if (!targetMsg) return;

    const withLoading = messages.map(msg => {
      if (msg.id === id) {
        return { ...msg, selectedToner: persona, generating: true };
      }
      return msg;
    });
    onUpdateMessages(withLoading);

    try {
      const response = await fetch("/api/generate-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: targetMsg.original,
          persona,
          channel: targetMsg.channel,
        }),
      });

      if (!response.ok) {
        throw new Error("Server response error");
      }

      const data = await response.json();
      
      const withReply = messages.map(msg => {
        if (msg.id === id) {
          return {
            ...msg,
            draftOriginal: data.draftOriginal,
            draftTranslated: data.draftTranslated,
            generating: false
          };
        }
        return msg;
      });
      onUpdateMessages(withReply);
    } catch (err: any) {
      console.error("Failed to generate AI response:", err);
      // Fallback response handled gracefully inside server.ts, but just in case of local network issue:
      const withError = messages.map(msg => {
        if (msg.id === id) {
          return {
            ...msg,
            generating: false,
            draftOriginal: "Error generating draft. Please verify server connection.",
            draftTranslated: "오류가 발생했습니다. 서버 연결을 확인해 주세요."
          };
        }
        return msg;
      });
      onUpdateMessages(withError);
    }
  };

  const handleCopyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePushToSync = (msg: ChatMessage) => {
    if (!msg.draftOriginal) return;
    const taskTitle = `Reply draft to ${msg.sender} (${msg.selectedToner})`;
    const taskDesc = `Auto-drafted and synchronized reply: "${msg.draftOriginal}"`;
    onAddSyncItem(taskTitle, taskDesc, "Chat Translation", "Task Item");
  };

  const handleAddNewMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !newMessageSender.trim()) return;

    const newMsg: ChatMessage = {
      id: `custom-msg-${Date.now()}`,
      channel: newMessageChannel,
      sender: newMessageSender,
      timestamp: "Just Now",
      original: newMessageText,
      translation: `[AI Autotranslated]: Summary of simulated message incoming regarding business alignment.`,
      selectedToner: null,
      activeOverlay: "both"
    };

    onUpdateMessages([newMsg, ...messages]);
    setNewMessageText("");
    setNewMessageSender("");
  };

  // Channel helper colors and branding
  const getChannelStyle = (channel: string) => {
    switch (channel) {
      case "KakaoTalk":
        return { bg: "bg-[#FEE500]/10", text: "text-[#3C1E1E]", border: "border-[#FEE500]", labelBg: "bg-[#FEE500] text-[#3C1E1E]" };
      case "Slack":
        return { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200", labelBg: "bg-[#4A154B] text-white" };
      case "Telegram":
        return { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200", labelBg: "bg-[#0088cc] text-white" };
      case "WhatsApp":
        return { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200", labelBg: "bg-[#25D366] text-white" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-800", border: "border-gray-200", labelBg: "bg-gray-500 text-white" };
    }
  };

  const personas = [
    { id: "BOSS", label: "BOSS (Formal)", color: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" },
    { id: "CLIENT", label: "CLIENT (Professional)", color: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" },
    { id: "COWORKER", label: "COWORKER (Casual)", color: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100" },
    { id: "FAMILY", label: "FAMILY (Warm)", color: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" }
  ];

  return (
    <div className="space-y-6">
      {/* Module Title Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2.5 rounded-2xl text-blue-600">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Chat Translator & Tone Tuner
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold animate-pulse">
                Live Active Feed
              </span>
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Simulates live message feeds from KakaoTalk, Telegram, WhatsApp, and Slack with dual translation and persona-based dynamic reply drafts.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout: Feed + Ingestion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Feed Messages */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-semibold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Intercepted Messaging Stream ({messages.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Simulating Active Hooks</span>
          </div>

          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
            {messages.map((msg) => {
              const cStyle = getChannelStyle(msg.channel);
              return (
                <div 
                  key={msg.id} 
                  id={msg.id}
                  className={`bg-white rounded-3xl border ${cStyle.border} shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md`}
                >
                  {/* Top bar with Channel Indicator */}
                  <div className="bg-slate-50/50 px-5 py-3 border-b border-inherit flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cStyle.labelBg}`}>
                        {msg.channel}
                      </span>
                      <span className="font-semibold text-slate-700 text-sm">{msg.sender}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    {/* Dual-Translation Overlays Switch */}
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-sm">
                      <button
                        onClick={() => handleToggleOverlay(msg.id, "original")}
                        className={`flex-1 text-xs py-1.5 rounded-xl font-medium transition-all ${
                          msg.activeOverlay === "original"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Original Only
                      </button>
                      <button
                        onClick={() => handleToggleOverlay(msg.id, "translation")}
                        className={`flex-1 text-xs py-1.5 rounded-xl font-medium transition-all ${
                          msg.activeOverlay === "translation"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Translation Only
                      </button>
                      <button
                        onClick={() => handleToggleOverlay(msg.id, "both")}
                        className={`flex-1 text-xs py-1.5 rounded-xl font-medium transition-all ${
                          msg.activeOverlay === "both"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Original + Translation
                      </button>
                    </div>

                    {/* Messages Body based on selected overlay tab */}
                    <div className="bg-slate-50/40 p-4 rounded-2xl border border-slate-100/50 space-y-2.5 text-sm leading-relaxed">
                      {(msg.activeOverlay === "original" || msg.activeOverlay === "both") && (
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Original</div>
                          <p className="text-slate-800 font-medium font-sans">{msg.original}</p>
                        </div>
                      )}
                      {msg.activeOverlay === "both" && <hr className="border-slate-100" />}
                      {(msg.activeOverlay === "translation" || msg.activeOverlay === "both") && (
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5 flex items-center gap-1">
                            <Globe2 className="w-3 h-3 text-blue-500" />
                            Twin-Translation
                          </div>
                          <p className="text-blue-900 italic font-sans">{msg.translation}</p>
                        </div>
                      )}
                    </div>

                    {/* Relationship Persona Tuner Buttons */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <UserCheck className="w-3 h-3" />
                        Relationship Persona Tuner
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {personas.map((per) => (
                          <button
                            key={per.id}
                            onClick={() => handleTunePersona(msg.id, per.id as any)}
                            className={`px-3 py-2 rounded-2xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                              msg.selectedToner === per.id
                                ? "ring-2 ring-indigo-500 ring-offset-1 font-bold " + per.color
                                : "hover:border-slate-300 text-slate-600 border-slate-200 bg-white"
                            }`}
                          >
                            {per.label.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic AI Reply Draft Result Panel */}
                    {msg.selectedToner && (
                      <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 rounded-3xl border border-indigo-100/60 mt-3 space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                            AI-Drafted Response ({msg.selectedToner})
                          </span>
                          
                          {msg.generating ? (
                            <span className="text-xs text-indigo-600 font-medium flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                              Gemini Synthesizing...
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              Ready to send
                            </span>
                          )}
                        </div>

                        {msg.generating ? (
                          <div className="py-6 space-y-2.5">
                            <div className="h-4 bg-slate-200 rounded-lg w-full animate-pulse"></div>
                            <div className="h-4 bg-slate-200 rounded-lg w-4/5 animate-pulse"></div>
                            <div className="h-4 bg-slate-200 rounded-lg w-2/3 animate-pulse"></div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 bg-white rounded-2xl border border-slate-100 space-y-2">
                              <div>
                                <div className="text-[9px] uppercase font-bold text-slate-400">Response</div>
                                <p className="text-xs text-slate-800 font-medium leading-relaxed">{msg.draftOriginal}</p>
                              </div>
                              <hr className="border-slate-50" />
                              <div>
                                <div className="text-[9px] uppercase font-bold text-slate-400">Translation Link</div>
                                <p className="text-xs text-slate-500 italic leading-relaxed">{msg.draftTranslated}</p>
                              </div>
                            </div>

                            {/* Utility actions for copy & dashboard sync integration */}
                            <div className="flex items-center justify-between gap-2.5 pt-1">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCopyToClipboard(msg.id, msg.draftOriginal || "")}
                                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                  title="Copy response to clipboard"
                                >
                                  {copiedId === msg.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      Copy
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handlePushToSync(msg)}
                                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                  title="Sync to Ecosystem Dashboard"
                                >
                                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                                  Send as Task
                                </button>
                              </div>

                              <button
                                onClick={() => handleTunePersona(msg.id, msg.selectedToner!)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
                                title="Regenerate Draft"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Inject Simulated Message or Active Dashboard Info */}
        <div className="space-y-6">
          
          {/* Form to inject new simulated message */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <PlusSquare className="w-4 h-4 text-indigo-500" />
              Simulate Message Trigger
            </h4>
            <form onSubmit={handleAddNewMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Sender Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CEO John, Jane Client"
                  value={newMessageSender}
                  onChange={(e) => setNewMessageSender(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Channel Source</label>
                  <select
                    value={newMessageChannel}
                    onChange={(e) => setNewMessageChannel(e.target.value as any)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  >
                    <option value="Slack">Slack 💻</option>
                    <option value="KakaoTalk">KakaoTalk 💬</option>
                    <option value="WhatsApp">WhatsApp 📞</option>
                    <option value="Telegram">Telegram ✈️</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <span className="text-[10px] text-slate-400 italic leading-snug pb-2">
                    Simulates active monitoring hooks.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Incoming Message Body</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type in Korean or English..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer bg-slate-900 text-white rounded-xl py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Inject Message into Feed
              </button>
            </form>
          </div>

          {/* Module Information Section */}
          <div className="bg-gradient-to-tr from-indigo-900 to-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-md">
            <h4 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-indigo-400" />
              Dynamic Dual-Translation Info
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              When messages arrive in diverse external business chats, <strong>myBIZcon</strong> captures them instantly. 
            </p>
            <div className="space-y-2 border-t border-slate-800/80 pt-3">
              <div className="flex items-start gap-2.5">
                <span className="bg-slate-800 text-[10px] py-0.5 px-2 rounded-md font-mono mt-0.5">Dual Mode</span>
                <p className="text-[10px] text-slate-400">Keeps original text and inline translation side-by-side to eliminate translation ambiguities.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="bg-slate-800 text-[10px] py-0.5 px-2 rounded-md font-mono mt-0.5">Tone Tuner</span>
                <p className="text-[10px] text-slate-400">Uses server-side Gemini 3.5-Flash to draft contextual responses aligned with social hierarchies.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
