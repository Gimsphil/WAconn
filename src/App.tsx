/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  initialChatMessages, 
  mockDiarizationStream, 
  initialSmartNotes, 
  initialSyncServices, 
  initialSyncLogItems 
} from "./mockData";
import { ChatMessage, AISmartNote, SyncService, SyncLogItem } from "./types";
import ChatTranslationModule from "./components/ChatTranslationModule";
import MeetingModule from "./components/MeetingModule";
import AINotesModule from "./components/AINotesModule";
import WorkspaceSyncModule from "./components/WorkspaceSyncModule";
import { MessageSquare, Mic2, FileText, RefreshCw, Briefcase } from "lucide-react";

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<"chat" | "meeting" | "notes" | "sync">("chat");

  // Shared Master States
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [smartNotes, setSmartNotes] = useState<AISmartNote[]>(initialSmartNotes);
  const [syncServices, setSyncServices] = useState<SyncService[]>(initialSyncServices);
  const [syncLogItems, setSyncLogItems] = useState<SyncLogItem[]>(initialSyncLogItems);

  // Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4000);
  };

  // Safe callback to add elements instantly onto Workspace logs
  const handleAddWorkspaceItem = (
    title: string,
    description: string,
    source: "Chat Translation" | "Meeting Copilot",
    type: "Calendar Event" | "Task Item" | "Document Archive"
  ) => {
    const formattedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newItem: SyncLogItem = {
      id: `log-c-${Date.now()}`,
      sourceModule: source,
      type,
      title,
      description,
      timestamp: formattedTime,
      status: "Pending",
    };
    setSyncLogItems([newItem, ...syncLogItems]);
    showNotification(`New ${type} staged: '${title}' added to Google Sync queue!`);
  };

  // Helper renderer
  const renderActiveModule = () => {
    switch (activeTab) {
      case "chat":
        return (
          <ChatTranslationModule
            messages={messages}
            onUpdateMessages={setMessages}
            onAddSyncItem={handleAddWorkspaceItem}
          />
        );
      case "meeting":
        return (
          <MeetingModule
            diarizationList={mockDiarizationStream}
            onAddSyncItem={handleAddWorkspaceItem}
          />
        );
      case "notes":
        return (
          <AINotesModule
            smartNotes={smartNotes}
            onUpdateSmartNotes={setSmartNotes}
          />
        );
      case "sync":
        return (
          <WorkspaceSyncModule
            syncServices={syncServices}
            syncLogItems={syncLogItems}
            onUpdateServices={setSyncServices}
            onUpdateLogItems={setSyncLogItems}
            toastMessage={toastMessage}
            onShowToast={showNotification}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Visual Top Navigation Header Layout */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-2xl text-white shadow-md shadow-indigo-600/10">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 font-sans flex items-center gap-1.5">
                myBIZcon
                <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-lg font-mono">
                  v1.2-Web
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">Personal AI Corporate Companion & Translator</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-semibold transition-all">
              Workspace Scope Client
            </span>
          </div>
        </div>
      </header>

      {/* Main Dynamic Panel Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-28">
        {renderActiveModule()}
      </main>

      {/* Modern Material 3 Bottom Navigation bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-lg border-t border-slate-100 py-3 px-4 z-40 shadow-xl shadow-slate-900/5">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {/* Module 1: Chat Translator */}
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === "chat"
                ? "text-indigo-600 font-semibold"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all mb-0.5 ${
              activeTab === "chat" ? "bg-indigo-50 text-indigo-600" : ""
            }`}>
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Chat Translate</span>
          </button>

          {/* Module 2: Call Copilot */}
          <button
            onClick={() => setActiveTab("meeting")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === "meeting"
                ? "text-violet-600 font-semibold"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all mb-0.5 ${
              activeTab === "meeting" ? "bg-violet-50 text-violet-600" : ""
            }`}>
              <Mic2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Call Copilot</span>
          </button>

          {/* Module 3: AI Smart Notes */}
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === "notes"
                ? "text-emerald-600 font-semibold"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all mb-0.5 ${
              activeTab === "notes" ? "bg-emerald-50 text-emerald-600" : ""
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">AI Note Mode</span>
          </button>

          {/* Module 4: Sync Dashboard */}
          <button
            onClick={() => setActiveTab("sync")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === "sync"
                ? "text-amber-600 font-semibold"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all mb-0.5 ${
              activeTab === "sync" ? "bg-amber-50 text-amber-600" : ""
            }`}>
              <RefreshCw className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Sync Hub</span>
          </button>
        </div>
      </nav>

      {/* Floating notifications for sync logs which are not Workspace specific */}
      {toastMessage && activeTab !== "sync" && (
        <div className="fixed bottom-24 right-6 bg-slate-900 text-white rounded-2xl p-4 shadow-xl z-50 flex items-center justify-between gap-3 animate-slide-up max-w-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <p className="text-[11px] leading-snug font-medium text-slate-200">
              {toastMessage}
            </p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white transition-all text-xs font-semibold"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}

