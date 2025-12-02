// Hook para validação de dados pessoais
import { useState } from 'react';

export interface ValidationErrors {
  phone?: string;
  email?: string;
  instagram?: string;
}

export const usePersonValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Validar formato de telefone: +55 (11) 91234-5678
  const validatePhone = (phone: string): string | null => {
    if (!phone) return null; // Campo opcional
    
    const phoneRegex = /^\+\d{1,3}\s\(\d{1,3}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      return 'Formato inválido. Use: +55 (11) 91234-5678';
    }
    return null;
  };

  // Validar email
  const validateEmail = (email: string): string | null => {
    if (!email) return null; // Campo opcional
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Email inválido. Verifique o formato.';
    }
    return null;
  };

  // Validar Instagram: deve começar com @
  const validateInstagram = (instagram: string): string | null => {
    if (!instagram) return null; // Campo opcional
    
    if (!instagram.startsWith('@')) {
      return 'Instagram deve começar com @. Ex: @usuario';
    }
    if (instagram.length < 2) {
      return 'Instagram inválido.';
    }
    return null;
  };

  // Validar todos os campos
  const validateAll = (data: {
    phone?: string;
    email?: string;
    instagram?: string;
  }): boolean => {
    const newErrors: ValidationErrors = {};

    if (data.phone) {
      const phoneError = validatePhone(data.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    if (data.email) {
      const emailError = validateEmail(data.email);
      if (emailError) newErrors.email = emailError;
    }

    if (data.instagram) {
      const instagramError = validateInstagram(data.instagram);
      if (instagramError) newErrors.instagram = instagramError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar campo individual
  const validateField = (field: 'phone' | 'email' | 'instagram', value: string) => {
    let error: string | null = null;

    switch (field) {
      case 'phone':
        error = validatePhone(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'instagram':
        error = validateInstagram(value);
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    return error === null;
  };

  return {
    errors,
    validatePhone,
    validateEmail,
    validateInstagram,
    validateAll,
    validateField,
    clearErrors: () => setErrors({})
  };
};
