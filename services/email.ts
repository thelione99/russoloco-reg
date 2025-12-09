import emailjs from '@emailjs/browser';
import { Guest } from '../types';

export const sendApprovalEmail = async (guest: Guest) => {
  try {
    const templateParams = {
      to_name: `${guest.firstName} ${guest.lastName}`,
      to_email: guest.email,
      qr_code_value: guest.qrCode, // Inserisci questo nel template EmailJS
      event_date: '25 Dic 2025',
      // Puoi aggiungere un link al tuo sito:
      // ticket_link: `https://tuosito.com/#/ticket/${guest.id}`
    };

    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );
    console.log('Email inviata con successo a', guest.email);
  } catch (error) {
    console.error('Errore invio email:', error);
    throw error; // Rilancia l'errore per gestirlo nella UI se serve
  }
};
