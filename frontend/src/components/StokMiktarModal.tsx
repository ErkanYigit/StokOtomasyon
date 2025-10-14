import React, { useState, useEffect } from 'react';

interface StokMiktarModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (miktar: number, aciklama?: string) => Promise<void>;
  isEkle?: boolean;
  stokAdi?: string;
  birim?: string;
  loading?: boolean;
}

const StokMiktarModal: React.FC<StokMiktarModalProps> = ({ open, onClose, onSubmit, isEkle, stokAdi, birim, loading }) => {
  const [miktar, setMiktar] = useState<number>(0);
  const [aciklama, setAciklama] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setMiktar(0);
      setAciklama('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!miktar || miktar <= 0) {
      setError('Geçerli bir miktar giriniz.');
      return;
    }
    try {
      await onSubmit(miktar, aciklama);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Bir hata oluştu');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          disabled={loading}
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-4">{isEkle ? 'Stok Ekle' : 'Stok Çıkar'}</h2>
        <div className="mb-2 text-sm text-gray-600">{stokAdi} {birim && <span className="text-xs text-gray-400">({birim})</span>}</div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-3">{error}</div>}
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Miktar *</label>
            <input
              type="number"
              min={1}
              name="miktar"
              value={miktar}
              onChange={e => setMiktar(Number(e.target.value))}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Açıklama</label>
            <textarea
              name="aciklama"
              value={aciklama}
              onChange={e => setAciklama(e.target.value)}
              className="input-field"
              rows={2}
            />
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="btn-outline mr-2"
              onClick={onClose}
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className={isEkle ? 'btn-primary' : 'btn-secondary'}
              disabled={loading}
            >
              {loading ? (isEkle ? 'Ekleniyor...' : 'Çıkarılıyor...') : (isEkle ? 'Ekle' : 'Çıkar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StokMiktarModal; 