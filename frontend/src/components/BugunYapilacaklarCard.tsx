import React, { useEffect, useState } from 'react';
import { raporlarAPI } from '../services/api';
import { CalendarDaysIcon, ExclamationTriangleIcon, TruckIcon, WrenchScrewdriverIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const icons = {
  kritik: '⚠️',
  siparis: '📦',
  uretim: '🔧',
  isciler: '👷',
};

const BugunYapilacaklarCard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    raporlarAPI.getBugunRaporu()
      .then(setData)
      .catch(() => setError('Veriler alınamadı'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-gray-400">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!data) {
    return null; // Should not happen if loading and error are handled
  }

  const { kritikStoklar, bugunTeslimSiparisler, uretimdekiIsler, bugunkuGorevliIsciler } = data;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 w-full max-w-7xl mb-6 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
        <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary-gold" />
        Bugün Yapılacaklar
      </h2>
      <div className="space-y-2">
        {/* Kritik Stoklar */}
        {kritikStoklar.length > 0 && (
          <div>
            <div className="flex items-center text-orange-600 dark:text-yellow-400 font-medium">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              Kritik Stoklar
            </div>
            <ul className="ml-6 list-disc text-sm text-gray-700 dark:text-gray-200">
              {kritikStoklar.map((s: any, i: number) => (
                <li key={i}>{s.ad} stoğu kritik seviyede! ({s.adet} adet kaldı)</li>
              ))}
            </ul>
          </div>
        )}
        {/* Bugün Teslim Siparişler */}
        <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
          <TruckIcon className="h-4 w-4 mr-1" />
          Bugün Teslim Siparişler
        </div>
        <ul className="ml-6 list-disc text-sm text-gray-700 dark:text-gray-200">
          {bugunTeslimSiparisler.length > 0 ? (
            bugunTeslimSiparisler.map((s: any, i: number) => (
              <li key={i}>{s.musteri} ({s.urun})</li>
            ))
          ) : (
            <li>Bugün teslim yok</li>
          )}
        </ul>
        {/* Üretimdeki İşler */}
        <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium">
          <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
          Üretimdeki İşler
        </div>
        <ul className="ml-6 list-disc text-sm text-gray-700 dark:text-gray-200">
          {uretimdekiIsler.length > 0 ? (
            uretimdekiIsler.map((u: any, i: number) => (
              <li key={i}>{u.musteri} şu an {u.asama} aşamasında</li>
            ))
          ) : (
            <li>Üretimde iş yok</li>
          )}
        </ul>
        {/* Bugünkü Görevli İşçiler */}
        <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
          <UserGroupIcon className="h-4 w-4 mr-1" />
          Bugünkü Görevli İşçiler
        </div>
        <ul className="ml-6 list-disc text-sm text-gray-700 dark:text-gray-200">
          {bugunkuGorevliIsciler.length > 0 ? (
            bugunkuGorevliIsciler.map((i: any, idx: number) => (
              <li key={idx}>{i.ad} → {i.gorev}</li>
            ))
          ) : (
            <li>Bugün görevli işçi yok</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default BugunYapilacaklarCard; 