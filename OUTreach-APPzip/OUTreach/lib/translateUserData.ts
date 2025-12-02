import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';

export interface TranslatableUserData {
  name?: string;
  email?: string;
  church?: string;
  experience?: string;
  testimony?: string;
  prayerRequest?: string;
  messages?: string[];
  [key: string]: any;
}

export interface TranslationResult {
  success: boolean;
  originalLanguage?: string;
  targetLanguage: string;
  translatedData: TranslatableUserData;
  timestamp: string;
}

const langMap: Record<Language, string> = {
  'pt-BR': 'Brazilian Portuguese (pt-BR)',
  'pt-PT': 'European Portuguese (pt-PT)',
  'en': 'English',
  'de': 'German'
};

export const translateUserData = async (
  data: TranslatableUserData,
  targetLanguage: Language
): Promise<TranslationResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const fields = Object.entries(data)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(', ')}`;
        }
        return `${key}: ${value}`;
      })
      .join('\n');

    const prompt = `You are a professional translator for a Christian evangelism platform called "OUTreach!". Translate the following user data fields to ${langMap[targetLanguage]}. 

IMPORTANT RULES:
- Translate ONLY the values, not the field names
- Maintain professionalism and clarity
- Preserve any spiritual/religious meaning
- Keep the structure and organization
- If it's a list, maintain the list format
- Return a JSON object with the same structure

**Data to translate**:
${fields}

**Response format** (valid JSON):
{
  "translated_fields": {
    "field_name": "translated_value"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }]
    });

    const responseText = response.text || '{}';
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const result = JSON.parse(jsonMatch[0]);
    const translatedData: TranslatableUserData = {};

    // Map translated values back to data structure
    for (const [key, value] of Object.entries(data)) {
      if (result.translated_fields?.[key]) {
        translatedData[key] = result.translated_fields[key];
      } else {
        translatedData[key] = value; // Keep original if not translated
      }
    }

    return {
      success: true,
      targetLanguage: langMap[targetLanguage],
      translatedData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Translation failed:", error);
    return {
      success: false,
      targetLanguage: langMap[targetLanguage],
      translatedData: data,
      timestamp: new Date().toISOString()
    };
  }
};

export const translateInterface = async (
  interfaceStrings: Record<string, string>,
  targetLanguage: Language
): Promise<Record<string, string>> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const stringsList = Object.entries(interfaceStrings)
      .map(([key, value]) => `${key}: "${value}"`)
      .join('\n');

    const prompt = `You are a professional translator for a Christian evangelism platform. Translate the following interface strings to ${langMap[targetLanguage]}.

RULES:
- Keep translations concise (under 50 chars when possible)
- Maintain professional tone
- Preserve HTML/formatting markers if present
- Return valid JSON with same keys

**Strings to translate**:
${stringsList}

**Response** (valid JSON):
{
  "key": "translated_value"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }]
    });

    const responseText = response.text || '{}';
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return interfaceStrings;
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Interface translation failed:", error);
    return interfaceStrings;
  }
};

export const generateStructuredTranslationOutput = async (
  interfaceTexts: Record<string, string>,
  userData: TranslatableUserData,
  targetLanguage: Language,
  userRole: 'admin' | 'leader' | 'evangelist' | 'intercessor'
) => {
  const [translatedInterface, translatedUserData] = await Promise.all([
    translateInterface(interfaceTexts, targetLanguage),
    translateUserData(userData, targetLanguage)
  ]);

  // Role-based permissions
  const permissionsByRole = {
    admin: ['schedule_evangelism', 'create_training', 'upload_files', 'upload_recordings', 'approve_applications'],
    leader: ['approve_applications', 'manage_team', 'submit_testimony'],
    evangelist: ['apply_evangelism', 'submit_testimony'],
    intercessor: ['submit_testimony', 'create_prayer_agenda']
  };

  return {
    interface: translatedInterface,
    dados_traduzidos: translatedUserData.translatedData,
    permissoes: {
      ADM: permissionsByRole.admin,
      Lider: permissionsByRole.leader,
      Evangelista: permissionsByRole.evangelist,
      Intercessor: permissionsByRole.intercessor
    },
    metadata: {
      targetLanguage: langMap[targetLanguage],
      userRole,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
  };
};
