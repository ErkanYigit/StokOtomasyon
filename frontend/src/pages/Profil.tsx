import React from 'react';
import { useAuth } from '../context/AuthContext';

const defaultAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111827&color=fff&size=128&rounded=true`;

const icons: Record<string, string> = {
  "E-posta": "✉️",
  "T.C. Kimlik No": "🆔",
  "SGK No": "💳",
  "Telefon": "📞",
  "Adres": "🏠",
  "Departman": "🏢",
  "Ustalık Seviyesi": "🎓",
  "İşe Giriş Tarihi": "📅",
  "Kayıt Tarihi": "🗓️",
  "Son Giriş": "⏰",
  "Durum": "🔖"
};

const InfoRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
    <span className="text-lg w-6 text-center">{icons[label] || '•'}</span>
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{value || '-'}</span>
    </div>
  </div>
);

const Profil: React.FC = () => {
  const { user } = useAuth();
  const userAny = user as any;
  if (!user) return <div className="p-8 text-gray-900 dark:text-gray-100">Kullanıcı bilgisi bulunamadı.</div>;
  const fullName = `${user.ad} ${user.soyad}`;
  const avatarUrl = defaultAvatar(fullName);
  const email = user.email || '-';
  const tckn = userAny.tckn || userAny.tcKimlik || '-';
  const sgkNo = userAny.sgkNo || '-';
  const telefon = userAny.telefon || userAny.tel || '-';
  const adres = userAny.adres || '-';
  const iseGiris = userAny.iseGirisTarihi || userAny.iseGiris || userAny.girisTarihi ? new Date(userAny.iseGirisTarihi || userAny.iseGiris || userAny.girisTarihi).toLocaleDateString('tr-TR') : '-';
  const kayitTarihi = userAny.createdAt ? new Date(userAny.createdAt).toLocaleDateString('tr-TR') : '-';
  const lastLogin = userAny.sonGiris ? new Date(userAny.sonGiris).toLocaleString('tr-TR') : '-';
  const departman = userAny.departman || '-';
  const ustalik = userAny.ustalikSeviyesi || userAny.ustalik || '-';
  const durum = userAny.isAktif !== undefined ? (userAny.isAktif === false ? 'Pasif' : 'Aktif') : (userAny.aktif === false ? 'Pasif' : 'Aktif');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-8">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center relative overflow-hidden">
        {/* Banner */}
        <div className="w-full h-32 bg-gradient-to-r from-yellow-300 via-primary-gold to-yellow-100" />
        {/* Avatar overlap */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2">
          <img src={avatarUrl} alt="avatar" className="w-28 h-28 rounded-full border-4 border-white shadow-lg transition-transform hover:scale-105" />
        </div>
        <div className="mt-20 mb-2 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{fullName}</h2>
          {/* <div className="text-sm text-gray-500 mb-2">{role}</div> */}
        </div>
        {/* Bilgi kutusu */}
        <div className="w-full px-6 pb-8">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="E-posta" value={email} />
            <InfoRow label="T.C. Kimlik No" value={tckn} />
            <InfoRow label="SGK No" value={sgkNo} />
            <InfoRow label="Telefon" value={telefon} />
            <InfoRow label="Adres" value={adres} />
            <InfoRow label="Departman" value={departman} />
            <InfoRow label="Ustalık Seviyesi" value={ustalik} />
            <InfoRow label="İşe Giriş Tarihi" value={iseGiris} />
            <InfoRow label="Kayıt Tarihi" value={kayitTarihi} />
            <InfoRow label="Son Giriş" value={lastLogin} />
            <InfoRow label="Durum" value={durum} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil; 