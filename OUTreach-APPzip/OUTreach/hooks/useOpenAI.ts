import { useState } from 'react';

export const useOpenAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const improveTestimonyText = async (text: string, language: string = 'pt-BR'): Promise<string> => {
    setIsProcessing(true);
    try {
      console.log('📤 Enviando requisição para melhorar texto em', language);
      
      const response = await fetch('/api/improve-testimony', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language }),
      });

      console.log('📥 Resposta do servidor:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro da API:', errorData);
        throw new Error(`Erro ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('✅ Texto melhorado com sucesso');
      return data.improvedText || text;
    } catch (error) {
      console.error('❌ Erro ao melhorar texto:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, improveTestimonyText };
};
