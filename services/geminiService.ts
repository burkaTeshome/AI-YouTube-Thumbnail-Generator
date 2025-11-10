import { GoogleGenAI, Modality } from "@google/genai";
import { Mood, ImageReaction, Refinements, ThumbnailStyle } from '../types';

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

// Fix: Use process.env.API_KEY and initialize GoogleGenAI directly as per guidelines. This resolves the TypeScript error 'Property 'env' does not exist on type 'ImportMeta''.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function buildPrompt(params: GenerateThumbnailParams): string {
    const { title, concept, backgroundConcept, mood, imageReaction, thumbnailStyle, refinements } = params;

    const moodInstructions: Record<Mood, string> = {
        [Mood.ENERGETIC]: 'EXTREMELY HIGH ENERGY. Use vibrant, neon, saturated colors like electric blues and hot pinks. Add dynamic motion blur, glowing light trails, speed lines, and maybe even a subtle particle effect. The composition should feel explosive and exciting. Text might have a slight italic slant for motion.',
        [Mood.DRAMATIC]: 'CINEMATIC & SERIOUS. Create a high-contrast scene with deep, crushed shadows and strong highlights (like rim lighting). Use a moody, cinematic color grade (e.g., teal and orange). Consider adding atmospheric elements like subtle fog, dust particles, or a light film grain for texture.',
        [Mood.PROFESSIONAL]: 'CLEAN & POLISHED. Design a minimalist and modern layout. Use a sophisticated, limited color palette (e.g., blues, dark grays, white with a single accent color). Graphics should be sharp and iconography simple. The overall feeling must be trustworthy, sleek, and premium.',
        [Mood.FUNNY]: 'PLAYFUL & COMICAL. Use bright, candy-like colors. The subject\'s expression should be exaggerated. Incorporate cartoonish elements like oversized text, quirky icons, or even a subtle "comic book" style effect. The composition should feel fun and not take itself too seriously.',
        [Mood.INSPIRATIONAL]: 'UPLIFTING & HOPEFUL. Use soft, warm lighting, like a golden hour glow. The color palette should be bright and optimistic. Add subtle light leaks, lens flares, or soft glows to enhance the mood. The scene should feel expansive and positive.'
    };

    let prompt = `
    You are an expert YouTube thumbnail designer, a master of viral aesthetics. Your mission is to create a visually stunning, high-contrast thumbnail that is guaranteed to grab attention and get clicks.

    **CRITICAL REQUIREMENT:** The final output image MUST have a 16:9 aspect ratio. This is the most important rule.

    **Instructions:**
    1.  **Main Subject & Composition:** The user has provided a source image that is already framed within a 16:9 aspect ratio canvas (it may have black bars). Your task is to replace the entire background (including any black bars) with a new, compelling scene based on this description: "${backgroundConcept}".
        - **CRITICAL RULE:** The final output image's dimensions and aspect ratio MUST EXACTLY match the input image's 16:9 aspect ratio. Do not change the framing.
        - **SUBJECT INTEGRATION:** The main subject from the source image must be perfectly preserved and seamlessly integrated into the new background.
        - **FACE PRESERVATION:** If the image contains a person, it is **absolutely critical** that their face is fully visible and not cropped, just as it is in the source image.
    
    2.  **Title Text & Typography:** This is the most critical element for clicks.
        - **Text:** The title is "${title}".
        - **Font Style:** Use a **very bold, modern, sans-serif font**. Think fonts like 'Bebas Neue', 'Montserrat ExtraBold', or 'Impact'. The font must feel clean and professional, suitable for a top-tier YouTube creator.
        - **Legibility:** The text MUST be instantly readable, even on small mobile screens. Achieve this with **extreme contrast**. Use techniques like a **thick, clean outline (often black or a dark color)**, a subtle drop shadow, or by placing the text inside a solid colored shape (a "text box").
        - **Color Palette:** Use a **minimal, high-contrast color palette for the text**. White is often the best choice for the main text fill. You can use a single, vibrant accent color (e.g., yellow, cyan) for emphasis on one or two key words if it fits the mood. **Avoid rainbow gradients or colors that clash with the background.**
        - **Placement:** Position the text strategically following the rule of thirds. It should complement the main subject, not obscure it.
        - **CRITICAL TEXT RULE:** The title text must be fully visible and must not be cropped or cut off at the edges of the image. Ensure ample padding around the text.

    3.  **Core Concept:** The video is about "${concept}". The entire thumbnail design should visually represent this idea.
    4.  **Mood and Style:** The desired mood is **${mood}**. Adhere to the following highly-detailed style guide: ${moodInstructions[mood]}
    5.  **Artistic Style:** The overall artistic style of the thumbnail should be **${thumbnailStyle}**.
    6.  **Subject's Expression:** If the subject is a person, ensure their expression is **${imageReaction}**. You may need to subtly enhance or alter the expression to fit this requirement.
    7.  **Overall Composition:** Create a dynamic and balanced composition. Use the rule of thirds, leading lines, and a clear focal point. The final image should be exciting and professional.
    `;

    if (refinements && (refinements.brightness !== 'normal' || refinements.color || refinements.layout)) {
        prompt += `
    **Refinement Instructions:**
    Please apply the following changes to the design:`;
        if (refinements.brightness !== 'normal') {
            prompt += `\n- Adjust brightness to be ${refinements.brightness}.`;
        }
        if (refinements.color) {
            prompt += `\n- Incorporate a color palette of: ${refinements.color}.`;
        }
        if (refinements.layout) {
            prompt += `\n- Follow this layout instruction: ${refinements.layout}.`;
        }
    }
    
    prompt += `
    **Final Output:**
    Produce a single, complete 16:9 image. Re-confirm that the aspect ratio is exactly 16:9. Do not include any watermarks, text other than the specified title, or placeholders. The result should be ready to be used as a YouTube thumbnail immediately.`;

    return prompt;
}


export const generateThumbnail = async (params: GenerateThumbnailParams): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  
  const prompt = buildPrompt(params);

  const imagePart = {
    inlineData: {
      data: params.image.base64,
      mimeType: params.image.mimeType,
    },
  };
  
  const textPart = { text: prompt };

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [imagePart, textPart],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("The AI did not return a response. This can happen due to safety filters. Please adjust your prompt and try again.");
  }
  
  const candidate = response.candidates[0];

  if (!candidate.content || !candidate.content.parts) {
      throw new Error("Invalid response structure from the API.");
  }

  for (const part of candidate.content.parts) {
    if (part.inlineData && part.inlineData.data) {
      return part.inlineData.data;
    }
  }

  throw new Error("No image data found in the response from Gemini API.");
};
