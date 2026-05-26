import React, { useState } from "react";
import { SyncService, SyncLogItem } from "../types";
import { 
  Calendar, 
  CheckSquare, 
  StickyNote, 
  HardDrive, 
  Check, 
  RotateCw, 
  X, 
  AlertCircle, 
  Users, 
  ExternalLink 
} from "lucide-react";

interface WorkspaceSyncModuleProps {
  syncServices: SyncService[];
  syncLogItems: SyncLogItem[];
  onUpdateServices: (updated: SyncService[]) => void;
  onUpdateLogItems: (updated: SyncLogItem[]) => void;
  toastMessage: string | null;
  onShowToast: (message: string) => void;
}

export default function WorkspaceSyncModule({
  syncServices,
  syncLogItems,
  onUpdateServices,
  onUpdateLogItems,
  toastMessage,
  onShowToast
}: WorkspaceSyncModuleProps) {
  const [activeTab, setActiveTab] = useState<"services" | "logs">("logs");

  // Format Helper Colors for badges
  const getBadgeStyle = (status: "Connected" | "Syncing" | "Pending Approval") => {
    switch (status) {
      case "Connected":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Syncing":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse";
      case "Pending Approval":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getServiceIcon = (id: string) => {
    switch (id) {
      case "calendar":
        return <Calendar className="w-5 h-5 text-indigo-500" />;
      case "tasks":
        return <CheckSquare className="w-5 h-5 text-emerald-500" />;
      case "keep":
        return <StickyNote className="w-5 h-5 text-amber-500" />;
      case "drive":
        return <HardDrive className="w-5 h-5 text-blue-500" />;
      default:
        return <HardDrive className="w-5 h-5 text-slate-500" />;
    }
  };

  // Actions
  const handleApproveSync = (itemId: string, type: "Calendar" | "Tasks" | "Drive") => {
    const matchedItem = syncLogItems.find(item => item.id === itemId);
    if (!matchedItem) return;

    // Transition status to Synced
    const updatedLogs = syncLogItems.map(item => {
      if (item.id === itemId) {
        return { ...item, status: "Synced" as const };
      }
      return item;
    });
    onUpdateLogItems(updatedLogs);

    // Dynamic toast messages based on selection
    onShowToast(`Google ${type}: '${matchedItem.title}' successfully synchronized!`);

    // Let's also transition the corresponding syncService state to 'Syncing' briefly to simulate real-time API integrations!
    const serviceMap: Record<string, string> = {
      "Calendar": "calendar",
      "Tasks": "tasks",
      "Drive": "drive"
    };
    const targetServiceId = serviceMap[type];
    if (targetServiceId) {
      const updatedServices = syncServices.map(service => {
        if (service.id === targetServiceId) {
          return { ...service, status: "Connected" as const, lastSync: "Just now" };
        }
        return service;
      });
      onUpdateServices(updatedServices);
    }
  };

  const handleToggleState = (serviceId: string) => {
    const updated = syncServices.map(service => {
      if (service.id === serviceId) {
        let nextStatus: "Connected" | "Syncing" | "Pending Approval" = "Connected";
        if (service.status === "Connected") nextStatus = "Pending Approval";
        else if (service.status === "Pending Approval") nextStatus = "Syncing";
        
        onShowToast(`${service.name} auth state toggled to '${nextStatus}'`);
        return { ...service, status: nextStatus, lastSync: "Just now" };
      }
      return service;
    });
    onUpdateServices(updated);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-2.5 rounded-2xl text-amber-600">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Google Workspace Ecosystem Hub</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Control OAuth channels, audit auto-extracted task logs compiled from your live chat feeds and meetings, and trigger high-fidelity synchronization logs.
              </p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab("logs")}
              className={`text-xs py-1.5 px-4 rounded-xl font-medium transition-all ${
                activeTab === "logs"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sync Audit Logs
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`text-xs py-1.5 px-4 rounded-xl font-medium transition-all ${
                activeTab === "services"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Auth Operations
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Layout Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Direct auth status badges card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-50 mb-1">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide">Ecosystem Auth Statuses</h3>
            <span className="text-[10px] text-indigo-600 font-mono">OAuth 2.0 Client Connected</span>
          </div>

          <div className="space-y-3">
            {syncServices.map((service) => (
              <div 
                key={service.id}
                className="p-4 rounded-2xl border border-slate-50 bg-slate-50/20 hover:bg-slate-50/50 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
                    {getServiceIcon(service.id)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 text-xs block">{service.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Last synced: {service.lastSync}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(service.status)}`}>
                    {service.status}
                  </span>
                  
                  <button
                    onClick={() => handleToggleState(service.id)}
                    className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 transition-all"
                  >
                    Set State
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Secure pipeline security indicator */}
          <div className="border-t border-slate-100 pt-4 text-xs space-y-2 text-slate-500">
            <div className="flex items-center gap-1 text-emerald-600 font-semibold mb-1">
              <Check className="w-4 h-4" />
              Bilateral Security Protocols Enabled
            </div>
            <p className="text-[10px] leading-relaxed">
              Google Workspace scopes have been configured server-side. Local AES payload exports safeguard sensitive telemetry from unauthorized disclosure.
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Audit Sync log layout or authorization panels */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "logs" ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <h3 className="font-bold text-slate-800 text-sm tracking-wide">Sync Audit log Queue</h3>
                <span className="text-xs text-slate-400 font-medium">Derived from Chat Monitor & Meeting transcription channels</span>
              </div>

              {/* Log items feed */}
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {syncLogItems.map((item) => {
                  const isPending = item.status === "Pending";
                  const isCalendar = item.type === "Calendar Event";
                  const isTask = item.type === "Task Item";

                  return (
                    <div 
                      key={item.id}
                      className={`p-4 rounded-3xl border transition-all ${
                        isPending 
                          ? "border-slate-100 bg-white shadow-xs" 
                          : "border-indigo-50 bg-indigo-50/10 opacity-75"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="space-y-1">
                          {/* Channel/Event Badge tags */}
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-[#6366f1] bg-indigo-50 border border-indigo-100 rounded-md px-1.5 py-0.5">
                              {item.sourceModule}
                            </span>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5">
                              {item.type}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-800 text-xs mt-1.5 font-sans leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-medium">
                            {item.description}
                          </p>
                        </div>

                        {/* Status Check badge */}
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[10px] font-mono text-slate-400 font-medium">{item.timestamp}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPending 
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons if status is Pending */}
                      {isPending && (
                        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap gap-2">
                          {isCalendar && (
                            <button
                              onClick={() => handleApproveSync(item.id, "Calendar")}
                              className="cursor-pointer text-[10px] bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white rounded-xl py-1.5 px-3 font-bold flex items-center gap-1.5 transition-all shadow-xs"
                            >
                              <Calendar className="w-3 h-3 text-indigo-300" />
                              Approve Sync to Calendar
                            </button>
                          )}
                          {isTask && (
                            <button
                              onClick={() => handleApproveSync(item.id, "Tasks")}
                              className="cursor-pointer text-[10px] bg-indigo-600 border border-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-1.5 px-3 font-bold flex items-center gap-1.5 transition-all shadow-xs"
                            >
                              <CheckSquare className="w-3 h-3 text-emerald-300" />
                              Add to Tasks
                            </button>
                          )}
                          {!isCalendar && !isTask && (
                            <button
                              onClick={() => handleApproveSync(item.id, "Drive")}
                              className="cursor-pointer text-[10px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl py-1.5 px-3 font-bold flex items-center gap-1.5 transition-all shadow-xs"
                            >
                              <HardDrive className="w-3 h-3 text-blue-500" />
                              Archive to Drive as Markdown
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <h3 className="font-bold text-slate-800 text-sm tracking-wide">Developer Connection Actions</h3>
                <span className="text-xs text-slate-400 font-medium">Bypass OAuth screen directly</span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Connect your workspace directly inside the AI Studio Developer flow by triggering mock authorization parameters. Clicking these links enables immediate sync telemetry pipelines.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="border border-indigo-100 bg-indigo-50/10 p-5 rounded-2xl relative space-y-3">
                  <span className="text-indigo-800 text-xs font-bold block flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Standard OAuth Flow
                  </span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Fulfill enterprise guidelines by requesting safe consent boxes on a fresh browser tab.
                  </p>
                  <button 
                    onClick={() => onShowToast("Standard OAuth 2.0 flow initiated...")}
                    className="text-[11px] font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                  >
                    Open Authorization Link
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="border border-slate-100 bg-slate-50/30 p-5 rounded-2xl relative space-y-3">
                  <span className="text-slate-700 text-xs font-bold block flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-slate-500" />
                    Bypass Authentication
                  </span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Instantly approve calendar, keep, task registries and database channels with a secure dev credentials bypass token.
                  </p>
                  <button 
                    onClick={() => {
                      const updated = syncServices.map(s => ({ ...s, status: "Connected" as const }));
                      onUpdateServices(updated);
                      onShowToast("Credentials Bypassed: All Google services linked successfully!");
                    }}
                    className="text-[11px] font-bold text-slate-700 hover:underline"
                  >
                    Trigger Master Connect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Slide-in/fade feedback visual toasts */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white rounded-2xl px-5 py-4 shadow-2xl z-50 flex items-center justify-between gap-4 animate-slide-up max-w-sm">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block text-white">Ecosystem Synced Successfully</span>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">{toastMessage}</p>
            </div>
          </div>
          <button
            onClick={() => onShowToast("")}
            className="text-slate-400 hover:text-white transition-all text-xs"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
