import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Guest } from '../types';
import { Check, X, RefreshCw, Mail } from 'lucide-react';

const Dashboard = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'checked_in'>('all');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const loadGuests = () => {
    setGuests(db.getGuests().reverse()); // I più recenti prima
  };

  useEffect(() => {
    loadGuests();
  }, []);

  const handleApprove = async (id: string) => {
    setLoadingAction(id);
    await db.approve(id);
    loadGuests();
    setLoadingAction(null);
    // Visual feedback che l'email è stata "inviata"
    alert("Utente approvato! Email di conferma inviata (simulazione).");
  };

  const handleReject = async (id: string) => {
    setLoadingAction(id);
    await db.reject(id);
    loadGuests();
    setLoadingAction(null);
  };

  const filteredGuests = guests.filter(g => {
    if (filter === 'all') return true;
    return g.status === filter;
  });

  return (
    <div className="min-h-screen p-6 pb-24 bg-black">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <button onClick={loadGuests} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
          <RefreshCw size={20} />
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-neutral-900/50 border border-white/5 p-4 rounded-2xl">
          <div className="text-white/40 text-xs uppercase mb-1">Totale Richieste</div>
          <div className="text-2xl font-bold">{guests.length}</div>
        </div>
        <div className="bg-neutral-900/50 border border-white/5 p-4 rounded-2xl">
          <div className="text-white/40 text-xs uppercase mb-1">Approvati</div>
          <div className="text-2xl font-bold text-green-500">{guests.filter(g => g.status === 'approved' || g.status === 'checked_in').length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {['all', 'pending', 'approved', 'checked_in'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === f 
                ? 'bg-red-600 text-white' 
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredGuests.length === 0 ? (
          <div className="text-center text-white/30 py-10">Nessun ospite trovato</div>
        ) : (
          filteredGuests.map(guest => (
            <div key={guest.id} className="bg-neutral-900/80 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">{guest.name}</h3>
                <p className="text-sm text-white/50">{guest.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {guest.instagram && <span className="text-xs text-blue-400">@{guest.instagram}</span>}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold
                    ${guest.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : ''}
                    ${guest.status === 'approved' ? 'bg-green-500/20 text-green-500' : ''}
                    ${guest.status === 'rejected' ? 'bg-red-500/20 text-red-500' : ''}
                    ${guest.status === 'checked_in' ? 'bg-blue-500/20 text-blue-500' : ''}
                  `}>
                    {guest.status}
                  </span>
                </div>
              </div>

              {guest.status === 'pending' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleReject(guest.id)}
                    disabled={loadingAction === guest.id}
                    className="p-2 bg-red-900/30 text-red-500 rounded-full hover:bg-red-900/50"
                  >
                    <X size={20} />
                  </button>
                  <button 
                    onClick={() => handleApprove(guest.id)}
                    disabled={loadingAction === guest.id}
                    className="p-2 bg-green-900/30 text-green-500 rounded-full hover:bg-green-900/50 relative"
                  >
                    {loadingAction === guest.id ? <RefreshCw className="animate-spin" size={20} /> : <Check size={20} />}
                  </button>
                </div>
              )}
               {guest.status === 'approved' && (
                  <div className="p-2 text-white/20">
                    <Mail size={16} />
                  </div>
               )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;