import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';

export const useImproveWithAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const improveTextInLanguage = async (text: string, language: Language): Promise<string> => {
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const langMap: Record<Language, string> = {
        'pt-BR': 'Brazilian Portuguese',
        'pt-PT': 'European Portuguese',
        'en': 'English',
        'de': 'German'
      };

      const targetLanguage = langMap[language];

      const prompt = `You are an expert content editor specializing in Christian evangelism ministry materials. Your task is to improve the following text for clarity, grammar, coherence, and impact while maintaining the original meaning, tone, and spiritual intent.

**Language**: ${targetLanguage}
**Instructions**:
- Improve grammar, spelling, and punctuation
- Enhance clarity and readability
- Structure the text logically with proper paragraphs
- Maintain the spiritual and emotional tone
- Preserve all key information and decisions mentioned
- If it contains multiple sections, organize them clearly
- Return ONLY the improved text, no explanations

**Original Text**:
"""
${text}
"""

**Improved Text**:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }]
      });

      return response.text?.trim() || text;
    } catch (error) {
      console.error("AI Improvement failed:", error);
      return text;
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, improveTextInLanguage };
};
