import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiSuggestion } from "@/types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the AI instance once
let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is missing in environment variables.");
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Generate subtask suggestions for a given task
 */
export async function generateTaskSuggestions(
  title: string,
  description?: string
): Promise<AiSuggestion[]> {
  try {
    const genAI = getGenAI();
    // Use gemini-1.5-flash as it is stable and cost-effective
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    console.log("Generating suggestions for:", title);

    const prompt = `You are a helpful task breakdown assistant. 

Task Title: "${title}"
${description ? `Task Description: "${description}"` : ""}

Break this task into 3-6 concrete, actionable subtasks. Each subtask should:
- Be specific and clear
- Be something that can be completed independently
- Have a realistic time estimate

For each subtask, estimate the time in minutes (between 15 and 120).

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "title": "Subtask title here",
    "estimatedTime": 30
  }
]`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("Gemini Raw Response:", text);

    // Clean up potential markdown code blocks
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", cleanedText);
      throw new Error("Invalid JSON response from AI");
    }

    // Validate the response structure
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid response format: expected an array");
    }

    const suggestions = parsed.map((item: any) => ({
      id: crypto.randomUUID(),
      title: item.title || item.name || "Untitled subtask",
      estimatedTime: item.estimatedTime || item.estimated_time || 30
    }));

    console.log("Parsed Suggestions:", suggestions);
    return suggestions;

  } catch (error) {
    console.error("Error generating suggestions:", error);

    // Return fallback suggestions so the app doesn't break
    return getFallbackSuggestions(title, description);
  }
}

/**
 * Streaming version - generates subtasks in real-time
 */
export async function generateTaskSuggestionsStream(
  title: string,
  description?: string,
  onChunk?: (text: string) => void
): Promise<AiSuggestion[]> {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    const prompt = `Break down this task into 3-6 actionable subtasks with time estimates (15-120 minutes).

Task: "${title}"
${description ? `Description: "${description}"` : ""}

Return as JSON array: [{"title": "...", "estimatedTime": 30}]`;

    const result = await model.generateContentStream(prompt);

    let fullText = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;

      // Call the callback with each chunk
      if (onChunk) {
        onChunk(chunkText);
      }
    }

    console.log("Streamed complete text:", fullText);

    const cleanedText = fullText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    return parsed.map((item: any) => ({
      id: crypto.randomUUID(),
      title: item.title || item.name || "Untitled subtask",
      estimatedTime: item.estimatedTime || item.estimated_time || 30
    }));

  } catch (error) {
    console.error("Error in streaming suggestions:", error);
    return getFallbackSuggestions(title, description);
  }
}

/**
 * Refine existing subtasks based on user feedback
 */
export async function refineSubtasks(
  originalTask: string,
  currentSubtasks: AiSuggestion[],
  userFeedback: string
): Promise<AiSuggestion[]> {
  try {
    const genAI = getGenAI();
    // Also use gemini-1.5-flash here
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Original Task: "${originalTask}"

Current Subtasks:
${currentSubtasks.map((st, i) => `${i + 1}. ${st.title} (${st.estimatedTime} min)`).join('\n')}

User Feedback: "${userFeedback}"

Based on this feedback, provide refined subtasks. Return as JSON array:
[{"title": "...", "estimatedTime": 30}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedText);

    return parsed.map((item: any) => ({
      id: crypto.randomUUID(),
      title: item.title,
      estimatedTime: item.estimatedTime
    }));

  } catch (error) {
    console.error("Error refining subtasks:", error);
    return currentSubtasks;
  }
}

/**
 * Smart fallback suggestions based on task keywords
 * Provides context-aware subtasks for academic tasks
 */
export function getFallbackSuggestions(
  title: string,
  description?: string
): AiSuggestion[] {
  const lowerTitle = title.toLowerCase();
  const lowerDesc = description?.toLowerCase() || "";
  const combined = `${lowerTitle} ${lowerDesc}`;

  // Check for specific task types
  if (isResearchTask(combined)) return getResearchSuggestions();
  if (isEssayTask(combined)) return getEssaySuggestions();
  if (isPresentationTask(combined)) return getPresentationSuggestions();
  if (isExamTask(combined)) return getExamSuggestions();
  if (isProjectTask(combined)) return getProjectSuggestions();
  if (isCodingTask(combined)) return getCodingSuggestions();
  if (isLabTask(combined)) return getLabSuggestions();
  if (isReadingTask(combined)) return getReadingSuggestions();
  if (isGroupTask(combined)) return getGroupWorkSuggestions();
  if (isMathTask(combined)) return getMathSuggestions();
  if (isLanguageTask(combined)) return getLanguageSuggestions();
  if (isArtTask(combined)) return getArtSuggestions();

  // Default generic academic suggestions
  return getGenericAcademicSuggestions();
}

// Task type detectors
function isResearchTask(text: string): boolean {
  return /research|paper|thesis|dissertation|literature review|survey|study/i.test(text);
}

function isEssayTask(text: string): boolean {
  return /essay|write|composition|article|report|analysis/i.test(text);
}

function isPresentationTask(text: string): boolean {
  return /presentation|present|slides|powerpoint|ppt|keynote|speak/i.test(text);
}

function isExamTask(text: string): boolean {
  return /exam|test|quiz|midterm|final|assessment|review/i.test(text);
}

function isProjectTask(text: string): boolean {
  return /project|build|create|develop|design|implement/i.test(text);
}

function isCodingTask(text: string): boolean {
  return /code|program|coding|software|app|website|algorithm|debug|function/i.test(text);
}

function isLabTask(text: string): boolean {
  return /lab|experiment|laboratory|practical|demonstration/i.test(text);
}

function isReadingTask(text: string): boolean {
  return /read|book|chapter|textbook|article|journal|literature/i.test(text);
}

function isGroupTask(text: string): boolean {
  return /group|team|collaborate|together|partner/i.test(text);
}

function isMathTask(text: string): boolean {
  return /math|calculus|algebra|equation|problem set|solve|calculate|proof/i.test(text);
}

function isLanguageTask(text: string): boolean {
  return /language|translate|vocabulary|grammar|speaking|pronunciation/i.test(text);
}

function isArtTask(text: string): boolean {
  return /art|draw|paint|sketch|design|creative|sculpture|portfolio/i.test(text);
}

// Specific fallback suggestion sets

function getResearchSuggestions(): AiSuggestion[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Define research question and objectives",
      estimatedTime: 30
    },
    {
      id: crypto.randomUUID(),
      title: "Conduct literature review and gather sources",
      estimatedTime: 90
    },
    {
      id: crypto.randomUUID(),
      title: "Organize research materials and notes",
      estimatedTime: 45
    },
    {
      id: crypto.randomUUID(),
      title: "Analyze findings and identify patterns",
      estimatedTime: 60
    },
    {
      id: crypto.randomUUID(),
      title: "Create outline and structure",
      estimatedTime: 30
    },
    {
      id: crypto.randomUUID(),
      title: "Write and cite sources properly",
      estimatedTime: 120
    }
  ];
}

function getEssaySuggestions(): AiSuggestion[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Brainstorm ideas and create thesis statement",
      estimatedTime: 30
    },
    {
      id: crypto.randomUUID(),
      title: "Research and gather supporting evidence",
      estimatedTime: 60
    },
    {
      id: crypto.randomUUID(),
      title: "Create detailed outline with main points",
      estimatedTime: 25
    },
    {
      id: crypto.randomUUID(),
      title: "Write introduction and hook",
      estimatedTime: 30
    },
    {
      id: crypto.randomUUID(),
      title: "Draft body paragraphs with evidence",
      estimatedTime: 90
    },
    {
      id: crypto.randomUUID(),
      title: "Write conclusion and proofread",
      estimatedTime: 45
    }
  ];
}

function getPresentationSuggestions(): AiSuggestion[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Research topic and gather key information",
      estimatedTime: 60
    },
    {
      id: crypto.randomUUID(),
      title: "Create presentation outline and structure",
      estimatedTime: 30
    },
    {
      id: crypto.randomUUID(),
      title: "Design slides with visuals and minimal text",
      estimatedTime: 75
    },
    {
      id: crypto.randomUUID(),
      title: "Prepare speaker notes and examples",
      estimatedTime: 45
    },
    {
      id: crypto.randomUUID(),
      title: "Practice delivery and timing",
      estimatedTime: 60
    }
  ];
}

function getExamSuggestions(): AiSuggestion[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Review syllabus and identify key topics",
      estimatedTime: 20
    },
    {
      id: crypto.randomUUID(),
      title: "Organize notes and study materials",
      estimatedTime: 40
    },
    {
      id: crypto.randomUUID(),
      title: "Create summary sheets or flashcards",
      estimatedTime: 60
    },
    {
      id: crypto.randomUUID(),
      title: "Practice with past papers or questions",
      estimatedTime: 90
    },
    {
      id: crypto.randomUUID(),
      title: "Review difficult concepts and formulas",
      estimatedTime: 60
    },
    {
      id: crypto.randomUUID(),
      title: "Take practice test under timed conditions",
      estimatedTime: 75
    }
  ];
}

function getProjectSuggestions(): AiSuggestion[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Understand requirements and deliverables",
      estimatedTime: 30
    },
    {
      id: crypto.randomUUID(),
      title: "Break down project into milestones",
      estimatedTime: 40
    },
    {
      id: crypto.randomUUID(),
      title: "Research methods and gather resources",
      estimatedTime: 60
    },
    {
      id: crypto.randomUUID(),
      title: "Create initial prototype or draft",
      estimatedTime: 90
    },
    {
      id: crypto.randomUUID(),
      title: "Test, refine, and improve work",
      estimatedTime: 75
    },
    {
      id: crypto.randomUUID(),
      title: "Prepare documentation and presentation",
      estimatedTime: 45
    }
  ];
}

function getCodingSuggestions(): AiSuggestion[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Understand problem requirements and constraints",
      estimatedTime: 25
    },
    {
      id: crypto.randomUUID(),
      title: "Plan algorithm and data structures",
      estimatedTime: 35
    },
    {
      id: crypto.randomUUID(),
      title: "Set up development environment",
      estimatedTime: 20
    },
    {
      id: crypto.randomUUID(),
      title: "Write initial code implementation",
      estimatedTime: 90
    },
    {
      id: crypto.randomUUID(),
      title: "Test with different inputs and edge cases",
      estimatedTime: 45
    },
    {
      id: crypto.randomUUID(),
      title: "Debug, optimize, and document code",
      estimatedTime: 60
    }
  ];
}

function getLabSuggestions(): AiSuggestion[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Read lab manual and understand procedure",
      estimatedTime: 30
    },
    {
      id: crypto.randomUUID(),
      title: "Review safety protocols and materials",
      estimatedTime: 20
    },
    {
      id: crypto.randomUUID(),
      title: "Prepare lab notebook and data tables",
      estimatedTime: 25
    },
    {
      id: crypto.randomUUID(),
      title: "Conduct experiment and collect data",
      estimatedTime: 90
    },
    {
      id: crypto.randomUUID(),
      title: "Analyze results and calculations",
      estimatedTime: 60
    },
    {
      id: crypto.randomUUID(),
      title: "Write lab report with conclusions",
      estimatedTime: 75
    }
  ];
}

function getReadingSuggestions(): AiSuggestion[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Preview chapter and identify key sections",
      estimatedTime: 15
    },
    {
      id: crypto.randomUUID(),
      title: "Read actively and take notes",
      estimatedTime: 60
    },
    {
      id: crypto.randomUUID(),
      title: "Highlight main ideas and concepts",
      estimatedTime: 30
    },
    {
      id: crypto.randomUUID(),
      title: "Summarize each section in own words",
      estimatedTime: 40
    },
    {
      id: crypto.randomUUID(),
      title: "Review and answer study questions",
      estimatedTime: 35
    }
  ];
}

function getGroupWorkSuggestions(): AiSuggestion[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Schedule initial team meeting",
      estimatedTime: 30
    },
    {
      id: crypto.randomUUID(),
      title: "Divide tasks and assign responsibilities",
      estimatedTime: 40
    },
    {
      id: crypto.randomUUID(),
      title: "Set deadlines and communication plan",
      estimatedTime: 25
    },
    {
      id: crypto.randomUUID(),
      title: "Complete individual assigned work",
      estimatedTime: 90
    },
    {
      id: crypto.randomUUID(),
      title: "Review team members' contributions",
      estimatedTime: 45
    },
    {
      id: crypto.randomUUID(),
      title: "Integrate work and finalize project",
      estimatedTime: 60
    }
  ];
}

function getMathSuggestions(): AiSuggestion[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Review relevant formulas and theorems",
      estimatedTime: 30
    },
    {
      id: crypto.randomUUID(),
      title: "Work through example problems",
      estimatedTime: 60
    },
    {
      id: crypto.randomUUID(),
      title: "Practice similar problems independently",
      estimatedTime: 75
    },
    {
      id: crypto.randomUUID(),
      title: "Check solutions and identify mistakes",
      estimatedTime: 40
    },
    {
      id: crypto.randomUUID(),
      title: "Seek help on difficult concepts",
      estimatedTime: 35
    }
  ];
}

function getLanguageSuggestions(): AiSuggestion[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Review vocabulary and key phrases",
      estimatedTime: 30
    },
    {
      id: crypto.randomUUID(),
      title: "Practice grammar exercises",
      estimatedTime: 45
    },
    {
      id: crypto.randomUUID(),
      title: "Listen to native speakers or audio",
      estimatedTime: 40
    },
    {
      id: crypto.randomUUID(),
      title: "Practice speaking or writing",
      estimatedTime: 50
    },
    {
      id: crypto.randomUUID(),
      title: "Get feedback and make corrections",
      estimatedTime: 35
    }
  ];
}

function getArtSuggestions(): AiSuggestion[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Gather inspiration and reference materials",
      estimatedTime: 30
    },
    {
      id: crypto.randomUUID(),
      title: "Create initial sketches or concepts",
      estimatedTime: 45
    },
    {
      id: crypto.randomUUID(),
      title: "Plan composition and color scheme",
      estimatedTime: 35
    },
    {
      id: crypto.randomUUID(),
      title: "Work on main piece with techniques",
      estimatedTime: 120
    },
    {
      id: crypto.randomUUID(),
      title: "Add final details and refinements",
      estimatedTime: 60
    }
  ];
}

function getGenericAcademicSuggestions(): AiSuggestion[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "Understand the assignment requirements",
      estimatedTime: 20
    },
    {
      id: crypto.randomUUID(),
      title: "Research and gather necessary materials",
      estimatedTime: 60
    },
    {
      id: crypto.randomUUID(),
      title: "Create an outline or plan of action",
      estimatedTime: 30
    },
    {
      id: crypto.randomUUID(),
      title: "Complete the main work or draft",
      estimatedTime: 90
    },
    {
      id: crypto.randomUUID(),
      title: "Review, edit, and refine your work",
      estimatedTime: 45
    },
    {
      id: crypto.randomUUID(),
      title: "Prepare final submission",
      estimatedTime: 25
    }
  ];
}

/**
 * Check if API key is configured
 */
export function isGeminiConfigured(): boolean {
  return !!apiKey;
}
