import React, { useState } from 'react';
import { authAPI } from '../services/api';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<Props> = ({ open, onClose }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [next2, setNext2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!current || !next || !next2) {
      setError('Tüm alanlar zorunlu.');
      return;
    }
    if (next !== next2) {
      setError('Yeni şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword(current, next);
      setSuccess(true);
      setCurrent(''); setNext(''); setNext2('');
      setTimeout(() => { setSuccess(false); onClose(); }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Şifre değiştirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl"
          onClick={onClose}
          aria-label="Kapat"
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-4 text-black">Şifre Değiştir</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="password" className="border rounded px-3 py-2" placeholder="Mevcut Şifre" value={current} onChange={e => setCurrent(e.target.value)} required />
          <input type="password" className="border rounded px-3 py-2" placeholder="Yeni Şifre" value={next} onChange={e => setNext(e.target.value)} required />
          <input type="password" className="border rounded px-3 py-2" placeholder="Yeni Şifre (Tekrar)" value={next2} onChange={e => setNext2(e.target.value)} required />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">Şifre başarıyla değiştirildi.</div>}
          <button type="submit" className="bg-primary-gold text-white px-4 py-2 rounded shadow hover:bg-yellow-600 transition font-semibold mt-2" disabled={loading}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal; 