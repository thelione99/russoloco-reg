import { supabase } from './supabase';
import { sendApprovalEmail } from './email';
import { Guest, RequestStatus, ScanResult } from '../types';

// Helper per gestire gli errori
const handleError = (error: any) => {
  console.error('Supabase Error:', error);
  throw new Error(error.message);
};

export const getGuests = async (): Promise<Guest[]> => {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) handleError(error);
  return (data as Guest[]) || [];
};

export const createRequest = async (guestData: Omit<Guest, 'id' | 'status' | 'isUsed' | 'createdAt'>): Promise<void> => {
  const newGuest = {
    ...guestData,
    status: RequestStatus.PENDING,
    isUsed: false,
    createdAt: Date.now(),
  };

  const { error } = await supabase.from('guests').insert([newGuest]);
  if (error) handleError(error);
};

export const approveRequest = async (id: string): Promise<Guest | null> => {
  // 1. Aggiorna stato nel DB
  const { data, error } = await supabase
    .from('guests')
    .update({ 
      status: RequestStatus.APPROVED,
      qrCode: id // Usiamo l'ID come contenuto del QR
    })
    .eq('id', id)
    .select()
    .single();

  if (error) handleError(error);
  
  const updatedGuest = data as Guest;

  // 2. Invia Email Reale
  if (updatedGuest) {
     await sendApprovalEmail(updatedGuest);
  }
  
  return updatedGuest;
};

export const rejectRequest = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('guests')
    .update({ status: RequestStatus.REJECTED })
    .eq('id', id);

  if (error) handleError(error);
};

export const scanQRCode = async (qrContent: string): Promise<ScanResult> => {
  // Cerca l'ospite tramite ID (che è il contenuto del QR)
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('id', qrContent)
    .single();

  if (error || !data) {
    return { valid: false, message: 'QR NON VALIDO O NON TROVATO', type: 'error' };
  }

  const guest = data as Guest;

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

  // Segna come usato
  const { error: updateError } = await supabase
    .from('guests')
    .update({ isUsed: true, usedAt: Date.now() })
    .eq('id', guest.id);

  if (updateError) {
    return { valid: false, message: 'ERRORE AGGIORNAMENTO DB', type: 'error' };
  }

  return { valid: true, guest, message: 'ACCESSO CONSENTITO', type: 'success' };
};

export const resetData = async () => {
    // ATTENZIONE: Questo cancella tutto il DB reale!
    const { error } = await supabase.from('guests').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
    if (error) handleError(error);
};
