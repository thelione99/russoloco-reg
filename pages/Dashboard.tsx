import React, { useEffect, useState } from 'react';
import { getGuests, approveRequest, rejectRequest, resetData } from '../services/storage';
import { Guest, RequestStatus } from '../types';
import GlassPanel from '../components/GlassPanel';
import Button from '../components/Button';
import QRCode from 'react-qr-code';
import { Check, X, Search, RefreshCw, Trash2, Download } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filter, setFilter] = useState<'ALL' | RequestStatus>('ALL');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setGuests(getGuests().sort((a, b) => b.createdAt - a.createdAt));
  }, [refreshKey]);

  const handleRefresh = () => setRefreshKey(p => p + 1);

  const handleApprove = async (id: string) => {
    await approveRequest(id);
    handleRefresh();
  };

  const handleReject = async (id: string) => {
    await rejectRequest(id);
    handleRefresh();
  };
  
  const handleReset = () => {
      if(window.confirm('Cancellare tutto il database?')) {
          resetData();
          handleRefresh();
      }
  }

  const filteredGuests = guests.filter(g => 
    filter === 'ALL' ? true : g.status === filter
  );

  return (
    <div className="min-h-screen w-full bg-black p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>
            <p className="text-gray-400 text-sm">Gestione accessi e approvazioni</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleRefresh} className="p-3">
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button variant="danger" onClick={handleReset} className="p-3">
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['ALL', RequestStatus.PENDING, RequestStatus.APPROVED, RequestStatus.REJECTED].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`
                px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all border
                ${filter === f 
                  ? 'bg-red-600 border-red-500 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}
              `}
            >
              {f === 'ALL' ? 'TUTTI' : f}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="Totali" value={guests.length} />
          <StatsCard label="In Attesa" value={guests.filter(g => g.status === RequestStatus.PENDING).length} />
          <StatsCard label="Approvati" value={guests.filter(g => g.status === RequestStatus.APPROVED).length} />
          <StatsCard label="Entrati" value={guests.filter(g => g.isUsed).length} highlight />
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuests.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              Nessuna richiesta trovata.
            </div>
          ) : (
            filteredGuests.map(guest => (
              <GuestCard 
                key={guest.id} 
                guest={guest} 
                onApprove={() => handleApprove(guest.id)}
                onReject={() => handleReject(guest.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface StatsCardProps {
  label: string;
  value: number;
  highlight?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, highlight }) => (
  <GlassPanel className="p-4 flex flex-col items-center justify-center" intensity="low" borderRed={highlight}>
    <span className={`text-2xl font-bold ${highlight ? 'text-red-500' : 'text-white'}`}>{value}</span>
    <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
  </GlassPanel>
);

interface GuestCardProps {
  guest: Guest;
  onApprove: () => void;
  onReject: () => void;
}

const GuestCard: React.FC<GuestCardProps> = ({ guest, onApprove, onReject }) => {
  const isPending = guest.status === RequestStatus.PENDING;
  const isApproved = guest.status === RequestStatus.APPROVED;

  return (
    <GlassPanel className="p-6 flex flex-col gap-4 h-full relative group transition-all hover:border-white/20">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white">{guest.firstName} {guest.lastName}</h3>
          <p className="text-red-400 text-sm font-medium">@{guest.instagram.replace('@', '')}</p>
        </div>
        <Badge status={guest.status} isUsed={guest.isUsed} />
      </div>

      <div className="space-y-1 text-sm text-gray-400">
        <p className="flex items-center gap-2"><span className="w-16 opacity-50">Email:</span> {guest.email}</p>
        <p className="flex items-center gap-2">
          <span className="w-16 opacity-50">Data:</span> 
          {new Date(guest.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-white/5 flex gap-3">
        {isPending && (
          <>
            <Button variant="ghost" onClick={onReject} className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-950/30">
              <X className="w-4 h-4 mr-2" /> Rifiuta
            </Button>
            <Button variant="primary" onClick={onApprove} className="flex-1 py-2 text-sm">
              <Check className="w-4 h-4 mr-2" /> Approva
            </Button>
          </>
        )}
        
        {isApproved && (
           <div className="w-full flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
             <div className="bg-white p-2 rounded-lg">
                <QRCode 
                  value={guest.qrCode || ''} 
                  size={100} 
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 256 256`}
                />
             </div>
             <p className="text-xs text-green-400 flex items-center gap-1">
               <Check className="w-3 h-3" /> QR Inviato
             </p>
           </div>
        )}
      </div>
    </GlassPanel>
  );
};

const Badge = ({ status, isUsed }: { status: RequestStatus, isUsed: boolean }) => {
  if (isUsed) return <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs border border-green-500/30">ENTRATO</span>;
  
  switch(status) {
    case RequestStatus.APPROVED:
      return <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs border border-red-500/30">APPROVATO</span>;
    case RequestStatus.REJECTED:
      return <span className="px-2 py-1 rounded bg-gray-700/50 text-gray-400 text-xs border border-gray-600/30">RIFIUTATO</span>;
    default:
      return <span className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 text-xs border border-yellow-500/20">ATTESA</span>;
  }
};

export default Dashboard;