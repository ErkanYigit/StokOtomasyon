import React, { useEffect, useState } from 'react';
import { productionAPI, ProductionData } from '../services/api';
import { orderAPI, OrderData } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../fonts/DejaVuSans-normal.js';

const emptyProduction: Omit<ProductionData, '_id' | 'createdAt' | 'updatedAt'> = {
  siparis: '',
  baslangicTarihi: '',
  durum: 'beklemede',
  asamalar: [
    { ad: 'kesim' },
    { ad: 'döşeme' },
    { ad: 'montaj' }
  ],
  aciklama: '',
};

const Uretim: React.FC = () => {
  const [productions, setProductions] = useState<ProductionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduction, setEditProduction] = useState<ProductionData | null>(null);
  const [form, setForm] = useState<Omit<ProductionData, '_id' | 'createdAt' | 'updatedAt'>>(emptyProduction);
  const [formLoading, setFormLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);

  const fetchProductions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productionAPI.getAll();
      setProductions(data);
    } catch (err) {
      setError('Üretimler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await orderAPI.getAll();
      setOrders(data);
    } catch {}
  };

  useEffect(() => {
    fetchProductions();
    fetchOrders();
  }, []);

  const openAddModal = () => {
    setEditProduction(null);
    setForm(emptyProduction);
    setModalOpen(true);
  };

  const openEditModal = (prod: ProductionData) => {
    setEditProduction(prod);
    setForm({
      siparis: prod.siparis?._id || '',
      baslangicTarihi: prod.baslangicTarihi || '',
      durum: prod.durum || 'beklemede',
      asamalar: prod.asamalar || [],
      aciklama: prod.aciklama || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditProduction(null);
    setForm(emptyProduction);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAsamaChange = (idx: number, key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      asamalar: prev.asamalar?.map((a, i) => i === idx ? { ...a, [key]: value } : a)
    }));
  };

  const addAsama = () => {
    setForm((prev) => ({ ...prev, asamalar: [...(prev.asamalar || []), { ad: '' }] }));
  };

  const removeAsama = (idx: number) => {
    setForm((prev) => ({ ...prev, asamalar: (prev.asamalar || []).filter((_, i) => i !== idx) }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editProduction && editProduction._id) {
        await productionAPI.update(editProduction._id, form);
      } else {
        await productionAPI.create(form);
      }
      await fetchProductions();
      closeModal();
    } catch (err) {
      alert('Üretim kaydedilemedi');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (prod: ProductionData) => {
    if (!window.confirm('Bu üretim kaydını silmek istediğinize emin misiniz?')) return;
    try {
      await productionAPI.delete(prod._id!);
      await fetchProductions();
    } catch (err) {
      alert('Üretim kaydı silinemedi');
    }
  };

  // Sıralama fonksiyonu
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sıralama ikonu
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="ml-1 text-gray-400">↕</span>;
    }
    return sortConfig.direction === 'asc' 
      ? <span className="ml-1 text-primary-gold">↑</span>
      : <span className="ml-1 text-primary-gold">↓</span>;
  };

  // Sıralanmış üretimleri al
  const getSortedProductions = () => {
    if (!sortConfig) return productions;

    return [...productions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Sipariş sıralaması için özel işlem
      if (sortConfig.key === 'siparis') {
        aValue = a.siparis?.musteriAdi || '';
        bValue = b.siparis?.musteriAdi || '';
      } else {
        aValue = a[sortConfig.key as keyof ProductionData];
        bValue = b[sortConfig.key as keyof ProductionData];
      }

      // Tarih alanları için özel işlem
      if (sortConfig.key === 'baslangicTarihi' || sortConfig.key === 'bitisTarihi') {
        aValue = aValue ? new Date(aValue as string).getTime() : 0;
        bValue = bValue ? new Date(bValue as string).getTime() : 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // PDF olarak indir fonksiyonu
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('DejaVuSans');
    doc.text('Üretim Listesi', 14, 16);
    const head = [[
      'Sipariş',
      'Başlangıç',
      'Durum',
      'Aşamalar'
    ]];
    const body = getSortedProductions().map(prod => [
      prod.siparis?.musteriAdi || '-',
      prod.baslangicTarihi ? new Date(prod.baslangicTarihi).toLocaleDateString('tr-TR') : '-',
      prod.durum,
      prod.asamalar?.map(a => a.ad).join(', ')
    ]);
    autoTable(doc, { head, body, startY: 22, styles: { font: 'DejaVuSans' } });
    doc.save('uretim_listesi.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Üretim Takibi</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Üretim süreçleri ve aşama takibi
              </p>
            </div>
            <button className="btn-primary flex items-center" onClick={openAddModal}>
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Üretim
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-2 rounded mb-3">{error}</div>}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-end mb-2">
            <button
              className="btn-primary px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
              onClick={handleDownloadPDF}
            >
              PDF İndir
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th 
                    className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('siparis')}
                  >
                    Sipariş{getSortIcon('siparis')}
                  </th>
                  <th 
                    className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('baslangicTarihi')}
                  >
                    Başlangıç{getSortIcon('baslangicTarihi')}
                  </th>
                  <th 
                    className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('durum')}
                  >
                    Durum{getSortIcon('durum')}
                  </th>
                  <th className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100">Aşamalar</th>
                  <th className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800">Yükleniyor...</td></tr>
                ) : getSortedProductions().length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800">Henüz üretim kaydı yok</td></tr>
                ) : (
                  getSortedProductions().map((prod, idx) => (
                    <tr key={prod._id} className={"hover:bg-gray-50 dark:hover:bg-gray-700 " + (idx % 2 === 0 ? 'dark:bg-gray-900' : 'dark:bg-gray-800') + " dark:text-gray-100"}>
                      <td className="table-cell text-gray-900 dark:text-gray-100">{prod.siparis?.musteriAdi || '-'}</td>
                      <td className="table-cell text-gray-900 dark:text-gray-100">{prod.baslangicTarihi ? new Date(prod.baslangicTarihi).toLocaleDateString('tr-TR') : '-'}</td>
                      <td className="table-cell text-gray-900 dark:text-gray-100">{prod.durum}</td>
                      <td className="table-cell text-gray-900 dark:text-gray-100">{prod.asamalar?.map(a => a.ad).join(', ')}</td>
                      <td className="table-cell">
                        <button className="text-primary-gold dark:text-yellow-300 hover:text-yellow-600 dark:hover:text-yellow-400 text-sm font-medium" onClick={() => openEditModal(prod)}>Düzenle</button>
                        <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium ml-2" onClick={() => handleDelete(prod)}>Sil</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Üretim Ekle/Düzenle Modalı */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto relative dark:bg-gray-800">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 text-2xl font-bold z-10" onClick={closeModal} disabled={formLoading}>×</button>
              
              {/* Header */}
              <div className={`p-6 rounded-t-lg ${editProduction ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-primary-gold to-yellow-400'}`}>
                <h2 className="text-2xl font-bold text-white">{editProduction ? 'Üretimi Düzenle' : 'Yeni Üretim Ekle'}</h2>
                <p className={`${editProduction ? 'text-blue-100' : 'text-yellow-100'}`}>
                  {editProduction ? 'Üretim bilgilerini güncelleyin' : 'Yeni üretim süreci başlatın'}
                </p>
              </div>

              <div className="p-6">
              <form className="space-y-3 dark:bg-gray-800 dark:text-gray-100" onSubmit={handleFormSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sipariş *</label>
                  <select name="siparis" value={form.siparis} onChange={handleFormChange} className="input-field dark:bg-gray-800 dark:text-gray-100" required>
                    <option value="">Sipariş Seçin</option>
                    {orders.map((o) => (
                      <option key={o._id} value={o._id}>{o.musteriAdi} ({o._id?.slice(-4)})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
                  <input type="date" name="baslangicTarihi" value={form.baslangicTarihi?.slice(0,10) || ''} onChange={handleFormChange} className="input-field dark:bg-gray-800 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Durum</label>
                  <select name="durum" value={form.durum} onChange={handleFormChange} className="input-field dark:bg-gray-800 dark:text-gray-100">
                    <option value="beklemede">Beklemede</option>
                    <option value="kesim">Kesim</option>
                    <option value="döşeme">Döşeme</option>
                    <option value="montaj">Montaj</option>
                    <option value="hazir">Hazır</option>
                    <option value="teslim">Teslim</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aşamalar</label>
                  {form.asamalar?.map((asama, idx) => (
                    <div key={idx} className="flex items-center space-x-2 mb-2">
                      <input type="text" placeholder="Aşama Adı" value={asama.ad} onChange={e => handleAsamaChange(idx, 'ad', e.target.value)} className="input-field flex-1 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" required />
                      <button type="button" className="text-red-500 text-lg" onClick={() => removeAsama(idx)} disabled={form.asamalar!.length === 1}>×</button>
                    </div>
                  ))}
                  <button type="button" className="text-primary-gold text-sm font-medium mt-1" onClick={addAsama}>+ Aşama Ekle</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea name="aciklama" value={form.aciklama} onChange={handleFormChange} className="input-field dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" rows={2} />
                </div>
                <div className="flex justify-end mt-4">
                  <button type="button" className="btn-secondary mr-2" onClick={closeModal} disabled={formLoading}>İptal</button>
                  <button type="submit" className="btn-primary" disabled={formLoading}>{formLoading ? 'Kaydediliyor...' : (editProduction ? 'Güncelle' : 'Ekle')}</button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Uretim; 