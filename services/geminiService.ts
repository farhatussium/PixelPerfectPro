
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartSuggestions = async (
  base64Image: string,
  mimeType: string
): Promise<GeminiSuggestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1],
                mimeType: mimeType,
              },
            },
            {
              text: "Analyze this image and suggest 3 optimal resizing dimensions for social media or professional use. For example, 'Instagram Post', 'YouTube Thumbnail', or 'LinkedIn Banner'. Return a JSON array of objects with 'label', 'width', 'height', and a short 'reason'.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              width: { type: Type.NUMBER },
              height: { type: Type.NUMBER },
              reason: { type: Type.STRING },
            },
            required: ["label", "width", "height", "reason"],
          },
        },
      },
    });

    const suggestions = JSON.parse(response.text || "[]");
    return suggestions;
  } catch (error) {
    console.error("Gemini Error:", error);
    return [
      { label: "Instagram Square", width: 1080, height: 1080, reason: "Standard social post format" },
      { label: "YouTube HD", width: 1920, height: 1080, reason: "Full HD 16:9 widescreen" },
      { label: "Twitter Banner", width: 1500, height: 500, reason: "Optimized for header displays" }
    ];
  }
};

export const editImageWithAi = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: mimeType,
          },
        },
        {
          text: prompt
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from AI.");
};
