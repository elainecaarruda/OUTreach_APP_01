import { useState } from 'react';

export interface TestimonyOutput {
  titulo: string;
  data: string;
  nome: string;
  nacionalidade: string;
  decisao: string;
  narrativa: string;
  // Legacy fields for compatibility
  idade?: string;
  cidade?: string;
  contexto_inicial?: string;
  desafio?: string;
  experiencia_transformadora?: string;
  resultado?: string;
  mensagem_final?: string;
  hashtags?: string[];
  tipo_de_texto?: string[];
  resumo_social_media?: string;
  resumo_newsletter?: string;
  resumo_mural?: string;
}

export const useTestimonyGenerator = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const generateTestimonyOutput = async (formData: any, language: string = 'pt-BR'): Promise<TestimonyOutput> => {
    setIsProcessing(true);
    try {
      const prompt = `Você é um escritor especializado em redação de testemunhos com padrões internacionais de qualidade.

DADOS FORNECIDOS DO TESTEMUNHO:
- Nome: ${formData.people_profiles?.[0]?.name || 'Pessoa impactada'}
- Idade: ${formData.people_profiles?.[0]?.age || 'não informada'}
- Localização: ${formData.people_profiles?.[0]?.city || formData.location || 'não informada'}
- Contexto inicial: ${formData.initial_context || 'Não informado'}
- Abordagem: ${formData.during_approach || 'Não informado'}
- Testemunho: ${formData.testimony_witnessed || 'Não informado'}
- Eventos durante encontro: ${formData.events_during?.join(', ') || 'Não informado'}
- Decisões/Resultados: ${formData.people_profiles?.flatMap((p: any) => p.decisions || []).join(', ') || 'Não informado'}
- Data: ${formData.date || 'não informada'}
- Evangelismo: ${formData.evangelismoId || 'não informado'}

TAREFA: Gere um JSON estruturado com:
1. "resumo_mural": Um texto fluido em forma de redação (prosa corrida, SEM tópicos) de 800-1200 caracteres. Deve contar a história completa e impactante do testemunho, mantendo coerência narrativa e seguindo padrões internacionais de escrita. Deve ser inspirador, espiritual, e escrito de forma natural e humanizada.
2. "resumo_social_media": Texto de 280 caracteres para redes sociais (direto, viral, impactante)
3. "resumo_newsletter": Texto de 500-800 caracteres para newsletter (detalhado, inspirador)
4. "hashtags": Array com 4-5 hashtags relevantes
5. Dados básicos: "nome", "idade", "cidade"

EXEMPLO de "resumo_mural" (formato desejado - PROSA FLUIDA SEM TÓPICOS):
"Durante um dia ordinário, um encontro extraordinário transformou completamente a vida de uma jovem mulher. Ela estava perdida nas ruas do centro da cidade, acompanhada de desafios que parecia não conseguir superar sozinha. Quando nossa equipe de evangelismo se aproximou, havia esperança e compaixão nos olhos que a miravam. Naquele momento sagrado, enquanto oravam juntos, algo profundo aconteceu - ela sentiu a presença divina tocando seu coração. As lágrimas fluíram, não mais de desespero, mas de libertação e paz. Hoje, essa jovem segue firme em sua fé, levando seu testemunho para transformar outras vidas. O que era impossível tornou-se realidade pelo poder transformador do Evangelho."

INSTRUÇÕES CRÍTICAS:
1. O "resumo_mural" DEVE ser um texto corrido em prosa, sem bullets, números ou estrutura de tópicos
2. Manter essência espiritual, emocional e humanizada
3. Usar linguagem acessível mas refinada (padrão internacional)
4. Contar uma história coerente e impactante
5. Retornar APENAS o JSON válido, sem explicações adicionais

JSON:`;

      const response = await fetch('/api/improve-testimony', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Mode': 'json-structured',
        },
        body: JSON.stringify({ 
          text: prompt,
          isStructured: true 
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      let improvedText = data.improvedText || '';
      
      try {
        const jsonMatch = improvedText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : improvedText;
        const parsedOutput = JSON.parse(jsonStr);
        return parsedOutput as TestimonyOutput;
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError);
        return {
          nome: formData.testimony_title || 'Testemunho',
          contexto_inicial: formData.initial_context || '',
          desafio: formData.during_approach || '',
          experiencia_transformadora: formData.testimony_witnessed || '',
          resultado: formData.events_during?.join(', ') || '',
          mensagem_final: 'Testemunho de transformação espiritual',
          hashtags: ['#Testemunho', '#Superação', '#Fé'],
          tipo_de_texto: ['social_media', 'newsletter', 'mural'],
        };
      }
    } catch (error) {
      console.error('Erro ao gerar testemunho:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, generateTestimonyOutput };
};
