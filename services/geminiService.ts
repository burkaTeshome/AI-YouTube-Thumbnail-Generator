import { GoogleGenAI, Modality } from "@google/genai";
import { Mood, ImageReaction, Refinements, ThumbnailStyle } from "../types";

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

// ✅ Use environment variable securely from Vercel
const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error(
    "❌ API_KEY is not set in the environment variables. Please configure it in your Vercel project settings."
  );
}

// Initialize Gemini API client
const ai = new GoogleGenAI({ apiKey });

// -------------------- Prompt Builder --------------------
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
      "CLEAN & POLISHED. Design a minimalist and modern layout...",
    [Mood.FUNNY]:
      "PLAYFUL & COMICAL. Use bright, candy-like colors. Exaggerated expressions...",
    [Mood.INSPIRATIONAL]:
      "UPLIFTING & HOPEFUL. Use soft, warm lighting, bright and optimistic colors...",
  };

  let prompt = `
You are an expert YouTube thumbnail designer, a master of viral aesthetics. Your mission is to create a visually stunning, high-contrast thumbnail that grabs attention.

**CRITICAL REQUIREMENT:** The final output image MUST have a 16:9 aspect ratio.

1. Replace the background with: "${backgroundConcept}" while preserving the subject perfectly.
2. Use the title "${title}" with bold, modern sans-serif typography (e.g., Bebas Neue, Impact).
3. Represent the concept: "${concept}".
4. Maintain a **${mood}** mood. Style guide: ${moodInstructions[mood]}.
5. Artistic style: **${thumbnailStyle}**.
6. Subject’s expression: **${imageReaction}**.
7. Composition must be dynamic, exciting, and professional.
`;

  if (
    refinements &&
    (refinements.brightness !== "normal" ||
      refinements.color ||
      refinements.layout)
  ) {
    prompt += `\n**Refinement Instructions:**`;
    if (refinements.brightness !== "normal") {
      prompt += `\n- Adjust brightness: ${refinements.brightness}.`;
    }
    if (refinements.color) {
      prompt += `\n- Use color palette: ${refinements.color}.`;
    }
    if (refinements.layout) {
      prompt += `\n- Layout instruction: ${refinements.layout}.`;
    }
  }

  prompt += `
**Final Output:**
Produce one complete 16:9 image. Ensure the aspect ratio is exact. No watermarks or placeholder text. Ready for YouTube upload.
`;

  return prompt;
}

// -------------------- Main Thumbnail Generator --------------------
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
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  if (!response.candidates?.length) {
    throw new Error(
      "❌ The AI did not return a response. This may be due to safety filters or invalid input."
    );
  }

  const candidate = response.candidates[0];

  for (const part of candidate.content?.parts ?? []) {
    if (part.inlineData?.data) {
      return part.inlineData.data;
    }
  }

  throw new Error("❌ No image data found in the response from Gemini API.");
};
