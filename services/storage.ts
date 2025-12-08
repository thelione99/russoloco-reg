import { Guest, RequestStatus, ScanResult } from '../types';

const STORAGE_KEY = 'velvet_access_guests';

// Helper to simulate delay for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getGuests = (): Guest[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveGuests = (guests: Guest[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
};

export const createRequest = async (guest: Omit<Guest, 'id' | 'status' | 'isUsed' | 'createdAt'>): Promise<void> => {
  await delay(500);
  const guests = getGuests();
  const newGuest: Guest = {
    ...guest,
    id: crypto.randomUUID(),
    status: RequestStatus.PENDING,
    isUsed: false,
    createdAt: Date.now(),
  };
  guests.push(newGuest);
  saveGuests(guests);
};

export const approveRequest = async (id: string): Promise<Guest | null> => {
  await delay(300);
  const guests = getGuests();
  const guestIndex = guests.findIndex(g => g.id === id);
  
  if (guestIndex === -1) return null;

  // Generate QR content (using the ID for security/uniqueness)
  guests[guestIndex].status = RequestStatus.APPROVED;
  guests[guestIndex].qrCode = guests[guestIndex].id; 
  
  saveGuests(guests);
  
  // Simulate sending email/whatsapp
  console.log(`[NOTIFICATION] Sending approval to ${guests[guestIndex].email} via WhatsApp/Email with QR code.`);
  
  return guests[guestIndex];
};

export const rejectRequest = async (id: string): Promise<void> => {
  await delay(300);
  const guests = getGuests();
  const guestIndex = guests.findIndex(g => g.id === id);
  
  if (guestIndex !== -1) {
    guests[guestIndex].status = RequestStatus.REJECTED;
    saveGuests(guests);
  }
};

export const scanQRCode = async (qrContent: string): Promise<ScanResult> => {
  await delay(400); // Simulate network check
  const guests = getGuests();
  const guestIndex = guests.findIndex(g => g.id === qrContent);

  if (guestIndex === -1) {
    return { valid: false, message: 'QR NON VALIDO', type: 'error' };
  }

  const guest = guests[guestIndex];

  if (guest.status !== RequestStatus.APPROVED) {
    return { valid: false, message: 'ACCESSO NEGATO (Non Approvato)', type: 'error' };
  }

  if (guest.isUsed) {
    return { 
      valid: false, 
      guest, 
      message: `GIÀ UTILIZZATO: ${new Date(guest.usedAt!).toLocaleTimeString()}`, 
      type: 'warning' 
    };
  }

  // Mark as used
  guests[guestIndex].isUsed = true;
  guests[guestIndex].usedAt = Date.now();
  saveGuests(guests);

  return { valid: true, guest: guests[guestIndex], message: 'ACCESSO CONSENTITO', type: 'success' };
};

export const resetData = () => {
  localStorage.removeItem(STORAGE_KEY);
};