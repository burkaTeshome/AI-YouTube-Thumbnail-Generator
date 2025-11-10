import { GoogleGenAI, Modality, Type } from "@google/genai";
import {
  Mood,
  ImageReaction,
  Refinements,
  ThumbnailStyle,
  ThumbnailSuggestion,
} from "../types";

interface GenerateThumbnailParams {
  image: { base64: string; mimeType: string };
  title: string;
  concept: string;
  backgroundConcept: string;
  mood: Mood;
  imageReaction: ImageReaction;
  thumbnailStyle: ThumbnailStyle;
  refinements?: Refinements;
}

// ✅ Securely read from Vercel Environment Variable
const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error(
    "❌ Missing API_KEY. Set it in your Vercel project under Settings → Environment Variables."
  );
}

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey });

// -------------------- PROMPT BUILDER --------------------
function buildPrompt(params: GenerateThumbnailParams): string {
  const {
    title,
    concept,
    backgroundConcept,
    mood,
    imageReaction,
    thumbnailStyle,
    refinements,
  } = params;

  const moodInstructions: Record<Mood, string> = {
    [Mood.ENERGETIC]:
      "EXTREMELY HIGH ENERGY. Use vibrant, neon, saturated colors like electric blues and hot pinks...",
    [Mood.DRAMATIC]:
      "CINEMATIC & SERIOUS. Create a high-contrast scene with deep shadows and strong highlights...",
    [Mood.PROFESSIONAL]:
      "CLEAN & POLISHED. Use a minimalist and modern design with professional color palettes...",
    [Mood.FUNNY]:
      "PLAYFUL & COMICAL. Use bright colors, exaggerated expressions, and comic-style design...",
    [Mood.INSPIRATIONAL]:
      "UPLIFTING & HOPEFUL. Use warm lighting, bright tones, and optimistic composition...",
  };

  let prompt = `
You are an expert YouTube thumbnail designer. Create a visually stunning 16:9 thumbnail that is guaranteed to grab attention.

**Requirements:**
1. Replace the background with: "${backgroundConcept}" while preserving the subject.
2. Use the title: "${title}" — bold, modern sans-serif font (Bebas Neue, Montserrat ExtraBold, Impact).
3. Represent the concept: "${concept}".
4. Mood: **${mood}** — ${moodInstructions[mood]}.
5. Style: **${thumbnailStyle}**.
6. Subject expression: **${imageReaction}**.
7. Maintain perfect 16:9 ratio and balance.

`;

  if (
    refinements &&
    (refinements.brightness !== "normal" ||
      refinements.color ||
      refinements.layout)
  ) {
    prompt += `
**Refinements:**`;
    if (refinements.brightness !== "normal") {
      prompt += `\n- Brightness: ${refinements.brightness}.`;
    }
    if (refinements.color) {
      prompt += `\n- Color palette: ${refinements.color}.`;
    }
    if (refinements.layout) {
      prompt += `\n- Layout instruction: ${refinements.layout}.`;
    }
  }

  prompt += `
**Final Output:** 
Produce one polished, high-quality 16:9 image with no text other than the title. 
Ensure readability, perfect aspect ratio, and professional design.
`;

  return prompt;
}

// -------------------- GENERATE SUGGESTIONS --------------------
export const generateSuggestions = async (
  videoDescription: string
): Promise<ThumbnailSuggestion[]> => {
  const model = "gemini-2.5-flash";

  const prompt = `
You are a viral YouTube strategist.
Based on this video description, create 3 clickable thumbnail ideas.

Description: "${videoDescription}"

Each idea should include:
- A short, catchy title
- A vivid background concept
- A mood
- A subject reaction
- An artistic style

Mood options: ${Object.values(Mood).join(", ")}
Reactions: ${Object.values(ImageReaction).join(", ")}
Styles: ${Object.values(ThumbnailStyle).join(", ")}

Return a valid JSON array with 3 objects in this format:
[
  {
    "title": "...",
    "backgroundConcept": "...",
    "mood": "...",
    "imageReaction": "...",
    "thumbnailStyle": "..."
  }
]
`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ text: prompt }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            backgroundConcept: { type: Type.STRING },
            mood: { type: Type.STRING, enum: Object.values(Mood) },
            imageReaction: { type: Type.STRING, enum: Object.values(ImageReaction) },
            thumbnailStyle: { type: Type.STRING, enum: Object.values(ThumbnailStyle) },
          },
          required: [
            "title",
            "backgroundConcept",
            "mood",
            "imageReaction",
            "thumbnailStyle",
          ],
        },
      },
    },
  });

  const text = response.text?.trim();
  try {
    const suggestions = JSON.parse(text);
    return suggestions as ThumbnailSuggestion[];
  } catch (err) {
    console.error("❌ Failed to parse AI response:", text);
    throw new Error("AI returned invalid JSON format for suggestions.");
  }
};

// -------------------- GENERATE THUMBNAIL IMAGE --------------------
export const generateThumbnail = async (
  params: GenerateThumbnailParams
): Promise<string> => {
  const model = "gemini-2.5-flash-image";
  const prompt = buildPrompt(params);

  const imagePart = {
    inlineData: {
      data: params.image.base64,
      mimeType: params.image.mimeType,
    },
  };

  const textPart = { text: prompt };

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, textPart] },
    config: { responseModalities: [Modality.IMAGE] },
  });

  if (!response.candidates?.length) {
    throw new Error(
      "❌ No response from Gemini API — possibly blocked by safety filters. Try adjusting your input."
    );
  }

  const candidate = response.candidates[0];

  for (const part of candidate.content?.parts ?? []) {
    if (part.inlineData?.data) {
      return part.inlineData.data;
    }
  }

  throw new Error("❌ No image data returned from Gemini API.");
};
