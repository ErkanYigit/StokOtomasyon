import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { stokAPI, orderAPI } from '../services/api';
import { 
  CubeIcon, 
  ExclamationTriangleIcon, 
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import BugunYapilacaklarCard from '../components/BugunYapilacaklarCard';

interface DashboardStats {
  toplamStokSayisi: number;
  kritikStokSayisi: number;
  tukenmisStokSayisi: number;
  toplamDeger: number;
  kategoriDagilimi: Array<{ _id: string; sayi: number }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyOrderCount, setMonthlyOrderCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await stokAPI.getStatistics();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchMonthlyOrderCount = async () => {
      try {
        const count = await orderAPI.getMonthlyCount();
        setMonthlyOrderCount(count);
      } catch (error) {
        setMonthlyOrderCount(null);
      }
    };
    fetchMonthlyOrderCount();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
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

  const menuItems = [
    {
      title: 'Stok Yönetimi',
      description: 'Malzeme giriş/çıkış işlemleri',
      icon: CubeIcon,
      href: '/stoklar',
      color: 'bg-blue-500',
      roles: ['admin', 'depo']
    },
    {
      title: 'Sipariş Yönetimi',
      description: 'Müşteri siparişleri takibi',
      icon: ClipboardDocumentListIcon,
      href: '/siparisler',
      color: 'bg-green-500',
      roles: ['admin', 'satis']
    },
    {
      title: 'Üretim Takibi',
      description: 'Üretim süreçleri izleme',
      icon: CogIcon,
      href: '/uretim',
      color: 'bg-purple-500',
      roles: ['admin', 'uretim']
    },
    {
      title: 'İşçi Yönetimi',
      description: 'Personel bilgileri ve görevler',
      icon: UserGroupIcon,
      href: '/isciler',
      color: 'bg-orange-500',
      roles: ['admin']
    }
  ];

  // Menüleri ve hızlı erişim kartlarını role göre filtreleme kaldırıldı
  const userMenuItems = menuItems;
  const quickAccessItems = menuItems;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Hoş geldiniz, {user?.ad} {user?.soyad}
              </h1>
              {/* Kullanıcı rolü gösterimi kaldırıldı */}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-300">
                Son giriş: {new Date(user?.sonGiris || '').toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* İstatistik Kartları */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CubeIcon className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Toplam Stok</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stats.toplamStokSayisi}
                  </p>
                </div>
              </div>
            </div>

            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Kritik Stok</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stats.kritikStokSayisi + stats.tukenmisStokSayisi}
                  </p>
                </div>
              </div>
            </div>

            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Aylık Sipariş</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {monthlyOrderCount !== null ? monthlyOrderCount : '-'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Kategori Dağılımı */}
        {stats?.kategoriDagilimi && (
          <div className="card mb-8 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Stok Kategori Dağılımı</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.kategoriDagilimi.map((kategori) => (
                <div key={kategori._id} className="text-center">
                  <div className="text-2xl font-bold text-primary-gold">
                    {kategori.sayi}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {getKategoriLabel(kategori._id)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hızlı Erişim Menüleri */}
        <h3 className="text-lg font-medium text-gray-900 mb-6">Hızlı Erişim</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessItems.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="group relative bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-gold hover:shadow-medium transition-all duration-200"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${item.color} p-3 rounded-lg`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-gold">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bugün Yapılacaklar Kartı */}
        <div className="card mt-8 dark:bg-gray-800 dark:border-gray-700">
          <BugunYapilacaklarCard />
        </div>

        {/* Son Aktiviteler */}
        <div className="card mt-8 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Son Aktiviteler</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  Sisteme başarıyla giriş yaptınız
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {new Date().toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 