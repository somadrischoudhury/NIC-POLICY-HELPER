import { GoogleGenAI } from "@google/genai";

export async function generatePolicyImage(prompt: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `${prompt}. Professional, high-quality, corporate health insurance style, vibrant colors, clean composition.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    const isQuotaExceeded = 
      error?.status === "RESOURCE_EXHAUSTED" || 
      error?.code === 429 ||
      error?.error?.status === "RESOURCE_EXHAUSTED" ||
      error?.error?.code === 429;

    if (isQuotaExceeded) {
      console.warn("Image generation quota exceeded, using fallback image.");
    } else {
      console.error("Image generation failed:", error);
    }
    // Fallback to a high-quality placeholder if quota is exceeded or any other error occurs
    return "https://picsum.photos/seed/nicl-health-insurance/1280/720";
  }
  return "https://picsum.photos/seed/nicl-health-insurance/1280/720";
}
