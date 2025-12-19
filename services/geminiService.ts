
import { GoogleGenAI, Type } from "@google/genai";
import { DictionaryEntry, TranslationResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a specialized technical translator assistant for a Civil Engineer working in Bridge and Road construction.
Your task is to identify text from screenshots of software interfaces (like AutoCAD, Civil 3D, Revit, SketchUp).

Rules:
1. Extract text from UI elements (menus, tooltips, buttons).
2. Translate the text from English to Vietnamese.
3. Use strict technical terminology used in the Vietnamese construction industry.
4. Format the output strictly as JSON.
5. If a term is very common (like "OK", "Cancel"), translate it standardly.
6. For technical terms, prioritize the "English (Vietnamese)" or "Vietnamese (English)" format if it helps clarity, but the JSON output should have separate fields.

Example Context:
- "Offset" -> "Dời song song" (AutoCAD)
- "Alignment" -> "Tuyến" (Civil 3D)
- "Abutment" -> "Mố cầu" (Bridge design)
`;

export const analyzeImage = async (
  base64Image: string,
  dictionary: DictionaryEntry[]
): Promise<TranslationResult[]> => {
  try {
    // 1. Prepare Dictionary Context to help Gemini prioritize user terms
    const dictionaryContext = dictionary
      .map((d) => `- ${d.term}: ${d.translation}`)
      .join('\n');

    const prompt = `
      Analyze this image. It is a screenshot from technical engineering software.
      1. OCR all visible text.
      2. For each distinct text element, translate it to Vietnamese.
      3. Check this user-provided dictionary for preferred translations. If the text matches a term here, use this translation:
      ${dictionaryContext}

      Return a JSON object with a "items" array. Each item should have:
      - "original": The English text found.
      - "translated": The Vietnamese translation.
      - "isDictionaryMatch": true if it matched the provided list, else false.
    `;

    // 2. Call Gemini 3 Flash (optimized for technical analysis and OCR)
    // Updated model to gemini-3-flash-preview as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG for screenshots
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  translated: { type: Type.STRING },
                  isDictionaryMatch: { type: Type.BOOLEAN },
                },
              },
            },
          },
        },
      },
    });

    // Correctly accessing .text property (not a method) as per @google/genai guidelines
    const text = response.text;
    if (!text) return [];

    const parsed = JSON.parse(text);
    return parsed.items || [];

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
