import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini client lazily to avoid immediate crash if env missing
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (ai) return ai;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    return ai;
  } catch (error) {
    console.error("Failed to initialize Gemini client:", error);
    return null;
  }
}

// 1. Dual-Translation and Tone Tuner API
app.post("/api/generate-reply", async (req: express.Request, res: express.Response) => {
  const { message, persona, channel } = req.body;
  if (!message || !persona) {
    return res.status(400).json({ error: "Missing message or persona parameter" });
  }

  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `You are a high-performance business assistant called "myBIZcon". 
A message was received on ${channel || "a workspace chat"}:
"${message}"

Draft an appropriate, direct reply tailored specifically to a "${persona}" relationship. 
Rules:
1. "BOSS (Formal)" should be highly polite, respectful, and structured (typically in polite Korean or professional English depending on message language).
2. "CLIENT (Professional)" should be consultative, extremely polite, clear, and action-oriented.
3. "COWORKER (Casual)" should be friendly, clear, straightforward, and collaborative.
4. "FAMILY" should be warm, caring, casual, and brief.

Return a JSON payload with exactly two fields matching the structure:
{
  "draftOriginal": "The drafted response in the primary language of the conversation (Korean or English as appropriate)",
  "draftTranslated": "The high-fidelity dual-translation of that response (in English if original is Korean, and in Korean if original is English. If message is other language, translate to Korean)"
}
Output only the raw JSON. No markdown brackets or wrapping.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "";
      const cleaned = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return res.json({
        draftOriginal: parsed.draftOriginal,
        draftTranslated: parsed.draftTranslated,
        mode: "api",
      });
    } catch (err: any) {
      console.warn("Gemini reply generation failed, falling back to mock rules:", err.message);
    }
  }

  // Heuristic Simulation Fallback
  let draftOriginal = "";
  let draftTranslated = "";

  const isKorean = /[\uac00-\ud7af]/g.test(message);

  if (persona === "BOSS") {
    draftOriginal = isKorean
      ? "네, 알겠습니다. 지시하신 사항 확인했으며, 정리하여 오늘 퇴근 전까지 보고드리겠습니다. 감사합니다."
      : "Understood, project updates/tasks are clear. I've noted down your instructions and will follow up with a detailed execution report shortly. Thank you.";
    draftTranslated = isKorean
      ? "Yes, I understand. I have verified the instructed item and will organize it to report before leaving the office today. Thank you."
      : "네, 이해했습니다. 프로젝트 업데이트와 사안들이 명확합니다. 지시사항을 기록하였으며, 곧 실행 계획을 정리하여 보고해 드리겠습니다. 감사합니다.";
  } else if (persona === "CLIENT") {
    draftOriginal = isKorean
      ? "보내주신 의견 감사드립니다. 요청하신 일정과 수정 사안들을 최대한 반영하여 만족하실 수 있는 결과로 보답하겠습니다."
      : "Thank you for sharing your valuable feedback. We will do our absolute best to accommodate your timelines and modification requested. We look forward to delivering our best.";
    draftTranslated = isKorean
      ? "Thank you for your valuable feedback. We will reflect your requested schedule and revisions as much as possible to deliver satisfactory results."
      : "소중한 피드백을 전달해 주셔서 대단히 감사드립니다. 요청하신 마감 일정과 수정 사항을 적극 반영하여 최상의 결과물로 전달해 드리겠습니다.";
  } else if (persona === "COWORKER") {
    draftOriginal = isKorean
      ? "아, 확인했어요! 이 부분 제가 피드백 정리해서 메신저나 이메일로 빠르게 넘겨 드릴게요. 수고하셨어요!"
      : "Got it! I will review this part and share my notes via Slack layout shortly. Keep up the great work!";
    draftTranslated = isKorean
      ? "I just checked this! I'll quickly compile feedback on this and forward it to you via messenger or email soon. Great work!"
      : "네, 확인했어요! 관련 부분 검토한 후 슬랙 편으로 의견 공유할게요. 수고 많으셨어요!";
  } else {
    // FAMILY
    draftOriginal = isKorean
      ? "넵! 지금 회의 중 자투리 시간에 확인했어요~ 일정 마치고 퇴근하면서 바로 연락할게요!"
      : "Got it! Just checked during my quick break. I will wrap up things here and call you on my way home!";
    draftTranslated = isKorean
      ? "Yes! Checked during a break in meeting. I'll finish my schedule and call you as soon as I leave office!"
      : "응 확인했어! 마침 쉬는 시간에 확인했네. 얼른 업무 마무리하고 퇴근길에 연락할게!";
  }

  return res.json({
    draftOriginal,
    draftTranslated,
    mode: "simulation",
  });
});

// 2. Meeting mode Minutes Generator API
app.post("/api/meeting-summary", async (req: express.Request, res: express.Response) => {
  const { transcript } = req.body;
  if (!transcript || !Array.isArray(transcript)) {
    return res.status(400).json({ error: "Transcript is required and must be an array" });
  }

  const transcriptString = transcript.map((line: any) => `[${line.speaker || 'Unknown'}]: ${line.text}`).join("\n");

  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `You are a professional secretary and writing expert. 
Given the following conversation elements of a business meeting:

${transcriptString}

Please write a highly polished, detailed structured meeting mins (회의록) in Markdown format.
It must include EXACTLY the following three structure categories, with clean headers:

# Executive Summary (핵심 요약)
- 2-4 comprehensive sentences summarizing the overall theme, purpose, and result.

# Decisions Made (결정된 사항)
- Bullets outlining critical business agreements, consensus, or decisions approved.

# Auto-Extracted Action Items (조치 사항 및 할 일)
- Specific task assignments with owner tags (e.g. [@Jane, @User]) and inferred timeline deliverables if any.

Maintain bilingual headers (Korean with English) to fit global collaborative settings, and output only the markdown result. Ensure details from the conversation are accurately represented.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      return res.json({
        markdown: response.text || "Failed to generate summary.",
        mode: "api",
      });
    } catch (err: any) {
      console.warn("Gemini summary failed, using mock rules:", err.message);
    }
  }

  // Backup Mock Generator
  const markdownFallback = `# Executive Summary (핵심 요약)
The team converged to solve the critical server latency bottlenecks reported over the weekend and coordinate the upcoming v2.4 UI release launch schedule. Strategic measures were proposed to refactor redundant API queries and migrate key modules onto Cloud Run.

# Decisions Made (결정된 사항)
- **Database Index Optimization**: Agreed to deploy immediate composite indexes on multi-tenant collections to reduce latency by 45%.
- **Google Workspace Ecosystem Sync**: Decided to run the myBIZcon ecosystem pipeline to autolink keep notes to tasks.
- **Rollout Schedule**: Targeted June 15th for staging tests and June 20th for production launch of the new dashboard interface.

# Auto-Extracted Action Items (조치 사항 및 할 일)
- **@Developer A** - Implement database indexed queries and monitor CPU load gauges by Friday.
- **@UI/UX Team** - Finalize the Material 3 design tokens file and bottom bar icons by June 1st.
- **@User (PM)** - Sync Workspace calendar schedule with the client and archive meeting slides to Google Drive.`;

  return res.json({
    markdown: markdownFallback,
    mode: "simulation",
  });
});

// 3. Q&A Ask AI on Recordings API
app.post("/api/ask-notes", async (req: express.Request, res: express.Response) => {
  const { transcript, question } = req.body;
  if (!transcript || !question) {
    return res.status(400).json({ error: "Transcript and question are required" });
  }

  const transcriptText = Array.isArray(transcript) 
    ? transcript.map((line: any) => `[${line.speaker}]: ${line.text}`).join("\n")
    : String(transcript);

  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `You are "myBIZcon Call Copilot". You are assisting a user in understanding their recorded notes.
Here is the recorded content transcript:
"""
${transcriptText}
"""

The user asks: "${question}"

Please answer the user's question clearly, concisely, and with direct referencing to what was state in the transcription blocks. Under no circumstances should you make up info. Be polite and helpful, keeping the tone professional.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      return res.json({
        answer: response.text || "Unable to formulate response.",
        mode: "api",
      });
    } catch (err: any) {
      console.warn("Gemini Q&A failed, falling back to mock:", err.message);
    }
  }

  // Mock Backup Answers
  let answer = "Thank you for asking. Based on the notes, the team is heavily focusing on index optimization and user launch schedules. Since I am in offline simulation mode, I am presenting a general synthesis of your timeline chips and keyword blocks. Let me know if you would like me to process a specific query!";
  const qLower = question.toLowerCase();
  if (qLower.includes("when") || qLower.includes("date") || qLower.includes("schedule") || qLower.includes("일정")) {
    answer = "The transcript states that the staging test is scheduled for June 15th, with the final production rollout targeted for June 20th.";
  } else if (qLower.includes("who") || qLower.includes("people") || qLower.includes("담당")) {
    answer = "The notes state that Developer A is in charge of database indexes, the UI/UX team is finalizing design tokens, and the PM (User) is managing Google Workspace synchronization.";
  } else if (qLower.includes("decide") || qLower.includes("decision") || qLower.includes("결정")) {
    answer = "The main decisions made were: 1) Deploying immediate composite indexes on collections, 2) Running the myBIZcon synchronization pipeline, and 3) Establishing the mid-June rollout timeline.";
  }

  return res.json({
    answer,
    mode: "simulation",
  });
});

// Serve frontend SPA or launch Vite in Dev mode
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[myBIZcon] Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
