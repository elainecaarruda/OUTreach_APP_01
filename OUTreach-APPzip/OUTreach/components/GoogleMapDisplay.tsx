import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface GoogleMapDisplayProps {
  address: string;
  onLocationChange?: (lat: number, lng: number, address: string) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export const GoogleMapDisplay: React.FC<GoogleMapDisplayProps> = ({ address, onLocationChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [geocoder, setGeocoder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<any[]>([]);
  const previousAddressRef = useRef<string>('');

  // Inicializar mapa
  useEffect(() => {
    // Carregar a API do Google Maps
    const loadGoogleMaps = () => {
      if (window.google) {
        initMap();
      } else {
        // Se a API não estiver carregada, tentar carregar via script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo'}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        script.onerror = () => setError('Não foi possível carregar o Google Maps');
        document.head.appendChild(script);
      }
    };

    const initMap = () => {
      if (!mapRef.current) return;

      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 4,
        center: { lat: -15.7942, lng: -47.8822 }, // Centro do Brasil
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      const newGeocoder = new window.google.maps.Geocoder();
      setMap(newMap);
      setGeocoder(newGeocoder);
    };

    loadGoogleMaps();
  }, []);

  // Atualizar mapa quando o endereço mudar (com debounce para evitar múltiplas requisições)
  useEffect(() => {
    if (!map || !geocoder || !address) return;

    // Evitar requisições repetidas para o mesmo endereço
    if (previousAddressRef.current === address) return;
    previousAddressRef.current = address;

    // Aguardar 1 segundo após o usuário parar de digitar
    const timer = setTimeout(() => {
      setIsLoading(true);
      setError(null);

      // Limpar marcadores antigos
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      geocoder.geocode({ address }, (results: any, status: any) => {
        setIsLoading(false);

        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          
          // Atualizar centro do mapa
          map.setCenter(location);
          map.setZoom(15);

          // Adicionar marcador com animação
          const marker = new window.google.maps.Marker({
            map,
            position: location,
            title: address,
            animation: window.google.maps.Animation.DROP,
          });

          markersRef.current.push(marker);

          // Chamar callback com coordenadas
          if (onLocationChange) {
            onLocationChange(location.lat(), location.lng(), results[0].formatted_address);
          }
        } else if (status === 'ZERO_RESULTS') {
          setError('Endereço não encontrado. Tente ser mais específico.');
        } else {
          setError('Erro ao localizar. Tente novamente.');
        }
      });
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timer);
  }, [address, map, geocoder, onLocationChange]);

  return (
    <div className="space-y-3">
      {/* Container do mapa com estado de carregamento */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-72 rounded-2xl border-2 border-slate-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          style={{
            backgroundColor: '#f0f0f0',
          }}
        />

        {/* Overlay de carregamento */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-2xl backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-lg">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <p className="text-sm text-blue-600 font-medium">Localizando...</p>
            </div>
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Dica de sucesso */}
      {!error && address && !isLoading && (
        <p className="text-xs text-green-600 text-center font-medium">
          ✓ Localização encontrada
        </p>
      )}
    </div>
  );
};
