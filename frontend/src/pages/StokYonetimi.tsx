import React, { useState, useEffect } from 'react';
import { stokAPI, StokData, movementAPI, MovementData } from '../services/api';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import StokFormModal from '../components/StokFormModal';
import StokMiktarModal from '../components/StokMiktarModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../fonts/DejaVuSans-normal.js';

const StokYonetimi: React.FC = () => {
  const [stoklar, setStoklar] = useState<StokData[]>([]);
  const [movements, setMovements] = useState<MovementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    kategori: '',
    stokDurumu: '',
    arama: ''
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStok, setSelectedStok] = useState<StokData | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [miktarModalOpen, setMiktarModalOpen] = useState(false);
  const [miktarModalEkle, setMiktarModalEkle] = useState(true);
  const [miktarModalStok, setMiktarModalStok] = useState<StokData | undefined>(undefined);
  const [miktarModalLoading, setMiktarModalLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [stokToDelete, setStokToDelete] = useState<StokData | undefined>(undefined);
  const [initialLoading, setInitialLoading] = useState(true);

  // Stok listesini yükle
  const fetchStoklar = async () => {
    try {
      if (initialLoading) setLoading(true);
      const response = await stokAPI.getAll({
        page: currentPage,
        limit: 10,
        ...filters,
        siralama: sortConfig ? sortConfig.key : undefined,
        yon: sortConfig ? sortConfig.direction : undefined
      });

      if (response.success && response.data) {
        setStoklar(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (err) {
      setError('Stok listesi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Günlük değişimleri yükle
  const fetchMovements = async () => {
    console.log('fetchMovements BAŞLANGIÇ');
    try {
      setMovementsLoading(true);
      const data = await movementAPI.getAll();
      console.log('API getAll sonucu:', data);
      setMovements(Array.isArray(data) ? data : []);
      console.log('setMovements çağrıldı:', data);
    } catch (err) {
      console.error('Hareketler yüklenirken hata:', err);
      setMovements([]);
    } finally {
      setMovementsLoading(false);
      console.log('fetchMovements BİTİŞ');
    }
  };

  useEffect(() => {
    fetchStoklar();
  }, [currentPage, filters, sortConfig]);

  useEffect(() => {
    fetchMovements();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getKategoriLabel = (kategori: string) => {
    const labels: { [key: string]: string } = {
      kumas: 'Kumaş',
      sunger: 'Sünger',
      ahsap: 'Ahşap',
      metal: 'Metal',
      aksesuar: 'Aksesuar',
      diger: 'Diğer'
    };
    return labels[kategori] || kategori;
  };

  const getStokDurumuBadge = (durum: string) => {
    const badges = {
      yeterli: 'bg-green-100 text-green-800',
      kritik: 'bg-yellow-100 text-yellow-800',
      tukenmis: 'bg-red-100 text-red-800'
    };
    return badges[durum as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Sıralama fonksiyonu
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenAddModal = () => {
    setSelectedStok(undefined);
    setEditMode(false);
    setModalOpen(true);
  };

  const handleOpenEditModal = (stok: StokData) => {
    setSelectedStok(stok);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStok(undefined);
    setEditMode(false);
  };

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true);
    try {
      if (editMode && selectedStok?._id) {
        await stokAPI.update(selectedStok._id, data);
      } else {
        await stokAPI.create(data);
      }
      await fetchStoklar();
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStok = async (stok: StokData) => {
    setStokToDelete(stok);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!stokToDelete?._id) return;
    
    console.log('Silme işlemi başlatılıyor:', stokToDelete._id, 'hard: true');
    setDeleteLoadingId(stokToDelete._id);
    try {
      const result = await stokAPI.delete(stokToDelete._id, true);
      console.log('API silme sonucu:', result);
      await fetchStoklar();
      setDeleteModalOpen(false);
      setStokToDelete(undefined);
    } catch (error) {
      console.error('Silme hatası:', error);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setStokToDelete(undefined);
  };

  const handleOpenMiktarModal = (stok: StokData, isEkle: boolean) => {
    setMiktarModalStok(stok);
    setMiktarModalEkle(isEkle);
    setMiktarModalOpen(true);
  };

  const handleCloseMiktarModal = () => {
    setMiktarModalOpen(false);
    setMiktarModalStok(undefined);
  };

  const handleMiktarFormSubmit = async (miktar: number, aciklama?: string) => {
    if (!miktarModalStok?._id) return;
    setMiktarModalLoading(true);
    try {
      if (miktarModalEkle) {
        await stokAPI.addStock(miktarModalStok._id, miktar, aciklama);
      } else {
        await stokAPI.removeStock(miktarModalStok._id, miktar, aciklama);
      }
      await fetchStoklar();
      await fetchMovements(); // Hareketleri yeniden yükle
    } finally {
      setMiktarModalLoading(false);
    }
  };

  // PDF olarak indir fonksiyonu
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('DejaVuSans');
    doc.text('Stok Listesi', 14, 16);
    const head = [[
      'Malzeme',
      'Kategori',
      'Miktar',
      'Birim Fiyat',
      'Toplam Değer',
      'Durum'
    ]];
    const body = stoklar.map(stok => [
      `${stok.malzemeAdi} (${stok.malzemeKodu})`,
      getKategoriLabel(stok.kategori),
      `${stok.miktar} ${stok.birim}`,
      formatCurrency(stok.birimFiyat),
      formatCurrency(stok.toplamDeger || 0),
      stok.stokDurumu === 'yeterli' ? 'Yeterli' : stok.stokDurumu === 'kritik' ? 'Kritik' : stok.stokDurumu === 'tukenmis' ? 'Tükenmiş' : 'Bilinmiyor'
    ]);
    autoTable(doc, { head, body, startY: 22, styles: { font: 'DejaVuSans' } });
    doc.save('stok_listesi.pdf');
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Stok Yönetimi</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Malzeme giriş/çıkış işlemleri ve stok takibi
              </p>
            </div>
            <button className="btn-primary flex items-center" onClick={handleOpenAddModal}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Yeni Stok Ekle
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtreler */}
        <div className="card mb-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Malzeme adı veya kodu ara..."
                  value={filters.arama}
                  onChange={(e) => handleFilterChange('arama', e.target.value)}
                  className="input-field pl-10 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
            </div>
            <select
              value={filters.kategori}
              onChange={(e) => handleFilterChange('kategori', e.target.value)}
              className="input-field w-40 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Tüm Kategoriler</option>
              <option value="kumas">Kumaş</option>
              <option value="sunger">Sünger</option>
              <option value="ahsap">Ahşap</option>
              <option value="metal">Metal</option>
              <option value="aksesuar">Aksesuar</option>
              <option value="diger">Diğer</option>
            </select>
            <select
              value={filters.stokDurumu}
              onChange={(e) => handleFilterChange('stokDurumu', e.target.value)}
              className="input-field w-40 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Tüm Durumlar</option>
              <option value="yeterli">Yeterli</option>
              <option value="kritik">Kritik</option>
              <option value="tukenmis">Tükenmiş</option>
            </select>
          </div>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stok Tablosu */}
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
                    onClick={() => handleSort('malzemeAdi')}
                  >
                    Malzeme{getSortIcon('malzemeAdi')}
                  </th>
                  <th 
                    className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('kategori')}
                  >
                    Kategori{getSortIcon('kategori')}
                  </th>
                  <th 
                    className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('miktar')}
                  >
                    Miktar{getSortIcon('miktar')}
                  </th>
                  <th 
                    className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('birimFiyat')}
                  >
                    Birim Fiyat{getSortIcon('birimFiyat')}
                  </th>
                  <th 
                    className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('toplamDeger')}
                  >
                    Toplam Değer{getSortIcon('toplamDeger')}
                  </th>
                  <th 
                    className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
                    onClick={() => handleSort('stokDurumu')}
                  >
                    Durum{getSortIcon('stokDurumu')}
                  </th>
                  <th className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800">Yükleniyor...</td>
                  </tr>
                ) : stoklar.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800">Kriterlere uygun stok bulunamadı.</td>
                  </tr>
                ) : (
                  stoklar.map((stok, idx) => (
                    <tr key={stok._id} className={"hover:bg-gray-50 dark:hover:bg-gray-700 " + (idx % 2 === 0 ? 'dark:bg-gray-900' : 'dark:bg-gray-800') + " dark:text-gray-100"}>
                      <td className="table-cell">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {stok.malzemeAdi}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">
                            {stok.malzemeKodu}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {getKategoriLabel(stok.kategori)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {stok.miktar} {stok.birim}
                        </div>
                        {stok.minimumStok && (
                          <div className="text-xs text-gray-500 dark:text-gray-300">
                            Min: {stok.minimumStok}
                          </div>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {formatCurrency(stok.birimFiyat)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(stok.toplamDeger || 0)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStokDurumuBadge(stok.stokDurumu || '')}`}>
                          {stok.stokDurumu === 'kritik' && (
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                          )}
                          {stok.stokDurumu === 'yeterli' ? 'Yeterli' :
                           stok.stokDurumu === 'kritik' ? 'Kritik' :
                           stok.stokDurumu === 'tukenmis' ? 'Tükenmiş' : 'Bilinmiyor'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button className="text-primary-gold dark:text-yellow-300 hover:text-yellow-600 dark:hover:text-yellow-400 text-sm font-medium" onClick={() => handleOpenEditModal(stok)}>
                            Düzenle
                          </button>
                          <button
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                            onClick={() => handleDeleteStok(stok)}
                            disabled={deleteLoadingId === stok._id}
                          >
                            {deleteLoadingId === stok._id ? 'Siliniyor...' : 'Sil'}
                          </button>
                          <button
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                            onClick={() => handleOpenMiktarModal(stok, true)}
                          >
                            Ekle
                          </button>
                          <button
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                            onClick={() => handleOpenMiktarModal(stok, false)}
                          >
                            Çıkar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Önceki
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Sayfa <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Önceki
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-primary-gold border-primary-gold text-primary-black'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sonraki
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Günlük Değişimler Tablosu */}
        <div className="card mt-8 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-primary-gold" />
              Günlük Değişimler
            </h3>
            <button 
              onClick={fetchMovements}
              disabled={movementsLoading}
              className="text-sm text-primary-gold hover:text-yellow-600 font-medium"
            >
              {movementsLoading ? 'Yükleniyor...' : 'Yenile'}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100">Malzeme</th>
                  <th className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100">İşlem</th>
                  <th className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100">Miktar</th>
                  <th className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100">Açıklama</th>
                  <th className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100">Kullanıcı</th>
                  <th className="table-header bg-gray-50 dark:bg-gray-800 dark:text-gray-100">Tarih</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-cell text-center text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 py-8">
                      {movementsLoading ? 'Yükleniyor...' : 'Henüz hareket kaydı bulunmuyor'}
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-100">
                      <td className="table-cell">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {movement.stok.malzemeAdi}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">
                            {movement.stok.malzemeKodu}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          movement.islemTipi === 'ekle' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {movement.islemTipi === 'ekle' ? 'Ekleme' : 'Çıkarma'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`text-sm font-medium ${
                          movement.islemTipi === 'ekle' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.islemTipi === 'ekle' ? '+' : '-'}{movement.miktar}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {movement.aciklama || '-'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {movement.user.ad} {movement.user.soyad}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-gray-500">
                          {movement.createdAt ? formatDate(movement.createdAt) : '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <StokFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialData={editMode ? selectedStok : undefined}
        isEdit={editMode}
        loading={formLoading}
      />
      <StokMiktarModal
        open={miktarModalOpen}
        onClose={handleCloseMiktarModal}
        onSubmit={handleMiktarFormSubmit}
        isEkle={miktarModalEkle}
        stokAdi={miktarModalStok?.malzemeAdi}
        birim={miktarModalStok?.birim}
        loading={miktarModalLoading}
      />

      {/* Silme Onay Modalı */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Stok Silme Onayı
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  <strong>{stokToDelete?.malzemeAdi}</strong> ({stokToDelete?.malzemeKodu}) stoğunu 
                  <span className="text-red-600 font-semibold"> kalıcı olarak silmek</span> istediğinizden emin misiniz?
                </p>
                <p className="text-xs text-red-500 mt-2">
                  ⚠️ Bu işlem geri alınamaz ve tüm veriler kalıcı olarak silinecektir.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  İptal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteLoadingId === stokToDelete?._id}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoadingId === stokToDelete?._id ? 'Siliniyor...' : 'Kalıcı Olarak Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StokYonetimi; 