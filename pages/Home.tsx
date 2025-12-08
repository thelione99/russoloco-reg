import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Guest } from '../types';
import QRCode from 'react-qr-code';
import { Loader2, CheckCircle2, XCircle, Send } from 'lucide-react';

const Home = () => {
  const [formData, setFormData] = useState({ name: '', email: '', instagram: '' });
  const [loading, setLoading] = useState(false);
  const [registeredId, setRegisteredId] = useState<string | null>(localStorage.getItem('my_guest_id'));
  const [myGuestData, setMyGuestData] = useState<Guest | null>(null);

  // Poll per controllare se lo stato cambia (es. admin approva)
  useEffect(() => {
    if (!registeredId) return;

    const checkStatus = () => {
      const guests = db.getGuests();
      const me = guests.find(g => g.id === registeredId);
      if (me) setMyGuestData(me);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000); // Controlla ogni 3 secondi
    return () => clearInterval(interval);
  }, [registeredId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newGuest = await db.register(formData);
      localStorage.setItem('my_guest_id', newGuest.id);
      setRegisteredId(newGuest.id);
      setMyGuestData(newGuest);
    } catch (err) {
      alert('Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  if (myGuestData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/20 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -z-10" />

        <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center">
          <h1 className="text-3xl font-bold mb-2 tracking-tighter">RUSSOLOCO</h1>
          <p className="text-white/50 mb-8 text-sm uppercase tracking-widest">Guest Pass</p>

          <div className="mb-8 flex justify-center">
            {myGuestData.status === 'approved' || myGuestData.status === 'checked_in' ? (
              <div className="bg-white p-4 rounded-xl shadow-lg shadow-red-500/20">
                <QRCode 
                  value={myGuestData.id} 
                  size={200}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
            ) : myGuestData.status === 'pending' ? (
              <div className="w-48 h-48 rounded-full border-4 border-dashed border-yellow-500/50 flex items-center justify-center animate-pulse">
                <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-full border-4 border-red-500/50 flex items-center justify-center bg-red-500/10">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-medium">{myGuestData.name}</h2>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
              {myGuestData.status === 'approved' && <><CheckCircle2 size={16} className="text-green-500"/> <span className="text-green-500 text-sm font-bold uppercase">Approvato</span></>}
              {myGuestData.status === 'checked_in' && <><CheckCircle2 size={16} className="text-blue-500"/> <span className="text-blue-500 text-sm font-bold uppercase">Entrato</span></>}
              {myGuestData.status === 'pending' && <span className="text-yellow-500 text-sm font-bold uppercase">In Attesa</span>}
              {myGuestData.status === 'rejected' && <span className="text-red-500 text-sm font-bold uppercase">Rifiutato</span>}
            </div>
            
            {myGuestData.status === 'approved' && (
              <p className="text-xs text-white/40 mt-4">
                Mostra questo QR all'ingresso.<br/>Una mail di conferma è stata inviata a {myGuestData.email}.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
       {/* Background Aesthetics */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black italic tracking-tighter mb-2 bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent">
            RUSSOLOCO
          </h1>
          <p className="text-red-500 uppercase tracking-[0.3em] text-xs font-bold">Exclusive Event</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase text-white/60 font-bold tracking-wider ml-1">Nome Completo</label>
            <input 
              required
              type="text" 
              placeholder="Mario Rossi"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase text-white/60 font-bold tracking-wider ml-1">Email</label>
            <input 
              required
              type="email" 
              placeholder="mario@example.com"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase text-white/60 font-bold tracking-wider ml-1">Instagram (Opzionale)</label>
            <input 
              type="text" 
              placeholder="@username"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
              value={formData.instagram}
              onChange={e => setFormData({...formData, instagram: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-red-900/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Registrati <Send size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;