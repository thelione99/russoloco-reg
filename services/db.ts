import { Guest } from '../types';

const DB_KEY = 'russoloco_guests';

// Helper per simulare ritardo di rete
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
  getGuests: (): Guest[] => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  register: async (guest: Omit<Guest, 'id' | 'status' | 'registrationDate'>): Promise<Guest> => {
    await delay(800); // Fake loading
    const guests = db.getGuests();
    const newGuest: Guest = {
      ...guest,
      id: crypto.randomUUID(),
      status: 'pending',
      registrationDate: new Date().toISOString(),
    };
    guests.push(newGuest);
    localStorage.setItem(DB_KEY, JSON.stringify(guests));
    return newGuest;
  },

  approve: async (id: string): Promise<void> => {
    await delay(1000); // Simulazione invio email
    const guests = db.getGuests();
    const index = guests.findIndex(g => g.id === id);
    if (index !== -1) {
      guests[index].status = 'approved';
      localStorage.setItem(DB_KEY, JSON.stringify(guests));
      
      // QUI AVVERREBBE IL VERO INVIO EMAIL con SendGrid/Resend
      console.log(`📧 EMAIL INVIATA A: ${guests[index].email}`);
      console.log(`Oggetto: Sei dentro RUSSOLOCO. QR: ${guests[index].id}`);
    }
  },

  reject: async (id: string): Promise<void> => {
    await delay(500);
    const guests = db.getGuests();
    const index = guests.findIndex(g => g.id === id);
    if (index !== -1) {
      guests[index].status = 'rejected';
      localStorage.setItem(DB_KEY, JSON.stringify(guests));
    }
  },

  checkIn: async (id: string): Promise<{ success: boolean; message: string; guest?: Guest }> => {
    const guests = db.getGuests();
    const index = guests.findIndex(g => g.id === id);
    
    if (index === -1) return { success: false, message: 'Ospite non trovato.' };
    
    const guest = guests[index];
    
    if (guest.status === 'pending') return { success: false, message: 'Registrazione non approvata.' };
    if (guest.status === 'rejected') return { success: false, message: 'Ingresso rifiutato.' };
    if (guest.status === 'checked_in') return { success: false, message: 'Ospite già entrato!', guest };
    
    // Aggiorna stato
    guests[index].status = 'checked_in';
    localStorage.setItem(DB_KEY, JSON.stringify(guests));
    
    return { success: true, message: 'Accesso Consentito.', guest: guests[index] };
  }
};