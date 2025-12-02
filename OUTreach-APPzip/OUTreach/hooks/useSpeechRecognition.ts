import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionProps {
  language?: string;
}

export const useSpeechRecognition = (props?: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const finalTranscriptRef = useRef('');
  const currentLanguage = props?.language || 'pt-BR';

  const startListening = useCallback(async () => {
    try {
      // Check browser support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        throw new Error('Seu navegador não suporta a função de ditado.');
      }

      // Request microphone permission first
      if (!mediaStreamRef.current) {
        try {
          mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('✅ Microfone permitido e pronto');
        } catch (error: any) {
          console.error('❌ Erro ao acessar microfone:', error);
          if (error.name === 'NotAllowedError') {
            throw new Error('Permissão do microfone negada. Ative o microfone nas configurações do seu navegador.');
          } else if (error.name === 'NotFoundError') {
            throw new Error('Nenhum microfone detectado no seu dispositivo.');
          }
          throw error;
        }
      }

      // Reset transcripts
      transcriptRef.current = '';
      finalTranscriptRef.current = '';
      setTranscript('');

      // Initialize recognition if needed
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = currentLanguage;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.continuous = true;
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          console.log('✅ Speech recognition started - escute agora');
          setIsListening(true);
          finalTranscriptRef.current = '';
        };

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          
          // Process all results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptSegment = event.results[i][0].transcript;
            console.log(`📝 Resultado ${i}: "${transcriptSegment}" (final: ${event.results[i].isFinal})`);
            
            if (event.results[i].isFinal) {
              finalTranscriptRef.current += transcriptSegment + ' ';
            } else {
              interimTranscript += transcriptSegment;
            }
          }

          // Update transcript display (final + interim)
          const displayText = (finalTranscriptRef.current + interimTranscript).trim();
          setTranscript(displayText);
          console.log('📝 Texto atual:', displayText || '(aguardando áudio...)');
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('❌ Erro na gravação:', event.error);
          
          // Map common errors to user-friendly messages
          const errorMessages: Record<string, string> = {
            'no-speech': 'Nenhum som foi detectado. Verifique seu microfone e tente novamente.',
            'audio-capture': 'Erro ao capturar áudio. Verifique as permissões do microfone.',
            'network': 'Erro de conexão. Tente novamente.',
            'not-allowed': 'Permissão do microfone negada.',
            'bad-grammar': 'Erro na gramática de fala.'
          };
          
          const errorMessage = errorMessages[event.error] || `Erro: ${event.error}`;
          console.error('Erro mapeado:', errorMessage);
        };

        recognitionRef.current.onend = () => {
          console.log('🛑 Speech recognition encerrado');
          setIsListening(false);
          
          // Ensure we keep the final transcript
          const finalText = finalTranscriptRef.current.trim();
          if (finalText) {
            setTranscript(finalText);
            console.log('✅ Gravação finalizada. Texto:', finalText);
          } else {
            console.warn('⚠️ Nenhum áudio foi detectado. Tente novamente.');
          }
        };
      }

      // Update language before starting
      if (recognitionRef.current) {
        recognitionRef.current.lang = currentLanguage;
      }

      // Clear and start fresh
      finalTranscriptRef.current = '';
      console.log('🎤 Iniciando reconhecimento...');
      recognitionRef.current.start();
      
    } catch (error: any) {
      console.error('❌ Erro ao iniciar ditado:', error);
      setIsListening(false);
      throw error;
    }
  }, [currentLanguage]);

  const stopListening = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      console.log('🛑 Parando gravação...');
      setIsListening(false);
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Erro ao parar:', e);
        }
      }
      
      // Stop MediaStream to turn off microphone physically
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Microfone desligado');
        });
        mediaStreamRef.current = null;
      }
      
      // Wait a bit for onend event to fire
      setTimeout(() => {
        const finalText = finalTranscriptRef.current.trim();
        console.log('✅ Texto final capturado:', finalText || '(vazio)');
        resolve(finalText);
      }, 200);
    });
  }, []);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = '';
    finalTranscriptRef.current = '';
    setTranscript('');
    console.log('🔄 Transcript resetado');
  }, []);

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Microfone desligado');
        });
      }
    };
  }, []);

  return { isListening, transcript, startListening, stopListening, resetTranscript, isSupported };
};
