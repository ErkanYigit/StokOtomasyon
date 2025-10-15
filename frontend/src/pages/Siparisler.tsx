import React, { useEffect, useState } from 'react';
import { orderAPI, OrderData } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../fonts/DejaVuSans-normal.js';

const emptyOrder: Omit<OrderData, '_id' | 'createdAt' | 'updatedAt'> = {
  musteriAdi: '',
  musteriTel: '',
  musteriEmail: '',
  urunler: [{ model: '', adet: 1 }],
  teslimTarihi: '',
  aciklama: '',
};

const Siparisler: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<OrderData | null>(null);
  const [form, setForm] = useState<Omit<OrderData, '_id' | 'createdAt' | 'updatedAt'>>(emptyOrder);
  const [formLoading, setFormLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await orderAPI.getAll();
      setOrders(data);
    } catch (err) {
      setError('Siparişler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Sıralanmış siparişleri al
  const getSortedOrders = () => {
    if (!sortConfig) return orders;

    return [...orders].sort((a, b) => {
      let aValue = a[sortConfig.key as keyof OrderData];
      let bValue = b[sortConfig.key as keyof OrderData];

      // Tarih alanları için özel işlem
      if (sortConfig.key === 'siparisTarihi' || sortConfig.key === 'teslimTarihi') {
        aValue = aValue ? new Date(aValue as string).getTime() : 0;
        bValue = bValue ? new Date(bValue as string).getTime() : 0;
      }

      // Sayısal alanlar için
      if (sortConfig.key === 'toplamTutar') {
        aValue = aValue || 0;
        bValue = bValue || 0;
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const openAddModal = () => {
    setEditOrder(null);
    setForm(emptyOrder);
    setModalOpen(true);
  };

  const openEditModal = (order: OrderData) => {
    setEditOrder(order);
    setForm({
      musteriAdi: order.musteriAdi,
      musteriTel: order.musteriTel || '',
      musteriEmail: order.musteriEmail || '',
      urunler: order.urunler,
      teslimTarihi: order.teslimTarihi || '',
      aciklama: order.aciklama || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditOrder(null);
    setForm(emptyOrder);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (idx: number, key: string, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      urunler: prev.urunler.map((u, i) => i === idx ? { ...u, [key]: value } : u)
    }));
  };

  const addProduct = () => {
    setForm((prev) => ({ ...prev, urunler: [...prev.urunler, { model: '', adet: 1 }] }));
  };

  const removeProduct = (idx: number) => {
    setForm((prev) => ({ ...prev, urunler: prev.urunler.filter((_, i) => i !== idx) }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editOrder && editOrder._id) {
        await orderAPI.update(editOrder._id, form);
      } else {
        await orderAPI.create(form);
      }
      await fetchOrders();
      closeModal();
    } catch (err) {
      alert('Sipariş kaydedilemedi');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (order: OrderData) => {
    if (!window.confirm('Bu siparişi silmek istediğinize emin misiniz?')) return;
    try {
      await orderAPI.delete(order._id!);
      await fetchOrders();
    } catch (err) {
      alert('Sipariş silinemedi');
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

  // PDF olarak indir fonksiyonu
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('DejaVuSans');
    doc.text('Sipariş Listesi', 14, 16);
    // Tablo başlıkları
    const head = [[
      'Müşteri',
      'Tarih',
      'Teslim Tarihi',
      'Durum',
      'Toplam',
      'Açıklama'
    ]];
    // Tablo verileri
    const body = getSortedOrders().map(order => [
      order.musteriAdi || '-',
      order.siparisTarihi ? new Date(order.siparisTarihi).toLocaleDateString('tr-TR') : '-',
      order.teslimTarihi ? new Date(order.teslimTarihi).toLocaleDateString('tr-TR') : '-',
      order.durum || '-',
      (order.toplamTutar !== undefined && order.toplamTutar !== null) ? order.toplamTutar.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '-',
      order.aciklama || '-'
    ]);
    autoTable(doc, { head, body, startY: 22, styles: { font: 'DejaVuSans' } });
    doc.save('siparisler_listesi.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Siparişler</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Müşteri siparişleri ve teslim takibi
              </p>
            </div>
            <button className="btn-primary flex items-center" onClick={openAddModal}>
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Sipariş
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
          <div className="overflow-x-visible">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th 
                    className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('musteriAdi')}
                  >
                    Müşteri{getSortIcon('musteriAdi')}
                  </th>
                  <th 
                    className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('siparisTarihi')}
                  >
                    Sipariş Tarihi{getSortIcon('siparisTarihi')}
                  </th>
                  <th 
                    className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('teslimTarihi')}
                  >
                    Teslim Tarihi{getSortIcon('teslimTarihi')}
                  </th>
                  <th 
                    className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('durum')}
                  >
                    Durum{getSortIcon('durum')}
                  </th>
                  <th 
                    className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('toplamTutar')}
                  >
                    Toplam{getSortIcon('toplamTutar')}
                  </th>
                  <th className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 whitespace-normal break-words">Açıklama</th>
                  <th className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 whitespace-nowrap">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800">Yükleniyor...</td></tr>
                ) : getSortedOrders().length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800">Henüz sipariş yok</td></tr>
                ) : (
                  getSortedOrders().map((order, idx) => (
                    <tr key={order._id} className={"hover:bg-gray-50 dark:hover:bg-gray-700 " + (idx % 2 === 0 ? 'dark:bg-gray-900' : 'dark:bg-gray-800') + " dark:text-gray-100"}>
                      <td className="table-cell text-gray-900 dark:text-gray-100 whitespace-nowrap">{order.musteriAdi}</td>
                      <td className="table-cell text-gray-900 dark:text-gray-100 whitespace-nowrap">{order.siparisTarihi ? new Date(order.siparisTarihi).toLocaleDateString('tr-TR') : '-'}</td>
                      <td className="table-cell text-gray-900 dark:text-gray-100 whitespace-nowrap">{order.teslimTarihi ? new Date(order.teslimTarihi).toLocaleDateString('tr-TR') : '-'}</td>
                      <td className="table-cell text-gray-900 dark:text-gray-100 whitespace-nowrap">{order.durum}</td>
                      <td className="table-cell text-gray-900 dark:text-gray-100 whitespace-nowrap">{order.toplamTutar?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                      <td className="table-cell text-gray-900 dark:text-gray-100 whitespace-normal break-words">{order.aciklama || '-'}</td>
                      <td className="table-cell whitespace-nowrap">
                        <button className="text-primary-gold dark:text-yellow-300 hover:text-yellow-600 dark:hover:text-yellow-400 text-sm font-medium" onClick={() => openEditModal(order)}>Düzenle</button>
                        <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium ml-2" onClick={() => handleDelete(order)}>Sil</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sipariş Ekle/Düzenle Modalı */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto relative dark:bg-gray-800">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 text-2xl font-bold z-10" onClick={closeModal} disabled={formLoading}>×</button>
              
              {/* Header */}
              <div className={`p-6 rounded-t-lg ${editOrder ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-primary-gold to-yellow-400'}`}>
                <h2 className="text-2xl font-bold text-white">{editOrder ? 'Siparişi Düzenle' : 'Yeni Sipariş Ekle'}</h2>
                <p className={`${editOrder ? 'text-blue-100' : 'text-yellow-100'}`}>
                  {editOrder ? 'Sipariş bilgilerini güncelleyin' : 'Yeni müşteri siparişi oluşturun'}
                </p>
              </div>

              <div className="p-6">
              <form className="space-y-3 dark:bg-gray-800" onSubmit={handleFormSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Müşteri Adı *</label>
                  <input type="text" name="musteriAdi" value={form.musteriAdi} onChange={handleFormChange} className="input-field dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefon</label>
                    <input type="text" name="musteriTel" value={form.musteriTel} onChange={handleFormChange} className="input-field dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="musteriEmail" value={form.musteriEmail} onChange={handleFormChange} className="input-field dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teslim Tarihi</label>
                  <input type="date" name="teslimTarihi" value={form.teslimTarihi?.slice(0,10) || ''} onChange={handleFormChange} className="input-field dark:bg-gray-800 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ürünler *</label>
                  {form.urunler.map((urun, idx) => (
                    <div key={idx} className="flex items-center space-x-2 mb-2">
                      <input type="text" placeholder="Model" value={urun.model} onChange={e => handleProductChange(idx, 'model', e.target.value)} className="input-field flex-1 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" required />
                      <input type="number" placeholder="Adet" min={1} value={urun.adet} onChange={e => handleProductChange(idx, 'adet', Number(e.target.value))} className="input-field w-20 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" required />
                      <button type="button" className="text-red-500 text-lg" onClick={() => removeProduct(idx)} disabled={form.urunler.length === 1}>×</button>
                    </div>
                  ))}
                  <button type="button" className="text-primary-gold text-sm font-medium mt-1" onClick={addProduct}>+ Ürün Ekle</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea name="aciklama" value={form.aciklama} onChange={handleFormChange} className="input-field dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" rows={2} />
                </div>
                <div className="flex justify-end mt-4">
                  <button type="button" className="btn-secondary mr-2" onClick={closeModal} disabled={formLoading}>İptal</button>
                  <button type="submit" className="btn-primary" disabled={formLoading}>{formLoading ? 'Kaydediliyor...' : (editOrder ? 'Güncelle' : 'Ekle')}</button>
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

export default Siparisler; 