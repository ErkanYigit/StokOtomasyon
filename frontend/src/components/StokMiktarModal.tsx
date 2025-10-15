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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-sm max-h-[90vh] overflow-y-auto relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 text-2xl font-bold z-10"
          onClick={onClose}
          disabled={loading}
        >
          ×
        </button>
        
        {/* Header */}
        <div className={`p-6 rounded-t-lg ${isEkle ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
          <h2 className="text-2xl font-bold text-white">{isEkle ? 'Stok Ekle' : 'Stok Çıkar'}</h2>
          <p className={`${isEkle ? 'text-green-100' : 'text-red-100'}`}>
            {stokAdi} {birim && <span className="text-xs opacity-80">({birim})</span>}
          </p>
        </div>

        <div className="p-6">
        {error && <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-2 rounded mb-3">{error}</div>}
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Miktar *</label>
            <input
              type="number"
              min={1}
              name="miktar"
              value={miktar}
              onChange={e => setMiktar(Number(e.target.value))}
              className="input-field dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Açıklama</label>
            <textarea
              name="aciklama"
              value={aciklama}
              onChange={e => setAciklama(e.target.value)}
              className="input-field dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              rows={2}
            />
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="btn-secondary mr-2"
              onClick={onClose}
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isEkle 
                  ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500' 
                  : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
              }`}
              disabled={loading}
            >
              {loading ? (isEkle ? 'Ekleniyor...' : 'Çıkarılıyor...') : (isEkle ? '➕ Ekle' : '➖ Çıkar')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default StokMiktarModal; 