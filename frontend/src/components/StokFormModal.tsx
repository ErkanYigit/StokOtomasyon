import React, { useState, useEffect } from 'react';
import { StokData } from '../services/api';

interface StokFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<StokData, '_id' | 'createdAt' | 'updatedAt' | 'guncelleyenKullanici'>) => Promise<void>;
  initialData?: Partial<StokData>;
  isEdit?: boolean;
  loading?: boolean;
}

const kategoriListesi = [
  { value: 'kumas', label: 'Kumaş' },
  { value: 'sunger', label: 'Sünger' },
  { value: 'ahsap', label: 'Ahşap' },
  { value: 'metal', label: 'Metal' },
  { value: 'aksesuar', label: 'Aksesuar' },
  { value: 'diger', label: 'Diğer' },
];

const birimListesi = [
  { value: 'metre', label: 'Metre' },
  { value: 'adet', label: 'Adet' },
  { value: 'kg', label: 'Kg' },
  { value: 'litre', label: 'Litre' },
  { value: 'paket', label: 'Paket' },
  { value: 'top', label: 'Top' },
];

const kaliteListesi = [
  { value: 'dusuk', label: 'Düşük' },
  { value: 'orta', label: 'Orta' },
  { value: 'yuksek', label: 'Yüksek' },
  { value: 'premium', label: 'Premium' },
];

const paraBirimiListesi = [
  { value: 'TRY', label: '₺ (TL)' },
  { value: 'USD', label: '$ (USD)' },
  { value: 'EUR', label: '€ (EUR)' },
];

const StokFormModal: React.FC<StokFormModalProps> = ({ open, onClose, onSubmit, initialData, isEdit, loading }) => {
  const [form, setForm] = useState<Omit<StokData, '_id' | 'createdAt' | 'updatedAt' | 'guncelleyenKullanici'>>({
    malzemeAdi: '',
    malzemeKodu: '',
    kategori: 'kumas',
    altKategori: '',
    miktar: 0,
    birim: 'adet',
    minimumStok: 10,
    birimFiyat: 0,
    paraBirimi: 'TRY',
    tedarikci: { ad: '', telefon: '', email: '' },
    renk: '',
    kalite: 'orta',
    depoKonumu: '',
    aciklama: '',
  });
  const [error, setError] = useState('');
  const [errorList, setErrorList] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...form,
        ...initialData,
        tedarikci: {
          ad: initialData.tedarikci?.ad || '',
          telefon: initialData.tedarikci?.telefon || '',
          email: initialData.tedarikci?.email || '',
        },
      });
    } else {
      setForm({
        malzemeAdi: '',
        malzemeKodu: '',
        kategori: 'kumas',
        altKategori: '',
        miktar: 0,
        birim: 'adet',
        minimumStok: 10,
        birimFiyat: 0,
        paraBirimi: 'TRY',
        tedarikci: { ad: '', telefon: '', email: '' },
        renk: '',
        kalite: 'orta',
        depoKonumu: '',
        aciklama: '',
      });
    }
    setError('');
    // eslint-disable-next-line
  }, [open, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('tedarikci.')) {
      setForm((prev) => ({
        ...prev,
        tedarikci: {
          ...prev.tedarikci,
          [name.split('.')[1]]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorList([]);
    // Basit validasyon
    if (!form.malzemeAdi || !form.malzemeKodu || !form.kategori) {
      setError('Malzeme adı, kodu ve kategori zorunludur.');
      return;
    }
    if (form.miktar < 0 || form.minimumStok < 0 || form.birimFiyat < 0) {
      setError('Miktar, minimum stok ve birim fiyat negatif olamaz.');
      return;
    }
    try {
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Bir hata oluştu');
      if (err?.response?.data?.errors) {
        setErrorList(err.response.data.errors);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          disabled={loading}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Stok Düzenle' : 'Yeni Stok Ekle'}</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-3">{error}
          {errorList.length > 0 && (
            <ul className="mt-1 list-disc list-inside text-sm">
              {errorList.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          )}
        </div>}
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Malzeme Adı *</label>
              <input type="text" name="malzemeAdi" value={form.malzemeAdi} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Malzeme Kodu *</label>
              <input type="text" name="malzemeKodu" value={form.malzemeKodu} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kategori *</label>
              <select name="kategori" value={form.kategori} onChange={handleChange} className="input-field" required>
                {kategoriListesi.map((k) => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alt Kategori</label>
              <input type="text" name="altKategori" value={form.altKategori} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Miktar *</label>
              <input type="number" name="miktar" value={form.miktar} onChange={handleNumberChange} className="input-field" min={0} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Birim *</label>
              <select name="birim" value={form.birim} onChange={handleChange} className="input-field" required>
                {birimListesi.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Stok *</label>
              <input type="number" name="minimumStok" value={form.minimumStok} onChange={handleNumberChange} className="input-field" min={0} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Birim Fiyat *</label>
              <input type="number" name="birimFiyat" value={form.birimFiyat} onChange={handleNumberChange} className="input-field" min={0} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Para Birimi *</label>
              <select name="paraBirimi" value={form.paraBirimi} onChange={handleChange} className="input-field" required>
                {paraBirimiListesi.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Renk</label>
              <input type="text" name="renk" value={form.renk} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kalite</label>
              <select name="kalite" value={form.kalite} onChange={handleChange} className="input-field">
                {kaliteListesi.map((k) => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Depo Konumu</label>
              <input type="text" name="depoKonumu" value={form.depoKonumu} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tedarikçi Adı</label>
              <input type="text" name="tedarikci.ad" value={form.tedarikci?.ad || ''} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tedarikçi Tel</label>
              <input type="text" name="tedarikci.telefon" value={form.tedarikci?.telefon || ''} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tedarikçi Email</label>
              <input type="email" name="tedarikci.email" value={form.tedarikci?.email || ''} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Açıklama</label>
            <textarea name="aciklama" value={form.aciklama} onChange={handleChange} className="input-field" rows={2} />
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
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StokFormModal; 