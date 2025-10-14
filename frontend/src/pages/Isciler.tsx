import React, { useState, useEffect } from 'react';
import NotificationBell from '../components/NotificationBell';
import UserProfileMenu from '../components/UserProfileMenu';
import { Pie, Line } from 'react-chartjs-2';
import { getCalisanlar, getCalisan, addCalisan, updateCalisan, deleteCalisan } from '../services/api';
// Chart.js için gerekli importlar
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../fonts/DejaVuSans-normal.js';
// Departmanlar ve ustalık seviyeleri
const DEPARTMANLAR = ['Kesim', 'Döşeme', 'Montaj'];
const USTALIK = ['Çırak', 'Kalfa', 'Usta'];

// Mock işçi verisi
type Calisan = {
  _id: string;
  ad: string;
  soyad: string;
  iseGirisTarihi: string;
  departman: string;
  ustalikSeviyesi: string;
  maas: number;
  saatlikUcret: number;
  toplamSaat: number;
  aylikEkMesai: number;
  isAktif: boolean;
  tckn?: string;
  siparisler?: string[];
  katkilar?: { label: string; value: number }[];
  mesaiTrend?: number[];
  telefon?: string;
  adres?: string;
  fotoUrl?: string;
  sgkNo?: string;
};

const INITIAL_MOCK: Calisan[] = [
  {
    _id: '1',
    ad: 'Ahmet',
    soyad: 'Yılmaz',
    iseGirisTarihi: '2021-03-15',
    departman: 'Kesim',
    ustalikSeviyesi: 'Usta',
    maas: 18000,
    saatlikUcret: 120,
    toplamSaat: 3200,
    aylikEkMesai: 20,
    isAktif: true,
    tckn: '12345678901',
    siparisler: ['SIP-1001', 'SIP-1002', 'SIP-1005'],
    katkilar: [
      { label: 'Kesim', value: 60 },
      { label: 'Montaj', value: 40 },
    ],
    mesaiTrend: [8, 9, 7, 8, 10, 9, 8],
    sgkNo: '1234567890123456789',
  },
  {
    _id: '2',
    ad: 'Mehmet',
    soyad: 'Kaya',
    iseGirisTarihi: '2022-01-10',
    departman: 'Montaj',
    ustalikSeviyesi: 'Kalfa',
    maas: 14500,
    saatlikUcret: 100,
    toplamSaat: 1800,
    aylikEkMesai: 10,
    isAktif: true,
    tckn: '23456789012',
    siparisler: ['SIP-1003', 'SIP-1004'],
    katkilar: [
      { label: 'Montaj', value: 80 },
      { label: 'Kesim', value: 20 },
    ],
    mesaiTrend: [7, 8, 8, 7, 8, 7, 8],
    sgkNo: '9876543210987654321',
  },
  {
    _id: '3',
    ad: 'Ayşe',
    soyad: 'Demir',
    iseGirisTarihi: '2023-05-20',
    departman: 'Döşeme',
    ustalikSeviyesi: 'Çırak',
    maas: 12000,
    saatlikUcret: 80,
    toplamSaat: 600,
    aylikEkMesai: 5,
    isAktif: true,
    tckn: '34567890123',
    siparisler: ['SIP-1006'],
    katkilar: [
      { label: 'Döşeme', value: 100 },
    ],
    mesaiTrend: [6, 7, 6, 7, 6, 7, 6],
    sgkNo: '1122334455667788990',
  },
];

type IscilerProps = {
  showAddWorker?: boolean;
  setShowAddWorker?: (v: boolean) => void;
};

const Isciler: React.FC<IscilerProps> = ({ showAddWorker, setShowAddWorker }) => {
  const [departman, setDepartman] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [selected, setSelected] = useState<Calisan | null>(null);
  const [calisanlar, setCalisanlar] = useState<Calisan[]>(INITIAL_MOCK);
  // showAdd ve setShowAdd yerine, eğer prop geldiyse onu kullan
  const [internalShowAdd, internalSetShowAdd] = useState(false);
  const showAdd = typeof showAddWorker === 'boolean' ? showAddWorker : internalShowAdd;
  const setShowAdd = setShowAddWorker || internalSetShowAdd;
  const [form, setForm] = useState({
    ad: '',
    soyad: '',
    iseGirisTarihi: '',
    departman: '',
    ustalikSeviyesi: '',
    maas: '',
    saatlikUcret: '',
    aylikEkMesai: '',
    telefon: '',
    adres: '',
    fotoUrl: '',
    tckn: '',
    sgkNo: '',
  });
  const [edit, setEdit] = useState<Calisan | null>(null);
  const [editForm, setEditForm] = useState({
    ad: '',
    soyad: '',
    iseGirisTarihi: '',
    departman: '',
    ustalikSeviyesi: '',
    maas: '',
    saatlikUcret: '',
    aylikEkMesai: '',
    telefon: '',
    adres: '',
    fotoUrl: '',
    tckn: '',
    sgkNo: '',
  });
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, ad: string, soyad: string} | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    getCalisanlar().then(data => {
      setCalisanlar(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ad || !form.soyad || !form.iseGirisTarihi || !form.departman || !form.ustalikSeviyesi || !form.maas || !form.saatlikUcret || !form.tckn || !form.sgkNo) return;
    setLoading(true);
    try {
      const yeni = await addCalisan({
        ad: form.ad,
        soyad: form.soyad,
        iseGirisTarihi: form.iseGirisTarihi,
        departman: form.departman,
        ustalikSeviyesi: form.ustalikSeviyesi,
        maas: Number(form.maas),
        saatlikUcret: Number(form.saatlikUcret),
        aylikEkMesai: Number(form.aylikEkMesai) || 0,
        telefon: form.telefon,
        adres: form.adres,
        fotoUrl: form.fotoUrl,
        tckn: form.tckn,
        sgkNo: form.sgkNo,
      });
      setCalisanlar([...calisanlar, yeni]);
      setShowAdd(false);
      setForm({ ad: '', soyad: '', iseGirisTarihi: '', departman: '', ustalikSeviyesi: '', maas: '', saatlikUcret: '', aylikEkMesai: '', telefon: '', adres: '', fotoUrl: '', tckn: '', sgkNo: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = (c: Calisan) => {
    setEdit(c);
    setEditForm({
      ad: c.ad,
      soyad: c.soyad,
      iseGirisTarihi: c.iseGirisTarihi,
      departman: c.departman,
      ustalikSeviyesi: c.ustalikSeviyesi,
      maas: c.maas.toString(),
      saatlikUcret: c.saatlikUcret.toString(),
      aylikEkMesai: c.aylikEkMesai?.toString() || '',
      telefon: c.telefon || '',
      adres: c.adres || '',
      fotoUrl: c.fotoUrl || '',
      tckn: c.tckn || '',
      sgkNo: c.sgkNo || '',
    });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    setLoading(true);
    try {
      const guncel = await updateCalisan(edit._id, {
        ad: editForm.ad,
        soyad: editForm.soyad,
        iseGirisTarihi: editForm.iseGirisTarihi,
        departman: editForm.departman,
        ustalikSeviyesi: editForm.ustalikSeviyesi,
        maas: Number(editForm.maas),
        saatlikUcret: Number(editForm.saatlikUcret),
        aylikEkMesai: Number(editForm.aylikEkMesai) || 0,
        telefon: editForm.telefon,
        adres: editForm.adres,
        fotoUrl: editForm.fotoUrl,
        tckn: editForm.tckn,
        sgkNo: editForm.sgkNo,
      });
      setCalisanlar(calisanlar.map(c => c._id === guncel._id ? guncel : c));
      setEdit(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = (id: string, ad: string, soyad: string) => {
    setDeleteConfirm({ id, ad, soyad });
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    try {
      await deleteCalisan(deleteConfirm.id, true);
      setCalisanlar(calisanlar.filter(c => c._id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } finally {
      setLoading(false);
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

  // Sıralanmış çalışanları al
  const getSortedCalisanlar = () => {
    if (!sortConfig) return filtered;

    return [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Ad Soyad sıralaması için özel işlem
      if (sortConfig.key === 'ad') {
        aValue = `${a.ad} ${a.soyad}`;
        bValue = `${b.ad} ${b.soyad}`;
      } else {
        aValue = a[sortConfig.key as keyof Calisan];
        bValue = b[sortConfig.key as keyof Calisan];
      }

      // Tarih alanları için özel işlem
      if (sortConfig.key === 'iseGirisTarihi') {
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

  const aktifCalisanlar = calisanlar.filter(c => c.isAktif);
  const filtered = aktifCalisanlar.filter(
    (c) =>
      (departman === '' || c.departman === departman) &&
      (`${c.ad} ${c.soyad}`.toLowerCase().includes(search.toLowerCase()))
  );

  // PDF olarak indir fonksiyonu
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('DejaVuSans');
    doc.text('İşçi Listesi', 14, 16);
    // Tablo başlıkları
    const head = [[
      'Ad Soyad',
      'İşe Giriş Tarihi',
      'Departman',
      'Ustalık Seviyesi',
      'Net Maaş'
    ]];
    // Tablo verileri
    const body = filtered.map(c => [
      `${c.ad} ${c.soyad}`,
      new Date(c.iseGirisTarihi).toLocaleDateString('tr-TR'),
      c.departman,
      c.ustalikSeviyesi,
      `₺${c.maas.toLocaleString('tr-TR')}`
    ]);
    autoTable(doc, { head, body, startY: 22, styles: { font: 'DejaVuSans' } });
    doc.save('isciler_listesi.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">İşçi Yönetimi</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Personel bilgileri ve görev dağılımı
              </p>
            </div>
            <button className="btn-primary flex items-center" onClick={() => setShowAdd(true)}>
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni İşçi Ekle
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sağ üstte sabit menüler */}
        <div className="fixed top-4 right-8 z-50 flex items-center gap-3">
          <NotificationBell />
          <UserProfileMenu />
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
        <div>
          <select
            className="border rounded px-3 py-2 focus:outline-primary-gold dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            value={departman}
            onChange={e => setDepartman(e.target.value)}
          >
            <option value="">Tüm Departmanlar</option>
            {DEPARTMANLAR.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center border rounded px-3 py-2 w-full md:w-72 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
          <span className="text-gray-400 mr-2">🔍</span>
          <input
            type="text"
            placeholder="Ad veya Soyad ile ara..."
            className="w-full outline-none dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="flex justify-end mb-2">
          <button
            className="btn-primary px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
            onClick={handleDownloadPDF}
          >
            PDF İndir
          </button>
        </div>
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th 
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 select-none"
                onClick={() => handleSort('ad')}
              >
                Ad Soyad{getSortIcon('ad')}
              </th>
              <th 
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 select-none"
                onClick={() => handleSort('iseGirisTarihi')}
              >
                İşe Giriş Tarihi{getSortIcon('iseGirisTarihi')}
              </th>
              <th 
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 select-none"
                onClick={() => handleSort('departman')}
              >
                Departman{getSortIcon('departman')}
              </th>
              <th 
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 select-none"
                onClick={() => handleSort('ustalikSeviyesi')}
              >
                Ustalık Seviyesi{getSortIcon('ustalikSeviyesi')}
              </th>
              <th 
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 select-none"
                onClick={() => handleSort('maas')}
              >
                Net Maaş{getSortIcon('maas')}
              </th>
              <th className="px-4 py-2 bg-gray-100 dark:bg-gray-800 dark:text-gray-100">Profil Kartı</th>
            </tr>
          </thead>
          <tbody>
            {getSortedCalisanlar().map((c, idx) => (
              <tr key={c._id} className={"hover:bg-gray-50 dark:hover:bg-gray-700 " + (idx % 2 === 0 ? 'dark:bg-gray-900' : 'dark:bg-gray-800') + " dark:text-gray-100"}>
                <td className="px-4 py-2 font-medium text-black dark:text-gray-100">{c.ad} {c.soyad}</td>
                <td className="px-4 py-2 text-black dark:text-gray-100">{new Date(c.iseGirisTarihi).toLocaleDateString('tr-TR')}</td>
                <td className="px-4 py-2 text-black dark:text-gray-100">{c.departman}</td>
                <td className="px-4 py-2 text-black dark:text-gray-100">{c.ustalikSeviyesi}</td>
                <td className="px-4 py-2 text-black dark:text-gray-100">₺{c.maas.toLocaleString('tr-TR')}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="bg-primary-gold text-white dark:bg-yellow-400 dark:text-gray-900 px-3 py-1 rounded shadow hover:bg-yellow-600 dark:hover:bg-yellow-300 transition text-xs" onClick={() => setSelected(c)}>Kart</button>
                  <button className="bg-blue-600 text-white dark:bg-blue-400 dark:text-gray-900 px-3 py-1 rounded shadow hover:bg-blue-700 dark:hover:bg-blue-300 transition text-xs" onClick={() => handleEditOpen(c)}>Düzenle</button>
                  <button className="bg-red-500 text-white dark:bg-red-400 dark:text-gray-900 px-3 py-1 rounded shadow hover:bg-red-600 dark:hover:bg-red-300 transition text-xs" onClick={() => handleSoftDelete(c._id, c.ad, c.soyad)}>İşten Ayrıldı</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400 dark:text-gray-300 bg-white dark:bg-gray-800">Kriterlere uygun işçi bulunamadı.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl"
              onClick={() => setShowAdd(false)}
              aria-label="Kapat"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-black">Yeni İşçi Ekle</h2>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input type="text" className="border rounded px-3 py-2 w-1/2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Ad" value={form.ad} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))} required />
                <input type="text" className="border rounded px-3 py-2 w-1/2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Soyad" value={form.soyad} onChange={e => setForm(f => ({ ...f, soyad: e.target.value }))} required />
              </div>
              <input type="date" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100" placeholder="İşe Giriş Tarihi" value={form.iseGirisTarihi} onChange={e => setForm(f => ({ ...f, iseGirisTarihi: e.target.value }))} required />
              <div className="flex gap-2">
                <select className="border rounded px-3 py-2 w-1/2 dark:bg-gray-800 dark:text-gray-100" value={form.departman} onChange={e => setForm(f => ({ ...f, departman: e.target.value }))} required>
                  <option value="">Departman</option>
                  {DEPARTMANLAR.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
                <select className="border rounded px-3 py-2 w-1/2 dark:bg-gray-800 dark:text-gray-100" value={form.ustalikSeviyesi} onChange={e => setForm(f => ({ ...f, ustalikSeviyesi: e.target.value }))} required>
                  <option value="">Ustalık</option>
                  {USTALIK.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <input type="number" className="border rounded px-3 py-2 w-1/2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Maaş" value={form.maas} onChange={e => setForm(f => ({ ...f, maas: e.target.value }))} required />
                <input type="number" className="border rounded px-3 py-2 w-1/2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Saatlik Ücret" value={form.saatlikUcret} onChange={e => setForm(f => ({ ...f, saatlikUcret: e.target.value }))} required />
              </div>
              <input type="number" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Aylık Ek Mesai (opsiyonel)" value={form.aylikEkMesai} onChange={e => setForm(f => ({ ...f, aylikEkMesai: e.target.value }))} />
              <input type="text" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Telefon Numarası" value={form.telefon} onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))} required />
              <input type="text" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Adres" value={form.adres} onChange={e => setForm(f => ({ ...f, adres: e.target.value }))} required />
              <input type="text" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="T.C. Kimlik No" value={form.tckn} onChange={e => setForm(f => ({ ...f, tckn: e.target.value }))} required />
              <input type="text" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="SGK No" value={form.sgkNo} onChange={e => setForm(f => ({ ...f, sgkNo: e.target.value }))} required />
              <input type="text" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Fotoğraf URL (opsiyonel)" value={form.fotoUrl} onChange={e => setForm(f => ({ ...f, fotoUrl: e.target.value }))} />
              <button type="submit" className="bg-primary-gold text-white px-4 py-2 rounded shadow hover:bg-yellow-600 transition font-semibold mt-2">Kaydet</button>
            </form>
          </div>
        </div>
      )}
      {edit && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl"
              onClick={() => setEdit(null)}
              aria-label="Kapat"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-black">İşçi Bilgilerini Düzenle</h2>
            <form onSubmit={handleEditSave} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input type="text" className="border rounded px-3 py-2 w-1/2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Ad" value={editForm.ad} onChange={e => setEditForm(f => ({ ...f, ad: e.target.value }))} required />
                <input type="text" className="border rounded px-3 py-2 w-1/2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Soyad" value={editForm.soyad} onChange={e => setEditForm(f => ({ ...f, soyad: e.target.value }))} required />
              </div>
              <input type="date" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100" placeholder="İşe Giriş Tarihi" value={editForm.iseGirisTarihi} onChange={e => setEditForm(f => ({ ...f, iseGirisTarihi: e.target.value }))} required />
              <div className="flex gap-2">
                <select className="border rounded px-3 py-2 w-1/2 dark:bg-gray-800 dark:text-gray-100" value={editForm.departman} onChange={e => setEditForm(f => ({ ...f, departman: e.target.value }))} required>
                  <option value="">Departman</option>
                  {DEPARTMANLAR.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
                <select className="border rounded px-3 py-2 w-1/2 dark:bg-gray-800 dark:text-gray-100" value={editForm.ustalikSeviyesi} onChange={e => setEditForm(f => ({ ...f, ustalikSeviyesi: e.target.value }))} required>
                  <option value="">Ustalık</option>
                  {USTALIK.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <input type="number" className="border rounded px-3 py-2 w-1/2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Maaş" value={editForm.maas} onChange={e => setEditForm(f => ({ ...f, maas: e.target.value }))} required />
                <input type="number" className="border rounded px-3 py-2 w-1/2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Saatlik Ücret" value={editForm.saatlikUcret} onChange={e => setEditForm(f => ({ ...f, saatlikUcret: e.target.value }))} required />
              </div>
              <input type="number" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Aylık Ek Mesai (opsiyonel)" value={editForm.aylikEkMesai} onChange={e => setEditForm(f => ({ ...f, aylikEkMesai: e.target.value }))} />
              <input type="text" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Telefon Numarası" value={editForm.telefon} onChange={e => setEditForm(f => ({ ...f, telefon: e.target.value }))} required />
              <input type="text" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Adres" value={editForm.adres} onChange={e => setEditForm(f => ({ ...f, adres: e.target.value }))} required />
              <input type="text" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="T.C. Kimlik No" value={editForm.tckn} onChange={e => setEditForm(f => ({ ...f, tckn: e.target.value }))} required />
              <input type="text" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="SGK No" value={editForm.sgkNo} onChange={e => setEditForm(f => ({ ...f, sgkNo: e.target.value }))} required />
              <input type="text" className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" placeholder="Fotoğraf URL (opsiyonel)" value={editForm.fotoUrl} onChange={e => setEditForm(f => ({ ...f, fotoUrl: e.target.value }))} />
              <button type="submit" className="bg-primary-gold text-white px-4 py-2 rounded shadow hover:bg-yellow-600 transition font-semibold mt-2">Kaydet</button>
            </form>
          </div>
        </div>
      )}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black dark:hover:text-gray-100 text-xl"
              onClick={() => setSelected(null)}
              aria-label="Kapat"
            >
              ×
            </button>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2 text-black dark:text-gray-100">{selected.ad} {selected.soyad}</h2>
                <div className="text-gray-700 dark:text-gray-200 mb-2">{selected.tckn && <span>TC: {selected.tckn}<br /></span>}
                  <span>Departman: <b>{selected.departman}</b></span><br />
                  <span>Ustalık: <b>{selected.ustalikSeviyesi}</b></span><br />
                  <span>Maaş: <b>₺{selected.maas.toLocaleString('tr-TR')}</b></span>
                </div>
                <div className="text-gray-700 dark:text-gray-200 mb-2">
                  <span>İşe Giriş: {new Date(selected.iseGirisTarihi).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="text-gray-700 dark:text-gray-200 mb-2">
                  <span>Toplam Çalıştığı Saat: <b>{selected.toplamSaat}</b></span><br />
                  <span>Aylık Ortalama Mesai: <b>{selected.aylikEkMesai} saat</b></span>
                </div>
                <div className="text-gray-700 dark:text-gray-200 mb-2">
                  <span>Güncel Maaş Hesabı:</span><br />
                  <span className="text-xs">Maaş = Temel Maaş + (Ek Mesai × Saatlik Ücret)</span><br />
                  <span className="font-semibold">₺{selected.maas.toLocaleString('tr-TR')} + ({selected.aylikEkMesai} × ₺{selected.saatlikUcret}) = <span className="text-primary-gold">₺{(selected.maas + selected.aylikEkMesai * selected.saatlikUcret).toLocaleString('tr-TR')}</span></span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="bg-primary-gold text-white px-3 py-1 rounded shadow flex items-center gap-1 hover:bg-yellow-600 transition text-sm">
                    Görev Ata
                  </button>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded shadow flex items-center gap-1 hover:bg-blue-700 transition text-sm">
                    Maaş Güncelle
                  </button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded shadow flex items-center gap-1 hover:bg-red-600 transition text-sm">
                    İşten Ayrıldı
                  </button>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <h3 className="font-semibold mb-1 text-black dark:text-gray-100">Üretime Katkı Oranı</h3>
                  <Pie
                    data={{
                      labels: selected.katkilar?.map(k => k.label),
                      datasets: [{
                        data: selected.katkilar?.map(k => k.value),
                        backgroundColor: ['#D4AF37', '#222', '#888'],
                        borderWidth: 1,
                      }],
                    }}
                    options={{ plugins: { legend: { position: 'bottom' } } }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-black dark:text-gray-100">Son 7 Günlük Mesai Trend</h3>
                  <Line
                    data={{
                      labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
                      datasets: [{
                        label: 'Mesai (saat)',
                        data: selected.mesaiTrend,
                        borderColor: '#D4AF37',
                        backgroundColor: 'rgba(212,175,55,0.2)',
                        tension: 0.4,
                      }],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-black dark:text-gray-100">İş Geçmişi</h3>
                  <div className="text-xs text-gray-700">
                    {selected.siparisler && selected.siparisler.length > 0 ? (
                      <ul className="list-disc ml-4">
                        {selected.siparisler.map(sip => (
                          <li key={sip}>Sipariş: <span className="font-semibold">{sip}</span></li>
                        ))}
                      </ul>
                    ) : (
                      <span>Henüz bir siparişte çalışmadı.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl"
              onClick={() => setDeleteConfirm(null)}
              aria-label="Kapat"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-black">İşçiyi Sil</h2>
            <p className="mb-4">{deleteConfirm.ad} {deleteConfirm.soyad} adlı işçiyi <b>tamamen silmek</b> istiyor musunuz? Bu işlem geri alınamaz.</p>
            <div className="flex gap-4 justify-end">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setDeleteConfirm(null)}>Vazgeç</button>
              <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" onClick={handleDeleteConfirmed}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
        {loading && <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-lg">Yükleniyor...</div></div>}
      </div>
    </div>
  );
};

export default Isciler; 