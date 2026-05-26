import { ChatMessage, DiarizationBlock, AISmartNote, SyncService, SyncLogItem } from "./types";

export const initialChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    channel: "KakaoTalk",
    sender: "Ryan Park (Team Lead)",
    timestamp: "10:42 AM",
    original: "기존 latency이슈 해결을 위해 composite index를 적용해봤는데 CPU사용량이 급감했습니다. 모니터링 결과 보시고 v2.4 UI 릴리즈 시점을 확정해 주세요.",
    translation: "I applied a composite index to resolve the existing latency issues, and CPU utilization has dropped dramatically. Please review the monitoring logs and finalize the v2.4 UI release timing.",
    selectedToner: null,
    activeOverlay: "both"
  },
  {
    id: "msg-2",
    channel: "Slack",
    sender: "Amanda Finch (Client Director)",
    timestamp: "10:15 AM",
    original: "The stakeholders are asking for our database security compliance protocols. Do we have a detailed bilingual document ready to share by tomorrow 10 AM KST?",
    translation: "임원진들이 데이터베이스 보안 컴플라이언스 프로토콜을 요청하고 있습니다. 내일 오전 10시(KST)까지 공유할 수 있는 상세한 이중 언어 문서가 준비되어 있나요?",
    selectedToner: null,
    activeOverlay: "both"
  },
  {
    id: "msg-3",
    channel: "Telegram",
    sender: "Sarah Jenkins (Senior Designer)",
    timestamp: "09:30 AM",
    original: "Material 3 bottom navigation schema is fully complete! I have saved all UI tokens on our Google Drive 'Design-System' folder. Let me know when sync is done.",
    translation: "머티리얼 3 하단 네비게이션 스키마가 완벽하게 완성되었습니다! 모든 UI 토큰 소스를 구글 드라이브 'Design-System' 폴더에 저장해 두었어요. 동기화되면 알려주세요.",
    selectedToner: null,
    activeOverlay: "original"
  },
  {
    id: "msg-4",
    channel: "WhatsApp",
    sender: "Choi (Family Member)",
    timestamp: "Yesterday",
    original: "주말 부모님 칠순 잔치 관련해서 예약할 한정식 식당 링크나 이름 좀 이따가 카톡으로 보내줘! 엄마가 메뉴 미리 보고 싶어 해.",
    translation: "For the parents' 70th birthday gathering this weekend, please send me the link or name of the Korean restaurant to book later! Mom wants to check the menu in advance.",
    selectedToner: null,
    activeOverlay: "both"
  }
];

export const mockDiarizationStream: DiarizationBlock[] = [
  {
    id: "d-1",
    speaker: "Speaker A",
    timestamp: "10:01 AM",
    text: "So we are seeing some server response latency starting around 9 PM every night because of massive multi-tenant database searches."
  },
  {
    id: "d-2",
    speaker: "User",
    timestamp: "10:02 AM",
    text: "That explains it. Should we add composite index support on 'tenant_id' and 'created_at' collections immediately?"
  },
  {
    id: "d-3",
    speaker: "Speaker B",
    timestamp: "10:03 AM",
    text: "Yes, exactly. I audited the slow query logs and adding that index should reduce searches to single-digit milliseconds."
  },
  {
    id: "d-4",
    speaker: "Speaker A",
    timestamp: "10:04 AM",
    text: "Outstanding. Let's schedule that deployment for June 15th at 6 PM. I'll add that event into our calendar sync pipeline."
  },
  {
    id: "d-5",
    speaker: "User",
    timestamp: "10:05 AM",
    text: "Agreed. I will keep track of this action item in Google Tasks and post a summary notes file directly to our Drive when meetings wrap up."
  }
];

export const initialSmartNotes: AISmartNote[] = [
  {
    id: "note-1",
    metadata: {
      title: "v2.4 Launch & Core Architecture Alignment",
      category: "Engineering Sync",
      tags: ["Launch", "Cloud Run", "Database Indexing"]
    },
    transcript: [
      { id: "tr-1", speaker: "Speaker A", timestamp: "00:15", text: "Welcome. Today we're aligning on the v2.4 launch of our app myBIZcon." },
      { id: "tr-2", speaker: "User", timestamp: "01:10", text: "I have the new Material 3 theme configurations uploaded to our workspace system." },
      { id: "tr-3", speaker: "Speaker B", timestamp: "01:42", text: "Excellent, we verified the composite database indices are fully prepared." },
      { id: "tr-4", speaker: "Speaker A", timestamp: "03:10", text: "Yes, we will schedule our deployment slot for June 15th so the operations team can verify performance." },
      { id: "tr-5", speaker: "User", timestamp: "04:55", text: "Sounds perfect. I'll document our final action tasks and archive the notes to our secure Workspace pipeline." }
    ],
    keywords: ["Launch Schedule", "Material 3", "Database Index", "Ecosystem Sync"],
    executiveSummary: "The engineering team validated database index preparations to solve prime latency issues. UI/UX successfully handed off final Material 3 design spec files. Staging environment rollout has been formally aligned for June 15th.",
    mindMapHierarchy: {
      title: "myBIZcon Release System",
      children: [
        {
          title: "Infrastructure & DB Specs",
          children: ["Deploy Composite Database Index", "Monitor latency metrics (Target < 20ms)"]
        },
        {
          title: "UI Design tokens",
          children: ["Material 3 Bottom Navigation Layout", "Implement micro-interaction state flows"]
        },
        {
          title: "Ecosystem Integration",
          children: ["Sync logs with Calendar Log Status", "Archive markdown output to drive"]
        }
      ]
    },
    timestamps: [
      { timeCode: "00:15", label: "Meeting introduction & purpose" },
      { timeCode: "01:10", label: "M3 UI Design tokens handoff" },
      { timeCode: "01:42", label: "Database Indexing Latency Review" },
      { timeCode: "03:10", label: "Staging deployment target confirmation" },
      { timeCode: "04:55", label: "Ecosystem Sync checklist approvals" }
    ],
    qaHistory: [
      {
        id: "qa-1",
        sender: "user",
        text: "When is the launch deployment scheduled?",
        timestamp: "10:18 AM"
      },
      {
        id: "qa-2",
        sender: "ai",
        text: "According to the transcript segment at [03:10], the deployment is scheduled for June 15th.",
        timestamp: "10:18 AM"
      }
    ]
  }
];

export const initialSyncServices: SyncService[] = [
  { id: "calendar", name: "Google Calendar", status: "Connected", lastSync: "10 minutes ago" },
  { id: "tasks", name: "Google Tasks", status: "Pending Approval", lastSync: "1 hour ago" },
  { id: "keep", name: "Google Keep", status: "Syncing", lastSync: "Just now" },
  { id: "drive", name: "Google Drive & Docs", status: "Connected", lastSync: "2 hours ago" }
];

export const initialSyncLogItems: SyncLogItem[] = [
  {
    id: "log-1",
    sourceModule: "Meeting Copilot",
    type: "Calendar Event",
    title: "Database Index Tuning Deployment Slot",
    description: "Scheduled index maintenance Slot on Google Calendar: June 15th, 6:00 PM KST.",
    timestamp: "10:35 AM",
    status: "Pending"
  },
  {
    id: "log-2",
    sourceModule: "Chat Translation",
    type: "Task Item",
    title: "Draft bilingual database security manual",
    description: "Prepare localized manual requested by Amanda Finch. Deadline tomorrow 10:00 AM.",
    timestamp: "10:16 AM",
    status: "Synced"
  },
  {
    id: "log-3",
    sourceModule: "Meeting Copilot",
    type: "Document Archive",
    title: "Engineering Sync Meeting Minutes",
    description: "Automatically format and push summarized minutes to Google Drive /MyBIZcon/Minutes.",
    timestamp: "10:08 AM",
    status: "Pending"
  }
];
