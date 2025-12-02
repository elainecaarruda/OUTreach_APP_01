import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePersonValidation } from '../hooks/usePersonValidation';
import { GoogleMapDisplay } from './GoogleMapDisplay';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../i18n';

interface PersonDetailsFormProps {
  personData: {
    id: string;
    name: string;
    nationality: string;
    religion?: string;
    phone?: string;
    email?: string;
    instagram?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    living_in_europe?: boolean;
    never_heard_jesus?: boolean;
  };
  onUpdate: (field: string, value: any) => void;
}

const RELIGION_OPTIONS = [
  'Católica',
  'Protestante',
  'Espírita',
  'Evangélica',
  'Ateia/Agnóstica',
  'Outra'
];

// Mapa de países com bandeiras (emojis)
const COUNTRIES_WITH_FLAGS = {
  'Afeganistão': '🇦🇫', 'Albânia': '🇦🇱', 'Argélia': '🇩🇿', 'Andorra': '🇦🇩', 'Angola': '🇦🇴', 'Argentina': '🇦🇷', 'Austrália': '🇦🇺', 'Áustria': '🇦🇹',
  'Bahamas': '🇧🇸', 'Bahrein': '🇧🇭', 'Bangladexe': '🇧🇩', 'Barbados': '🇧🇧', 'Bélgica': '🇧🇪', 'Belize': '🇧🇿', 'Benin': '🇧🇯', 'Birmânia': '🇲🇲', 'Bolívia': '🇧🇴', 'Bósnia e Herzegovina': '🇧🇦', 'Brasil': '🇧🇷', 'Brunei': '🇧🇳', 'Bulgária': '🇧🇬', 'Burquina Faso': '🇧🇫', 'Burundi': '🇧🇮',
  'Butão': '🇧🇹', 'Cabo Verde': '🇨🇻', 'Camarões': '🇨🇲', 'Camboja': '🇰🇭', 'Canadá': '🇨🇦', 'Catar': '🇶🇦', 'Cazaquistão': '🇰🇿', 'Chade': '🇹🇩', 'Chile': '🇨🇱', 'China': '🇨🇳', 'Chipre': '🇨🇾', 'Cingapura': '🇸🇬', 'Colômbia': '🇨🇴', 'Congo': '🇨🇬',
  'Coréia do Sul': '🇰🇷', 'Costa Rica': '🇨🇷', 'Costa do Marfim': '🇨🇮', 'Croácia': '🇭🇷', 'Cuba': '🇨🇺',
  'Dinamarca': '🇩🇰', 'Djibuti': '🇩🇯', 'Dominica': '🇩🇲',
  'Egito': '🇪🇬', 'Emirados Árabes Unidos': '🇦🇪', 'Equador': '🇪🇨', 'Eritreia': '🇪🇷', 'Eslováquia': '🇸🇰', 'Eslovênia': '🇸🇮', 'Espanha': '🇪🇸', 'Estados Unidos': '🇺🇸', 'Estônia': '🇪🇪', 'Etiópia': '🇪🇹',
  'Fiji': '🇫🇯', 'Filipinas': '🇵🇭', 'Finlândia': '🇫🇮', 'França': '🇫🇷',
  'Gabão': '🇬🇦', 'Gâmbia': '🇬🇲', 'Gana': '🇬🇭', 'Geórgia': '🇬🇪', 'Grécia': '🇬🇷', 'Granada': '🇬🇩', 'Guiana': '🇬🇾', 'Guiana Francesa': '🇬🇫', 'Guiné': '🇬🇳', 'Guiné-Bissau': '🇬🇼',
  'Haiti': '🇭🇹', 'Honduras': '🇭🇳', 'Hong Kong': '🇭🇰', 'Hungria': '🇭🇺',
  'Iêmen': '🇾🇪', 'Índia': '🇮🇳', 'Indonésia': '🇮🇩', 'Inglaterra': '🇬🇧', 'Irã': '🇮🇷', 'Iraque': '🇮🇶', 'Irlanda': '🇮🇪', 'Islândia': '🇮🇸', 'Israel': '🇮🇱', 'Itália': '🇮🇹',
  'Jamaica': '🇯🇲', 'Japão': '🇯🇵', 'Jordânia': '🇯🇴',
  'Kiribati': '🇰🇮', 'Kuwait': '🇰🇼',
  'Laos': '🇱🇦', 'Lesoto': '🇱🇸', 'Letônia': '🇱🇻', 'Líbano': '🇱🇧', 'Libéria': '🇱🇷', 'Líbia': '🇱🇾', 'Liechtenstein': '🇱🇮', 'Lituânia': '🇱🇹', 'Luxemburgo': '🇱🇺',
  'Macau': '🇲🇴', 'Macedônia': '🇲🇰', 'Madagascar': '🇲🇬', 'Malásia': '🇲🇾', 'Malaui': '🇲🇼', 'Maldivas': '🇲🇻', 'Mali': '🇲🇱', 'Malta': '🇲🇹', 'Marrocos': '🇲🇦', 'Maurício': '🇲🇺', 'Mauritânia': '🇲🇷', 'México': '🇲🇽', 'Micronésia': '🇫🇲', 'Moçambique': '🇲🇿', 'Moldávia': '🇲🇩', 'Mônaco': '🇲🇨', 'Mongólia': '🇲🇳', 'Montenegro': '🇲🇪', 'Myanmar': '🇲🇲',
  'Namíbia': '🇳🇦', 'Nauru': '🇳🇷', 'Nepal': '🇳🇵', 'Nicarágua': '🇳🇮', 'Níger': '🇳🇪', 'Nigéria': '🇳🇬', 'Niue': '🇳🇺', 'Noruega': '🇳🇴', 'Nova Caledônia': '🇳🇨', 'Nova Zelândia': '🇳🇿',
  'Omã': '🇴🇲',
  'Países Baixos': '🇳🇱', 'Palau': '🇵🇼', 'Panamá': '🇵🇦', 'Papua Nova Guiné': '🇵🇬', 'Paquistão': '🇵🇰', 'Paraguai': '🇵🇾', 'Peru': '🇵🇪', 'Polinésia Francesa': '🇵🇫', 'Polônia': '🇵🇱', 'Porto Rico': '🇵🇷', 'Portugal': '🇵🇹',
  'Qatar': '🇶🇦', 'Quênia': '🇰🇪', 'Quirguistão': '🇰🇬',
  'Reino Unido': '🇬🇧', 'República Centro-Africana': '🇨🇫', 'República Checa': '🇨🇿', 'República Democrática do Congo': '🇨🇩', 'República Dominicana': '🇩🇴', 'Reunião': '🇷🇪', 'Romênia': '🇷🇴', 'Ruanda': '🇷🇼', 'Rússia': '🇷🇺',
  'Saara Ocidental': '🇪🇭', 'Samoa': '🇼🇸', 'San Marino': '🇸🇲', 'Santa Lúcia': '🇱🇨', 'São Cristóvão e Neves': '🇰🇳', 'São Marino': '🇸🇲', 'São Tomé e Príncipe': '🇸🇹', 'São Vicente e Granadinas': '🇻🇨', 'Senegal': '🇸🇳', 'Serra Leoa': '🇸🇱', 'Sérvia': '🇷🇸', 'Singapura': '🇸🇬', 'Síria': '🇸🇾', 'Somalândia': '🇸🇴', 'Somália': '🇸🇴', 'Sri Lanca': '🇱🇰', 'Suazilândia': '🇸🇿', 'Sudão': '🇸🇩', 'Suécia': '🇸🇪', 'Suíça': '🇨🇭', 'Surinã': '🇸🇷',
  'Tailândia': '🇹🇭', 'Taiwan': '🇹🇼', 'Tajiquistão': '🇹🇯', 'Tanzânia': '🇹🇿', 'Tchade': '🇹🇩', 'Terras Austrais Francesas': '🇹🇫', 'Timor-Leste': '🇹🇱', 'Togo': '🇹🇬', 'Tonga': '🇹🇴', 'Trindade e Tobago': '🇹🇹', 'Tunísia': '🇹🇳', 'Turcomenistão': '🇹🇲', 'Turquia': '🇹🇷', 'Tuvalu': '🇹🇻',
  'Ucrânia': '🇺🇦', 'Uganda': '🇺🇬', 'Uruguai': '🇺🇾', 'Usbequistão': '🇺🇿',
  'Vanuatu': '🇻🇺', 'Vaticano': '🇻🇦', 'Venezuela': '🇻🇪', 'Vietnã': '🇻🇳',
  'Zâmbia': '🇿🇲', 'Zimbabué': '🇿🇼'
};

// Lista de países para autocomplete
const COUNTRIES_LIST = Object.keys(COUNTRIES_WITH_FLAGS);

// Componentes de formulário simples (embutidos)
const Input = (props: any) => (
  <input 
    {...props} 
    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm font-medium bg-white ${props.className || 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'}`} 
  />
);

const Label = ({ children, required = false, className = '' }: any) => (
  <label className={`block text-xs font-bold text-slate-700 ${className}`}>
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

export const PersonDetailsForm: React.FC<PersonDetailsFormProps> = ({ personData, onUpdate }) => {
  const { t } = useLanguage();
  const { errors, validateField } = usePersonValidation();
  const [showMap, setShowMap] = useState(false);
  const [nationalitySuggestions, setNationalitySuggestions] = useState<string[]>([]);
  const [showNationalitySuggestions, setShowNationalitySuggestions] = useState(false);

  // Manipular mudanças de campo com validação
  const handleFieldChange = (field: string, value: any) => {
    onUpdate(field, value);

    // Autocomplete de nacionalidade
    if (field === 'nationality') {
      if (value.length > 0) {
        const filtered = COUNTRIES_LIST.filter(c => 
          c.toLowerCase().startsWith(value.toLowerCase())
        ).slice(0, 5);
        setNationalitySuggestions(filtered);
        setShowNationalitySuggestions(true);
      } else {
        setShowNationalitySuggestions(false);
      }
    }

    // Validar se for campo de contato
    if (field === 'phone') validateField('phone', value);
    if (field === 'email') validateField('email', value);
    if (field === 'instagram') validateField('instagram', value);
  };

  // Selecionar sugestão de nacionalidade
  const handleSelectNationality = (country: string) => {
    onUpdate('nationality', country);
    setShowNationalitySuggestions(false);
  };

  return (
    <div className="space-y-6">
      {/* Seção: Informações Obrigatórias */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
        <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
          {t('testimony_section_required_info' as TranslationKey)}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nome */}
          <div>
            <Label required className="mb-2 text-xs font-bold">
              {t('testimony_form_full_name' as TranslationKey)}
            </Label>
            <Input
              placeholder="João Silva"
              value={personData.name}
              onChange={(e: any) => handleFieldChange('name', e.target.value)}
              className="rounded-xl border-2 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Nacionalidade com Autocomplete */}
          <div className="relative">
            <Label required className="mb-2 text-xs font-bold">
              {t('testimony_nationality' as TranslationKey)}
            </Label>
            <Input
              placeholder="Brasil, Portugal, etc."
              value={personData.nationality}
              onChange={(e: any) => handleFieldChange('nationality', e.target.value)}
              onFocus={() => personData.nationality && setShowNationalitySuggestions(true)}
              className="rounded-xl border-2 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            
            {/* Sugestões de Nacionalidade */}
            {showNationalitySuggestions && nationalitySuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-indigo-200 rounded-xl shadow-lg">
                {nationalitySuggestions.map((country, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectNationality(country)}
                    className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 text-sm text-slate-700 border-b border-slate-100 last:border-b-0 transition-colors font-medium flex items-center gap-2"
                  >
                    <span className="text-lg">{COUNTRIES_WITH_FLAGS[country as keyof typeof COUNTRIES_WITH_FLAGS]}</span>
                    {country}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seção: Situação */}
      <div className="space-y-3 p-6 bg-white rounded-2xl border border-slate-200">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t('testimony_section_situation' as TranslationKey)}</p>
        
        <label className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all group/label ${
          personData.living_in_europe ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
        }`}>
          <input
            type="checkbox"
            className="hidden"
            checked={personData.living_in_europe || false}
            onChange={(e) => handleFieldChange('living_in_europe', e.target.checked)}
          />
          {personData.living_in_europe ? (
            <CheckCircle2 size={18} className="text-indigo-700" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover/label:border-slate-400" />
          )}
          <span className="text-sm font-bold">{t('testimony_form_living_europe' as TranslationKey)}</span>
        </label>

        <label className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all group/label ${
          personData.never_heard_jesus ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-inner' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
        }`}>
          <input
            type="checkbox"
            className="hidden"
            checked={personData.never_heard_jesus || false}
            onChange={(e) => handleFieldChange('never_heard_jesus', e.target.checked)}
          />
          {personData.never_heard_jesus ? (
            <CheckCircle2 size={18} className="text-indigo-700" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover/label:border-slate-400" />
          )}
          <span className="text-sm font-bold">{t('testimony_form_never_heard_jesus' as TranslationKey)}</span>
        </label>
      </div>

      {/* Seção: Religião */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200">
        <Label className="mb-3 text-xs font-bold uppercase tracking-wider block">{t('testimony_section_religion' as TranslationKey)}</Label>
        <select
          value={personData.religion || ''}
          onChange={(e) => handleFieldChange('religion', e.target.value)}
          className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none font-medium transition-all hover:border-slate-300"
        >
          <option value="">👉 {t('testimony_form_religion_select' as TranslationKey)}</option>
          {RELIGION_OPTIONS.map(religion => (
            <option key={religion} value={religion}>
              {religion}
            </option>
          ))}
        </select>
      </div>

      {/* Seção: Contato */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
        <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
          {t('testimony_section_contact' as TranslationKey)}
        </h4>

        <div className="space-y-4">
          {/* Telefone */}
          <div>
            <Label className="mb-2 text-xs font-bold">
              {t('testimony_form_phone' as TranslationKey)}
            </Label>
            <p className="text-xs text-slate-500 mb-2">Formato: +55 (11) 91234-5678</p>
            <Input
              placeholder="+55 (11) 91234-5678"
              value={personData.phone || ''}
              onChange={(e: any) => handleFieldChange('phone', e.target.value)}
              className={`rounded-xl border-2 focus:ring-indigo-500 ${
                errors.phone ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.phone && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                <AlertCircle size={14} />
                {errors.phone}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <Label className="mb-2 text-xs font-bold">{t('testimony_form_email' as TranslationKey)}</Label>
            <Input
              type="email"
              placeholder="exemplo@email.com"
              value={personData.email || ''}
              onChange={(e: any) => handleFieldChange('email', e.target.value)}
              className={`rounded-xl border-2 focus:ring-indigo-500 ${
                errors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.email && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                <AlertCircle size={14} />
                {errors.email}
              </div>
            )}
          </div>

          {/* Instagram */}
          <div>
            <Label className="mb-2 text-xs font-bold">{t('testimony_form_instagram' as TranslationKey)}</Label>
            <p className="text-xs text-slate-500 mb-2">@username</p>
            <Input
              placeholder="@usuario"
              value={personData.instagram || ''}
              onChange={(e: any) => handleFieldChange('instagram', e.target.value)}
              className={`rounded-xl border-2 focus:ring-indigo-500 ${
                errors.instagram ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.instagram && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                <AlertCircle size={14} />
                {errors.instagram}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seção: Endereço com Mapa */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 bg-green-600 rounded-full"></span>
          {t('testimony_section_address' as TranslationKey)}
        </h4>

        {/* Campo de Endereço */}
        <div className="mb-4">
          <Input
            placeholder="Rua, número, cidade, estado, CEP"
            value={personData.address || ''}
            onChange={(e: any) => handleFieldChange('address', e.target.value)}
            className="rounded-xl border-2 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Mapa do Google - Mostra automaticamente quando há endereço */}
        {personData.address && (
          <GoogleMapDisplay
            address={personData.address}
            onLocationChange={(lat, lng, formattedAddress) => {
              onUpdate('latitude', lat);
              onUpdate('longitude', lng);
              onUpdate('address', formattedAddress);
            }}
          />
        )}
      </div>
    </div>
  );
};
