import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

export const useGemini = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const getApiKey = (): string => {
    // Try multiple sources for API key
    const key = (window as any).__GEMINI_API_KEY || 
                localStorage.getItem('gemini_api_key') ||
                '';
    
    if (!key) {
      throw new Error('Gemini API key not configured. Please set it in environment variables or localStorage.');
    }
    return key;
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    setIsProcessing(true);
    try {
      const apiKey = getApiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
            const res = reader.result as string;
            if (res) {
              const data = res.split(',')[1];
              resolve(data);
            } else {
              reject("Empty result");
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Determine correct MIME type
      let mimeType = 'audio/webm';
      if (audioBlob.type.includes('mp4')) mimeType = 'audio/mp4';
      else if (audioBlob.type.includes('mpeg')) mimeType = 'audio/mpeg';
      else if (audioBlob.type.includes('wav')) mimeType = 'audio/wav';

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash', // Using stable Flash model
        contents: [
            {
                parts: [
                    { text: "Transcribe the following audio content into text. Return only the transcription without any introductory text or explanations." },
                    {
                        inlineData: {
                            mimeType, 
                            data: base64Data
                        }
                    }
                ]
            }
        ]
      });

      const transcribedText = response.text?.trim() || "";
      
      if (!transcribedText) {
        console.warn("Transcription returned empty result");
        return ""; 
      }

      return transcribedText;
    } catch (error) {
      console.error("Transcription failed:", error);
      throw error; // Re-throw to handle in component
    } finally {
      setIsProcessing(false);
    }
  };

  const improveText = async (text: string, language: string = 'pt-BR'): Promise<string> => {
    setIsProcessing(true);
    try {
        const apiKey = getApiKey();
        const ai = new GoogleGenAI({ apiKey });
        
        const langMap: Record<string, string> = {
          'pt-BR': 'Brazilian Portuguese',
          'pt-PT': 'European Portuguese',
          'en': 'English',
          'de': 'German',
          'es': 'Spanish',
          'fr': 'French',
          'it': 'Italian'
        };
        
        const targetLang = langMap[language] || 'Portuguese';
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ parts: [{ text: `Improve the following text for clarity, grammar, coherence and impact while maintaining the original meaning and tone. Return only the improved text in ${targetLang}.\n\nText: "${text}"` }] }]
        });
        return response.text?.trim() || text;
    } catch (error) {
        console.error("AI Improvement failed:", error);
        throw error;
    } finally {
        setIsProcessing(false);
    }
  };

  const generateTestimonySummary = async (data: any, teamName?: string, language: string = 'pt-BR'): Promise<string> => {
    setIsProcessing(true);
    try {
      const apiKey = getApiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      const langMap: Record<string, string> = {
        'pt-BR': 'Brazilian Portuguese',
        'pt-PT': 'European Portuguese',
        'en': 'English',
        'de': 'German',
        'es': 'Spanish',
        'fr': 'French',
        'it': 'Italian'
      };
      
      const targetLang = langMap[language] || 'Brazilian Portuguese';
      
      const decisions = data.people_profiles?.map((p: any) => {
          const name = p.name ? `${p.name} (${p.profile_type})` : p.profile_type;
          const decs = p.decisions?.join(', ');
          return decs ? `${name} decidiu: ${decs}` : null;
      }).filter(Boolean).join('; ');

      const prompt = `
        You are an expert writer for a Christian outreach ministry.
        Create a compelling, inspiring, and coherent summary of the following evangelism testimony.
        
        Input Data:
        - Date: ${data.date}
        - Team: ${teamName || 'Evangelism Team'}
        - Title: ${data.testimony_title}
        - Context: ${data.initial_context}
        - Approach Description: ${data.during_approach}
        - Supernatural Events: ${data.events_during?.join(', ')}
        - Personal Witness Account: ${data.testimony_witnessed}
        - Spiritual Outcomes: ${decisions}

        Guidelines:
        - Write in ${targetLang}.
        - Use an encouraging and faithful tone.
        - Structure the narrative logically: Context -> Encounter -> Impact -> Result.
        - Highlight specific miracles or decisions.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash', // Using Flash for complex creative writing
        contents: [{ parts: [{ text: prompt }] }]
      });
      return response.text || "Não foi possível gerar o resumo.";
    } catch (error) {
      console.error("Summary generation failed:", error);
      return "Erro ao gerar resumo com IA.";
    } finally {
      setIsProcessing(false);
    }
  };

  const generateBilingualSummary = async (data: any, teamName?: string, nativeLanguage: string = 'pt-BR'): Promise<{ native: string; english: string }> => {
    try {
      // Generate both summaries independently without shared isProcessing state
      const [nativeSummary, englishSummary] = await Promise.all([
        generateTestimonySummary(data, teamName, nativeLanguage),
        generateTestimonySummary(data, teamName, 'en')
      ]);
      
      return {
        native: nativeSummary,
        english: englishSummary
      };
    } catch (error) {
      console.error("Bilingual summary generation failed:", error);
      throw error;
    }
  };

  const generatePrayerAgenda = async (topic: string): Promise<any> => {
    setIsProcessing(true);
    try {
      const apiKey = getApiKey();
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        Create a weekly prayer agenda for a church outreach ministry based on the specific topic: "${topic}".
        
        Return the result strictly as a JSON object with the following structure:
        {
          "title": "Inspiring Title related to ${topic}",
          "vision": "A short inspiring vision statement",
          "objective": "A specific spiritual objective",
          "days": [
            { "id": "mon", "label": "SEGUNDA", "theme": "Theme related to ${topic}", "prayer": "Key prayer point", "declaration": "Faith declaration" },
            { "id": "tue", "label": "TERÇA", "theme": "Theme related to ${topic}", "prayer": "Key prayer point", "declaration": "Faith declaration" },
            { "id": "wed", "label": "QUARTA", "theme": "Theme related to ${topic}", "prayer": "Key prayer point", "declaration": "Faith declaration" },
            { "id": "thu", "label": "QUINTA", "theme": "Theme related to ${topic}", "prayer": "Key prayer point", "declaration": "Faith declaration" },
            { "id": "fri", "label": "SEXTA", "theme": "Theme related to ${topic}", "prayer": "Key prayer point", "declaration": "Faith declaration" },
            { "id": "weekend", "label": "FIM-DE-SEMANA", "theme": "Theme related to ${topic}", "prayer": "Key prayer point", "declaration": "Faith declaration" }
          ]
        }
        Language: Portuguese.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash', // Using Flash for structured creative generation
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      if (response.text) {
          return JSON.parse(response.text);
      }
      return null;
    } catch (error) {
      console.error("Agenda generation failed:", error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const translateText = async (text: string, targetLangCode: string): Promise<string> => {
    setIsProcessing(true);
    try {
      const apiKey = getApiKey();
      const ai = new GoogleGenAI({ apiKey });
      
      // Map app codes to prompt codes
      const langMap: Record<string, string> = {
        'pt-BR': 'PT-BR',
        'pt-PT': 'PT-PT',
        'en': 'EN',
        'de': 'DE'
      };
      const targetLanguage = langMap[targetLangCode] || 'PT-BR';

      const prompt = `
Você é um tradutor especializado e parte integrante de um aplicativo multilíngue chamado "OUTreach". Sua única função é traduzir o texto de entrada para o idioma de destino solicitado. Mantenha o tom profissional e direto. Se o texto for uma lista ou tiver formatação, preserve a estrutura original (parágrafos, bullet points, quebras de linha, etc.).

**Linguagem de Saída Requerida:** ${targetLanguage}

**Texto de Entrada Original:**
"""
${text}
"""
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }]
      });

      return response.text || text;
    } catch (error) {
      console.error("Translation failed:", error);
      return text;
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, transcribeAudio, improveText, generateTestimonySummary, generateBilingualSummary, generatePrayerAgenda, translateText };
};
