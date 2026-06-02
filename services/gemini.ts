import { GoogleGenAI, Type, Schema, FunctionDeclaration, Modality, LiveServerMessage } from "@google/genai";
import { SearchResult } from "../types";

// Helper to ensure API key is selected (required for Veo and some other models)
export const ensureApiKey = async () => {
  const win = window as any;
  if (win.aistudio && win.aistudio.hasSelectedApiKey) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
    }
  }
};

// Helper to get client (always fresh for API key updates)
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Search Grounding ---
export const searchLocalAttractions = async (query: string) => {
  await ensureApiKey();
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Help a tourist in Maharashtra near a rustic resort. Query: ${query}. Provide a concise summary and list the best places.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text;
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  // Extract URLs safely
  const sources: SearchResult[] = [];
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
    });
  }

  return { text, sources };
};

// --- Image Editing (Nano Banana) ---
export const editImage = async (base64Image: string, prompt: string) => {
  await ensureApiKey();
  const ai = getAiClient();
  // Using Flash Image for editing
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/png', // Assuming PNG for canvas exports
          },
        },
        { text: prompt },
      ],
    },
  });

  // Extract image from response
  let resultImage = null;
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        resultImage = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  }
  
  return resultImage;
};

// --- Veo Video Generation ---
export const generateVideo = async (imageBytes: string, prompt: string, isPortrait: boolean) => {
  await ensureApiKey();
  const ai = getAiClient();
  const aspectRatio = isPortrait ? '9:16' : '16:9';

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || "Animate this naturally",
    image: {
      imageBytes: imageBytes,
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
    }
  });

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");

  // Fetch the actual video bytes using the key
  const finalVideoUrl = `${videoUri}&key=${process.env.API_KEY}`;
  return finalVideoUrl;
};

// --- Live API (Session Connection) ---
export const connectLiveSession = async (
  onOpen: () => void,
  onMessage: (msg: LiveServerMessage) => void,
  onError: (err: any) => void,
  onClose: (evt: any) => void
) => {
  await ensureApiKey();
  const ai = getAiClient();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: onOpen,
      onmessage: onMessage,
      onerror: onError,
      onclose: onClose,
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }, // Rustic, calm voice
      },
      systemInstruction: `You are 'Terra', the concierge for 'The Terracotta Grove', a rustic resort in Maharashtra. 
      You are warm, welcoming, and knowledgeable about Maharashtrian cuisine and hospitality.
      Briefly answer questions about our 'Eat, Relax, Stay' zones, spicy food, or garden. 
      Keep answers short and conversational.`,
    },
  });
};